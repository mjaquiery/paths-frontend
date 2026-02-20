import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';

import { usePaths } from '../composables/usePaths';
import { useEntries, useEntryContent } from '../composables/useEntries';
import type { PathResponse } from '../generated/types';

vi.mock('../generated/apiClient', () => ({
  listPathsV1PathsGet: vi.fn(),
  listEntriesV1PathIdEntriesGet: vi.fn(),
  getEntryV1PathIdEntriesEntryIdGet: vi.fn(),
}));

import { listPathsV1PathsGet, listEntriesV1PathIdEntriesGet, getEntryV1PathIdEntriesEntryIdGet } from '../generated/apiClient';

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('usePaths', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches paths from the API', async () => {
    const mockPaths: PathResponse[] = [
      { path_id: 'p1', title: 'Path 1', is_public: true, owner_id: 'u1', is_owner: true },
    ];
    vi.mocked(listPathsV1PathsGet).mockResolvedValue({
      data: mockPaths,
      status: 200,
      headers: new Headers(),
    });

    const queryClient = createQueryClient();
    let queryData: PathResponse[] | undefined;

    const TestComponent = defineComponent({
      setup() {
        const { data } = usePaths();
        queryData = data.value;
        return {};
      },
      template: '<div></div>',
    });

    mount(TestComponent, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } });
    await queryClient.refetchQueries({ queryKey: ['paths'] });

    expect(vi.mocked(listPathsV1PathsGet)).toHaveBeenCalled();
  });
});

describe('useEntries', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not call API when pathId is empty', () => {
    vi.mocked(listEntriesV1PathIdEntriesGet).mockResolvedValue({
      data: [],
      status: 200,
      headers: new Headers(),
    });

    const pathId = ref('');
    const queryClient = createQueryClient();

    const TestComponent = defineComponent({
      setup() {
        useEntries(pathId);
        return {};
      },
      template: '<div></div>',
    });

    mount(TestComponent, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } });

    expect(vi.mocked(listEntriesV1PathIdEntriesGet)).not.toHaveBeenCalled();
  });

  it('fetches entries when pathId is set', async () => {
    vi.mocked(listEntriesV1PathIdEntriesGet).mockResolvedValue({
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

    mount(TestComponent, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } });
    await nextTick();
    await new Promise((r) => setTimeout(r, 50));

    expect(vi.mocked(listEntriesV1PathIdEntriesGet)).toHaveBeenCalledWith('p1');
  });
});

describe('useEntryContent', () => {
  beforeEach(() => vi.clearAllMocks());

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

    mount(TestComponent, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } });

    expect(vi.mocked(getEntryV1PathIdEntriesEntryIdGet)).not.toHaveBeenCalled();
  });

  it('fetches content when all ids are set', async () => {
    vi.mocked(getEntryV1PathIdEntriesEntryIdGet).mockResolvedValue({
      data: { id: 'e1', path_id: 'p1', day: '2024-01-01', edit_id: 'edit-1', content: 'hello' },
      status: 200,
      headers: new Headers(),
    });

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

    mount(TestComponent, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } });
    await nextTick();
    await new Promise((r) => setTimeout(r, 50));

    expect(vi.mocked(getEntryV1PathIdEntriesEntryIdGet)).toHaveBeenCalledWith('p1', 'e1');
  });

  it('re-fetches when editId changes (smart refetch)', async () => {
    vi.mocked(getEntryV1PathIdEntriesEntryIdGet).mockResolvedValue({
      data: { id: 'e1', path_id: 'p1', day: '2024-01-01', edit_id: 'edit-1', content: 'hello' },
      status: 200,
      headers: new Headers(),
    });

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

    mount(TestComponent, { global: { plugins: [[VueQueryPlugin, { queryClient }]] } });
    await nextTick();
    await new Promise((r) => setTimeout(r, 50));

    const callCount = vi.mocked(getEntryV1PathIdEntriesEntryIdGet).mock.calls.length;

    // Changing the editId should trigger a new fetch since it's part of the query key
    editId.value = 'edit-2';
    await nextTick();
    await new Promise((r) => setTimeout(r, 50));

    expect(vi.mocked(getEntryV1PathIdEntriesEntryIdGet).mock.calls.length).toBeGreaterThan(callCount);
  });
});
