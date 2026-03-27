import type { Meta, StoryObj } from '@storybook/vue3-vite';

import EntryView from './EntryView.vue';
import {
  createPopulatedState,
  createStoryEntry,
  createStoryParameters,
  storybookPaths,
} from '../storybook/storySupport';

const populatedState = createPopulatedState();

// EmptyEntry: entry exists but content is an empty string.
const emptyEntryState = createPopulatedState({
  entriesByPath: {
    ...createPopulatedState().entriesByPath,
    [storybookPaths.daily.path_id]: [
      createStoryEntry({
        id: 'entry-daily-empty',
        path_id: storybookPaths.daily.path_id,
        day: '2025-03-15',
        edit_id: 1,
        content: '',
      }),
    ],
  },
});

// Subscribed: the entry belongs to a path owned by another user.
const subscribedState = createPopulatedState({
  paths: [storybookPaths.shared],
  entriesByPath: {
    [storybookPaths.shared.path_id]:
      createPopulatedState().entriesByPath[storybookPaths.shared.path_id] ?? [],
  },
});

const meta: Meta<typeof EntryView> = {
  title: 'Views/EntryView',
  component: EntryView,
};

export default meta;

type Story = StoryObj<typeof EntryView>;

export const Default: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/entry-daily-today',
  }),
};

/** Entry with an attached image — exercises the MarkdownContent images prop. */
export const EntryWithImages: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/entry-daily-today',
    seedCacheFromState: true,
  }),
};

/**
 * Entry exists but its content is an empty string — shows the "(no text)"
 * placeholder branch.
 */
export const EmptyEntry: Story = {
  parameters: createStoryParameters({
    state: emptyEntryState,
    route: '/entry/daily-river/entry-daily-empty',
    seedCacheFromState: true,
  }),
};

/**
 * The entry data has not yet loaded — the API response is pending and nothing
 * has been seeded into the cache, so the view shows "Loading…".
 */
export const LoadingEntry: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/missing-entry',
  }),
};

/**
 * Entry for a path owned by another user — the current user is a subscriber.
 * Edit and Delete buttons should not be visible.
 */
export const Subscribed: Story = {
  parameters: createStoryParameters({
    state: subscribedState,
    route: '/entry/family-trip/entry-shared-yesterday',
    seedCacheFromState: true,
  }),
};

/**
 * Entries for the same MM-DD in prior years exist on the path — exercises the
 * "✨ On this day (other years)" section.
 */
export const PreviousYears: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/entry-daily-today',
    seedCacheFromState: true,
  }),
};
