/**
 * Tests for DayBrowser multi-path and multi-entry rendering.
 *
 * DayBrowser receives already-resolved PathEntries data via props, so these
 * tests focus on the computed rendering logic for the *selected* day (today,
 * by default): entries from multiple paths on the same day are shown
 * side-by-side, multiple entries from the same path on the same day all
 * appear, and entries with images show photo thumbnails.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount } from '@vue/test-utils';

import DayBrowser from '../components/DayBrowser.vue';
import type { ImageResponse, PathResponse } from '../generated/types';
import type { PathEntries } from '../composables/useMultiPathEntries';
import { toLocalISODate } from '../utils/date';

const push = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}));

function makeImage(filename: string): ImageResponse {
  return {
    id: `img-${filename}`,
    entry_id: 'e1',
    filename,
    caption: null,
    status: 'ready',
    content_type: 'image/jpeg',
    byte_size: 100,
  };
}

function today(): string {
  return toLocalISODate(new Date());
}

function makePathResponse(overrides: Partial<PathResponse> = {}): PathResponse {
  return {
    path_id: 'p1',
    uuid: 'uuid-p1',
    owner_user_id: 'user-1',
    title: 'Path One',
    description: null,
    color: '#3949ab',
    is_public: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function mountDayBrowser(
  visiblePaths: PathResponse[],
  pathEntries: PathEntries[],
) {
  const queryClient = createQueryClient();
  return mount(DayBrowser, {
    props: {
      visiblePaths,
      pathEntries,
      canCreate: true,
      currentUserId: 'user-1',
    },
    global: {
      plugins: [[VueQueryPlugin, { queryClient }]],
    },
  });
}

describe('DayBrowser – multi-path entries on the same day', () => {
  it('shows entries from two different paths on today (the default selected day)', async () => {
    const pathA = makePathResponse({
      path_id: 'p1',
      title: 'Path A',
      color: '#f00',
    });
    const pathB = makePathResponse({
      path_id: 'p2',
      title: 'Path B',
      color: '#00f',
      owner_user_id: 'user-2',
    });

    const todayStr = today();

    const pathEntries: PathEntries[] = [
      {
        pathId: 'p1',
        entries: [
          {
            id: 'e1',
            path_id: 'p1',
            day: todayStr,
            edit_id: 1,
            content: 'Entry from Path A',
          },
        ],
      },
      {
        pathId: 'p2',
        entries: [
          {
            id: 'e2',
            path_id: 'p2',
            day: todayStr,
            edit_id: 2,
            content: 'Entry from Path B',
          },
        ],
      },
    ];

    const wrapper = mountDayBrowser([pathA, pathB], pathEntries);
    await nextTick();

    const html = wrapper.html();
    expect(html).toContain('Entry from Path A');
    expect(html).toContain('Entry from Path B');
  });

  it('renders a .db-entry element for each entry from different paths', async () => {
    const pathA = makePathResponse({
      path_id: 'p1',
      title: 'Path A',
      color: '#f00',
    });
    const pathB = makePathResponse({
      path_id: 'p2',
      title: 'Path B',
      color: '#00f',
      owner_user_id: 'user-2',
    });

    const todayStr = today();

    const pathEntries: PathEntries[] = [
      {
        pathId: 'p1',
        entries: [
          {
            id: 'e1',
            path_id: 'p1',
            day: todayStr,
            edit_id: 1,
            content: 'Alpha content',
          },
        ],
      },
      {
        pathId: 'p2',
        entries: [
          {
            id: 'e2',
            path_id: 'p2',
            day: todayStr,
            edit_id: 2,
            content: 'Beta content',
          },
        ],
      },
    ];

    const wrapper = mountDayBrowser([pathA, pathB], pathEntries);
    await nextTick();

    const dayEntries = wrapper.findAll('.db-entry');
    const entryTexts = dayEntries.map((e) => e.text());
    expect(entryTexts.some((t) => t.includes('Alpha content'))).toBe(true);
    expect(entryTexts.some((t) => t.includes('Beta content'))).toBe(true);
  });
});

describe('DayBrowser – multiple entries from the same path on the same day', () => {
  it('shows all entries from the same path on today', async () => {
    const path = makePathResponse({ path_id: 'p1', title: 'My Path' });
    const todayStr = today();

    const pathEntries: PathEntries[] = [
      {
        pathId: 'p1',
        entries: [
          {
            id: 'e1',
            path_id: 'p1',
            day: todayStr,
            edit_id: 1,
            content: 'First entry today',
          },
          {
            id: 'e2',
            path_id: 'p1',
            day: todayStr,
            edit_id: 2,
            content: 'Second entry today',
          },
        ],
      },
    ];

    const wrapper = mountDayBrowser([path], pathEntries);
    await nextTick();

    expect(wrapper.html()).toContain('First entry today');
    expect(wrapper.html()).toContain('Second entry today');
  });

  it('renders a separate .db-entry element for each entry', async () => {
    const path = makePathResponse({ path_id: 'p1' });
    const todayStr = today();

    const pathEntries: PathEntries[] = [
      {
        pathId: 'p1',
        entries: [
          {
            id: 'e1',
            path_id: 'p1',
            day: todayStr,
            edit_id: 1,
            content: 'Entry One',
          },
          {
            id: 'e2',
            path_id: 'p1',
            day: todayStr,
            edit_id: 2,
            content: 'Entry Two',
          },
          {
            id: 'e3',
            path_id: 'p1',
            day: todayStr,
            edit_id: 3,
            content: 'Entry Three',
          },
        ],
      },
    ];

    const wrapper = mountDayBrowser([path], pathEntries);
    await nextTick();

    expect(wrapper.findAll('.db-entry').length).toBeGreaterThanOrEqual(3);
  });
});

describe('DayBrowser – photo thumbnails', () => {
  it('shows a photo thumbnail when an entry has images', async () => {
    const path = makePathResponse({ path_id: 'p1' });
    const todayStr = today();

    const pathEntries: PathEntries[] = [
      {
        pathId: 'p1',
        entries: [
          {
            id: 'e1',
            path_id: 'p1',
            day: todayStr,
            edit_id: 1,
            content: 'Entry with photo',
            images: [makeImage('photo.jpg')],
          },
        ],
      },
    ];

    const wrapper = mountDayBrowser([path], pathEntries);
    await nextTick();

    expect(wrapper.findAll('.db-entry-photo')).toHaveLength(1);
  });

  it('does not render a photo section when an entry has no images', async () => {
    const path = makePathResponse({ path_id: 'p1' });
    const todayStr = today();

    const pathEntries: PathEntries[] = [
      {
        pathId: 'p1',
        entries: [
          {
            id: 'e1',
            path_id: 'p1',
            day: todayStr,
            edit_id: 1,
            content: 'Entry without photo',
            images: [],
          },
        ],
      },
    ];

    const wrapper = mountDayBrowser([path], pathEntries);
    await nextTick();

    expect(wrapper.find('.db-entry-photos').exists()).toBe(false);
  });
});

describe('DayBrowser – content placeholder text', () => {
  it('shows "Fetching…" when entry content is undefined (not yet loaded)', async () => {
    const path = makePathResponse({ path_id: 'p1' });
    const todayStr = today();

    const pathEntries: PathEntries[] = [
      {
        pathId: 'p1',
        entries: [
          {
            id: 'e1',
            path_id: 'p1',
            day: todayStr,
            edit_id: 1,
            content: undefined,
          },
        ],
      },
    ];

    const wrapper = mountDayBrowser([path], pathEntries);
    await nextTick();

    expect(wrapper.html()).toContain('Fetching…');
    expect(wrapper.html()).not.toContain('(no text)');
  });

  it('shows "(no text)" when entry content is an empty string (fetched but empty)', async () => {
    const path = makePathResponse({ path_id: 'p1' });
    const todayStr = today();

    const pathEntries: PathEntries[] = [
      {
        pathId: 'p1',
        entries: [
          { id: 'e1', path_id: 'p1', day: todayStr, edit_id: 1, content: '' },
        ],
      },
    ];

    const wrapper = mountDayBrowser([path], pathEntries);
    await nextTick();

    expect(wrapper.html()).toContain('(no text)');
    expect(wrapper.html()).not.toContain('Fetching…');
  });
});

describe('DayBrowser – navigation', () => {
  function makeDetailPathEntries(todayStr: string): PathEntries[] {
    return [
      {
        pathId: 'p1',
        entries: [
          {
            id: 'e1',
            path_id: 'p1',
            day: todayStr,
            edit_id: 1,
            content: 'Detailed entry content',
          },
        ],
      },
    ];
  }

  it('navigates to the entry view page when a .db-entry is clicked', async () => {
    const path = makePathResponse({ path_id: 'p1', title: 'My Path' });
    const todayStr = today();
    push.mockClear();
    const wrapper = mountDayBrowser([path], makeDetailPathEntries(todayStr));
    await nextTick();

    await wrapper.find('.db-entry').trigger('click');
    await nextTick();

    expect(push).toHaveBeenCalledWith('/entry/p1/e1');
  });

  it('navigates to the entry view page when Enter is pressed on a .db-entry', async () => {
    const path = makePathResponse({ path_id: 'p1' });
    const todayStr = today();
    push.mockClear();
    const wrapper = mountDayBrowser([path], makeDetailPathEntries(todayStr));
    await nextTick();

    await wrapper.find('.db-entry').trigger('keydown.enter');
    await nextTick();

    expect(push).toHaveBeenCalledWith('/entry/p1/e1');
  });

  it('navigates to the entry view page when Space is pressed on a .db-entry', async () => {
    const path = makePathResponse({ path_id: 'p1' });
    const todayStr = today();
    push.mockClear();
    const wrapper = mountDayBrowser([path], makeDetailPathEntries(todayStr));
    await nextTick();

    await wrapper.find('.db-entry').trigger('keydown.space');
    await nextTick();

    expect(push).toHaveBeenCalledWith('/entry/p1/e1');
  });

  it('navigates to the create page with today\'s date when "+" is pressed', async () => {
    const path = makePathResponse({ path_id: 'p1' });
    const todayStr = today();
    push.mockClear();
    const wrapper = mountDayBrowser([path], makeDetailPathEntries(todayStr));
    await nextTick();

    await wrapper.find('.db-day-create-btn').trigger('click');
    await nextTick();

    expect(push).toHaveBeenCalledWith({
      path: '/entry/new',
      query: { day: todayStr },
    });
  });

  it('entries are keyboard-accessible (role=button, tabindex=0)', async () => {
    const path = makePathResponse({ path_id: 'p1' });
    const todayStr = today();

    const pathEntries: PathEntries[] = [
      {
        pathId: 'p1',
        entries: [
          {
            id: 'e1',
            path_id: 'p1',
            day: todayStr,
            edit_id: 1,
            content: 'Accessible entry',
          },
        ],
      },
    ];

    const wrapper = mountDayBrowser([path], pathEntries);
    await nextTick();

    const entry = wrapper.find('.db-entry');
    expect(entry.attributes('role')).toBe('button');
    expect(entry.attributes('tabindex')).toBe('0');
  });
});

describe('DayBrowser – week strip', () => {
  // Fixed to a Wednesday so "yesterday" is always in the same Sun–Sat window
  // as today, regardless of which day the test suite actually runs on.
  beforeEach(() => vi.setSystemTime(new Date('2024-01-17T00:00:00')));
  afterEach(() => vi.useRealTimers());

  it('renders 7 day cells with today selected by default', async () => {
    const path = makePathResponse({ path_id: 'p1' });
    const wrapper = mountDayBrowser([path], []);
    await nextTick();

    expect(wrapper.findAll('.db-week-day')).toHaveLength(7);
    expect(wrapper.find('.db-week-day--selected').exists()).toBe(true);
  });

  it('selecting a different day updates the entry list', async () => {
    const path = makePathResponse({ path_id: 'p1' });
    const todayStr = today();
    const yesterday = new Date(todayStr + 'T00:00:00');
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toLocalISODate(yesterday);

    const pathEntries: PathEntries[] = [
      {
        pathId: 'p1',
        entries: [
          {
            id: 'e1',
            path_id: 'p1',
            day: todayStr,
            edit_id: 1,
            content: 'Today entry',
          },
          {
            id: 'e2',
            path_id: 'p1',
            day: yesterdayStr,
            edit_id: 2,
            content: 'Yesterday entry',
          },
        ],
      },
    ];

    const wrapper = mountDayBrowser([path], pathEntries);
    await nextTick();
    expect(wrapper.html()).toContain('Today entry');
    expect(wrapper.html()).not.toContain('Yesterday entry');

    const weekDays = wrapper.findAll('.db-week-day');
    // Same week (Sun–Sat window containing today), one day before today.
    const yesterdayIndex = new Date(yesterdayStr + 'T00:00:00').getDay();
    await weekDays[yesterdayIndex]!.trigger('click');
    await nextTick();

    expect(wrapper.html()).toContain('Yesterday entry');
    expect(wrapper.html()).not.toContain('Today entry');
  });
});
