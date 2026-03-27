<template>
  <div class="image-upload-wrapper">
    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="image-upload-input"
      :disabled="uploading || disabled"
      @change="onFileSelected"
    />

    <!-- Caption prompt (shown after file is picked, before confirming) -->
    <div v-if="pendingFile" class="image-caption-prompt">
      <ion-item class="caption-field">
        <ion-label position="stacked">Caption (alt text)</ion-label>
        <ion-input
          v-model="caption"
          :placeholder="pendingFile.name"
          autocorrect="off"
          spellcheck="false"
          @keydown.enter.prevent="confirmInsert"
        />
      </ion-item>
      <div class="caption-actions">
        <ion-button size="small" fill="outline" @click="cancelPending">
          Cancel
        </ion-button>
        <ion-button size="small" :disabled="uploading" @click="confirmInsert">
          {{ uploading ? 'Uploading…' : 'Insert image' }}
        </ion-button>
      </div>
      <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>
    </div>

    <!-- Trigger button -->
    <ion-button
      v-else
      size="small"
      fill="outline"
      :disabled="uploading || disabled"
      @click="openPicker"
    >
      {{ uploading ? 'Uploading…' : '+ Image' }}
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonButton, IonItem, IonLabel, IonInput } from '@ionic/vue';
import { useImageUpload } from '../composables/useImageUpload';

const props = defineProps<{
  pathCode: string;
  entrySlug: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'insert', markdown: string): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const pendingFile = ref<File | null>(null);
const caption = ref('');

const { uploading, uploadError, uploadImage } = useImageUpload();

function openPicker() {
  fileInput.value?.click();
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  pendingFile.value = file;
  caption.value = '';
  // Reset so the same file can be re-picked
  input.value = '';
}

function cancelPending() {
  pendingFile.value = null;
  caption.value = '';
}

async function confirmInsert() {
  if (!pendingFile.value) return;
  const file = pendingFile.value;
  const altText = caption.value.trim() || file.name;

  const result = await uploadImage(props.pathCode, props.entrySlug, file);
  if (!result) return; // uploadError is already set

  const markdown = `![${altText}](${result.filename})`;
  emit('insert', markdown);
  pendingFile.value = null;
  caption.value = '';
}
</script>

<style scoped>
.image-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-upload-input {
  display: none;
}

.image-caption-prompt {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--ion-border-color);
  border-radius: 12px;
  background: var(--ion-item-background);
}

.caption-field {
  --padding-start: 0;
  --inner-padding-end: 0;
  --border-radius: 10px;
}

.caption-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.caption-actions ion-button {
  margin: 0;
}

.upload-error {
  color: var(--ion-color-danger);
  font-size: 0.85rem;
  margin: 0;
}
</style>
