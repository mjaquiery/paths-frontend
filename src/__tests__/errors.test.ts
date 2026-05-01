import { describe, expect, it } from 'vitest';

import { extractErrorMessage } from '../lib/errors';

describe('extractErrorMessage', () => {
  it('returns string errors directly', () => {
    expect(extractErrorMessage('plain failure')).toBe('plain failure');
  });

  it('prefers nested response message and error fields', () => {
    expect(
      extractErrorMessage({ response: { data: { message: 'API said no' } } }),
    ).toBe('API said no');
    expect(
      extractErrorMessage({ response: { data: { error: 'Server exploded' } } }),
    ).toBe('Server exploded');
  });

  it('falls back to top-level message', () => {
    expect(extractErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('returns undefined for unknown shapes', () => {
    expect(extractErrorMessage({ response: { data: {} } })).toBeUndefined();
    expect(extractErrorMessage(null)).toBeUndefined();
  });
});
