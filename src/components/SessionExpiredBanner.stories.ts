import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, fn, userEvent, within } from 'storybook/test';

import SessionExpiredBanner from './SessionExpiredBanner.vue';

const meta: Meta<typeof SessionExpiredBanner> = {
  title: 'Components/SessionExpiredBanner',
  component: SessionExpiredBanner,
  args: {
    visible: true,
    onLogin: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof SessionExpiredBanner>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Session expired — tap to log in'),
    ).toBeInTheDocument();
  },
};

export const TapEmitsLogin: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(args.onLogin).toHaveBeenCalled();
  },
};

export const Hidden: Story = {
  args: { visible: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByText('Session expired — tap to log in'),
    ).not.toBeInTheDocument();
  },
};
