import type { Meta, StoryObj } from '@storybook/vue3';

import InvitationsView from './InvitationsView.vue';
import {
  createStoryApiError,
  createStoryNetworkError,
  createPopulatedState,
  createStoryParameters,
  storyTimestampOffset,
} from '../storybook/storySupport';

const populatedState = createPopulatedState();
const emptyState = createPopulatedState({
  invitations: [],
  blocklist: [],
});
const crowdedState = createPopulatedState({
  invitations: [
    ...Array.from({ length: 7 }, (_, index) => ({
      id: `active-${index + 1}`,
      path_id: `inv-path-${index + 1}`,
      path_code: `deep-archive-${index + 1}`,
      path_title: `Shared Path ${index + 1} with an intentionally long descriptive title`,
      inviter_user_id: `inviter-${index + 1}`,
      inviter_email: `person.with.a.very.long.email.address.${index + 1}@example-storybook.test`,
      invited_email: 'alex@example.com',
      invited_user_id: null,
      status: 'invited',
      created_at: storyTimestampOffset(-(index + 1)),
      updated_at: storyTimestampOffset(-(index + 1)),
    })),
    ...Array.from({ length: 4 }, (_, index) => ({
      id: `ignored-${index + 1}`,
      path_id: `ignored-path-${index + 1}`,
      path_code: `ignored-archive-${index + 1}`,
      path_title: `Ignored share request ${index + 1}`,
      inviter_user_id: `ignored-inviter-${index + 1}`,
      inviter_email: `ignored.sender.${index + 1}@example-storybook.test`,
      invited_email: 'alex@example.com',
      invited_user_id: null,
      status: 'ignored',
      created_at: storyTimestampOffset(-(index + 10)),
      updated_at: storyTimestampOffset(-(index + 2)),
    })),
  ],
  blocklist: Array.from({ length: 5 }, (_, index) => ({
    id: `blocked-${index + 1}`,
    blocked_user_id: `blocked-user-with-a-long-id-${index + 1}`,
    created_at: storyTimestampOffset(-(index + 20)),
  })),
});

const meta: Meta<typeof InvitationsView> = {
  title: 'Views/InvitationsView',
  component: InvitationsView,
};

export default meta;

type Story = StoryObj<typeof InvitationsView>;

export const Default: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/invitations',
  }),
};

export const Empty: Story = {
  parameters: createStoryParameters({
    state: emptyState,
    route: '/invitations',
  }),
};

export const Crowded: Story = {
  parameters: createStoryParameters({
    state: crowdedState,
    route: '/invitations',
  }),
};

export const Offline: Story = {
  parameters: createStoryParameters({
    state: crowdedState,
    route: '/invitations',
    networkMode: 'offline',
    seedCacheFromState: true,
    requestOverrides: [createStoryNetworkError('*/v1/*')],
  }),
};

export const ApiError: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/invitations',
    requestOverrides: [
      createStoryApiError('*/v1/invitations', 503, 'GET', {
        detail: 'Storybook forced invitations outage.',
      }),
      createStoryApiError('*/v1/invitations/blocklist', 503, 'GET', {
        detail: 'Storybook forced blocklist outage.',
      }),
    ],
  }),
};

/**
 * An action mutation (accept / ignore / block / unblock) fails with a server
 * error — the per-card error message should appear next to the affected card.
 */
export const ActionError: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/invitations',
    requestOverrides: [
      createStoryApiError('*/v1/invitations/*/accept', 503, 'POST', {
        detail: 'Storybook forced accept outage.',
      }),
      createStoryApiError('*/v1/invitations/*/ignore', 503, 'POST', {
        detail: 'Storybook forced ignore outage.',
      }),
      createStoryApiError('*/v1/invitations/blocklist', 503, 'POST', {
        detail: 'Storybook forced block outage.',
      }),
      createStoryApiError('*/v1/invitations/blocklist/*', 503, 'DELETE', {
        detail: 'Storybook forced unblock outage.',
      }),
    ],
  }),
};
