/**
 * Tests that `isPathHidden` and `setPathHidden` in db.ts degrade gracefully
 * when Dexie (IndexedDB) throws instead of crashing the caller.
 *
 * These tests live in their own file so that the vi.spyOn calls target the
 * real functions without interference from a module-level vi.mock.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { db, isPathHidden, setPathHidden } from '../lib/db';

describe('isPathHidden – graceful Dexie failures', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when pathPreferences.get throws', async () => {
    vi.spyOn(db.pathPreferences, 'get').mockRejectedValue(
      new Error('IndexedDB unavailable'),
    );
    await expect(isPathHidden('test-path')).resolves.toBe(false);
  });

  it('returns the stored hidden value when pathPreferences.get succeeds', async () => {
    vi.spyOn(db.pathPreferences, 'get').mockResolvedValue({
      pathId: 'test-path',
      hidden: true,
    });
    await expect(isPathHidden('test-path')).resolves.toBe(true);
  });

  it('returns false when the entry is not found', async () => {
    vi.spyOn(db.pathPreferences, 'get').mockResolvedValue(undefined);
    await expect(isPathHidden('missing-path')).resolves.toBe(false);
  });
});

describe('setPathHidden – graceful Dexie failures', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not throw when pathPreferences.put throws', async () => {
    vi.spyOn(db.pathPreferences, 'put').mockRejectedValue(
      new Error('IndexedDB unavailable'),
    );
    await expect(setPathHidden('test-path', true)).resolves.toBeUndefined();
  });
});
