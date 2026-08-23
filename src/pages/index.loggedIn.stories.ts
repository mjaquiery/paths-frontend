import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { http, HttpResponse } from 'msw';

import IndexPage from './index.vue';
import {
  entryContentResponseFixture,
  entryResponseFixture,
  pathResponseFixture,
} from '../generated/fixtures';
import type {
  EntryResponse,
  PathResponse,
  ImageResponse,
} from '../generated/types';
import { focusDayIndex, toLocalISODate } from '../utils/date';
import {
  withAppShell,
  withLoggedInUser,
  routeLoader,
} from '../../.storybook/decorators';
import { router } from '../../.storybook/router';
import { withDefaultHandlers } from '../../.storybook/msw';

const today = toLocalISODate(new Date());

function lastYearToday(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return toLocalISODate(d);
}

interface DayBrowserSeedEntry {
  id: string;
  path_id: string;
  day: string;
  edit_id: number;
  // undefined = the entry's content request never resolves, simulating the
  // "still fetching" state DayBrowser shows as "Fetching…".
  content: string | undefined;
  images?: ImageResponse[];
}

// Real usePaths()/useMultiPathEntries() data-fetching, mocked at the network
// layer — DayBrowser only ever renders inside this page's <ion-content> in
// the real app, so its stories exercise that real scroll host too, rather
// than mounting the bare component.
function dayBrowserHandlers(
  paths: PathResponse[],
  entries: DayBrowserSeedEntry[],
) {
  const entriesByPath = new Map<string, EntryResponse[]>(
    paths.map((p) => [p.path_id, []]),
  );
  for (const e of entries) {
    entriesByPath.get(e.path_id)?.push({
      id: e.id,
      path_id: e.path_id,
      day: e.day,
      edit_id: e.edit_id,
    });
  }
  const byId = new Map(entries.map((e) => [e.id, e]));

  return withDefaultHandlers(
    http.get('*/v1/paths', () => HttpResponse.json(paths)),
    http.get('*/v1/paths/:pathCode/entries', ({ params }) =>
      HttpResponse.json(entriesByPath.get(params.pathCode as string) ?? []),
    ),
    http.get('*/v1/paths/:pathCode/entries/:entrySlug', async ({ params }) => {
      const seed = byId.get(params.entrySlug as string)!;
      if (seed.content === undefined) await new Promise(() => {});
      return HttpResponse.json({
        id: seed.id,
        path_id: seed.path_id,
        day: seed.day,
        edit_id: seed.edit_id,
        content: seed.content,
        images: seed.images ?? [],
      });
    }),
    http.get('*/v1/paths/:pathCode/entries/:entrySlug/images', ({ params }) =>
      HttpResponse.json(byId.get(params.entrySlug as string)?.images ?? []),
    ),
  );
}

