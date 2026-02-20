import { describe, expect, it } from 'vitest';

import { listPathsV1PathsGet } from '../generated/apiClient';

describe('generated api client', () => {
  it('contains OpenAPI operation for listing paths', () => {
    expect(typeof listPathsV1PathsGet).toBe('function');
  });
});
