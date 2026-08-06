import { ref } from 'vue';
import { registerSW } from 'virtual:pwa-register';

const UPDATE_CHECK_INTERVAL_MS = 60 * 1000;

const needsRefresh = ref(false);
let applyUpdate: (() => Promise<void>) | null = null;

/**
 * Boots the service worker once (call from main.ts) and exposes reactive "an update is
 * ready" state that AppFooter surfaces to the user — registerType: 'prompt' means the new
 * app shell is downloaded but not activated until the user says so, so nobody silently
 * lands on a stale cached build with no way to know a refresh would help.
 *
 * The browser only re-fetches and diffs the SW script on real navigation, which an SPA
 * essentially never does once a tab is open. Without polling registration.update()
 * ourselves, a long-lived tab would never learn a new deploy exists — so we check on an
 * interval and whenever the tab regains focus/visibility.
 */
export function registerServiceWorkerUpdates() {
  applyUpdate = registerSW({
    immediate: true,
    onNeedRefresh() {
      needsRefresh.value = true;
    },
    onRegisteredSW(_swScriptUrl, registration) {
      if (!registration) return;

      const checkForUpdate = () => {
        registration.update().catch(() => {
          // Update checks are best-effort; a failed check just means we try again later.
        });
      };

      setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS);

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate();
      });
      window.addEventListener('focus', checkForUpdate);
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
