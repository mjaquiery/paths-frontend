import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';

import { usePaths } from '../composables/usePaths';
import { useEntries, useEntryContent } from '../composables/useEntries';
import type { PathResponse } from '../generated/types';

vi.mock('../generated/apiClient', () => ({
  listPaths: vi.fn(),
  listEntries: vi.fn(),
  getEntry: vi.fn(),
}));

import {
  listPaths,
  listEntries,
  getEntry,
} from '../generated/apiClient';

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('usePaths', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches paths from the API', async () => {
    const mockPaths: PathResponse[] = [
      {
        path_id: 'p1',
        uuid: 'uuid-p1',
        title: 'Path 1',
        description: null,
        color: '#3880ff',
        is_public: true,
        owner_user_id: 'u1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];
    vi.mocked(listPaths).mockResolvedValue({
      data: mockPaths,
      status: 200,
      headers: new Headers(),
    });

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
    await queryClient.refetchQueries({ queryKey: ['v1', 'paths'] });

    expect(vi.mocked(listPaths)).toHaveBeenCalled();
  });
});

describe('useEntries', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not call API when pathId is empty', () => {
    vi.mocked(listEntries).mockResolvedValue({
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

    mount(TestComponent, {
      global: { plugins: [[VueQueryPlugin, { queryClient }]] },
    });

    expect(vi.mocked(listEntries)).not.toHaveBeenCalled();
  });

  it('fetches entries when pathId is set', async () => {
    vi.mocked(listEntries).mockResolvedValue({
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
    await nextTick();
    await new Promise((r) => setTimeout(r, 50));

    expect(vi.mocked(listEntries)).toHaveBeenCalledWith('p1');
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

    mount(TestComponent, {
      global: { plugins: [[VueQueryPlugin, { queryClient }]] },
    });

    expect(vi.mocked(getEntry)).not.toHaveBeenCalled();
  });

  it('fetches content when all ids are set', async () => {
    vi.mocked(getEntry).mockResolvedValue({
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
    await nextTick();
    await new Promise((r) => setTimeout(r, 50));

    expect(vi.mocked(getEntry)).toHaveBeenCalledWith(
      'p1',
      'e1',
    );
  });

  it('re-fetches when editId changes (smart refetch)', async () => {
    vi.mocked(getEntry).mockResolvedValue({
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
    await nextTick();
    await new Promise((r) => setTimeout(r, 50));

    const callCount = vi.mocked(getEntry).mock.calls.length;

    // Changing the editId should trigger a new fetch since it's part of the query key
    editId.value = 'edit-2';
    await nextTick();
    await new Promise((r) => setTimeout(r, 50));

    expect(
      vi.mocked(getEntry).mock.calls.length,
    ).toBeGreaterThan(callCount);
  });
});
