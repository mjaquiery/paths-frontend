<template>
  <details class="refresh-status" :class="`refresh-status--${statusType}`">
    <summary class="refresh-status__summary" :aria-label="summaryAriaLabel">
      <span class="refresh-status__dot" aria-hidden="true" />
      <span class="refresh-status__text">{{ statusText }}</span>

      <!-- Autosave in-progress badge -->
      <span
        v-if="isContentSaving"
        class="refresh-status__autosave-badge"
        aria-label="Autosaving draft…"
        aria-live="polite"
      >
        ↻ Saving…
      </span>

      <!-- Queued-writes badge (replaces the old pending-saves badge) -->
      <span
        v-if="pendingCount > 0"
        class="refresh-status__pending-badge"
        :aria-label="`${pendingCount} write ${pendingCount === 1 ? 'operation' : 'operations'} pending`"
        aria-live="polite"
      >
        ↑ {{ pendingCount }}
      </span>

      <!-- Abandoned-writes badge -->
      <span
        v-if="abandonedWrites.length > 0"
        class="refresh-status__error-badge"
        :aria-label="`${abandonedWrites.length} write ${abandonedWrites.length === 1 ? 'operation' : 'operations'} failed`"
        aria-live="polite"
      >
        ✕ {{ abandonedWrites.length }}
      </span>

      <span class="refresh-status__chevron" aria-hidden="true">▾</span>
    </summary>

    <div class="refresh-status__panel" role="status" aria-live="polite">
      <!-- Saved notification (stays until navigation) -->
      <p v-if="savedNotification" class="refresh-status__saved-note">
        ✓ {{ savedNotification }}
      </p>

      <!-- Active write-queue items -->
      <div
        v-if="queue.length > 0"
        class="refresh-status__queue"
        aria-label="Active write operations"
      >
        <p class="refresh-status__section-title">Write queue:</p>
        <ul class="refresh-status__queue-list">
          <li
            v-for="item in queue"
            :key="item.id"
            class="refresh-status__queue-item"
            :class="`refresh-status__queue-item--${item.status}`"
          >
            <span class="refresh-status__queue-item-icon" aria-hidden="true">
              {{ queueItemIcon(item) }}
            </span>
            <span class="refresh-status__queue-item-label">
              {{ item.label }}
            </span>
            <span
              v-if="item.failureKind"
              class="refresh-status__queue-item-kind"
              :class="`refresh-status__queue-item-kind--${item.failureKind}`"
            >
              {{ failureKindLabel(item.failureKind) }}
            </span>
            <span
              v-if="item.nextRetryAt"
              class="refresh-status__queue-item-retry"
            >
              retry in {{ retryCountdown(item.nextRetryAt) }}s
            </span>
            <div class="refresh-status__queue-item-actions">
              <button
                v-if="canRetry(item)"
                class="refresh-status__queue-action-btn"
                type="button"
                @click="retry(item.id)"
              >
                Retry now
              </button>
              <button
                v-if="canAbandon(item)"
                class="refresh-status__queue-action-btn refresh-status__queue-action-btn--danger"
                type="button"
                @click="abandon(item.id)"
              >
                Abandon
              </button>
            </div>
            <p
              v-if="item.failureMessage && item.status !== 'success'"
              class="refresh-status__queue-item-message"
            >
              {{ item.failureMessage }}
            </p>
          </li>
        </ul>
      </div>

      <!-- Abandoned writes (with notes) -->
      <div v-if="abandonedWrites.length > 0" class="refresh-status__abandoned">
        <div class="refresh-status__abandoned-header">
          <p
            class="refresh-status__section-title refresh-status__section-title--danger"
          >
            Failed writes:
          </p>
          <button
            class="refresh-status__action-btn"
            type="button"
            @click="clearAbandoned"
          >
            Dismiss all
          </button>
        </div>
        <ul class="refresh-status__abandoned-list">
          <li
            v-for="aw in abandonedWrites"
            :key="aw.id"
            class="refresh-status__abandoned-item"
          >
            <span class="refresh-status__abandoned-label">{{ aw.label }}</span>
            <span class="refresh-status__abandoned-note">{{ aw.note }}</span>
          </li>
        </ul>
      </div>

      <p class="refresh-status__detail-text">
        <template v-if="statusType === 'offline'">
          You're offline. Showing cached content.
        </template>
        <template v-else-if="statusType === 'error'">
          Couldn't reach the server. Will retry automatically.
        </template>
        <template v-else-if="statusType === 'fetching'">
          Refreshing content from server&hellip;
        </template>
        <template v-else-if="lastCheckedAt">
          Last checked: {{ lastCheckedAt.toLocaleTimeString() }}
        </template>
        <template v-else>No recent check recorded.</template>
      </p>

      <div class="refresh-status__actions">
        <button
          class="refresh-status__action-btn"
          type="button"
          :disabled="statusType === 'fetching'"
          @click="handleRefresh"
        >
          {{ statusType === 'fetching' ? 'Refreshing…' : 'Refresh now' }}
        </button>

        <button
          class="refresh-status__action-btn refresh-status__action-btn--danger"
          type="button"
          :disabled="confirmingDelete"
          @click="handleDeleteCacheClick"
        >
          Delete local cache
        </button>
      </div>

      <!-- Confirmation step for cache deletion -->
      <div v-if="confirmingDelete" class="refresh-status__confirm">
        <p class="refresh-status__confirm-text">
          This will remove all locally stored data — cached entries, images, and
          path preferences. Since this app has no offline write queue,
          <strong>no unsynced changes will be lost</strong>.
        </p>
        <div class="refresh-status__confirm-actions">
          <button
            class="refresh-status__action-btn refresh-status__action-btn--danger"
            type="button"
            @click="confirmDeleteCache"
          >
            Yes, delete cache
          </button>
          <button
            class="refresh-status__action-btn"
            type="button"
            @click="confirmingDelete = false"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </details>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import type { RefreshStatusType } from '../composables/useRefreshStatus';
