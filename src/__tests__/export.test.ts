import { describe, expect, it } from 'vitest';

import { isExportReady, isExportTerminal } from '../utils/export';

describe('export status', () => {
  it('recognizes ready state', () => {
    expect(
      isExportReady({
        id: '1',
        state: 'ready',
        requested_path_ids: [],
        created_at: '',
        updated_at: '',
        expires_at: null,
        failure_code: null,
        attempt_count: 1
      })
    ).toBe(true);
  });

  it('treats failed and expired as terminal', () => {
    expect(
      isExportTerminal({
        id: '1',
        state: 'failed',
        requested_path_ids: [],
        created_at: '',
        updated_at: '',
        expires_at: null,
        failure_code: null,
        attempt_count: 1
      })
    ).toBe(true);
  });
});
