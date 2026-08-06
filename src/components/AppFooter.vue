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
      <!-- TEMP debug marker for the Android nav investigation — remove once confirmed fixed -->
      <span class="app-footer__version">{{ appVersion }}</span>
      <ion-button
        v-if="needsRefresh"
        fill="clear"
        size="small"
        class="app-footer__btn"
        aria-label="Reload to update"
        @click="apply"
      >
        Update
      </ion-button>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonButton } from '@ionic/vue';
import { useRefreshStatus } from '../composables/useRefreshStatus';
import { useServiceWorkerUpdate } from '../composables/useServiceWorkerUpdate';

const { isOnline, isFetching, hasError, statusType } = useRefreshStatus();
const { needsRefresh, apply } = useServiceWorkerUpdate();

// TEMP debug marker for the Android nav investigation — remove once confirmed fixed
const appVersion = import.meta.env.VITE_APP_VERSION ?? 'dev';

const isIdle = computed(
  () =>
    isOnline.value &&
    !isFetching.value &&
    !hasError.value &&
    !needsRefresh.value,
);

const statusMessage = computed(() => {
  if (needsRefresh.value) return 'Update available — tap to reload.';
  if (!isOnline.value) return 'Offline — changes will sync when reconnected.';
  if (hasError.value) return 'Unable to connect.';
  if (isFetching.value) return 'Checking…';
  return 'Up to date';
});

const footerClass = computed(() => ({
  'app-footer--idle': isIdle.value,
  'app-footer--syncing': !isIdle.value && isOnline.value && isFetching.value,
  'app-footer--error': isOnline.value && hasError.value,
  'app-footer--offline': !isOnline.value,
  'app-footer--update': needsRefresh.value,
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
.app-footer--update {
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

.app-footer__version {
  flex-shrink: 0;
  font-family: monospace;
  font-size: 0.65rem;
  opacity: 0.6;
}

.app-footer--offline .app-footer__message,
.app-footer--offline .app-footer__dot {
  color: var(--footer-text-offline, #f5c842);
}

.app-footer--error .app-footer__message,
.app-footer--error .app-footer__dot,
.app-footer--update .app-footer__message,
.app-footer--update .app-footer__dot {
  color: var(--footer-text-error, #f5a623);
}

.app-footer--syncing .app-footer__dot {
  animation: footer-pulse 1.5s ease-in-out infinite;
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
