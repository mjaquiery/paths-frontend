import type { Meta, StoryObj } from '@storybook/vue3-vite';

import PathCreateView from './PathCreateView.vue';
import {
  createStoryApiError,
  createPopulatedState,
  createStoryParameters,
} from '../storybook/storySupport';

const populatedState = createPopulatedState();

const meta: Meta<typeof PathCreateView> = {
  title: 'Views/PathCreateView',
  component: PathCreateView,
};

export default meta;

type Story = StoryObj<typeof PathCreateView>;

/** Empty form, ready to fill in. */
export const Default: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/paths/new',
  }),
};

/** POST /v1/paths returns a server error — the form shows an inline error message. */
export const SaveError: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/paths/new',
    requestOverrides: [
      createStoryApiError('*/v1/paths', 503, 'POST', {
        detail: 'Storybook forced create-path outage.',
      }),
    ],
  }),
};

/**
 * Navigated to with a ?redirect= param (e.g. from EntryCreateView when there
 * are no owned paths).  After successful creation the user will be sent to the
 * redirect URL instead of home.
 */
export const WithRedirect: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/paths/new?redirect=/entry/new?date=2025-03-15',
  }),
};
