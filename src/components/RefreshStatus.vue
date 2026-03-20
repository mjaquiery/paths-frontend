<template>
  <button
    class="refresh-status"
    :class="`refresh-status--${statusType}`"
    :aria-label="ariaLabel"
    :aria-expanded="expanded"
    @click="expanded = !expanded"
  >
    <span class="refresh-status__dot" aria-hidden="true" />
    <span class="refresh-status__text">{{ statusText }}</span>

    <Transition name="refresh-status-detail">
      <div
        v-if="expanded"
        class="refresh-status__detail"
        role="status"
        aria-live="polite"
      >
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
        <template v-else> No recent check recorded. </template>
      </div>
    </Transition>
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { RefreshStatusType } from '../composables/useRefreshStatus';

const props = defineProps<{
  statusType: RefreshStatusType;
  statusText: string;
  lastCheckedAt: Date | null;
}>();

const expanded = ref(false);

const ariaLabel = computed(() => {
  const base = `Refresh status: ${props.statusText || 'unknown'}`;
  return expanded.value
    ? `${base}. Click to collapse.`
    : `${base}. Click to expand.`;
});
</script>

<style scoped>
.refresh-status {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  padding: 4px 8px;
  border: none;
  background: none;
  cursor: pointer;
  color: inherit;
  font-size: 0.7rem;
  opacity: 0.6;
  transition: opacity 0.2s;
  line-height: 1.2;
}

.refresh-status:hover,
.refresh-status:focus-visible {
  opacity: 1;
  outline: none;
}

.refresh-status__dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  margin-right: 4px;
  vertical-align: middle;
  flex-shrink: 0;
}

/* First row: dot + text side-by-side */
.refresh-status__text {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

/* Status colour variants */
.refresh-status--ok {
  color: var(--ion-color-medium, #808080);
}

.refresh-status--fetching {
  color: var(--ion-color-medium, #808080);
  animation: refresh-pulse 1.5s ease-in-out infinite;
}

.refresh-status--offline {
  color: var(--ion-color-warning, #f57c00);
  opacity: 0.85;
}

.refresh-status--error {
  color: var(--ion-color-danger, #eb445a);
  opacity: 0.85;
}

/* Expanded detail panel */
.refresh-status__detail {
  font-size: 0.68rem;
  text-align: right;
  max-width: 220px;
  white-space: normal;
  padding-top: 2px;
}

/* Transition for expand/collapse */
.refresh-status-detail-enter-active,
.refresh-status-detail-leave-active {
  transition:
    opacity 0.2s,
    max-height 0.2s;
  overflow: hidden;
  max-height: 60px;
}

.refresh-status-detail-enter-from,
.refresh-status-detail-leave-to {
  opacity: 0;
  max-height: 0;
}

@keyframes refresh-pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
