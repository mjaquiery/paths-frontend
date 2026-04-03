<template>
  <div class="entry-image-draft-preview">
    <img
      v-if="previewUrl"
      :src="previewUrl"
      :alt="alt || filename"
      class="entry-image-draft-preview__image"
    />
    <EntryImage
      v-else-if="imageId"
      :image-id="imageId"
      :alt="alt || filename"
      :linked="false"
    />
    <span v-else class="entry-image-draft-preview__placeholder">🖼️</span>

    <!-- Uploading overlay -->
    <div
      v-if="uploading"
      class="entry-image-draft-preview__overlay"
      aria-hidden="true"
    >
      <span class="entry-image-draft-preview__spinner" />
    </div>
  </div>
</template>

<script setup lang="ts">
import EntryImage from './EntryImage.vue';

defineProps<{
  imageId?: string | null;
  previewUrl?: string | null;
  filename: string;
  alt?: string;
  /** When true, show a loading overlay over the preview box */
  uploading?: boolean;
}>();
</script>

<style scoped>
.entry-image-draft-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.entry-image-draft-preview__image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--ion-color-light-shade, #e0e0e0);
}

.entry-image-draft-preview__placeholder {
  display: inline-flex;
  width: 80px;
  height: 80px;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: var(--ion-color-light, #f4f4f4);
  border: 1px solid var(--ion-color-light-shade, #e0e0e0);
  font-size: 1.5rem;
}

.entry-image-draft-preview__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.35);
}

.entry-image-draft-preview__spinner {
  display: inline-block;
  width: 22px;
  height: 22px;
  border: 3px solid rgba(255, 255, 255, 0.6);
  border-right-color: transparent;
  border-radius: 50%;
  animation: draft-preview-spin 0.75s linear infinite;
}

@keyframes draft-preview-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
