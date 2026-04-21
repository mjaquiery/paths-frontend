import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, nextTick } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount, flushPromises } from '@vue/test-utils';
import {
  formatRelativeTime,
  useRefreshStatus,
  resetRefreshStatusState,
} from '../composables/useRefreshStatus';
import { resetApiState } from '../composables/useApi';

// ─── helpers ────────────────────────────────────────────────────────────────

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function mountWithStatus(queryClient: QueryClient) {
  let exposed: ReturnType<typeof useRefreshStatus> | undefined;

  const TestComponent = defineComponent({
    setup() {
      exposed = useRefreshStatus();
      return {};
    },
    template: '<div></div>',
  });

  const wrapper = mount(TestComponent, {
    global: { plugins: [[VueQueryPlugin, { queryClient }]] },
  });

  return { wrapper, exposed: exposed! };
}

// ─── formatRelativeTime ─────────────────────────────────────────────────────

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for dates fewer than 10 seconds ago', () => {
    const now = new Date();
    vi.setSystemTime(now);
    const d = new Date(now.getTime() - 5_000);
    expect(formatRelativeTime(d)).toBe('just now');
  });

  it('returns seconds for dates between 10 and 59 seconds ago', () => {
    const now = new Date();
    vi.setSystemTime(now);
    const d = new Date(now.getTime() - 30_000);
    expect(formatRelativeTime(d)).toBe('30s ago');
  });

  it('returns minutes for dates between 1 and 59 minutes ago', () => {
    const now = new Date();
    vi.setSystemTime(now);
    const d = new Date(now.getTime() - 3 * 60_000);
    expect(formatRelativeTime(d)).toBe('3m ago');
  });

  it('returns hours for dates 60+ minutes ago', () => {
    const now = new Date();
    vi.setSystemTime(now);
    const d = new Date(now.getTime() - 2 * 3_600_000);
    expect(formatRelativeTime(d)).toBe('2h ago');
  });
});

// ─── useRefreshStatus ───────────────────────────────────────────────────────

