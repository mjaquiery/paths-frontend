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

const secondExistingImage = {
  id: 'story-image-2',
  entry_id: entryId,
  filename: 'pier.jpg',
  caption: null,
  status: 'ready',
  content_type: 'image/jpeg',
  byte_size: 2048,
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

// A real (if tiny) transparent GIF — tests that assert on the rendered
// thumbnail <img> need actual decodable image bytes, since the object URL
// is loaded by a genuine browser <img> here (not jsdom): plain placeholder
// text would fire a real decode error and hide the thumbnail behind the
// component's error state.
const PIXEL_GIF_BASE64 =
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7';
function pixelGifFile(name: string): File {
  const binary = atob(PIXEL_GIF_BASE64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new File([bytes], name, { type: 'image/gif' });
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

    // A real thumbnail, resolved from the server (the default download-url
    // handler swaps in a placeholder image — see src/mocks/handlers.ts).
    // findByRole (not getByRole): resolving it is a network round trip.
    const thumb = await canvas.findByRole('img', { name: 'beach.jpg' });
    await expect(thumb).toHaveAttribute(
      'src',
      expect.stringMatching(/^data:image/),
    );

    await userEvent.click(canvas.getByLabelText('Remove image beach.jpg'));
    await expect(
      await screen.findByRole('alertdialog', { name: 'Remove photo' }),
    ).toBeInTheDocument();

    // Cancelling leaves the photo in place.
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await expect(
      canvas.getByLabelText('Remove image beach.jpg'),
    ).toBeInTheDocument();
    // Let the alert actually finish closing before reopening it — Ionic's
    // own dismiss lifecycle is async, and re-presenting mid-dismiss is a
    // real race, not just a test artifact.
    await waitFor(() =>
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument(),
    );

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

export const ExistingImageCaptionEditPersistsOnlyOnSave: Story = {
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
        http.put('*/v1/paths/:pathCode/entries/:entrySlug', () =>
          HttpResponse.json({
            id: entryId,
            path_id: path.path_id,
            day: '2024-03-15',
            edit_id: 3,
            content: 'Morning run along the river.',
          }),
        ),
      ),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByLabelText('Change photo beach.jpg');

    // Typing updates the field locally straight away — nothing is sent to
    // the server until Save is pressed.
    const captionInput = canvas.getByPlaceholderText('Add a caption');
    await userEvent.type(captionInput, 'Sunset over the bay');
    await expect(captionInput).toHaveValue('Sunset over the bay');

    await userEvent.click(canvas.getByText('Save'));
    await waitFor(() =>
      expect(canvas.queryByText('Saving…')).not.toBeInTheDocument(),
    );
    await expect(
      canvas.queryByText('Unable to save entry', { exact: false }),
    ).not.toBeInTheDocument();
  },
};

export const AddingNewImageShowsThumbnailAndCaptionPrompt: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByDisplayValue('Morning run along the river.');

    await userEvent.click(canvas.getByRole('button', { name: 'Add an image' }));
    await selectFile(pixelGifFile('sunset.jpg'));

    await expect(
      await canvas.findByLabelText('Change photo sunset.jpg'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByLabelText('Remove image sunset.jpg'),
    ).toBeInTheDocument();

    // A real thumbnail, rendered from the picked File via an object URL.
    const thumb = await canvas.findByRole('img', { name: 'sunset.jpg' });
    await expect(thumb).toHaveAttribute('src', expect.stringMatching(/^blob:/));

    // The caption field is reachable by its accessible name (the
    // visually-hidden <label>, not just its placeholder), and typing
    // updates it immediately.
    const captionInput = canvas.getByLabelText('Caption for sunset.jpg');
    await expect(captionInput).toBe(
      canvas.getByPlaceholderText('Add a caption'),
    );
    await userEvent.type(captionInput, 'Golden hour');
    await expect(captionInput).toHaveValue('Golden hour');
  },
};

