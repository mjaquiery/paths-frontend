import type { Meta, StoryObj } from '@storybook/vue3-vite';

import DateView from './DateView.vue';
import {
  createStoryApiError,
  createStoryNetworkError,
  createEmptyState,
  createPopulatedState,
  createStoryEntry,
  createStoryPath,
  createStoryParameters,
  storyDateOffset,
  storyDateYearsAgo,
  storybookUser,
  storybookPaths,
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

// PreviousYears: add entries for the same MM-DD in prior years to exercise the
// "On this day (other years)" section in DateView.
const previousYearsState = createPopulatedState({
  entriesByPath: {
    ...createPopulatedState().entriesByPath,
    [storybookPaths.daily.path_id]: [
      createStoryEntry({
        id: 'entry-daily-today',
        path_id: storybookPaths.daily.path_id,
        day: storyDateOffset(0),
        edit_id: 41,
        content: 'Swam before sunrise. The river was glassy quiet.',
      }),
      createStoryEntry({
        id: 'entry-daily-last-year',
        path_id: storybookPaths.daily.path_id,
        day: storyDateYearsAgo(1),
        edit_id: 32,
        content: 'Same date, different weather. First daffodils opened.',
      }),
      createStoryEntry({
        id: 'entry-daily-two-years',
        path_id: storybookPaths.daily.path_id,
        day: storyDateYearsAgo(2),
        edit_id: 19,
        content:
          'Cleaned the kitchen radio and played Nina Simone all evening.',
      }),
    ],
  },
});

// EmptyDay: current user owns paths but has no entry on this specific date.
const emptyDayState = createEmptyState();

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

/**
 * No entries for this date, but owned paths exist.
 * Exercises the "Write in [Path]" / "+ Create entry" empty-state branch.
 */
export const EmptyDay: Story = {
  parameters: createStoryParameters({
    state: emptyDayState,
    route: '/date/2025-03-15',
    seedCacheFromState: true,
  }),
};

/**
 * Entries exist for the same MM-DD in prior years — exercises the
 * "✨ Previously on this day" section below the current-day entries.
 */
export const PreviousYears: Story = {
  parameters: createStoryParameters({
    state: previousYearsState,
    route: '/date/2025-03-15',
    seedCacheFromState: true,
  }),
};

/** Paths API returns an error — banner should appear at the top of the view. */
export const ApiError: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/date/2025-03-15',
    seedCacheFromState: true,
    requestOverrides: [
      createStoryApiError('*/v1/paths', 503, 'GET', {
        detail: 'Storybook forced paths outage.',
      }),
    ],
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
