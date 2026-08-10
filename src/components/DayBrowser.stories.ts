import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, fn, userEvent, within } from '@storybook/test';

import DayBrowser from './DayBrowser.vue';
import type { PathResponse } from '../generated/types';
import type { PathEntries } from '../composables/useMultiPathEntries';
import { toLocalISODate } from '../utils/date';

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
        content: 'First day of spring last year — walked home through the park.',
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
  title: 'Pages/Home — Day Browser (f-2a)',
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
    // Today's cell is selected by default, and its photo renders inline.
    await expect(
      canvasElement.querySelector('.db-week-day--selected'),
    ).toBeInTheDocument();
    await expect(canvasElement.querySelector('.db-entry-photo')).toBeInTheDocument();
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
      await canvas.findByText('Arrived in Kyoto! First impressions overwhelming.'),
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
    ).closest('.db-entry');
    await expect(entry).toHaveAttribute('role', 'button');
    await expect(entry).toHaveAttribute('tabindex', '0');
    await userEvent.click(entry!);
  },
};

export const CreatingAnEntry: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const addButton = canvas.getByLabelText('Add entry');
    await expect(addButton).toBeInTheDocument();
    await userEvent.click(addButton);
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
    await expect(await canvas.findByText('No entries yet.')).toBeInTheDocument();
  },
};
