import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockFetch = vi.fn();

vi.stubGlobal('fetch', mockFetch);

const mockGetEtag = vi.fn();
const mockSetEtag = vi.fn();
const mockClearEtags = vi.fn();
vi.mock('../lib/etagStore', () => ({
  getEtag: (...args: unknown[]) => mockGetEtag(...args),
  setEtag: (...args: unknown[]) => mockSetEtag(...args),
  clearEtags: (...args: unknown[]) => mockClearEtags(...args),
}));

// Stub localStorage for bearer-token tests
const localStorageStore: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key];
  }),
  clear: vi.fn(() => {
    for (const key of Object.keys(localStorageStore)) {
      delete localStorageStore[key];
    }
  }),
});

// Reset module between tests so VITE_API_BASE_URL env changes take effect
beforeEach(() => {
  vi.resetModules();
  mockFetch.mockReset();
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Headers(),
    json: vi.fn().mockResolvedValue({}),
  });
  mockGetEtag.mockReset();
  mockGetEtag.mockResolvedValue(undefined);
  mockSetEtag.mockReset();
  mockSetEtag.mockResolvedValue(undefined);
  mockClearEtags.mockReset();
  mockClearEtags.mockResolvedValue(undefined);
  // Clear stored token between tests
  delete localStorageStore['session_token'];
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('customFetch', () => {
  it('always sends credentials: include, even when options omits credentials', async () => {
    const { customFetch } = await import('../lib/customFetch');
    await customFetch('/test', { method: 'GET', credentials: 'omit' });

    const [, fetchOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(fetchOptions.credentials).toBe('include');
  });

  it('always sends credentials: include when options passes same-origin', async () => {
    const { customFetch } = await import('../lib/customFetch');
    await customFetch('/test', { credentials: 'same-origin' });

    const [, fetchOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(fetchOptions.credentials).toBe('include');
  });

  it('always sends credentials: include when no options are provided', async () => {
    const { customFetch } = await import('../lib/customFetch');
    await customFetch('/test');

    const [, fetchOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(fetchOptions.credentials).toBe('include');
  });

  it('merges caller headers with the default Content-Type header', async () => {
    const { customFetch } = await import('../lib/customFetch');
    await customFetch('/test', {
      method: 'POST',
      headers: { 'X-Custom-Header': 'my-value' },
    });

    const [, fetchOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = fetchOptions.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['X-Custom-Header']).toBe('my-value');
  });

  it('caller headers do not lose Content-Type even when options.headers is also set', async () => {
    const { customFetch } = await import('../lib/customFetch');
    await customFetch('/test', {
      headers: { 'Content-Type': 'text/plain' },
    });

    // Caller's Content-Type overrides the default via header merge
    const [, fetchOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = fetchOptions.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('text/plain');
  });

  it('attaches Authorization: Bearer header when session_token is stored', async () => {
    localStorageStore['session_token'] = 'test-token-abc';
    const { customFetch } = await import('../lib/customFetch');
    await customFetch('/v1/paths');

    const [, fetchOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = fetchOptions.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer test-token-abc');
  });

  it('does not attach Authorization header when no session_token is stored', async () => {
    const { customFetch } = await import('../lib/customFetch');
    await customFetch('/v1/paths');

    const [, fetchOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = fetchOptions.headers as Record<string, string>;
    expect(headers['Authorization']).toBeUndefined();
  });

  it('caller-supplied Authorization header takes precedence over stored token', async () => {
    localStorageStore['session_token'] = 'stored-token';
    const { customFetch } = await import('../lib/customFetch');
    await customFetch('/v1/paths', {
      headers: { Authorization: 'Bearer caller-token' },
    });

    const [, fetchOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = fetchOptions.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer caller-token');
  });

  it('prepends the base URL from VITE_API_BASE_URL env var', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com');
    const { customFetch } = await import('../lib/customFetch');
    await customFetch('/v1/paths');

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.example.com/v1/paths');
  });

  it('strips trailing slash from base URL before prepending path', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/');
    const { customFetch } = await import('../lib/customFetch');
    await customFetch('/v1/paths');

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.example.com/v1/paths');
  });

  it('falls back to localhost:8080 when VITE_API_BASE_URL is not set', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '');
    const { customFetch } = await import('../lib/customFetch');
    await customFetch('/health');

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:8080/health');
  });

  it('passes method and body from options through to fetch', async () => {
    const { customFetch } = await import('../lib/customFetch');
    await customFetch('/v1/paths', {
      method: 'POST',
      body: JSON.stringify({ name: 'test' }),
    });

    const [, fetchOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(fetchOptions.method).toBe('POST');
    expect(fetchOptions.body).toBe(JSON.stringify({ name: 'test' }));
  });

  it('throws an ApiError with a status-based fallback reason when the response has no body', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers(),
    });

    const { customFetch, ApiError } = await import('../lib/customFetch');
    await expect(customFetch('/v1/paths')).rejects.toThrow(
      'internal server error',
    );
    try {
      await customFetch('/v1/paths');
      throw new Error('expected customFetch to reject');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as InstanceType<typeof ApiError>).status).toBe(500);
      expect((err as InstanceType<typeof ApiError>).detail).toBeUndefined();
    }
  });

  it('surfaces the backend-provided detail message from a JSON error body', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers(),
      json: vi.fn().mockResolvedValue({
        detail:
          'An error occurred (AccessDenied) when calling the PutObject operation: Access Denied.',
      }),
    });

    const { customFetch, ApiError } = await import('../lib/customFetch');
    await expect(customFetch('/v1/paths')).rejects.toThrow(
      'An error occurred (AccessDenied) when calling the PutObject operation: Access Denied.',
    );
    try {
      await customFetch('/v1/paths');
      throw new Error('expected customFetch to reject');
    } catch (err) {
      expect((err as InstanceType<typeof ApiError>).detail).toBe(
        'An error occurred (AccessDenied) when calling the PutObject operation: Access Denied.',
      );
    }
  });

  it('does not clear the session or flag sessionExpired on a non-401 error', async () => {
    localStorageStore['user'] = '{"user_id":"u1"}';
    localStorageStore['session_token'] = 'still-valid';
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers(),
    });

    const { customFetch } = await import('../lib/customFetch');
    const { sessionExpired } = await import('../lib/authSession');
    await expect(customFetch('/v1/paths')).rejects.toThrow(
      'internal server error',
    );

    expect(localStorageStore['user']).toBeDefined();
    expect(localStorageStore['session_token']).toBeDefined();
    expect(sessionExpired.value).toBe(false);
  });

  it('clears the stored session and flags sessionExpired on a 401', async () => {
    localStorageStore['user'] = '{"user_id":"u1"}';
    localStorageStore['session_token'] = 'expired-token';
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers(),
    });

    const { customFetch } = await import('../lib/customFetch');
    const { sessionExpired } = await import('../lib/authSession');
    await expect(customFetch('/v1/paths')).rejects.toThrow('not signed in');

    expect(localStorageStore['user']).toBeUndefined();
    expect(localStorageStore['session_token']).toBeUndefined();
    expect(sessionExpired.value).toBe(true);
  });

  it('rejects with a network-error message when fetch itself throws', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

    const { customFetch } = await import('../lib/customFetch');
    await expect(customFetch('/v1/paths')).rejects.toThrow('network error');
  });

  it('returns undefined data for 204 No Content responses', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers(),
      json: vi.fn(),
    });

    const { customFetch } = await import('../lib/customFetch');
    const result = (await customFetch('/v1/paths')) as {
      data: unknown;
      status: number;
    };
    expect(result.data).toBeUndefined();
    expect(result.status).toBe(204);
  });

  it('sends If-None-Match with the cached etag on a GET request', async () => {
    mockGetEtag.mockResolvedValue({
      etag: 'W/"abc123"',
      body: { cached: true },
    });

    const { customFetch } = await import('../lib/customFetch');
    await customFetch('/v1/paths');

    const [, fetchOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = fetchOptions.headers as Record<string, string>;
    expect(headers['If-None-Match']).toBe('W/"abc123"');
  });

  it('does not look up or send an etag for a non-GET request', async () => {
    const { customFetch } = await import('../lib/customFetch');
    await customFetch('/v1/paths', { method: 'POST', body: '{}' });

    expect(mockGetEtag).not.toHaveBeenCalled();
    const [, fetchOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = fetchOptions.headers as Record<string, string>;
    expect(headers['If-None-Match']).toBeUndefined();
  });

  it('resolves a 304 using the cached body instead of parsing the empty response', async () => {
    mockGetEtag.mockResolvedValue({
      etag: 'W/"abc123"',
      body: { title: 'cached' },
    });
    mockFetch.mockResolvedValue({
      ok: false,
      status: 304,
      headers: new Headers(),
      json: vi.fn().mockRejectedValue(new Error('should not be called on 304')),
    });

    const { customFetch } = await import('../lib/customFetch');
    const result = (await customFetch('/v1/paths')) as {
      data: unknown;
      status: number;
    };
    expect(result.data).toEqual({ title: 'cached' });
    expect(result.status).toBe(200);
  });

  it('stores the new etag and body when a GET responds 200 with an ETag header', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ ETag: 'W/"new-etag"' }),
      json: vi.fn().mockResolvedValue({ title: 'fresh' }),
    });

    const { customFetch } = await import('../lib/customFetch');
    await customFetch('/v1/paths');

    expect(mockSetEtag).toHaveBeenCalledWith(
      expect.stringContaining('/v1/paths'),
      'W/"new-etag"',
      { title: 'fresh' },
    );
  });

  it('does not store an etag when the response carries none', async () => {
    const { customFetch } = await import('../lib/customFetch');
    await customFetch('/v1/paths');

    expect(mockSetEtag).not.toHaveBeenCalled();
  });
});
