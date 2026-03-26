import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import DateView from '../views/DateView.vue';

vi.mock('@ionic/vue-router', () => ({
  useRoute: () => ({ params: { date: '2024-01-15' }, query: {} }),
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

describe('DateView', () => {
  it('renders without crashing', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = mount(DateView, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
        stubs: ionicStubs,
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('shows "No entries for this day" when there are no entries', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = mount(DateView, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
        stubs: ionicStubs,
      },
    });
    expect(wrapper.html()).toContain('No entries for this day');
  });
});
