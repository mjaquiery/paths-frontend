import type { Meta, StoryObj } from '@storybook/vue3';

import ExportView from './export.vue';
import {
  createStoryApiError,
  createStoryNetworkError,
  createPopulatedState,
  createStoryPath,
  createStoryParameters,
  storybookUser,
} from '../storybook/storySupport';

const populatedState = createPopulatedState();
const manyPathsState = createPopulatedState();
const noPathsState = createPopulatedState({
  paths: [],
  entriesByPath: {},
});

for (let index = 0; index < 9; index += 1) {
  manyPathsState.paths.push(
    createStoryPath({
      path_id: `export-path-${index + 1}`,
      owner_user_id: storybookUser.user_id,
      title: `Archive ${index + 1}`,
      description: `Export scenario path ${index + 1}`,
      color: [
        '#0F766E',
        '#B45309',
        '#7C2D12',
        '#1D4ED8',
        '#9D174D',
        '#166534',
        '#4338CA',
        '#0891B2',
        '#A16207',
      ][index]!,
    }),
  );
}

const meta: Meta<typeof ExportView> = {
  title: 'Views/ExportView',
  component: ExportView,
};

export default meta;

type Story = StoryObj<typeof ExportView>;

export const Default: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/export',
  }),
};

export const ManyPaths: Story = {
  parameters: createStoryParameters({
    state: manyPathsState,
    route: '/export',
  }),
};

export const NoPaths: Story = {
  parameters: createStoryParameters({
    state: noPathsState,
    route: '/export',
  }),
};

export const Offline: Story = {
  parameters: createStoryParameters({
    state: manyPathsState,
    route: '/export',
    networkMode: 'offline',
    seedCacheFromState: true,
    requestOverrides: [createStoryNetworkError('*/v1/*')],
  }),
};

/**
 * The paths API fails — the view should display an error banner while still
 * showing the rest of the export UI.
 */
export const ApiError: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/export',
    seedCacheFromState: true,
    requestOverrides: [
      createStoryApiError('*/v1/paths', 503, 'GET', {
        detail: 'Storybook forced paths outage.',
      }),
    ],
  }),
};
