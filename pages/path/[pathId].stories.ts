import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, waitFor } from '@storybook/test';

import PathView from './[pathId].vue';
import {
  createStoryApiError,
  createStoryNetworkError,
  createEmptyState,
  createPopulatedState,
  createStoryEntry,
  createStoryParameters,
  storyDateOffset,
  storybookPaths,
} from '~/src/storybook/storySupport';
import { expectRoute, withinStoryDocument } from '~/src/storybook/storyTest';

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

// Empty path — no entries yet.
const emptyPathState = createEmptyState();

// Subscribed path — owned by user-bravo; current user (user-alpha) is a subscriber.
const subscribedState = createPopulatedState({
  paths: [storybookPaths.shared],
  entriesByPath: {
    [storybookPaths.shared.path_id]:
      populatedState.entriesByPath[storybookPaths.shared.path_id] ?? [],
  },
});

const meta: Meta<typeof PathView> = {
  title: 'Views/PathView',
  component: PathView,
  tags: ['smoke'],
};

export default meta;

type Story = StoryObj<typeof PathView>;

export const Default: Story = {
  tags: ['interaction'],
  parameters: createStoryParameters({
    state: populatedState,
    route: '/path/daily-river',
  }),
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      expect(
        canvasElement.querySelectorAll('.path-entry-row').length,
      ).toBeGreaterThan(0);
    });

    const firstEntry =
      canvasElement.querySelector<HTMLElement>('.path-entry-row');

    if (!firstEntry) {
      throw new Error(
        'Expected at least one entry row in the default path view.',
      );
    }

    await userEvent.click(firstEntry);
    await expectRoute('/entry/daily-river/entry-daily-today');
  },
};

export const LongArchive: Story = {
  parameters: createStoryParameters({
    state: longArchiveState,
    route: '/path/daily-river',
  }),
};

/** Path exists but has no entries — exercises the empty-state CTA branch. */
export const Empty: Story = {
  tags: ['interaction', 'a11y'],
  parameters: createStoryParameters({
    state: emptyPathState,
    route: '/path/daily-river',
    seedCacheFromState: true,
  }),
  play: async ({ canvasElement }) => {
    const page = withinStoryDocument(canvasElement);

    await expect(await page.findByText('No entries yet.')).toBeVisible();
    await expect(await page.findByText('Write first entry')).toBeVisible();
  },
};

/**
 * Path owned by another user — the current user is a subscriber.
 * No "+ Entry" button or edit actions should be visible.
 */
export const Subscribed: Story = {
  tags: ['interaction', 'edge-permissions'],
  parameters: createStoryParameters({
    state: subscribedState,
    route: '/path/family-trip',
    seedCacheFromState: true,
  }),
  play: async ({ canvasElement }) => {
    const page = withinStoryDocument(canvasElement);

    await expect(await page.findByText('Family Trip')).toBeVisible();
    await expect(page.queryByText('+ Entry')).toBeNull();
  },
};

/**
 * The path code does not match any known path — the API returns 404 and the
 * view should show an appropriate not-found message.
 */
export const PathNotFound: Story = {
  tags: ['interaction', 'edge-error'],
  parameters: createStoryParameters({
    state: populatedState,
    route: '/path/no-such-path',
    requestOverrides: [createStoryApiError('*/v1/paths', 200, 'GET', [])],
  }),
  play: async ({ canvasElement }) => {
    const page = withinStoryDocument(canvasElement);

    await expect(await page.findByText('No entries yet.')).toBeVisible();
  },
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
