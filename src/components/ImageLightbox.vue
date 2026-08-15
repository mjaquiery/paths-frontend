<template>
  <ion-modal
    class="image-lightbox-modal"
    :is-open="isOpen"
    :aria-label="
      currentImage ? `Viewing ${currentImage.filename}` : 'Image viewer'
    "
    @didDismiss="onDismiss"
  >
    <div v-if="currentImage" class="lightbox df-ui">
      <div class="lightbox-topbar">
        <span v-if="images.length > 1" class="lightbox-counter">
          {{ currentIndex + 1 }} / {{ images.length }}
        </span>
        <button
          type="button"
          class="lightbox-icon-btn"
          aria-label="Close"
          @click="onDismiss"
        >
          ✕
        </button>
      </div>

      <div class="lightbox-image-wrap">
        <button
          v-if="images.length > 1"
          type="button"
          class="lightbox-nav lightbox-nav--prev"
          aria-label="Previous image"
          @click="prev"
        >
          ‹
        </button>

        <span
          v-if="isLoading"
          class="lightbox-placeholder"
          aria-label="Loading image"
          >⏳</span
        >
        <span
          v-else-if="!fullImageUrl || loadFailed"
          class="lightbox-placeholder lightbox-placeholder--error"
          :aria-label="errorMessage || 'Failed to load image'"
          >⚠️</span
        >
        <img
          v-else
          :src="fullImageUrl"
          :alt="currentImage.filename"
          class="lightbox-image"
          @error="loadFailed = true"
        />

        <button
          v-if="images.length > 1"
          type="button"
          class="lightbox-nav lightbox-nav--next"
          aria-label="Next image"
          @click="next"
        >
          ›
        </button>
      </div>

      <p v-if="currentImage.caption" class="lightbox-caption">
        {{ currentImage.caption }}
      </p>

      <div class="lightbox-actions">
        <button
          type="button"
          class="lightbox-download-btn"
          :disabled="!fullImageUrl || downloading"
          @click="handleDownload"
        >
          {{ downloading ? 'Downloading…' : 'Download full resolution' }}
        </button>
        <p v-if="downloadError" class="lightbox-error">{{ downloadError }}</p>
      </div>
    </div>
  </ion-modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { IonModal } from '@ionic/vue';

import { useGetImageDownloadUrl } from '../generated/apiClient';
import type { ImageDownloadResponse, ImageResponse } from '../generated/types';
import { extractErrorMessage } from '../lib/errors';
import { downloadFileFromUrl } from '../utils/export';
import { buildImageDownloadFilename } from '../utils/imageDownload';

const props = defineProps<{
  isOpen: boolean;
  images: ImageResponse[];
  startIndex: number;
  day: string;
}>();

const emit = defineEmits<{
  dismiss: [];
}>();

const currentIndex = ref(props.startIndex);
const loadFailed = ref(false);

watch(
  () => [props.isOpen, props.startIndex] as const,
  ([open, startIndex]) => {
    if (open) {
      currentIndex.value = startIndex;
      loadFailed.value = false;
    }
  },
);
watch(currentIndex, () => (loadFailed.value = false));

const currentImage = computed<ImageResponse | undefined>(
  () => props.images[currentIndex.value],
);

const { data, isLoading, error } = useGetImageDownloadUrl(
  computed(() => currentImage.value?.id ?? ''),
);

const fullImageUrl = computed(
  () =>
    (data.value?.data as ImageDownloadResponse | undefined)?.image_url ?? null,
);
const errorMessage = computed(() => extractErrorMessage(error.value));

function prev() {
  currentIndex.value =
    (currentIndex.value - 1 + props.images.length) % props.images.length;
}
function next() {
  currentIndex.value = (currentIndex.value + 1) % props.images.length;
}

function onDismiss() {
  emit('dismiss');
}

const downloading = ref(false);
const downloadError = ref('');

async function handleDownload() {
  const url = fullImageUrl.value;
  const image = currentImage.value;
  if (!url || !image) return;
  downloading.value = true;
  downloadError.value = '';
  try {
    await downloadFileFromUrl(
      url,
      buildImageDownloadFilename(props.day, image),
    );
  } catch (err: unknown) {
    downloadError.value =
      extractErrorMessage(err) ?? 'Failed to download image.';
  } finally {
    downloading.value = false;
  }
}
</script>

<style scoped>
.image-lightbox-modal {
  --background: rgba(0, 0, 0, 0.92);
  --box-shadow: none;
}

.lightbox {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #fff;
}

.lightbox-topbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 0.75rem 1rem;
}

.lightbox-counter {
  margin-right: auto;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.75);
}

.lightbox-icon-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.4rem;
  line-height: 1;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
}

.lightbox-image-wrap {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding: 0 1rem;
}

.lightbox-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.lightbox-placeholder {
  font-size: 2.5rem;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.4);
  border: none;
  color: #fff;
  font-size: 2rem;
  line-height: 1;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  cursor: pointer;
}

.lightbox-nav--prev {
  left: 0.5rem;
}

.lightbox-nav--next {
  right: 0.5rem;
}

.lightbox-caption {
  margin: 0;
  padding: 0.75rem 1.25rem 0;
  text-align: center;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
}

.lightbox-actions {
  padding: 0.75rem 1.25rem 1.25rem;
  text-align: center;
}

.lightbox-download-btn {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #fff;
  border-radius: 999px;
  padding: 0.5rem 1.25rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.lightbox-download-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.lightbox-error {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: #ff8a8a;
}
</style>
