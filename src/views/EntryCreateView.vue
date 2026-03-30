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
            {{ saving ? 'Saving…' : 'Save' }}
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
            :disabled="!!savedEntryId"
          >
            <ion-select-option v-if="ownedPaths.length === 0" disabled value=""
              >You don't own any paths yet.</ion-select-option
            >
            <ion-select-option
              v-for="p in ownedPaths"
              :key="p.path_id"
              :value="p.path_id"
              >{{ p.title }}</ion-select-option
            >
          </ion-select>
        </ion-item>

        <ion-item class="entry-field">
          <ion-label position="stacked">Day *</ion-label>
          <ion-note slot="helper">The date this entry is for</ion-note>
          <ion-input v-model="day" type="date" :disabled="!!savedEntryId" />
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
                :disabled="uploading || saving"
                @change="onImageSelected"
              />
              <ion-button
                size="small"
                fill="outline"
                :disabled="!canSave || saving || uploading"
                @click="handleAddImage"
              >
                {{ saving ? 'Saving…' : uploading ? 'Uploading…' : '+ Image' }}
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
              placeholder="Write your entry… (markdown supported)"
              :rows="8"
              auto-grow
              autocapitalize="sentences"
              autocorrect="on"
              spellcheck="true"
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
                :images="availableImages"
              />
              <p v-else class="content-preview-empty">(nothing to preview)</p>
            </div>
          </div>
        </section>

        <p v-if="uploadError" class="save-error">{{ uploadError }}</p>
        <p v-if="saveError" class="save-error">{{ saveError }}</p>
      </div>
    </ion-content>
    <ion-modal :is-open="isCaptionModalOpen" @didDismiss="closeCaptionModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>{{
            selectedImage ? `Insert ${selectedImage.filename}` : 'Insert image'
          }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeCaptionModal">Cancel</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding image-caption-modal-content">
        <div v-if="selectedImage" class="image-caption-preview">
          <EntryImage
            :image-id="selectedImage.id"
            :alt="selectedImage.filename"
            :linked="false"
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
      <div v-if="availableImages.length > 0" class="editor-image-tray">
        <p class="editor-image-tray-hint">
          Select an image to insert it into the text.
        </p>
        <div class="editor-image-tray-scroll">
          <button
            v-for="image in availableImages"
            :key="image.id"
            type="button"
            class="editor-image-chip"
            :aria-label="`Add caption for ${image.filename}`"
            @click="openCaptionModal(image)"
          >
            <EntryImage
              :image-id="image.id"
              :alt="image.filename"
              :linked="false"
            />
            <span class="editor-image-chip-name">{{ image.filename }}</span>
          </button>
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
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { useRoute, useRouter } from 'vue-router';

import RefreshStatus from '../components/RefreshStatus.vue';
import EntryImage from '../components/EntryImage.vue';
import MarkdownContent from '../components/MarkdownContent.vue';
import { useRefreshStatus } from '../composables/useRefreshStatus';
import { usePaths } from '../composables/usePaths';
import { useCurrentUser } from '../composables/useCurrentUser';
import { useImageUpload } from '../composables/useImageUpload';
import { useMarkdownEditor } from '../composables/useMarkdownEditor';
import { useCreateEntry, useUpdateEntry } from '../generated/apiClient';
import type { ImageResponse } from '../generated/types';
import { extractErrorMessage } from '../lib/errors';
import { getPathOrder, isPathHidden } from '../lib/db';

const route = useRoute();
const router = useRouter();

