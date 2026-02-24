<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('dismiss')">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('dismiss')">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p class="entry-detail-meta">
        <span
          class="entry-detail-path-dot"
          :style="{ backgroundColor: color }"
          :aria-label="pathTitle"
        ></span>
        {{ pathTitle }} &mdash; {{ day }}
      </p>
      <p class="entry-detail-content">{{ content || '(no text)' }}</p>
      <p v-if="hasImages" class="entry-detail-images">📷 Has images</p>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
} from '@ionic/vue';
import { computed } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  pathTitle: string;
  color: string;
  day: string;
  content: string;
  hasImages: boolean;
}>();

defineEmits<{
  dismiss: [];
}>();

const title = computed(() => props.day || 'Entry');
</script>

<style scoped>
.entry-detail-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--ion-color-medium, #888);
  margin-bottom: 12px;
}

.entry-detail-path-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.entry-detail-content {
  white-space: pre-wrap;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--ion-color-dark, #333);
}

.entry-detail-images {
  font-size: 0.85rem;
  color: var(--ion-color-medium, #888);
  margin-top: 12px;
}
</style>
