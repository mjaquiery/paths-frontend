import { ref, computed, readonly } from 'vue';
import { ApiResponseError } from '../lib/customFetch';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Classification of why a queued write failed.
 *
 * - `network`: The server could not be reached (offline, DNS failure, CORS).
 *   Retrying with back-off is appropriate.
 * - `auth`: The request was rejected with 401/403.  We surface a "login
 *   required" repair action so the user can re-authenticate.
 * - `conflict`: The request was rejected with 409.  The caller must resolve
 *   the conflict before retrying; the item is abandoned with a note.
 * - `validation`: The request was rejected with 422.  The payload is
 *   permanently invalid; the item is abandoned with a note.
 * - `server_error`: Any other HTTP ≥ 400.  Retrying is possible but we flag
 *   it distinctly so the UI can say "server error" rather than "offline".
 */
export type ApiFailureKind =
  | 'network'
  | 'auth'
  | 'conflict'
  | 'validation'
  | 'server_error';

/**
 * A single write operation held in the queue.
 */
export interface QueuedWrite<T = unknown> {
  /** Stable identifier for this operation (caller-supplied). */
  readonly id: string;
  /** Short human-readable description shown in the status bar. */
  readonly label: string;
  /**
   * The async function that performs the write.  It receives a signal that is
   * aborted when the item is abandoned so long-running fetches can be
   * cancelled.
   */
  readonly execute: (signal: AbortSignal) => Promise<T>;
  /**
   * Optional async function called before retrying when the failure kind is
   * `auth`.  Typically triggers a re-login flow.  Returning `false` means the
   * repair attempt failed and the item should be abandoned.
   */
  readonly repair?: (kind: ApiFailureKind) => Promise<boolean>;

  // ── Runtime state (mutated internally) ──────────────────────────────────

  status: QueuedWriteStatus;
  /** Number of attempts made so far (including the first try). */
  attempts: number;
  /** Timestamp of the last attempt. */
  lastAttemptAt: number | null;
  /** Timestamp of the next scheduled retry (null when not scheduled). */
  nextRetryAt: number | null;
  /** The most recent failure kind, if any. */
  failureKind: ApiFailureKind | null;
  /** Human-readable message from the last failure. */
  failureMessage: string | null;
  /**
   * When the item is abandoned, this note is preserved in the
   * `abandonedWrites` list so the status bar can surface it.
   */
  abandonNote: string | null;
}

export type QueuedWriteStatus =
  | 'pending' // waiting for first attempt or for next retry
  | 'running' // currently executing
  | 'success' // completed successfully (will be cleaned up shortly)
  | 'repairing' // running the repair callback
  | 'abandoned'; // permanently failed, will not retry

// ─── Constants ────────────────────────────────────────────────────────────────

/** Initial retry delay in ms (5 s). */
const BASE_RETRY_DELAY_MS = 5_000;
/** Maximum retry delay cap in ms (60 s). */
const MAX_RETRY_DELAY_MS = 60_000;
/** Number of attempts before giving up on `server_error` failures. */
const MAX_SERVER_ERROR_ATTEMPTS = 5;
/** How long to keep a succeeded item in the list before removing it (ms). */
const SUCCESS_DISPLAY_MS = 3_000;
/** How long to keep an abandoned item in the list before removing it (ms). */
const ABANDONED_DISPLAY_MS = 10_000;

// ─── Failure classification ───────────────────────────────────────────────────

export interface ApiError {
  status?: number;
  message?: string;
}

/**
 * Classify an error thrown by a fetch/mutation into an `ApiFailureKind`.
 *
 * We inspect the HTTP status code when available; otherwise we treat the
 * failure as a network error.
 */
