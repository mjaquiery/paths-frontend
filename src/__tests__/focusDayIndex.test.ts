import { describe, it, expect } from 'vitest';

import { focusDayIndex } from '../utils/date';

const TODAY = '2026-08-23';

describe('focusDayIndex', () => {
  it('places today last in the strip', () => {
    expect(focusDayIndex('2026-08-23', TODAY)).toBe(6);
  });

  it('places yesterday second-to-last', () => {
    expect(focusDayIndex('2026-08-22', TODAY)).toBe(5);
  });

  it('places the day before yesterday fifth', () => {
    expect(focusDayIndex('2026-08-21', TODAY)).toBe(4);
  });

  it('centers older past days fourth', () => {
    expect(focusDayIndex('2026-08-20', TODAY)).toBe(3);
    expect(focusDayIndex('2026-07-01', TODAY)).toBe(3);
  });

  it('centers future days fourth', () => {
    expect(focusDayIndex('2026-08-24', TODAY)).toBe(3);
  });
});
