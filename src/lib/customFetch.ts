export const customFetch = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const baseUrl = (
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  ).replace(/\/$/, '');

  // Primary auth: session_token cookie set by the server (credentials: 'include').
  // Fallback: Bearer token from localStorage for environments where cookies are
  // unavailable (e.g. cross-origin dev setups with CORS issues). The token is the
  // same value the server places in the session_token cookie, so it carries the
  // same privileges and the same XSS risk as any localStorage-stored token.
  // Do not ship localStorage token storage to production without evaluating
  // whether httpOnly cookies are sufficient for your threat model.
  const authHeaders: Record<string, string> = {};
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      const user = JSON.parse(stored) as { token?: string };
      if (user?.token) {
        authHeaders['Authorization'] = `Bearer ${user.token}`;
      }
    }
  } catch {
    // ignore localStorage errors
  }

  const { headers: optionHeaders, ...restOptions } = options ?? {};
  const response = await fetch(`${baseUrl}${url}`, {
    credentials: 'include',
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(optionHeaders ?? {}),
    },
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  const data = response.status === 204 ? undefined : await response.json();
  return { data, status: response.status, headers: response.headers } as T;
};
