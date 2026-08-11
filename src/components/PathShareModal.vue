<template>
  <ion-modal
    :is-open="isOpen"
    :aria-label="`Share &quot;${path.title}&quot;`"
    @didDismiss="onDismiss"
  >
    <div class="share-header df-ui">
      <span class="share-title">Share "{{ path.title }}"</span>
      <button class="text-btn" @click="onDismiss">Close</button>
    </div>
    <ion-content class="ion-padding df-ui">
      <PathSubscriptionManager
        :path-code="path.path_id"
        :path-title="path.title"
      />
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { IonModal, IonContent } from '@ionic/vue';

import type { PathResponse } from '../generated/types';
import PathSubscriptionManager from './PathSubscriptionManager.vue';

defineProps<{
  isOpen: boolean;
  path: PathResponse;
}>();

const emit = defineEmits<{
  dismiss: [];
}>();

function onDismiss() {
  emit('dismiss');
}
</script>

<style scoped>
.share-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-rule);
}

.share-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-ink);
}

.text-btn {
  background: none;
  border: none;
  color: var(--color-ink-muted);
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0.3rem 0;
}
</style>
