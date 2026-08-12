<template>
  <ion-modal
    :is-open="active"
    :backdrop-dismiss="false"
    class="saving-overlay-modal"
  >
    <div v-if="active" class="saving-overlay" data-testid="saving-overlay">
      <ion-spinner name="crescent" />
      <p>{{ label }}</p>
    </div>
  </ion-modal>
</template>

<script setup lang="ts">
import { IonModal, IonSpinner } from '@ionic/vue';

defineProps<{
  active: boolean;
  label: string;
}>();
</script>

<style scoped>
.saving-overlay-modal {
  --width: auto;
  --height: auto;
  --border-radius: 12px;
  --box-shadow: none;
}

.saving-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 2rem;
  color: var(--color-ink);
  font-size: 0.9rem;
}
</style>