const dailyLifePath: PathResponse = {
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

const samsTravelPath: PathResponse = {
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

// Shared by every DayBrowser-behavior story below that doesn't need its own
// path/entry shape: one entry per path today, plus an on-this-day entry from
// last year on the Daily Life path.
const entryTodayDailyLife: DayBrowserSeedEntry = {
  id: 'e1',
  path_id: 'p1',
  day: today,
  edit_id: 1,
  content:
    'Morning run along the river. The cherry blossoms are just starting to open.',
  images: [
    {
      id: 'img1',
      entry_id: 'e1',
      filename: 'blossom.jpg',
      caption: null,
      status: 'ready',
      content_type: 'image/jpeg',
      byte_size: 100,
    },
  ],
};
const entryLastYearDailyLife: DayBrowserSeedEntry = {
  id: 'e0',
  path_id: 'p1',
  day: lastYearToday(),
  edit_id: 1,
  content: 'First day of spring last year — walked home through the park.',
  images: [],
};
const entryTodaySamsTravel: DayBrowserSeedEntry = {
  id: 'e3',
  path_id: 'p2',
  day: today,
  edit_id: 1,
  content: 'Arrived in Kyoto! First impressions overwhelming.',
  images: [],
};
const dayBrowserDefaultHandlers = dayBrowserHandlers(
  [dailyLifePath, samsTravelPath],
  [entryTodayDailyLife, entryLastYearDailyLife, entryTodaySamsTravel],
);

// Not uncommon in practice: a reader following several paths sees one entry
// from each on the same day.
const manyPaths: PathResponse[] = Array.from({ length: 8 }, (_, i) => ({
  path_id: `mp${i}`,
  uuid: `mu${i}`,
  owner_user_id: 'user-1',
  title: `Path ${i + 1}`,
  description: null,
  color: `hsl(${(i * 45) % 360}, 60%, 50%)`,
  is_public: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}));
const manyPathEntries: DayBrowserSeedEntry[] = manyPaths.map((path, i) => ({
  id: `me${i}`,
  path_id: path.path_id,
  day: today,
  edit_id: 1,
  content: `Entry from ${path.title}`,
  images: [],
}));

// owner_user_id must match withLoggedInUser()'s default user_id ('user-1') —
// canCreateAny (which gates "+ Write Entry") requires owning a visible path.
const ownedPath = { ...pathResponseFixture, owner_user_id: 'user-1' };

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

const meta: Meta<typeof IndexPage> = {
  title: 'Pages/Home — Day Browser',
  component: IndexPage,
  loaders: [routeLoader('/')],
  decorators: [withAppShell(), withLoggedInUser()],
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
      canvas.getByRole('link', { name: '+ Write Entry' }),
    ).toBeInTheDocument();
  },
};

export const WriteEntryButtonNavigatesToEditor: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const writeButton = await canvas.findByRole('link', {
      name: '+ Write Entry',
    });
    await userEvent.click(writeButton);
    await expect(router.currentRoute.value.path).toBe('/entry/new');
  },
};

export const SettingsButtonNavigates: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('link', { name: 'Settings' }));
    await expect(router.currentRoute.value.path).toBe('/settings');
  },
};

export const WriteEntryUsesTheSelectedDay: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Pick whichever week-day cell isn't today (the default selection).
    const weekDays = Array.from(canvasElement.querySelectorAll('.db-week-day'));
    const otherIndex = weekDays.findIndex(
      (el) => !el.classList.contains('db-week-day--selected'),
    );
    await userEvent.click(weekDays[otherIndex]!);

    // Independently derive that day's date the same way DayBrowser does —
    // a 7-day window starting focusDayIndex days before the selected day
    // (today, by default), offset by the clicked cell's index.
    const start = new Date();
    start.setDate(start.getDate() - focusDayIndex(today, today));
    const expectedDate = new Date(start);
    expectedDate.setDate(start.getDate() + otherIndex);
    const expectedDay = toLocalISODate(expectedDate);
    expect(expectedDay).not.toBe(today);

    await userEvent.click(
      await canvas.findByRole('link', { name: '+ Write Entry' }),
    );
    await waitFor(() =>
      expect(router.currentRoute.value.path).toBe('/entry/new'),
    );
    expect(router.currentRoute.value.query.day).toBe(expectedDay);
  },
};

export const MultiplePathsShowSideBySide: Story = {
  parameters: { msw: { handlers: dayBrowserDefaultHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Daily Life')).toBeInTheDocument();
    await expect(await canvas.findByText("Sam's Travel")).toBeInTheDocument();
    // One entry per path lands on today, side by side — each path's entry
    // resolves via its own network request, so wait for both.
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('.db-entry')).toHaveLength(2),
    );
    // The week strip always renders all 7 days, today selected by default.
    await expect(canvasElement.querySelectorAll('.db-week-day')).toHaveLength(
      7,
    );
    await expect(
      canvasElement.querySelector('.db-week-day--selected'),
    ).toBeInTheDocument();
    // ...and its photo renders inline.
    await waitFor(() =>
      expect(
        canvasElement.querySelector('.db-entry-photo'),
      ).toBeInTheDocument(),
    );
  },
};

