import { watch, onUnmounted } from 'vue';

/**
 * Intercepts the browser's back button when a modal is open so that it closes
 * the modal instead of navigating to the previous route.
 *
 * Strategy:
 *  - When the modal opens, push a dummy history entry so the back button has
 *    somewhere to go without leaving the current page.
 *  - On popstate (back button), emit dismiss and mark the pushed entry consumed.
 *  - When the modal closes via its own UI (e.g. a "Close" button), pop the
 *    dummy entry so the history stays clean; a flag prevents the resulting
 *    popstate from triggering dismiss a second time.
 */
export function useModalBackNavigation(
  isOpen: () => boolean,
  onDismiss: () => void,
): void {
  if (typeof window === 'undefined') return;

  let pushed = false;
  let ignoreNextPop = false;

  watch(isOpen, (open, wasOpen) => {
    if (open) {
      window.history.pushState({ modal: true }, '');
      pushed = true;
    } else if (wasOpen && pushed) {
      // Modal closed via its own UI – clean up the dummy history entry.
      pushed = false;
      ignoreNextPop = true;
      window.history.back();
    }
  });

  function handlePopState() {
    if (ignoreNextPop) {
      ignoreNextPop = false;
      return;
    }
    if (pushed) {
      pushed = false;
      onDismiss();
    }
  }

  window.addEventListener('popstate', handlePopState);

  onUnmounted(() => {
    window.removeEventListener('popstate', handlePopState);
    // If the component unmounts while the modal is open, clean up the
    // history entry we pushed.
    if (pushed) {
      pushed = false;
      ignoreNextPop = true;
      window.history.back();
    }
  });
}
