import Dexie, { type EntityTable } from 'dexie';

export interface PathPreference {
  pathId: string;
  hidden: boolean;
}

export interface QueryCacheEntry {
  key: string;
  value: string;
}

const db = new Dexie('pathsFrontend') as Dexie & {
  pathPreferences: EntityTable<PathPreference, 'pathId'>;
  queryCache: EntityTable<QueryCacheEntry, 'key'>;
};

export { db };

db.version(1).stores({
  pathPreferences: '&pathId,hidden',
});

db.version(2).stores({
  pathPreferences: '&pathId,hidden',
  queryCache: '&key',
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
