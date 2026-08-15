import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';

import ImageLightbox from './ImageLightbox.vue';
import { imageResponseFixture } from '../generated/fixtures';
import { modalRender } from '../../.storybook/modalRender';

// ion-modal teleports its content to document.body, so these stories query
// the global `screen` (bound to document.body) rather than canvasElement.

const imageA = {
  ...imageResponseFixture,
  id: 'img-a',
  filename: 'morning-walk.jpg',
  caption: 'Sunrise over the ridge',
};
const imageB = {
  ...imageResponseFixture,
  id: 'img-b',
  filename: 'lunch.jpg',
  caption: 'Packed lunch at the summit',
};

const meta: Meta<typeof ImageLightbox> = {
  title: 'Components/ImageLightbox',
  component: ImageLightbox,
  render: modalRender(ImageLightbox),
  args: {
    isOpen: true,
    images: [imageA],
    startIndex: 0,
    day: '2024-01-01',
    onDismiss: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof ImageLightbox>;

export const Default: Story = {
  play: async () => {
    await expect(await screen.findByText(imageA.caption)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText('Download full resolution')).not.toBeDisabled(),
    );
    // A single image gets no prev/next controls.
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
  },
};

export const NoCaption: Story = {
  args: {
    images: [{ ...imageA, caption: null }],
  },
  play: async () => {
    await waitFor(() =>
      expect(screen.getByText('Download full resolution')).not.toBeDisabled(),
    );
    expect(screen.queryByText(imageA.caption)).not.toBeInTheDocument();
  },
};

export const MultipleImagesNavigate: Story = {
  args: {
    images: [imageA, imageB],
    startIndex: 0,
  },
  play: async () => {
    await expect(await screen.findByText('1 / 2')).toBeInTheDocument();
    await expect(screen.getByText(imageA.caption)).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Next image'));
    await expect(await screen.findByText('2 / 2')).toBeInTheDocument();
    await expect(screen.getByText(imageB.caption)).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Previous image'));
    await expect(await screen.findByText('1 / 2')).toBeInTheDocument();
    await expect(screen.getByText(imageA.caption)).toBeInTheDocument();
  },
};

export const CloseDismisses: Story = {
  play: async ({ args }) => {
    await userEvent.click(await screen.findByLabelText('Close'));
    await expect(args.onDismiss).toHaveBeenCalled();
  },
};
