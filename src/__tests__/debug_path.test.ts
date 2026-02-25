import { describe, it, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount, flushPromises } from '@vue/test-utils';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

import PathsSelectorBar from '../components/PathsSelectorBar.vue';
import type { PathResponse, OAuthCallbackResponse } from '../generated/types';

vi.mock('../lib/db', () => ({
  isPathHidden: vi.fn().mockResolvedValue(false),
  setPathHidden: vi.fn().mockResolvedValue(undefined),
  getPathOrder: vi.fn().mockReturnValue([]),
  setPathOrder: vi.fn(),
}));

const ionicStubs = {
  IonButton: {
    template:
      '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    props: ['disabled', 'size', 'fill'],
    emits: ['click'],
  },
  IonCard: { template: '<div><slot /></div>' },
  IonCardContent: { template: '<div><slot /></div>' },
  IonChip: { template: '<span><slot /></span>' },
  IonInput: {
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'placeholder'],
    emits: ['update:modelValue'],
  },
  IonItem: { template: '<div><slot /></div>' },
  IonLabel: { template: '<label><slot /></label>' },
  IonList: { template: '<div><slot /></div>' },
  IonToggle: {
    template: '<input type="checkbox" :checked="checked" />',
    props: ['checked'],
  },
};

const existingPath: PathResponse = {
  path_id: 'path-1',
  uuid: 'uuid-1',
  owner_user_id: 'user-1',
  title: 'Existing Path',
  description: null,
  color: '#ff0000',
  is_public: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const createdPath: PathResponse = {
  path_id: 'path-2',
  uuid: 'uuid-2',
  owner_user_id: 'user-1',
  title: 'New Integration Path',
  description: null,
  color: '#3949ab',
  is_public: false,
  created_at: '2024-01-02T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
};

const currentUser: OAuthCallbackResponse = {
  user_id: 'user-1',
  email: 'test@example.com',
  display_name: 'Test User',
};

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

let getCallCount = 0;
const server = setupServer(
  http.get('*/v1/paths', () => {
    getCallCount++;
    console.log('GET /v1/paths intercepted, count:', getCallCount);
    return HttpResponse.json([existingPath], { status: 200 });
  }),
  http.post('*/v1/paths', () => {
    console.log('POST /v1/paths intercepted');
    return HttpResponse.json(createdPath, { status: 201 });
  }),
  http.get('*/v1/invitations', () => {
    console.log('GET /v1/invitations intercepted');
    return HttpResponse.json([], { status: 200 });
  }),
);

beforeAll(() => {
  console.log('beforeAll: starting server');
  server.listen({ onUnhandledRequest: 'warn' });
  console.log('beforeAll: server started');
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Debug path visibility', () => {
  it('checks if GET is intercepted on mount', async () => {
    getCallCount = 0;
    const queryClient = createQueryClient();
    const wrapper = mount(PathsSelectorBar, {
      props: { currentUser },
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
        stubs: ionicStubs,
      },
    });

    await flushPromises();
    console.log('After mount, text:', JSON.stringify(wrapper.text()));
    console.log('getCallCount:', getCallCount);
    console.log(
      'queryData:',
      JSON.stringify(queryClient.getQueryData(['v1', 'paths'])),
    );
  });
});
