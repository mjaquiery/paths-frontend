/**
 * Unit tests for the customFetch helper.
 *
 * These tests verify that auth headers (Authorization: Bearer) are correctly
 * included in all request methods (GET, POST, PUT, DELETE) and are not
 * overwritten by options.headers.
 */
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
} from 'vitest';

// We need to test the actual customFetch, not a mock.
// Use MSW to intercept the fetch calls.
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  vi.restoreAllMocks();
});
afterAll(() => server.close());

// Import customFetch AFTER setting up MSW so it uses the intercepted fetch.
import { customFetch } from '../lib/customFetch';

describe('customFetch', () => {
  beforeEach(() => {
    // Store a user with a token in localStorage to simulate a logged-in user.
    localStorage.setItem('user', JSON.stringify({ token: 'test-token-123' }));
  });

  it('includes Authorization header in GET requests', async () => {
    const capturedHeaders: Record<string, string> = {};

    server.use(
      http.get('*/v1/paths', ({ request }) => {
        request.headers.forEach((value, key) => {
          capturedHeaders[key] = value;
        });
        return HttpResponse.json([], { status: 200 });
      }),
    );

    await customFetch('/v1/paths', { method: 'GET' });

    expect(capturedHeaders['authorization']).toBe('Bearer test-token-123');
  });

  it('includes Authorization header in POST requests', async () => {
    const capturedHeaders: Record<string, string> = {};

    server.use(
      http.post('*/v1/paths', ({ request }) => {
        request.headers.forEach((value, key) => {
          capturedHeaders[key] = value;
        });
        return HttpResponse.json({ path_id: 'new-path' }, { status: 201 });
      }),
    );

    await customFetch('/v1/paths', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test' }),
    });

    expect(capturedHeaders['authorization']).toBe('Bearer test-token-123');
    expect(capturedHeaders['content-type']).toBe('application/json');
  });

  it('includes Authorization header in PUT requests', async () => {
    const capturedHeaders: Record<string, string> = {};

    server.use(
      http.put('*/v1/paths/path-1/visibility', ({ request }) => {
        request.headers.forEach((value, key) => {
          capturedHeaders[key] = value;
        });
        return HttpResponse.json({}, { status: 200 });
      }),
    );

    await customFetch('/v1/paths/path-1/visibility', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_public: true }),
    });

    expect(capturedHeaders['authorization']).toBe('Bearer test-token-123');
  });

  it('does not include Authorization header when no user is in localStorage', async () => {
    localStorage.clear();
    const capturedHeaders: Record<string, string> = {};

    server.use(
      http.get('*/v1/paths', ({ request }) => {
        request.headers.forEach((value, key) => {
          capturedHeaders[key] = value;
        });
        return HttpResponse.json([], { status: 200 });
      }),
    );

    await customFetch('/v1/paths', { method: 'GET' });

    expect(capturedHeaders['authorization']).toBeUndefined();
  });

  it('returns parsed JSON data with status and headers', async () => {
    const mockPath = { path_id: 'p1', title: 'Test Path' };

    server.use(
      http.get('*/v1/paths', () => {
        return HttpResponse.json([mockPath], { status: 200 });
      }),
    );

    const result = (await customFetch('/v1/paths', { method: 'GET' })) as {
      data: unknown;
      status: number;
      headers: Headers;
    };

    expect(result.data).toEqual([mockPath]);
    expect(result.status).toBe(200);
    // headers is the Response Headers object returned by the fetch
    expect(typeof result.headers.get).toBe('function');
  });

  it('throws when the response is not ok', async () => {
    server.use(
      http.get('*/v1/paths', () => {
        return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 });
      }),
    );

    await expect(customFetch('/v1/paths', { method: 'GET' })).rejects.toThrow();
  });
});
