import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { flushPromises } from '@vue/test-utils';
import type { PathResponse } from '../generated/types';

const hidden = new Map<string, boolean>();

vi.mock('../lib/db', () => ({
  isPathHidden: vi.fn((pathId: string) =>
    Promise.resolve(hidden.get(pathId) ?? false),
  ),
  setPathHidden: vi.fn((pathId: string, value: boolean) => {
    hidden.set(pathId, value);
    return Promise.resolve();
  }),
  getPathOrder: vi.fn().mockReturnValue([]),
  setPathOrder: vi.fn(),
}));

import { usePathVisibility } from '../composables/usePathVisibility';

const path: PathResponse = {
  path_id: 'p1',
  uuid: '11111111-1111-1111-1111-111111111111',
  owner_user_id: 'u1',
  title: 'My Path',
  description: null,
  color: '#3880ff',
  is_public: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('usePathVisibility — shared visibility state', () => {
  beforeEach(() => {
    hidden.clear();
    // Reset the module-level shared ref between tests via a throwaway instance.
    usePathVisibility(ref([])).hiddenByPath.value = {};
  });

  it('reflects a toggle made through one instance (Settings) in another already-mounted instance (the Week/Paths view)', async () => {
    const weekView = usePathVisibility(ref<PathResponse[]>([path]));
    const settings = usePathVisibility(ref<PathResponse[]>([path]));
    await flushPromises();

    expect(weekView.visiblePaths.value.map((p) => p.path_id)).toEqual(['p1']);

    await settings.toggleVisibility('p1');
    await flushPromises();

    // Before this fix, hiddenByPath was a per-call ref: toggling in the
    // Settings instance never touched the Week view's own copy, so a path
    // hidden in Settings kept showing in the Week/Paths view (and vice
    // versa) until that page happened to remount.
    expect(weekView.hiddenByPath.value.p1).toBe(true);
    expect(weekView.visiblePaths.value.map((p) => p.path_id)).toEqual([]);
  });
});
