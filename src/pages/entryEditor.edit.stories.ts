import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { http, HttpResponse } from 'msw';

import EntryEditPage from './entry.[pathId].[entryId].edit.vue';
import {
  withLoggedInUser,
  routeLoader,
  clearLocalDraftsLoader,
} from '../../.storybook/decorators';

// Unique ids so this story's local-draft autosave (persisted to real
// IndexedDB in a browser) never collides with OTHER FILES' story drafts.
// clearLocalDraftsLoader() below additionally wipes drafts between stories
// within this same file (e.g. EditingUpdatesContent's typed text must not
// leak into ConflictShowsInlineWarning's expected initial value).
const path = {
  path_id: 'story-entry-edit-path',
  uuid: 'story-entry-edit-path-uuid',
  owner_user_id: 'user-1',
  title: 'Daily Life',
  description: null,
  color: '#5b52f0',
  is_public: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};
const entryId = 'story-entry-edit-entry';
const editUrl = `/entry/${path.path_id}/${entryId}/edit`;

const readHandlers = [
  http.get('*/v1/paths', () => HttpResponse.json([path])),
  http.get('*/v1/paths/:pathCode/entries/:entrySlug', () =>
    HttpResponse.json({
      id: entryId,
      path_id: path.path_id,
      day: '2024-03-15',
      edit_id: 1,
      content: 'Morning run along the river.',
      images: [],
    }),
  ),
  http.get('*/v1/paths/:pathCode/entries/:entrySlug/images', () =>
    HttpResponse.json([]),
  ),
];

const saveSucceedsHandler = http.put(
  '*/v1/paths/:pathCode/entries/:entrySlug',
  () =>
    HttpResponse.json({
      id: entryId,
      path_id: path.path_id,
      day: '2024-03-15',
      edit_id: 2,
      content: 'Morning run along the river. Updated.',
    }),
);

const meta: Meta<typeof EntryEditPage> = {
  title: 'Pages/Entry Editor — Edit (f-4a)',
  component: EntryEditPage,
  loaders: [routeLoader(editUrl), clearLocalDraftsLoader()],
  decorators: [
    withLoggedInUser({ token: 'tok', user_id: 'user-1', display_name: 'Alex M.' }),
  ],
  parameters: {
    msw: { handlers: [...readHandlers, saveSucceedsHandler] },
  },
};

export default meta;

type Story = StoryObj<typeof EntryEditPage>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = (await canvas.findByDisplayValue(
      'Morning run along the river.',
    )) as HTMLTextAreaElement;
    await expect(textarea).toBeInTheDocument();
    await expect(canvas.getByText('Save')).not.toBeDisabled();
  },
};

export const EditingUpdatesContent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = (await canvas.findByDisplayValue(
      'Morning run along the river.',
    )) as HTMLTextAreaElement;
    await userEvent.type(textarea, ' Updated.');
    await expect(textarea.value).toBe('Morning run along the river. Updated.');
  },
};

export const SavingSucceeds: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByDisplayValue('Morning run along the river.');
    await userEvent.click(canvas.getByText('Save'));
    await waitFor(() =>
      expect(canvas.queryByText('Saving…')).not.toBeInTheDocument(),
    );
    await expect(
      canvas.queryByText('Failed to save entry', { exact: false }),
    ).not.toBeInTheDocument();
  },
};

export const ConflictShowsInlineWarning: Story = {
  parameters: {
    msw: {
      handlers: [
        ...readHandlers,
        http.put('*/v1/paths/:pathCode/entries/:entrySlug', () =>
          HttpResponse.json({ detail: 'conflict' }, { status: 409 }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByDisplayValue('Morning run along the river.');
    await userEvent.click(canvas.getByText('Save'));
    await expect(
      await canvas.findByText('This entry was edited by someone else', {
        exact: false,
      }),
    ).toBeInTheDocument();
  },
};
