import { describe, it, expect } from 'vitest';

import { focusDayIndex } from '../utils/date';

const TODAY = '2026-08-23';

describe('focusDayIndex', () => {
  it('places today 6th, leaving the last slot for tomorrow', () => {
    expect(focusDayIndex('2026-08-23', TODAY)).toBe(5);
  });

  it('places yesterday 5th', () => {
    expect(focusDayIndex('2026-08-22', TODAY)).toBe(4);
  });

  it('centers older past days fourth', () => {
    expect(focusDayIndex('2026-08-21', TODAY)).toBe(3);
    expect(focusDayIndex('2026-08-20', TODAY)).toBe(3);
    expect(focusDayIndex('2026-07-01', TODAY)).toBe(3);
  });

  it('centers future days fourth', () => {
    expect(focusDayIndex('2026-08-24', TODAY)).toBe(3);
  });
});
