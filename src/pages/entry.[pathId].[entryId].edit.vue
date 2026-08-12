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
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>

        <div class="editor-toolbar">
          <button
            type="button"
            :disabled="contentTab === 'preview'"
            @click="wrapSelection('**')"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            :disabled="contentTab === 'preview'"
            @click="wrapSelection('*')"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            :disabled="contentTab === 'preview'"
            @click="prefixLine('# ')"
          >
            H1
          </button>
          <button
            type="button"
            :disabled="contentTab === 'preview'"
            @click="prefixLine('## ')"
          >
            H2
          </button>
          <button
            type="button"
            :disabled="contentTab === 'preview'"
            @click="prefixLine('- ')"
          >
            • List
          </button>
          <button
            type="button"
            :disabled="contentTab === 'preview'"
            aria-label="Insert link"
            @click="wrapSelection('[', '](url)')"
          >
            🔗
          </button>
          <button
            type="button"
            class="preview-toggle"
            :class="{ 'preview-toggle--active': contentTab === 'preview' }"
            @click="contentTab = contentTab === 'preview' ? 'write' : 'preview'"
          >
            Preview
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

        <template v-if="keptImages.length > 0 || removedImages.length > 0">
          <p class="editor-section-label">Images</p>
          <div class="existing-images">
            <div
              v-for="img in keptImages"
              :key="img.id"
              class="existing-image-item"
            >
              <span class="existing-image-name">{{ img.filename }}</span>
              <button
                class="image-action-btn"
                type="button"
                :aria-label="`Insert image ${img.filename} into content`"
                @click="insertImageMarkdown(img.filename)"
              >
                ↳ Insert
              </button>
              <button
                class="image-action-btn image-action-btn--danger"
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
                class="image-action-btn"
                type="button"
                :aria-label="`Restore image ${img.filename}`"
                @click="restoreImage(img.id)"
              >
                ↩ Restore
              </button>
            </div>
          </div>
        </template>

        <p class="editor-section-label">Add photos</p>
        <div class="photo-strip">
          <div
            v-for="img in pendingImages"
            :key="img.file.name"
            class="photo-pending"
          >
            <span class="photo-pending-name">{{ img.file.name }}</span>
            <input
              v-model="img.caption"
              placeholder="Caption"
              class="photo-caption-input"
            />
            <button
              class="photo-insert-btn"
              type="button"
              :aria-label="`Insert image ${img.file.name} into content`"
              @click="insertImageMarkdown(img.file.name)"
            >
              ↳
            </button>
          </div>
          <button class="photo-add-btn" type="button" @click="addImages">
            +
          </button>
        </div>
      </div>
    </ion-content>
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

const { onTextareaInput, insertImageMarkdown, wrapSelection, prefixLine } =
  useMarkdownEditor(content, textareaRef, contentTab);

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
        'A newer version of this entry exists. Go back and reopen it to edit the latest version.';
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

.existing-images {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.existing-image-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.existing-image-item--removed .existing-image-name {
  text-decoration: line-through;
  color: var(--color-ink-muted);
}

.existing-image-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-action-btn {
  background: none;
  border: 1px solid var(--color-rule);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  color: var(--color-ink);
}

.image-action-btn--danger {
  color: var(--ion-color-danger);
}

.photo-strip {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  align-items: flex-start;
}

.photo-pending {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  width: 6rem;
  font-size: 0.75rem;
}

.photo-pending-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-ink-muted);
}

.photo-caption-input {
  border: 1px solid var(--color-rule);
  border-radius: 4px;
  background: none;
  color: var(--color-ink);
  font-size: 0.75rem;
  padding: 0.2rem 0.3rem;
}

.photo-insert-btn {
  align-self: flex-start;
  background: none;
  border: 1px solid var(--color-rule);
  border-radius: 4px;
  color: var(--color-ink);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.1rem 0.4rem;
}

.photo-add-btn {
  width: 3.5rem;
  height: 3.5rem;
  border: 1px dashed var(--color-rule);
  border-radius: 6px;
  background: none;
  color: var(--color-ink-muted);
  font-size: 1.3rem;
  cursor: pointer;
}
</style>
