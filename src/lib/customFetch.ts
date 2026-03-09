export const customFetch = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const baseUrl = (
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  ).replace(/\/$/, '');

  const storedToken =
    typeof localStorage !== 'undefined'
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
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  const data = response.status === 204 ? undefined : await response.json();
  return { data, status: response.status, headers: response.headers } as T;
};
