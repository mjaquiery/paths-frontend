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
    // submit's router.back() doesn't unmount it — instead assert its own
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
    await selectFile(
      new File(['fake-image-bytes'], 'sunset.jpg', { type: 'image/jpeg' }),
    );

    await expect(
      await canvas.findByLabelText('Change photo sunset.jpg'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByPlaceholderText('Add a caption'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByLabelText('Remove image sunset.jpg'),
    ).toBeInTheDocument();
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
    await expect(screen.queryByText('Remove photo')).not.toBeInTheDocument();
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
