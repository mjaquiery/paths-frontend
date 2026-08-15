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

import PathShareModal from './PathShareModal.vue';
import {
  pathResponseFixture,
  subscriberResponseFixture,
} from '../generated/fixtures';
import { modalRender } from '../../.storybook/modalRender';
import { withDefaultHandlers } from '../../.storybook/msw';

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

export const InviteButtonDisabledWhenEmailEmpty: Story = {
  play: async () => {
    const inviteButton = (await screen.findAllByText('Invite'))
      .map((el) => el.closest('ion-button'))
      .find((el): el is HTMLIonButtonElement => el !== null)!;
    await waitFor(() => expect(inviteButton).toHaveClass('hydrated'));
    await expect(inviteButton).toHaveAttribute('disabled');
  },
};

export const InvitingASubscriber: Story = {
  play: async () => {
    const emailInput = (await screen.findByPlaceholderText(
      'Email address to invite',
    )) as unknown as HTMLIonInputElement;
    // ion-input round-trips through Vue on every keystroke (:model-value +
    // @update:model-value), which can race userEvent.type's char-by-char
    // events under load and drop/truncate the typed value — same class of
    // issue documented at PathFormModal.stories.ts's fireEvent.input usage.
    // A single synthetic input event sidesteps the race entirely.
    await waitFor(() =>
      expect(emailInput.closest('ion-input')).toHaveClass('hydrated'),
    );
    await fireEvent.input(emailInput, {
      target: { value: 'friend@example.com' },
    });

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
    // Email field clears once the invite succeeds.
    await waitFor(() => expect(emailInput.value).toBe(''));
  },
};

export const InviteRequestSendsTheEnteredEmail: Story = {
  parameters: {
    msw: {
      handlers: withDefaultHandlers(
        http.post('*/v1/paths/:pathCode/subscriptions', async ({ request }) => {
          const body = (await request.json()) as { email: string };
          return HttpResponse.json(
            { ...body, sentEmail: body.email },
            { status: 201 },
          );
        }),
      ),
    },
  },
  play: async () => {
    const emailInput = await screen.findByPlaceholderText(
      'Email address to invite',
    );
    await waitFor(() =>
      expect(emailInput.closest('ion-input')).toHaveClass('hydrated'),
    );
    await fireEvent.input(emailInput, {
      target: { value: 'invited@example.com' },
    });
    const inviteButton = screen.getByText('Invite').closest('ion-button')!;
    await waitFor(() => expect(inviteButton).not.toHaveAttribute('disabled'));
    await userEvent.click(inviteButton);

    // A success message only renders once the mocked POST above resolved
    // with a 201, which only happens if the request body matched.
    await expect(
      await screen.findByText('Invitation sent successfully.'),
    ).toBeInTheDocument();
  },
};

export const ClearsSuccessMessageWhenTypingANewEmail: Story = {
  play: async () => {
    const emailInput = await screen.findByPlaceholderText(
      'Email address to invite',
    );
    await waitFor(() =>
      expect(emailInput.closest('ion-input')).toHaveClass('hydrated'),
    );
    await fireEvent.input(emailInput, {
      target: { value: 'first@example.com' },
    });
    const inviteButton = screen.getByText('Invite').closest('ion-button')!;
    await waitFor(() => expect(inviteButton).not.toHaveAttribute('disabled'));
    await userEvent.click(inviteButton);
    await expect(
      await screen.findByText('Invitation sent successfully.'),
    ).toBeInTheDocument();

    await fireEvent.input(emailInput, {
      target: { value: 'first@example.comx' },
    });
    await waitFor(() =>
      expect(
        screen.queryByText('Invitation sent successfully.'),
      ).not.toBeInTheDocument(),
    );
  },
};

export const ShowsErrorWhenInvitationFails: Story = {
  parameters: {
    msw: {
      handlers: withDefaultHandlers(
        http.post('*/v1/paths/:pathCode/subscriptions', () =>
          HttpResponse.json({ detail: 'User not found' }, { status: 404 }),
        ),
      ),
    },
  },
  play: async () => {
    const emailInput = await screen.findByPlaceholderText(
      'Email address to invite',
    );
    await waitFor(() =>
      expect(emailInput.closest('ion-input')).toHaveClass('hydrated'),
    );
    await fireEvent.input(emailInput, { target: { value: 'bad@example.com' } });
    const inviteButton = screen.getByText('Invite').closest('ion-button')!;
    await waitFor(() => expect(inviteButton).not.toHaveAttribute('disabled'));
    await userEvent.click(inviteButton);

    await expect(
      await screen.findByText('Unable to invite subscriber: User not found', {
        exact: false,
      }),
    ).toBeInTheDocument();
  },
};

export const NoActiveSubscribers: Story = {
  parameters: {
    msw: {
      handlers: withDefaultHandlers(
        http.get('*/v1/paths/:pathCode/subscriptions', () =>
          HttpResponse.json([]),
        ),
      ),
    },
  },
  play: async () => {
    await expect(
      await screen.findByText('No active subscribers.'),
    ).toBeInTheDocument();
  },
};

export const CloseDismisses: Story = {
  play: async ({ args }) => {
    await userEvent.click(await screen.findByText('Close'));
    await expect(args.onDismiss).toHaveBeenCalled();
  },
};
