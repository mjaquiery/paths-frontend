/**
 * useMultiPathEntries used to poll every subscribed path's full entry list on its own
 * 25s interval. It now polls one shared GET /v1/entries/versions map instead, and only
 * invalidates (and thus refetches) a path's entry list when that path's version map
 * actually changed. These tests pin down the diff behavior directly, without waiting on
 * the real interval — driven via an explicit refetch of the versions query, the same way
 * useMultiPathEntries.window.test.ts drives the list query directly.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, type Ref } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent } from 'vue';

vi.mock('../lib/customFetch', () => ({
  customFetch: vi.fn(),
}));

vi.mock('../lib/db', () => ({
  db: {
    entryContent: { get: vi.fn().mockResolvedValue(undefined), put: vi.fn() },
    entryImages: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
          delete: vi.fn(),
        }),
      }),
      bulkPut: vi.fn(),
    },
    pathPreferences: {},
    queryCache: {},
  },
  isPathHidden: vi.fn().mockResolvedValue(false),
  setPathHidden: vi.fn().mockResolvedValue(undefined),
  getPathOrder: vi.fn().mockReturnValue([]),
  setPathOrder: vi.fn(),
}));

import { customFetch } from '../lib/customFetch';
import { useMultiPathEntries } from '../composables/useMultiPathEntries';

function mount1(pathIds: Ref<string[]>) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  let result: ReturnType<typeof useMultiPathEntries> | undefined;
  const TestComponent = defineComponent({
    setup() {
      result = useMultiPathEntries(pathIds);
      return {};
    },
    template: '<div></div>',
  });
  mount(TestComponent, {
    global: { plugins: [[VueQueryPlugin, { queryClient }]] },
  });
  return { result: () => result!, queryClient };
}

describe('useMultiPathEntries – versions-driven polling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refetches only a path whose versions map changed', async () => {
    let editId = 1;
    const listCallCounts = { p1: 0, p2: 0 };

    vi.mocked(customFetch).mockImplementation((url: string) => {
      if (url.startsWith('/v1/entries/versions')) {
        return Promise.resolve({
          data: {
            p1: { e1: editId },
            p2: { e2: 1 },
          },
          status: 200,
          headers: new Headers(),
        });
      }
      if (url === '/v1/paths/p1/entries') {
        listCallCounts.p1++;
        return Promise.resolve({
          data: [
            { id: 'e1', path_id: 'p1', day: '2024-01-01', edit_id: editId },
          ],
          status: 200,
          headers: new Headers(),
        });
      }
      if (url === '/v1/paths/p2/entries') {
        listCallCounts.p2++;
        return Promise.resolve({
          data: [{ id: 'e2', path_id: 'p2', day: '2024-01-01', edit_id: 1 }],
          status: 200,
          headers: new Headers(),
        });
      }
      return Promise.resolve({ data: [], status: 200, headers: new Headers() });
    });

    const pathIds = ref(['p1', 'p2']);
    const { queryClient } = mount1(pathIds);
    await flushPromises();
    await flushPromises();

    expect(listCallCounts.p1).toBe(1);
    expect(listCallCounts.p2).toBe(1);

    // Nothing changed — a repeat versions poll must not invalidate either list.
    await queryClient.refetchQueries({
      queryKey: ['v1', 'entries', 'versions'],
    });
    await flushPromises();
    await flushPromises();

    expect(listCallCounts.p1).toBe(1);
    expect(listCallCounts.p2).toBe(1);

    // p1's entry edit_id bumps — only p1's list should be invalidated and refetched.
    editId = 2;
    await queryClient.refetchQueries({
      queryKey: ['v1', 'entries', 'versions'],
    });
    await flushPromises();
    await flushPromises();

    expect(listCallCounts.p1).toBe(2);
    expect(listCallCounts.p2).toBe(1);
  });
});
