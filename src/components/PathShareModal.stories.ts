import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, fn, screen, userEvent, waitFor } from '@storybook/test';

import PathShareModal from './PathShareModal.vue';
import { pathResponseFixture, subscriberResponseFixture } from '../generated/fixtures';
import { modalRender } from '../../.storybook/modalRender';

// ion-modal teleports its content to document.body, so these stories query
// the global `screen` (bound to document.body) rather than canvasElement.
const meta: Meta<typeof PathShareModal> = {
  title: 'Components/PathShareModal',
  component: PathShareModal,
  render: modalRender(PathShareModal),
  args: {
    isOpen: true,
    path: pathResponseFixture,
    onDismiss: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof PathShareModal>;

export const Default: Story = {
  play: async () => {
    await expect(
      await screen.findByText(`Share "${pathResponseFixture.title}"`),
    ).toBeInTheDocument();
    // Existing subscriber list loads from the mocked API.
    await expect(
      await screen.findByText(subscriberResponseFixture.display_name!, {
        exact: false,
      }),
    ).toBeInTheDocument();
  },
};

export const InvitingASubscriber: Story = {
  play: async () => {
    const emailInput = await screen.findByPlaceholderText(
      'Email address to invite',
    );
    await userEvent.type(emailInput, 'friend@example.com');

    // ion-button renders its real <button> inside shadow DOM, so getByRole
    // can't resolve it — its slotted label text is in light DOM, so getByText
    // finds the host element via .closest(). Wait for Stencil hydration
    // before clicking, same as the existing ExportCard story.
    const inviteButton = screen.getByText('Invite').closest('ion-button')!;
    await waitFor(() => expect(inviteButton).toHaveClass('hydrated'));
    await waitFor(() => expect(inviteButton).not.toHaveAttribute('disabled'));
    await userEvent.click(inviteButton);

    await expect(
      await screen.findByText('Invitation sent successfully.'),
    ).toBeInTheDocument();
  },
};

export const CloseDismisses: Story = {
  play: async ({ args }) => {
    await userEvent.click(await screen.findByText('Close'));
    await expect(args.onDismiss).toHaveBeenCalled();
  },
};
