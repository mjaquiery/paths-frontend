import { describe, it, expect, vi, beforeEach } from 'vitest';

const store = new Map<string, { url: string; etag: string; body: unknown }>();

vi.mock('../lib/db', () => ({
  db: {
    etagCache: {
      get: vi.fn((url: string) => Promise.resolve(store.get(url))),
      put: vi.fn((entry: { url: string; etag: string; body: unknown }) => {
        store.set(entry.url, entry);
        return Promise.resolve();
      }),
      clear: vi.fn(() => {
        store.clear();
        return Promise.resolve();
      }),
    },
  },
}));

import { getEtag, setEtag, clearEtags } from '../lib/etagStore';

beforeEach(() => {
  store.clear();
});

describe('etagStore', () => {
  it('returns undefined for a URL with no cached entry', async () => {
    await expect(getEtag('/v1/paths')).resolves.toBeUndefined();
  });

  it('round-trips a set etag and body through get', async () => {
    await setEtag('/v1/paths', 'W/"abc"', { title: 'hello' });

    await expect(getEtag('/v1/paths')).resolves.toEqual({
      etag: 'W/"abc"',
      body: { title: 'hello' },
    });
  });

  it('clearEtags removes all cached entries', async () => {
    await setEtag('/v1/paths', 'W/"abc"', { title: 'hello' });
    await clearEtags();

    await expect(getEtag('/v1/paths')).resolves.toBeUndefined();
  });
});

describe('etagStore – graceful Dexie failures', () => {
  it('getEtag resolves undefined when Dexie rejects', async () => {
    vi.resetModules();
    vi.doMock('../lib/db', () => ({
      db: {
        etagCache: {
          get: vi.fn().mockRejectedValue(new Error('IndexedDB unavailable')),
          put: vi.fn().mockRejectedValue(new Error('IndexedDB unavailable')),
          clear: vi.fn().mockRejectedValue(new Error('IndexedDB unavailable')),
        },
      },
    }));
    const failing = await import('../lib/etagStore');

    await expect(failing.getEtag('/v1/paths')).resolves.toBeUndefined();
    await expect(
      failing.setEtag('/v1/paths', 'W/"abc"', {}),
    ).resolves.toBeUndefined();
    await expect(failing.clearEtags()).resolves.toBeUndefined();
  });
});
