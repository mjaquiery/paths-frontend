import { describe, expect, it, vi, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount } from '@vue/test-utils';

vi.mock('../generated/apiClient', () => ({
  listEntriesV1PathIdEntriesGet: vi.fn(),
  createEntryV1PathIdEntriesPost: vi.fn(),
}));

import {
  listEntriesV1PathIdEntriesGet,
  createEntryV1PathIdEntriesPost,
} from '../generated/apiClient';
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
  beforeEach(() => vi.clearAllMocks());

  it('shows prompt when no pathId is provided', () => {
    const queryClient = createQueryClient();
    vi.mocked(listEntriesV1PathIdEntriesGet).mockResolvedValue({
      data: [],
      status: 200,
      headers: new Headers(),
    });

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
    vi.mocked(listEntriesV1PathIdEntriesGet).mockResolvedValue({
      data: [],
      status: 200,
      headers: new Headers(),
    });

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
    vi.mocked(listEntriesV1PathIdEntriesGet).mockResolvedValue({
      data: [],
      status: 200,
      headers: new Headers(),
    });

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
    vi.mocked(listEntriesV1PathIdEntriesGet).mockResolvedValue({
      data: [],
      status: 200,
      headers: new Headers(),
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
    expect(newEntryButton).toBeDefined();
    await newEntryButton!.trigger('click');
    await nextTick();

    expect(wrapper.text()).toContain('Create');
    expect(wrapper.text()).toContain('Cancel');
  });

  it('calls createEntryV1PathIdEntriesPost when form is submitted', async () => {
    const queryClient = createQueryClient();
    vi.mocked(listEntriesV1PathIdEntriesGet).mockResolvedValue({
      data: [],
      status: 200,
      headers: new Headers(),
    });
    vi.mocked(createEntryV1PathIdEntriesPost).mockResolvedValue({
      data: { id: 'e1', path_id: 'p1', day: '2024-01-01', edit_id: 'ed1' },
      status: 201,
      headers: new Headers(),
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

    expect(vi.mocked(createEntryV1PathIdEntriesPost)).toHaveBeenCalledWith(
      'p1',
      { day: '2024-01-01', content: 'My entry content' },
    );
  });
});
