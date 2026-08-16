import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, fn, screen, waitFor } from 'storybook/test';

import SessionExpiredModal from './SessionExpiredModal.vue';
import { modalRender } from '../../.storybook/modalRender';

// ion-modal teleports its content to document.body, so these stories query
// the global `screen` (bound to document.body) rather than canvasElement.

const meta: Meta<typeof SessionExpiredModal> = {
  title: 'Components/SessionExpiredModal',
  component: SessionExpiredModal,
  render: modalRender(SessionExpiredModal),
  args: {
    isOpen: true,
    onDismiss: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof SessionExpiredModal>;

export const Default: Story = {
  play: async () => {
    await expect(
      await screen.findByText('Session expired'),
    ).toBeInTheDocument();
    const button = await screen.findByText('Continue with Google');
    await waitFor(() => expect(button).toBeInTheDocument());
  },
};
