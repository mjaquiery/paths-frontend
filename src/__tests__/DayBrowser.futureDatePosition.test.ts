import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import DayBrowser from '../components/DayBrowser.vue';
import { toLocalISODate } from '../utils/date';

const stubs = {
  IonSpinner: { template: '<span />' },
  EntryImage: { template: '<div />' },
  ImageLightbox: { template: '<div />' },
};

function daysFromNow(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return toLocalISODate(d);
}

function selectedWeekDayIndex(wrapper: ReturnType<typeof mount>): number {
  return wrapper
    .findAll('.db-week-day')
    .findIndex((d) => d.classes().includes('db-week-day--selected'));
}

describe('DayBrowser future date positioning', () => {
  it('places today 6th (index 5), leaving the last slot for tomorrow', () => {
    const wrapper = mount(DayBrowser, {
      props: {
        visiblePaths: [],
        pathEntries: [],
        currentUserId: 'u1',
        ensureDayLoaded: () => {},
      },
      global: { stubs },
    });

    expect(selectedWeekDayIndex(wrapper)).toBe(5);

    const cells = wrapper.findAll('.db-week-day');
    expect(cells).toHaveLength(7);
    expect(cells[6]!.find('.db-week-daynum').text()).toBe(
      String(new Date(daysFromNow(1) + 'T00:00:00').getDate()),
    );
  });

  it('centers tomorrow at the 4th position (index 3) when jumped to via the date picker', async () => {
    const wrapper = mount(DayBrowser, {
      props: {
        visiblePaths: [],
        pathEntries: [],
        currentUserId: 'u1',
        ensureDayLoaded: () => {},
      },
      global: { stubs },
    });

    const input = wrapper.find('.db-date-input');
    (input.element as HTMLInputElement).value = daysFromNow(1);
    await input.trigger('change');

    expect(selectedWeekDayIndex(wrapper)).toBe(3);
  });

  it('centers any future day (not just tomorrow) at the 4th position', async () => {
    const wrapper = mount(DayBrowser, {
      props: {
        visiblePaths: [],
        pathEntries: [],
        currentUserId: 'u1',
        ensureDayLoaded: () => {},
      },
      global: { stubs },
    });

    const input = wrapper.find('.db-date-input');
    (input.element as HTMLInputElement).value = daysFromNow(10);
    await input.trigger('change');

    expect(selectedWeekDayIndex(wrapper)).toBe(3);
  });
});
