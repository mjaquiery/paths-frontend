<template>
  <ion-page>
    <ion-content>
      <div class="editor-page df-ui">
        <div class="editor-header">
          <router-link class="text-btn" :to="`/entry/${pathId}/${entryId}`">
            Cancel
          </router-link>
          <div class="editor-header-title">
            <span class="editor-header-label">{{ path?.title }}</span>
            <span class="editor-header-date">{{ entryData?.day }}</span>
          </div>
          <button
            class="pill-btn"
            :disabled="!content.trim() || saving"
            @click="submit"
          >
            {{ saveLabel }}
          </button>
        </div>

        <div class="editor-toolbar">
          <template v-if="contentTab === 'write'">
            <button type="button" @click="wrapSelection('**')">
              <strong>B</strong>
            </button>
            <button type="button" @click="wrapSelection('*')">
              <em>I</em>
            </button>
            <button type="button" @click="prefixLine('# ')">H1</button>
            <button type="button" @click="prefixLine('## ')">H2</button>
            <button type="button" @click="prefixLine('- ')">• List</button>
            <button
              type="button"
              aria-label="Insert link"
              @click="wrapSelection('[', '](url)')"
            >
              🔗
            </button>
          </template>
          <button
            type="button"
            class="preview-toggle"
            :class="{ 'preview-toggle--active': contentTab === 'preview' }"
            @click="contentTab = contentTab === 'preview' ? 'write' : 'preview'"
          >
            {{ contentTab === 'preview' ? 'Write' : 'Preview' }}
          </button>
        </div>

        <ion-textarea
          v-if="contentTab === 'write'"
          ref="textareaRef"
          v-model="content"
          class="editor-textarea"
          placeholder="Write your entry… (markdown supported)"
          :rows="10"
          auto-grow
          autocapitalize="sentences"
          autocorrect="on"
          :spellcheck="true"
          @ionInput="onTextareaInput"
        />
        <div v-else class="editor-preview">
          <MarkdownContent v-if="content" :content="content" />
          <p v-else class="editor-preview-empty">(nothing to preview)</p>
        </div>

        <p v-if="conflictError" class="editor-error editor-error--conflict">
          {{ conflictError }}
        </p>
        <p v-else-if="error" class="editor-error">{{ error }}</p>

        <p class="editor-section-label">Photos</p>
        <div class="photo-list">
          <PhotoStripItem
            v-for="img in keptImages"
            :key="img.id"
            variant="existing"
            :image-id="img.id"
            :filename="img.filename"
            :caption="img.caption ?? ''"
            @commit-caption="(caption) => updateExistingCaption(img, caption)"
            @change="(file) => replaceExistingImage(img, file)"
            @remove="removeExistingImage(img.id)"
          />
          <PhotoStripItem
            v-for="img in pendingImages"
            :key="img.id"
            variant="pending"
            :file="img.file"
            :filename="img.file.name"
            :caption="img.caption"
            @commit-caption="(caption) => (img.caption = caption)"
            @change="(file) => (img.file = file)"
            @remove="removePendingImage(img.id)"
          />
          <button
            type="button"
            class="photo-row photo-row--add"
            @click="addImages"
          >
            <span
              class="photo-row-thumb photo-row-thumb--add"
              aria-hidden="true"
              >+</span
            >
            <span
              class="photo-row-caption-display photo-row-caption-display--empty"
              >Add an image</span
            >
          </button>
        </div>
      </div>
    </ion-content>
    <SavingOverlay :active="saving" :label="saveLabel" />
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonTextarea } from '@ionic/vue';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';

import {
  useGetEntry,
  useListEntryImages,
  useUpdateEntry,
  useUpdateImageCaption,
} from '../generated/apiClient';
import { usePaths } from '../composables/usePaths';
import { useLocalDraft } from '../composables/useLocalDraft';
import { pickImages } from '../composables/useImagePicker';
import { describeError, isApiErrorWithStatus } from '../lib/errors';
import MarkdownContent from '../components/MarkdownContent.vue';
import PhotoStripItem from '../components/PhotoStripItem.vue';
import SavingOverlay from '../components/SavingOverlay.vue';
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

const uploadProgress = ref(0);
const { mutateAsync: doUpdateEntry } = useUpdateEntry({
  request: {
    onUploadProgress: (loaded, total) => {
      uploadProgress.value = total > 0 ? Math.round((loaded / total) * 100) : 0;
    },
  },
});

const contentTab = ref<'write' | 'preview'>('write');
const keptImages = ref<ImageResponse[]>([]);
const removedImageIds = ref<string[]>([]);
const pendingImages = ref<{ id: string; file: File; caption: string }[]>([]);
const saving = ref(false);
const error = ref('');
const conflictError = ref('');
const saveLabel = computed(() => {
  if (!saving.value) return 'Save';
  if (pendingImages.value.length === 0) return 'Saving…';
  return `Saving… ${uploadProgress.value}%`;
});
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
  if (images) {
    // Query results are deeply readonly (shared TanStack Query cache
    // entries) — clone so caption edits below can mutate freely.
    keptImages.value = images.map((img) => ({ ...img }));
    removedImageIds.value = [];
  }
});

