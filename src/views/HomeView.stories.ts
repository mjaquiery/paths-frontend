import type { Meta, StoryObj } from '@storybook/vue3-vite';

import HomeView from './HomeView.vue';
import {
  createStoryApiError,
  createPopulatedState,
  createStoryEntry,
  createStoryNetworkError,
  createStoryPath,
  createStoryParameters,
  storyDateOffset,
  storybookUser,
} from '../storybook/storySupport';

const populatedState = createPopulatedState();
const crowdedState = createPopulatedState();

for (let index = 0; index < 6; index += 1) {
  const pathId = `home-extra-${index + 1}`;
  crowdedState.paths.push(
    createStoryPath({
      path_id: pathId,
      owner_user_id: storybookUser.user_id,
      title: `Focus ${index + 1}`,
      description: `A busy home view lane ${index + 1}`,
      color: ['#0F766E', '#B45309', '#1D4ED8', '#A21CAF', '#15803D', '#BE123C'][
        index
      ]!,
    }),
  );
  crowdedState.entriesByPath[pathId] = [
    createStoryEntry({
      id: `${pathId}-today`,
      path_id: pathId,
      day: storyDateOffset(0),
      edit_id: 1,
      content: `Today is busy in ${pathId}.`,
    }),
    createStoryEntry({
      id: `${pathId}-yesterday`,
      path_id: pathId,
      day: storyDateOffset(-1),
      edit_id: 1,
      content: `Yesterday in ${pathId}.`,
    }),
  ];
}

const meta: Meta<typeof HomeView> = {
  title: 'Views/HomeView',
  component: HomeView,
};

export default meta;

type Story = StoryObj<typeof HomeView>;

export const Default: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/',
    seedCacheFromState: true,
  }),
};

export const LoggedOut: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/',
    sessionUser: null,
    seedCacheFromState: true,
  }),
};

export const Crowded: Story = {
  parameters: createStoryParameters({
    state: crowdedState,
    route: '/',
    seedCacheFromState: true,
  }),
};

export const Offline: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/',
    networkMode: 'offline',
    seedCacheFromState: true,
    requestOverrides: [createStoryNetworkError('*/v1/*')],
  }),
};

export const PathsApiError: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/',
    requestOverrides: [
      createStoryApiError('*/v1/paths', 503, 'GET', {
        detail: 'Storybook forced paths outage.',
      }),
    ],
  }),
};