import { usePendingSaves } from '../composables/usePendingSaves';
import { useApi } from '../composables/useApi';
import type { QueuedWrite, ApiFailureKind } from '../composables/useApi';
import { db } from '../lib/db';

const props = defineProps<{
  statusType: RefreshStatusType;
  statusText: string;
  lastCheckedAt: Date | null;
}>();

const queryClient = useQueryClient();
const confirmingDelete = ref(false);

const { savedNotification, isContentSaving } = usePendingSaves();
const { queue, pendingCount, abandonedWrites, abandon, retry, clearAbandoned } =
  useApi();

const summaryAriaLabel = computed(() => {
  const base = `API status: ${props.statusText || 'unknown'}.`;
  const pending =
    pendingCount.value > 0
      ? ` ${pendingCount.value} write ${pendingCount.value === 1 ? 'operation' : 'operations'} pending.`
      : '';
  const failed =
    abandonedWrites.value.length > 0
      ? ` ${abandonedWrites.value.length} write ${abandonedWrites.value.length === 1 ? 'operation' : 'operations'} failed.`
      : '';
  return `${base}${pending}${failed} Click to expand.`;
});

// ── Queue-item countdown timer ────────────────────────────────────────────────

/** Seconds until each item's next retry, keyed by item.id */
const retryCountdowns = ref<Record<string, number>>({});
let countdownInterval: ReturnType<typeof setInterval> | null = null;

function retryCountdown(nextRetryAt: number): number {
  return Math.max(0, Math.ceil((nextRetryAt - Date.now()) / 1000));
}

function updateCountdowns() {
  const next: Record<string, number> = {};
  for (const item of queue.value) {
    if (item.nextRetryAt) {
      next[item.id] = retryCountdown(item.nextRetryAt);
    }
  }
  retryCountdowns.value = next;
}

onMounted(() => {
  countdownInterval = setInterval(updateCountdowns, 1000);
  updateCountdowns();
});
onUnmounted(() => {
  if (countdownInterval !== null) clearInterval(countdownInterval);
});

// ── Queue-item helpers ────────────────────────────────────────────────────────

function queueItemIcon(item: QueuedWrite): string {
  switch (item.status) {
    case 'running':
      return '↻';
    case 'repairing':
      return '🔑';
    case 'success':
      return '✓';
    case 'abandoned':
      return '✕';
    default:
      return item.failureKind ? '⚠' : '↑';
  }
}

