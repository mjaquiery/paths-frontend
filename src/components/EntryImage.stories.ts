import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, waitFor, within } from 'storybook/test';
import { http, HttpResponse, delay } from 'msw';

import EntryImage from './EntryImage.vue';
import { imageDownloadResponseFixture } from '../generated/fixtures';

const meta: Meta<typeof EntryImage> = {
  title: 'Components/EntryImage',
  component: EntryImage,
  args: {
    imageId: 'img-1',
    alt: 'A photo from the entry',
  },
};

export default meta;

type Story = StoryObj<typeof EntryImage>;

export const Loaded: Story = {
  // The global default handler swaps in a placeholder image (see
  // src/mocks/handlers.ts) since the fixture's real URL doesn't resolve in
  // tests — override it here so this story can assert against the real,
  // un-swapped fixture URLs.
  parameters: {
    msw: {
      handlers: [
        http.get('*/v1/images/:imageId/download-url', () =>
          HttpResponse.json(imageDownloadResponseFixture),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = await canvas.findByAltText('A photo from the entry');
    await expect(img).toHaveAttribute(
      'src',
      imageDownloadResponseFixture.thumbnail_url,
    );
    await expect(img.closest('a')).toHaveAttribute(
      'href',
      imageDownloadResponseFixture.image_url,
    );
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/v1/images/:imageId/download-url', async () => {
          await delay('infinite');
          return HttpResponse.json(imageDownloadResponseFixture);
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByLabelText('Loading image'),
    ).toBeInTheDocument();
  },
};

export const Errored: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/v1/images/:imageId/download-url', () =>
          HttpResponse.json({ detail: 'Not found' }, { status: 404 }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    // customFetch throws a generic "Request failed: 404" (no parsed detail
    // message), so assert on the error placeholder itself rather than exact text.
    await waitFor(() => {
      const el = canvasElement.querySelector('.entry-image-placeholder--error');
      expect(el).toBeInTheDocument();
    });
    expect(canvasElement.querySelector('img')).not.toBeInTheDocument();
  },
};
