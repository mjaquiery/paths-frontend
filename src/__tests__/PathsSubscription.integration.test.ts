/**
 * Integration tests for PathsSelectorBar subscription management.
 *
 * Tests the "Invite user" flow: user fills in a user ID for one of their
 * owned paths, clicks "Invite", and the POST /v1/paths/:pathCode/subscriptions
 * request is made via the MSW-intercepted API.
 *
 * Note: GET /v1/paths is pre-populated in the TanStack Query cache to avoid
 * timing issues with useQuery scheduling in the test environment.
 * POST requests to create subscriptions are tested via MSW as genuine HTTP.
 */
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterEach,
  afterAll,
} from 'vitest';
import { nextTick } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount, flushPromises } from '@vue/test-utils';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

import PathsSelectorBar from '../components/PathsSelectorBar.vue';
import type { PathResponse, OAuthCallbackResponse } from '../generated/types';

// ---------------------------------------------------------------------------
// Mock Dexie
// ---------------------------------------------------------------------------
vi.mock('../lib/db', () => ({
  isPathHidden: vi.fn().mockResolvedValue(false),
  setPathHidden: vi.fn().mockResolvedValue(undefined),
  getPathOrder: vi.fn().mockReturnValue([]),
  setPathOrder: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Stub Ionic components
// ---------------------------------------------------------------------------
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
  IonList: { template: '<ul><slot /></ul>' },
  IonToggle: {
    template:
      '<input type="checkbox" :checked="checked" @change="$emit(\'ionChange\', { detail: { checked: $event.target.checked } })" />',
    props: ['checked'],
    emits: ['ionChange'],
  },
};

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const currentUser: OAuthCallbackResponse = {
  token: 'tok',
  user_id: 'user-1',
  display_name: 'Test User',
};

const ownedPath: PathResponse = {
  path_id: 'path-1',
  uuid: 'uuid-path-1',
  owner_user_id: 'user-1',
  title: 'My Path',
  description: null,
  color: '#3949ab',
  is_public: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Simulated raw API response (as customFetch wraps it)
const pathsApiResponse = {
  data: [ownedPath],
  status: 200,
  headers: new Headers(),
};

// ---------------------------------------------------------------------------
// MSW server — only for mutation endpoints
// ---------------------------------------------------------------------------
const server = setupServer(
  http.post('*/v1/paths/:pathCode/subscriptions', () => {
    return new HttpResponse(null, { status: 204 });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function createQueryClient() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  // Pre-populate the cache with paths data so ownedPaths computed works
  // without needing the query to fetch (avoids TanStack Query scheduling issues in tests)
  qc.setQueryData(['v1', 'paths'], pathsApiResponse);
  return qc;
}

async function mountAndExpand() {
  const queryClient = createQueryClient();
  const wrapper = mount(PathsSelectorBar, {
    props: { currentUser },
    global: {
      plugins: [[VueQueryPlugin, { queryClient }]],
      stubs: ionicStubs,
    },
  });

  // Allow watch(allPaths) to run and update pathOrder
  await flushPromises();
  await nextTick();

  // Open expanded view
  const moreBtn = wrapper
    .findAll('button')
    .find((b) => b.text().includes('More'));
  expect(moreBtn).toBeDefined();
  await moreBtn!.trigger('click');
  await nextTick();
  await flushPromises();

  return wrapper;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('PathsSelectorBar – subscription management (MSW integration)', () => {
  it('shows an invite section for each owned path in the expanded view', async () => {
    const wrapper = await mountAndExpand();
    expect(wrapper.html()).toContain('Invite');
    expect(wrapper.html()).toContain('My Path');
  });

  it('Invite button is disabled when user ID field is empty', async () => {
    const wrapper = await mountAndExpand();

    const inviteBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Invite');
    expect(inviteBtn).toBeDefined();
    expect(inviteBtn!.attributes('disabled')).toBeDefined();
  });

  it('Invite button becomes enabled when a user ID is entered', async () => {
    const wrapper = await mountAndExpand();

    // Find the invite input (not the checkboxes)
    const textInputs = wrapper
      .findAll('input')
      .filter((i) => i.attributes('type') !== 'checkbox');
    expect(textInputs.length).toBeGreaterThan(0);
    await textInputs[textInputs.length - 1].setValue('target-user-id');
    await nextTick();

    const inviteBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Invite');
    expect(inviteBtn!.attributes('disabled')).toBeUndefined();
  });

  it('calls POST /v1/paths/:pathCode/subscriptions with the correct user_id', async () => {
    const subscriptionRequests: Request[] = [];
    server.use(
      http.post('*/v1/paths/:pathCode/subscriptions', async ({ request }) => {
        subscriptionRequests.push(request.clone());
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const wrapper = await mountAndExpand();

    const textInputs = wrapper
      .findAll('input')
      .filter((i) => i.attributes('type') !== 'checkbox');
    await textInputs[textInputs.length - 1].setValue('invited-user-id');
    await nextTick();

    const inviteBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Invite');
    await inviteBtn!.trigger('click');
    await flushPromises();

    expect(subscriptionRequests).toHaveLength(1);
    const body = await subscriptionRequests[0]!.json();
    expect(body.user_id).toBe('invited-user-id');
  });

  it('shows a success message after successful invitation', async () => {
    const wrapper = await mountAndExpand();

    const textInputs = wrapper
      .findAll('input')
      .filter((i) => i.attributes('type') !== 'checkbox');
    await textInputs[textInputs.length - 1].setValue('some-user');
    await nextTick();

    const inviteBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Invite');
    await inviteBtn!.trigger('click');
    await flushPromises();

    expect(wrapper.html()).toContain('User invited successfully');
  });

  it('clears the user ID field after a successful invitation', async () => {
    const wrapper = await mountAndExpand();

    const textInputs = wrapper
      .findAll('input')
      .filter((i) => i.attributes('type') !== 'checkbox');
    const inviteInput = textInputs[textInputs.length - 1];
    await inviteInput.setValue('some-user');
    await nextTick();

    const inviteBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Invite');
    await inviteBtn!.trigger('click');
    await flushPromises();

    // Input should be cleared (v-model resets inviteUserId[pathId] to '')
    expect((inviteInput.element as HTMLInputElement).value).toBe('');
  });

  it('shows an error message when the invitation fails', async () => {
    server.use(
      http.post('*/v1/paths/:pathCode/subscriptions', () => {
        return HttpResponse.json({ detail: 'User not found' }, { status: 404 });
      }),
    );

    const wrapper = await mountAndExpand();

    const textInputs = wrapper
      .findAll('input')
      .filter((i) => i.attributes('type') !== 'checkbox');
    await textInputs[textInputs.length - 1].setValue('nonexistent-user');
    await nextTick();

    const inviteBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Invite');
    await inviteBtn!.trigger('click');
    await flushPromises();

    expect(wrapper.html()).toContain('Failed to invite');
  });

  it('clears the success message when the user starts typing a new user ID', async () => {
    const wrapper = await mountAndExpand();

    // First successful invite
    const textInputs = wrapper
      .findAll('input')
      .filter((i) => i.attributes('type') !== 'checkbox');
    const inviteInput = textInputs[textInputs.length - 1];
    await inviteInput.setValue('first-user');
    await nextTick();

    const inviteBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Invite');
    await inviteBtn!.trigger('click');
    await flushPromises();

    expect(wrapper.html()).toContain('User invited successfully');

    // User starts typing a second invite — success message should clear
    await inviteInput.setValue('second-user');
    await nextTick();

    expect(wrapper.html()).not.toContain('User invited successfully');
  });
});
