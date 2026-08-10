import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { http, HttpResponse } from 'msw';

import EntryNewPage from './entry.new.vue';
import {
  withLoggedInUser,
  routeLoader,
  clearLocalDraftsLoader,
} from '../../.storybook/decorators';

// A unique path id per story file avoids collisions with any real IndexedDB
// local-draft autosave left over from a previous run (useLocalDraft persists
// per pathId+day, and IndexedDB survives across Storybook page reloads).
const path = {
  path_id: 'story-entry-new-path',
  uuid: 'story-entry-new-path-uuid',
  owner_user_id: 'user-1',
  title: 'Daily Life',
  description: null,
  color: '#5b52f0',
  is_public: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const meta: Meta<typeof EntryNewPage> = {
  title: 'Pages/Entry Editor — New (f-4a)',
  component: EntryNewPage,
  loaders: [routeLoader('/entry/new'), clearLocalDraftsLoader()],
  decorators: [withLoggedInUser({ token: 'tok', user_id: 'user-1', display_name: 'Alex M.' })],
  parameters: {
    msw: {
      handlers: [
        http.get('*/v1/paths', () => HttpResponse.json([path])),
        http.post('*/v1/paths/:pathCode/entries', () =>
          HttpResponse.json(
            { id: 'new-entry', path_id: path.path_id, day: '2024-03-15', edit_id: 1 },
            { status: 201 },
          ),
        ),
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof EntryNewPage>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Daily Life')).toBeInTheDocument();
    const saveButton = canvas.getByText('Save');
    await expect(saveButton).toBeDisabled();
  },
};

export const TypingContentEnablesSave: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = await canvas.findByPlaceholderText(
      'Write your entry… (markdown supported)',
    );
    await userEvent.type(textarea, 'Morning run along the river.');
    await expect(canvas.getByText('Save')).not.toBeDisabled();
  },
};

export const BoldToolbarButtonWrapsSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = (await canvas.findByPlaceholderText(
      'Write your entry… (markdown supported)',
    )) as HTMLTextAreaElement;
    await userEvent.type(textarea, 'hello');
    await userEvent.click(canvas.getByRole('button', { name: 'B' }));
    await expect(textarea.value).toBe('hello****');
  },
};

export const PreviewTogglesRenderedMarkdown: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = await canvas.findByPlaceholderText(
      'Write your entry… (markdown supported)',
    );
    await userEvent.type(textarea, '**bold text**');

    await userEvent.click(canvas.getByText('Preview'));
    await expect(canvas.queryByPlaceholderText(
      'Write your entry… (markdown supported)',
    )).not.toBeInTheDocument();
    await expect(
      canvas.getByText('bold text', { selector: 'strong' }),
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByText('Preview'));
    await expect(
      await canvas.findByPlaceholderText('Write your entry… (markdown supported)'),
    ).toBeInTheDocument();
  },
};

export const SavingCreatesTheEntry: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = (await canvas.findByPlaceholderText(
      'Write your entry… (markdown supported)',
    )) as HTMLTextAreaElement;
    await userEvent.type(textarea, 'Morning run along the river.');
    await userEvent.click(canvas.getByText('Save'));

    // The story mounts the page directly (no <router-view>), so a successful
    // submit's router.back() doesn't unmount it — instead assert its own
    // post-success side effect: the local draft is cleared.
    await waitFor(() => expect(textarea.value).toBe(''));
    await expect(canvas.getByText('Save')).toBeDisabled();
  },
};
