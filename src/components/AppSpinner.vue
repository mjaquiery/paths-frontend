<template>
  <div class="app-spinner" :class="`app-spinner--${size}`" role="status">
    <ion-spinner name="crescent" :class="`app-spinner__icon--${size}`" />
    <span v-if="label" class="app-spinner__label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { IonSpinner } from '@ionic/vue';

withDefaults(
  defineProps<{
    label?: string;
    size?: 'small' | 'medium' | 'large';
  }>(),
  {
    size: 'medium',
  },
);
</script>

<style scoped>
.app-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px;
  font-family: var(--font-sans);
  color: var(--color-ink-muted);
  font-size: 0.875rem;
}

.app-spinner--small {
  padding: 8px;
}

.app-spinner--large {
  padding: 64px;
}

.app-spinner__icon--small {
  --width: 20px;
  --height: 20px;
}

.app-spinner__icon--large {
  --width: 48px;
  --height: 48px;
}
</style>
