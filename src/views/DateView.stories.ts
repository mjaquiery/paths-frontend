import type { Meta, StoryObj } from '@storybook/vue3-vite';

import DateView from './DateView.vue';
import {
  createStoryNetworkError,
  createPopulatedState,
  createStoryEntry,
  createStoryPath,
  createStoryParameters,
  storyDateOffset,
  storybookUser,
} from '../storybook/storySupport';

const populatedState = createPopulatedState();
const crowdedState = createPopulatedState();

for (let index = 0; index < 7; index += 1) {
  const pathId = `crowded-path-${index + 1}`;
  crowdedState.paths.push(
    createStoryPath({
      path_id: pathId,
      owner_user_id: storybookUser.user_id,
      title: `Project ${index + 1}`,
      description: `Extra path ${index + 1} for dense date coverage.`,
      color: [
        '#0F766E',
        '#C2410C',
        '#7C3AED',
        '#BE123C',
        '#2563EB',
        '#4D7C0F',
        '#9333EA',
      ][index]!,
    }),
  );
  crowdedState.entriesByPath[pathId] = [
    createStoryEntry({
      id: `entry-${pathId}-today`,
      path_id: pathId,
      day: storyDateOffset(0),
      edit_id: index + 1,
      content: `Dense calendar coverage for ${pathId}.`,
    }),
  ];
}

const meta: Meta<typeof DateView> = {
  title: 'Views/DateView',
  component: DateView,
};

export default meta;

type Story = StoryObj<typeof DateView>;

export const Default: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/date/2025-03-15',
  }),
};

export const CrowdedDay: Story = {
  parameters: createStoryParameters({
    state: crowdedState,
    route: '/date/2025-03-15',
  }),
};

export const Offline: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/date/2025-03-15',
    networkMode: 'offline',
    seedCacheFromState: true,
    requestOverrides: [createStoryNetworkError('*/v1/*')],
  }),
};
