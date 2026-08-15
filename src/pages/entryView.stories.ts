import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, within } from 'storybook/test';
import { http, HttpResponse } from 'msw';

import EntryViewPage from './entry.[pathId].[entryId].vue';
import {
  entryContentResponseFixture,
  entryResponseFixture,
  pathResponseFixture,
} from '../generated/fixtures';
import {
  withAppShell,
  withLoggedInUser,
  routeLoader,
} from '../../.storybook/decorators';
import { router } from '../../.storybook/router';

const entryUrl = `/entry/${pathResponseFixture.path_id}/${entryResponseFixture.id}`;

const meta: Meta<typeof EntryViewPage> = {
  title: 'Pages/Entry View',
  component: EntryViewPage,
  loaders: [routeLoader(entryUrl)],
  decorators: [withAppShell()],
  parameters: {
    msw: {
      handlers: [
        http.get('*/v1/paths', () => HttpResponse.json([pathResponseFixture])),
        http.get('*/v1/paths/:pathCode/entries', () =>
          HttpResponse.json([entryResponseFixture]),
        ),
        http.get('*/v1/paths/:pathCode/entries/:entrySlug', () =>
          HttpResponse.json(entryContentResponseFixture),
        ),
        http.get('*/v1/paths/:pathCode/entries/:entrySlug/images', () =>
          HttpResponse.json(entryContentResponseFixture.images ?? []),
        ),
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof EntryViewPage>;

// Logged in as the path's owner: sees Edit/⋯ controls.
export const AsOwner: Story = {
  decorators: [
    withLoggedInUser({
      token: 'tok',
      user_id: pathResponseFixture.owner_user_id,
      display_name: 'Alex M.',
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(entryContentResponseFixture.content),
    ).toBeInTheDocument();
    await expect(canvas.getByText('✎ Edit')).toBeInTheDocument();
  },
};

// Logged in as someone else: read-only, no Edit/⋯ controls.
export const AsReader: Story = {
  decorators: [
    withLoggedInUser({
      token: 'tok',
      user_id: 'someone-else',
      display_name: 'Guest',
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(entryContentResponseFixture.content),
    ).toBeInTheDocument();
    await expect(canvas.queryByText('✎ Edit')).not.toBeInTheDocument();
  },
};

export const EditNavigatesToEditor: Story = {
  decorators: [
    withLoggedInUser({
      token: 'tok',
      user_id: pathResponseFixture.owner_user_id,
      display_name: 'Alex M.',
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText('✎ Edit'));
    await expect(router.currentRoute.value.path).toBe(`${entryUrl}/edit`);
  },
};

export const MoreMenuOffersDelete: Story = {
  decorators: [
    withLoggedInUser({
      token: 'tok',
      user_id: pathResponseFixture.owner_user_id,
      display_name: 'Alex M.',
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByLabelText('More actions'));
    await expect(canvas.getByText('Delete entry')).toBeInTheDocument();
  },
};

export const BackNavigatesToPreviousPage: Story = {
  decorators: [
    withLoggedInUser({
      token: 'tok',
      user_id: pathResponseFixture.owner_user_id,
      display_name: 'Alex M.',
    }),
  ],
  loaders: [
    async () => {
      // Push '/' first so router.back() has a previous entry to return to.
      await router.push('/');
      await router.push(entryUrl);
      return {};
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText('← Back'));
    await expect(router.currentRoute.value.path).toBe('/');
  },
};
