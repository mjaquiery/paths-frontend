<template>
  <section class="editor-section">
    <div class="editor-header">
      <label class="editor-label">Content *</label>
      <div class="editor-header-controls">
        <input
          :ref="bindImageInputRef"
          type="file"
          accept="image/*"
          class="image-upload-input"
          multiple
          :disabled="uploadDisabled"
          @change="$emit('image-selected', $event)"
        />
        <ion-button
          size="small"
          fill="outline"
          :disabled="uploadDisabled"
          :title="uploadButtonTitle"
          @click="$emit('open-image-picker')"
        >
          + Image
        </ion-button>
        <div class="content-tabs" role="tablist" aria-label="Editor mode">
          <button
            class="content-tab"
            :class="{ active: contentTab === 'write' }"
            type="button"
            @click="$emit('update:contentTab', 'write')"
          >
            Write
          </button>
          <button
            class="content-tab"
            :class="{ active: contentTab === 'preview' }"
            type="button"
            @click="$emit('update:contentTab', 'preview')"
          >
            Preview
          </button>
        </div>
      </div>
    </div>

    <p v-if="autosaveOffline" class="autosave-offline-note image-offline-note">
      Image upload is unavailable while offline.
    </p>

    <div class="editor-surface">
      <ion-textarea
        v-if="contentTab === 'write'"
        :ref="bindTextareaRef"
        :value="content"
        class="editor-textarea"
        placeholder="Write your entry... (markdown supported)"
        :rows="8"
        auto-grow
        autocapitalize="sentences"
        autocorrect="on"
        :spellcheck="true"
        @ionInput="onContentInput"
        @ionFocus="$emit('remember-selection')"
        @ionBlur="$emit('remember-selection')"
        @keyup="$emit('remember-selection')"
        @click="$emit('remember-selection')"
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

  <p v-if="imageError" class="save-error">{{ imageError }}</p>
  <p v-else-if="autosaveOffline" class="autosave-offline-note">
    Currently offline — your changes will be saved when you reconnect.
  </p>

  <ion-modal
    :is-open="commitFailDialogOpen"
    @didDismiss="$emit('close-commit-fail')"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Save failed</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding commit-fail-dialog-content">
      <p class="commit-fail-dialog-message">{{ commitFailDialogMessage }}</p>
      <p v-if="commitFailWillRetry" class="commit-fail-dialog-note">
        Your entry will keep retrying to save in the background. You can watch
        the status bar at the bottom of the screen for updates.
      </p>
      <p v-else class="commit-fail-dialog-note">
        Fix the issue above, then try saving again.
      </p>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <div class="commit-fail-dialog-actions">
          <ion-button fill="outline" @click="$emit('close-commit-fail')">
            Cancel
          </ion-button>
          <ion-button @click="$emit('acknowledge-commit-failure')"
            >OK</ion-button
          >
        </div>
      </ion-toolbar>
    </ion-footer>
  </ion-modal>

  <ion-modal :is-open="isCaptionModalOpen" @didDismiss="$emit('close-caption')">
    <ion-header>
      <ion-toolbar>
        <ion-title>
          {{
            selectedImage ? `Insert ${selectedImage.filename}` : 'Insert image'
          }}
        </ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close-caption')">Cancel</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding image-caption-modal-content">
      <div v-if="selectedImage" class="image-caption-preview">
        <EntryImageDraftPreview
          :image-id="selectedImage.image?.id ?? null"
          :preview-url="selectedImage.previewUrl"
          :filename="selectedImage.filename"
          :uploading="
            selectedImage.status === 'uploading' ||
            selectedImage.status === 'draft-uploading'
          "
        />
      </div>
      <ion-item lines="none" class="image-caption-field">
        <ion-label position="stacked">Caption</ion-label>
        <ion-input
          :value="captionDraft"
          :placeholder="selectedImage?.filename ?? ''"
          @ionInput="onCaptionInput"
          @keydown.enter.prevent="$emit('confirm-image-insert')"
        />
      </ion-item>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <div class="image-caption-actions">
          <ion-button fill="outline" @click="$emit('close-caption')">
            Cancel
          </ion-button>
          <ion-button
            :disabled="!selectedImage"
            @click="$emit('confirm-image-insert')"
          >
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
            @click="$emit('open-caption', image)"
          >
            <EntryImageDraftPreview
              :image-id="image.image?.id ?? null"
              :preview-url="image.previewUrl"
              :filename="image.filename"
              :uploading="
                image.status === 'uploading' ||
                image.status === 'draft-uploading'
              "
            />
            <span class="editor-image-chip-name">{{ image.filename }}</span>
            <span class="editor-image-chip-status">{{
              imageStatusText(image)
            }}</span>
          </button>
          <button
            type="button"
            class="editor-image-chip-remove"
            :disabled="
              committing ||
              image.status === 'uploading' ||
              image.status === 'draft-uploading'
            "
            :aria-label="`Remove ${image.filename}`"
            @click="$emit('remove-image', image.localId)"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  </ion-footer>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';