export function classifyFailure(err: unknown): {
  kind: ApiFailureKind;
  message: string;
} {
  // TanStack Query wraps errors; Orval generated client throws plain Error
  // objects.  We look for a `.status` property (set by customFetch) or a
  // string like "Request failed: 401".
  const status = extractStatus(err);
  const message = extractMessage(err);

  if (status === 401 || status === 403) {
    return { kind: 'auth', message: message ?? 'Authentication required.' };
  }
  if (status === 409) {
    return {
      kind: 'conflict',
      message: message ?? 'Conflict — another change has been made.',
    };
  }
  if (status === 422) {
    return {
      kind: 'validation',
      message: message ?? 'Invalid data — cannot save.',
    };
  }
  if (status !== undefined && status >= 400) {
    return {
      kind: 'server_error',
      message: message ?? `Server error (${status}).`,
    };
  }
  // No HTTP status → network-level failure
  return {
    kind: 'network',
    message: message ?? 'Could not reach the server.',
  };
}

function extractStatus(err: unknown): number | undefined {
  if (!err || typeof err !== 'object') return undefined;
  // ApiResponseError (thrown by customFetch) — most reliable
  if (err instanceof ApiResponseError) return err.status;
  // Direct `.status` property (set by callers or legacy paths)
  if (
    'status' in err &&
    typeof (err as { status?: unknown }).status === 'number'
  ) {
    return (err as { status: number }).status;
  }
  // Nested `.response.status`
  const resp = (err as { response?: { status?: unknown } }).response;
  if (resp && typeof resp.status === 'number') return resp.status;
  // Parse from error message: "Request failed: 401"
  if (err instanceof Error) {
    const m = /Request failed:\s*(\d+)/.exec(err.message);
    if (m) return Number(m[1]);
  }
  return undefined;
}

function extractMessage(err: unknown): string | undefined {
  if (!err) return undefined;
  if (typeof err === 'string') return err;
  // ApiResponseError — check structured body first
  if (err instanceof ApiResponseError) {
    const data = err.responseData;
    if (data && typeof data === 'object') {
      const detail = (data as Record<string, unknown>).detail;
      if (typeof detail === 'string') return detail;
    }
    return err.message;
  }
  if (err instanceof Error) return err.message;
  const obj = err as Record<string, unknown>;
  // Orval / FastAPI detail field
  const detail =
    obj.response &&
    typeof obj.response === 'object' &&
    (obj.response as Record<string, unknown>).data &&
    typeof (obj.response as Record<string, unknown>).data === 'object'
      ? (
          (obj.response as Record<string, unknown>).data as Record<
            string,
            unknown
          >
        ).detail
      : undefined;
  if (typeof detail === 'string') return detail;
  if (typeof obj.message === 'string') return obj.message;
  return undefined;
}

// ─── Exponential back-off ─────────────────────────────────────────────────────

/**
 * Return the delay (ms) before the next retry, given the number of attempts
 * already made and the failure kind.
 */
export function retryDelay(attempts: number, _kind: ApiFailureKind): number {
  return Math.min(
    BASE_RETRY_DELAY_MS * 2 ** (attempts - 1),
    MAX_RETRY_DELAY_MS,
  );
}

/**
 * Return `true` when a failed item should be retried automatically.
 *
 * - `network` / `server_error`: retry up to `MAX_SERVER_ERROR_ATTEMPTS` times.
 * - `auth`: handled by the repair path (caller provides a `repair` callback).
 * - `conflict` / `validation`: permanent — abandon immediately.
 */
export function shouldRetry(
  item: Pick<QueuedWrite, 'attempts' | 'failureKind' | 'repair'>,
): boolean {
  const { failureKind, attempts, repair } = item;
  if (!failureKind) return false;
  if (failureKind === 'conflict' || failureKind === 'validation') return false;
  if (failureKind === 'auth') return !!repair;
  // network / server_error
  return attempts < MAX_SERVER_ERROR_ATTEMPTS;
}

// ─── Module-level singleton state ─────────────────────────────────────────────
// All component instances share the same write queue so the status bar
// (mounted in a footer) can observe operations enqueued by any view.

const _queue = ref<QueuedWrite[]>([]);
const _abandonedWrites = ref<
  Array<{ id: string; label: string; note: string; at: number }>
>([]);
const _isOnline = ref(
  typeof navigator !== 'undefined' ? navigator.onLine : true,
);

