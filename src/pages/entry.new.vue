<template>
  <ion-page>
    <ion-header class="editor-toolbar-header">
      <div class="editor-header">
        <button class="text-btn" @click="goBack">Cancel</button>
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
    </ion-header>
    <ion-content>
      <div class="editor-page df-ui">
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

        <p v-if="error" class="editor-error">{{ error }}</p>

        <p class="editor-section-label">Photos</p>
        <div class="photo-list">
          <PhotoStripItem
            v-for="img in pendingImages"
            :key="img.id"
            variant="pending"
            :file="img.file"
            :filename="img.file.name"
            v-model:caption="img.caption"
            @change="(file) => (img.file = file)"
            @remove="removePendingImage(img.id)"
            @request-remove="
              requestRemove({
                kind: 'pending',
                id: img.id,
                filename: img.file.name,
              })
            "
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

    <ion-alert
      :is-open="pendingRemoval !== null"
      header="Remove photo"
      :message="
        pendingRemoval
          ? `Remove ${pendingRemoval.filename} from this entry?`
          : ''
      "
      :buttons="removeConfirmButtons"
      @didDismiss="onRemoveConfirmDismiss"
    />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonAlert,
  IonPage,
  IonHeader,
  IonContent,
  IonTextarea,
} from '@ionic/vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';

import { useCreateEntry } from '../generated/apiClient';
import { usePaths } from '../composables/usePaths';
import { useLocalDraft } from '../composables/useLocalDraft';
import { pickImages } from '../composables/useImagePicker';
import { usePhotoRemoveConfirm } from '../composables/usePhotoRemoveConfirm';
import { describeError } from '../lib/errors';
import { currentUser } from '../lib/authSession';
import MarkdownContent from '../components/MarkdownContent.vue';
import PhotoStripItem from '../components/PhotoStripItem.vue';
import SavingOverlay from '../components/SavingOverlay.vue';
import { useMarkdownEditor } from '../composables/useMarkdownEditor';
import { toLocalISODate } from '../utils/date';
import { dateViewPath, pathViewPath } from '../utils/viewLinks';

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

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

// Only reachable from the path view (which always passes a pathId) or the
// date view (which never does) — so that alone says which one to return to,
// no separate "from" hint needed.
function goBack() {
  router.replace(
    initialPathId
      ? pathViewPath(initialPathId, initialDay)
      : dateViewPath(initialDay),
  );
}

const uploadProgress = ref(0);
const { mutateAsync: createEntryMutation, isPending: saving } = useCreateEntry({
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
const pendingImages = ref<{ id: string; file: File; caption: string }[]>([]);
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

const { onTextareaInput, wrapSelection, prefixLine } = useMarkdownEditor(
  content,
  textareaRef,
);

async function addImages() {
  const files = await pickImages();
  pendingImages.value.push(
    ...files.map((file) => ({ id: crypto.randomUUID(), file, caption: '' })),
  );
}

function removePendingImage(id: string) {
  pendingImages.value = pendingImages.value.filter((img) => img.id !== id);
}

const {
  pending: pendingRemoval,
  requestRemove,
  buttons: removeConfirmButtons,
  onDismiss: onRemoveConfirmDismiss,
} = usePhotoRemoveConfirm((removal) => removePendingImage(removal.id));

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
        images: pendingImages.value.map((img) => img.file),
      },
    });
    // Navigate immediately — invalidation and draft cleanup don't need to
    // block leaving the page, and awaiting them here made "Save" feel stuck
    // for a full network round-trip after the entry was already created.
    goBack();
    void queryClient.invalidateQueries({
      queryKey: ['v1', 'paths', selectedPathId.value, 'entries'],
    });
    void clearDraft();
  } catch (err: unknown) {
    error.value = describeError('create entry', err);
  }
}
</script>

<style scoped>
.editor-page {
  max-width: 40rem;
  margin: 0 auto;
  padding: 1rem var(--page-margin, 0.75rem) 2rem;
}

/* No footer clearance is reserved on this page (see ion-content override
   below) since AppFooter is hidden here — the on-screen keyboard covering
   it would defeat the point of keeping Save reachable while typing. */
ion-content {
  --padding-bottom: 1rem !important;
}

.editor-toolbar-header {
  background: var(--color-paper);
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 40rem;
  margin: 0 auto;
  padding: max(0.6rem, env(safe-area-inset-top)) var(--page-margin, 0.75rem)
    0.75rem;
  border-bottom: 1px solid var(--color-rule);
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
