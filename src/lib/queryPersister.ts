import type { Persister } from '@tanstack/query-persist-client-core';
import { db } from './db';

const CACHE_KEY = 'tanstack-query-cache';

export const dexiePersister: Persister = {
  async persistClient(persistedClient) {
    await db.queryCache.put({ key: CACHE_KEY, value: JSON.stringify(persistedClient) });
  },
  async restoreClient() {
    const entry = await db.queryCache.get(CACHE_KEY);
    if (!entry) return undefined;
    return JSON.parse(entry.value);
  },
  async removeClient() {
    await db.queryCache.delete(CACHE_KEY);
  },
};
