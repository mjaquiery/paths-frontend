import { computed, ref } from 'vue';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
const iosHintDismissed = ref(false);

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

// Safari (iOS and iPadOS) never fires beforeinstallprompt — there is no
// programmatic install API there, only the manual Share ▸ "Add to Home
// Screen" flow — so the usual banner is permanently invisible on it unless
// it gets its own hint instead.
function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ reports its UA as a desktop Mac, unlike a real Mac it
    // exposes multi-touch.
    (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  );
}

// Register the handler once at module load so the prompt is not lost if the
// composable is used in multiple components.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt.value = e as BeforeInstallPromptEvent;
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt.value = null;
  });
}

export function useInstallBanner() {
  const showIosInstallHint = computed(
    () =>
      !deferredPrompt.value &&
      !iosHintDismissed.value &&
      isIosSafari() &&
      !isStandalone(),
  );

  async function promptInstall() {
    if (!deferredPrompt.value) return;
    await deferredPrompt.value.prompt();
    await deferredPrompt.value.userChoice;
    deferredPrompt.value = null;
  }

  function dismissInstall() {
    deferredPrompt.value = null;
    iosHintDismissed.value = true;
  }

  return {
    deferredPrompt,
    showIosInstallHint,
    promptInstall,
    dismissInstall,
  };
}
