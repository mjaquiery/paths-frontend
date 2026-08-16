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

// With no `from` query (e.g. the entry URL was opened directly), Back falls
// back to the date view — centred on this entry's own day, which the entry
// already knows without needing it passed in.
export const BackFallsBackToDateViewWithNoFromQuery: Story = {
  decorators: [
    withLoggedInUser({
      token: 'tok',
      user_id: pathResponseFixture.owner_user_id,
      display_name: 'Alex M.',
    }),
  ],
  loaders: [routeLoader(entryUrl)],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Wait for the entry's own day to load — Back centres on it, so it must
    // be known before the click.
    await canvas.findByText(entryContentResponseFixture.content);
    await userEvent.click(await canvas.findByText('← Back'));
    await expect(router.currentRoute.value.fullPath).toBe(
      `/?day=${entryContentResponseFixture.day}`,
    );
  },
};

// Back must return to the path view regardless of what's piled up in browser
// history — logging in mid-browse redirects out to Google and back (see
// auth.callback.vue), which inserts history entries router.back() would
// otherwise land on instead of the page the user actually came from. The
// `from=paths` flag (not a stored URL) is enough to reconstruct the target,
// since the entry already knows its own pathId and day.
export const BackReturnsToPathViewDespiteHistoryPollution: Story = {
  decorators: [
    withLoggedInUser({
      token: 'tok',
      user_id: pathResponseFixture.owner_user_id,
      display_name: 'Alex M.',
    }),
  ],
  loaders: [
    async () => {
      // Stand in for the extra history entry a login round trip leaves
      // behind between "where the user was" and "the entry they land back
      // on" (auth.callback.vue's own page).
      await router.push('/settings');
      await router.push(`${entryUrl}?from=paths`);
      return {};
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(entryContentResponseFixture.content);
    await userEvent.click(await canvas.findByText('← Back'));
    await expect(router.currentRoute.value.fullPath).toBe(
      `/paths?pathId=${pathResponseFixture.path_id}&day=${entryContentResponseFixture.day}`,
    );
  },
};

export const PathNameLinksToPathViewCenteredOnEntryDate: Story = {
  decorators: [
    withLoggedInUser({
      token: 'tok',
      user_id: pathResponseFixture.owner_user_id,
      display_name: 'Alex M.',
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText(pathResponseFixture.title));
    await expect(router.currentRoute.value.fullPath).toBe(
      `/paths?pathId=${pathResponseFixture.path_id}&day=${entryContentResponseFixture.day}`,
    );
  },
};

export const DateLinksToThatDayInDateView: Story = {
  decorators: [
    withLoggedInUser({
      token: 'tok',
      user_id: pathResponseFixture.owner_user_id,
      display_name: 'Alex M.',
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const formattedDate = new Date(
      `${entryContentResponseFixture.day}T00:00:00`,
    ).toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    await userEvent.click(await canvas.findByText(formattedDate));
    await expect(router.currentRoute.value.fullPath).toBe(
      `/?day=${entryContentResponseFixture.day}`,
    );
  },
};

// Hopping between entries via "On this day" must not lose track of the
// original path/date view — otherwise Back would only step to the previous
// entry, and the user could end up more than one page away from where they
// started.
export const OnThisDayLinkForwardsFromParam: Story = {
  decorators: [
    withLoggedInUser({
      token: 'tok',
      user_id: pathResponseFixture.owner_user_id,
      display_name: 'Alex M.',
    }),
  ],
  parameters: {
    msw: {
      handlers: [
        http.get('*/v1/paths', () => HttpResponse.json([pathResponseFixture])),
        http.get('*/v1/paths/:pathCode/entries', () =>
          HttpResponse.json([
            entryResponseFixture,
            {
              ...entryResponseFixture,
              id: 'entry-on-this-day',
              day: '2020-03-15',
            },
          ]),
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
  loaders: [
    async () => {
      await router.push(`${entryUrl}?from=paths`);
      return {};
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText('2020'));
    await expect(router.currentRoute.value.query.from).toBe('paths');
  },
};
