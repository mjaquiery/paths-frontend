import type { Meta, StoryObj } from '@storybook/vue3-vite';

import EntryCreateView from './EntryCreateView.vue';
import {
  createStoryApiError,
  createPopulatedState,
  createStoryParameters,
} from '../storybook/storySupport';

const populatedState = createPopulatedState();

const meta: Meta<typeof EntryCreateView> = {
  title: 'Views/EntryCreateView',
  component: EntryCreateView,
};

export default meta;

type Story = StoryObj<typeof EntryCreateView>;

export const Default: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/new?date=2025-03-15',
  }),
};

export const PathsApiError: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/new?date=2025-03-15',
    requestOverrides: [
      createStoryApiError('*/v1/paths', 503, 'GET', {
        detail: 'Storybook forced paths outage.',
      }),
    ],
  }),
};
