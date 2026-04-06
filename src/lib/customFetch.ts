/**
 * Error thrown by `customFetch` when the server responds with a non-2xx
 * status code.  The `status` property carries the HTTP status so that
 * `classifyFailure` in `useApi` can correctly categorise the failure as an
 * auth error, conflict, validation error, or generic server error rather
 * than treating everything as a network failure.
 */
export class ApiResponseError extends Error {
  readonly status: number;
  readonly responseData: unknown;

  constructor(status: number, responseData: unknown) {
    super(`Request failed: ${status}`);
    this.name = 'ApiResponseError';
    this.status = status;
    this.responseData = responseData;
  }
}

export const customFetch = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const baseUrl = (
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  ).replace(/\/$/, '');

  const storedToken =
    typeof localStorage !== 'undefined' &&
    typeof localStorage.getItem === 'function'
      ? localStorage.getItem('session_token')
      : null;
  const authHeader: Record<string, string> = storedToken
    ? { Authorization: `Bearer ${storedToken}` }
    : {};

  const response = await fetch(`${baseUrl}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
      ...(options?.headers ?? {}),
    },
  });
  if (!response.ok) {
    // Attempt to parse JSON body for structured error detail; fall back
    // to null so callers can still read the status code.
    let responseData: unknown = null;
    try {
      responseData = await response.json();
    } catch {
      // Non-JSON body — ignore
    }
    throw new ApiResponseError(response.status, responseData);
  }
  const data = response.status === 204 ? undefined : await response.json();
  return { data, status: response.status, headers: response.headers } as T;
};
