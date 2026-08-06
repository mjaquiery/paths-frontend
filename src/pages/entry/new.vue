<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>New Entry</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
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

      <ion-item>
        <ion-label position="stacked">Day *</ion-label>
        <ion-input v-model="day" type="date" />
      </ion-item>

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

      <ion-item lines="none">
        <ion-label position="stacked">Images (optional)</ion-label>
        <ion-button size="small" fill="outline" @click="addImages">
          + Add photo
        </ion-button>
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

      <p v-if="error" class="entry-error">{{ error }}</p>

      <div class="entry-page-actions">
        <ion-button
          expand="block"
          :disabled="!selectedPathId || !day || !content || saving"
          @click="submit"
        >
          {{ saving ? 'Saving…' : 'Create Entry' }}
        </ion-button>
      </div>
    </ion-content>
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
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
} from '@ionic/vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';

import { useCreateEntry } from '../../generated/apiClient';
import { usePaths } from '../../composables/usePaths';
import { useLocalDraft } from '../../composables/useLocalDraft';
import { pickImages } from '../../composables/useImagePicker';
import { extractErrorMessage } from '../../lib/errors';
import MarkdownContent from '../../components/MarkdownContent.vue';
import { useMarkdownEditor } from '../../composables/useMarkdownEditor';
import type { OAuthCallbackResponse } from '../../generated/types';

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const currentUser = ref<OAuthCallbackResponse | null>(null);
onMounted(() => {
  const stored = localStorage.getItem('user');
  if (stored) {
    try {
      currentUser.value = JSON.parse(stored) as OAuthCallbackResponse;
    } catch {
      currentUser.value = null;
    }
  }
});

const { data: allPaths } = usePaths();
const ownedPaths = computed(
  () =>
    allPaths.value?.filter(
      (p) => p.owner_user_id === currentUser.value?.user_id,
    ) ?? [],
);

const initialDay =
  (route.query.day as string | undefined) ??
  new Date().toISOString().slice(0, 10);
const initialPathId = (route.query.pathId as string | undefined) ?? '';

const { mutateAsync: createEntryMutation, isPending: saving } =
  useCreateEntry();

const selectedPathId = ref(initialPathId);
const day = ref(initialDay);
const contentTab = ref<'write' | 'preview'>('write');
const error = ref('');
const pendingImages = ref<{ file: File; caption: string }[]>([]);
const textareaRef = ref<InstanceType<typeof IonTextarea> | null>(null);

watch(
  ownedPaths,
  (paths) => {
    if (!selectedPathId.value && paths.length > 0) {
      selectedPathId.value = paths[0]!.path_id;
    }
  },
  { immediate: true },
);

const pathId = computed(() => selectedPathId.value);
const {
  content,
  restore,
  clear: clearDraft,
} = useLocalDraft(pathId, day, ref(null));
onMounted(restore);

const { onTextareaInput, insertImageMarkdown } = useMarkdownEditor(
  content,
  textareaRef,
  contentTab,
);

async function addImages() {
  const files = await pickImages();
  pendingImages.value.push(...files.map((file) => ({ file, caption: '' })));
}

async function submit() {
  if (!selectedPathId.value || !day.value || !content.value) return;
  error.value = '';
  try {
    await createEntryMutation({
      pathCode: selectedPathId.value,
      data: {
        entry_id: crypto.randomUUID(),
        day: day.value,
        content: content.value,
        captions: pendingImages.value.map((img) => img.caption),
        // orval types multipart file-array fields as string[] (an OpenAPI binary-format
        // quirk) — the real runtime value is the File objects themselves.
        images: pendingImages.value.map(
          (img) => img.file,
        ) as unknown as string[],
      },
    });
    await queryClient.invalidateQueries({
      queryKey: ['v1', 'paths', selectedPathId.value, 'entries'],
    });
    await clearDraft();
    router.back();
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

.entry-page-actions {
  margin: 16px 0;
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

.insert-image-btn {
  background: none;
  border: 1px solid var(--ion-color-primary, #3880ff);
  border-radius: 4px;
  color: var(--ion-color-primary, #3880ff);
  cursor: pointer;
  font-size: 0.75rem;
  line-height: 1;
  padding: 2px 6px;
  flex-shrink: 0;
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
