import type { Meta, StoryObj } from '@storybook/vue3-vite';

import EntryCreateView from './EntryCreateView.vue';
import {
  createStoryApiError,
  createStoryNetworkError,
  createPopulatedState,
  createStoryParameters,
  storybookPaths,
  storyDateOffset,
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

/**
 * Draft init fails — the GET draft endpoint returns a server error so the
 * view shows the draftInitError message instead of the editor.
 */
export const DraftInitError: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/new?date=2025-03-15',
    requestOverrides: [
      createStoryApiError(`*/v1/paths/*/entries/drafts`, 503, 'GET', {
        detail: 'Storybook forced draft outage.',
      }),
    ],
  }),
};

/**
 * The user has typed content and clicks Save — the commit endpoint returns a
 * server error so the save-error message is shown below the editor.
 */
export const SaveError: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/new?date=2025-03-15',
    seedCacheFromState: true,
    requestOverrides: [
      createStoryApiError(`*/v1/entry-drafts/*/commit`, 503, 'POST', {
        detail: 'Storybook forced save outage.',
      }),
    ],
  }),
};

/**
 * An existing open draft is resumed — the editor is pre-populated with the
 * draft content that was previously saved (simulated via a GET that returns
 * content). The user can continue editing and save.
 *
 * In Storybook the draft store always starts empty, so this story instead
 * demonstrates the normal editing flow after a draft is created.
 */
export const DraftResumed: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: `/entry/daily-river/new?date=${storyDateOffset(0)}`,
    seedCacheFromState: true,
  }),
};

/**
 * Image in uploading state — demonstrated by adding an image immediately
 * after the draft is created. The PUT to storage is delayed so the chip
 * shows the loading overlay.
 */
export const WithImageUpload: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/new?date=2025-03-15',
    seedCacheFromState: true,
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
