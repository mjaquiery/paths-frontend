/**
 * Integration tests for InvitationsView.
 *
 * Tests that path_title and inviter_email are displayed in the invitation list,
 * replacing the less informative path_code.
 *
 * Note: GET /v1/invitations and GET /v1/invitations/blocklist are pre-populated
 * in the TanStack Query cache to avoid timing issues with useQuery scheduling
 * in the test environment.
 */
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount, flushPromises } from '@vue/test-utils';

import InvitationsView from '../views/InvitationsView.vue';
import type { InvitationResponse } from '../generated/types';

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
  IonPage: { template: '<div><slot /></div>' },
  IonHeader: { template: '<div><slot /></div>' },
  IonToolbar: { template: '<div><slot /></div>' },
  IonTitle: { template: '<div><slot /></div>' },
  IonButtons: { template: '<div><slot /></div>' },
  IonBackButton: { template: '<button />' },
  IonContent: { template: '<div><slot /></div>' },
  IonCard: { template: '<div><slot /></div>' },
  IonCardHeader: { template: '<div><slot /></div>' },
  IonCardTitle: { template: '<div><slot /></div>' },
  IonCardContent: { template: '<div><slot /></div>' },
  IonList: { template: '<ul><slot /></ul>' },
  IonItem: { template: '<li><slot /></li>' },
  IonLabel: { template: '<div><slot /></div>' },
  IonButton: {
    template:
      '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    props: ['disabled', 'size', 'fill', 'color'],
    emits: ['click'],
  },
};

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const activeInvitation: InvitationResponse = {
  id: 'inv-1',
  path_id: 'path-1',
  path_code: 'AB3X7K',
  path_title: 'My Travel Journal',
  inviter_user_id: 'user-2',
  inviter_email: 'owner@example.com',
  invited_email: 'subscriber@example.com',
  invited_user_id: null,
  status: 'invited',
  created_at: '2024-03-15T09:00:00Z',
  updated_at: '2024-03-15T09:00:00Z',
};

const ignoredInvitation: InvitationResponse = {
  id: 'inv-2',
  path_id: 'path-2',
  path_code: 'CD5Y9Z',
  path_title: 'Weekend Adventures',
  inviter_user_id: 'user-3',
  inviter_email: 'friend@example.com',
  invited_email: 'subscriber@example.com',
  invited_user_id: null,
  status: 'ignored',
  created_at: '2024-03-10T09:00:00Z',
  updated_at: '2024-03-11T09:00:00Z',
};

const invitationWithNullEmail: InvitationResponse = {
  id: 'inv-3',
  path_id: 'path-3',
  path_code: 'EF7W2P',
  path_title: 'Secret Project',
  inviter_user_id: 'user-4',
  inviter_email: null,
  invited_email: 'subscriber@example.com',
  invited_user_id: null,
  status: 'invited',
  created_at: '2024-03-12T09:00:00Z',
  updated_at: '2024-03-12T09:00:00Z',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

async function mountView(invitations: InvitationResponse[]) {
  const queryClient = createQueryClient();

  queryClient.setQueryData(['v1', 'invitations'], {
    data: invitations,
    status: 200,
    headers: new Headers(),
  });

  queryClient.setQueryData(['v1', 'invitations', 'blocklist'], {
    data: [],
    status: 200,
    headers: new Headers(),
  });

  const wrapper = mount(InvitationsView, {
    global: {
      plugins: [[VueQueryPlugin, { queryClient }]],
      stubs: ionicStubs,
    },
  });

  await flushPromises();

  return wrapper;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('InvitationsView – displaying path_title and inviter_email', () => {
  it('displays path_title for active invitations instead of path_code', async () => {
    const wrapper = await mountView([activeInvitation, ignoredInvitation]);

    expect(wrapper.html()).toContain('My Travel Journal');
    expect(wrapper.html()).not.toContain('AB3X7K');
  });

  it('displays inviter_email for active invitations', async () => {
    const wrapper = await mountView([activeInvitation, ignoredInvitation]);

    expect(wrapper.html()).toContain('owner@example.com');
  });

  it('displays path_title for ignored invitations', async () => {
    const wrapper = await mountView([activeInvitation, ignoredInvitation]);

    expect(wrapper.html()).toContain('Weekend Adventures');
    expect(wrapper.html()).not.toContain('CD5Y9Z');
  });

  it('displays inviter_email for ignored invitations', async () => {
    const wrapper = await mountView([activeInvitation, ignoredInvitation]);

    expect(wrapper.html()).toContain('friend@example.com');
  });

  it('does not show "From:" line when inviter_email is null', async () => {
    const wrapper = await mountView([invitationWithNullEmail]);

    expect(wrapper.html()).toContain('Secret Project');
    expect(wrapper.html()).not.toContain('From:');
  });

  it('shows empty state when there are no invitations', async () => {
    const wrapper = await mountView([]);

    expect(wrapper.html()).toContain('No pending invitations');
  });
});
