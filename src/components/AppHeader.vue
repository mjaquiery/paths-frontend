<template>
  <ion-header>
    <ion-toolbar class="df-toolbar">
      <!-- Back button slot -->
      <ion-buttons v-if="showBack" slot="start">
        <ion-back-button :default-href="backHref" />
      </ion-buttons>

      <!-- Leading slot (e.g. logo) -->
      <slot name="start" />

      <!-- Title -->
      <ion-title class="df-header-title">
        <slot>{{ title }}</slot>
      </ion-title>

      <!-- Trailing slot (e.g. action buttons) -->
      <slot name="end" />
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
} from '@ionic/vue';

withDefaults(
  defineProps<{
    title?: string;
    showBack?: boolean;
    backHref?: string;
  }>(),
  {
    title: '',
    showBack: false,
    backHref: '/',
  },
);
</script>

<style scoped>
.df-toolbar {
  --background: var(--color-paper);
  --border-color: var(--color-rule);
  font-family: var(--font-sans);
}

.df-header-title {
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 1rem;
  color: var(--color-ink);
}
</style>
