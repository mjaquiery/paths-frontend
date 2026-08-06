import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, waitFor, within } from '@storybook/test';

import { pathResponseFixture } from '../generated/fixtures';
import ExportCard from './ExportCard.vue';

const meta: Meta<typeof ExportCard> = {
  title: 'Components/ExportCard',
  component: ExportCard,
  args: {
    paths: [pathResponseFixture],
  },
};

export default meta;

type Story = StoryObj<typeof ExportCard>;

export const Default: Story = {};

export const TriggersExport: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // ion-button/ion-checkbox render their real interactive elements inside shadow DOM, so
    // getByRole can't resolve them — query the custom element directly instead.
    const triggerButton = (await canvas.findByText('Trigger export')).closest(
      'ion-button',
    );
    await expect(triggerButton).toHaveAttribute('disabled');

    // Wait for Stencil hydration before clicking — Ionic web components attach their
    // internal click handling asynchronously and won't react to a pre-hydration click.
    const checkbox = canvasElement.querySelector('ion-checkbox');
    await waitFor(() => expect(checkbox).toHaveClass('hydrated'));
    await userEvent.click(checkbox!);
    await waitFor(() => expect(triggerButton).not.toHaveAttribute('disabled'));

    await userEvent.click(triggerButton!);
    await expect(
      await canvas.findByText('ready', { exact: false }),
    ).toBeInTheDocument();
  },
};
