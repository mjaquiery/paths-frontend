/**
 * Tests that useMultiPathEntries continues to fetch entry content from the
 * remote API when the Dexie (IndexedDB) cache is unavailable, rather than
 * crashing or silently showing empty content.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent } from 'vue';

vi.mock('../lib/customFetch', () => ({
  customFetch: vi.fn(),
}));

vi.mock('../lib/db', () => ({
  db: {
    entryContent: {
      get: vi.fn().mockRejectedValue(new Error('IndexedDB unavailable')),
      put: vi.fn().mockRejectedValue(new Error('IndexedDB unavailable')),
    },
    entryImages: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi
            .fn()
            .mockRejectedValue(new Error('IndexedDB unavailable')),
          delete: vi.fn().mockRejectedValue(new Error('IndexedDB unavailable')),
        }),
      }),
      bulkPut: vi.fn().mockRejectedValue(new Error('IndexedDB unavailable')),
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

describe('useMultiPathEntries – Dexie unavailable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('still fetches entry content from the API when the Dexie cache throws', async () => {
    vi.mocked(customFetch).mockImplementation((url: string) => {
      if (url.match(/\/images$/)) {
        return Promise.resolve({
          data: [],
          status: 200,
          headers: new Headers(),
        });
      }
      if (url === '/v1/paths/p1/entries') {
        return Promise.resolve({
          data: [
            { id: 'e1', path_id: 'p1', day: '2024-01-01', edit_id: 'ed1' },
          ],
          status: 200,
          headers: new Headers(),
        });
      }
      if (url === '/v1/paths/p1/entries/e1') {
        return Promise.resolve({
          data: {
            id: 'e1',
            path_id: 'p1',
            day: '2024-01-01',
            edit_id: 'ed1',
            content: 'Remote content',
          },
          status: 200,
          headers: new Headers(),
        });
      }
      return Promise.resolve({ data: [], status: 200, headers: new Headers() });
    });

    const pathIds = ref(['p1']);
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

    await flushPromises();
    await flushPromises();

    // Content must be populated from the API even though Dexie is broken.
    expect(result?.value[0]?.entries[0]?.content).toBe('Remote content');
  });
});
