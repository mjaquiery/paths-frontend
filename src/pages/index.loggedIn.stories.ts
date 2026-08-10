import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, within } from '@storybook/test';
import { http, HttpResponse } from 'msw';

import IndexPage from './index.vue';
import {
  entryContentResponseFixture,
  entryResponseFixture,
  pathResponseFixture,
} from '../generated/fixtures';
import { toLocalISODate } from '../utils/date';
import { withLoggedInUser, routeLoader } from '../../.storybook/decorators';
import { router } from '../../.storybook/router';

const today = toLocalISODate(new Date());

// owner_user_id must match withLoggedInUser()'s default user_id ('user-1') —
// canCreateAny (which gates "+ Write Entry") requires owning a visible path.
const ownedPath = { ...pathResponseFixture, owner_user_id: 'user-1' };

const mswHandlers = [
  http.get('*/v1/paths', () => HttpResponse.json([ownedPath])),
  http.get('*/v1/paths/:pathCode/entries', () =>
    HttpResponse.json([{ ...entryResponseFixture, day: today }]),
  ),
  http.get('*/v1/paths/:pathCode/entries/:entrySlug', () =>
    HttpResponse.json({ ...entryContentResponseFixture, day: today }),
  ),
  http.get('*/v1/paths/:pathCode/entries/:entrySlug/images', () =>
    HttpResponse.json([]),
  ),
];

const meta: Meta<typeof IndexPage> = {
  title: 'Pages/Home — Day Browser',
  component: IndexPage,
  loaders: [routeLoader('/')],
  decorators: [withLoggedInUser()],
  parameters: { msw: { handlers: mswHandlers } },
};

export default meta;

type Story = StoryObj<typeof IndexPage>;

export const FullPage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(entryContentResponseFixture.content, {
        exact: false,
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: '+ Write Entry' }),
    ).toBeInTheDocument();
  },
};

export const WriteEntryButtonNavigatesToEditor: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const writeButton = await canvas.findByRole('button', {
      name: '+ Write Entry',
    });
    await userEvent.click(writeButton);
    await expect(router.currentRoute.value.path).toBe('/entry/new');
  },
};

export const SettingsButtonNavigates: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Settings' }));
    await expect(router.currentRoute.value.path).toBe('/settings');
  },
};
