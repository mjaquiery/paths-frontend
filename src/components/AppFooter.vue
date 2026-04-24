<template>
  <footer
    class="app-footer"
    :class="footerClass"
    role="status"
    aria-live="polite"
    aria-label="Connectivity status"
  >
    <div class="app-footer__content">
      <span class="app-footer__dot" aria-hidden="true" />
      <span class="app-footer__message">{{ statusMessage }}</span>
      <span
        v-if="pendingOpsCount > 0"
        class="app-footer__count"
        :aria-label="`${pendingOpsCount} ${pendingOpsCount === 1 ? 'change' : 'changes'} queued`"
      >
        {{ pendingOpsCount }}
      </span>
      <ion-button
        v-if="canRetry"
        fill="clear"
        size="small"
        class="app-footer__btn"
        aria-label="Retry sync"
        @click="retrySync"
      >
        Retry
      </ion-button>
      <ion-button
        v-if="hasConflict"
        fill="clear"
        size="small"
        class="app-footer__btn"
        aria-label="Resolve conflict"
        @click="clearError"
      >
        Resolve
      </ion-button>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonButton } from '@ionic/vue';
import { useRefreshStatus } from '../composables/useRefreshStatus';

const {
  isOnline,
  isSyncing: _isSyncing,
  pendingOpsCount,
  lastError,
  hasConflict,
  retrySync,
  clearError,
  statusType,
} = (() => {
  const rs = useRefreshStatus();
  return {
    ...rs,
    isSyncing: rs.isFetching,
  };
})();

const isSyncing = _isSyncing;

const isIdle = computed(
  () =>
    isOnline.value &&
    !isSyncing.value &&
    !lastError.value &&
    !hasConflict.value &&
    pendingOpsCount.value === 0,
);

const canRetry = computed(
  () => isOnline.value && !!lastError.value && !hasConflict.value,
);

const statusMessage = computed(() => {
  if (!isOnline.value) {
    return pendingOpsCount.value > 0
      ? `Offline — ${pendingOpsCount.value} ${pendingOpsCount.value === 1 ? 'change' : 'changes'} queued.`
      : 'Offline — changes will sync when reconnected.';
  }
  if (hasConflict.value) return 'Edit conflict — tap to resolve.';
  if (lastError.value)
    return `Failed to sync ${pendingOpsCount.value > 0 ? pendingOpsCount.value + ' ' : ''}${pendingOpsCount.value === 1 ? 'change' : 'changes'}. Tap to retry.`;
  if (isSyncing.value)
    return pendingOpsCount.value > 0
      ? `Syncing ${pendingOpsCount.value} ${pendingOpsCount.value === 1 ? 'change' : 'changes'}…`
      : 'Syncing…';
  return 'Up to date';
});

const footerClass = computed(() => ({
  'app-footer--idle': isIdle.value,
  'app-footer--syncing': !isIdle.value && isOnline.value && isSyncing.value,
  'app-footer--error':
    isOnline.value && !!lastError.value && !hasConflict.value,
  'app-footer--conflict': hasConflict.value,
  'app-footer--offline': !isOnline.value,
  [`app-footer--${statusType.value}`]: true,
}));
</script>

<style scoped>
.app-footer {
  position: fixed;
  bottom: var(--keyboard-height, 0px);
  left: 0;
  right: 0;
  z-index: var(--ion-z-index-overlay, 999);
  padding-bottom: env(safe-area-inset-bottom);
  transition:
    height 0.2s ease,
    background 0.2s ease,
    bottom 0.1s ease;
  background: var(--footer-bg-active, var(--color-paper));
  border-top: var(--footer-border, 1px solid var(--color-rule));
  height: var(--footer-height-active, 3rem);
}

.app-footer--idle {
  height: var(--footer-height-idle, 2rem);
  background: var(--footer-bg-idle, transparent);
}

.app-footer--offline {
  background: var(--footer-bg-offline, #3d2b00);
}

.app-footer--error,
.app-footer--conflict {
  background: var(--footer-bg-error, #3d1f00);
}

.app-footer__content {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 var(--page-margin, 0.75rem);
  height: 100%;
  font-size: 0.75rem;
  font-family: var(--font-sans, system-ui, sans-serif);
}

.app-footer__dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.app-footer__message {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--footer-text-active, var(--color-ink));
}

.app-footer--idle .app-footer__message {
  color: var(--footer-text-idle, var(--color-ink-muted));
}

.app-footer--offline .app-footer__message,
.app-footer--offline .app-footer__dot {
  color: var(--footer-text-offline, #f5c842);
}

.app-footer--error .app-footer__message,
.app-footer--error .app-footer__dot,
.app-footer--conflict .app-footer__message,
.app-footer--conflict .app-footer__dot {
  color: var(--footer-text-error, #f5a623);
}

.app-footer--syncing .app-footer__dot {
  animation: footer-pulse 1.5s ease-in-out infinite;
}

.app-footer__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 4px;
  border-radius: 999px;
  background: currentColor;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1;
  flex-shrink: 0;
  color: inherit;
}

.app-footer--idle .app-footer__count,
.app-footer--syncing .app-footer__count {
  background: var(--ion-color-warning, #f57c00);
  color: #fff;
}

.app-footer--error .app-footer__count,
.app-footer--conflict .app-footer__count {
  background: var(--footer-text-error, #f5a623);
  color: #1a1a18;
}

.app-footer--offline .app-footer__count {
  background: var(--footer-text-offline, #f5c842);
  color: #1a1a18;
}

.app-footer__btn {
  --color: currentColor;
  --padding-start: 6px;
  --padding-end: 6px;
  flex-shrink: 0;
  height: 1.5rem;
  font-size: 0.7rem;
}

@keyframes footer-pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
