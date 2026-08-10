import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, fireEvent, screen, userEvent, waitFor, within } from '@storybook/test';
import { http, HttpResponse } from 'msw';

import SettingsPage from './settings.vue';
import { withLoggedInUser, routeLoader } from '../../.storybook/decorators';
import { router } from '../../.storybook/router';

const CURRENT_USER = {
  token: 'tok',
  user_id: 'user-1',
  display_name: 'Alex M.',
};

const dailyLife = {
  path_id: 'p1',
  uuid: 'u1',
  owner_user_id: 'user-1',
  title: 'Daily Life',
  description: null,
  color: '#5b52f0',
  is_public: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const samsTravel = {
  path_id: 'p2',
  uuid: 'u2',
  owner_user_id: 'user-2',
  title: "Sam's Travel",
  description: null,
  color: '#f5a623',
  is_public: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const pendingInvitation = {
  id: 'inv-1',
  path_id: 'path-x',
  path_code: 'XYZ123',
  path_title: "Maya's Cooking Journey",
  inviter_user_id: 'user-3',
  inviter_email: 'maya@example.com',
  invited_email: 'me@example.com',
  invited_user_id: null,
  status: 'invited' as const,
  created_at: '2024-03-15T09:00:00Z',
  updated_at: '2024-03-15T09:00:00Z',
};

const baseHandlers = [
  http.get('*/v1/paths', () => HttpResponse.json([dailyLife, samsTravel])),
  http.get('*/v1/paths/:pathCode/entries', () => HttpResponse.json([])),
  http.get('*/v1/invitations', () => HttpResponse.json([pendingInvitation])),
  http.get('*/v1/invitations/blocklist', () => HttpResponse.json([])),
];

const meta: Meta<typeof SettingsPage> = {
  title: 'Pages/Settings (f-6a)',
  component: SettingsPage,
  loaders: [routeLoader('/settings')],
  decorators: [withLoggedInUser(CURRENT_USER)],
  parameters: { msw: { handlers: baseHandlers } },
};

export default meta;

type Story = StoryObj<typeof SettingsPage>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Daily Life')).toBeInTheDocument();
    await expect(canvas.getByText("Sam's Travel")).toBeInTheDocument();
    await expect(canvas.getByText('shared')).toBeInTheDocument();
    await expect(canvas.getByText('Alex M.')).toBeInTheDocument();
    await expect(canvas.getByText("Maya's Cooking Journey")).toBeInTheDocument();
  },
};

export const NoPendingInvitations: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/v1/paths', () => HttpResponse.json([dailyLife])),
        http.get('*/v1/paths/:pathCode/entries', () => HttpResponse.json([])),
        http.get('*/v1/invitations', () => HttpResponse.json([])),
        http.get('*/v1/invitations/blocklist', () => HttpResponse.json([])),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('No pending invitations.'),
    ).toBeInTheDocument();
  },
};

// Uses its own path id (not shared with other stories) — toggling visibility
// persists to real IndexedDB in a browser test run, so reusing p1/p2 here
// would leak state into every other story that reads them.
export const TogglingVisibility: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/v1/paths', () =>
          HttpResponse.json([{ ...dailyLife, path_id: 'toggle-visibility-path' }]),
        ),
        http.get('*/v1/paths/:pathCode/entries', () => HttpResponse.json([])),
        http.get('*/v1/invitations', () => HttpResponse.json([])),
        http.get('*/v1/invitations/blocklist', () => HttpResponse.json([])),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = await canvas.findByRole('button', {
      name: /^(Visible|Hidden)$/,
    });
    const labelBefore = toggle.textContent?.trim();
    await userEvent.click(toggle);
    await waitFor(() =>
      expect(toggle.textContent?.trim()).not.toBe(labelBefore),
    );
  },
};

// Uses its own path ids for the same reason — reordering persists to
// localStorage, which would otherwise leak into other stories reading p1/p2.
export const ReorderingPaths: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/v1/paths', () =>
          HttpResponse.json([
            { ...dailyLife, path_id: 'reorder-path-a', title: 'Path A' },
            { ...samsTravel, path_id: 'reorder-path-b', title: 'Path B' },
          ]),
        ),
        http.get('*/v1/paths/:pathCode/entries', () => HttpResponse.json([])),
        http.get('*/v1/invitations', () => HttpResponse.json([])),
        http.get('*/v1/invitations/blocklist', () => HttpResponse.json([])),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Path A');
    const titlesBefore = Array.from(
      canvasElement.querySelectorAll('.path-row-title'),
    ).map((el) => el.textContent?.trim());
    expect(titlesBefore[0]).toContain('Path A');

    await userEvent.click(canvas.getAllByLabelText('Move path down')[0]!);

    await waitFor(() => {
      const titlesAfter = Array.from(
        canvasElement.querySelectorAll('.path-row-title'),
      ).map((el) => el.textContent?.trim());
      expect(titlesAfter[0]).toContain('Path B');
    });
  },
};

