import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';

import { usePaths } from '../composables/usePaths';
import { useEntries, useEntryContent } from '../composables/useEntries';

vi.mock('../lib/customFetch', () => ({
  customFetch: vi.fn(),
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
    await nextTick();
    await new Promise((r) => setTimeout(r, 50));

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
    await nextTick();
    await new Promise((r) => setTimeout(r, 50));

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
    await nextTick();
    await new Promise((r) => setTimeout(r, 50));

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
    await nextTick();
    await new Promise((r) => setTimeout(r, 50));

    const callCount = vi.mocked(customFetch).mock.calls.length;

    // Changing the editId should trigger a new fetch since it's part of the query key
    editId.value = 'edit-2';
    await nextTick();
    await new Promise((r) => setTimeout(r, 50));

    expect(vi.mocked(customFetch).mock.calls.length).toBeGreaterThan(callCount);
  });
});
