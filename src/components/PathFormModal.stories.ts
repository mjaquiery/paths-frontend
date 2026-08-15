import type { Meta, StoryObj } from '@storybook/vue3';
import {
  expect,
  fireEvent,
  fn,
  screen,
  userEvent,
  waitFor,
} from 'storybook/test';
import { http, HttpResponse } from 'msw';

import PathFormModal from './PathFormModal.vue';
import { pathResponseFixture } from '../generated/fixtures';
import { modalRender } from '../../.storybook/modalRender';
import { withDefaultHandlers } from '../../.storybook/msw';

// modalRender flips `isOpen` on next tick but doesn't wait for Ionic's async
// present() animation (ionModalDidPresent / the 'show-modal' class) to
// finish. userEvent.type's char-by-char timing is slow enough to sometimes
// land inside that window and get dropped, so wait for it before typing.
async function waitForModalPresented() {
  await waitFor(() =>
    expect(document.querySelector('ion-modal')).toHaveClass('show-modal'),
  );
}

// ion-modal renders its content via a Vue <Teleport> to document.body, not as
// a child of canvasElement — so these stories query the global `screen`
// (bound to document.body) instead of `within(canvasElement)`.
const meta: Meta<typeof PathFormModal> = {
  title: 'Pages/Create or Edit Path',
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

    await waitForModalPresented();
    const nameInput = screen.getByPlaceholderText('Path name');
    await userEvent.type(nameInput, 'Photography');
    await expect(createButton).not.toBeDisabled();

    // Clearing the title re-disables Create.
    await userEvent.clear(nameInput);
    await expect(createButton).toBeDisabled();
  },
};

// The mocked POST echoes the submitted title/color back onto the fixture it
// returns, so asserting on the onSaved payload (rather than a shared module-level
// spy across stories) proves what was actually sent, without moving-shared-state.
export const CreatingSendsTheEnteredTitleAndDefaultColour: Story = {
  parameters: {
    msw: {
      handlers: withDefaultHandlers(
        http.post('*/v1/paths', async ({ request }) => {
          const body = (await request.json()) as {
            title: string;
            color: string;
          };
          return HttpResponse.json(
            { ...pathResponseFixture, title: body.title, color: body.color },
            { status: 201 },
          );
        }),
      ),
    },
  },
  play: async ({ args }) => {
    // A single synthetic input event rather than userEvent.type's
    // char-by-char simulation — this story asserts on the exact submitted
    // title, which a dropped keystroke mid-typing would otherwise flake.
    const nameInput = await screen.findByPlaceholderText('Path name');
    await fireEvent.input(nameInput, { target: { value: 'Photography' } });
    await userEvent.click(screen.getByText('Create'));
    await waitFor(() => expect(args.onSaved).toHaveBeenCalled());

    const saved = (args.onSaved as any).mock.calls[0][0];
    expect(saved.title).toBe('Photography');
    expect(saved.color).toBe('#5b52f0'); // first swatch, selected by default
  },
};

export const ShowsAnErrorAndStaysOpenIfCreationFails: Story = {
  parameters: {
    msw: {
      handlers: withDefaultHandlers(
        http.post('*/v1/paths', () =>
          HttpResponse.json({ detail: 'Server error' }, { status: 500 }),
        ),
      ),
    },
  },
  play: async ({ args }) => {
    const nameInput = await screen.findByPlaceholderText('Path name');
    await waitForModalPresented();
    await userEvent.type(nameInput, 'Photography');
    await userEvent.click(screen.getByText('Create'));

    await expect(
      await screen.findByText('Failed to create path', { exact: false }),
    ).toBeInTheDocument();
    await expect(args.onDismiss).not.toHaveBeenCalled();
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

export const PickingAColourSwatchChangesTheSubmittedColour: Story = {
  parameters: {
    msw: {
      handlers: withDefaultHandlers(
        http.post('*/v1/paths', async ({ request }) => {
          const body = (await request.json()) as { color: string };
          return HttpResponse.json(
            { ...pathResponseFixture, color: body.color },
            { status: 201 },
          );
        }),
      ),
    },
  },
  play: async ({ args }) => {
    const nameInput = await screen.findByPlaceholderText('Path name');
    await waitForModalPresented();
    await userEvent.type(nameInput, 'Photography');
    await userEvent.click(document.querySelectorAll('.pf-swatch')[1]!); // orange
    await userEvent.click(screen.getByText('Create'));
    await waitFor(() => expect(args.onSaved).toHaveBeenCalled());

    const saved = (args.onSaved as any).mock.calls[0][0];
    expect(saved.color).toBe('#f5a623');
  },
};

export const CreatingSubmitsAndDismisses: Story = {
  play: async ({ args }) => {
    const nameInput = await screen.findByPlaceholderText('Path name');
    await waitForModalPresented();
    await userEvent.type(nameInput, 'Photography');
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
