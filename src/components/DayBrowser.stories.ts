import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';

import DayBrowser from './DayBrowser.vue';
import type { PathResponse } from '../generated/types';
import type { PathEntries } from '../composables/useMultiPathEntries';
import { toLocalISODate } from '../utils/date';
import { router } from '../../.storybook/router';

function lastYearToday(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return toLocalISODate(d);
}

const dailyLife: PathResponse = {
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

const samsTravel: PathResponse = {
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

const pathEntries: PathEntries[] = [
  {
    pathId: 'p1',
    entries: [
      {
        id: 'e1',
        path_id: 'p1',
        day: toLocalISODate(new Date()),
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
      },
      {
        id: 'e0',
        path_id: 'p1',
        day: lastYearToday(),
        edit_id: 1,
        content:
          'First day of spring last year — walked home through the park.',
        images: [],
      },
    ],
  },
  {
    pathId: 'p2',
    entries: [
      {
        id: 'e3',
        path_id: 'p2',
        day: toLocalISODate(new Date()),
        edit_id: 1,
        content: 'Arrived in Kyoto! First impressions overwhelming.',
        images: [],
      },
    ],
  },
];

const meta: Meta<typeof DayBrowser> = {
  title: 'Pages/Home — Day Browser',
  component: DayBrowser,
  args: {
    visiblePaths: [dailyLife, samsTravel],
    pathEntries,
    canCreate: true,
    currentUserId: 'user-1',
    onTogglePaths: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof DayBrowser>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Daily Life')).toBeInTheDocument();
    await expect(canvas.getByText("Sam's Travel")).toBeInTheDocument();
    // One entry per path lands on today, side by side.
    await expect(canvasElement.querySelectorAll('.db-entry')).toHaveLength(2);
    // The week strip always renders all 7 days, today selected by default.
    await expect(canvasElement.querySelectorAll('.db-week-day')).toHaveLength(
      7,
    );
    await expect(
      canvasElement.querySelector('.db-week-day--selected'),
    ).toBeInTheDocument();
    // ...and its photo renders inline.
    await expect(
      canvasElement.querySelector('.db-entry-photo'),
    ).toBeInTheDocument();
  },
};

export const MultipleEntriesFromTheSamePathOnTheSameDay: Story = {
  args: {
    visiblePaths: [dailyLife],
    pathEntries: [
      {
        pathId: 'p1',
        entries: [
          {
            id: 'e1',
            path_id: 'p1',
            day: toLocalISODate(new Date()),
            edit_id: 1,
            content: 'First entry today',
          },
          {
            id: 'e2',
            path_id: 'p1',
            day: toLocalISODate(new Date()),
            edit_id: 2,
            content: 'Second entry today',
          },
        ],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('First entry today'),
    ).toBeInTheDocument();
    await expect(canvas.getByText('Second entry today')).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll('.db-entry')).toHaveLength(2);
  },
};

export const ContentPlaceholders: Story = {
  args: {
    visiblePaths: [dailyLife],
    pathEntries: [
      {
        pathId: 'p1',
        entries: [
          {
            id: 'e1',
            path_id: 'p1',
            day: toLocalISODate(new Date()),
            edit_id: 1,
            content: undefined,
          },
          {
            id: 'e2',
            path_id: 'p1',
            day: toLocalISODate(new Date()),
            edit_id: 2,
            content: '',
          },
        ],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Undefined content (not yet loaded) shows "Fetching…"...
    await expect(await canvas.findByText('Fetching…')).toBeInTheDocument();
    // ...while an empty string (loaded, but blank) shows "(no text)".
    await expect(canvas.getByText('(no text)')).toBeInTheDocument();
    // Neither entry has images, so no photo section renders for either.
    await expect(
      canvasElement.querySelector('.db-entry-photos'),
    ).not.toBeInTheDocument();
  },
};

export const YearTabsShowOnThisDay: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    await expect(
      await canvas.findByText(String(lastYear.getFullYear())),
    ).toBeInTheDocument();
    // The year-tab preview truncates to 20 chars, so only match the prefix.
    await expect(
      canvas.getByText('First day of spring', { exact: false }),
    ).toBeInTheDocument();
  },
};

export const SelectingADayFiltersEntries: Story = {
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const entry = (
      await canvas.findByText(
        'Morning run along the river. The cherry blossoms are just starting to open.',
      )
    ).closest('.db-entry-main');
    await expect(entry).toHaveAttribute('role', 'button');
    await expect(entry).toHaveAttribute('tabindex', '0');
    await userEvent.click(entry!);
    await waitFor(() =>
      expect(router.currentRoute.value.path).toBe('/entry/p1/e1'),
    );
  },
};

export const NavigatingAnEntryWithTheKeyboard: Story = {
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

    await router.push('/');
    entry.focus();
    await userEvent.keyboard(' ');
    await waitFor(() =>
      expect(router.currentRoute.value.path).toBe('/entry/p2/e3'),
    );
  },
};

export const CreatingAnEntry: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const addButton = canvas.getByLabelText('Add entry');
    await expect(addButton).toBeInTheDocument();
    await userEvent.click(addButton);

    await waitFor(() =>
      expect(router.currentRoute.value.path).toBe('/entry/new'),
    );
    expect(router.currentRoute.value.query.day).toBe(
      toLocalISODate(new Date()),
    );
  },
};

export const TogglePathsButton: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Browse paths'));
    await expect(args.onTogglePaths).toHaveBeenCalled();
  },
};

export const NoEntriesForSelectedDay: Story = {
  args: {
    pathEntries: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('No entries yet.'),
    ).toBeInTheDocument();
  },
};
