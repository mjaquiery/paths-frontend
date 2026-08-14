<template>
  <ion-page>
    <ion-content>
      <div class="editor-page df-ui">
        <div class="editor-header">
          <button class="text-btn" @click="router.back()">Cancel</button>
          <div class="editor-header-title">
            <span class="editor-header-label">Entry</span>
            <span class="editor-header-date">{{ headerDateLabel }}</span>
          </div>
          <button
            class="pill-btn"
            :disabled="!selectedPathId || !day || !content || saving"
            @click="submit"
          >
            {{ saveLabel }}
          </button>
        </div>

        <div class="editor-meta-row">
          <select
            v-model="selectedPathId"
            class="path-select"
            aria-label="Path"
            :style="{ borderColor: selectedPathColor }"
          >
            <option
              v-for="path in ownedPaths"
              :key="path.path_id"
              :value="path.path_id"
            >
              {{ path.title }}
            </option>
          </select>
          <input
            v-model="day"
            type="date"
            class="day-input"
            aria-label="Date"
          />
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

        <p v-if="error" class="editor-error">{{ error }}</p>

        <p class="editor-section-label">Photos</p>
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
    <SavingOverlay :active="saving" :label="saveLabel" />
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonTextarea } from '@ionic/vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';

import { useCreateEntry } from '../generated/apiClient';
import { usePaths } from '../composables/usePaths';
import { useLocalDraft } from '../composables/useLocalDraft';
import { pickImages } from '../composables/useImagePicker';
import { extractErrorMessage } from '../lib/errors';
import MarkdownContent from '../components/MarkdownContent.vue';
import SavingOverlay from '../components/SavingOverlay.vue';
import { useMarkdownEditor } from '../composables/useMarkdownEditor';
import { toLocalISODate } from '../utils/date';
import type { OAuthCallbackResponse } from '../generated/types';

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
  (route.query.day as string | undefined) ?? toLocalISODate(new Date());
const initialPathId = (route.query.pathId as string | undefined) ?? '';

const uploadProgress = ref(0);
const { mutateAsync: createEntryMutation, isPending: saving } =
  useCreateEntry({
    request: {
      onUploadProgress: (loaded, total) => {
        uploadProgress.value = total > 0 ? Math.round((loaded / total) * 100) : 0;
      },
    },
  });

const selectedPathId = ref(initialPathId);
const day = ref(initialDay);
const contentTab = ref<'write' | 'preview'>('write');
const error = ref('');
const pendingImages = ref<{ file: File; caption: string }[]>([]);
const textareaRef = ref<InstanceType<typeof IonTextarea> | null>(null);

const saveLabel = computed(() => {
  if (!saving.value) return 'Save';
  if (pendingImages.value.length === 0) return 'Saving…';
  return `Saving… ${uploadProgress.value}%`;
});

const selectedPathColor = computed(
  () =>
    ownedPaths.value.find((p) => p.path_id === selectedPathId.value)?.color ??
    'var(--color-ink)',
);

const headerDateLabel = computed(() => {
  const todayStr = toLocalISODate(new Date());
  if (day.value === todayStr) return 'Today';
  return new Date(day.value + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
});

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

const { onTextareaInput, insertImageMarkdown, wrapSelection, prefixLine } =
  useMarkdownEditor(content, textareaRef, contentTab);

async function addImages() {
  const files = await pickImages();
  pendingImages.value.push(...files.map((file) => ({ file, caption: '' })));
}

async function submit() {
  if (!selectedPathId.value || !day.value || !content.value) return;
  uploadProgress.value = 0;
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
  background: none;
  border: none;
  color: var(--color-ink-muted);
  font-size: 0.95rem;
  cursor: pointer;
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

.editor-meta-row {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.path-select,
.day-input {
  border: 1px solid var(--color-rule);
  border-radius: 999px;
  background: none;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.9rem;
  color: var(--color-ink);
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

.editor-section-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
  margin: 1.5rem 0 0.6rem;
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