import type { ImageResponse } from '../generated/types';
import type { EntryImageDraft } from '../utils/entryImageDrafts';
import EntryImageDraftPreview from './EntryImageDraftPreview.vue';
import MarkdownContent from './MarkdownContent.vue';

defineProps<{
  bindTextareaRef?: (el: unknown) => void;
  bindImageInputRef?: (el: unknown) => void;
  content: string;
  contentTab: 'write' | 'preview';
  committing: boolean;
  autosaveOffline: boolean;
  uploadDisabled: boolean;
  uploadButtonTitle?: string;
  imageError: string;
  attachedImages: ImageResponse[];
  localImageUrls: Record<string, string>;
  imageDrafts: EntryImageDraft[];
  selectedImage: EntryImageDraft | null;
  isCaptionModalOpen: boolean;
  captionDraft: string;
  commitFailDialogOpen: boolean;
  commitFailDialogMessage: string;
  commitFailWillRetry: boolean;
}>();

const emit = defineEmits<{
  'update:content': [value: string];
  'update:contentTab': [value: 'write' | 'preview'];
  'update:captionDraft': [value: string];
  'textarea-input': [event: CustomEvent];
  'remember-selection': [];
  'open-image-picker': [];
  'image-selected': [event: Event];
  'close-commit-fail': [];
  'acknowledge-commit-failure': [];
  'close-caption': [];
  'confirm-image-insert': [];
  'open-caption': [image: EntryImageDraft];
  'remove-image': [localId: string];
}>();

function onContentInput(event: CustomEvent) {
  const target = event.target as HTMLTextAreaElement | null;
  emit('update:content', String(event.detail?.value ?? target?.value ?? ''));
  emit('textarea-input', event);
}

function onCaptionInput(event: CustomEvent) {
  const target = event.target as HTMLInputElement | null;
  emit(
    'update:captionDraft',
    String(event.detail?.value ?? target?.value ?? ''),
  );
}

function imageStatusText(image: EntryImageDraft) {
  if (image.status === 'uploading') return 'Uploading...';
  if (image.status === 'draft-uploading') return 'Processing...';
  if (image.status === 'failed') return image.error || 'Failed';
  if (image.status === 'local') return 'Pending draft...';
  return 'Attached';
}
</script>

<style scoped>
.autosave-offline-note {
  color: var(--ion-color-medium);
  font-size: 0.82rem;
  margin: 0 4px;
  font-style: italic;
}

.image-offline-note {
  margin-top: 0;
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

.commit-fail-dialog-content {
  --padding-top: 18px;
  --padding-start: 20px;
  --padding-end: 20px;
}

.commit-fail-dialog-message {
  font-size: 0.95rem;
  color: var(--ion-color-danger);
  font-weight: 600;
  margin: 0 0 12px;
}

.commit-fail-dialog-note {
  font-size: 0.88rem;
  color: var(--ion-color-medium);
  margin: 0;
  line-height: 1.5;
}

.commit-fail-dialog-actions {
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
