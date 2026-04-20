/**
 * Tests for the OnThisDaySpotlight priority-based selection algorithm.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';

import OnThisDaySpotlight from '../components/OnThisDaySpotlight.vue';
import type { PathResponse } from '../generated/types';
import type { PathEntries } from '../composables/useMultiPathEntries';

// ---------------------------------------------------------------------------
// Stub Ionic components
// ---------------------------------------------------------------------------
const ionicStubs = {
  IonCard: { template: '<div class="ion-card"><slot /></div>' },
  IonCardHeader: { template: '<div class="ion-card-header"><slot /></div>' },
  IonCardSubtitle: {
    template: '<div class="ion-card-subtitle"><slot /></div>',
  },
  IonCardTitle: { template: '<div class="ion-card-title"><slot /></div>' },
  IonCardContent: { template: '<div class="ion-card-content"><slot /></div>' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const today = new Date();

function dateString(offsetDays: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function yearAgo(years: number, offsetDays = 0): string {
  const d = new Date(today);
  d.setFullYear(d.getFullYear() - years);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function makePath(
  id: string,
  overrides: Partial<PathResponse> = {},
): PathResponse {
  return {
    path_id: id,
    uuid: `uuid-${id}`,
    owner_user_id: 'user-1',
    title: `Path ${id}`,
    description: null,
    color: '#3949ab',
    is_public: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

function mountSpotlight(
  visiblePaths: PathResponse[],
  pathEntries: PathEntries[],
) {
  return mount(OnThisDaySpotlight, {
    props: { visiblePaths, pathEntries },
    global: { stubs: ionicStubs },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OnThisDaySpotlight – not shown without matching entries', () => {
  it('renders nothing when there are no matching entries', async () => {
    const path = makePath('p1');
    const wrapper = mountSpotlight([path], [{ pathId: 'p1', entries: [] }]);
    await nextTick();
    expect(wrapper.find('.ion-card').exists()).toBe(false);
  });

  it('excludes today itself from the spotlight', async () => {
    const path = makePath('p1');
    const todayStr = dateString(0);
    const wrapper = mountSpotlight(
      [path],
      [
        {
          pathId: 'p1',
          entries: [
            {
              id: 'e1',
              path_id: 'p1',
              day: todayStr,
              edit_id: 1,
              content: 'Today',
            },
          ],
        },
      ],
    );
    await nextTick();
    expect(wrapper.find('.ion-card').exists()).toBe(false);
  });
});

describe('OnThisDaySpotlight – priority 1: first path + exact day, previous years', () => {
  it('shows an exact-day match from a previous year', async () => {
    const path = makePath('p1');
    const oneYearAgo = yearAgo(1);
    const wrapper = mountSpotlight(
      [path],
      [
        {
          pathId: 'p1',
          entries: [
            {
              id: 'e1',
              path_id: 'p1',
              day: oneYearAgo,
              edit_id: 1,
              content: 'Last year today',
            },
          ],
        },
      ],
    );
    await nextTick();
    expect(wrapper.find('.ion-card').exists()).toBe(true);
    expect(wrapper.html()).toContain('Last year today');
  });

  it('prefers exact day over adjacent days', async () => {
    const path = makePath('p1');
    const exactDayLastYear = yearAgo(1);
    const adjacentDayLastYear = yearAgo(1, 1); // 1 day after exact, last year
    const wrapper = mountSpotlight(
      [path],
      [
        {
          pathId: 'p1',
          entries: [
            {
              id: 'e1',
              path_id: 'p1',
              day: exactDayLastYear,
              edit_id: 1,
              content: 'Exact day',
            },
            {
              id: 'e2',
              path_id: 'p1',
              day: adjacentDayLastYear,
              edit_id: 2,
              content: 'Adjacent day',
            },
          ],
        },
      ],
    );
    await nextTick();
    expect(wrapper.find('.spotlight-primary').exists()).toBe(true);
    expect(wrapper.find('.spotlight-primary').text()).toContain('Exact day');
  });
});

describe('OnThisDaySpotlight – priority 2: other paths + exact day', () => {
  it('shows exact-day match from first path before second path', async () => {
    const path1 = makePath('p1');
    const path2 = makePath('p2');
    const lastYear = yearAgo(1);
    const wrapper = mountSpotlight(
      [path1, path2],
      [
        {
          pathId: 'p1',
          entries: [
            {
              id: 'e1',
              path_id: 'p1',
              day: lastYear,
              edit_id: 1,
              content: 'From p1',
            },
          ],
        },
        {
          pathId: 'p2',
          entries: [
            {
              id: 'e2',
              path_id: 'p2',
              day: lastYear,
              edit_id: 2,
              content: 'From p2',
            },
          ],
        },
      ],
    );
    await nextTick();
    expect(wrapper.find('.spotlight-primary').text()).toContain('From p1');
  });

  it('shows second-path exact match when first path has none', async () => {
    const path1 = makePath('p1');
    const path2 = makePath('p2');
    const lastYear = yearAgo(1);
    const wrapper = mountSpotlight(
      [path1, path2],
      [
        { pathId: 'p1', entries: [] },
        {
          pathId: 'p2',
          entries: [
            {
              id: 'e2',
              path_id: 'p2',
              day: lastYear,
              edit_id: 2,
              content: 'P2 exact',
            },
          ],
        },
      ],
    );
    await nextTick();
    expect(wrapper.find('.ion-card').exists()).toBe(true);
    expect(wrapper.find('.spotlight-primary').text()).toContain('P2 exact');
  });
});

describe('OnThisDaySpotlight – adjacent day matching', () => {
  it('shows adjacent day (±2 days) entry when no exact match exists', async () => {
    const path = makePath('p1');
    const adjacentLastYear = yearAgo(1, 1); // 1 day after today, last year
    const wrapper = mountSpotlight(
      [path],
      [
        {
          pathId: 'p1',
          entries: [
            {
              id: 'e1',
              path_id: 'p1',
              day: adjacentLastYear,
              edit_id: 1,
              content: 'Adjacent entry',
            },
          ],
        },
      ],
    );
    await nextTick();
    expect(wrapper.find('.ion-card').exists()).toBe(true);
    expect(wrapper.html()).toContain('Adjacent entry');
  });

  it('does not show entry more than 2 days away', async () => {
    const path = makePath('p1');
    const farLastYear = yearAgo(1, 3); // 3 days after today, last year
    const wrapper = mountSpotlight(
      [path],
      [
        {
          pathId: 'p1',
          entries: [
            {
              id: 'e1',
              path_id: 'p1',
              day: farLastYear,
              edit_id: 1,
              content: 'Far entry',
            },
          ],
        },
      ],
    );
    await nextTick();
    expect(wrapper.find('.ion-card').exists()).toBe(false);
  });
});

describe('OnThisDaySpotlight – this-year adjacent', () => {
  it('falls back to this-year adjacent entries when nothing from previous years', async () => {
    const path = makePath('p1');
    const adjacentThisYear = dateString(1); // tomorrow
    const wrapper = mountSpotlight(
      [path],
      [
        {
          pathId: 'p1',
          entries: [
            {
              id: 'e1',
              path_id: 'p1',
              day: adjacentThisYear,
              edit_id: 1,
              content: 'Tomorrow this year',
            },
          ],
        },
      ],
    );
    await nextTick();
    expect(wrapper.find('.ion-card').exists()).toBe(true);
    expect(wrapper.html()).toContain('Tomorrow this year');
  });

  it('prefers previous-year adjacent over this-year adjacent', async () => {
    const path = makePath('p1');
    const adjacentLastYear = yearAgo(1, 1);
    const adjacentThisYear = dateString(1);
    const wrapper = mountSpotlight(
      [path],
      [
        {
          pathId: 'p1',
          entries: [
            {
              id: 'e1',
              path_id: 'p1',
              day: adjacentLastYear,
              edit_id: 1,
              content: 'Last year adjacent',
            },
            {
              id: 'e2',
              path_id: 'p1',
              day: adjacentThisYear,
              edit_id: 2,
              content: 'This year adjacent',
            },
          ],
        },
      ],
    );
    await nextTick();
    expect(wrapper.find('.spotlight-primary').text()).toContain(
      'Last year adjacent',
    );
  });
});

describe('OnThisDaySpotlight – other indicators', () => {
  it('shows additional year indicators for entries beyond the primary', async () => {
    const path = makePath('p1');
    const twoYearsAgo = yearAgo(2);
    const threeYearsAgo = yearAgo(3);
    const oneYearAgo = yearAgo(1);
    const wrapper = mountSpotlight(
      [path],
      [
        {
          pathId: 'p1',
          entries: [
            {
              id: 'e1',
              path_id: 'p1',
              day: oneYearAgo,
              edit_id: 1,
              content: 'One year ago',
            },
            {
              id: 'e2',
              path_id: 'p1',
              day: twoYearsAgo,
              edit_id: 2,
              content: 'Two years ago',
            },
            {
              id: 'e3',
              path_id: 'p1',
              day: threeYearsAgo,
              edit_id: 3,
              content: 'Three years ago',
            },
          ],
        },
      ],
    );
    await nextTick();
    // Primary is 1 year ago; the other two show as indicators
    const indicators = wrapper.findAll('.spotlight-indicator');
    expect(indicators.length).toBe(2);
  });
});
