import { describe, expect, it } from 'vitest';

import { createApiClient } from '../generated/apiClient';

describe('generated api client', () => {
  it('contains OpenAPI operation for listing paths', () => {
    const client = createApiClient('http://localhost:8000');
    expect(typeof client.list_paths_v1_paths_get).toBe('function');
  });
});
