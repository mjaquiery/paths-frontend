import { describe, expect, it } from 'vitest';

import { listPaths, createEntry } from '../generated/apiClient';

describe('generated api client', () => {
  it('contains OpenAPI operation for listing paths', () => {
    expect(typeof listPaths).toBe('function');
  });

  it('contains OpenAPI operation for creating entries', () => {
    expect(typeof createEntry).toBe('function');
  });
});
