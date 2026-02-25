<template>
  <a
    :href="imageUrl || undefined"
    target="_blank"
    rel="noopener noreferrer"
    class="entry-image-link"
    :aria-label="alt || 'View image'"
  >
    <img
      v-if="imageUrl"
      :src="thumbnailUrl || imageUrl"
      :alt="alt || 'Entry image'"
      class="entry-image-thumb"
      loading="lazy"
    />
    <span v-else-if="isLoading" class="entry-image-placeholder" aria-label="Loading image">⏳</span>
    <span
      v-else
      class="entry-image-placeholder entry-image-placeholder--error"
      :title="errorMessage || 'Failed to load image'"
      :aria-label="errorMessage || 'Failed to load image'"
    >⚠️</span>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGetImageDownloadUrl } from '../generated/apiClient';
import type { ImageDownloadResponse } from '../generated/types';
import { extractErrorMessage } from '../lib/errors';

const props = defineProps<{
  imageId: string;
  alt?: string;
}>();

const { data, isLoading, error } = useGetImageDownloadUrl(computed(() => props.imageId));

const imageUrl = computed(
  () => (data.value?.data as ImageDownloadResponse | undefined)?.image_url ?? null,
);
const thumbnailUrl = computed(
  () => (data.value?.data as ImageDownloadResponse | undefined)?.thumbnail_url ?? null,
);
const errorMessage = computed(() => extractErrorMessage(error.value));
</script>

<style scoped>
.entry-image-link {
  display: inline-block;
  text-decoration: none;
}

.entry-image-thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--ion-color-light-shade, #e0e0e0);
}

.entry-image-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: var(--ion-color-light, #f4f4f4);
  border-radius: 4px;
  font-size: 1.5rem;
  border: 1px solid var(--ion-color-light-shade, #e0e0e0);
}
</style>
