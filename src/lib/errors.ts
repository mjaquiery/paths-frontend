/** Extract a human-readable message from an unknown caught error. */
export function extractErrorMessage(err: unknown): string | undefined {
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
