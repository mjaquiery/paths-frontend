import type { Meta, StoryObj } from '@storybook/vue3-vite';

import EntryEditView from './EntryEditView.vue';
import {
  createPopulatedState,
  createStoryParameters,
  createStoryApiError,
  createStoryNetworkError,
} from '../storybook/storySupport';

const populatedState = createPopulatedState();

const meta: Meta<typeof EntryEditView> = {
  title: 'Views/EntryEditView',
  component: EntryEditView,
};

export default meta;

type Story = StoryObj<typeof EntryEditView>;

export const Default: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/entry-daily-today/edit',
  }),
};

export const Loading: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/missing-entry/edit',
  }),
};

export const WithImageUpload: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/entry-daily-today/edit',
    seedCacheFromState: true,
  }),
};

export const SaveError409: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/entry-daily-today/edit',
    seedCacheFromState: true,
    requestOverrides: [
      createStoryApiError('*/v1/paths/*/entries/*', 409, 'PUT', {
        detail: 'Edit ID mismatch.',
      }),
    ],
  }),
};

export const SaveError: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/entry-daily-today/edit',
    seedCacheFromState: true,
    requestOverrides: [
      createStoryApiError('*/v1/paths/*/entries/*', 503, 'PUT', {
        detail: 'Storybook forced save outage.',
      }),
    ],
  }),
};

export const Offline: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/entry-daily-today/edit',
    networkMode: 'offline',
    seedCacheFromState: true,
    requestOverrides: [createStoryNetworkError('*/v1/*')],
  }),
};
