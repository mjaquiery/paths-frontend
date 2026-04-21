import { ref, readonly, computed, onMounted, onUnmounted } from 'vue';
import { useIsFetching, useQueryClient } from '@tanstack/vue-query';
import type { QueryCacheNotifyEvent } from '@tanstack/query-core';
import { useApi } from './useApi';

// Re-export so callers that imported RefreshStatusType from here don't break.
export type RefreshStatusType = 'ok' | 'fetching' | 'offline' | 'error';

/** Format a Date as a human-readable relative time string. */
export function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

// ─── Module-level error state ─────────────────────────────────────────────────
// Kept module-level so multiple useRefreshStatus instances (one per view) share
// the same error flag without prop-drilling.
const _hasError = ref(false);

/**
 * Reset all module-level singleton state.  Call between tests (or in
 * Storybook `prepareStoryEnvironment`) so each scenario starts clean.
 */
export function resetRefreshStatusState(): void {
  _hasError.value = false;
}

/**
 * Composable that tracks the refresh status of the path-entry queries.
 *
 * - `lastCheckedAt`: when the most recent successful entry-list fetch completed
 *   (derived from `useApi().lastRead`).
 * - `isOnline`: whether the browser reports network connectivity (delegated to
 *   the `useApi` singleton — a single source of truth with no duplicate
 *   window listeners).
 * - `hasError`: whether the most recent entry-list fetch failed.
 * - `isFetching`: whether any TanStack Query queries are currently in-flight.
 * - `statusType`: summary classification used for colour-coding the indicator.
 * - `statusText`: short human-readable label for the indicator.
 */
export function useRefreshStatus() {
  const {
    isOnline,
    trackRead,
    lastRead,
    pendingCount,
    abandonedWrites,
    queue,
    clearAbandoned,
  } = useApi();

  const hasError = computed(() => _hasError.value);

  const fetchingCount = useIsFetching();
  const isFetching = computed(() => fetchingCount.value > 0);

  const queryClient = useQueryClient();

  let unsubscribeCache: (() => void) | null = null;

  onMounted(() => {
    // Seed lastRead from any already-successful entry-list queries that were
    // loaded (e.g. restored from persisted cache) before this composable mounted.
    const cache = queryClient.getQueryCache();
    const existing = cache.findAll({
      predicate: (q) => {
        const key = q.queryKey;
        return (
          Array.isArray(key) &&
          key[0] === 'v1' &&
          key[1] === 'paths' &&
          key[3] === 'entries' &&
          q.state.status === 'success' &&
          q.state.dataUpdatedAt > 0
        );
      },
    });
    if (existing.length > 0) {
      // Only seed if useApi doesn't already have a more recent lastRead.
      const latestMs = Math.max(...existing.map((q) => q.state.dataUpdatedAt));
      if (!lastRead.value || lastRead.value.at < latestMs) {
        trackRead('entries');
      }
    }

    // Subscribe to subsequent cache events to keep status up-to-date.
    unsubscribeCache = cache.subscribe((event: QueryCacheNotifyEvent) => {
      if (event.type !== 'updated') return;
      const key = event.query.queryKey;
      if (
        !Array.isArray(key) ||
        key[0] !== 'v1' ||
        key[1] !== 'paths' ||
        key[3] !== 'entries'
      )
        return;

      if (event.action.type === 'success') {
        _hasError.value = false;
        trackRead('entries');
      } else if (
        event.action.type === 'error' ||
        event.query.state.status === 'error'
      ) {
        _hasError.value = true;
      }
    });
  });

  onUnmounted(() => {
    unsubscribeCache?.();
  });

  const statusType = computed<RefreshStatusType>(() => {
    if (!isOnline.value) return 'offline';
    if (hasError.value) return 'error';
    if (isFetching.value) return 'fetching';
    return 'ok';
  });

  const statusText = computed(() => {
    if (!isOnline.value) return 'Offline';
    if (hasError.value) return 'Unable to connect';
    if (isFetching.value) return 'Checking\u2026';
    if (!lastRead.value) return '';
    return `Updated ${formatRelativeTime(new Date(lastRead.value.at))}`;
  });

  // lastCheckedAt kept for backward compat — RefreshStatus uses it for the
  // detail text in the expanded panel.
  const lastCheckedAt = computed(() =>
    lastRead.value ? new Date(lastRead.value.at) : null,
  );

  // ── Stage-5 additions ──────────────────────────────────────────────────────

  /** Number of write operations not yet succeeded or abandoned. */
  const pendingOpsCount = computed(() => pendingCount.value);

  /** Human-readable description of the most recent error, or null. */
  const lastError = computed<string | null>(() => {
    if (abandonedWrites.value.length > 0) {
      return (
        abandonedWrites.value[abandonedWrites.value.length - 1]?.note ?? null
      );
    }
    if (_hasError.value) return 'Unable to reach server.';
    return null;
  });

  /** Whether any queued write has a conflict failure. */
  const hasConflict = computed(() =>
    queue.value.some((w) => w.failureKind === 'conflict'),
  );

  /** Manually flush all queries to force a re-fetch. */
  function retrySync(): void {
    void queryClient.invalidateQueries({ queryKey: ['v1'] });
  }

  /** Clear the fetch-error flag, reset errored queries, and dismiss abandoned writes. */
  function clearError(): void {
    _hasError.value = false;
    clearAbandoned();
    queryClient
      .getQueryCache()
      .findAll()
      .forEach((q) => {
        if (q.state.status === 'error') {
          void queryClient.resetQueries({ queryKey: q.queryKey });
        }
      });
  }

  return {
    lastCheckedAt,
    isOnline,
    hasError,
    isFetching,
    statusType,
    statusText,
    pendingOpsCount: readonly(pendingOpsCount),
    lastError: readonly(lastError),
    hasConflict: readonly(hasConflict),
    retrySync,
    clearError,
  };
}