// Map of item.id → timer handle for scheduled retries
const _retryTimers = new Map<string, ReturnType<typeof setTimeout>>();
// Map of item.id → AbortController for in-flight requests
const _abortControllers = new Map<string, AbortController>();

// Wire up online/offline listeners exactly once
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    _isOnline.value = true;
    // Resume any pending items immediately when we come back online
    _queue.value
      .filter((item) => item.status === 'pending' && !_retryTimers.has(item.id))
      .forEach((item) => scheduleRetry(item, 0));
  });
  window.addEventListener('offline', () => {
    _isOnline.value = false;
  });
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function scheduleRetry(item: QueuedWrite, delayMs: number) {
  if (_retryTimers.has(item.id)) return;

  item.nextRetryAt = Date.now() + delayMs;

  const handle = setTimeout(() => {
    _retryTimers.delete(item.id);
    void runItem(item);
  }, delayMs);

  _retryTimers.set(item.id, handle);
}

async function runItem(item: QueuedWrite) {
  // Guard: could have been abandoned or already running
  if (item.status === 'abandoned' || item.status === 'running') return;

  item.status = 'running';
  item.nextRetryAt = null;
  item.lastAttemptAt = Date.now();
  item.attempts += 1;
  // Trigger Vue reactivity by reassigning the array
  _queue.value = [..._queue.value];

  const ac = new AbortController();
  _abortControllers.set(item.id, ac);

  try {
    await (item as QueuedWrite).execute(ac.signal);

    item.status = 'success';
    _queue.value = [..._queue.value];

    // Remove from queue after a brief display window
    setTimeout(() => {
      _queue.value = _queue.value.filter((w) => w.id !== item.id);
    }, SUCCESS_DISPLAY_MS);
  } catch (err: unknown) {
    if (ac.signal.aborted) return;

    const { kind, message } = classifyFailure(err);
    item.failureKind = kind;
    item.failureMessage = message;

    if (kind === 'auth' && item.repair) {
      // Attempt repair (re-login etc.)
      item.status = 'repairing';
      _queue.value = [..._queue.value];
      let repairSucceeded = false;
      try {
        repairSucceeded = await item.repair(kind);
      } catch {
        // repair itself threw — treat as failure
      }
      if (repairSucceeded) {
        item.status = 'pending';
        _queue.value = [..._queue.value];
        scheduleRetry(item, 0);
        return;
      }
      // Repair failed — abandon immediately without going through shouldRetry
      abandonItem(
        item,
        'Abandoned: authentication failed — please log in and try again.',
      );
      return;
    }

    if (shouldRetry(item)) {
      const delay = retryDelay(item.attempts, kind);
      item.status = 'pending';
      _queue.value = [..._queue.value];
      scheduleRetry(item, delay);
    } else {
      abandonItem(
        item,
        kind === 'conflict'
          ? 'Abandoned: a conflicting change was already saved.'
          : kind === 'validation'
            ? 'Abandoned: the data was invalid and cannot be saved.'
            : kind === 'auth'
              ? 'Abandoned: authentication failed — please log in and try again.'
              : `Abandoned after ${item.attempts} attempts: ${message}`,
      );
    }
  } finally {
    _abortControllers.delete(item.id);
  }
}

function abandonItem(item: QueuedWrite, note: string) {
  item.status = 'abandoned';
  item.abandonNote = note;
  _queue.value = [..._queue.value];

  _abandonedWrites.value = [
    ..._abandonedWrites.value,
    { id: item.id, label: item.label, note, at: Date.now() },
  ];

  // Remove from the active queue after ABANDONED_DISPLAY_MS
  setTimeout(() => {
    _queue.value = _queue.value.filter((w) => w.id !== item.id);
  }, ABANDONED_DISPLAY_MS);
}

// ─── Public composable ────────────────────────────────────────────────────────

