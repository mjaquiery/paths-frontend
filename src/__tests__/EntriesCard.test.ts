import { describe, expect, it, vi, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount } from '@vue/test-utils';

vi.mock('../lib/customFetch', () => ({
  customFetch: vi.fn(),
}));

import { customFetch } from '../lib/customFetch';
import EntriesCard from '../components/EntriesCard.vue';

const ionicStubs = {
  IonCard: { template: '<div><slot /></div>' },
  IonCardHeader: { template: '<div><slot /></div>' },
  IonCardTitle: { template: '<div><slot /></div>' },
  IonCardContent: { template: '<div><slot /></div>' },
  IonButton: {
    template:
      '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    props: ['disabled', 'size', 'fill'],
    emits: ['click'],
  },
  IonInput: {
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'type', 'placeholder'],
    emits: ['update:modelValue'],
  },
  IonTextarea: {
    template:
      '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
    props: ['modelValue', 'placeholder', 'rows'],
    emits: ['update:modelValue'],
  },
  IonItem: { template: '<div><slot /></div>' },
  IonLabel: { template: '<label><slot /></label>' },
  IonList: { template: '<ul><slot /></ul>' },
};

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('EntriesCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: return an empty entries list for any GET request
    vi.mocked(customFetch).mockResolvedValue({
      data: [],
      status: 200,
      headers: new Headers(),
    });
  });

  it('shows prompt when no pathId is provided', () => {
    const queryClient = createQueryClient();

    const wrapper = mount(EntriesCard, {
      props: { pathId: '' },
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
        stubs: ionicStubs,
      },
    });

    expect(wrapper.text()).toContain('Choose a Path');
  });

  it('does not show New Entry button when canCreateEntries is false', async () => {
    const queryClient = createQueryClient();

    const wrapper = mount(EntriesCard, {
      props: { pathId: 'p1', canCreateEntries: false },
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
        stubs: ionicStubs,
      },
    });

    await nextTick();
    expect(wrapper.text()).not.toContain('New Entry');
  });

  it('shows New Entry button when canCreateEntries is true and pathId is set', async () => {
    const queryClient = createQueryClient();

    const wrapper = mount(EntriesCard, {
      props: { pathId: 'p1', canCreateEntries: true },
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
        stubs: ionicStubs,
      },
    });

    await nextTick();
    expect(wrapper.text()).toContain('New Entry');
  });

  it('shows create form when New Entry button is clicked', async () => {
    const queryClient = createQueryClient();

    const wrapper = mount(EntriesCard, {
      props: { pathId: 'p1', canCreateEntries: true },
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
        stubs: ionicStubs,
      },
    });

    await nextTick();
    const newEntryButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('New Entry'));
    expect(newEntryButton).toBeDefined();
    await newEntryButton!.trigger('click');
    await nextTick();

    expect(wrapper.text()).toContain('Create');
    expect(wrapper.text()).toContain('Cancel');
  });

  it('calls createEntry API when form is submitted', async () => {
    const queryClient = createQueryClient();
    vi.mocked(customFetch).mockImplementation((url: string, options?: RequestInit) => {
      if ((options as RequestInit)?.method === 'POST') {
        return Promise.resolve({
          data: { id: 'e1', path_id: 'p1', day: '2024-01-01', edit_id: 'ed1' },
          status: 201,
          headers: new Headers(),
        });
      }
      return Promise.resolve({ data: [], status: 200, headers: new Headers() });
    });

    const wrapper = mount(EntriesCard, {
      props: { pathId: 'p1', canCreateEntries: true },
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
        stubs: ionicStubs,
      },
    });

    await nextTick();

    // Click "New Entry"
    const newEntryButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('New Entry'));
    await newEntryButton!.trigger('click');
    await nextTick();

    // Fill in day and content
    const inputs = wrapper.findAll('input');
    await inputs[0].setValue('2024-01-01');
    const textarea = wrapper.find('textarea');
    await textarea.setValue('My entry content');
    await nextTick();

    // Click Create
    const createButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Create');
    await createButton!.trigger('click');
    await nextTick();
    await new Promise((r) => setTimeout(r, 50));

    expect(vi.mocked(customFetch)).toHaveBeenCalledWith(
      '/v1/paths/p1/entries',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ day: '2024-01-01', content: 'My entry content' }),
      }),
    );
  });

  it('shows an error and keeps the form open when entry creation fails', async () => {
    const queryClient = createQueryClient();
    vi.mocked(customFetch).mockImplementation((url: string, options?: RequestInit) => {
      if ((options as RequestInit)?.method === 'POST') {
        return Promise.reject(new Error('server error'));
      }
      return Promise.resolve({ data: [], status: 200, headers: new Headers() });
    });

    const wrapper = mount(EntriesCard, {
      props: { pathId: 'p1', canCreateEntries: true },
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
        stubs: ionicStubs,
      },
    });

    await nextTick();

    const newEntryButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('New Entry'));
    await newEntryButton!.trigger('click');
    await nextTick();

    const inputs = wrapper.findAll('input');
    await inputs[0].setValue('2024-01-01');
    const textarea = wrapper.find('textarea');
    await textarea.setValue('My entry content');
    await nextTick();

    const createButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Create');
    await createButton!.trigger('click');
    await nextTick();
    await new Promise((r) => setTimeout(r, 50));
    await nextTick();

    expect(wrapper.text()).toContain('Failed to create entry');
    expect(wrapper.find('textarea').exists()).toBe(true);
  });

  it('closes the form and clears fields when Cancel is clicked', async () => {
    const queryClient = createQueryClient();

    const wrapper = mount(EntriesCard, {
      props: { pathId: 'p1', canCreateEntries: true },
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
        stubs: ionicStubs,
      },
    });

    await nextTick();

    const newEntryButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('New Entry'));
    await newEntryButton!.trigger('click');
    await nextTick();

    await wrapper.findAll('input')[0].setValue('2024-01-01');
    await wrapper.find('textarea').setValue('Some content');
    await nextTick();

    const cancelButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Cancel');
    await cancelButton!.trigger('click');
    await nextTick();

    // Form should be closed
    expect(wrapper.find('input').exists()).toBe(false);
    expect(wrapper.find('textarea').exists()).toBe(false);

    // Re-open and verify fields are cleared
    await newEntryButton!.trigger('click');
    await nextTick();

    expect(
      (wrapper.findAll('input')[0].element as HTMLInputElement).value,
    ).toBe('');
    expect(
      (wrapper.find('textarea').element as HTMLTextAreaElement).value,
    ).toBe('');
  });
});
