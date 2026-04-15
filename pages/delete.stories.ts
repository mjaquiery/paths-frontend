import type { Meta, StoryObj } from '@storybook/vue3';

import DeleteView from './delete.vue';
import {
  createStoryApiError,
  createPopulatedState,
  createStoryParameters,
} from '../storybook/storySupport';

const meta: Meta<typeof DeleteView> = {
  title: 'Views/DeleteView',
  component: DeleteView,
};

export default meta;

type Story = StoryObj<typeof DeleteView>;

export const Default: Story = {
  parameters: createStoryParameters({
    state: createPopulatedState(),
    route: '/delete',
  }),
};

/**
 * A deletion request already exists and is in the 'requested' state — the view
 * should show the existing-request status card instead of the confirmation form.
 */
export const DeletionPending: Story = {
  parameters: createStoryParameters({
    state: createPopulatedState({
      deletionRequest: { state: 'requested' },
    }),
    route: '/delete',
  }),
};

/**
 * A previous deletion request failed — the view should show the error message
 * and allow the user to try again (confirmation form still visible).
 */
export const DeletionError: Story = {
  parameters: createStoryParameters({
    state: createPopulatedState({
      deletionRequest: {
        state: 'failed',
        error_message: 'Account deletion failed: downstream service timed out.',
      },
    }),
    route: '/delete',
  }),
};

/**
 * The user is not logged in — the confirmation target will be empty and the
 * button will be disabled.
 */
export const LoggedOut: Story = {
  parameters: createStoryParameters({
    state: createPopulatedState(),
    route: '/delete',
    sessionUser: null,
    requestOverrides: [
      createStoryApiError('*/v1/account/deletion-requests/latest', 404, 'GET', {
        detail: 'No deletion request found.',
      }),
    ],
  }),
};