function failureKindLabel(kind: ApiFailureKind): string {
  switch (kind) {
    case 'network':
      return 'offline';
    case 'auth':
      return 'auth error';
    case 'conflict':
      return 'conflict';
    case 'validation':
      return 'invalid';
    case 'server_error':
      return 'server error';
  }
}

function canRetry(item: QueuedWrite): boolean {
  return (
    (item.status === 'pending' || item.status === 'abandoned') &&
    item.failureKind !== null &&
    item.failureKind !== 'conflict' &&
    item.failureKind !== 'validation'
  );
}

function canAbandon(item: QueuedWrite): boolean {
  return item.status === 'pending' || item.status === 'running';
}

// ── Standard actions ──────────────────────────────────────────────────────────

function handleRefresh() {
  void queryClient.invalidateQueries({ queryKey: ['v1'] });
}

function handleDeleteCacheClick() {
  confirmingDelete.value = true;
}

async function confirmDeleteCache() {
  confirmingDelete.value = false;
  await Promise.all([
    db.queryCache.clear(),
    db.entryContent.clear(),
    db.entryImages.clear(),
    db.pathPreferences.clear(),
  ]);
  localStorage.removeItem('pathOrder');
  window.location.reload();
}
</script>

<style scoped>
.refresh-status {
  display: block;
  width: 100%;
  font-size: 0.75rem;
  color: var(--ion-color-medium, #808080);
}

/* ── Summary bar ── */
.refresh-status__summary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  cursor: pointer;
  list-style: none;
  user-select: none;
  width: 100%;
  box-sizing: border-box;
  border-top: 1px solid var(--ion-border-color, rgba(0, 0, 0, 0.1));
}

/* Remove default marker in all browsers */
.refresh-status__summary::-webkit-details-marker {
  display: none;
}

.refresh-status__summary:focus-visible {
  outline: 2px solid var(--ion-color-primary);
  outline-offset: 2px;
}

.refresh-status__dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.refresh-status__text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Autosave badge ── */
.refresh-status__autosave-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--ion-color-primary, #3880ff);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1.5;
  animation: refresh-autosave-spin 0.8s linear infinite;
  animation-name: refresh-pulse;
}

/* ── Pending-writes badge ── */
.refresh-status__pending-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--ion-color-warning, #f57c00);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1.5;
}

/* ── Failed-writes badge ── */
.refresh-status__error-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--ion-color-danger, #eb445a);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1.5;
}

.refresh-status__chevron {
  font-size: 0.7rem;
  transition: transform 0.2s;
  flex-shrink: 0;
}

details[open] .refresh-status__chevron {
  transform: rotate(180deg);
}

