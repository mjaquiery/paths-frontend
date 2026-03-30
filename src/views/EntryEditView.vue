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
            {{ path.title }} — {{ formattedEntryDay }}
          </span>
          <span v-else>Edit Entry</span>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button :disabled="saving || !canSave" @click="save">
            {{ saving ? 'Saving…' : 'Save' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="entry-editor-content">
      <div class="entry-form">
        <div v-if="!entry" class="edit-loading">Loading entry…</div>
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
                  :disabled="uploading"
                  @change="onImageSelected"
                />
                <ion-button
                  size="small"
                  fill="outline"
                  :disabled="uploading"
                  @click="openImagePicker"
                >
                  {{ uploading ? 'Uploading…' : '+ Image' }}
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
                v-model="content"
                ref="textareaRef"
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
        </template>
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
  IonInput,
  IonTextarea,
} from '@ionic/vue';
import RefreshStatus from '../components/RefreshStatus.vue';
import { useRefreshStatus } from '../composables/useRefreshStatus';
import { useRoute, useRouter } from 'vue-router';
import { computed, ref, watch } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { useMultiPathEntries } from '../composables/useMultiPathEntries';
import { usePaths } from '../composables/usePaths';
import { useUpdateEntry } from '../generated/apiClient';
import { extractErrorMessage } from '../lib/errors';
import MarkdownContent from '../components/MarkdownContent.vue';
import EntryImage from '../components/EntryImage.vue';
import type { ImageResponse } from '../generated/types';
import { useImageUpload } from '../composables/useImageUpload';
import { useMarkdownEditor } from '../composables/useMarkdownEditor';

const route = useRoute();
const router = useRouter();
const pathId = computed(() => String(route.params.pathId));
const entryId = computed(() => String(route.params.entryId));

const { data: paths } = usePaths();
const path = computed(
  () => (paths.value ?? []).find((p) => p.path_id === pathId.value) ?? null,
);

const pathIdArr = computed(() => [pathId.value]);
const multiPathEntries = useMultiPathEntries(pathIdArr);
const entry = computed(() => {
  const pe = multiPathEntries.value.find((x) => x.pathId === pathId.value);
  return pe?.entries.find((e) => e.id === entryId.value) ?? null;
});

const formattedEntryDay = computed(() => {
  if (!entry.value?.day) return '';
  return new Date(entry.value.day + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

const content = ref('');
const contentTab = ref<'write' | 'preview'>('write');
const saving = ref(false);
const saveError = ref('');
const uploadedImages = ref<ImageResponse[]>([]);
const textareaRef = ref<InstanceType<typeof IonTextarea> | null>(null);
const imageInputRef = ref<HTMLInputElement | null>(null);
const isCaptionModalOpen = ref(false);
const captionDraft = ref('');
const selectedImage = ref<ImageResponse | null>(null);

const { uploading, uploadError, uploadImage } = useImageUpload();

const {
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

watch(
  entry,
  (e) => {
    if (e && !content.value) content.value = e.content ?? '';
  },
  { immediate: true },
);

watch(
  entryId,
  () => {
    uploadedImages.value = [];
    closeCaptionModal();
  },
  { immediate: true },
);

const canSave = computed(() => !!content.value.trim());

const availableImages = computed(() => {
  const seen = new Set<string>();
  return [...(entry.value?.images ?? []), ...uploadedImages.value].filter(
    (image) => {
      if (seen.has(image.id)) return false;
      seen.add(image.id);
      return true;
    },
  );
});

const { onTextareaInput, insertImageMarkdown, rememberSelection } =
  useMarkdownEditor(content, textareaRef, contentTab);

function openImagePicker() {
  imageInputRef.value?.click();
}

async function onImageSelected(event: Event) {
  if (!entry.value) return;

  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const uploadResult = await uploadImage(pathId.value, entryId.value, file);
  input.value = '';

  if (!uploadResult) return;

  uploadedImages.value = [
    ...uploadedImages.value,
    {
      id: uploadResult.imageId,
      entry_id: entryId.value,
      filename: uploadResult.filename,
      status: 'ready',
      strip_metadata: true,
      content_type: file.type || null,
      byte_size: uploadResult.byteSize,
    },
  ];
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

const queryClient = useQueryClient();
const { mutateAsync: updateEntry } = useUpdateEntry();

async function save() {
  if (!canSave.value || !entry.value) return;
  saving.value = true;
  saveError.value = '';
  try {
    await updateEntry({
      pathCode: pathId.value,
      entrySlug: entryId.value,
      data: {
        content: content.value,
        expected_edit_id: entry.value.edit_id ?? 0,
      },
    });
    void queryClient.invalidateQueries({
      queryKey: ['v1', 'paths', pathId.value, 'entries'],
    });
    router.back();
  } catch (err: unknown) {
    // HTTP 409 = optimistic lock conflict: another device edited first.
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

.edit-path-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
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
