<template>
  <div v-if="message" class="app-error-banner" role="alert">
    <span class="app-error-banner__text">{{ message }}</span>
    <button
      v-if="dismissible"
      class="app-error-banner__dismiss"
      aria-label="Dismiss error"
      @click="emit('dismiss')"
    >
      ✕
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string;
  dismissible?: boolean;
}>();

const emit = defineEmits<{
  dismiss: [];
}>();
</script>

<style scoped>
.app-error-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  padding: 10px var(--page-margin);
  background: rgba(198, 40, 40, 0.08);
  border-left: 3px solid var(--ion-color-danger, #c62828);
  color: var(--ion-color-danger, #c62828);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.4;
  box-sizing: border-box;
}

.app-error-banner__text {
  flex: 1;
}

.app-error-banner__dismiss {
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  font-size: 0.875rem;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
}
</style>
