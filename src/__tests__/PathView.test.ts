import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import PathView from '../views/PathView.vue';

vi.mock('@ionic/vue-router', () => ({
  useRoute: () => ({ params: { pathId: 'p1' }, query: {} }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

vi.mock('../composables/usePaths', () => ({
  usePaths: () => ({ data: { value: [] } }),
}));

vi.mock('../composables/useMultiPathEntries', () => ({
  useMultiPathEntries: () => ({ value: [] }),
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
};

describe('PathView', () => {
  it('renders without crashing', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = mount(PathView, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
        stubs: ionicStubs,
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('shows empty state when no entries', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = mount(PathView, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
        stubs: ionicStubs,
      },
    });
    expect(wrapper.html()).toContain('No entries yet');
  });
});
