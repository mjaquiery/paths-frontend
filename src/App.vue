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
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonToast } from '@ionic/vue';
import { useInstallBanner } from './composables/useInstallBanner';

const { deferredPrompt, promptInstall, dismissInstall } = useInstallBanner();

const installToastButtons = [
  { text: 'Install', handler: promptInstall },
  { text: 'Not now', role: 'cancel' },
];
</script>