export const MultipleEntriesFromTheSamePathOnTheSameDay: Story = {
  parameters: {
    msw: {
      handlers: dayBrowserHandlers(
        [dailyLifePath],
        [
          {
            id: 'e1',
            path_id: 'p1',
            day: today,
            edit_id: 1,
            content: 'First entry today',
          },
          {
            id: 'e2',
            path_id: 'p1',
            day: today,
            edit_id: 2,
            content: 'Second entry today',
          },
        ],
      ),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('First entry today'),
    ).toBeInTheDocument();
    await expect(
      await canvas.findByText('Second entry today'),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('.db-entry')).toHaveLength(2),
    );
  },
};

export const ContentPlaceholders: Story = {
  parameters: {
    msw: {
      handlers: dayBrowserHandlers(
        [dailyLifePath],
        [
          {
            id: 'e1',
            path_id: 'p1',
            day: today,
            edit_id: 1,
            content: undefined,
          },
          { id: 'e2', path_id: 'p1', day: today, edit_id: 2, content: '' },
        ],
      ),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Undefined content (not yet loaded) shows a spinner...
    await waitFor(() =>
      expect(
        canvasElement.querySelector('[data-testid="db-entry-spinner"]'),
      ).toBeInTheDocument(),
    );
    // ...while an empty string (loaded, but blank) shows "(no text)".
    await expect(await canvas.findByText('(no text)')).toBeInTheDocument();
    // Neither entry has images, so no photo section renders for either.
    await expect(
      canvasElement.querySelector('.db-entry-photos'),
    ).not.toBeInTheDocument();
  },
};

export const YearTabsShowOnThisDay: Story = {
  parameters: { msw: { handlers: dayBrowserDefaultHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    await expect(
      await canvas.findByText(String(lastYear.getFullYear())),
    ).toBeInTheDocument();
    // The year-tab preview truncates to 20 chars, so only match the prefix.
    await expect(
      await canvas.findByText('First day of spring', { exact: false }),
    ).toBeInTheDocument();
  },
};

export const SelectingADayFiltersEntries: Story = {
  parameters: { msw: { handlers: dayBrowserDefaultHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(
        'Arrived in Kyoto! First impressions overwhelming.',
      ),
    ).toBeInTheDocument();

    // Click whichever week-day cell isn't the currently-selected one (today) —
    // avoids assuming which weekday "today" falls on.
    const weekDays = Array.from(canvasElement.querySelectorAll('.db-week-day'));
    const otherDay = weekDays.find(
      (el) => !el.classList.contains('db-week-day--selected'),
    );
    await userEvent.click(otherDay!);

    await expect(
      canvas.queryByText('Arrived in Kyoto! First impressions overwhelming.'),
    ).not.toBeInTheDocument();
  },
};

export const ClickingAnEntryIsAccessible: Story = {
  parameters: { msw: { handlers: dayBrowserDefaultHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const entry = (
      await canvas.findByText(
        'Morning run along the river. The cherry blossoms are just starting to open.',
      )
    ).closest('.db-entry-main');
    await expect(entry).toHaveAttribute('href', '/entry/p1/e1');
    await userEvent.click(entry!);
    await waitFor(() =>
      expect(router.currentRoute.value.path).toBe('/entry/p1/e1'),
    );
  },
};

export const NavigatingAnEntryWithTheKeyboard: Story = {
  parameters: { msw: { handlers: dayBrowserDefaultHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const entry = (
      await canvas.findByText(
        'Arrived in Kyoto! First impressions overwhelming.',
      )
    ).closest('.db-entry-main') as HTMLElement;

    entry.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(router.currentRoute.value.path).toBe('/entry/p2/e3'),
    );
  },
};

export const ManyEntriesFromSeveralPaths: Story = {
  parameters: {
    msw: { handlers: dayBrowserHandlers(manyPaths, manyPathEntries) },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Path 1')).toBeInTheDocument();
    // Each path's entry resolves via its own network request — wait for all.
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('.db-entry')).toHaveLength(
        manyPaths.length,
      ),
    );

    // The entry list overflows a phone-height viewport, so the page's
    // ion-content (not the window) must be the thing that scrolls.
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

export const NoEntriesForSelectedDay: Story = {
  parameters: { msw: { handlers: dayBrowserHandlers([dailyLifePath], []) } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('No entries yet.'),
    ).toBeInTheDocument();
  },
};