/* ── Status colour variants ── */
.refresh-status--ok .refresh-status__summary {
  color: var(--ion-color-medium, #808080);
}

.refresh-status--fetching .refresh-status__summary {
  color: var(--ion-color-medium, #808080);
  animation: refresh-pulse 1.5s ease-in-out infinite;
}

.refresh-status--offline .refresh-status__summary {
  color: var(--ion-color-warning, #f57c00);
}

.refresh-status--error .refresh-status__summary {
  color: var(--ion-color-danger, #eb445a);
}

/* ── Expanded panel ── */
.refresh-status__panel {
  padding: 10px 12px 12px;
  border-top: 1px solid var(--ion-border-color, rgba(0, 0, 0, 0.08));
  background: var(--ion-item-background, var(--ion-background-color));
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Saved notification ── */
.refresh-status__saved-note {
  margin: 0;
  font-size: 0.75rem;
  color: var(--ion-color-success, #2dd36f);
  font-weight: 600;
  line-height: 1.4;
}

/* ── Section titles ── */
.refresh-status__section-title {
  margin: 0;
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--ion-color-medium, #808080);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.4;
}

.refresh-status__section-title--danger {
  color: var(--ion-color-danger, #eb445a);
}

/* ── Write queue ── */
.refresh-status__queue {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.refresh-status__queue-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.refresh-status__queue-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 8px;
  border-radius: 6px;
  background: var(--ion-item-background, var(--ion-background-color));
  border: 1px solid var(--ion-border-color, rgba(0, 0, 0, 0.08));
}

.refresh-status__queue-item--success {
  border-color: var(--ion-color-success, #2dd36f);
  opacity: 0.75;
}

.refresh-status__queue-item--abandoned {
  border-color: var(--ion-color-danger, #eb445a);
}

.refresh-status__queue-item--running .refresh-status__queue-item-icon,
.refresh-status__queue-item--repairing .refresh-status__queue-item-icon {
  display: inline-block;
  animation: refresh-autosave-spin 0.8s linear infinite;
}

.refresh-status__queue-item-icon {
  font-size: 0.75rem;
  display: inline-block;
}

.refresh-status__queue-item-label {
  font-size: 0.73rem;
  color: var(--ion-text-color);
  line-height: 1.4;
  flex: 1;
}

.refresh-status__queue-item-kind {
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 0 5px;
  line-height: 1.6;
  align-self: flex-start;
}

.refresh-status__queue-item-kind--network,
.refresh-status__queue-item-kind--server_error {
  background: var(--ion-color-warning, #f57c00);
  color: #fff;
}

.refresh-status__queue-item-kind--auth {
  background: var(--ion-color-tertiary, #6030a0);
  color: #fff;
}

.refresh-status__queue-item-kind--conflict,
.refresh-status__queue-item-kind--validation {
  background: var(--ion-color-danger, #eb445a);
  color: #fff;
}

.refresh-status__queue-item-retry {
  font-size: 0.65rem;
  color: var(--ion-color-medium, #808080);
  line-height: 1.4;
}

.refresh-status__queue-item-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.refresh-status__queue-action-btn {
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid var(--ion-border-color, rgba(0, 0, 0, 0.2));
  background: var(--ion-background-color);
  color: var(--ion-text-color);
  font-size: 0.68rem;
  font-weight: 600;
  cursor: pointer;
  line-height: 1.4;
  transition: opacity 0.15s;
}

.refresh-status__queue-action-btn:focus-visible {
  outline: 2px solid var(--ion-color-primary);
  outline-offset: 2px;
}

.refresh-status__queue-action-btn--danger {
  border-color: var(--ion-color-danger, #eb445a);
  color: var(--ion-color-danger, #eb445a);
}

.refresh-status__queue-item-message {
  margin: 2px 0 0;
  font-size: 0.68rem;
  color: var(--ion-color-medium, #808080);
  line-height: 1.4;
}

/* ── Abandoned writes ── */
.refresh-status__abandoned {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.refresh-status__abandoned-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.refresh-status__abandoned-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.refresh-status__abandoned-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid var(--ion-color-danger, #eb445a);
  background: var(--ion-item-background, var(--ion-background-color));
}

.refresh-status__abandoned-label {
  font-size: 0.73rem;
  font-weight: 600;
  color: var(--ion-text-color);
  line-height: 1.4;
}

.refresh-status__abandoned-note {
  font-size: 0.68rem;
  color: var(--ion-color-medium, #808080);
  line-height: 1.4;
}

/* ── Detail text ── */
.refresh-status__detail-text {
  margin: 0;
  font-size: 0.75rem;
  color: var(--ion-color-medium);
  line-height: 1.4;
}

/* ── Actions ── */
.refresh-status__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.refresh-status__action-btn {
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid var(--ion-border-color, rgba(0, 0, 0, 0.2));
  background: var(--ion-background-color);
  color: var(--ion-text-color);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  line-height: 1.4;
  transition: opacity 0.15s;
}

.refresh-status__action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.refresh-status__action-btn:focus-visible {
  outline: 2px solid var(--ion-color-primary);
  outline-offset: 2px;
}

.refresh-status__action-btn--danger {
  border-color: var(--ion-color-danger, #eb445a);
  color: var(--ion-color-danger, #eb445a);
}

/* ── Delete confirmation ── */
.refresh-status__confirm {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border: 1px solid var(--ion-color-danger, #eb445a);
  border-radius: 8px;
  background: var(--ion-background-color);
}

.refresh-status__confirm-text {
  margin: 0;
  font-size: 0.75rem;
  color: var(--ion-text-color);
  line-height: 1.5;
}

.refresh-status__confirm-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@keyframes refresh-pulse {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}

@keyframes refresh-autosave-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