/**
 * `useApi` — application-wide API status context.
 *
 * Exposes:
 * - `isOnline`: whether the browser reports network connectivity.
 * - `queue`: reactive list of all queued write operations and their status.
 * - `pendingCount`: number of writes not yet succeeded/abandoned.
 * - `hasFailure`: true when any write is in a failed/retrying state.
 * - `abandonedWrites`: list of recently abandoned writes with explanatory notes.
 * - `enqueue(item)`: add a write to the queue and execute it immediately.
 * - `abandon(id)`: manually abandon a queued write by id.
 * - `retry(id)`: manually trigger an immediate retry for a pending item.
 * - `clearAbandoned()`: dismiss all abandoned write notices.
 */
export function useApi() {
  const queue = computed(() => _queue.value);
  const isOnline = computed(() => _isOnline.value);

  const pendingCount = computed(
    () =>
      _queue.value.filter(
        (w) =>
          w.status === 'pending' ||
          w.status === 'running' ||
          w.status === 'repairing',
      ).length,
  );

  const hasFailure = computed(() =>
    _queue.value.some(
      (w) =>
        w.status === 'pending' &&
        w.failureKind !== null &&
        w.failureKind !== undefined,
    ),
  );

  const abandonedWrites = computed(() => _abandonedWrites.value);

  /**
   * Add a write to the queue and start executing it immediately.
   *
   * If an item with the same `id` is already in the queue it is replaced
   * (label may have changed).
   */
  function enqueue<T>(
    item: Pick<QueuedWrite<T>, 'id' | 'label' | 'execute'> &
      Partial<Pick<QueuedWrite<T>, 'repair'>>,
  ): void {
    // Cancel and remove any existing item with the same id
    const existing = _queue.value.find((w) => w.id === item.id);
    if (existing) {
      abandon(item.id);
    }

    const entry: QueuedWrite<T> = {
      id: item.id,
      label: item.label,
      execute: item.execute,
      repair: item.repair,
      status: 'pending',
      attempts: 0,
      lastAttemptAt: null,
      nextRetryAt: null,
      failureKind: null,
      failureMessage: null,
      abandonNote: null,
    };

    _queue.value = [..._queue.value, entry as QueuedWrite];
    void runItem(entry as QueuedWrite);
  }

  /**
   * Manually abandon a queued write.  The abort signal for any in-flight
   * request is triggered.
   */
  function abandon(id: string, note = 'Manually abandoned.'): void {
    const item = _queue.value.find((w) => w.id === id);
    if (!item) return;

    // Cancel any scheduled retry
    const timer = _retryTimers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      _retryTimers.delete(id);
    }

    // Abort any in-flight request
    const ac = _abortControllers.get(id);
    if (ac) {
      ac.abort();
      _abortControllers.delete(id);
    }

    abandonItem(item, note);
  }

  /**
   * Manually trigger an immediate retry for a pending item.
   */
  function retry(id: string): void {
    const item = _queue.value.find((w) => w.id === id);
    if (!item || item.status === 'running' || item.status === 'repairing')
      return;
    if (item.status === 'abandoned') return;

    // Cancel any scheduled timer so we run immediately
    const timer = _retryTimers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      _retryTimers.delete(id);
    }

    item.status = 'pending';
    _queue.value = [..._queue.value];
    void runItem(item);
  }

  /** Dismiss all abandoned write notices. */
  function clearAbandoned(): void {
    _abandonedWrites.value = [];
  }

  return {
    isOnline: readonly(isOnline),
    queue: readonly(queue),
    pendingCount: readonly(pendingCount),
    hasFailure: readonly(hasFailure),
    abandonedWrites: readonly(abandonedWrites),
    enqueue,
    abandon,
    retry,
    clearAbandoned,
  };
}

/**
 * Reset all singleton state.  Call in Storybook `prepareStoryEnvironment`
 * or between tests so each scenario starts clean.
 */
export function resetApiState(): void {
  // Abort all in-flight requests
  _abortControllers.forEach((ac) => ac.abort());
  _abortControllers.clear();

  // Clear all retry timers
  _retryTimers.forEach((handle) => clearTimeout(handle));
  _retryTimers.clear();

  _queue.value = [];
  _abandonedWrites.value = [];
  _isOnline.value = typeof navigator !== 'undefined' ? navigator.onLine : true;
}
