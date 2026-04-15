import type { Meta, StoryObj } from '@storybook/vue3';

import EntryEditView from './edit.vue';
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
    seedCacheFromState: true,
  }),
};

export const Loading: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/missing-entry/edit',
  }),
};

/**
 * Editing an entry that already has an image — the edit draft is seeded with
 * the existing image so the chip shows in the footer tray. A new image can be
 * added on top.
 */
export const WithImageUpload: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/entry-daily-today/edit',
    seedCacheFromState: true,
    draftSeeds: [
      {
        key: 'edit:daily-river:entry-daily-today',
        content: [
          'Swam before sunrise and the river was glassy quiet.',
          '',
          '![Sunrise over the river](sunrise-river.jpg)',
          '',
          'Picked up oranges on the walk back and cooked lentil soup for dinner.',
        ].join('\n'),
        images: [
          {
            id: 'img-sunrise-river',
            draft_id: 'draft-seed-1',
            source: 'live',
            live_image_id: 'img-sunrise-river',
            filename: 'sunrise-river.jpg',
            status: 'ready',
            content_type: 'image/jpeg',
            strip_metadata: true,
            byte_size: 310_442,
            client_image_id: null,
          },
        ],
      },
    ],
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
 * An existing open draft is resumed — the editor is pre-populated with
 * content that was in progress from a previous session, different from the
 * stored entry content.
 */
export const DraftResumed: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/entry-daily-today/edit',
    seedCacheFromState: true,
    draftSeeds: [
      {
        key: 'edit:daily-river:entry-daily-today',
        content: [
          'Swam before sunrise and the river was glassy quiet.',
          '',
          '![Sunrise over the river](sunrise-river.jpg)',
          '',
          'Still working on the lentil soup paragraph — came back to finish it.',
          '',
          'The colour of the water changed around 6am, shifted from grey to a deep blue.',
        ].join('\n'),
        images: [
          {
            id: 'img-sunrise-river',
            draft_id: 'draft-seed-1',
            source: 'live',
            live_image_id: 'img-sunrise-river',
            filename: 'sunrise-river.jpg',
            status: 'ready',
            content_type: 'image/jpeg',
            strip_metadata: true,
            byte_size: 310_442,
            client_image_id: null,
          },
        ],
      },
    ],
  }),
};

/**
 * Draft init fails with a server error — the editor opens immediately with
 * the existing cached entry content and shows an inline retry note. Once
 * connectivity returns and the retry succeeds, autosave resumes normally.
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
 * The conflict resolution modal opens immediately on load — the view detects
 * that the local draft content differs from the current remote version and
 * shows both side-by-side so the user can choose which to keep.
 * A pre-seeded draft is used so the modal opens without requiring user
 * interaction.
 */
export const ConflictResolution: Story = {
  args: {
    _openConflictOnMount: true,
  },
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/entry-daily-today/edit',
    seedCacheFromState: true,
    draftSeeds: [
      {
        key: 'edit:daily-river:entry-daily-today',
        content:
          'My local edit that conflicts with the remote version from another device.',
      },
    ],
  }),
};

/**
 * Commit returns a 503 — a save error message is shown below the editor.
 * A pre-seeded draft is used so the Save button is enabled.
 */
export const SaveError: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/entry-daily-today/edit',
    seedCacheFromState: true,
    draftSeeds: [
      {
        key: 'edit:daily-river:entry-daily-today',
        content:
          'Swam before sunrise and the river was glassy quiet. Added a new paragraph.',
      },
    ],
    requestOverrides: [
      createStoryApiError('*/v1/entry-drafts/*/commit', 503, 'POST', {
        detail: 'Storybook forced save outage.',
      }),
    ],
  }),
};

/**
 * Offline mode — the editor opens with cached content and shows an offline
 * note. Draft init retries in the background when connectivity returns.
 */
export const Offline: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/entry-daily-today/edit',
    networkMode: 'offline',
    seedCacheFromState: true,
    requestOverrides: [createStoryNetworkError('*/v1/*')],
  }),
};