const { data: paths, error: pathsError } = usePaths();
const { currentUserId } = useCurrentUser();
const ownedPaths = computed(() =>
  (paths.value ?? []).filter((p) => p.owner_user_id === currentUserId.value),
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
const saveError = ref('');
const savedEntryId = ref('');
const savedEntryEditId = ref<number | null>(null);
const uploadedImages = ref<ImageResponse[]>([]);
const textareaRef = ref<InstanceType<typeof IonTextarea> | null>(null);
const imageInputRef = ref<HTMLInputElement | null>(null);
const isCaptionModalOpen = ref(false);
const captionDraft = ref('');
const selectedImage = ref<ImageResponse | null>(null);

const { uploading, uploadError, uploadImage } = useImageUpload();

const canSave = computed(
  () => !!selectedPathId.value && !!day.value && !!content.value.trim(),
);

const availableImages = computed(() => uploadedImages.value);

const queryClient = useQueryClient();
const { mutateAsync: createEntry } = useCreateEntry();
const { mutateAsync: updateEntry } = useUpdateEntry();

const { onTextareaInput, insertImageMarkdown, rememberSelection } =
  useMarkdownEditor(content, textareaRef, contentTab);

function hasSavedEntryData(
  value: unknown,
): value is { id: string; edit_id?: number | null } {
  return (
    !!value &&
    typeof value === 'object' &&
    'id' in value &&
    typeof (value as { id?: unknown }).id === 'string'
  );
}

async function pickDefaultPath() {
  if (ownedPaths.value.length === 0) {
    const redirect = encodeURIComponent(`/entry/new?date=${day.value}`);
    await router.replace(`/paths/new?redirect=${redirect}`);
    return;
  }

  if (selectedPathId.value) return;

  const order = getPathOrder();
  const sorted = [...ownedPaths.value].sort((a, b) => {
    const ia = order.indexOf(a.path_id);
    const ib = order.indexOf(b.path_id);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
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

watch(ownedPaths, (newVal, oldVal) => {
  if (oldVal?.length === 0 && newVal.length > 0 && !selectedPathId.value) {
    void pickDefaultPath();
  } else if (newVal.length === 0 && paths.value !== undefined) {
    void pickDefaultPath();
  }
});

watch(
  () => route.fullPath,
  () => {
    savedEntryId.value = '';
    savedEntryEditId.value = null;
    uploadedImages.value = [];
    closeCaptionModal();
  },
);

function openImagePicker() {
  imageInputRef.value?.click();
}

function openCaptionModal(image: ImageResponse) {
  rememberSelection();
  selectedImage.value = image;
  captionDraft.value = '';
  isCaptionModalOpen.value = true;
}

function closeCaptionModal() {
  isCaptionModalOpen.value = false;
  selectedImage.value = null;
  captionDraft.value = '';
}

async function confirmImageInsert() {
  if (!selectedImage.value) return;
  await insertImageMarkdown(
    selectedImage.value.filename,
    captionDraft.value.trim() || selectedImage.value.filename,
  );
  closeCaptionModal();
}

async function onImageSelected(event: Event) {
  if (!savedEntryId.value) return;

  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const uploadResult = await uploadImage(
    selectedPathId.value,
    savedEntryId.value,
    file,
  );
  input.value = '';

  if (!uploadResult) return;

  uploadedImages.value = [
    ...uploadedImages.value,
    {
      id: uploadResult.imageId,
      entry_id: savedEntryId.value,
      filename: uploadResult.filename,
      status: 'ready',
      strip_metadata: true,
      content_type: file.type || null,
      byte_size: uploadResult.byteSize,
    },
  ];
}

async function save() {
  if (!canSave.value) return;
  saving.value = true;
  saveError.value = '';
  try {
    if (savedEntryId.value) {
      const result = await updateEntry({
        pathCode: selectedPathId.value,
        entrySlug: savedEntryId.value,
        data: {
          content: content.value,
          expected_edit_id: savedEntryEditId.value ?? 0,
        },
      });
      const updatedEntry = result.data;
      if (hasSavedEntryData(updatedEntry)) {
        savedEntryEditId.value = updatedEntry.edit_id ?? savedEntryEditId.value;
      }
    } else {
      const result = await createEntry({
        pathCode: selectedPathId.value,
        data: { day: day.value, content: content.value },
      });
      const createdEntry = result.data;
      if (hasSavedEntryData(createdEntry)) {
        savedEntryId.value = createdEntry.id;
        savedEntryEditId.value = createdEntry.edit_id ?? null;
      }
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
    saving.value = false;
  }
}

async function saveForImageUpload() {
  if (!canSave.value || saving.value || savedEntryId.value) return;
  saving.value = true;
  saveError.value = '';
  try {
    const result = await createEntry({
      pathCode: selectedPathId.value,
      data: { day: day.value, content: content.value },
    });

    const createdEntry = result.data;
    if (!hasSavedEntryData(createdEntry)) {
      throw new Error('Failed to prepare image upload.');
    }

    savedEntryId.value = createdEntry.id;
    savedEntryEditId.value = createdEntry.edit_id ?? null;

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] }),
      queryClient.invalidateQueries({
        queryKey: ['v1', 'paths', selectedPathId.value, 'entries'],
      }),
    ]);

    await nextTick();
    openImagePicker();
  } catch (err: unknown) {
    saveError.value =
      extractErrorMessage(err) ?? 'Failed to save. Please try again.';
  } finally {
    saving.value = false;
  }
}

async function handleAddImage() {
  rememberSelection();
  if (savedEntryId.value) {
    openImagePicker();
    return;
  }

  await saveForImageUpload();
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
  align-items: stretch;
  gap: 8px;
  width: 104px;
  min-width: 104px;
  padding: 10px 10px 8px;
  border: 1px solid var(--ion-border-color);
  border-radius: 14px;
  background: var(--ion-background-color);
  color: var(--ion-text-color);
}

.editor-image-chip-name {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  font-size: 0.78rem;
  line-height: 1.3;
  text-align: center;
  word-break: break-word;
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
.image-caption-preview :deep(.entry-image-placeholder) {
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
    width: 96px;
    min-width: 96px;
  }
}
</style>
