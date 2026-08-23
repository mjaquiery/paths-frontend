import Dexie, { type EntityTable } from 'dexie';

export interface PathPreference {
  pathId: string;
  hidden: boolean;
}

export interface QueryCacheEntry {
  key: string;
  value: string;
}

/** One conditional-GET cache entry: the last ETag seen for a request URL and
 *  the response body it was attached to, so a future 304 can resolve to it
 *  without re-parsing anything. See lib/etagStore.ts. */
export interface EtagCacheEntry {
  url: string;
  etag: string;
  body: unknown;
}

/** A local-only, never-synced draft of in-progress entry text/images.
 *
 * Keyed by "pathId:day" for new entries or "pathId:entryId" for edits, so there's at most
 * one draft per thing-being-edited. Purely a loss-prevention measure: no server contact, no
 * sync/conflict surface, cleared on successful submit.
 */
export interface LocalEntryDraft {
  draftKey: string;
  pathId: string;
  entryId: string | null;
  day: string;
  content: string;
  updatedAt: number;
}

const db = new Dexie('pathsFrontend') as Dexie & {
  pathPreferences: EntityTable<PathPreference, 'pathId'>;
  queryCache: EntityTable<QueryCacheEntry, 'key'>;
  localDrafts: EntityTable<LocalEntryDraft, 'draftKey'>;
  etagCache: EntityTable<EtagCacheEntry, 'url'>;
};

export { db };

db.version(1).stores({
  pathPreferences: '&pathId,hidden',
});

db.version(2).stores({
  pathPreferences: '&pathId,hidden',
  queryCache: '&key',
});

db.version(3).stores({
  pathPreferences: '&pathId,hidden',
  queryCache: '&key',
  entryContent: '&id,edit_id,path_id',
});

db.version(4).stores({
  pathPreferences: '&pathId,hidden',
  queryCache: '&key',
  entryContent: '&id,edit_id,path_id',
  entryImages: '&id,entry_id',
});

// Version 5: drop entryContent to allow primary key change from &id to &cache_key
db.version(5).stores({
  pathPreferences: '&pathId,hidden',
  queryCache: '&key',
  entryContent: null,
  entryImages: '&id,entry_id',
});

db.version(6).stores({
  pathPreferences: '&pathId,hidden',
  queryCache: '&key',
  entryContent: '&cache_key,edit_id,path_id,id',
  entryImages: '&id,entry_id',
});

// Version 7: collapse the server-data cache to one layer (TanStack Query's own
// queryCache, via lib/queryPersister.ts) — entryContent/entryImages were a second,
// independent cache with manual edit_id diffing that could silently go stale. Add
// localDrafts for client-side-only autosave (unrelated to server caching).
db.version(7).stores({
  pathPreferences: '&pathId,hidden',
  queryCache: '&key',
  entryContent: null,
  entryImages: null,
  localDrafts: '&draftKey,pathId',
});

// Version 8: add etagCache for conditional-GET support in lib/customFetch.ts —
// a separate table from queryCache since it's keyed by request URL, not by
// TanStack Query key, and needs its own clear-on-logout lifecycle.
db.version(8).stores({
  pathPreferences: '&pathId,hidden',
  queryCache: '&key',
  entryContent: null,
  entryImages: null,
  localDrafts: '&draftKey,pathId',
  etagCache: '&url',
});

export async function isPathHidden(pathId: string) {
  try {
    const pref = await db.pathPreferences.get(pathId);
    return pref?.hidden ?? false;
  } catch {
    return false;
  }
}

export async function setPathHidden(pathId: string, hidden: boolean) {
  try {
    await db.pathPreferences.put({ pathId, hidden });
  } catch {
    // IndexedDB may be unavailable; preference change is not persisted.
  }
}

const PATH_ORDER_KEY = 'pathOrder';

export function getPathOrder(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PATH_ORDER_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

export function setPathOrder(pathIds: string[]): void {
  localStorage.setItem(PATH_ORDER_KEY, JSON.stringify(pathIds));
}