const { onTextareaInput, wrapSelection, prefixLine } = useMarkdownEditor(
  content,
  textareaRef,
);

const { mutateAsync: doUpdateImageCaption } = useUpdateImageCaption();

function removeExistingImage(imageId: string) {
  const idx = keptImages.value.findIndex((img) => img.id === imageId);
  if (idx !== -1) {
    keptImages.value.splice(idx, 1);
    removedImageIds.value.push(imageId);
  }
}

async function updateExistingCaption(image: ImageResponse, caption: string) {
  if (entryData.value?.edit_id === undefined) return;
  const previousCaption = image.caption;
  image.caption = caption;
  try {
    await doUpdateImageCaption({
      imageId: image.id,
      data: { caption, expected_edit_id: entryData.value.edit_id },
    });
  } catch (err: unknown) {
    image.caption = previousCaption;
    error.value = describeError('update caption', err);
  }
}

function replaceExistingImage(image: ImageResponse, file: File) {
  removeExistingImage(image.id);
  pendingImages.value.push({
    id: crypto.randomUUID(),
    file,
    caption: image.caption ?? '',
  });
}

async function addImages() {
  const files = await pickImages();
  pendingImages.value.push(
    ...files.map((file) => ({ id: crypto.randomUUID(), file, caption: '' })),
  );
}

function removePendingImage(id: string) {
  pendingImages.value = pendingImages.value.filter((img) => img.id !== id);
}

async function submit() {
  if (!content.value.trim() || entryData.value?.edit_id === undefined) return;
  saving.value = true;
  uploadProgress.value = 0;
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
        remove_image_ids: removedImageIds.value,
        images: pendingImages.value.map((img) => img.file),
      },
    });

    await queryClient.invalidateQueries({
      queryKey: ['v1', 'paths', pathId, 'entries'],
    });
    await clearDraft();
    router.push(`/entry/${pathId}/${entryId}`);
  } catch (err: unknown) {
    if (isApiErrorWithStatus(err, 409)) {
      conflictError.value =
        'A newer version of this entry exists. Go back and reopen it to edit the latest version.';
    } else {
      error.value = describeError('save entry', err);
    }
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.editor-page {
  max-width: 40rem;
  margin: 0 auto;
  padding: 1rem var(--page-margin, 0.75rem) 2rem;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-rule);
  margin-bottom: 1rem;
}

.text-btn {
  display: inline-block;
  text-decoration: none;
  color: var(--color-ink-muted);
  font-size: 0.95rem;
  padding: 0.2rem;
}

.editor-header-title {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.editor-header-label {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
}

.editor-header-date {
  font-size: 0.95rem;
  color: var(--color-ink);
}

.pill-btn {
  background: var(--color-ink);
  color: var(--color-paper);
  border: none;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.45rem 1.1rem;
  cursor: pointer;
}

.pill-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.editor-toolbar {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  padding: 0.5rem 0;
  border-top: 1px solid var(--color-rule);
  border-bottom: 1px solid var(--color-rule);
  margin-bottom: 0.75rem;
}

.editor-toolbar button {
  background: none;
  border: 1px solid var(--color-rule);
  border-radius: 4px;
  color: var(--color-ink);
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
}

.editor-toolbar button:disabled {
  opacity: 0.4;
  cursor: default;
}

.preview-toggle {
  margin-left: auto;
}

.preview-toggle--active {
  background: var(--color-ink);
  color: var(--color-paper);
  border-color: var(--color-ink);
}

.editor-textarea {
  font-family: var(--font-serif);
  font-size: 1.05rem;
  --padding-start: 0;
  --padding-end: 0;
}

.editor-preview {
  min-height: 8em;
}

.editor-preview-empty {
  color: var(--color-ink-muted);
  font-size: 0.9rem;
}

.editor-error {
  color: var(--ion-color-danger);
  font-size: 0.85rem;
  margin-top: 0.75rem;
}

.editor-error--conflict {
  background: color-mix(in srgb, #f5a623 15%, var(--color-paper));
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
}

.editor-section-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
  margin: 1.5rem 0 0.6rem;
}

.photo-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.photo-row--add {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  text-align: left;
  cursor: pointer;
}

.photo-row-thumb--add {
  flex-shrink: 0;
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--color-rule);
  border-radius: 8px;
  color: var(--color-ink-muted);
  font-size: 1.3rem;
}

.photo-row-caption-display--empty {
  color: var(--color-ink-muted);
  font-style: italic;
  font-size: 0.9rem;
}
</style>
