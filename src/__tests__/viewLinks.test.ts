import { describe, it, expect } from 'vitest';
import { dateViewPath, pathViewPath } from '../utils/viewLinks';

describe('dateViewPath', () => {
  it('centers on the given day', () => {
    expect(dateViewPath('2024-03-15')).toBe('/?day=2024-03-15');
  });

  it('falls back to the bare date view with no day', () => {
    expect(dateViewPath()).toBe('/');
  });
});

describe('pathViewPath', () => {
  it('centers on the given path and day', () => {
    expect(pathViewPath('AB3X7K', '2024-03-15')).toBe(
      '/paths?pathId=AB3X7K&day=2024-03-15',
    );
  });

  it('omits the day when not given', () => {
    expect(pathViewPath('AB3X7K')).toBe('/paths?pathId=AB3X7K');
  });
});
