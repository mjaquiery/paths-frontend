import type { Persister } from '@tanstack/query-persist-client-core';
import { db } from './db';

const CACHE_KEY = 'tanstack-query-cache';

export const dexiePersister: Persister = {
  async persistClient(persistedClient) {
    try {
      await db.queryCache.put({
        key: CACHE_KEY,
        value: JSON.stringify(persistedClient),
      });
    } catch {
      // IndexedDB may be unavailable; query cache will not be persisted.
    }
  },
  async restoreClient() {
    try {
      const entry = await db.queryCache.get(CACHE_KEY);
      if (!entry) return undefined;
      return JSON.parse(entry.value);
    } catch {
      return undefined;
    }
  },
  async removeClient() {
    try {
      await db.queryCache.delete(CACHE_KEY);
    } catch {
      // IndexedDB may be unavailable; nothing to remove.
    }
  },
};
