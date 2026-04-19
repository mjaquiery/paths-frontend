<template>
  <ion-page>
    <slot />
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage } from '@ionic/vue';
</script>

<style scoped>
:deep(ion-content) {
  --background: var(--color-paper);
  --padding-start: var(--page-margin);
  --padding-end: var(--page-margin);
}
</style>
