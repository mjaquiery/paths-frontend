import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import EntryCreateView from '../views/EntryCreateView.vue';

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { pathId: 'p1' }, query: { date: '2024-01-15' } }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn() }),
}));

vi.mock('../composables/useCurrentUser', () => ({
  useCurrentUser: () => ({ currentUserId: { value: 'user-1' } }),
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

vi.mock('../generated/apiClient', () => ({
  useCreateEntry: () => ({ mutateAsync: vi.fn() }),
  useUpdateEntry: () => ({ mutateAsync: vi.fn() }),
  useCreateImageUploadUrl: () => ({ mutateAsync: vi.fn() }),
  useCompleteImageUpload: () => ({ mutateAsync: vi.fn() }),
}));

const ionicStubs = {
  IonPage: { template: '<div><slot /></div>' },
  IonHeader: { template: '<div><slot /></div>' },
  IonToolbar: { template: '<div><slot /></div>' },
  IonTitle: { template: '<div><slot /></div>' },
  IonContent: { template: '<div><slot /></div>' },
  IonFooter: { template: '<div><slot /></div>' },
  IonButton: {
    template:
      '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    props: ['disabled'],
    emits: ['click'],
  },
  IonButtons: { template: '<div><slot /></div>' },
  IonBackButton: { template: '<button>Back</button>' },
  IonModal: { template: '<div><slot /></div>' },
  IonItem: { template: '<div><slot /></div>' },
  IonLabel: { template: '<label><slot /></label>' },
  IonSelect: { template: '<select><slot /></select>' },
  IonSelectOption: { template: '<option><slot /></option>' },
  IonInput: { template: '<input />' },
  IonTextarea: { template: '<textarea></textarea>' },
  IonText: { template: '<div><slot /></div>' },
  IonNote: { template: '<div><slot /></div>' },
  RefreshStatus: { template: '<div />' },
  EntryImage: { template: '<div />', props: ['imageId', 'alt'] },
  MarkdownContent: {
    template: '<div><slot /></div>',
    props: ['content', 'images'],
  },
};

describe('EntryCreateView', () => {
  it('renders without crashing', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = mount(EntryCreateView, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
        stubs: ionicStubs,
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('shows path selector and date input', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = mount(EntryCreateView, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
        stubs: ionicStubs,
      },
    });
    expect(wrapper.html()).toContain('Path');
    expect(wrapper.html()).toContain('Day');
    expect(wrapper.html()).toContain('Content');
  });
});