// PathFormModal/PathShareModal/PathDeleteModal all wrap their content in
// <ion-modal>, which teleports it to document.body via Vue's <Teleport> —
// once opened, their content is no longer inside canvasElement, so these
// assertions query the global `screen` (bound to document.body) instead.

export const CreateNewPathOpensForm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText('+ Create new path'));
    await expect(await screen.findByText('New Path')).toBeInTheDocument();
  },
};

export const EditPathOpensForm: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByLabelText('Edit path'));
    await expect(await screen.findByText('Edit Path')).toBeInTheDocument();
    await expect(screen.getByDisplayValue('Daily Life')).toBeInTheDocument();
  },
};

export const SharePathOpensSubscriberManager: Story = {
  parameters: {
    msw: {
      handlers: [
        ...baseHandlers,
        http.get('*/v1/paths/:pathCode/subscriptions', () =>
          HttpResponse.json([]),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByLabelText('Share path'));
    await expect(
      await screen.findByText('Share "Daily Life"'),
    ).toBeInTheDocument();
  },
};

export const DeletePathRequiresTypingTitle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByLabelText('Delete path'));

    // "Delete Path" appears twice (title + confirm button) — pick the button.
    const deleteButton = (
      await screen.findAllByText('Delete Path')
    )
      .map((el) => el.closest('ion-button'))
      .find((el): el is HTMLIonButtonElement => el !== null)!;
    await waitFor(() => expect(deleteButton).toHaveClass('hydrated'));
    await expect(deleteButton).toHaveAttribute('disabled');

    const input = screen.getByPlaceholderText(
      'Daily Life',
    ) as HTMLInputElement;
    await waitFor(() => expect(input.closest('ion-input')).toHaveClass('hydrated'));
    // A single synthetic input event, not userEvent.type's char-by-char
    // simulation — each keystroke round-trips through Stencil back down to
    // this native <input> as a controlled value, and re-typing into the
    // (possibly-replaced) element mid-sequence drops all but the first key.
    fireEvent.input(input, { target: { value: 'Daily Life' } });
    await waitFor(() => expect(deleteButton).not.toHaveAttribute('disabled'));
  },
};

export const UnsubscribeFromSharedPath: Story = {
  parameters: {
    msw: {
      handlers: [
        ...baseHandlers,
        http.delete(
          '*/v1/paths/:pathCode/subscriptions/:targetUserId',
          () => new HttpResponse(null, { status: 204 }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const unsubscribeButton = await canvas.findByText('Unsubscribe');
    await userEvent.click(unsubscribeButton);
    await waitFor(() =>
      expect(canvas.queryByText('Leaving…')).not.toBeInTheDocument(),
    );
  },
};

export const AcceptingAnInvitation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText('✓ Accept'));
    await waitFor(() =>
      expect(canvas.queryByText('Accepting…')).not.toBeInTheDocument(),
    );
  },
};

export const IgnoringAnInvitation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText('Ignore'));
    // The mocked GET /v1/invitations is stateless (always returns the same
    // "invited" invitation), so assert the busy state resolves rather than
    // asserting the item disappears from the refetched list.
    await waitFor(() =>
      expect(canvas.queryByText('Ignoring…')).not.toBeInTheDocument(),
    );
  },
};

export const ExpandingExportSection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText('📤 Export all data'));
    await expect(canvas.getByText('Trigger export')).toBeInTheDocument();
  },
};

export const ExpandingDeleteAccountSection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByText('🗑️ Delete account & all data'),
    );
    await expect(
      canvas.getByText('please contact support', { exact: false }),
    ).toBeInTheDocument();
  },
};

export const LogoutReturnsHome: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Logout'));
    await expect(router.currentRoute.value.path).toBe('/');
    expect(localStorage.getItem('user')).toBeNull();
  },
};
