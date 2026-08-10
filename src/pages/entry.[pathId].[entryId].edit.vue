<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/entry/${pathId}/${entryId}`" />
        </ion-buttons>
        <ion-title>Edit Entry</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p class="entry-meta">{{ path?.title }} &mdash; {{ entryData?.day }}</p>

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
          ref="textareaRef"
          v-model="content"
          placeholder="Write your entry… (markdown supported)"
          :rows="6"
          auto-grow
          autocapitalize="sentences"
          autocorrect="on"
          :spellcheck="true"
          @ionInput="onTextareaInput"
        />
        <div v-else class="content-preview">
          <MarkdownContent v-if="content" :content="content" />
          <p v-else class="content-preview-empty">(nothing to preview)</p>
        </div>
      </ion-item>

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
              class="insert-image-btn"
              type="button"
              :aria-label="`Insert image ${img.filename} into content`"
              @click="insertImageMarkdown(img.filename)"
            >
              ↳ Insert
            </button>
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

      <ion-item lines="none">
        <ion-label position="stacked">Add images (optional)</ion-label>
        <ion-button size="small" fill="outline" @click="addImages"
          >+ Add photo</ion-button
        >
      </ion-item>
      <div v-if="pendingImages.length > 0" class="pending-images">
        <div
          v-for="img in pendingImages"
          :key="img.file.name"
          class="pending-image"
        >
          <span class="pending-image-name">{{ img.file.name }}</span>
          <ion-input
            v-model="img.caption"
            placeholder="Caption (optional)"
            class="pending-image-caption"
          />
          <button
            class="insert-image-btn"
            type="button"
            :aria-label="`Insert image ${img.file.name} into content`"
            @click="insertImageMarkdown(img.file.name)"
          >
            ↳ Insert
          </button>
        </div>
      </div>

      <p v-if="conflictError" class="entry-error entry-error--conflict">
        {{ conflictError }}
      </p>
      <p v-else-if="error" class="entry-error">{{ error }}</p>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <div class="entry-page-actions">
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
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonContent,
  IonFooter,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
} from '@ionic/vue';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';

import {
  useGetEntry,
  useListEntryImages,
  useUpdateEntry,
} from '../generated/apiClient';
import { usePaths } from '../composables/usePaths';
import { useLocalDraft } from '../composables/useLocalDraft';
import { pickImages } from '../composables/useImagePicker';
import { extractErrorMessage } from '../lib/errors';
import MarkdownContent from '../components/MarkdownContent.vue';
import { useMarkdownEditor } from '../composables/useMarkdownEditor';
import type { EntryContentResponse, ImageResponse } from '../generated/types';

const route = useRoute<'/entry.[pathId].[entryId].edit'>();
const router = useRouter();
const queryClient = useQueryClient();

const pathId = route.params.pathId;
const entryId = route.params.entryId;

const { data: allPaths } = usePaths();
const path = computed(() => allPaths.value?.find((p) => p.path_id === pathId));

const { data: entryData } = useGetEntry(pathId, entryId, {
  query: { select: (r) => r.data as EntryContentResponse },
});
const { data: imagesData } = useListEntryImages(pathId, entryId, {
  query: { select: (r) => r.data as ImageResponse[] },
});

const { mutateAsync: doUpdateEntry } = useUpdateEntry();

const contentTab = ref<'write' | 'preview'>('write');
const keptImages = ref<ImageResponse[]>([]);
const removedImages = ref<ImageResponse[]>([]);
const pendingImages = ref<{ file: File; caption: string }[]>([]);
const saving = ref(false);
const error = ref('');
const conflictError = ref('');
const textareaRef = ref<InstanceType<typeof IonTextarea> | null>(null);

const {
  content,
  restore,
  clear: clearDraft,
} = useLocalDraft(
  ref(pathId),
  computed(() => entryData.value?.day ?? ''),
  ref(entryId),
);

let contentInitialised = false;
watch(
  entryData,
  async (data) => {
    if (!data || contentInitialised) return;
    contentInitialised = true;
    await restore();
    // Only fall back to the server content if no local draft was restored — an
    // in-progress edit takes priority over what's already saved server-side.
    if (!content.value) content.value = data.content ?? '';
  },
  { immediate: true },
);
watch(imagesData, (images) => {
  if (images) keptImages.value = [...images];
});

const { onTextareaInput, insertImageMarkdown } = useMarkdownEditor(
  content,
  textareaRef,
  contentTab,
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

async function addImages() {
  const files = await pickImages();
  pendingImages.value.push(...files.map((file) => ({ file, caption: '' })));
}

async function submit() {
  if (!content.value.trim() || entryData.value?.edit_id === undefined) return;
  saving.value = true;
  error.value = '';
  conflictError.value = '';

  try {
    await doUpdateEntry({
      pathCode: pathId,
      entrySlug: entryId,
      data: {
        expected_edit_id: entryData.value.edit_id,
        content: content.value,
        captions: pendingImages.value.map((img) => img.caption),
        remove_image_ids: removedImages.value.map((img) => img.id),
        // orval types multipart file-array fields as string[] (an OpenAPI binary-format
        // quirk) — the real runtime value is the File objects themselves.
        images: pendingImages.value.map(
          (img) => img.file,
        ) as unknown as string[],
      },
    });

    await queryClient.invalidateQueries({
      queryKey: ['v1', 'paths', pathId, 'entries'],
    });
    await clearDraft();
    router.push(`/entry/${pathId}/${entryId}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('409')) {
      conflictError.value =
        'This entry was edited by someone else. Please go back and reopen it to get the latest version before editing.';
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
</script>

<style scoped>
.entry-meta {
  font-size: 0.85rem;
  color: var(--ion-color-medium, #888);
}

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

.entry-page-actions {
  padding: 8px;
}

.pending-images {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px 16px;
}

.pending-image {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  background: var(--ion-color-light, #f4f4f4);
  border-radius: 4px;
  padding: 4px 6px;
}

.pending-image-name {
  flex-shrink: 0;
  max-width: 8rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pending-image-caption {
  flex: 1;
  --padding-start: 4px;
  --padding-end: 4px;
  font-size: 0.8rem;
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
.restore-image-btn,
.insert-image-btn {
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

.insert-image-btn {
  color: var(--ion-color-primary, #3880ff);
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
