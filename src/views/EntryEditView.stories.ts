import type { Meta, StoryObj } from '@storybook/vue3-vite';

import EntryEditView from './EntryEditView.vue';
import {
  createPopulatedState,
  createStoryEntry,
  createStoryParameters,
  createStoryApiError,
  createStoryNetworkError,
  storybookPaths,
} from '../storybook/storySupport';

const populatedState = createPopulatedState();

const manyImagesState = createPopulatedState({
  entriesByPath: {
    ...createPopulatedState().entriesByPath,
    [storybookPaths.daily.path_id]: [
      createStoryEntry({
        id: 'entry-daily-today',
        path_id: storybookPaths.daily.path_id,
        day: '2025-03-15',
        edit_id: 41,
        content: [
          'Swam before sunrise and wrote until the kettle hissed.',
          '',
          '![Mooring rope at dawn](sunrise-river.jpg)',
          '',
          'The rest of the photos are waiting below for captions.',
        ].join('\n'),
        images: [
          'sunrise-river.jpg',
          'lantern-window.jpg',
          'kitchen-notes.jpg',
          'market-pears.jpg',
          'bridge-fog.jpg',
          'river-map.jpg',
          'tea-cup.jpg',
          'wet-boots.jpg',
          'boat-shed.jpg',
        ].map((filename, index) => ({
          id: `img-many-${index + 1}`,
          entry_id: 'entry-daily-today',
          filename,
          status: 'ready',
          strip_metadata: true,
          content_type: 'image/jpeg',
          byte_size: 200_000 + index,
        })),
      }),
      ...(
        createPopulatedState().entriesByPath[storybookPaths.daily.path_id] ?? []
      ).filter((record) => record.summary.id !== 'entry-daily-today'),
    ],
  },
});

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

export const WithManyImages: Story = {
  parameters: createStoryParameters({
    state: manyImagesState,
    route: '/entry/daily-river/entry-daily-today/edit',
    seedCacheFromState: true,
  }),
};

/**
 * Draft init fails with a 409 (stale edit_id) — the view shows the
 * "edited on another device" message instead of the editor.
 */
export const DraftInitConflict: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/entry-daily-today/edit',
    seedCacheFromState: true,
    requestOverrides: [
      createStoryApiError('*/v1/paths/*/entries/*/draft', 409, 'GET', {
        detail: 'Edit ID mismatch.',
      }),
    ],
  }),
};

/**
 * Draft init fails with a server error — the view shows a generic error
 * message instead of the editor.
 */
export const DraftInitError: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/entry-daily-today/edit',
    seedCacheFromState: true,
    requestOverrides: [
      createStoryApiError('*/v1/paths/*/entries/*/draft', 503, 'GET', {
        detail: 'Storybook forced draft outage.',
      }),
    ],
  }),
};

/**
 * Commit returns 409 — the conflict resolution modal is shown so the user
 * can choose between their local version and the current remote version.
 */
export const ConflictResolution: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/entry-daily-today/edit',
    seedCacheFromState: true,
    requestOverrides: [
      createStoryApiError('*/v1/entry-drafts/*/commit', 409, 'POST', {
        detail: 'Edit ID mismatch.',
      }),
    ],
  }),
};

/**
 * Commit returns a 503 — a save error message is shown below the editor.
 */
export const SaveError: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/entry-daily-today/edit',
    seedCacheFromState: true,
    requestOverrides: [
      createStoryApiError('*/v1/entry-drafts/*/commit', 503, 'POST', {
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
