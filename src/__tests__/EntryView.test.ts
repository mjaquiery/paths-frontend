import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import EntryView from '../views/EntryView.vue';

vi.mock('@ionic/vue-router', () => ({
  useRoute: () => ({ params: { pathId: 'p1', entryId: 'e1' }, query: {} }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

vi.mock('../composables/usePaths', () => ({
  usePaths: () => ({
    data: {
      value: [
        {
          path_id: 'p1',
          title: 'Test Path',
          color: '#3949ab',
          owner_user_id: 'user-1',
          uuid: 'u1',
          description: null,
          is_public: false,
          created_at: '',
          updated_at: '',
        },
      ],
    },
  }),
}));

vi.mock('../composables/useMultiPathEntries', () => ({
  useMultiPathEntries: () => ({
    value: [
      {
        pathId: 'p1',
        entries: [
          {
            id: 'e1',
            path_id: 'p1',
            day: '2024-01-15',
            edit_id: 1,
            content: 'Test entry content',
          },
        ],
      },
    ],
  }),
}));

vi.mock('../generated/apiClient', () => ({
  useDeleteEntry: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('../lib/db', () => ({
  db: {
    entryContent: { delete: vi.fn() },
    entryImages: {
      where: () => ({ equals: () => ({ delete: vi.fn() }) }),
    },
  },
}));

const ionicStubs = {
  IonPage: { template: '<div><slot /></div>' },
  IonHeader: { template: '<div><slot /></div>' },
  IonToolbar: { template: '<div><slot /></div>' },
  IonTitle: { template: '<div><slot /></div>' },
  IonContent: { template: '<div><slot /></div>' },
  IonButton: {
    template: '<button @click="$emit(\'click\')"><slot /></button>',
    emits: ['click'],
  },
  IonButtons: { template: '<div><slot /></div>' },
  IonBackButton: { template: '<button>Back</button>' },
  IonAlert: {
    template: '<div></div>',
    props: ['isOpen', 'header', 'message', 'buttons'],
  },
  MarkdownContent: {
    template: '<div><slot /></div>',
    props: ['content', 'images'],
  },
};

describe('EntryView', () => {
  it('renders without crashing', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = mount(EntryView, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
        stubs: ionicStubs,
      },
    });
    expect(wrapper.exists()).toBe(true);
  });
});
