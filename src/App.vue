<template>
  <ion-app>
    <ion-router-outlet />
    <ion-toast
      :is-open="!!deferredPrompt"
      message="Install Paths for offline access"
      position="bottom"
      :buttons="installToastButtons"
      @didDismiss="dismissInstall"
    />
    <AppFooter />
  </ion-app>
</template>

<style scoped>
ion-toast {
  --background: var(--color-paper);
  --color: var(--color-ink);
  --button-color: var(--color-ink);
  --border-color: var(--color-rule);
  --border-width: 1px;
  --border-style: solid;
}

/* md mode hardcodes .toast-button-cancel to a light grey meant for a dark
   toast background, ignoring --button-color entirely — override via the
   exposed shadow part instead, since it fails contrast against --color-paper. */
ion-toast::part(cancel) {
  color: var(--color-ink);
}
</style>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonToast } from '@ionic/vue';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { App as CapacitorApp } from '@capacitor/app';
import { onBeforeUnmount, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useInstallBanner } from './composables/useInstallBanner';
import { useVirtualKeyboard } from './composables/useVirtualKeyboard';
import AppFooter from './components/AppFooter.vue';

const router = useRouter();

const { deferredPrompt, promptInstall, dismissInstall } = useInstallBanner();

const installToastButtons = [
  { text: 'Install', handler: promptInstall },
  { text: 'Not now', role: 'cancel' },
];

// iOS/Android keyboard-overlay fix is platform-conditional: native uses Capacitor's own
// Keyboard plugin (authoritative inside a WebView, where visualViewport is less reliable),
// web/PWA falls back to the visualViewport-based composable. Only one is ever active.
if (Capacitor.isNativePlatform()) {
  let showListener: { remove: () => void } | undefined;
  let hideListener: { remove: () => void } | undefined;
  let backButtonListener: { remove: () => void } | undefined;

  onMounted(async () => {
    showListener = await Keyboard.addListener('keyboardDidShow', (info) => {
      document.documentElement.style.setProperty(
        '--keyboard-height',
        `${info.keyboardHeight}px`,
      );
    });
    hideListener = await Keyboard.addListener('keyboardDidHide', () => {
      document.documentElement.style.setProperty('--keyboard-height', '0px');
    });
    // Capacitor doesn't handle the Android hardware back button on its own —
    // without this listener it's a dead no-op anywhere in the app.
    backButtonListener = await CapacitorApp.addListener(
      'backButton',
      ({ canGoBack }) => {
        if (canGoBack) {
          router.back();
        } else {
          void CapacitorApp.exitApp();
        }
      },
    );
  });

  onBeforeUnmount(() => {
    showListener?.remove();
    hideListener?.remove();
    backButtonListener?.remove();
  });
} else {
  useVirtualKeyboard();
}
</script>
