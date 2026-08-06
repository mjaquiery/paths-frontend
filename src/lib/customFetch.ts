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

  // FormData bodies (multipart entry create/update) must NOT get an explicit Content-Type:
  // fetch sets one itself, including the required multipart boundary. Setting it manually
  // here would produce a malformed multipart request the server can't parse.
  const isFormData = options?.body instanceof FormData;

  const response = await fetch(`${baseUrl}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...authHeader,
      ...(options?.headers ?? {}),
    },
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  const data = response.status === 204 ? undefined : await response.json();
  return { data, status: response.status, headers: response.headers } as T;
};
