<template>
  <details class="refresh-status" :class="`refresh-status--${statusType}`">
    <summary class="refresh-status__summary" :aria-label="summaryAriaLabel">
      <span class="refresh-status__dot" aria-hidden="true" />
      <span class="refresh-status__text">{{ statusText }}</span>

      <!-- Autosave-in-progress indicator -->
      <span
        v-if="isContentSaving"
        class="refresh-status__autosave-indicator"
        aria-label="Saving…"
        aria-live="polite"
      >
        <span class="refresh-status__autosave-spinner" aria-hidden="true" />
        <span class="refresh-status__autosave-label">Saving…</span>
      </span>

      <!-- Pending-saves indicator -->
      <span
        v-if="pendingSavesCount > 0"
        class="refresh-status__pending-badge"
        :aria-label="`${pendingSavesCount} unsaved ${pendingSavesCount === 1 ? 'change' : 'changes'} retrying`"
        aria-live="polite"
      >
        ↑ {{ pendingSavesCount }}
      </span>

      <!-- Draft-init error indicator -->
      <span
        v-if="draftInitErrors.length > 0"
        class="refresh-status__draft-init-badge"
        :aria-label="`${draftInitErrors.length} draft ${draftInitErrors.length === 1 ? 'error' : 'errors'}`"
        aria-live="polite"
      >
        ⚠ {{ draftInitErrors.length }}
      </span>

      <span class="refresh-status__chevron" aria-hidden="true">▾</span>
    </summary>

    <div class="refresh-status__panel" role="status" aria-live="polite">
      <!-- Saved notification (stays until navigation) -->
      <p v-if="savedNotification" class="refresh-status__saved-note">
        ✓ {{ savedNotification }}
      </p>

      <!-- Draft-init error(s) -->
      <div
        v-if="draftInitErrors.length > 0"
        class="refresh-status__draft-init-errors"
      >
        <p
          v-for="(msg, idx) in draftInitErrors"
          :key="idx"
          class="refresh-status__draft-init-error"
        >
          ⚠ {{ msg }} — retrying in background.
        </p>
      </div>

      <!-- Pending-saves list -->
      <div
        v-if="pendingSavesCount > 0"
        class="refresh-status__pending-list"
        aria-label="Entries retrying to save"
      >
        <p class="refresh-status__pending-title">
          Retrying save ({{ pendingSavesCount }}):
        </p>
        <ul class="refresh-status__pending-items">
          <li
            v-for="save in pendingSaves"
            :key="save.key"
            class="refresh-status__pending-item"
          >
            ↑ {{ save.label }}
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
import { ref, computed } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import type { RefreshStatusType } from '../composables/useRefreshStatus';
import { usePendingSaves } from '../composables/usePendingSaves';
import { db } from '../lib/db';

const props = defineProps<{
  statusType: RefreshStatusType;
  statusText: string;
  lastCheckedAt: Date | null;
}>();

const queryClient = useQueryClient();
const confirmingDelete = ref(false);

const {
  pendingSaves,
  pendingSavesCount,
  savedNotification,
  isContentSaving,
  draftInitErrors,
} = usePendingSaves();

const summaryAriaLabel = computed(() => {
  const base = `Refresh status: ${props.statusText || 'unknown'}.`;
  const pending =
    pendingSavesCount.value > 0
      ? ` ${pendingSavesCount.value} unsaved ${pendingSavesCount.value === 1 ? 'change' : 'changes'} retrying.`
      : '';
  return `${base}${pending} Click to expand.`;
});

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

/* ── Autosave indicator ── */
.refresh-status__autosave-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0.75;
}

.refresh-status__autosave-spinner {
  display: inline-block;
  width: 10px;
  height: 10px;
  border: 1.5px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: refresh-autosave-spin 0.8s linear infinite;
}

.refresh-status__autosave-label {
  font-size: 0.68rem;
  font-weight: 600;
  line-height: 1;
}

@keyframes refresh-autosave-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Pending-saves badge ── */
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

/* ── Draft-init error badge ── */
.refresh-status__draft-init-badge {
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

/* ── Draft-init errors ── */
.refresh-status__draft-init-errors {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.refresh-status__draft-init-error {
  margin: 0;
  font-size: 0.75rem;
  color: var(--ion-color-warning, #f57c00);
  font-weight: 600;
  line-height: 1.4;
}

/* ── Pending-saves list ── */
.refresh-status__pending-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.refresh-status__pending-title {
  margin: 0;
  font-size: 0.75rem;
  color: var(--ion-color-warning, #f57c00);
  font-weight: 600;
  line-height: 1.4;
}

.refresh-status__pending-items {
  margin: 0;
  padding: 0 0 0 12px;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.refresh-status__pending-item {
  font-size: 0.73rem;
  color: var(--ion-color-medium, #808080);
  line-height: 1.4;
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
