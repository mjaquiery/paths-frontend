/**
 * Integration tests for PathsSelectorBar subscription management.
 *
 * Tests the "Invite user" flow: user fills in an email address for one of
 * their owned paths, clicks "Invite", and the POST
 * /v1/paths/:pathCode/subscriptions request is made via the MSW-intercepted
 * API.
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

import PathSubscriptionManager from '../components/PathSubscriptionManager.vue';
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
    props: ['disabled', 'size', 'fill', 'color'],
    emits: ['click'],
  },
  IonInput: {
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'placeholder', 'type'],
    emits: ['update:modelValue'],
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

// ---------------------------------------------------------------------------
// MSW server — only for mutation endpoints
// ---------------------------------------------------------------------------
const server = setupServer(
  http.get('*/v1/paths/:pathCode/subscriptions', () => {
    return HttpResponse.json([], { status: 200 });
  }),
  http.post('*/v1/paths/:pathCode/subscriptions', () => {
    return HttpResponse.json(
      { invitation_id: 'inv-1', status: 'invited' },
      { status: 201 },
    );
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

async function mountManager() {
  const queryClient = createQueryClient();
  const wrapper = mount(PathSubscriptionManager, {
    props: { pathCode: ownedPath.path_id, pathTitle: ownedPath.title },
    global: {
      plugins: [[VueQueryPlugin, { queryClient }]],
      stubs: ionicStubs,
    },
  });

  await flushPromises();
  await nextTick();

  return wrapper;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('PathSubscriptionManager – subscription management (MSW integration)', () => {
  it('shows the subscriber management section for a path', async () => {
    const wrapper = await mountManager();
    expect(wrapper.html()).toContain('My Path');
    expect(wrapper.html()).toContain('Invite');
  });

  it('Invite button is disabled when email field is empty', async () => {
    const wrapper = await mountManager();

    const inviteBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Invite');
    expect(inviteBtn).toBeDefined();
    expect(inviteBtn!.attributes('disabled')).toBeDefined();
  });

  it('Invite button becomes enabled when an email is entered', async () => {
    const wrapper = await mountManager();

    const inputs = wrapper.findAll('input');
    expect(inputs.length).toBeGreaterThan(0);
    await inputs[inputs.length - 1]!.setValue('user@example.com');
    await nextTick();

    const inviteBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Invite');
    expect(inviteBtn!.attributes('disabled')).toBeUndefined();
  });

  it('calls POST /v1/paths/:pathCode/subscriptions with the correct email', async () => {
    const subscriptionRequests: Request[] = [];
    server.use(
      http.post('*/v1/paths/:pathCode/subscriptions', async ({ request }) => {
        subscriptionRequests.push(request.clone());
        return HttpResponse.json(
          { invitation_id: 'inv-1', status: 'invited' },
          { status: 201 },
        );
      }),
    );

    const wrapper = await mountManager();

    const inputs = wrapper.findAll('input');
    await inputs[inputs.length - 1]!.setValue('invited@example.com');
    await nextTick();

    const inviteBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Invite');
    await inviteBtn!.trigger('click');
    await flushPromises();

    expect(subscriptionRequests).toHaveLength(1);
    const body = await subscriptionRequests[0]!.json();
    expect(body.email).toBe('invited@example.com');
  });

  it('shows a success message after successful invitation', async () => {
    const wrapper = await mountManager();

    const inputs = wrapper.findAll('input');
    await inputs[inputs.length - 1]!.setValue('user@example.com');
    await nextTick();

    const inviteBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Invite');
    await inviteBtn!.trigger('click');
    await flushPromises();

    expect(wrapper.html()).toContain('Invitation sent successfully');
  });

  it('clears the email field after a successful invitation', async () => {
    const wrapper = await mountManager();

    const inputs = wrapper.findAll('input');
    const inviteInput = inputs[inputs.length - 1]!;
    await inviteInput.setValue('user@example.com');
    await nextTick();

    const inviteBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Invite');
    await inviteBtn!.trigger('click');
    await flushPromises();

    expect((inviteInput.element as HTMLInputElement).value).toBe('');
  });

  it('shows an error message when the invitation fails', async () => {
    server.use(
      http.post('*/v1/paths/:pathCode/subscriptions', () => {
        return HttpResponse.json({ detail: 'User not found' }, { status: 404 });
      }),
    );

    const wrapper = await mountManager();

    const inputs = wrapper.findAll('input');
    await inputs[inputs.length - 1]!.setValue('bad@example.com');
    await nextTick();

    const inviteBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Invite');
    await inviteBtn!.trigger('click');
    await flushPromises();

    expect(wrapper.html()).toContain('Failed to invite');
  });

  it('clears the success message when the user starts typing a new email', async () => {
    const wrapper = await mountManager();

    const inputs = wrapper.findAll('input');
    const inviteInput = inputs[inputs.length - 1]!;
    await inviteInput.setValue('first@example.com');
    await nextTick();

    const inviteBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Invite');
    await inviteBtn!.trigger('click');
    await flushPromises();

    expect(wrapper.html()).toContain('Invitation sent successfully');

    await inviteInput.setValue('second@example.com');
    await nextTick();

    expect(wrapper.html()).not.toContain('Invitation sent successfully');
  });
});
