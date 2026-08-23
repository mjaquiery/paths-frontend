import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import PathBrowser from './PathBrowser.vue';
import type { PathResponse } from '../generated/types';
import type {
  EntryWithContent,
  PathEntries,
} from '../composables/useMultiPathEntries';
import { toLocalISODate } from '../utils/date';
import { router } from '../../.storybook/router';

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

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toLocalISODate(d);
}

const p1Entries: EntryWithContent[] = [
  {
    id: 'e1',
    path_id: 'p1',
    day: daysAgo(0),
    edit_id: 1,
    content: 'Today entry',
    images: [],
    inWindow: true,
  },
  {
    id: 'e2',
    path_id: 'p1',
    day: daysAgo(3),
    edit_id: 1,
    content: 'A few days ago',
    inWindow: true,
    images: [
      {
        id: 'img1',
        entry_id: 'e2',
        filename: 'photo.jpg',
        caption: null,
        status: 'ready',
        content_type: 'image/jpeg',
        byte_size: 100,
      },
    ],
  },
  {
    id: 'e3',
    path_id: 'p1',
    day: daysAgo(10),
    edit_id: 1,
    content: 'Ten days ago',
    images: [],
    inWindow: true,
  },
];

function pathEntriesFor(
  pathId: string,
  entries: EntryWithContent[],
): PathEntries {
  return {
    pathId,
    entries,
    isListLoading: false,
    hasMore: false,
    remainingCount: 0,
  };
}

const meta: Meta<typeof PathBrowser> = {
  title: 'Components/PathBrowser',
  component: PathBrowser,
  args: {
    paths: [dailyLife, samsTravel],
    selectedPathIds: ['p1'],
    pathEntries: [pathEntriesFor('p1', p1Entries)],
  },
};

export default meta;

type Story = StoryObj<typeof PathBrowser>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Today entry')).toBeInTheDocument();
    // Most recent entry first.
    const previews = canvasElement.querySelectorAll('.pb-entry-preview');
    await expect(previews[0]).toHaveTextContent('Today entry');
    await expect(previews[2]).toHaveTextContent('Ten days ago');
    await expect(
      canvasElement.querySelector('.pb-entry-photo'),
    ).toBeInTheDocument();
    // Only one path selected — no path badge clutters each row.
    await expect(
      canvasElement.querySelector('.pb-entry-path'),
    ).not.toBeInTheDocument();
  },
};

export const TogglingAPathEmitsUpdate: Story = {
  args: { 'onUpdate:selectedPathIds': fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: "Sam's Travel" });
    await userEvent.click(toggle);
    await waitFor(() =>
      expect(args['onUpdate:selectedPathIds']).toHaveBeenCalledWith([
        'p1',
        'p2',
      ]),
    );
  },
};

export const ClickingAnEntryIsAccessible: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const entry = (await canvas.findByText('Today entry')).closest(
      '.pb-entry-main',
    );
    await expect(entry).toHaveAttribute('href', '/entry/p1/e1?from=paths');
    await userEvent.click(entry!);
    await waitFor(() =>
      expect(router.currentRoute.value.path).toBe('/entry/p1/e1'),
    );
  },
};

export const NavigatingAnEntryWithTheKeyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const entry = (await canvas.findByText('A few days ago')).closest(
      '.pb-entry-main',
    ) as HTMLElement;
    entry.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(router.currentRoute.value.path).toBe('/entry/p1/e2'),
    );
  },
};

export const NoEntriesForSelectedPath: Story = {
  args: { pathEntries: [pathEntriesFor('p1', [])] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('No entries yet.'),
    ).toBeInTheDocument();
  },
};

// A deleted path (or a stale/bad link) — distinct from a real path that
// simply has no entries yet.
export const PathNotFound: Story = {
  args: {
    selectedPathIds: ['deleted-path'],
    pathEntries: [],
    notFoundPathIds: ['deleted-path'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(
        "This path couldn't be found. It may have been deleted.",
      ),
    ).toBeInTheDocument();
    await expect(canvas.queryByText('No entries yet.')).not.toBeInTheDocument();
  },
};

// The expected case for this component — a followed path can easily
// accumulate dozens of posts, unlike Day Browser's one-per-day-per-path.
export const ManyEntries: Story = {
  args: {
    pathEntries: [
      pathEntriesFor(
        'p1',
        Array.from({ length: 30 }, (_, i) => ({
          id: `me${i}`,
          path_id: 'p1',
          day: daysAgo(i),
          edit_id: 1,
          content: `Entry ${i}`,
          images: [],
          inWindow: true,
        })),
      ),
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('Entry 0')).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll('.pb-entry')).toHaveLength(30);
    // Most recent (smallest daysAgo) first.
    await expect(
      canvasElement.querySelector('.pb-entry-preview'),
    ).toHaveTextContent('Entry 0');
  },
};

// Multiple paths selected at once: entries from every selected path merge
// into one feed ordered by overall recency, each row tagged with its path.
export const MultiplePathsMergedByDate: Story = {
  args: {
    selectedPathIds: ['p1', 'p2'],
    pathEntries: [
      pathEntriesFor('p1', p1Entries),
      pathEntriesFor('p2', [
        {
          id: 'f1',
          path_id: 'p2',
          day: daysAgo(1),
          edit_id: 1,
          content: 'Landed in Tokyo',
          images: [],
          inWindow: true,
        },
      ]),
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Merged in date order across paths, not grouped by path.
    const previews = canvasElement.querySelectorAll('.pb-entry-preview');
    await expect(previews[0]).toHaveTextContent('Today entry');
    await expect(previews[1]).toHaveTextContent('Landed in Tokyo');
    await expect(previews[2]).toHaveTextContent('A few days ago');
    // Each entry is tagged with the path it belongs to.
    await expect(await canvas.findByText("· Sam's Travel")).toBeInTheDocument();
    await expect(await canvas.findAllByText('· Daily Life')).toHaveLength(3);
  },
};

// ion-content clips its slotted children to a fixed-height scroll box, so this
// decorator stands in for it — the real regression only shows up once the
// header shares a scroll container with the entries below it.
export const HeaderStaysVisibleWhileScrolling: Story = {
  args: {
    pathEntries: [
      pathEntriesFor(
        'p1',
        Array.from({ length: 30 }, (_, i) => ({
          id: `me${i}`,
          path_id: 'p1',
          day: daysAgo(i),
          edit_id: 1,
          content: `Entry ${i}`,
          images: [],
          inWindow: true,
        })),
      ),
    ],
  },
  decorators: [
    () => ({
      template:
        '<div style="height: 300px; overflow-y: auto;" data-testid="scroll-box"><story /></div>',
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scrollBox = canvasElement.querySelector<HTMLElement>(
      '[data-testid="scroll-box"]',
    )!;
    const header = canvasElement.querySelector<HTMLElement>('.pb-header')!;

    const topBefore = header.getBoundingClientRect().top;
    const firstEntry = await canvas.findByText('Entry 0');
    const scrollBoxTop = scrollBox.getBoundingClientRect().top;
    await expect(firstEntry.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      scrollBoxTop,
    );

    scrollBox.scrollTop = 400;
    await waitFor(() => expect(scrollBox.scrollTop).toBeGreaterThan(0));

    // The header stays pinned to the top of the scroll box...
    await expect(header.getBoundingClientRect().top).toBe(topBefore);
    // ...while the entry that was visible before scrolling is now scrolled
    // above the scroll box's visible area.
    await expect(firstEntry.getBoundingClientRect().bottom).toBeLessThan(
      scrollBoxTop,
    );
  },
};
