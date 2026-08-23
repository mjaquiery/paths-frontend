import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { http, HttpResponse } from 'msw';

import PathsPage from './paths.vue';
import {
  entryContentResponseFixture,
  entryResponseFixture,
  pathResponseFixture,
} from '../generated/fixtures';
import { toLocalISODate } from '../utils/date';
import {
  withAppShell,
  withLoggedInUser,
  routeLoader,
} from '../../.storybook/decorators';
import { router } from '../../.storybook/router';
import { withDefaultHandlers } from '../../.storybook/msw';

const today = toLocalISODate(new Date());

// owner_user_id must match withLoggedInUser()'s default user_id ('user-1') —
// canCreateAny (which gates "+ Write Entry") requires owning a visible path.
const ownedPath = { ...pathResponseFixture, owner_user_id: 'user-1' };

const secondPath = {
  ...pathResponseFixture,
  path_id: 'p2',
  uuid: 'u2',
  title: "Sam's Travel",
  color: '#f5a623',
  owner_user_id: 'user-2',
  is_public: true,
};

const mswHandlers = withDefaultHandlers(
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
);

const meta: Meta<typeof PathsPage> = {
  title: 'Pages/Path Browser',
  component: PathsPage,
  loaders: [routeLoader('/paths')],
  decorators: [withAppShell(), withLoggedInUser()],
  parameters: { msw: { handlers: mswHandlers } },
};

export default meta;

type Story = StoryObj<typeof PathsPage>;

export const FullPage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(entryContentResponseFixture.content, {
        exact: false,
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: ownedPath.title }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', { name: '+ Write Entry' }),
    ).toBeInTheDocument();
  },
};

export const WriteEntryCarriesPathAndDay: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const writeButton = await canvas.findByRole('link', {
      name: '+ Write Entry',
    });
    await userEvent.click(writeButton);
    await waitFor(() =>
      expect(router.currentRoute.value.path).toBe('/entry/new'),
    );
    expect(router.currentRoute.value.query.day).toBe(today);
    expect(router.currentRoute.value.query.pathId).toBe(ownedPath.path_id);
  },
};

// A deleted path (or a stale/bad link) linked to directly — e.g. from a
// path label on an entry whose path no longer exists — should say so
// clearly rather than silently looking like an empty path.
export const PathNotFound: Story = {
  loaders: [routeLoader('/paths?pathId=deleted-path')],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(
        "This path couldn't be found. It may have been deleted.",
        { exact: false },
      ),
    ).toBeInTheDocument();
  },
};

// With no ?pathId in the URL, every visible path is shown at once and their
// entries merge into a single feed ordered by overall recency — not grouped
// per path — with each row tagged by which path it came from.
export const MultiplePathsMergedByDate: Story = {
  parameters: {
    msw: {
      handlers: withDefaultHandlers(
        http.get('*/v1/paths', () =>
          HttpResponse.json([ownedPath, secondPath]),
        ),
        http.get('*/v1/paths/:pathCode/entries', ({ params }) =>
          HttpResponse.json([
            {
              ...entryResponseFixture,
              id: `${params.pathCode}-e1`,
              path_id: params.pathCode as string,
              day: today,
            },
          ]),
        ),
        http.get('*/v1/paths/:pathCode/entries/:entrySlug', ({ params }) =>
          HttpResponse.json({
            ...entryContentResponseFixture,
            id: params.entrySlug as string,
            path_id: params.pathCode as string,
            day: today,
            content:
              params.pathCode === secondPath.path_id
                ? 'Landed in Tokyo'
                : 'Wrote in my journal',
          }),
        ),
        http.get('*/v1/paths/:pathCode/entries/:entrySlug/images', () =>
          HttpResponse.json([]),
        ),
      ),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: ownedPath.title }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: secondPath.title }),
    ).toBeInTheDocument();
    await expect(
      await canvas.findByText('Wrote in my journal', { exact: false }),
    ).toBeInTheDocument();
    await expect(
      await canvas.findByText('Landed in Tokyo', { exact: false }),
    ).toBeInTheDocument();
    // More than one path selected — each row is tagged with its own path.
    await expect(
      await canvas.findByText(`· ${secondPath.title}`),
    ).toBeInTheDocument();
  },
};

export const CalendarIconNavigatesToDayBrowser: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Browse days'));
    await waitFor(() => expect(router.currentRoute.value.path).toBe('/'));
  },
};

// A followed path can easily accumulate dozens of posts, unlike Day
// Browser's one-per-day-per-path — the entry list overflows a phone-height
// viewport, so the page's ion-content (not the window) must scroll.
export const ManyEntriesInOnePath: Story = {
  parameters: {
    msw: {
      handlers: withDefaultHandlers(
        http.get('*/v1/paths', () => HttpResponse.json([ownedPath])),
        http.get('*/v1/paths/:pathCode/entries', () =>
          HttpResponse.json(
            Array.from({ length: 30 }, (_, i) => {
              const day = new Date();
              day.setDate(day.getDate() - i);
              return {
                ...entryResponseFixture,
                id: `many-${i}`,
                day: toLocalISODate(day),
              };
            }),
          ),
        ),
        http.get('*/v1/paths/:pathCode/entries/:entrySlug', () =>
          HttpResponse.json({ ...entryContentResponseFixture, day: today }),
        ),
        http.get('*/v1/paths/:pathCode/entries/:entrySlug/images', () =>
          HttpResponse.json([]),
        ),
      ),
    },
  },
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('.pb-entry')).toHaveLength(30),
    );

    const content = canvasElement.querySelector(
      'ion-content',
    ) as HTMLIonContentElement;
    await waitFor(() => expect(content).toHaveClass('hydrated'));
    const scroller = await content.getScrollElement();
    await expect(scroller.clientHeight).toBeGreaterThan(0);
    await expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);

    scroller.scrollTop = scroller.scrollHeight;
    await waitFor(() => expect(scroller.scrollTop).toBeGreaterThan(0));
  },
};
