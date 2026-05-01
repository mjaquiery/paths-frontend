/**
 * Tests for WeekView multi-path and multi-entry rendering.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount } from '@vue/test-utils';

import WeekView from '../components/WeekView.vue';
import type { PathResponse } from '../generated/types';
import type { PathEntries } from '../composables/useMultiPathEntries';

// ---------------------------------------------------------------------------
// Mock router
// ---------------------------------------------------------------------------
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({ params: {}, query: {} }),
}));

// ---------------------------------------------------------------------------
// Stub Ionic components
// ---------------------------------------------------------------------------
const ionicStubs = {
  IonButton: {
    template:
      '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    props: ['disabled', 'size', 'fill', 'expand'],
    emits: ['click'],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function today(): string {
  return new Date().toISOString().slice(0, 10);
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

function mountWeekView(
  visiblePaths: PathResponse[],
  pathEntries: PathEntries[],
) {
  const queryClient = createQueryClient();
  return mount(WeekView, {
    props: {
      visiblePaths,
      pathEntries,
      canCreate: true,
      currentUserId: 'user-1',
    },
    global: {
      plugins: [[VueQueryPlugin, { queryClient }]],
      stubs: ionicStubs,
    },
  });
}

beforeEach(() => {
  mockPush.mockClear();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('WeekView – multi-path entries on the same day', () => {
  it('shows entries from two different paths on the same day', async () => {
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
    const wrapper = mountWeekView([pathA, pathB], pathEntries);
    await nextTick();
    expect(wrapper.html()).toContain('Entry from Path A');
    expect(wrapper.html()).toContain('Entry from Path B');
  });

  it('displays both entries in the same day box when from different paths', async () => {
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
    const wrapper = mountWeekView([pathA, pathB], pathEntries);
    await nextTick();
    const dayEntries = wrapper.findAll('.day-entry');
    const entryTexts = dayEntries.map((e) => e.text());
    expect(entryTexts.some((t) => t.includes('Alpha content'))).toBe(true);
    expect(entryTexts.some((t) => t.includes('Beta content'))).toBe(true);
  });
});

describe('WeekView – multiple entries from the same path on the same day', () => {
  it('shows all entries from the same path on the same day', async () => {
    const path = makePathResponse({
      path_id: 'p1',
      title: 'My Path',
      color: '#3949ab',
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
    const wrapper = mountWeekView([path], pathEntries);
    await nextTick();
    expect(wrapper.html()).toContain('First entry today');
    expect(wrapper.html()).toContain('Second entry today');
  });

  it('renders a separate .day-entry element for each entry', async () => {
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
    const wrapper = mountWeekView([path], pathEntries);
    await nextTick();
    const dayEntries = wrapper.findAll('.day-entry');
    expect(dayEntries.length).toBeGreaterThanOrEqual(3);
  });
});

describe('WeekView – image thumbnail indicator', () => {
  it('shows 📷 indicator when an entry has images', async () => {
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
            image_filenames: ['photo.jpg'],
          },
        ],
      },
    ];
    const wrapper = mountWeekView([path], pathEntries);
    await nextTick();
    expect(wrapper.html()).toContain('📷');
  });

  it('does not show 📷 indicator when an entry has no images', async () => {
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
            image_filenames: [],
          },
        ],
      },
    ];
    const wrapper = mountWeekView([path], pathEntries);
    await nextTick();
    expect(wrapper.html()).not.toContain('📷');
  });

  it('shows 📷 for entries with images and not for those without, on the same day', async () => {
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
            content: 'Has photo',
            image_filenames: ['cat.jpg'],
          },
          {
            id: 'e2',
            path_id: 'p1',
            day: todayStr,
            edit_id: 2,
            content: 'No photo',
            image_filenames: [],
          },
        ],
      },
    ];
    const wrapper = mountWeekView([path], pathEntries);
    await nextTick();
    const indicators = wrapper.findAll('.day-entry-image-indicator');
    expect(indicators).toHaveLength(1);
  });
});

describe('WeekView – content placeholder text', () => {
  it('shows "Fetching..." when entry content is undefined (not yet loaded)', async () => {
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
    const wrapper = mountWeekView([path], pathEntries);
    await nextTick();
    expect(wrapper.html()).toContain('Fetching...');
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
    const wrapper = mountWeekView([path], pathEntries);
    await nextTick();
    expect(wrapper.html()).toContain('(no text)');
    expect(wrapper.html()).not.toContain('Fetching...');
  });
});

describe('WeekView – route navigation', () => {
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

  it('navigates to entry view when a day-entry is clicked', async () => {
    const path = makePathResponse({
      path_id: 'p1',
      title: 'My Path',
      color: '#3949ab',
    });
    const todayStr = today();
    const wrapper = mountWeekView([path], makeDetailPathEntries(todayStr));
    await nextTick();
    await wrapper.find('.day-entry').trigger('click');
    await nextTick();
    expect(mockPush).toHaveBeenCalledWith('/entry/p1/e1');
  });

  it('navigates to entry view when Enter is pressed on a day-entry', async () => {
    const path = makePathResponse({
      path_id: 'p1',
      title: 'My Path',
      color: '#3949ab',
    });
    const todayStr = today();
    const wrapper = mountWeekView([path], makeDetailPathEntries(todayStr));
    await nextTick();
    await wrapper.find('.day-entry').trigger('keydown.enter');
    await nextTick();
    expect(mockPush).toHaveBeenCalledWith('/entry/p1/e1');
  });

  it('navigates to entry view when Space is pressed on a day-entry', async () => {
    const path = makePathResponse({
      path_id: 'p1',
      title: 'My Path',
      color: '#3949ab',
    });
    const todayStr = today();
    const wrapper = mountWeekView([path], makeDetailPathEntries(todayStr));
    await nextTick();
    await wrapper.find('.day-entry').trigger('keydown.space');
    await nextTick();
    expect(mockPush).toHaveBeenCalledWith('/entry/p1/e1');
  });

  it('navigates to create entry view when + button is clicked', async () => {
    const path = makePathResponse({
      path_id: 'p1',
      title: 'My Path',
      color: '#3949ab',
      owner_user_id: 'user-1',
    });
    const todayStr = today();
    const wrapper = mountWeekView([path], makeDetailPathEntries(todayStr));
    await nextTick();
    const dayBox = wrapper
      .findAll('.day-box')
      .find((box) => box.classes('day-box--today'));
    expect(dayBox).toBeTruthy();
    const createBtn = dayBox!.find('.day-create-btn');
    await createBtn.trigger('click');
    await nextTick();
    expect(mockPush).toHaveBeenCalledWith(`/entry/p1/new?date=${todayStr}`);
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
    const wrapper = mountWeekView([path], pathEntries);
    await nextTick();
    const entry = wrapper.find('.day-entry');
    expect(entry.attributes('role')).toBe('button');
    expect(entry.attributes('tabindex')).toBe('0');
  });
});

describe('WeekView – day ordering', () => {
  it('shows today at position 6 (1-indexed) in the 7-day window', async () => {
    const path = makePathResponse({ path_id: 'p1' });
    const wrapper = mountWeekView([path], [{ pathId: 'p1', entries: [] }]);
    await nextTick();
    const dayBoxes = wrapper.findAll('.day-box');
    expect(dayBoxes).toHaveLength(7);
    // Position 6 (index 5) should be labelled "Today"
    expect(dayBoxes[5]!.text()).toContain('Today');
  });

  it('shows tomorrow at position 7 (last position)', async () => {
    const path = makePathResponse({ path_id: 'p1' });
    const wrapper = mountWeekView([path], [{ pathId: 'p1', entries: [] }]);
    await nextTick();
    const dayBoxes = wrapper.findAll('.day-box');
    // Last position should not be labelled "Today"
    expect(dayBoxes[6]!.text()).not.toContain('Today');
    // And it should not have the today class
    expect(dayBoxes[6]!.classes()).not.toContain('day-box--today');
  });

  it('shows today with the today marker CSS class at position 6', async () => {
    const path = makePathResponse({ path_id: 'p1' });
    const wrapper = mountWeekView([path], [{ pathId: 'p1', entries: [] }]);
    await nextTick();
    const dayBoxes = wrapper.findAll('.day-box');
    // Exactly one day box should have the today class
    const todayBoxes = dayBoxes.filter((box) =>
      box.classes().includes('day-box--today'),
    );
    expect(todayBoxes).toHaveLength(1);
    expect(dayBoxes.indexOf(todayBoxes[0]!)).toBe(5);
  });
});
