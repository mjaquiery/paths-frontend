import { ref } from 'vue';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);

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
  async function promptInstall() {
    if (!deferredPrompt.value) return;
    await deferredPrompt.value.prompt();
    await deferredPrompt.value.userChoice;
    deferredPrompt.value = null;
  }

  function dismissInstall() {
    deferredPrompt.value = null;
  }

  return { deferredPrompt, promptInstall, dismissInstall };
}
