import Dexie, { type EntityTable } from 'dexie';

export interface PathPreference {
  pathId: string;
  hidden: boolean;
  deleted?: boolean;
}

export interface QueryCacheEntry {
  key: string;
  value: string;
}

export interface EntryContentCache {
  cache_key: string;
  id: string;
  path_id: string;
  day: string;
  edit_id: string;
  content: string;
  image_filenames?: string[];
}

export interface EntryImageCache {
  id: string;
  entry_id: string;
  filename: string;
  status: string;
  strip_metadata: boolean;
  content_type: string | null;
  byte_size: number | null;
}

const db = new Dexie('pathsFrontend') as Dexie & {
  pathPreferences: EntityTable<PathPreference, 'pathId'>;
  queryCache: EntityTable<QueryCacheEntry, 'key'>;
  entryContent: EntityTable<EntryContentCache, 'cache_key'>;
  entryImages: EntityTable<EntryImageCache, 'id'>;
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

export async function isPathHidden(pathId: string) {
  const pref = await db.pathPreferences.get(pathId);
  return pref?.hidden ?? false;
}

export async function setPathHidden(pathId: string, hidden: boolean) {
  await db.pathPreferences.put({ pathId, hidden });
}

export async function isPathDeleted(pathId: string) {
  const pref = await db.pathPreferences.get(pathId);
  return pref?.deleted ?? false;
}

export async function setPathDeleted(pathId: string, deleted: boolean) {
  const existing = await db.pathPreferences.get(pathId);
  await db.pathPreferences.put({
    pathId,
    hidden: existing?.hidden ?? false,
    deleted,
  });
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
