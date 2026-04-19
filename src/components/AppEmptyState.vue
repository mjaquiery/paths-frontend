<template>
  <div class="app-empty-state">
    <p class="app-empty-state__message">
      <slot>Nothing here yet.</slot>
    </p>
    <ion-button
      v-if="ctaLabel && ctaHref"
      :router-link="ctaHref"
      router-direction="forward"
      class="app-empty-state__cta"
    >
      {{ ctaLabel }}
    </ion-button>
    <ion-button
      v-else-if="ctaLabel"
      class="app-empty-state__cta"
      @click="emit('cta')"
    >
      {{ ctaLabel }}
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue';

defineProps<{
  ctaLabel?: string;
  ctaHref?: string;
}>();

const emit = defineEmits<{
  cta: [];
}>();
</script>

<style scoped>
.app-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px var(--page-margin);
  text-align: center;
  gap: 16px;
}

.app-empty-state__message {
  font-family: var(--font-serif);
  color: var(--color-ink-muted);
  font-size: 1rem;
  margin: 0;
}
</style>
