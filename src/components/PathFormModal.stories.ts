import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, fn, screen, userEvent, waitFor } from '@storybook/test';

import PathFormModal from './PathFormModal.vue';
import { pathResponseFixture } from '../generated/fixtures';
import { modalRender } from '../../.storybook/modalRender';

// ion-modal renders its content via a Vue <Teleport> to document.body, not as
// a child of canvasElement — so these stories query the global `screen`
// (bound to document.body) instead of `within(canvasElement)`.
const meta: Meta<typeof PathFormModal> = {
  title: 'Pages/Create or Edit Path (f-5a)',
  component: PathFormModal,
  render: modalRender(PathFormModal),
  args: {
    isOpen: true,
    path: null,
    onDismiss: fn(),
    onSaved: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof PathFormModal>;

export const NewPath: Story = {
  play: async () => {
    await expect(await screen.findByText('New Path')).toBeInTheDocument();
    const createButton = screen.getByText('Create');
    await expect(createButton).toBeDisabled();

    await userEvent.type(screen.getByPlaceholderText('Path name'), 'Photography');
    await expect(createButton).not.toBeDisabled();
  },
};

export const PickingAColourSwatch: Story = {
  play: async () => {
    await screen.findByText('New Path');
    const swatches = document.querySelectorAll('.pf-swatch');
    await expect(swatches).toHaveLength(8);
    await expect(swatches[0]).toHaveClass('pf-swatch--selected');

    await userEvent.click(swatches[1]!);
    await expect(swatches[1]).toHaveClass('pf-swatch--selected');
    await expect(swatches[0]).not.toHaveClass('pf-swatch--selected');
  },
};

export const CreatingSubmitsAndDismisses: Story = {
  play: async ({ args }) => {
    await userEvent.type(
      await screen.findByPlaceholderText('Path name'),
      'Photography',
    );
    await userEvent.click(screen.getByText('Create'));
    // save() awaits the mocked POST before emitting — give it a tick.
    await waitFor(() => expect(args.onSaved).toHaveBeenCalled());
    await expect(args.onDismiss).toHaveBeenCalled();
  },
};

export const EditPath: Story = {
  args: {
    path: pathResponseFixture,
  },
  play: async () => {
    await expect(await screen.findByText('Edit Path')).toBeInTheDocument();
    await expect(
      screen.getByDisplayValue(pathResponseFixture.title),
    ).toBeInTheDocument();
    await expect(screen.getByText('Save')).toBeInTheDocument();
  },
};

export const CancelDismissesWithoutSaving: Story = {
  play: async ({ args }) => {
    await userEvent.click(await screen.findByText('Cancel'));
    await expect(args.onDismiss).toHaveBeenCalled();
    await expect(args.onSaved).not.toHaveBeenCalled();
  },
};
