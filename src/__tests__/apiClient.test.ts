import { describe, expect, it } from 'vitest';

import {
  listPathsV1PathsGet,
  createEntryV1PathIdEntriesPost,
} from '../generated/apiClient';

describe('generated api client', () => {
  it('contains OpenAPI operation for listing paths', () => {
    expect(typeof listPathsV1PathsGet).toBe('function');
  });

  it('contains OpenAPI operation for creating entries', () => {
    expect(typeof createEntryV1PathIdEntriesPost).toBe('function');
  });
});
