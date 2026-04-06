import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick } from 'vue';
import { ApiResponseError } from '../lib/customFetch';
import {
  classifyFailure,
  retryDelay,
  shouldRetry,
  useApi,
  resetApiState,
} from '../composables/useApi';

// ─── classifyFailure ─────────────────────────────────────────────────────────

describe('classifyFailure', () => {
  it('classifies ApiResponseError 401 as auth', () => {
    const err = new ApiResponseError(401, null);
    expect(classifyFailure(err).kind).toBe('auth');
  });

  it('classifies ApiResponseError 403 as auth', () => {
    const err = new ApiResponseError(403, null);
    expect(classifyFailure(err).kind).toBe('auth');
  });

  it('classifies ApiResponseError 409 as conflict', () => {
    const err = new ApiResponseError(409, null);
    expect(classifyFailure(err).kind).toBe('conflict');
  });

  it('classifies ApiResponseError 422 as validation', () => {
    const err = new ApiResponseError(422, null);
    expect(classifyFailure(err).kind).toBe('validation');
  });

  it('classifies ApiResponseError 500 as server_error', () => {
    const err = new ApiResponseError(500, null);
    expect(classifyFailure(err).kind).toBe('server_error');
  });

  it('classifies a plain Error (no status) as network', () => {
    const err = new Error('fetch failed');
    expect(classifyFailure(err).kind).toBe('network');
  });

  it('classifies a TypeError (offline) as network', () => {
    const err = new TypeError('Failed to fetch');
    expect(classifyFailure(err).kind).toBe('network');
  });

  it('extracts a FastAPI detail string from ApiResponseError body', () => {
    const err = new ApiResponseError(422, { detail: 'Field required' });
    const result = classifyFailure(err);
    expect(result.kind).toBe('validation');
    expect(result.message).toBe('Field required');
  });

  it('parses legacy "Request failed: 403" error messages', () => {
    const err = new Error('Request failed: 403');
    expect(classifyFailure(err).kind).toBe('auth');
  });

  it('parses legacy "Request failed: 409" error messages', () => {
    const err = new Error('Request failed: 409');
    expect(classifyFailure(err).kind).toBe('conflict');
  });

  it('handles objects with a nested response.status', () => {
    const err = { response: { status: 500 } };
    expect(classifyFailure(err).kind).toBe('server_error');
  });

  it('handles null gracefully', () => {
    expect(classifyFailure(null).kind).toBe('network');
  });
});

// ─── retryDelay ──────────────────────────────────────────────────────────────

describe('retryDelay', () => {
  it('returns BASE_RETRY_DELAY_MS for the first attempt', () => {
    // attempts = 1 → 5000 * 2^0 = 5000
    expect(retryDelay(1, 'network')).toBe(5_000);
  });

  it('doubles for each subsequent attempt', () => {
    expect(retryDelay(2, 'network')).toBe(10_000);
    expect(retryDelay(3, 'network')).toBe(20_000);
    expect(retryDelay(4, 'network')).toBe(40_000);
  });

  it('caps at MAX_RETRY_DELAY_MS (60 s)', () => {
    expect(retryDelay(10, 'network')).toBe(60_000);
  });
});

// ─── shouldRetry ─────────────────────────────────────────────────────────────

describe('shouldRetry', () => {
  it('retries network failures when attempts < 5', () => {
    expect(
      shouldRetry({ failureKind: 'network', attempts: 1, repair: undefined }),
    ).toBe(true);
  });

  it('stops retrying network failures after 5 attempts', () => {
    expect(
      shouldRetry({ failureKind: 'network', attempts: 5, repair: undefined }),
    ).toBe(false);
  });

  it('does not retry conflict failures', () => {
    expect(
      shouldRetry({ failureKind: 'conflict', attempts: 1, repair: undefined }),
    ).toBe(false);
  });

  it('does not retry validation failures', () => {
    expect(
      shouldRetry({
        failureKind: 'validation',
        attempts: 1,
        repair: undefined,
      }),
    ).toBe(false);
  });

  it('retries auth failures when a repair callback is provided', () => {
    expect(
      shouldRetry({
        failureKind: 'auth',
        attempts: 1,
        repair: async () => true,
      }),
    ).toBe(true);
  });

  it('does not retry auth failures without a repair callback', () => {
    expect(
      shouldRetry({ failureKind: 'auth', attempts: 1, repair: undefined }),
    ).toBe(false);
  });
});

