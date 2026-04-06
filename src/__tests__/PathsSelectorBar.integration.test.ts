import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';

import PathsSelectorBar from '../components/PathsSelectorBar.vue';
import type { OAuthCallbackResponse, PathResponse } from '../generated/types';

const routerPush = vi.fn();
const invalidateQueries = vi.fn();
const refetchPaths = vi.fn();
const refetchInvitations = vi.fn();

const currentUser: OAuthCallbackResponse = {
  token: 'tok',
  user_id: 'user-1',
  display_name: 'Test User',
};

const existingPath: PathResponse = {
  path_id: 'path-1',
  uuid: 'uuid-path-1',
  owner_user_id: 'user-1',
  title: 'Existing Path',
  description: null,
  color: '#3949ab',
  is_public: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

vi.mock('../lib/db', () => ({
  isPathHidden: vi.fn().mockResolvedValue(false),
  setPathHidden: vi.fn().mockResolvedValue(undefined),
  getPathOrder: vi.fn().mockReturnValue([]),
  setPathOrder: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPush }),
}));

vi.mock('@tanstack/vue-query', () => ({
  useQueryClient: () => ({ invalidateQueries }),
}));

vi.mock('../composables/usePaths', () => ({
  usePaths: () => ({
    data: ref([existingPath]),
    refetch: refetchPaths,
  }),
}));

vi.mock('../generated/apiClient', () => ({
  useListInvitations: () => ({
    data: ref({ data: [] }),
    refetch: refetchInvitations,
  }),
  useAcceptInvitation: () => ({ mutateAsync: vi.fn() }),
  useIgnoreInvitation: () => ({ mutateAsync: vi.fn() }),
  useBlockInviter: () => ({ mutateAsync: vi.fn() }),
  useDeleteSubscription: () => ({ mutateAsync: vi.fn() }),
}));

const ionicStubs = {
  IonButton: {
    template:
      '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    props: ['disabled', 'size', 'fill', 'expand', 'color'],
    emits: ['click'],
  },
  IonButtons: { template: '<div><slot /></div>' },
  IonChip: { template: '<span><slot /></span>' },
  IonContent: { template: '<div><slot /></div>' },
  IonHeader: { template: '<div><slot /></div>' },
  IonItem: { template: '<div><slot /></div>' },
  IonLabel: { template: '<label><slot /></label>' },
  IonList: { template: '<div><slot /></div>' },
  IonModal: {
    template: '<div v-if="isOpen"><slot /></div>',
    props: ['isOpen'],
  },
  IonTitle: { template: '<div><slot /></div>' },
  IonToggle: {
    template:
      '<input type="checkbox" :checked="checked" @change="$emit(\'ionChange\', { detail: { checked: $event.target.checked } })" />',
    props: ['checked'],
    emits: ['ionChange'],
  },
  IonToolbar: { template: '<div><slot /></div>' },
};

function mountComponent() {
  return mount(PathsSelectorBar, {
    props: { currentUser },
    global: {
      stubs: {
        ...ionicStubs,
        PathSubscriptionManager: true,
        PathEditModal: true,
        PathDeleteModal: true,
        PathShareModal: true,
      },
    },
  });
}

describe('PathsSelectorBar route wiring', () => {
  beforeEach(() => {
    routerPush.mockReset();
    invalidateQueries.mockReset();
    refetchPaths.mockReset();
    refetchInvitations.mockReset();
  });

  it('routes the top-level "+ New Path" action to the create page', async () => {
    const wrapper = mountComponent();
    await nextTick();

    const newPathButton = wrapper
      .findAll('button')
      .find((button) => button.text().trim() === '+ New Path');

    expect(newPathButton).toBeDefined();
    await newPathButton!.trigger('click');

    expect(routerPush).toHaveBeenCalledWith('/paths/new');
    expect(wrapper.text()).not.toContain('Create');
    expect(wrapper.text()).not.toContain('Cancel');
  });

  it('routes the manage modal "+ New Path" action to the same create page', async () => {
    const wrapper = mountComponent();
    await nextTick();

    const manageButton = wrapper
      .findAll('button')
      .find((button) => button.text().trim() === 'Manage');
    expect(manageButton).toBeDefined();
    await manageButton!.trigger('click');
    await nextTick();

    const modalNewPathButton = wrapper
      .findAll('button')
      .find(
        (button, index) => button.text().trim() === '+ New Path' && index > 0,
      );

    expect(modalNewPathButton).toBeDefined();
    await modalNewPathButton!.trigger('click');
    await nextTick();

    expect(routerPush).toHaveBeenCalledWith('/paths/new');
    expect(wrapper.text()).not.toContain('Done+ New Path');
  });
});
