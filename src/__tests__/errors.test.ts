import { describe, it, expect } from 'vitest';
import {
  describeError,
  extractErrorMessage,
  isApiErrorWithStatus,
} from '../lib/errors';
import { ApiError } from '../lib/customFetch';

describe('describeError', () => {
  it('formats an ApiError with backend detail as "Unable to <action>: <detail>"', () => {
    const err = new ApiError(
      500,
      'An error occurred (AccessDenied) when calling the PutObject operation: Access Denied.',
    );
    expect(describeError('create entry', err)).toBe(
      'Unable to create entry: An error occurred (AccessDenied) when calling the PutObject operation: Access Denied.',
    );
  });

  it('falls back to a status-based reason when the backend gives no detail (e.g. an unhandled 500)', () => {
    const err = new ApiError(500);
    expect(describeError('create entry', err)).toBe(
      'Unable to create entry: internal server error',
    );
  });

  it('reports a network failure distinctly from a server error', () => {
    expect(describeError('create entry', new Error('network error'))).toBe(
      'Unable to create entry: network error',
    );
  });

  it('never leaves the reason blank for an unrecognized error shape', () => {
    expect(describeError('create entry', {})).toBe(
      'Unable to create entry: unknown error',
    );
  });
});

describe('extractErrorMessage', () => {
  it('prefers the ApiError detail over the generic message', () => {
    const err = new ApiError(404, 'Path not found');
    expect(extractErrorMessage(err)).toBe('Path not found');
  });

  it('falls back to the ApiError message when there is no detail', () => {
    const err = new ApiError(404);
    expect(extractErrorMessage(err)).toBe('not found');
  });
});

describe('isApiErrorWithStatus', () => {
  it('matches an ApiError with the given status', () => {
    expect(isApiErrorWithStatus(new ApiError(409), 409)).toBe(true);
  });

  it('does not match an ApiError with a different status', () => {
    expect(isApiErrorWithStatus(new ApiError(500), 409)).toBe(false);
  });

  it('does not match a plain Error', () => {
    expect(isApiErrorWithStatus(new Error('409'), 409)).toBe(false);
  });
});
