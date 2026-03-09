<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('dismiss')">
    <ion-header>
      <ion-toolbar>
        <ion-title>New Entry</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('dismiss')">Cancel</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <!-- Path selection -->
      <ion-item>
        <ion-label position="stacked">Path *</ion-label>
        <ion-select
          v-model="selectedPathId"
          placeholder="Select a path"
          interface="action-sheet"
        >
          <ion-select-option
            v-for="path in ownedPaths"
            :key="path.path_id"
            :value="path.path_id"
          >
            {{ path.title }}
          </ion-select-option>
        </ion-select>
      </ion-item>

      <!-- Day selection -->
      <ion-item>
        <ion-label position="stacked">Day *</ion-label>
        <ion-input v-model="day" type="date" />
      </ion-item>

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

      <!-- Image upload -->
      <ion-item>
        <ion-label position="stacked">Images (optional)</ion-label>
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

      <p v-if="error" class="entry-error">{{ error }}</p>

      <div class="entry-modal-actions">
        <ion-button
          expand="block"
          :disabled="!selectedPathId || !day || !content || saving"
          @click="submit"
        >
          {{ saving ? 'Saving…' : 'Create Entry' }}
        </ion-button>
      </div>
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
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
} from '@ionic/vue';
import { computed, ref, watch } from 'vue';

import type { PathResponse, ImageUploadResponse } from '../generated/types';
import {
  useCreateEntry,
  useCreateImageUploadUrl,
  useCompleteImageUpload,
} from '../generated/apiClient';
import { extractErrorMessage } from '../lib/errors';
import { db } from '../lib/db';
import MarkdownContent from './MarkdownContent.vue';

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
  /** All visible paths the user owns */
  paths: PathResponse[];
  currentUserId: string;
  /** Pre-select a specific day (YYYY-MM-DD) */
  initialDay?: string;
  /** Pre-select a specific path id */
  initialPathId?: string;
}>();

const emit = defineEmits<{
  dismiss: [];
  created: [];
}>();

const { mutateAsync: createEntry, isPending: saving } = useCreateEntry();
const { mutateAsync: getUploadUrl } = useCreateImageUploadUrl();
const { mutateAsync: completeUpload } = useCompleteImageUpload();

const selectedPathId = ref('');
const day = ref('');
const content = ref('');
const error = ref('');
const pendingImages = ref<File[]>([]);
const contentTab = ref<'write' | 'preview'>('write');

const ownedPaths = computed(() =>
  props.paths.filter((p) => p.owner_user_id === props.currentUserId),
);

// Reset form when modal opens
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      selectedPathId.value =
        props.initialPathId ?? ownedPaths.value[0]?.path_id ?? '';
      day.value = props.initialDay ?? new Date().toISOString().slice(0, 10);
      content.value = '';
      error.value = '';
      pendingImages.value = [];
      contentTab.value = 'write';
    }
  },
);

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

async function uploadImages(
  pathCode: string,
  entrySlug: string,
): Promise<string[]> {
  const filenames: string[] = [];
  for (const file of pendingImages.value) {
    const contentType = file.type || DEFAULT_IMAGE_CONTENT_TYPE;
    const uploadResp = await getUploadUrl({
      pathCode,
      entrySlug,
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
  if (!selectedPathId.value || !day.value || !content.value) return;
  error.value = '';
  try {
    const entryResp = await createEntry({
      pathCode: selectedPathId.value,
      data: { day: day.value, content: content.value },
    });

    const entry = entryResp.data as { id: string; edit_id: number } | undefined;
    let image_filenames: string[] = [];
    if (pendingImages.value.length > 0 && entry?.id) {
      image_filenames = await uploadImages(selectedPathId.value, entry.id);
    }

    // Persist image filenames locally so WeekView can show thumbnails
    if (image_filenames.length > 0 && entry?.id) {
      try {
        const cacheKey = `${selectedPathId.value}:${entry.id}`;
        const cached = await db.entryContent.get(cacheKey);
        if (cached) {
          await db.entryContent.put({
            ...cached,
            cache_key: cacheKey,
            image_filenames,
          });
        } else if (entry.edit_id != null) {
          await db.entryContent.put({
            cache_key: cacheKey,
            id: entry.id,
            path_id: selectedPathId.value,
            day: day.value,
            edit_id: entry.edit_id,
            content: content.value,
            image_filenames,
          });
        }
      } catch {
        // IndexedDB may be unavailable; image filenames will not be cached locally.
      }
    }

    emit('created');
    emit('dismiss');
  } catch (err: unknown) {
    const detail = extractErrorMessage(err);
    error.value = detail
      ? `Failed to create entry: ${detail}`
      : 'Failed to create entry. Please try again.';
  }
}
</script>

<style scoped>
.entry-error {
  color: var(--ion-color-danger, red);
  font-size: 0.85rem;
  margin: 8px 16px;
}

.entry-modal-actions {
  margin: 16px 0;
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
