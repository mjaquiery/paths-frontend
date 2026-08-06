import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, within } from '@storybook/test';

import PathBrowserCard from './PathBrowserCard.vue';

const meta: Meta<typeof PathBrowserCard> = {
  title: 'Components/PathBrowserCard',
  component: PathBrowserCard,
};

export default meta;

type Story = StoryObj<typeof PathBrowserCard>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('Recovery Journal'),
    ).toBeInTheDocument();
  },
};

export const OpensCreateForm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // ion-button renders its actual <button> inside shadow DOM, so getByRole can't resolve
    // it — its slotted label text is in light DOM, so getByText finds the host element.
    const newPathButton = (await canvas.findByText('New Path')).closest(
      'ion-button',
    );
    await userEvent.click(newPathButton!);

    await expect(canvas.getByPlaceholderText('Path title')).toBeInTheDocument();
    await expect(
      canvas.getByText('Create').closest('ion-button'),
    ).toHaveAttribute('disabled');
  },
};
