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
import { withDefaultHandlers } from '../../.storybook/msw';
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

const readHandlers = withDefaultHandlers(...entryReadHandlers());

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
    withLoggedInUser({
      token: 'tok',
      user_id: 'user-1',
      display_name: 'Alex M.',
    }),
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
      const draft = await db.localDrafts.get(
        `${path.path_id}:entry:${entryId}`,
      );
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
      canvas.queryByText('Unable to save entry', { exact: false }),
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
    await expect(
      await screen.findByTestId('saving-overlay'),
    ).toBeInTheDocument();

    await waitFor(
      () =>
        expect(
          canvas.queryByText('Saving…', { selector: '.pill-btn' }),
        ).not.toBeInTheDocument(),
      { timeout: 8000 },
    );
    await expect(
      screen.queryByTestId('saving-overlay'),
    ).not.toBeInTheDocument();
  },
};

export const ServerErrorShowsInlineMessage: Story = {
  parameters: {
    msw: {
      handlers: [
        ...readHandlers,
        http.put('*/v1/paths/:pathCode/entries/:entrySlug', () =>
          HttpResponse.json(
            { detail: 'Internal Server Error' },
            { status: 500 },
          ),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByDisplayValue('Morning run along the river.');
    await userEvent.click(canvas.getByText('Save'));

    await expect(
      await canvas.findByText('Unable to save entry: Internal Server Error', {
        exact: false,
      }),
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

export const ExistingImageRequiresConfirmationToRemove: Story = {
  parameters: {
    msw: {
      handlers: withDefaultHandlers(...entryReadHandlers([existingImage])),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByLabelText('Change photo beach.jpg'),
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByLabelText('Remove image beach.jpg'));
    await expect(await screen.findByText('Remove photo')).toBeInTheDocument();

    // Cancelling leaves the photo in place.
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await expect(
      canvas.getByLabelText('Remove image beach.jpg'),
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByLabelText('Remove image beach.jpg'));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Remove' }),
    );
    await waitFor(() =>
      expect(
        canvas.queryByLabelText('Remove image beach.jpg'),
      ).not.toBeInTheDocument(),
    );
  },
};

export const ExistingImageCaptionCanBeEditedByTapping: Story = {
  parameters: {
    msw: {
      handlers: withDefaultHandlers(
        ...entryReadHandlers([existingImage]),
        http.patch('*/v1/images/:imageId', () =>
          HttpResponse.json({
            edit_id: 2,
            image: { ...existingImage, caption: 'Sunset over the bay' },
          }),
        ),
      ),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByLabelText('Change photo beach.jpg');

    await userEvent.click(canvas.getByText('Add a caption'));
    await userEvent.type(
      canvas.getByPlaceholderText('Add a caption'),
      'Sunset over the bay',
    );
    await userEvent.tab();

    await expect(
      await canvas.findByText('Sunset over the bay'),
    ).toBeInTheDocument();
  },
};

export const AddingNewImageShowsThumbnailAndCaptionPrompt: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByDisplayValue('Morning run along the river.');

    await userEvent.click(canvas.getByRole('button', { name: 'Add an image' }));
    await selectFile(
      new File(['fake-image-bytes'], 'sunset.jpg', { type: 'image/jpeg' }),
    );

    await expect(
      await canvas.findByLabelText('Change photo sunset.jpg'),
    ).toBeInTheDocument();
    await expect(canvas.getByText('Add a caption')).toBeInTheDocument();
    await expect(
      canvas.getByLabelText('Remove image sunset.jpg'),
    ).toBeInTheDocument();
  },
};

export const PendingImageWithoutCaptionIsRemovedImmediately: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByDisplayValue('Morning run along the river.');

    await userEvent.click(canvas.getByRole('button', { name: 'Add an image' }));
    await selectFile(
      new File(['fake-image-bytes'], 'sunset.jpg', { type: 'image/jpeg' }),
    );
    await canvas.findByLabelText('Change photo sunset.jpg');

    await userEvent.click(canvas.getByLabelText('Remove image sunset.jpg'));
    await expect(
      canvas.queryByLabelText('Remove image sunset.jpg'),
    ).not.toBeInTheDocument();
    await expect(screen.queryByText('Remove photo')).not.toBeInTheDocument();
  },
};

export const PendingImageWithCaptionRequiresConfirmationToRemove: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByDisplayValue('Morning run along the river.');

    await userEvent.click(canvas.getByRole('button', { name: 'Add an image' }));
    await selectFile(
      new File(['fake-image-bytes'], 'sunset.jpg', { type: 'image/jpeg' }),
    );
    await userEvent.click(await canvas.findByText('Add a caption'));
    await userEvent.type(
      canvas.getByPlaceholderText('Add a caption'),
      'Golden hour',
    );
    await userEvent.tab();

    await userEvent.click(canvas.getByLabelText('Remove image sunset.jpg'));
    await expect(await screen.findByText('Remove photo')).toBeInTheDocument();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Remove' }),
    );

    await waitFor(() =>
      expect(
        canvas.queryByLabelText('Remove image sunset.jpg'),
      ).not.toBeInTheDocument(),
    );
  },
};

export const SavingWithImageChangesShowsPercentProgress: Story = {
  parameters: {
    msw: {
      handlers: withDefaultHandlers(
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
      ),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByDisplayValue('Morning run along the river.');
    await canvas.findByLabelText('Change photo beach.jpg');

    // Remove the existing image (confirming, since it's already uploaded)
    // and add a new one, so the save request carries a real multipart
    // upload (drives the % progress label).
    await userEvent.click(canvas.getByLabelText('Remove image beach.jpg'));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Remove' }),
    );
    await waitFor(() =>
      expect(
        canvas.queryByLabelText('Remove image beach.jpg'),
      ).not.toBeInTheDocument(),
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Add an image' }));
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
    await expect(
      await screen.findByTestId('saving-overlay'),
    ).toBeInTheDocument();

    await waitFor(
      () =>
        expect(
          canvas.queryByText('Saving…', {
            exact: false,
            selector: '.pill-btn',
          }),
        ).not.toBeInTheDocument(),
      { timeout: 8000 },
    );
  },
};
