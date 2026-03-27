<template>
  <details class="refresh-status" :class="`refresh-status--${statusType}`">
    <summary class="refresh-status__summary" :aria-label="summaryAriaLabel">
      <span class="refresh-status__dot" aria-hidden="true" />
      <span class="refresh-status__text">{{ statusText }}</span>
      <span class="refresh-status__chevron" aria-hidden="true">▾</span>
    </summary>

    <div class="refresh-status__panel" role="status" aria-live="polite">
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
import { ref, computed } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import type { RefreshStatusType } from '../composables/useRefreshStatus';
import { db } from '../lib/db';

const props = defineProps<{
  statusType: RefreshStatusType;
  statusText: string;
  lastCheckedAt: Date | null;
}>();

const queryClient = useQueryClient();
const confirmingDelete = ref(false);

const summaryAriaLabel = computed(
  () => `Refresh status: ${props.statusText || 'unknown'}. Click to expand.`,
);

function handleRefresh() {
  void queryClient.invalidateQueries({ queryKey: ['v1'] });
}

function handleDeleteCacheClick() {
  confirmingDelete.value = true;
}

async function confirmDeleteCache() {
  confirmingDelete.value = false;
  // Clear all server-derived and user-preference caches
  await Promise.all([
    db.queryCache.clear(),
    db.entryContent.clear(),
    db.entryImages.clear(),
    db.pathPreferences.clear(),
  ]);
  localStorage.removeItem('pathOrder');
  // Reload to re-fetch everything cleanly
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

.refresh-status__detail-text {
  margin: 0;
  font-size: 0.75rem;
  color: var(--ion-color-medium);
  line-height: 1.4;
}

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
</style>
