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
  </div>
</template>

<script setup lang="ts">
import EntryImage from './EntryImage.vue';

defineProps<{
  imageId?: string | null;
  previewUrl?: string | null;
  filename: string;
  alt?: string;
}>();
</script>

<style scoped>
.entry-image-draft-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
</style>
