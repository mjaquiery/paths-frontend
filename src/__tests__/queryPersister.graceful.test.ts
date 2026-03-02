/**
 * Tests that dexiePersister in queryPersister.ts degrades gracefully when
 * Dexie (IndexedDB) throws, so TanStack Query falls back to remote-only mode
 * rather than crashing.
 *
 * The module-level vi.mock below replaces the `db` export with an object
 * whose queryCache methods all reject, which exercises the try/catch wrappers
 * inside the real dexiePersister implementation.
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('../lib/db', () => ({
  db: {
    queryCache: {
      put: vi.fn().mockRejectedValue(new Error('IndexedDB unavailable')),
      get: vi.fn().mockRejectedValue(new Error('IndexedDB unavailable')),
      delete: vi.fn().mockRejectedValue(new Error('IndexedDB unavailable')),
    },
    pathPreferences: {},
    entryContent: {},
    entryImages: {},
  },
  isPathHidden: vi.fn().mockResolvedValue(false),
  setPathHidden: vi.fn().mockResolvedValue(undefined),
  getPathOrder: vi.fn().mockReturnValue([]),
  setPathOrder: vi.fn(),
}));

import { dexiePersister } from '../lib/queryPersister';

describe('dexiePersister – graceful Dexie failures', () => {
  it('persistClient resolves without throwing when Dexie rejects', async () => {
    await expect(
      dexiePersister.persistClient({
        timestamp: 0,
        buster: '',
        clientState: { mutations: [], queries: [] },
      }),
    ).resolves.toBeUndefined();
  });

  it('restoreClient returns undefined when Dexie rejects', async () => {
    await expect(dexiePersister.restoreClient()).resolves.toBeUndefined();
  });

  it('removeClient resolves without throwing when Dexie rejects', async () => {
    await expect(dexiePersister.removeClient()).resolves.toBeUndefined();
  });
});
