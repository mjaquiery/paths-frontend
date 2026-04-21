<template>
  <ion-app>
    <NuxtPage />
    <AppFooter />
    <ion-toast
      :is-open="!!deferredPrompt"
      message="Install Paths for offline access"
      position="bottom"
      :buttons="installToastButtons"
      @did-dismiss="dismissInstall"
    />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonToast } from '@ionic/vue';
import AppFooter from '~/src/components/AppFooter.vue';
import { useInstallBanner } from '~/src/composables/useInstallBanner';

const { deferredPrompt, promptInstall, dismissInstall } = useInstallBanner();

const installToastButtons = [
  { text: 'Install', handler: promptInstall },
  { text: 'Not now', role: 'cancel' },
];
</script>