export const TappingQueuedImageThumbnailReplacesIt: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByDisplayValue('Morning run along the river.');

    await userEvent.click(canvas.getByRole('button', { name: 'Add an image' }));
    await selectFile(pixelGifFile('sunset.jpg'));
    await userEvent.type(
      await canvas.findByPlaceholderText('Add a caption'),
      'Golden hour',
    );

    await userEvent.click(canvas.getByLabelText('Change photo sunset.jpg'));
    await selectFile(pixelGifFile('moonrise.jpg'));

    await expect(
      await canvas.findByLabelText('Change photo moonrise.jpg'),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByLabelText('Change photo sunset.jpg'),
    ).not.toBeInTheDocument();
    await expect(canvas.getByPlaceholderText('Add a caption')).toHaveValue(
      'Golden hour',
    );
  },
};

export const TappingExistingImageThumbnailQueuesAReplacement: Story = {
  parameters: {
    msw: {
      handlers: withDefaultHandlers(...entryReadHandlers([existingImage])),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByLabelText('Change photo beach.jpg');

    await userEvent.click(canvas.getByLabelText('Change photo beach.jpg'));
    await selectFile(pixelGifFile('sunset.jpg'));

    // The already-uploaded photo is replaced by a freshly queued one —
    // still just one row, not both side by side.
    await expect(
      await canvas.findByLabelText('Change photo sunset.jpg'),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByLabelText('Change photo beach.jpg'),
    ).not.toBeInTheDocument();
    await expect(canvas.getAllByRole('img')).toHaveLength(1);
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
    await expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
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
    await userEvent.type(
      await canvas.findByPlaceholderText('Add a caption'),
      'Golden hour',
    );

    await userEvent.click(canvas.getByLabelText('Remove image sunset.jpg'));
    await expect(
      await screen.findByRole('alertdialog', { name: 'Remove photo' }),
    ).toBeInTheDocument();
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

export const MultipleCaptionEditsChainEditIdThroughToSave: Story = {
  parameters: {
    msw: {
      handlers: withDefaultHandlers(
        ...entryReadHandlers([existingImage, secondExistingImage]),
        // Each caption update bumps the entry's edit_id, and the *next*
        // request (the second caption update, then the final entry save)
        // must present that new value back — this handler 409s if submit()
        // ever sends a stale one, so a chaining regression fails loudly
        // instead of silently saving with the wrong optimistic-lock value.
        http.patch('*/v1/images/:imageId', async ({ request, params }) => {
          const body = (await request.json()) as {
            caption?: string | null;
            expected_edit_id: number;
          };
          if (params.imageId === existingImage.id) {
            if (body.expected_edit_id !== 1) {
              return HttpResponse.json({ detail: 'conflict' }, { status: 409 });
            }
            return HttpResponse.json({
              edit_id: 2,
              image: { ...existingImage, caption: body.caption ?? null },
            });
          }
          if (body.expected_edit_id !== 2) {
            return HttpResponse.json({ detail: 'conflict' }, { status: 409 });
          }
          return HttpResponse.json({
            edit_id: 3,
            image: { ...secondExistingImage, caption: body.caption ?? null },
          });
        }),
        http.put(
          '*/v1/paths/:pathCode/entries/:entrySlug',
          async ({ request }) => {
            const body = await request.formData();
            if (body.get('expected_edit_id') !== '3') {
              return HttpResponse.json({ detail: 'conflict' }, { status: 409 });
            }
            return HttpResponse.json({
              id: entryId,
              path_id: path.path_id,
              day: '2024-03-15',
              edit_id: 4,
              content: 'Morning run along the river.',
            });
          },
        ),
      ),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByLabelText('Change photo beach.jpg');
    await canvas.findByLabelText('Change photo pier.jpg');

    await userEvent.type(
      canvas.getByLabelText('Caption for beach.jpg'),
      'Morning swim',
    );
    await userEvent.type(
      canvas.getByLabelText('Caption for pier.jpg'),
      'Evening walk',
    );

    await userEvent.click(canvas.getByText('Save'));

    await waitFor(() =>
      expect(canvas.queryByText('Saving…')).not.toBeInTheDocument(),
    );
    await expect(
      canvas.queryByText('A newer version of this entry exists', {
        exact: false,
      }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByText('Unable to save entry', { exact: false }),
    ).not.toBeInTheDocument();
  },
};
