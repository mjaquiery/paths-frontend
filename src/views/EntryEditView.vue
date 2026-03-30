<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/entry/${pathId}/${entryId}`" />
        </ion-buttons>
        <ion-title>
          <span v-if="path && entry">
            <span
              class="edit-path-dot"
              :style="{ backgroundColor: path.color }"
            ></span>
            {{ path.title }} - {{ formattedEntryDay }}
          </span>
          <span v-else>Edit Entry</span>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button :disabled="saving || !canSave" @click="save">
            {{ saving ? 'Saving...' : 'Save' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="entry-editor-content">
      <div class="entry-form">
        <div v-if="!entry" class="edit-loading">Loading entry...</div>
        <template v-else>
          <section class="editor-section">
            <div class="editor-header">
              <label class="editor-label">Content *</label>
              <div class="editor-header-controls">
                <input
                  ref="imageInputRef"
                  type="file"
                  accept="image/*"
                  class="image-upload-input"
                  multiple
                  :disabled="saving"
                  @change="onImageSelected"
                />
                <ion-button
                  size="small"
                  fill="outline"
                  :disabled="saving"
                  @click="openImagePicker"
                >
                  + Image
                </ion-button>
                <div
                  class="content-tabs"
                  role="tablist"
                  aria-label="Editor mode"
                >
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
              </div>
            </div>

            <div class="editor-surface">
              <ion-textarea
                v-if="contentTab === 'write'"
                ref="textareaRef"
                v-model="content"
                class="editor-textarea"
                placeholder="Write your entry... (markdown supported)"
                :rows="8"
                auto-grow
                autocapitalize="sentences"
                autocorrect="on"
                :spellcheck="true"
                @ionInput="onTextareaInput"
                @ionFocus="rememberSelection"
                @ionBlur="rememberSelection"
                @keyup="rememberSelection"
                @click="rememberSelection"
              />
              <div v-else class="content-preview">
                <MarkdownContent
                  v-if="content"
                  :content="content"
                  :images="attachedImages"
                  :local-image-urls="localImageUrls"
                />
                <p v-else class="content-preview-empty">(nothing to preview)</p>
              </div>
            </div>
          </section>

          <div
            v-if="saveProgress"
            class="save-progress"
            role="status"
            aria-live="polite"
          >
            <strong>{{ saveProgress }}</strong>
            <span>Please keep this page open until you are redirected.</span>
          </div>

          <p v-if="imageError" class="save-error">{{ imageError }}</p>
          <p v-else-if="uploadError" class="save-error">{{ uploadError }}</p>
          <p v-else-if="saveError" class="save-error">{{ saveError }}</p>
        </template>
      </div>
    </ion-content>

    <ion-modal :is-open="isCaptionModalOpen" @didDismiss="closeCaptionModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>
            {{
              selectedImage
                ? `Insert ${selectedImage.filename}`
                : 'Insert image'
            }}
          </ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeCaptionModal">Cancel</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding image-caption-modal-content">
        <div v-if="selectedImage" class="image-caption-preview">
          <EntryImageDraftPreview
            :image-id="selectedImage.image?.id ?? null"
            :preview-url="selectedImage.previewUrl"
            :filename="selectedImage.filename"
          />
        </div>
        <ion-item lines="none" class="image-caption-field">
          <ion-label position="stacked">Caption</ion-label>
          <ion-input
            v-model="captionDraft"
            :placeholder="selectedImage?.filename ?? ''"
            @keydown.enter.prevent="confirmImageInsert"
          />
        </ion-item>
      </ion-content>
      <ion-footer>
        <ion-toolbar>
          <div class="image-caption-actions">
            <ion-button fill="outline" @click="closeCaptionModal"
              >Cancel</ion-button
            >
            <ion-button :disabled="!selectedImage" @click="confirmImageInsert">
              Insert markdown
            </ion-button>
          </div>
        </ion-toolbar>
      </ion-footer>
    </ion-modal>

    <ion-footer>
      <div v-if="imageDrafts.length > 0" class="editor-image-tray">
        <p class="editor-image-tray-hint">
          Select an image to insert it into the text.
        </p>
        <div class="editor-image-tray-scroll">
          <div
            v-for="image in imageDrafts"
            :key="image.localId"
            class="editor-image-chip"
          >
            <button
              type="button"
              class="editor-image-chip-main"
              :aria-label="`Add caption for ${image.filename}`"
              @click="openCaptionModal(image)"
            >
              <EntryImageDraftPreview
                :image-id="image.image?.id ?? null"
                :preview-url="image.previewUrl"
                :filename="image.filename"
              />
              <span class="editor-image-chip-name">{{ image.filename }}</span>
              <span class="editor-image-chip-status">{{
                imageStatusText(image)
              }}</span>
            </button>
            <button
              type="button"
              class="editor-image-chip-remove"
              :disabled="saving"
              :aria-label="`Remove ${image.filename}`"
              @click="removeImage(image.localId)"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
      <RefreshStatus
        :status-type="refreshStatusType"
        :status-text="refreshStatusText"
        :last-checked-at="refreshLastCheckedAt"
      />
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
  IonButton,
  IonButtons,
  IonBackButton,
  IonModal,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
} from '@ionic/vue';
import { useQueryClient } from '@tanstack/vue-query';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import EntryImageDraftPreview from '../components/EntryImageDraftPreview.vue';
import MarkdownContent from '../components/MarkdownContent.vue';
import RefreshStatus from '../components/RefreshStatus.vue';
import { useImageUpload } from '../composables/useImageUpload';
import { useMarkdownEditor } from '../composables/useMarkdownEditor';
import { useMultiPathEntries } from '../composables/useMultiPathEntries';
import { usePaths } from '../composables/usePaths';
import { useRefreshStatus } from '../composables/useRefreshStatus';
import { useUpdateEntry } from '../generated/apiClient';
import type { EntryResponse } from '../generated/types';
import { extractErrorMessage } from '../lib/errors';
import { db } from '../lib/db';
import {
  appendMissingImageMarkdown,
  buildLocalImageUrlMap,
  createLocalImageDraft,
  createServerImageDraft,
  getAttachedImageFilenames,
  getAttachedImageResponses,
  revokeDraftPreviewUrl,
  syncDraftCaptionsFromContent,
  type EntryImageDraft,
} from '../utils/entryImageDrafts';
import { removeImageMarkdownReferences } from '../utils/markdown';

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const pathId = computed(() => String(route.params.pathId));
const entryId = computed(() => String(route.params.entryId));

const { data: paths } = usePaths();
const path = computed(
  () =>
    (paths.value ?? []).find(
      (candidate) => candidate.path_id === pathId.value,
    ) ?? null,
);

const pathIdArr = computed(() => [pathId.value]);
const multiPathEntries = useMultiPathEntries(pathIdArr);
const entry = computed(() => {
  const pathEntries = multiPathEntries.value.find(
    (candidate) => candidate.pathId === pathId.value,
  );
  return (
    pathEntries?.entries.find((candidate) => candidate.id === entryId.value) ??
    null
  );
});

const { mutateAsync: updateEntry } = useUpdateEntry();
const { uploadError, uploadImage } = useImageUpload();

const {
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

const content = ref('');
const contentTab = ref<'write' | 'preview'>('write');
const saving = ref(false);
const saveProgress = ref('');
const saveError = ref('');
const imageError = ref('');
const imageDrafts = ref<EntryImageDraft[]>([]);
const textareaRef = ref<InstanceType<typeof IonTextarea> | null>(null);
const imageInputRef = ref<HTMLInputElement | null>(null);
const isCaptionModalOpen = ref(false);
const captionDraft = ref('');
const selectedImage = ref<EntryImageDraft | null>(null);
const initializedEntryId = ref('');

const canSave = computed(() => !!content.value.trim());
const attachedImages = computed(() =>
  getAttachedImageResponses(imageDrafts.value),
);
const localImageUrls = computed(() => buildLocalImageUrlMap(imageDrafts.value));

const { onTextareaInput, insertImageMarkdown, rememberSelection } =
  useMarkdownEditor(content, textareaRef, contentTab);

const formattedEntryDay = computed(() => {
  if (!entry.value?.day) return '';
  return new Date(entry.value.day + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

function imageStatusText(image: EntryImageDraft) {
  if (image.status === 'uploading') return 'Uploading';
  if (image.status === 'failed') return image.error || 'Failed';
  if (image.source === 'local') return 'Uploads on save';
  return 'Attached';
}

function entryFromResponse(value: unknown): EntryResponse {
  if (
    value &&
    typeof value === 'object' &&
    'id' in value &&
    'edit_id' in value &&
    typeof (value as { id?: unknown }).id === 'string' &&
    typeof (value as { edit_id?: unknown }).edit_id === 'number'
  ) {
    return value as EntryResponse;
  }

  throw new Error('Unexpected entry response.');
}

watch(
  entry,
  (nextEntry) => {
    if (!nextEntry || initializedEntryId.value === nextEntry.id) return;

    initializedEntryId.value = nextEntry.id;
    content.value = nextEntry.content ?? '';
    contentTab.value = 'write';
    imageDrafts.value.forEach(revokeDraftPreviewUrl);
    imageDrafts.value = (nextEntry.images ?? []).map((image) =>
      createServerImageDraft(image),
    );
    imageDrafts.value = syncDraftCaptionsFromContent(
      imageDrafts.value,
      content.value,
    );
    saveError.value = '';
    imageError.value = '';
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  for (const draft of imageDrafts.value) {
    revokeDraftPreviewUrl(draft);
  }
});

function openImagePicker() {
  imageInputRef.value?.click();
}

function openCaptionModal(image: EntryImageDraft) {
  rememberSelection();
  selectedImage.value = image;
  captionDraft.value = image.captionDraft;
  isCaptionModalOpen.value = true;
}

function closeCaptionModal() {
  isCaptionModalOpen.value = false;
  selectedImage.value = null;
  captionDraft.value = '';
}

async function confirmImageInsert() {
  if (!selectedImage.value) return;
  const nextCaption = captionDraft.value.trim() || selectedImage.value.filename;
  imageDrafts.value = imageDrafts.value.map((draft) =>
    draft.localId === selectedImage.value?.localId
      ? { ...draft, captionDraft: nextCaption }
      : draft,
  );
  await insertImageMarkdown(selectedImage.value.filename, nextCaption);
  closeCaptionModal();
}

function onImageSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files ? Array.from(input.files) : [];
  input.value = '';
  if (files.length === 0) return;

  const errors: string[] = [];
  const activeNames = new Set(imageDrafts.value.map((draft) => draft.filename));
  const acceptedFiles: File[] = [];

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      errors.push(`Not an image: ${file.name}`);
      continue;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      errors.push(`Exceeds 10 MB: ${file.name}`);
      continue;
    }
    if (activeNames.has(file.name)) {
      errors.push(`Duplicate filename: ${file.name}`);
      continue;
    }

    activeNames.add(file.name);
    acceptedFiles.push(file);
  }

  if (acceptedFiles.length > 0) {
    imageDrafts.value = [
      ...imageDrafts.value,
      ...acceptedFiles.map(createLocalImageDraft),
    ];
  }

  imageError.value = errors.join('; ');
}

function removeImage(localId: string) {
  const target = imageDrafts.value.find((draft) => draft.localId === localId);
  if (!target) return;

  revokeDraftPreviewUrl(target);
  imageDrafts.value = imageDrafts.value.filter(
    (draft) => draft.localId !== localId,
  );
  content.value = removeImageMarkdownReferences(content.value, target.filename);
  if (selectedImage.value?.localId === localId) {
    closeCaptionModal();
  }
}

async function uploadPendingImages() {
  for (const draft of imageDrafts.value) {
    if (draft.source !== 'local' || !draft.file) continue;

    draft.status = 'uploading';
    draft.error = '';
    saveProgress.value = `Uploading ${draft.filename}...`;

    const uploadedImage = await uploadImage(
      pathId.value,
      entryId.value,
      draft.file,
    );
    if (!uploadedImage) {
      draft.status = 'failed';
      draft.error = uploadError.value;
      throw new Error(
        uploadError.value || `Failed to upload ${draft.filename}.`,
      );
    }

    revokeDraftPreviewUrl(draft);

    imageDrafts.value = imageDrafts.value.map((candidate) =>
      candidate.localId === draft.localId
        ? {
            ...createServerImageDraft(uploadedImage, candidate.captionDraft),
            localId: candidate.localId,
          }
        : candidate,
    );
  }
}

async function save() {
  if (!canSave.value || !entry.value) return;

  saving.value = true;
  saveError.value = '';
  imageError.value = '';
  saveProgress.value = '';

  try {
    imageDrafts.value = syncDraftCaptionsFromContent(
      imageDrafts.value,
      content.value,
    );

    if (imageDrafts.value.some((draft) => draft.source === 'local')) {
      await uploadPendingImages();
    }

    imageDrafts.value = syncDraftCaptionsFromContent(
      imageDrafts.value,
      content.value,
    );
    const finalContent = appendMissingImageMarkdown(
      content.value,
      imageDrafts.value,
    );
    content.value = finalContent;

    saveProgress.value = 'Updating entry...';
    const updateResponse = await updateEntry({
      pathCode: pathId.value,
      entrySlug: entryId.value,
      data: {
        expected_edit_id: entry.value.edit_id ?? 0,
        content: finalContent,
        image_filenames: getAttachedImageFilenames(imageDrafts.value),
      },
    });

    const updatedEntry = entryFromResponse(updateResponse.data);

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['v1', 'paths', pathId.value, 'entries'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['v1', 'paths', pathId.value, 'entries', entryId.value],
      }),
    ]);

    try {
      await db.entryContent.delete(`${pathId.value}:${entryId.value}`);
      await db.entryImages.where('entry_id').equals(entryId.value).delete();
    } catch {
      /* IndexedDB may be unavailable */
    }

    initializedEntryId.value = updatedEntry.id;
    router.back();
  } catch (err: unknown) {
    const status =
      err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;

    if (status === 409) {
      saveError.value =
        'This entry was edited on another device. Reload to see the latest version before editing.';
    } else {
      saveError.value =
        extractErrorMessage(err) ?? 'Failed to save. Please try again.';
    }
  } finally {
    saveProgress.value = '';
    saving.value = false;
  }
}
</script>

<style scoped>
.entry-editor-content {
  --padding-top: 18px;
  --padding-bottom: 28px;
  --padding-start: 16px;
  --padding-end: 16px;
}

.entry-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 640px;
  margin: 0 auto;
}

.edit-loading {
  padding: 32px 20px;
  text-align: center;
  color: var(--ion-color-medium);
  border: 1px dashed var(--ion-border-color);
  border-radius: 18px;
}

.editor-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--ion-border-color);
  border-radius: 18px;
  background: var(--ion-item-background);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

.editor-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.editor-header-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.editor-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ion-text-color);
}

.content-tabs {
  display: flex;
  gap: 8px;
}

.content-tab {
  min-width: 88px;
  padding: 8px 14px;
  border: 1px solid var(--ion-border-color);
  border-radius: 999px;
  background: var(--ion-background-color);
  color: var(--ion-text-color);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
}

.content-tab.active {
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  border-color: var(--ion-color-primary);
}

.editor-surface {
  border: 1px solid var(--ion-border-color);
  border-radius: 14px;
  overflow: hidden;
  background: var(--ion-background-color);
}

.editor-textarea {
  --padding-top: 14px;
  --padding-bottom: 14px;
  --padding-start: 14px;
  --padding-end: 14px;
  min-height: 250px;
}

.image-upload-input {
  display: none;
}

.content-preview {
  min-height: 250px;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
}

.content-preview-empty {
  color: var(--ion-color-medium);
  font-style: italic;
  margin: 0;
}

.save-progress {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--ion-color-primary) 12%, white);
  color: var(--ion-text-color);
}

.save-progress strong {
  font-size: 0.92rem;
}

.save-progress span {
  font-size: 0.82rem;
  color: var(--ion-color-medium-shade, #556);
}

.save-error {
  color: var(--ion-color-danger);
  font-size: 0.85rem;
  margin: 0 4px;
}

.edit-path-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  margin-right: 6px;
  vertical-align: middle;
  flex-shrink: 0;
}

.editor-image-tray {
  border-top: 1px solid var(--ion-border-color);
  background: var(--ion-item-background);
  padding: 10px 12px 8px;
  max-height: 32vh;
  overflow: hidden;
}

.editor-image-tray-hint {
  margin: 0 0 8px;
  color: var(--ion-color-medium);
  font-size: 0.82rem;
  line-height: 1.35;
}

.editor-image-tray-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 4px;
}

.editor-image-chip {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 116px;
  min-width: 116px;
  padding: 10px 10px 8px;
  border: 1px solid var(--ion-border-color);
  border-radius: 14px;
  background: var(--ion-background-color);
}

.editor-image-chip-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
}

.editor-image-chip-name,
.editor-image-chip-status {
  display: -webkit-box;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

.editor-image-chip-name {
  -webkit-line-clamp: 2;
  line-clamp: 2;
  font-size: 0.78rem;
  line-height: 1.3;
  text-align: center;
}

.editor-image-chip-status {
  -webkit-line-clamp: 1;
  line-clamp: 1;
  font-size: 0.72rem;
  color: var(--ion-color-medium);
  text-align: center;
}

.editor-image-chip-remove {
  border: 0;
  background: transparent;
  color: var(--ion-color-danger);
  font-size: 0.72rem;
  font-weight: 600;
}

.image-caption-modal-content {
  --padding-top: 18px;
}

.image-caption-preview {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.image-caption-field {
  --padding-start: 0;
  --inner-padding-end: 0;
  max-width: 360px;
  margin: 0 auto;
}

.image-caption-preview :deep(.entry-image-thumb),
.image-caption-preview :deep(.entry-image-placeholder),
.image-caption-preview :deep(.entry-image-draft-preview__image),
.image-caption-preview :deep(.entry-image-draft-preview__placeholder) {
  width: min(220px, 60vw);
  height: min(220px, 60vw);
  border-radius: 16px;
}

.image-caption-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 12px;
}

@media (max-width: 480px) {
  .editor-image-chip {
    width: 104px;
    min-width: 104px;
  }
}
</style>
