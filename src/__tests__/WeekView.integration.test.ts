/**
 * Tests for WeekView multi-path and multi-entry rendering.
 *
 * WeekView receives already-resolved PathEntries data via props, so these
 * tests focus on the computed rendering logic: entries from multiple paths on
 * the same day are shown side-by-side, multiple entries from the same path on
 * the same day all appear, and entries with images show the 📷 thumbnail
 * indicator.
 */
import { describe, it, expect, vi } from 'vitest';
import { nextTick } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount } from '@vue/test-utils';

import WeekView from '../components/WeekView.vue';
import type { PathResponse } from '../generated/types';
import type { PathEntries } from '../composables/useMultiPathEntries';

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

// Stub EntryCreateModal so we don't have to wire up the full modal chain
vi.mock('../components/EntryCreateModal.vue', () => ({
  default: {
    template: '<div data-testid="entry-create-modal"></div>',
    props: ['isOpen', 'paths', 'currentUserId', 'initialDay'],
    emits: ['dismiss', 'created'],
  },
}));

// Stub EntryDetailModal so we can test open/close without Ionic
vi.mock('../components/EntryDetailModal.vue', () => ({
  default: {
    template:
      '<div data-testid="entry-detail-modal" :data-open="isOpen" :data-content="content"></div>',
    props: ['isOpen', 'pathTitle', 'color', 'day', 'content', 'hasImages'],
    emits: ['dismiss'],
  },
}));

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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('WeekView – multi-path entries on the same day', () => {
  it('shows entries from two different paths on the same day', async () => {
    const pathA = makePathResponse({ path_id: 'p1', title: 'Path A', color: '#f00' });
    const pathB = makePathResponse({ path_id: 'p2', title: 'Path B', color: '#00f', owner_user_id: 'user-2' });

    const todayStr = today();

    const pathEntries: PathEntries[] = [
      {
        pathId: 'p1',
        entries: [{ id: 'e1', path_id: 'p1', day: todayStr, edit_id: 'ed1', content: 'Entry from Path A' }],
      },
      {
        pathId: 'p2',
        entries: [{ id: 'e2', path_id: 'p2', day: todayStr, edit_id: 'ed2', content: 'Entry from Path B' }],
      },
    ];

    const wrapper = mountWeekView([pathA, pathB], pathEntries);
    await nextTick();

    const html = wrapper.html();
    expect(html).toContain('Entry from Path A');
    expect(html).toContain('Entry from Path B');
  });

  it('displays both entries in the same day box when from different paths', async () => {
    const pathA = makePathResponse({ path_id: 'p1', title: 'Path A', color: '#f00' });
    const pathB = makePathResponse({ path_id: 'p2', title: 'Path B', color: '#00f', owner_user_id: 'user-2' });

    const todayStr = today();

    const pathEntries: PathEntries[] = [
      {
        pathId: 'p1',
        entries: [{ id: 'e1', path_id: 'p1', day: todayStr, edit_id: 'ed1', content: 'Alpha content' }],
      },
      {
        pathId: 'p2',
        entries: [{ id: 'e2', path_id: 'p2', day: todayStr, edit_id: 'ed2', content: 'Beta content' }],
      },
    ];

    const wrapper = mountWeekView([pathA, pathB], pathEntries);
    await nextTick();

    // Both entries should appear in the same week view
    const dayEntries = wrapper.findAll('.day-entry');
    const entryTexts = dayEntries.map((e) => e.text());
    expect(entryTexts.some((t) => t.includes('Alpha content'))).toBe(true);
    expect(entryTexts.some((t) => t.includes('Beta content'))).toBe(true);
  });
});

describe('WeekView – multiple entries from the same path on the same day', () => {
  it('shows all entries from the same path on the same day', async () => {
    const path = makePathResponse({ path_id: 'p1', title: 'My Path', color: '#3949ab' });
    const todayStr = today();

    const pathEntries: PathEntries[] = [
      {
        pathId: 'p1',
        entries: [
          { id: 'e1', path_id: 'p1', day: todayStr, edit_id: 'ed1', content: 'First entry today' },
          { id: 'e2', path_id: 'p1', day: todayStr, edit_id: 'ed2', content: 'Second entry today' },
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
          { id: 'e1', path_id: 'p1', day: todayStr, edit_id: 'ed1', content: 'Entry One' },
          { id: 'e2', path_id: 'p1', day: todayStr, edit_id: 'ed2', content: 'Entry Two' },
          { id: 'e3', path_id: 'p1', day: todayStr, edit_id: 'ed3', content: 'Entry Three' },
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
            edit_id: 'ed1',
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
            edit_id: 'ed1',
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
            edit_id: 'ed1',
            content: 'Has photo',
            image_filenames: ['cat.jpg'],
          },
          {
            id: 'e2',
            path_id: 'p1',
            day: todayStr,
            edit_id: 'ed2',
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

describe('WeekView – entry detail modal', () => {
  it('opens the detail modal when a day-entry is clicked', async () => {
    const path = makePathResponse({ path_id: 'p1', title: 'My Path', color: '#3949ab' });
    const todayStr = today();

    const pathEntries: PathEntries[] = [
      {
        pathId: 'p1',
        entries: [
          { id: 'e1', path_id: 'p1', day: todayStr, edit_id: 'ed1', content: 'Detailed entry content' },
        ],
      },
    ];

    const wrapper = mountWeekView([path], pathEntries);
    await nextTick();

    // Detail modal should not be rendered before clicking
    expect(wrapper.find('[data-testid="entry-detail-modal"]').exists()).toBe(false);

    // Click the day-entry
    const entry = wrapper.find('.day-entry');
    await entry.trigger('click');
    await nextTick();

    // Detail modal should now be open
    const modal = wrapper.find('[data-testid="entry-detail-modal"]');
    expect(modal.exists()).toBe(true);
    expect(modal.attributes('data-open')).toBe('true');
    expect(modal.attributes('data-content')).toBe('Detailed entry content');
  });

  it('entries are keyboard-accessible (role=button, tabindex=0)', async () => {
    const path = makePathResponse({ path_id: 'p1' });
    const todayStr = today();

    const pathEntries: PathEntries[] = [
      {
        pathId: 'p1',
        entries: [
          { id: 'e1', path_id: 'p1', day: todayStr, edit_id: 'ed1', content: 'Accessible entry' },
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
