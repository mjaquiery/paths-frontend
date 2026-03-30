<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>New Entry</ion-title>
        <ion-buttons slot="end">
          <ion-button :disabled="saving || !canSave" @click="save">
            {{ saving ? 'Saving...' : 'Save' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="entry-editor-content">
      <div class="entry-form">
        <ion-text v-if="pathsError" color="danger" class="view-error-banner">
          {{ pathsErrorMessage }}
        </ion-text>

        <ion-item class="entry-field">
          <ion-label position="stacked">Path *</ion-label>
          <ion-select
            v-model="selectedPathId"
            placeholder="Select a path"
            interface="action-sheet"
            :disabled="!!draftEntryId"
          >
            <ion-select-option v-if="ownedPaths.length === 0" disabled value=""
              >You don't own any paths yet.</ion-select-option
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

        <ion-item class="entry-field">
          <ion-label position="stacked">Day *</ion-label>
          <ion-note slot="helper">The date this entry is for</ion-note>
          <ion-input v-model="day" type="date" :disabled="!!draftEntryId" />
        </ion-item>

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
                :disabled="!selectedPathId || saving"
                @click="openImagePicker"
              >
                + Image
              </ion-button>
              <div class="content-tabs" role="tablist" aria-label="Editor mode">
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
  IonSelect,
  IonSelectOption,
  IonInput,
  IonTextarea,
  IonText,
  IonNote,
} from '@ionic/vue';
import { useQueryClient } from '@tanstack/vue-query';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import EntryImageDraftPreview from '../components/EntryImageDraftPreview.vue';
import MarkdownContent from '../components/MarkdownContent.vue';
import RefreshStatus from '../components/RefreshStatus.vue';
import { useCurrentUser } from '../composables/useCurrentUser';
import { useImageUpload } from '../composables/useImageUpload';
import { useMarkdownEditor } from '../composables/useMarkdownEditor';
import { usePaths } from '../composables/usePaths';
import { useRefreshStatus } from '../composables/useRefreshStatus';
import { useCreateEntry, useUpdateEntry } from '../generated/apiClient';
import type { EntryResponse } from '../generated/types';
import { extractErrorMessage } from '../lib/errors';
import { getPathOrder, isPathHidden } from '../lib/db';
import { removeImageMarkdownReferences } from '../utils/markdown';
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

const { data: paths, error: pathsError } = usePaths();
const { currentUserId } = useCurrentUser();
const { mutateAsync: createEntry } = useCreateEntry();
const { mutateAsync: updateEntry } = useUpdateEntry();
const { uploadError, uploadImage } = useImageUpload();

const ownedPaths = computed(() =>
  (paths.value ?? []).filter(
    (path) => path.owner_user_id === currentUserId.value,
  ),
);
const pathsErrorMessage = computed(
  () => extractErrorMessage(pathsError.value) ?? 'Unable to load paths.',
);

const {
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

const day = ref(
  String(route.query.date ?? new Date().toISOString().slice(0, 10)),
);
const selectedPathId = ref(String(route.params.pathId ?? ''));
const content = ref('');
const contentTab = ref<'write' | 'preview'>('write');
const saving = ref(false);
const saveProgress = ref('');
const saveError = ref('');
const imageError = ref('');
const imageDrafts = ref<EntryImageDraft[]>([]);
const draftEntryId = ref('');
const draftEntryEditId = ref<number | null>(null);
const textareaRef = ref<InstanceType<typeof IonTextarea> | null>(null);
const imageInputRef = ref<HTMLInputElement | null>(null);
const isCaptionModalOpen = ref(false);
const captionDraft = ref('');
const selectedImage = ref<EntryImageDraft | null>(null);

const canSave = computed(
  () => !!selectedPathId.value && !!day.value && !!content.value.trim(),
);
const attachedImages = computed(() =>
  getAttachedImageResponses(imageDrafts.value),
);
const localImageUrls = computed(() => buildLocalImageUrlMap(imageDrafts.value));

const { onTextareaInput, insertImageMarkdown, rememberSelection } =
  useMarkdownEditor(content, textareaRef, contentTab);

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

async function pickDefaultPath() {
  if (ownedPaths.value.length === 0) {
    const redirect = encodeURIComponent(`/entry/new?date=${day.value}`);
    await router.replace(`/paths/new?redirect=${redirect}`);
    return;
  }

  if (selectedPathId.value) return;

  const order = getPathOrder();
  const sorted = [...ownedPaths.value].sort((left, right) => {
    const leftIndex = order.indexOf(left.path_id);
    const rightIndex = order.indexOf(right.path_id);
    if (leftIndex === -1 && rightIndex === -1) return 0;
    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });

  for (const path of sorted) {
    if (!(await isPathHidden(path.path_id))) {
      selectedPathId.value = path.path_id;
      return;
    }
  }

  selectedPathId.value = sorted[0]?.path_id ?? '';
}

onMounted(() => {
  if (ownedPaths.value.length > 0 || paths.value !== undefined) {
    void pickDefaultPath();
  }
});

watch(ownedPaths, (nextPaths, previousPaths) => {
  if (
    previousPaths?.length === 0 &&
    nextPaths.length > 0 &&
    !selectedPathId.value
  ) {
    void pickDefaultPath();
  } else if (nextPaths.length === 0 && paths.value !== undefined) {
    void pickDefaultPath();
  }
});

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

async function ensureDraftEntry() {
  if (draftEntryId.value && draftEntryEditId.value !== null) {
    return { id: draftEntryId.value, editId: draftEntryEditId.value };
  }

  saveProgress.value = 'Creating entry...';
  const response = await createEntry({
    pathCode: selectedPathId.value,
    data: { day: day.value, content: content.value.trim() },
  });
  const createdEntry = entryFromResponse(response.data);
  draftEntryId.value = createdEntry.id;
  draftEntryEditId.value = createdEntry.edit_id;

  return { id: createdEntry.id, editId: createdEntry.edit_id };
}

async function uploadPendingImages(pathCode: string, entrySlug: string) {
  for (const draft of imageDrafts.value) {
    if (draft.source !== 'local' || !draft.file) continue;

    draft.status = 'uploading';
    draft.error = '';
    saveProgress.value = `Uploading ${draft.filename}...`;

    const uploadedImage = await uploadImage(pathCode, entrySlug, draft.file);
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
  if (!canSave.value) return;

  saving.value = true;
  saveError.value = '';
  imageError.value = '';
  saveProgress.value = '';

  try {
    imageDrafts.value = syncDraftCaptionsFromContent(
      imageDrafts.value,
      content.value,
    );

    const hasLocalImages = imageDrafts.value.some(
      (draft) => draft.source === 'local',
    );
    const imageFilenames = getAttachedImageFilenames(imageDrafts.value);

    if (!hasLocalImages && !draftEntryId.value) {
      const finalContent = appendMissingImageMarkdown(
        content.value,
        imageDrafts.value,
      );
      content.value = finalContent;
      saveProgress.value = 'Creating entry...';
      await createEntry({
        pathCode: selectedPathId.value,
        data: {
          day: day.value,
          content: finalContent,
          image_filenames: imageFilenames,
        },
      });
    } else {
      const draftEntry = await ensureDraftEntry();
      if (hasLocalImages) {
        await uploadPendingImages(selectedPathId.value, draftEntry.id);
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

      saveProgress.value = 'Finishing entry...';
      const updateResponse = await updateEntry({
        pathCode: selectedPathId.value,
        entrySlug: draftEntry.id,
        data: {
          expected_edit_id: draftEntry.editId,
          content: finalContent,
          image_filenames: getAttachedImageFilenames(imageDrafts.value),
        },
      });

      const updatedEntry = entryFromResponse(updateResponse.data);
      draftEntryEditId.value = updatedEntry.edit_id;
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] }),
      queryClient.invalidateQueries({
        queryKey: ['v1', 'paths', selectedPathId.value, 'entries'],
      }),
    ]);

    router.back();
  } catch (err: unknown) {
    saveError.value =
      extractErrorMessage(err) ?? 'Failed to save. Please try again.';
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

.entry-field {
  --border-radius: 18px;
  --padding-start: 14px;
  --inner-padding-end: 14px;
  --min-height: 72px;
  border: 1px solid var(--ion-border-color);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.view-error-banner {
  display: block;
  margin: 0 4px;
  font-size: 0.9rem;
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
  width: auto;
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
