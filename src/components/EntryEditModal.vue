<template>
  <ion-modal :is-open="isOpen" @didDismiss="onDismiss">
    <ion-header>
      <ion-toolbar>
        <ion-title>Edit Entry</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="onDismiss">Cancel</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <!-- Text content -->
      <ion-item>
        <ion-label position="stacked">Content *</ion-label>
        <div class="content-tabs">
          <button
            class="content-tab"
            :class="{ active: contentTab === 'write' }"
            type="button"
            @click="contentTab = 'write'"
          >
            Write
          </button>
          <button
            class="content-tab"
            :class="{ active: contentTab === 'preview' }"
            type="button"
            @click="contentTab = 'preview'"
          >
            Preview
          </button>
        </div>
        <ion-textarea
          v-if="contentTab === 'write'"
          v-model="content"
          placeholder="Write your entry… (markdown supported)"
          :rows="6"
          auto-grow
          autocapitalize="sentences"
          autocorrect="on"
          spellcheck="true"
        />
        <div v-else class="content-preview">
          <MarkdownContent v-if="content" :content="content" />
          <p v-else class="content-preview-empty">(nothing to preview)</p>
        </div>
      </ion-item>

      <!-- Existing images -->
      <ion-item v-if="keptImages.length > 0 || removedImages.length > 0">
        <ion-label position="stacked">Images</ion-label>
        <div class="existing-images">
          <div
            v-for="img in keptImages"
            :key="img.id"
            class="existing-image-item"
          >
            <span class="existing-image-name">{{ img.filename }}</span>
            <button
              class="remove-image-btn"
              type="button"
              :aria-label="`Remove image ${img.filename}`"
              @click="removeImage(img.id)"
            >
              ✕
            </button>
          </div>
          <div
            v-for="img in removedImages"
            :key="img.id"
            class="existing-image-item existing-image-item--removed"
          >
            <span class="existing-image-name">{{ img.filename }}</span>
            <button
              class="restore-image-btn"
              type="button"
              :aria-label="`Restore image ${img.filename}`"
              @click="restoreImage(img.id)"
            >
              ↩
            </button>
          </div>
        </div>
      </ion-item>

      <!-- New image upload -->
      <ion-item>
        <ion-label position="stacked">Add images (optional)</ion-label>
        <input
          type="file"
          accept="image/*"
          multiple
          class="image-file-input"
          @change="onFilesSelected"
        />
      </ion-item>
      <div v-if="pendingImages.length > 0" class="pending-images">
        <span
          v-for="img in pendingImages"
          :key="img.name"
          class="pending-image-name"
        >
          {{ img.name }}
        </span>
      </div>

      <p v-if="conflictError" class="entry-error entry-error--conflict">
        {{ conflictError }}
      </p>
      <p v-else-if="error" class="entry-error">{{ error }}</p>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <div class="entry-modal-actions">
          <ion-button
            expand="block"
            :disabled="!content.trim() || saving"
            @click="submit"
          >
            {{ saving ? 'Saving…' : 'Save Changes' }}
          </ion-button>
        </div>
      </ion-toolbar>
    </ion-footer>
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
  IonFooter,
  IonItem,
  IonLabel,
  IonTextarea,
} from '@ionic/vue';
import { ref, watch } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';

import type { ImageResponse, ImageUploadResponse } from '../generated/types';
import {
  useUpdateEntry,
  useCreateImageUploadUrl,
  useCompleteImageUpload,
} from '../generated/apiClient';
import { extractErrorMessage } from '../lib/errors';
import { db } from '../lib/db';
import MarkdownContent from './MarkdownContent.vue';
import type { EntryDetailData } from './EntryDetailModal.vue';

const DEFAULT_IMAGE_CONTENT_TYPE = 'image/jpeg';
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const props = defineProps<{
  isOpen: boolean;
  entry: EntryDetailData;
}>();

const emit = defineEmits<{
  dismiss: [];
  saved: [];
}>();

const queryClient = useQueryClient();
const { mutateAsync: doUpdateEntry } = useUpdateEntry();
const { mutateAsync: getUploadUrl } = useCreateImageUploadUrl();
const { mutateAsync: completeUpload } = useCompleteImageUpload();

const content = ref('');
const contentTab = ref<'write' | 'preview'>('write');
const keptImages = ref<ImageResponse[]>([]);
const removedImages = ref<ImageResponse[]>([]);
const pendingImages = ref<File[]>([]);
const saving = ref(false);
const error = ref('');
const conflictError = ref('');

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      content.value = props.entry.content ?? '';
      contentTab.value = 'write';
      keptImages.value = props.entry.images ? [...props.entry.images] : [];
      removedImages.value = [];
      pendingImages.value = [];
      error.value = '';
      conflictError.value = '';
    }
  },
);

function removeImage(imageId: string) {
  const idx = keptImages.value.findIndex((img) => img.id === imageId);
  if (idx !== -1) {
    const [removed] = keptImages.value.splice(idx, 1);
    if (removed) removedImages.value.push(removed);
  }
}

function restoreImage(imageId: string) {
  const idx = removedImages.value.findIndex((img) => img.id === imageId);
  if (idx !== -1) {
    const [restored] = removedImages.value.splice(idx, 1);
    if (restored) keptImages.value.push(restored);
  }
}

function onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files ? Array.from(input.files) : [];
  const wrongType = files.filter((f) => !ALLOWED_IMAGE_TYPES.has(f.type));
  const tooLarge = files.filter(
    (f) => ALLOWED_IMAGE_TYPES.has(f.type) && f.size > MAX_IMAGE_SIZE_BYTES,
  );
  if (wrongType.length > 0 || tooLarge.length > 0) {
    const messages: string[] = [];
    if (wrongType.length > 0) {
      messages.push(`Not an image: ${wrongType.map((f) => f.name).join(', ')}`);
    }
    if (tooLarge.length > 0) {
      messages.push(`Exceeds 10 MB: ${tooLarge.map((f) => f.name).join(', ')}`);
    }
    error.value = `Some files were rejected. ${messages.join('; ')}`;
    input.value = '';
    pendingImages.value = [];
    return;
  }
  error.value = '';
  pendingImages.value = files;
}

async function uploadImages(): Promise<string[]> {
  const filenames: string[] = [];
  for (const file of pendingImages.value) {
    const contentType = file.type || DEFAULT_IMAGE_CONTENT_TYPE;
    const uploadResp = await getUploadUrl({
      pathCode: props.entry.pathId,
      entrySlug: props.entry.entryId,
      data: { filename: file.name, content_type: contentType },
    });
    const { image_id, upload_url } = uploadResp.data as ImageUploadResponse;
    const response = await fetch(upload_url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': contentType },
    });
    if (!response.ok) {
      throw new Error(`Image upload failed with status ${response.status}`);
    }
    await completeUpload({
      imageId: image_id,
      data: { byte_size: file.size },
    });
    filenames.push(file.name);
  }
  return filenames;
}

async function submit() {
  if (!content.value.trim() || props.entry.edit_id === undefined) return;
  saving.value = true;
  error.value = '';
  conflictError.value = '';

  try {
    // Upload new images first, then combine with kept filenames
    const newFilenames = await uploadImages();
    const keptFilenames = keptImages.value.map((img) => img.filename);
    const image_filenames = [...keptFilenames, ...newFilenames];

    await doUpdateEntry({
      pathCode: props.entry.pathId,
      entrySlug: props.entry.entryId,
      data: {
        expected_edit_id: props.entry.edit_id,
        content: content.value,
        image_filenames,
      },
    });

    // Invalidate cached queries so the week view reflects the update
    void queryClient.invalidateQueries({
      queryKey: ['v1', 'paths', props.entry.pathId, 'entries'],
    });

    // Evict local Dexie cache for this entry so fresh data is fetched
    try {
      const cacheKey = `${props.entry.pathId}:${props.entry.entryId}`;
      await db.entryContent.delete(cacheKey);
      await db.entryImages
        .where('entry_id')
        .equals(props.entry.entryId)
        .delete();
    } catch {
      // IndexedDB may be unavailable; stale cache will be overwritten on next fetch.
    }

    emit('saved');
    emit('dismiss');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('409')) {
      conflictError.value =
        'This entry was edited by someone else. Please close and reopen it to get the latest version before editing.';
    } else {
      const detail = extractErrorMessage(err);
      error.value = detail
        ? `Failed to save entry: ${detail}`
        : 'Failed to save entry. Please try again.';
    }
  } finally {
    saving.value = false;
  }
}

function onDismiss() {
  emit('dismiss');
}
</script>

<style scoped>
.entry-error {
  color: var(--ion-color-danger, red);
  font-size: 0.85rem;
  margin: 8px 16px;
}

.entry-error--conflict {
  background: var(--ion-color-warning-tint, #fff8e1);
  border-radius: 4px;
  padding: 8px 12px;
}

.entry-modal-actions {
  padding: 8px;
}

.image-file-input {
  margin: 8px 0;
  font-size: 0.875rem;
}

.pending-images {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px 16px;
}

.pending-image-name {
  font-size: 0.8rem;
  background: var(--ion-color-light, #f4f4f4);
  border-radius: 4px;
  padding: 2px 6px;
}

.existing-images {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px 0;
  width: 100%;
}

.existing-image-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.existing-image-item--removed .existing-image-name {
  text-decoration: line-through;
  color: var(--ion-color-medium, #888);
}

.existing-image-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-image-btn,
.restore-image-btn {
  background: none;
  border: 1px solid currentColor;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  line-height: 1;
  padding: 2px 6px;
  flex-shrink: 0;
}

.remove-image-btn {
  color: var(--ion-color-danger, red);
}

.restore-image-btn {
  color: var(--ion-color-success, green);
}

.content-tabs {
  display: flex;
  gap: 4px;
  margin: 4px 0 8px;
  width: 100%;
}

.content-tab {
  background: none;
  border: 1px solid var(--ion-color-medium, #888);
  border-radius: 4px;
  color: var(--ion-text-color, inherit);
  cursor: pointer;
  font-size: 0.85rem;
  padding: 2px 12px;
}

.content-tab.active {
  background: var(--ion-color-primary, #3880ff);
  border-color: var(--ion-color-primary, #3880ff);
  color: #fff;
}

.content-preview {
  min-height: 6em;
  padding: 4px 0;
  width: 100%;
}

.content-preview-empty {
  color: var(--ion-color-medium, #888);
  font-size: 0.9rem;
  margin: 0;
}
</style>
