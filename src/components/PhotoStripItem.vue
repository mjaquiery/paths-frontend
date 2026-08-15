<template>
  <div class="photo-row">
    <button
      type="button"
      class="photo-row-thumb"
      :aria-label="`Change photo ${filename}`"
      @click="onThumbClick"
    >
      <img
        v-if="thumbnailSrc && !loadFailed"
        :src="thumbnailSrc"
        :alt="filename"
        class="photo-row-thumb-img"
        @error="loadFailed = true"
      />
      <span
        v-else-if="isLoadingThumbnail"
        class="photo-row-thumb-placeholder"
        aria-label="Loading image"
        >⏳</span
      >
      <span
        v-else
        class="photo-row-thumb-placeholder photo-row-thumb-placeholder--error"
        aria-label="Failed to load image"
        >⚠️</span
      >
    </button>

    <div class="photo-row-caption">
      <input
        v-if="editingCaption"
        ref="captionInputRef"
        v-model="draftCaption"
        class="photo-row-caption-input"
        placeholder="Add a caption"
        :aria-label="`Caption for ${filename}`"
        @blur="commitCaption"
        @keydown.enter="($event.target as HTMLInputElement).blur()"
      />
      <button
        v-else
        type="button"
        class="photo-row-caption-display"
        :class="{ 'photo-row-caption-display--empty': !caption }"
        @click="startEditingCaption"
      >
        {{ caption || 'Add a caption' }}
      </button>
    </div>

    <button
      type="button"
      class="photo-row-remove"
      :aria-label="`Remove image ${filename}`"
      @click="onRemoveClick"
    >
      ✕
    </button>
  </div>

  <ion-alert
    :is-open="showRemoveConfirm"
    header="Remove photo"
    :message="`Remove ${filename} from this entry?`"
    :buttons="confirmButtons"
    @didDismiss="onConfirmDismiss"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { IonAlert } from '@ionic/vue';

import { useGetImageDownloadUrl } from '../generated/apiClient';
import { pickImages } from '../composables/useImagePicker';
import type { ImageDownloadResponse } from '../generated/types';

/**
 * A single photo row in the "add photos" list, shared by already-uploaded
 * images (`variant: 'existing'`, thumbnail resolved from the server) and
 * images queued locally but not yet uploaded (`variant: 'pending'`,
 * thumbnail rendered from the in-memory `File` via an object URL).
 */
const props = defineProps<{
  variant: 'existing' | 'pending';
  /** Required when variant is 'existing'. */
  imageId?: string;
  /** Required when variant is 'pending'. */
  file?: File;
  filename: string;
  caption: string;
}>();

const emit = defineEmits<{
  /** Fired once editing ends (blur / Enter), not on every keystroke. */
  'commit-caption': [string];
  remove: [];
  /** The user picked a replacement image for this row. */
  change: [File];
}>();

async function onThumbClick() {
  const [file] = await pickImages({ multiple: false });
  if (file) emit('change', file);
}

// --- Thumbnail resolution -------------------------------------------------

const loadFailed = ref(false);
watch(
  () => [props.imageId, props.file],
  () => (loadFailed.value = false),
);

const { data, isLoading } = useGetImageDownloadUrl(
  computed(() => props.imageId ?? ''),
  {
    query: {
      enabled: computed(() => props.variant === 'existing' && !!props.imageId),
    },
  },
);
const existingThumbUrl = computed(
  () =>
    (data.value?.data as ImageDownloadResponse | undefined)?.thumbnail_url ??
    (data.value?.data as ImageDownloadResponse | undefined)?.image_url ??
    null,
);

const pendingObjectUrl = ref<string | null>(null);
watch(
  () => props.file,
  (file, _old, onCleanup) => {
    if (props.variant !== 'pending' || !file) {
      pendingObjectUrl.value = null;
      return;
    }
    const url = URL.createObjectURL(file);
    pendingObjectUrl.value = url;
    onCleanup(() => URL.revokeObjectURL(url));
  },
  { immediate: true },
);

const thumbnailSrc = computed(() =>
  props.variant === 'existing'
    ? existingThumbUrl.value
    : pendingObjectUrl.value,
);
const isLoadingThumbnail = computed(
  () => props.variant === 'existing' && isLoading.value,
);

// --- Caption editing (click-to-edit; commits on blur/Enter) --------------

const editingCaption = ref(false);
const draftCaption = ref(props.caption);
const captionInputRef = ref<HTMLInputElement | null>(null);

async function startEditingCaption() {
  draftCaption.value = props.caption;
  editingCaption.value = true;
  await nextTick();
  captionInputRef.value?.focus();
}

function commitCaption() {
  editingCaption.value = false;
  if (draftCaption.value !== props.caption) {
    emit('commit-caption', draftCaption.value);
  }
}

// --- Removal, with confirmation for already-invested content --------------

const needsConfirm = computed(
  () => props.variant === 'existing' || props.caption.trim().length > 0,
);
const showRemoveConfirm = ref(false);
// Only actually removes the row once the alert has finished dismissing
// itself (see onConfirmDismiss) — removing it eagerly, from inside the
// button handler, would tear down this component (and the still-closing
// <ion-alert> along with it) mid-animation.
const removalConfirmed = ref(false);

function onRemoveClick() {
  if (needsConfirm.value) {
    showRemoveConfirm.value = true;
  } else {
    emit('remove');
  }
}

const confirmButtons = computed(() => [
  { text: 'Cancel', role: 'cancel' },
  {
    text: 'Remove',
    role: 'destructive',
    handler: () => (removalConfirmed.value = true),
  },
]);

function onConfirmDismiss() {
  showRemoveConfirm.value = false;
  if (removalConfirmed.value) {
    removalConfirmed.value = false;
    emit('remove');
  }
}
</script>

<style scoped>
.photo-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.photo-row-thumb {
  flex-shrink: 0;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-rule);
  background: none;
  padding: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.photo-row-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-row-thumb-placeholder {
  font-size: 1.3rem;
  color: var(--color-ink-muted);
}

.photo-row-caption {
  flex: 1;
  min-width: 0;
}

.photo-row-caption-input {
  width: 100%;
  border: 1px solid var(--color-rule);
  border-radius: 6px;
  background: none;
  color: var(--color-ink);
  font-size: 0.9rem;
  padding: 0.4rem 0.6rem;
  font-family: var(--font-sans);
}

.photo-row-caption-display {
  display: block;
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  padding: 0.4rem 0;
  font-size: 0.9rem;
  color: var(--color-ink);
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.photo-row-caption-display--empty {
  color: var(--color-ink-muted);
  font-style: italic;
}

.photo-row-remove {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--color-ink-muted);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.3rem;
}
</style>
