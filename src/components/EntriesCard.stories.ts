import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, within } from '@storybook/test';

import EntriesCard from './EntriesCard.vue';

const meta: Meta<typeof EntriesCard> = {
  title: 'Components/EntriesCard',
  component: EntriesCard,
  args: {
    pathId: 'AB3X7K',
    canCreateEntries: true,
  },
};

export default meta;

type Story = StoryObj<typeof EntriesCard>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('2024-03-15')).toBeInTheDocument();
  },
};

export const OpensCreateForm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // ion-button renders its actual <button> inside shadow DOM, so getByRole can't resolve
    // it — its slotted label text is in light DOM, so getByText finds the host element.
    const newEntryButton = (await canvas.findByText('New Entry')).closest(
      'ion-button',
    );
    await userEvent.click(newEntryButton!);

    await expect(
      canvas.getByText('Create').closest('ion-button'),
    ).toHaveAttribute('disabled');
    await expect(
      canvas.getByText('Cancel').closest('ion-button'),
    ).toBeInTheDocument();
  },
};
