import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockFetch = vi.fn();

vi.stubGlobal('fetch', mockFetch);

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

  it('throws when the response is not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers(),
    });

    const { customFetch } = await import('../lib/customFetch');
    await expect(customFetch('/v1/paths')).rejects.toThrow(
      'Request failed: 401',
    );
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
});
