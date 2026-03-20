import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useIsFetching, useQueryClient } from '@tanstack/vue-query';
import type { QueryCacheNotifyEvent } from '@tanstack/query-core';

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

/**
 * Composable that tracks the refresh status of the path-entry queries.
 *
 * - `lastCheckedAt`: when the most recent successful entry-list fetch completed.
 * - `isOnline`: whether the browser reports network connectivity.
 * - `hasError`: whether the most recent entry-list fetch failed.
 * - `isFetching`: whether any TanStack Query queries are currently in-flight.
 * - `statusType`: summary classification used for colour-coding the indicator.
 * - `statusText`: short human-readable label for the indicator.
 */
export function useRefreshStatus() {
  const lastCheckedAt = ref<Date | null>(null);
  const isOnline = ref(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const hasError = ref(false);

  const fetchingCount = useIsFetching();
  const isFetching = computed(() => fetchingCount.value > 0);

  const queryClient = useQueryClient();

  function handleOnline() {
    isOnline.value = true;
  }
  function handleOffline() {
    isOnline.value = false;
  }

  let unsubscribeCache: (() => void) | null = null;

  onMounted(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Seed lastCheckedAt from any already-successful entry-list queries that
    // were loaded (e.g. restored from persisted cache) before this composable
    // was set up.
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
      const latestMs = Math.max(...existing.map((q) => q.state.dataUpdatedAt));
      lastCheckedAt.value = new Date(latestMs);
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
        lastCheckedAt.value = new Date();
        hasError.value = false;
      } else if (
        event.action.type === 'error' ||
        event.query.state.status === 'error'
      ) {
        hasError.value = true;
      }
    });
  });

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
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
    if (!lastCheckedAt.value) return '';
    return `Updated ${formatRelativeTime(lastCheckedAt.value)}`;
  });

  return {
    lastCheckedAt,
    isOnline,
    hasError,
    isFetching,
    statusType,
    statusText,
  };
}
