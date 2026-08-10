import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, fn, screen, userEvent, waitFor } from '@storybook/test';

import PathDeleteModal from './PathDeleteModal.vue';
import { pathResponseFixture } from '../generated/fixtures';
import { modalRender } from '../../.storybook/modalRender';

// ion-modal teleports its content to document.body, so these stories query
// the global `screen` (bound to document.body) rather than canvasElement.
const meta: Meta<typeof PathDeleteModal> = {
  title: 'Components/PathDeleteModal',
  component: PathDeleteModal,
  render: modalRender(PathDeleteModal),
  args: {
    isOpen: true,
    path: pathResponseFixture,
    onDismiss: fn(),
    onDeleted: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof PathDeleteModal>;

// ion-button renders its real <button> inside shadow DOM, so getByRole can't
// resolve it — its slotted label text is in light DOM, so getByText finds
// the host element via .closest() (see the existing ExportCard story).
function deleteButton() {
  // "Delete Path" appears twice: the modal title and the confirm button —
  // find whichever match sits inside an <ion-button>.
  const match = screen
    .getAllByText('Delete Path')
    .map((el) => el.closest('ion-button'))
    .find((el): el is HTMLIonButtonElement => el !== null);
  if (!match) throw new Error('Delete Path button not found');
  return match;
}

export const Default: Story = {
  play: async () => {
    await expect(
      await screen.findByText(pathResponseFixture.title, { exact: false }),
    ).toBeInTheDocument();
    const button = deleteButton();
    await waitFor(() => expect(button).toHaveClass('hydrated'));
    await expect(button).toHaveAttribute('disabled');
  },
};

export const RequiresExactNameMatch: Story = {
  play: async () => {
    const input = await screen.findByPlaceholderText(pathResponseFixture.title);
    const button = deleteButton();
    await waitFor(() => expect(button).toHaveClass('hydrated'));
    // ion-input's native <input> accepts typing immediately, but Stencil only
    // forwards value changes to Vue's v-model once the host hydrates.
    await waitFor(() => expect(input.closest('ion-input')).toHaveClass('hydrated'));

    await userEvent.type(input, 'wrong name');
    await expect(button).toHaveAttribute('disabled');

    await userEvent.clear(input);
    await userEvent.type(input, pathResponseFixture.title);
    await waitFor(() => expect(button).not.toHaveAttribute('disabled'));
  },
};

export const ConfirmingDeletes: Story = {
  play: async ({ args }) => {
    const input = await screen.findByPlaceholderText(pathResponseFixture.title);
    const button = deleteButton();
    await waitFor(() => expect(button).toHaveClass('hydrated'));
    await waitFor(() => expect(input.closest('ion-input')).toHaveClass('hydrated'));

    await userEvent.type(input, pathResponseFixture.title);
    await waitFor(() => expect(button).not.toHaveAttribute('disabled'));
    await userEvent.click(button);

    await waitFor(() => expect(args.onDeleted).toHaveBeenCalled());
    await expect(args.onDismiss).toHaveBeenCalled();
  },
};
