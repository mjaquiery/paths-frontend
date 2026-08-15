/**
 * useMultiPathEntries used to fetch every entry's content for every path, all at once,
 * with no bound — opening a path with hundreds of entries meant hundreds of concurrent
 * requests plus the render churn of merging them all in, which is what made the "path
 * view" freeze for tens of seconds. These tests pin down the fix: content-fetching is
 * capped to a recency window that only grows, list-loading state ignores background
 * polling, and an entry's previous content stays visible while a new edit resolves.
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
        equals: vi
          .fn()
          .mockReturnValue({
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
import {
  useMultiPathEntries,
  DEFAULT_CONTENT_WINDOW,
} from '../composables/useMultiPathEntries';

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function isoDaysAgo(n: number): string {
  const d = new Date('2024-06-01T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function mount1(pathIds: Ref<string[]>) {
  const queryClient = createQueryClient();
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

describe('useMultiPathEntries – content window', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('only fetches content for the most recent entries, up to the default window', async () => {
    const entryIds = Array.from({ length: 100 }, (_, i) => `e${i}`);
    const getEntryCalls = new Set<string>();

    vi.mocked(customFetch).mockImplementation((url: string) => {
      if (url === '/v1/paths/p1/entries') {
        return Promise.resolve({
          data: entryIds.map((id, i) => ({
            id,
            path_id: 'p1',
            day: isoDaysAgo(i), // e0 is most recent, e99 is oldest
            edit_id: 1,
          })),
          status: 200,
          headers: new Headers(),
        });
      }
      const match = url.match(/\/v1\/paths\/p1\/entries\/(e\d+)$/);
      if (match) {
        getEntryCalls.add(match[1]!);
        return Promise.resolve({
          data: {
            id: match[1],
            path_id: 'p1',
            day: '2024-01-01',
            edit_id: 1,
            content: 'x',
          },
          status: 200,
          headers: new Headers(),
        });
      }
      return Promise.resolve({ data: [], status: 200, headers: new Headers() });
    });

    const pathIds = ref(['p1']);
    const { result } = mount1(pathIds);
    await flushPromises();
    await flushPromises();

    expect(getEntryCalls.size).toBe(DEFAULT_CONTENT_WINDOW);
    // The most recent entries (e0..e29) are the ones fetched.
    for (let i = 0; i < DEFAULT_CONTENT_WINDOW; i++) {
      expect(getEntryCalls.has(`e${i}`)).toBe(true);
    }
    expect(getEntryCalls.has('e30')).toBe(false);

    const entries = result().pathEntries.value[0]!.entries;
    expect(entries).toHaveLength(100); // full list still returned, for day-membership use
    const e0 = entries.find((e) => e.id === 'e0')!;
    const e30 = entries.find((e) => e.id === 'e30')!;
    expect(e0.inWindow).toBe(true);
    expect(e0.content).toBe('x');
    expect(e30.inWindow).toBe(false);
    expect(e30.content).toBeUndefined();
    expect(result().pathEntries.value[0]!.hasMore).toBe(true);
    expect(result().pathEntries.value[0]!.remainingCount).toBe(70);

    // loadMore grows the window and fetches the next batch.
    result().loadMore('p1');
    await flushPromises();
    await flushPromises();

    expect(getEntryCalls.size).toBe(DEFAULT_CONTENT_WINDOW * 2);
    expect(getEntryCalls.has('e59')).toBe(true);
    expect(getEntryCalls.has('e60')).toBe(false);

    // ensureDayLoaded pulls in one specific far-outside-the-window entry on demand.
    result().ensureDayLoaded(isoDaysAgo(90));
    await flushPromises();
    await flushPromises();

    expect(getEntryCalls.has('e90')).toBe(true);
    const e90 = result().pathEntries.value[0]!.entries.find(
      (e) => e.id === 'e90',
    )!;
    expect(e90.inWindow).toBe(true);
    expect(e90.content).toBe('x');
  });

  it('never re-shows an already-loaded entry as unloaded after the list refreshes', async () => {
    // A background poll can reorder "most recent" (e.g. a new entry syncs in) — an
    // entry already shown must not silently drop out of the window as a result.
    let entryIds = Array.from({ length: 5 }, (_, i) => `e${i}`);

    vi.mocked(customFetch).mockImplementation((url: string) => {
      if (url === '/v1/paths/p1/entries') {
        return Promise.resolve({
          data: entryIds.map((id, i) => ({
            id,
            path_id: 'p1',
            day: isoDaysAgo(i),
            edit_id: 1,
          })),
          status: 200,
          headers: new Headers(),
        });
      }
      const match = url.match(/\/v1\/paths\/p1\/entries\/(e\w+)$/);
      if (match) {
        return Promise.resolve({
          data: {
            id: match[1],
            path_id: 'p1',
            day: '2024-01-01',
            edit_id: 1,
            content: 'x',
          },
          status: 200,
          headers: new Headers(),
        });
      }
      return Promise.resolve({ data: [], status: 200, headers: new Headers() });
    });

    const pathIds = ref(['p1']);
    const { result, queryClient } = mount1(pathIds);
    await flushPromises();
    await flushPromises();

    expect(
      result().pathEntries.value[0]!.entries.every((e) => e.inWindow),
    ).toBe(true);

    // A new entry syncs in as the most recent — refetch the list query directly
    // rather than waiting on the real 25s interval.
    entryIds = ['enew', ...entryIds];
    await queryClient.refetchQueries({
      queryKey: ['v1', 'paths', 'p1', 'entries'],
      exact: true,
    });
    await flushPromises();
    await flushPromises();

    const entries = result().pathEntries.value[0]!.entries;
    expect(entries).toHaveLength(6);
    // Every entry that was already in the window before the refresh still is.
    expect(entries.every((e) => e.inWindow)).toBe(true);
  });
});

describe('useMultiPathEntries – graceful background refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('isListLoading is true only on first load, not during a background refetch', async () => {
    vi.mocked(customFetch).mockImplementation((url: string) => {
      if (url === '/v1/paths/p1/entries') {
        return Promise.resolve({
          data: [{ id: 'e1', path_id: 'p1', day: '2024-01-01', edit_id: 1 }],
          status: 200,
          headers: new Headers(),
        });
      }
      return Promise.resolve({
        data: {
          id: 'e1',
          path_id: 'p1',
          day: '2024-01-01',
          edit_id: 1,
          content: 'hi',
        },
        status: 200,
        headers: new Headers(),
      });
    });

    const pathIds = ref(['p1']);
    const { result, queryClient } = mount1(pathIds);

    expect(result().pathEntries.value[0]?.isListLoading).toBe(true);

    await flushPromises();
    await flushPromises();
    expect(result().pathEntries.value[0]?.isListLoading).toBe(false);

    await queryClient.refetchQueries({
      queryKey: ['v1', 'paths', 'p1', 'entries'],
      exact: true,
    });
    // isFetching is true here, mid-refetch — isListLoading must stay false throughout.
    expect(result().pathEntries.value[0]?.isListLoading).toBe(false);
    await flushPromises();
    expect(result().pathEntries.value[0]?.isListLoading).toBe(false);
  });

  it("keeps an entry's previous content visible while a new edit_id resolves", async () => {
    let editId = 1;
    let resolveSecond: ((v: unknown) => void) | undefined;

    vi.mocked(customFetch).mockImplementation((url: string) => {
      if (url === '/v1/paths/p1/entries') {
        return Promise.resolve({
          data: [
            { id: 'e1', path_id: 'p1', day: '2024-01-01', edit_id: editId },
          ],
          status: 200,
          headers: new Headers(),
        });
      }
      if (url === '/v1/paths/p1/entries/e1') {
        if (editId === 1) {
          return Promise.resolve({
            data: {
              id: 'e1',
              path_id: 'p1',
              day: '2024-01-01',
              edit_id: 1,
              content: 'v1',
            },
            status: 200,
            headers: new Headers(),
          });
        }
        // edit_id 2: resolves only once resolveSecond() is called, so the test can
        // inspect state while this request is still in flight.
        return new Promise((resolve) => {
          resolveSecond = () =>
            resolve({
              data: {
                id: 'e1',
                path_id: 'p1',
                day: '2024-01-01',
                edit_id: 2,
                content: 'v2',
              },
              status: 200,
              headers: new Headers(),
            });
        });
      }
      return Promise.resolve({ data: [], status: 200, headers: new Headers() });
    });

    const pathIds = ref(['p1']);
    const { result, queryClient } = mount1(pathIds);
    await flushPromises();
    await flushPromises();
    expect(result().pathEntries.value[0]!.entries[0]!.content).toBe('v1');

    editId = 2;
    await queryClient.refetchQueries({
      queryKey: ['v1', 'paths', 'p1', 'entries'],
      exact: true,
    });
    await flushPromises();
    await flushPromises();
    await flushPromises();

    // The new edit_id's query is in flight (resolveSecond not yet called) — the row
    // should still show the previous content rather than reverting to "loading".
    expect(result().pathEntries.value[0]!.entries[0]!.content).toBe('v1');

    resolveSecond?.(undefined);
    await flushPromises();
    await flushPromises();

    expect(result().pathEntries.value[0]!.entries[0]!.content).toBe('v2');
  });
});
