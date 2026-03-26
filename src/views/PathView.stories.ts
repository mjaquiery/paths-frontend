import type { Meta, StoryObj } from '@storybook/vue3-vite';

import PathView from './PathView.vue';
import {
  createStoryNetworkError,
  createPopulatedState,
  createStoryEntry,
  createStoryParameters,
  storyDateOffset,
} from '../storybook/storySupport';

const populatedState = createPopulatedState();
const longArchiveState = createPopulatedState();

longArchiveState.entriesByPath['daily-river'] = Array.from(
  { length: 14 },
  (_, index) =>
    createStoryEntry({
      id: `daily-archive-${index + 1}`,
      path_id: 'daily-river',
      day: storyDateOffset(-index * 6),
      edit_id: index + 1,
      content: `Archive entry ${index + 1} with enough text to show truncation in the path list.`,
    }),
);

const meta: Meta<typeof PathView> = {
  title: 'Views/PathView',
  component: PathView,
};

export default meta;

type Story = StoryObj<typeof PathView>;

export const Default: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/path/daily-river',
  }),
};

export const LongArchive: Story = {
  parameters: createStoryParameters({
    state: longArchiveState,
    route: '/path/daily-river',
  }),
};

export const Offline: Story = {
  parameters: createStoryParameters({
    state: longArchiveState,
    route: '/path/daily-river',
    networkMode: 'offline',
    seedCacheFromState: true,
    requestOverrides: [createStoryNetworkError('*/v1/*')],
  }),
};
