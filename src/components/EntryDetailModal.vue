<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('dismiss')">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ currentEntry.day || 'Entry' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('dismiss')">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p class="entry-detail-meta">
        <span
          class="entry-detail-path-dot"
          :style="{ backgroundColor: currentEntry.color }"
          aria-hidden="true"
        ></span>
        {{ currentEntry.pathTitle }} &mdash; {{ currentEntry.day }}
      </p>
      <p class="entry-detail-content">
        {{ currentEntry.content || '(no text)' }}
      </p>
      <div
        v-if="currentEntry.images && currentEntry.images.length > 0"
        class="entry-detail-images"
      >
        <EntryImage
          v-for="img in currentEntry.images"
          :key="img.id"
          :image-id="img.id"
          :alt="img.filename"
        />
      </div>
    </ion-content>
    <ion-footer v-if="entries.length > 1">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button
            :disabled="currentIndex === 0"
            aria-label="Previous entry"
            @click="currentIndex--"
          >
            ‹ Prev
          </ion-button>
        </ion-buttons>
        <p class="entry-detail-counter">
          {{ currentIndex + 1 }} / {{ entries.length }}
        </p>
        <ion-buttons slot="end">
          <ion-button
            :disabled="currentIndex === entries.length - 1"
            aria-label="Next entry"
            @click="currentIndex++"
          >
            Next ›
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonHeader,
  IonFooter,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
} from '@ionic/vue';
import { computed, ref, watch } from 'vue';
import type { ImageResponse } from '../generated/types';
import EntryImage from './EntryImage.vue';

export interface EntryDetailData {
  pathId: string;
  entryId: string;
  pathTitle: string;
  color: string;
  day: string;
  content: string;
  hasImages: boolean;
  images?: ImageResponse[];
}

const props = defineProps<{
  isOpen: boolean;
  entries: EntryDetailData[];
  startIndex: number;
}>();

defineEmits<{
  dismiss: [];
}>();

const currentIndex = ref(props.startIndex);

// Reset to the clicked entry whenever the modal opens
watch(
  () => props.isOpen,
  (open) => {
    if (open) currentIndex.value = props.startIndex;
  },
);

const currentEntry = computed<EntryDetailData>(
  () =>
    props.entries[currentIndex.value] ?? {
      pathId: '',
      entryId: '',
      pathTitle: '',
      color: '',
      day: '',
      content: '',
      hasImages: false,
      images: [],
    },
);
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
  padding: 0 4px;
}

.entry-detail-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding: 0 4px;
}

.entry-detail-counter {
  text-align: center;
  font-size: 0.85rem;
  color: var(--ion-color-medium, #888);
  margin: 0;
}
</style>
