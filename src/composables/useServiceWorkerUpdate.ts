import { ref } from 'vue';
import { registerSW } from 'virtual:pwa-register';

const needsRefresh = ref(false);
let applyUpdate: (() => Promise<void>) | null = null;

/**
 * Boots the service worker once (call from main.ts) and exposes reactive "an update is
 * ready" state that AppFooter surfaces to the user — registerType: 'prompt' means the new
 * app shell is downloaded but not activated until the user says so, so nobody silently
 * lands on a stale cached build with no way to know a refresh would help.
 */
export function registerServiceWorkerUpdates() {
  applyUpdate = registerSW({
    immediate: true,
    onNeedRefresh() {
      needsRefresh.value = true;
    },
  });
}

export function useServiceWorkerUpdate() {
  async function apply() {
    if (!applyUpdate) return;
    await applyUpdate();
    needsRefresh.value = false;
  }

  return { needsRefresh, apply };
}
