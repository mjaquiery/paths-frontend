<template>
  <div
    v-if="visible"
    class="session-expired-banner"
    role="status"
    aria-live="polite"
  >
    <button
      type="button"
      class="session-expired-banner__btn"
      @click="$emit('login')"
    >
      <span class="session-expired-banner__dot" aria-hidden="true" />
      Session expired — tap to log in
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
}>();

defineEmits<{
  login: [];
}>();
</script>

<style scoped>
/*
 * Deliberately never auto-dismisses — it replaces a toast that used to vanish after
 * a few seconds with no way to act on it. It stays up until a real login succeeds,
 * so the user always has a way back in, however many screens they wander through
 * first. See App.vue for why this lives inside #ion-view-container-root.
 */
.session-expired-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--ion-z-index-overlay, 999);
  border-bottom: 1px solid var(--color-rule);
  background: var(--footer-bg-error, #3d1f00);
}

.session-expired-banner__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  border: none;
  background: none;
  padding: 0.6rem var(--page-margin, 0.75rem);
  padding-top: calc(0.6rem + env(safe-area-inset-top));
  color: var(--footer-text-error, #f5a623);
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.session-expired-banner__dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}
</style>
