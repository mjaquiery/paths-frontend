import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { http, HttpResponse, delay } from 'msw';

import EntryNewPage from './entry.new.vue';
import {
  withAppShell,
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
  title: 'Pages/Entry Editor — New',
  component: EntryNewPage,
  loaders: [routeLoader('/entry/new'), clearLocalDraftsLoader()],
  decorators: [
    withAppShell(),
    withLoggedInUser({
      token: 'tok',
      user_id: 'user-1',
      display_name: 'Alex M.',
    }),
  ],
  parameters: {
    msw: {
      handlers: [
        http.get('*/v1/paths', () => HttpResponse.json([path])),
        http.post('*/v1/paths/:pathCode/entries', () =>
          HttpResponse.json(
            {
              id: 'new-entry',
              path_id: path.path_id,
              day: '2024-03-15',
              edit_id: 1,
            },
            { status: 201 },
          ),
        ),
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof EntryNewPage>;

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
    await expect(
      canvas.queryByPlaceholderText('Write your entry… (markdown supported)'),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByText('bold text', { selector: 'strong' }),
    ).toBeInTheDocument();
    // The formatting toolbar buttons are hidden in preview mode so the
    // preview reads visibly differently from the write view, and the
    // toggle button itself flips to "Write".
    await expect(
      canvas.queryByRole('button', { name: 'B' }),
    ).not.toBeInTheDocument();
    await expect(canvas.queryByText('Preview')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByText('Write'));
    await expect(
      await canvas.findByPlaceholderText(
        'Write your entry… (markdown supported)',
      ),
    ).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'B' })).toBeInTheDocument();
  },
};

export const SlowServerShowsSavingState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/v1/paths', () => HttpResponse.json([path])),
        http.post('*/v1/paths/:pathCode/entries', async () => {
          await delay(5000);
          return HttpResponse.json(
            {
              id: 'new-entry',
              path_id: path.path_id,
              day: '2024-03-15',
              edit_id: 1,
            },
            { status: 201 },
          );
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = (await canvas.findByPlaceholderText(
      'Write your entry… (markdown supported)',
    )) as HTMLTextAreaElement;
    await userEvent.type(textarea, 'Morning run along the river.');
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
        http.get('*/v1/paths', () => HttpResponse.json([path])),
        http.post('*/v1/paths/:pathCode/entries', () =>
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
    const textarea = await canvas.findByPlaceholderText(
      'Write your entry… (markdown supported)',
    );
    await userEvent.type(textarea, 'Morning run along the river.');
    await userEvent.click(canvas.getByText('Save'));

    await expect(
      await canvas.findByText('Unable to create entry: Internal Server Error', {
        exact: false,
      }),
    ).toBeInTheDocument();
    await expect(canvas.getByText('Save')).not.toBeDisabled();
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
    // submit's navigation away doesn't unmount it — instead assert its own
    // post-success side effect: the local draft is cleared.
    await waitFor(() => expect(textarea.value).toBe(''));
    await expect(canvas.getByText('Save')).toBeDisabled();
  },
};

export const AddingImageShowsThumbnailAndCaptionPrompt: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Daily Life');

    await userEvent.click(canvas.getByRole('button', { name: 'Add an image' }));
    await selectFile(pixelGifFile('sunset.jpg'));

    await expect(
      await canvas.findByLabelText('Change photo sunset.jpg'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByLabelText('Remove image sunset.jpg'),
    ).toBeInTheDocument();

    // A real thumbnail — rendered from the picked File via an object URL —
    // not just the button that wraps it.
    const thumb = await canvas.findByRole('img', { name: 'sunset.jpg' });
    await expect(thumb).toHaveAttribute('src', expect.stringMatching(/^blob:/));

    // The caption field is a real, always-present, properly labelled input —
    // reachable by its accessible name, not just its placeholder — and
    // typing updates it immediately (nothing is sent anywhere for this).
    const captionInput = canvas.getByLabelText('Caption for sunset.jpg');
    await expect(captionInput).toBe(
      canvas.getByPlaceholderText('Add a caption'),
    );
    await userEvent.type(captionInput, 'Golden hour');
    await expect(captionInput).toHaveValue('Golden hour');
  },
};

export const TappingThumbnailReplacesQueuedImage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Daily Life');

    await userEvent.click(canvas.getByRole('button', { name: 'Add an image' }));
    await selectFile(pixelGifFile('sunset.jpg'));
    await userEvent.type(
      await canvas.findByPlaceholderText('Add a caption'),
      'Golden hour',
    );

    await userEvent.click(canvas.getByLabelText('Change photo sunset.jpg'));
    await selectFile(pixelGifFile('moonrise.jpg'));

    // The row now reflects the replacement file...
    await expect(
      await canvas.findByLabelText('Change photo moonrise.jpg'),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByLabelText('Change photo sunset.jpg'),
    ).not.toBeInTheDocument();
    // ...as a single row (not a second one alongside the old file)...
    await expect(canvas.getAllByRole('img')).toHaveLength(1);
    // ...keeping the caption that had already been typed in.
    await expect(canvas.getByPlaceholderText('Add a caption')).toHaveValue(
      'Golden hour',
    );
  },
};

export const PendingImageWithoutCaptionIsRemovedImmediately: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Daily Life');

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
    await canvas.findByText('Daily Life');

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

export const SavingWithImageShowsPercentProgress: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/v1/paths', () => HttpResponse.json([path])),
        http.post('*/v1/paths/:pathCode/entries', async () => {
          await delay(5000);
          return HttpResponse.json(
            {
              id: 'new-entry',
              path_id: path.path_id,
              day: '2024-03-15',
              edit_id: 1,
            },
            { status: 201 },
          );
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = (await canvas.findByPlaceholderText(
      'Write your entry… (markdown supported)',
    )) as HTMLTextAreaElement;
    await userEvent.type(textarea, 'Morning run along the river.');

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
