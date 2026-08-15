import { ApiError } from './customFetch';

/** Extract a human-readable message from an unknown caught error. */
export function extractErrorMessage(err: unknown): string | undefined {
  if (err instanceof ApiError) return err.detail ?? err.message;
  if (typeof err === 'string') return err;
  if (!err || typeof err !== 'object') return undefined;
  const e = err as Record<string, unknown>;
  const responseData = (e?.response as Record<string, unknown> | undefined)
    ?.data;
  if (responseData && typeof responseData === 'object') {
    const data = responseData as Record<string, unknown>;
    if (typeof data.message === 'string') return data.message;
    if (typeof data.error === 'string') return data.error;
  }
  if (typeof e.message === 'string') return e.message;
  return undefined;
}

/**
 * Format a caught error for display on a known failure path, as
 * "Unable to <action>: <reason>" — e.g. "Unable to create entry: internal
 * server error". Every user-facing error on a mobile-first UI should say
 * what failed and why, never a bare "please try again".
 */
export function describeError(action: string, err: unknown): string {
  const reason = extractErrorMessage(err) ?? 'unknown error';
  return `Unable to ${action}: ${reason}`;
}

/** True when `err` is an ApiError for the given HTTP status code. */
export function isApiErrorWithStatus(err: unknown, status: number): boolean {
  return err instanceof ApiError && err.status === status;
}