describe('useRefreshStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset the useApi singleton so _lastRead (and other state) doesn't leak
    // between tests — it is module-level and persists across test cases.
    resetApiState();
    // Reset useRefreshStatus module-level state (_hasError) for the same reason.
    resetRefreshStatusState();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts with statusType "ok" when online', async () => {
    const queryClient = createQueryClient();
    const { wrapper, exposed } = mountWithStatus(queryClient);
    await flushPromises();

    expect(exposed.isOnline.value).toBe(true);
    expect(exposed.statusType.value).toBe('ok');

    wrapper.unmount();
  });

  it('switches statusType to "offline" on the offline event', async () => {
    const queryClient = createQueryClient();
    const { wrapper, exposed } = mountWithStatus(queryClient);
    await flushPromises();

    window.dispatchEvent(new Event('offline'));
    await nextTick();

    expect(exposed.isOnline.value).toBe(false);
    expect(exposed.statusType.value).toBe('offline');
    expect(exposed.statusText.value).toBe('Offline');

    wrapper.unmount();
  });

  it('switches back to "ok" on the online event', async () => {
    const queryClient = createQueryClient();
    const { wrapper, exposed } = mountWithStatus(queryClient);
    await flushPromises();

    window.dispatchEvent(new Event('offline'));
    await nextTick();
    window.dispatchEvent(new Event('online'));
    await nextTick();

    expect(exposed.isOnline.value).toBe(true);
    expect(exposed.statusType.value).toBe('ok');

    wrapper.unmount();
  });

  it('updates lastCheckedAt when an entry-list query succeeds', async () => {
    const queryClient = createQueryClient();
    const { wrapper, exposed } = mountWithStatus(queryClient);
    await flushPromises();

    expect(exposed.lastCheckedAt.value).toBeNull();

    const now = new Date();
    vi.setSystemTime(now);

    // Simulate a successful entry-list query result being written to cache
    queryClient.setQueryData(['v1', 'paths', 'p1', 'entries'], { data: [] });
    await nextTick();

    expect(exposed.lastCheckedAt.value).not.toBeNull();

    wrapper.unmount();
  });

  it('sets hasError when an entry-list query errors', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { wrapper, exposed } = mountWithStatus(queryClient);
    await flushPromises();

    // prefetchQuery swallows errors but transitions the query to 'error' state,
    // which triggers the cache subscription with query.state.status === 'error'.
    await queryClient.prefetchQuery({
      queryKey: ['v1', 'paths', 'p1', 'entries'],
      queryFn: () => Promise.reject(new Error('API down')),
      retry: false,
    });
    await nextTick();

    expect(exposed.hasError.value).toBe(true);
    expect(exposed.statusType.value).toBe('error');
    expect(exposed.statusText.value).toBe('Unable to connect');

    wrapper.unmount();
  });

  it('seeds lastCheckedAt from an already-successful cached query on mount', async () => {
    const queryClient = createQueryClient();

    // Pre-populate a successful entry-list query in the cache
    queryClient.setQueryData(['v1', 'paths', 'p1', 'entries'], { data: [] });

    const { wrapper, exposed } = mountWithStatus(queryClient);
    await flushPromises();

    // Should have seeded lastCheckedAt from the existing cache entry
    expect(exposed.lastCheckedAt.value).not.toBeNull();

    wrapper.unmount();
  });

  it('returns empty statusText when there is no lastCheckedAt and status is ok', async () => {
    const queryClient = createQueryClient();
    const { wrapper, exposed } = mountWithStatus(queryClient);
    await flushPromises();

    expect(exposed.lastCheckedAt.value).toBeNull();
    expect(exposed.statusText.value).toBe('');

    wrapper.unmount();
  });

  it('cleans up the query cache subscription on unmount', async () => {
    const queryClient = createQueryClient();

    // Spy on the subscribe method of the query cache so we can capture the
    // unsubscribe function it returns, then verify it is called on unmount.
    const cache = queryClient.getQueryCache();
    const originalSubscribe = cache.subscribe.bind(cache);
    let capturedUnsubscribe: (() => void) | null = null;
    vi.spyOn(cache, 'subscribe').mockImplementation((listener) => {
      const unsubscribe = originalSubscribe(listener);
      capturedUnsubscribe = vi.fn(() => unsubscribe());
      return capturedUnsubscribe;
    });

    const { wrapper } = mountWithStatus(queryClient);
    await flushPromises();

    expect(capturedUnsubscribe).not.toBeNull();

    wrapper.unmount();

    expect(capturedUnsubscribe).toHaveBeenCalledOnce();
  });

  it('exposes pendingOpsCount from useApi pendingCount', async () => {
    const queryClient = createQueryClient();
    const { wrapper, exposed } = mountWithStatus(queryClient);
    await flushPromises();

    expect(exposed.pendingOpsCount.value).toBe(0);

    wrapper.unmount();
  });

  it('exposes lastError as null when there are no errors', async () => {
    const queryClient = createQueryClient();
    const { wrapper, exposed } = mountWithStatus(queryClient);
    await flushPromises();

    expect(exposed.lastError.value).toBeNull();

    wrapper.unmount();
  });

  it('exposes hasConflict as false when no conflict failures', async () => {
    const queryClient = createQueryClient();
    const { wrapper, exposed } = mountWithStatus(queryClient);
    await flushPromises();

    expect(exposed.hasConflict.value).toBe(false);

    wrapper.unmount();
  });

  it('exposes retrySync as a callable function', async () => {
    const queryClient = createQueryClient();
    const { wrapper, exposed } = mountWithStatus(queryClient);
    await flushPromises();

    expect(typeof exposed.retrySync).toBe('function');
    // Should not throw when called
    expect(() => exposed.retrySync()).not.toThrow();

    wrapper.unmount();
  });

  it('exposes clearError as a callable function that resets hasError', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { wrapper, exposed } = mountWithStatus(queryClient);
    await flushPromises();

    // Trigger an error
    await queryClient.prefetchQuery({
      queryKey: ['v1', 'paths', 'p1', 'entries'],
      queryFn: () => Promise.reject(new Error('API down')),
      retry: false,
    });
    await nextTick();
    expect(exposed.hasError.value).toBe(true);

    exposed.clearError();
    await nextTick();

    expect(exposed.hasError.value).toBe(false);

    wrapper.unmount();
  });

  it('lastError returns "Unable to reach server." when hasError is true and no abandoned writes', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { wrapper, exposed } = mountWithStatus(queryClient);
    await flushPromises();

    await queryClient.prefetchQuery({
      queryKey: ['v1', 'paths', 'p1', 'entries'],
      queryFn: () => Promise.reject(new Error('API down')),
      retry: false,
    });
    await nextTick();

    expect(exposed.lastError.value).toBe('Unable to reach server.');

    wrapper.unmount();
  });
});
