import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { http, HttpResponse, delay } from 'msw';

import EntryEditPage from './entry.[pathId].[entryId].edit.vue';
import {
  withAppShell,
  withLoggedInUser,
  routeLoader,
  clearLocalDraftsLoader,
} from '../../.storybook/decorators';
import { db } from '../lib/db';

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

const existingImage = {
  id: 'story-image-1',
  entry_id: entryId,
  filename: 'beach.jpg',
  caption: null,
  status: 'ready',
  content_type: 'image/jpeg',
  byte_size: 1024,
};

function entryReadHandlers(images: unknown[] = []) {
  return [
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
      HttpResponse.json(images),
    ),
  ];
}

const readHandlers = entryReadHandlers();

// pickImages() falls back to a plain <input type="file"> appended to
// document.body and clicked (see useImagePicker.ts) — there's no real OS
// file dialog to drive in a headless test, so simulate the pick by grabbing
// that transient input directly and dispatching a change via userEvent.upload.
async function selectFile(file: File) {
  const fileInput = document.body.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement;
  await userEvent.upload(fileInput, file);
}

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
  title: 'Pages/Entry Editor — Edit',
  component: EntryEditPage,
  loaders: [routeLoader(editUrl), clearLocalDraftsLoader()],
  decorators: [
    withAppShell(),
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
    // useLocalDraft's autosave write is debounced (500ms) and, by design,
    // isn't cancelled on unmount (so a quick navigate-away still saves) —
    // wait for it to land here so it can't race SavingSucceeds' (the next
    // story's) clearLocalDraftsLoader()/restore() cycle on the same draft key.
    await waitFor(async () => {
      const draft = await db.localDrafts.get(`${path.path_id}:entry:${entryId}`);
      expect(draft?.content).toBe('Morning run along the river. Updated.');
    });
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

export const SlowServerShowsSavingState: Story = {
  parameters: {
    msw: {
      handlers: [
        ...readHandlers,
        http.put('*/v1/paths/:pathCode/entries/:entrySlug', async () => {
          await delay(5000);
          return HttpResponse.json({
            id: entryId,
            path_id: path.path_id,
            day: '2024-03-15',
            edit_id: 2,
            content: 'Morning run along the river. Updated.',
          });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByDisplayValue('Morning run along the river.');
    const saveButton = canvas.getByText('Save');
    await userEvent.click(saveButton);

    await expect(
      await canvas.findByText('Saving…', { selector: '.pill-btn' }),
    ).toBeInTheDocument();
    await expect(saveButton).toBeDisabled();
    // The SavingOverlay shows the same label inside its own ion-modal, so
    // it's checked separately (via the testid) rather than by text alone.
    await expect(await screen.findByTestId('saving-overlay')).toBeInTheDocument();

    await waitFor(
      () =>
        expect(
          canvas.queryByText('Saving…', { selector: '.pill-btn' }),
        ).not.toBeInTheDocument(),
      { timeout: 8000 },
    );
    await expect(screen.queryByTestId('saving-overlay')).not.toBeInTheDocument();
  },
};

export const ServerErrorShowsInlineMessage: Story = {
  parameters: {
    msw: {
      handlers: [
        ...readHandlers,
        http.put('*/v1/paths/:pathCode/entries/:entrySlug', () =>
          HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByDisplayValue('Morning run along the river.');
    await userEvent.click(canvas.getByText('Save'));

    await expect(
      await canvas.findByText('Failed to save entry', { exact: false }),
    ).toBeInTheDocument();
    await expect(canvas.getByText('Save')).not.toBeDisabled();
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
      await canvas.findByText('A newer version of this entry exists', {
        exact: false,
      }),
    ).toBeInTheDocument();
  },
};

export const ExistingImageCanBeRemovedAndRestored: Story = {
  parameters: {
    msw: { handlers: entryReadHandlers([existingImage]) },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('beach.jpg')).toBeInTheDocument();

    await userEvent.click(canvas.getByLabelText('Remove image beach.jpg'));
    const removedItem = canvas.getByText('beach.jpg').closest('.existing-image-item');
    await expect(removedItem).toHaveClass('existing-image-item--removed');
    await expect(
      canvas.queryByLabelText('Remove image beach.jpg'),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByLabelText('Restore image beach.jpg'));
    const restoredItem = canvas.getByText('beach.jpg').closest('.existing-image-item');
    await expect(restoredItem).not.toHaveClass('existing-image-item--removed');
    await expect(
      canvas.getByLabelText('Remove image beach.jpg'),
    ).toBeInTheDocument();
  },
};

export const AddingNewImageShowsInPhotoStrip: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByDisplayValue('Morning run along the river.');

    await userEvent.click(canvas.getByText('+'));
    await selectFile(
      new File(['fake-image-bytes'], 'sunset.jpg', { type: 'image/jpeg' }),
    );

    await expect(await canvas.findByText('sunset.jpg')).toBeInTheDocument();
    await expect(
      canvas.getByPlaceholderText('Caption'),
    ).toBeInTheDocument();
  },
};

export const SavingWithImageChangesShowsPercentProgress: Story = {
  parameters: {
    msw: {
      handlers: [
        ...entryReadHandlers([existingImage]),
        http.put('*/v1/paths/:pathCode/entries/:entrySlug', async () => {
          await delay(5000);
          return HttpResponse.json({
            id: entryId,
            path_id: path.path_id,
            day: '2024-03-15',
            edit_id: 2,
            content: 'Morning run along the river.',
          });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByDisplayValue('Morning run along the river.');
    await canvas.findByText('beach.jpg');

    // Remove the existing image and add a new one, so the save request
    // carries a real multipart upload (drives the % progress label).
    await userEvent.click(canvas.getByLabelText('Remove image beach.jpg'));
    await userEvent.click(canvas.getByText('+'));
    await selectFile(
      new File(['fake-image-bytes'], 'sunset.jpg', { type: 'image/jpeg' }),
    );

    const saveButton = canvas.getByText('Save');
    await userEvent.click(saveButton);

    // Real xhr.upload progress events aren't reliably delivered through MSW's
    // service-worker interception in this test environment, so this only
    // asserts the label switches to the percent format for image-bearing
    // saves (vs plain "Saving…" for saves with no images) rather than
    // asserting any particular progress value.
    await expect(
      await canvas.findByText('Saving… 0%', { selector: '.pill-btn' }),
    ).toBeInTheDocument();
    await expect(await screen.findByTestId('saving-overlay')).toBeInTheDocument();

    await waitFor(
      () =>
        expect(
          canvas.queryByText('Saving…', { exact: false, selector: '.pill-btn' }),
        ).not.toBeInTheDocument(),
      { timeout: 8000 },
    );
  },
};
