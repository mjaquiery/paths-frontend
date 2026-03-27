import type { Meta, StoryObj } from '@storybook/vue3-vite';

import EntryCreateView from './EntryCreateView.vue';
import {
  createStoryApiError,
  createStoryNetworkError,
  createPopulatedState,
  createStoryParameters,
  storybookPaths,
} from '../storybook/storySupport';

const populatedState = createPopulatedState();

const noOwnedPathsState = createPopulatedState({
  paths: [storybookPaths.shared],
});

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

/**
 * Form opened via /entry/new (no path param) — auto-selects the first owned
 * path from the cached path order.
 */
export const FilledIn: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/new?date=2025-03-15',
    seedCacheFromState: true,
  }),
};

/**
 * No owned paths — the view should redirect to /paths/new.
 * Only a subscribed (not owned) path is present.
 */
export const NoOwnedPaths: Story = {
  parameters: createStoryParameters({
    state: noOwnedPathsState,
    route: '/entry/new?date=2025-03-15',
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

export const SaveError: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/new?date=2025-03-15',
    seedCacheFromState: true,
    requestOverrides: [
      createStoryApiError('*/v1/paths/*/entries', 503, 'POST', {
        detail: 'Storybook forced save outage.',
      }),
    ],
  }),
};

export const Offline: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/new?date=2025-03-15',
    networkMode: 'offline',
    seedCacheFromState: true,
    requestOverrides: [createStoryNetworkError('*/v1/*')],
  }),
};

/**
 * Entry has been saved once (to get an ID) so the ImageUploadButton is shown.
 * Uses seedCacheFromState so the image upload API is wired up.
 */
export const WithImageUpload: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/new?date=2025-03-15',
    seedCacheFromState: true,
  }),
};
