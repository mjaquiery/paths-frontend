import Dexie, { type EntityTable } from 'dexie';

export interface PathPreference {
  pathId: string;
  hidden: boolean;
}

export interface QueryCacheEntry {
  key: string;
  value: string;
}

export interface EntryContentCache {
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
  entryContent: EntityTable<EntryContentCache, 'id'>;
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

export async function isPathHidden(pathId: string) {
  const pref = await db.pathPreferences.get(pathId);
  return pref?.hidden ?? false;
}

export async function setPathHidden(pathId: string, hidden: boolean) {
  await db.pathPreferences.put({ pathId, hidden });
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
