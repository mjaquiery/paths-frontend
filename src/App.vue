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

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonToast } from '@ionic/vue';
import { Capacitor } from '@capacitor/core';
import { Keyboard } from '@capacitor/keyboard';
import { onBeforeUnmount, onMounted } from 'vue';
import { useInstallBanner } from './composables/useInstallBanner';
import { useVirtualKeyboard } from './composables/useVirtualKeyboard';
import AppFooter from './components/AppFooter.vue';

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
  });

  onBeforeUnmount(() => {
    showListener?.remove();
    hideListener?.remove();
  });
} else {
  useVirtualKeyboard();
}
</script>
