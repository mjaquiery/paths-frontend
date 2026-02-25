import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent } from 'vue';

import { usePaths } from '../composables/usePaths';
import { useEntries, useEntryContent } from '../composables/useEntries';
import { useMultiPathEntries } from '../composables/useMultiPathEntries';

vi.mock('../lib/customFetch', () => ({
  customFetch: vi.fn(),
}));

// Mock Dexie db used by useMultiPathEntries
vi.mock('../lib/db', () => ({
  db: {
    entryContent: {
      get: vi.fn().mockResolvedValue(undefined),
      put: vi.fn().mockResolvedValue(undefined),
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

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('usePaths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(customFetch).mockResolvedValue({
      data: [],
      status: 200,
      headers: new Headers(),
    });
  });

  it('fetches paths from the API', async () => {
    const queryClient = createQueryClient();

    const TestComponent = defineComponent({
      setup() {
        usePaths();
        return {};
      },
      template: '<div></div>',
    });

    mount(TestComponent, {
      global: { plugins: [[VueQueryPlugin, { queryClient }]] },
    });
    await flushPromises();

    expect(vi.mocked(customFetch)).toHaveBeenCalledWith(
      '/v1/paths',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});

describe('useEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(customFetch).mockResolvedValue({
      data: [],
      status: 200,
      headers: new Headers(),
    });
  });

  it('does not call API when pathId is empty', () => {
    const pathId = ref('');
    const queryClient = createQueryClient();

    const TestComponent = defineComponent({
      setup() {
        useEntries(pathId);
        return {};
      },
      template: '<div></div>',
    });

    mount(TestComponent, {
      global: { plugins: [[VueQueryPlugin, { queryClient }]] },
    });

    expect(vi.mocked(customFetch)).not.toHaveBeenCalled();
  });

  it('fetches entries when pathId is set', async () => {
    vi.mocked(customFetch).mockResolvedValue({
      data: [{ id: 'e1', path_id: 'p1', day: '2024-01-01', edit_id: 'edit-1' }],
      status: 200,
      headers: new Headers(),
    });

    const pathId = ref('p1');
    const queryClient = createQueryClient();

    const TestComponent = defineComponent({
      setup() {
        useEntries(pathId);
        return {};
      },
      template: '<div></div>',
    });

    mount(TestComponent, {
      global: { plugins: [[VueQueryPlugin, { queryClient }]] },
    });
    await flushPromises();

    expect(vi.mocked(customFetch)).toHaveBeenCalledWith(
      '/v1/paths/p1/entries',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});

describe('useEntryContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(customFetch).mockResolvedValue({
      data: {
        id: 'e1',
        path_id: 'p1',
        day: '2024-01-01',
        edit_id: 'edit-1',
        content: 'hello',
      },
      status: 200,
      headers: new Headers(),
    });
  });

  it('does not call API when editId is empty', () => {
    const pathId = ref('p1');
    const entryId = ref('e1');
    const editId = ref('');
    const queryClient = createQueryClient();

    const TestComponent = defineComponent({
      setup() {
        useEntryContent(pathId, entryId, editId);
        return {};
      },
      template: '<div></div>',
    });

    mount(TestComponent, {
      global: { plugins: [[VueQueryPlugin, { queryClient }]] },
    });

    expect(vi.mocked(customFetch)).not.toHaveBeenCalled();
  });

  it('fetches content when all ids are set', async () => {
    const pathId = ref('p1');
    const entryId = ref('e1');
    const editId = ref('edit-1');
    const queryClient = createQueryClient();

    const TestComponent = defineComponent({
      setup() {
        useEntryContent(pathId, entryId, editId);
        return {};
      },
      template: '<div></div>',
    });

    mount(TestComponent, {
      global: { plugins: [[VueQueryPlugin, { queryClient }]] },
    });
    await flushPromises();

    expect(vi.mocked(customFetch)).toHaveBeenCalledWith(
      '/v1/paths/p1/entries/e1',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('re-fetches when editId changes (smart refetch)', async () => {
    const pathId = ref('p1');
    const entryId = ref('e1');
    const editId = ref('edit-1');
    const queryClient = createQueryClient();

    const TestComponent = defineComponent({
      setup() {
        useEntryContent(pathId, entryId, editId);
        return {};
      },
      template: '<div></div>',
    });

    mount(TestComponent, {
      global: { plugins: [[VueQueryPlugin, { queryClient }]] },
    });
    await flushPromises();

    const callCount = vi.mocked(customFetch).mock.calls.length;

    // Changing the editId should trigger a new fetch since it's part of the query key
    editId.value = 'edit-2';
    await nextTick();
    await flushPromises();

    expect(vi.mocked(customFetch).mock.calls.length).toBeGreaterThan(callCount);
  });
});

describe('useMultiPathEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(customFetch).mockResolvedValue({
      data: [],
      status: 200,
      headers: new Headers(),
    });
  });

  it('returns an empty array when no pathIds are provided', async () => {
    const pathIds = ref<string[]>([]);
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
    await flushPromises();

    expect(result?.value).toEqual([]);
  });

  it('fetches entries for each provided pathId', async () => {
    vi.mocked(customFetch).mockImplementation((url: string) => {
      // Match specific content fetch: /v1/paths/{id}/entries/{entryId} (no trailing segment)
      const contentMatch = url.match(/\/v1\/paths\/([^/]+)\/entries\/([^/]+)$/);
      if (
        contentMatch &&
        !url.endsWith('/entries/p1') &&
        !url.endsWith('/entries/p2')
      ) {
        const [, pathId, entryId] = contentMatch;
        return Promise.resolve({
          data: {
            id: entryId,
            path_id: pathId,
            day: '2024-01-01',
            edit_id: 'ed1',
            content: `Content for ${entryId}`,
          },
          status: 200,
          headers: new Headers(),
        });
      }
      if (url.includes('/v1/paths/p1/entries')) {
        return Promise.resolve({
          data: [
            { id: 'e1', path_id: 'p1', day: '2024-01-01', edit_id: 'ed1' },
          ],
          status: 200,
          headers: new Headers(),
        });
      }
      if (url.includes('/v1/paths/p2/entries')) {
        return Promise.resolve({
          data: [
            { id: 'e2', path_id: 'p2', day: '2024-01-02', edit_id: 'ed2' },
          ],
          status: 200,
          headers: new Headers(),
        });
      }
      return Promise.resolve({ data: [], status: 200, headers: new Headers() });
    });

    const pathIds = ref(['p1', 'p2']);
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
    // First flush: TanStack Query resolves entry lists
    await flushPromises();
    // Second flush: async watch resolves content fetches
    await flushPromises();

    expect(result?.value).toHaveLength(2);
    expect(result?.value[0]?.pathId).toBe('p1');
    expect(result?.value[0]?.entries).toHaveLength(1);
    expect(result?.value[1]?.pathId).toBe('p2');
    expect(result?.value[1]?.entries).toHaveLength(1);
  });

  it('returns empty entries array when a query fails', async () => {
    vi.mocked(customFetch).mockRejectedValue(new Error('Network error'));

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

    expect(result?.value[0]?.entries).toEqual([]);
  });

  it('keeps each pathId associated with its own entries when pathIds are reordered', async () => {
    vi.mocked(customFetch).mockImplementation((url: string) => {
      // Content fetch: /v1/paths/{pathId}/entries/{entryId}
      const contentMatch = url.match(/\/v1\/paths\/([^/]+)\/entries\/([^/]+)$/);
      if (contentMatch && !url.endsWith('/entries/p1') && !url.endsWith('/entries/p2')) {
        const [, pathId, entryId] = contentMatch;
        return Promise.resolve({
          data: {
            id: entryId,
            path_id: pathId,
            day: '2024-06-01',
            edit_id: 'ed1',
            content: `Content for ${pathId}`,
          },
          status: 200,
          headers: new Headers(),
        });
      }
      if (url.includes('/v1/paths/p1/entries')) {
        return Promise.resolve({
          data: [{ id: 'e1', path_id: 'p1', day: '2024-06-01', edit_id: 'ed1' }],
          status: 200,
          headers: new Headers(),
        });
      }
      if (url.includes('/v1/paths/p2/entries')) {
        return Promise.resolve({
          data: [{ id: 'e2', path_id: 'p2', day: '2024-06-01', edit_id: 'ed1' }],
          status: 200,
          headers: new Headers(),
        });
      }
      return Promise.resolve({ data: [], status: 200, headers: new Headers() });
    });

    const pathIds = ref(['p1', 'p2']);
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
    await flushPromises();
    await flushPromises();

    // Verify baseline before reorder
    expect(result?.value[0]?.pathId).toBe('p1');
    expect(result?.value[0]?.entries[0]?.path_id).toBe('p1');
    expect(result?.value[1]?.pathId).toBe('p2');
    expect(result?.value[1]?.entries[0]?.path_id).toBe('p2');

    // Reorder: promote p2 to first position
    pathIds.value = ['p2', 'p1'];
    await nextTick();

    // Immediately after reorder (before async queries settle), each pathId must still map to its own entries
    let p2Slot = result?.value.find((pe) => pe.pathId === 'p2');
    let p1Slot = result?.value.find((pe) => pe.pathId === 'p1');

    expect(p2Slot?.entries[0]?.path_id).toBe('p2');
    expect(p1Slot?.entries[0]?.path_id).toBe('p1');

    // After async queries settle, the association must still be correct
    await flushPromises();

    p2Slot = result?.value.find((pe) => pe.pathId === 'p2');
    p1Slot = result?.value.find((pe) => pe.pathId === 'p1');

    expect(p2Slot?.entries[0]?.path_id).toBe('p2');
    expect(p1Slot?.entries[0]?.path_id).toBe('p1');
  });
});