// ─── useApi ──────────────────────────────────────────────────────────────────

describe('useApi', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetApiState();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetApiState();
  });

  it('starts with an empty queue and no abandoned writes', () => {
    const { queue, pendingCount, abandonedWrites } = useApi();
    expect(queue.value).toHaveLength(0);
    expect(pendingCount.value).toBe(0);
    expect(abandonedWrites.value).toHaveLength(0);
  });

  it('enqueue executes the operation immediately and transitions to success', async () => {
    const { queue, enqueue } = useApi();
    const execute = vi.fn().mockResolvedValue('ok');

    enqueue({ id: 'w1', label: 'Test write', execute });
    // Running state
    expect(queue.value[0]?.status).toBe('running');

    // Flush the promise microtasks so execute resolves and status becomes 'success',
    // but do NOT advance timers yet (that would fire the SUCCESS_DISPLAY_MS cleanup).
    await nextTick();
    await nextTick();

    expect(execute).toHaveBeenCalledOnce();
    // After success the item stays visible briefly before being cleaned up
    expect(queue.value[0]?.status).toBe('success');
  });

  it('removes a succeeded item after SUCCESS_DISPLAY_MS', async () => {
    const { queue, enqueue } = useApi();
    enqueue({
      id: 'w1',
      label: 'Test',
      execute: vi.fn().mockResolvedValue('ok'),
    });

    await nextTick();
    await vi.runAllTimersAsync();

    expect(queue.value).toHaveLength(0);
  });

  it('retries a network failure with exponential back-off', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new Error('fetch failed'))
      .mockResolvedValue('ok');

    const { queue, enqueue } = useApi();
    enqueue({ id: 'w1', label: 'Net write', execute });

    // First attempt fails
    await nextTick();
    expect(execute).toHaveBeenCalledTimes(1);
    expect(queue.value[0]?.status).toBe('pending');
    expect(queue.value[0]?.failureKind).toBe('network');

    // Advance past the first retry delay (5 s)
    await vi.advanceTimersByTimeAsync(5_001);
    await nextTick();

    expect(execute).toHaveBeenCalledTimes(2);
    await vi.runAllTimersAsync();
    expect(queue.value).toHaveLength(0);
  });

  it('abandons a conflict failure immediately', async () => {
    const execute = vi.fn().mockRejectedValue(new ApiResponseError(409, null));

    const { queue, abandonedWrites, enqueue } = useApi();
    enqueue({ id: 'w1', label: 'Conflict write', execute });

    await nextTick();

    expect(queue.value[0]?.status).toBe('abandoned');
    expect(abandonedWrites.value).toHaveLength(1);
    expect(abandonedWrites.value[0]?.note).toMatch(/conflict/i);
  });

  it('abandons a validation failure immediately', async () => {
    const execute = vi
      .fn()
      .mockRejectedValue(new ApiResponseError(422, { detail: 'Bad field' }));

    const { abandonedWrites, enqueue } = useApi();
    enqueue({ id: 'w1', label: 'Invalid write', execute });

    await nextTick();

    expect(abandonedWrites.value).toHaveLength(1);
    expect(abandonedWrites.value[0]?.note).toMatch(/invalid/i);
  });

  it('calls the repair callback on auth failure and retries if repair succeeds', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new ApiResponseError(401, null))
      .mockResolvedValue('ok');
    const repair = vi.fn().mockResolvedValue(true);

    const { queue, enqueue } = useApi();
    enqueue({ id: 'w1', label: 'Auth write', execute, repair });

    // First attempt fails → repairing
    await nextTick();
    expect(repair).toHaveBeenCalledOnce();

    // After repair, retry runs immediately
    await nextTick();
    await vi.runAllTimersAsync();
    expect(execute).toHaveBeenCalledTimes(2);
    expect(queue.value).toHaveLength(0); // cleaned up
  });

  it('abandons on auth failure when repair returns false', async () => {
    const execute = vi.fn().mockRejectedValue(new ApiResponseError(401, null));
    const repair = vi.fn().mockResolvedValue(false);

    const { abandonedWrites, enqueue } = useApi();
    enqueue({ id: 'w1', label: 'Auth write', execute, repair });

    await nextTick();
    await nextTick();

    expect(abandonedWrites.value).toHaveLength(1);
    expect(abandonedWrites.value[0]?.note).toMatch(/auth/i);
  });

  it('abandon() manually removes an item from the queue', async () => {
    let resolveExecute!: () => void;
    const execute = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveExecute = resolve;
        }),
    );

    const { queue, enqueue, abandon } = useApi();
    enqueue({ id: 'w1', label: 'Long write', execute });

    expect(queue.value).toHaveLength(1);
    abandon('w1', 'Manual cancel');
    resolveExecute?.(); // resolve the promise so no unhandled rejection

    await nextTick();
    await vi.runAllTimersAsync();

    expect(
      queue.value.find((w) => w.id === 'w1' && w.status !== 'abandoned'),
    ).toBeUndefined();
  });

  it('retry() triggers an immediate re-attempt', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new Error('first fail'))
      .mockResolvedValue('ok');

    const { queue, enqueue, retry } = useApi();
    enqueue({ id: 'w1', label: 'Retry write', execute });

    await nextTick();
    // Failed — waiting for scheduled retry
    expect(queue.value[0]?.failureKind).toBe('network');

    // Trigger an immediate retry rather than waiting for the timer
    retry('w1');
    await nextTick();
    await vi.runAllTimersAsync();

    expect(execute).toHaveBeenCalledTimes(2);
  });

  it('clearAbandoned() removes all abandoned write notices', async () => {
    const execute = vi.fn().mockRejectedValue(new ApiResponseError(409, null));

    const { abandonedWrites, enqueue, clearAbandoned } = useApi();
    enqueue({ id: 'w1', label: 'w1', execute });
    enqueue({ id: 'w2', label: 'w2', execute });

    await nextTick();
    expect(abandonedWrites.value.length).toBeGreaterThanOrEqual(1);

    clearAbandoned();
    expect(abandonedWrites.value).toHaveLength(0);
  });

  it('hasFailure is true when a pending item has a failure kind', async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new Error('fetch failed'))
      .mockResolvedValue('ok');

    const { hasFailure, enqueue } = useApi();
    enqueue({ id: 'w1', label: 'Failing write', execute });

    await nextTick();
    expect(hasFailure.value).toBe(true);
  });

  it('replaces an existing queue item when enqueue is called with the same id', async () => {
    // First item: stalls indefinitely
    let stall: (() => void) | undefined;
    const execute1 = vi.fn(
      () =>
        new Promise<void>((res) => {
          stall = res;
        }),
    );
    const execute2 = vi.fn().mockResolvedValue('ok');

    const { queue, enqueue } = useApi();
    enqueue({ id: 'w1', label: 'First', execute: execute1 });
    expect(queue.value).toHaveLength(1);

    // Enqueue a replacement — should displace the first
    enqueue({ id: 'w1', label: 'Second', execute: execute2 });
    stall?.();

    await nextTick();
    await vi.runAllTimersAsync();

    expect(execute2).toHaveBeenCalledOnce();
  });
});
