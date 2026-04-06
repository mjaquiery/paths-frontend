<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>New Entry</ion-title>
        <ion-buttons slot="end">
          <ion-button :disabled="committing || !canCommit" @click="commitDraft">
            {{ committing ? 'Saving...' : 'Save' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="entry-editor-content">
      <div class="entry-form">
        <!-- Paths API full-state error -->
        <div v-if="pathsError && !paths" class="view-full-error">
          <p class="view-full-error-title">Could not load your paths.</p>
          <p class="view-full-error-body">{{ pathsErrorMessage }}</p>
          <div class="view-full-error-actions">
            <ion-button fill="outline" @click="$router.back()"
              >Go back</ion-button
            >
          </div>
        </div>

        <!-- No owned paths inline state -->
        <div
          v-else-if="paths !== undefined && ownedPaths.length === 0"
          class="view-no-paths"
        >
          <p class="view-no-paths-title">You don't have any paths yet.</p>
          <p class="view-no-paths-body">
            Create a path first, then come back to write an entry.
          </p>
          <div class="view-no-paths-actions">
            <ion-button fill="outline" @click="$router.back()"
              >Go back</ion-button
            >
            <ion-button router-link="/paths/new">Create a path</ion-button>
          </div>
        </div>

        <template v-else-if="ownedPaths.length > 0">
          <ion-item class="entry-field">
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

          <ion-item class="entry-field">
            <ion-label position="stacked">Day *</ion-label>
            <ion-note slot="helper">The date this entry is for</ion-note>
            <ion-input v-model="day" type="date" />
          </ion-item>

          <EntryEditorPanel
            :bind-textarea-ref="bindTextareaRef"
            :bind-image-input-ref="bindImageInputRef"
            :content="content"
            :content-tab="contentTab"
            :committing="committing"
            :autosave-offline="autosaveOffline"
            :upload-disabled="
              !selectedPathId || committing || !draftId || autosaveOffline
            "
            :upload-button-title="
              autosaveOffline
                ? 'Image upload is unavailable while offline'
                : undefined
            "
            :image-error="imageError"
            :attached-images="attachedImages"
            :local-image-urls="localImageUrls"
            :image-drafts="imageDrafts"
            :selected-image="selectedImage"
            :is-caption-modal-open="isCaptionModalOpen"
            :caption-draft="captionDraft"
            :commit-fail-dialog-open="commitFailDialogOpen"
            :commit-fail-dialog-message="commitFailDialogMessage"
            :commit-fail-will-retry="commitFailWillRetry"
            @update:content="content = $event"
            @update:content-tab="contentTab = $event"
            @update:caption-draft="captionDraft = $event"
            @textarea-input="onTextareaInput"
            @remember-selection="rememberSelection"
            @open-image-picker="openImagePicker"
            @image-selected="onImageSelected"
            @close-commit-fail="commitFailDialogOpen = false"
            @acknowledge-commit-failure="acknowledgeCommitFailure"
            @close-caption="closeCaptionModal"
            @confirm-image-insert="confirmImageInsert"
            @open-caption="openCaptionModal"
            @remove-image="removeImage"
          />
        </template>
      </div>
    </ion-content>
    <ion-footer>
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
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonTextarea,
  IonNote,
} from '@ionic/vue';
import { useQueryClient } from '@tanstack/vue-query';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import EntryEditorPanel from '../components/EntryEditorPanel.vue';
import RefreshStatus from '../components/RefreshStatus.vue';
import { useCurrentUser } from '../composables/useCurrentUser';
import { useDraftImageUpload } from '../composables/useDraftImageUpload';
import { useMarkdownEditor } from '../composables/useMarkdownEditor';
import { usePaths } from '../composables/usePaths';
import { usePendingSaves } from '../composables/usePendingSaves';
import { useRefreshStatus } from '../composables/useRefreshStatus';
import {
  startCreateEntryDraft,
  getEntryDraft,
  useAbandonEntryDraft,
  usePatchEntryDraft,
  useCommitEntryDraft,
  useRemoveDraftImage,
} from '../generated/apiClient';
import { extractErrorMessage } from '../lib/errors';
import { getPathOrder, isPathHidden } from '../lib/db';
import { removeImageMarkdownReferences } from '../utils/markdown';
import {
  buildLocalImageUrlMap,
  createDraftServerImageDraft,
  createLocalImageDraft,
  getAttachedImageResponses,
  mergeDraftImageFromServer,
  revokeDraftPreviewUrl,
  syncDraftCaptionsFromContent,
  type EntryImageDraft,
} from '../utils/entryImageDrafts';

const AUTOSAVE_DEBOUNCE_MS = 5000;
const MAX_COMMIT_RETRY_DELAY_MS = 60000;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const { data: paths, error: pathsError } = usePaths();
const { currentUserId } = useCurrentUser();
const { mutateAsync: abandonDraft } = useAbandonEntryDraft();
const { mutateAsync: patchDraft } = usePatchEntryDraft();
const { mutateAsync: commitDraftApi } = useCommitEntryDraft();
const { mutateAsync: removeDraftImageApi } = useRemoveDraftImage();
const { uploadError, uploadDraftImage } = useDraftImageUpload();

const ownedPaths = computed(() =>
  (paths.value ?? []).filter(
    (path) => path.owner_user_id === currentUserId.value,
  ),
);
const pathsErrorMessage = computed(
  () => extractErrorMessage(pathsError.value) ?? 'Unable to load paths.',
);

const {
  registerPendingSave,
  removePendingSave,
  clearSavedNotification,
  setContentSaving,
  registerDraftInitError,
  clearDraftInitError,
} = usePendingSaves();

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
const committing = ref(false);
const commitError = ref('');
const imageError = ref('');
const imageDrafts = ref<EntryImageDraft[]>([]);

/** Server-side draft id — set once the draft has been created */
const draftId = ref('');

/** True when autosave has failed and the device appears to be offline */
const autosaveOffline = ref(false);

/** Timer handle for the content autosave debounce */
let autosaveTimer: ReturnType<typeof setTimeout> | null = null;

/** In-flight flush promise (set while flushContentAutosave is running) */
let autosaveFlushPromise: Promise<void> | null = null;

/** Last content value that was successfully PATCHed to the server */
let lastSavedContent = '';

/** Whether the commit-fail inform dialog is open */
const commitFailDialogOpen = ref(false);
/** Message shown in the commit-fail inform dialog */
const commitFailDialogMessage = ref('');
/** Whether the current commit failure will be retried automatically */
const commitFailWillRetry = ref(true);
const backgroundCommitDelegated = ref(false);

/** Background commit-retry timer (after a manual save failure) */
let commitRetryTimer: ReturnType<typeof setTimeout> | null = null;
/** Whether a commit retry is currently in progress */
const commitRetrying = ref(false);
let commitRetryAttempt = 0;

const textareaRef = ref<InstanceType<typeof IonTextarea> | null>(null);
const imageInputRef = ref<HTMLInputElement | null>(null);
const isCaptionModalOpen = ref(false);
const captionDraft = ref('');
const selectedImage = ref<EntryImageDraft | null>(null);

function bindTextareaRef(el: unknown) {
  textareaRef.value = el as InstanceType<typeof IonTextarea> | null;
}

function bindImageInputRef(el: unknown) {
  imageInputRef.value = el as HTMLInputElement | null;
}

const hasBlockingImages = computed(() =>
  imageDrafts.value.some(
    (image) =>
      !image.removed &&
      ['local', 'uploading', 'draft-uploading', 'failed'].includes(
        image.status,
      ),
  ),
);
const hasFailedImages = computed(() =>
  imageDrafts.value.some(
    (image) => !image.removed && image.status === 'failed',
  ),
);

const canCommit = computed(
  () =>
    !!selectedPathId.value &&
    !!day.value &&
    !!content.value.trim() &&
    !hasBlockingImages.value,
);
const attachedImages = computed(() =>
  getAttachedImageResponses(imageDrafts.value),
);
const localImageUrls = computed(() => buildLocalImageUrlMap(imageDrafts.value));

const {
  onTextareaInput: _onTextareaInput,
  insertImageMarkdown,
  rememberSelection,
} = useMarkdownEditor(content, textareaRef, contentTab);

function onTextareaInput(event: CustomEvent) {
  _onTextareaInput(event);
  scheduleContentAutosave();
}

// ─── Draft Initialisation ──────────────────────────────────────────────────

/** Whether a background draft-init retry is pending */
let draftInitRetryTimer: ReturnType<typeof setTimeout> | null = null;

async function ensureDraft() {
  if (draftId.value) return draftId.value;
  if (!selectedPathId.value || !day.value) return null;

  clearDraftInitError(pendingSaveKey());
  if (draftInitRetryTimer !== null) {
    clearTimeout(draftInitRetryTimer);
    draftInitRetryTimer = null;
  }
  try {
    const response = await startCreateEntryDraft(selectedPathId.value, {
      day: day.value,
    });
    if (response.status !== 200)
      throw new Error('Failed to get or create draft.');
    const draft = response.data;
    draftId.value = String(draft.id);
    // Restore any previously saved content and images from the server draft
    if (draft.content) {
      content.value = draft.content;
    }
    lastSavedContent = draft.content ?? '';
    if (draft.images && draft.images.length > 0) {
      imageDrafts.value.forEach(revokeDraftPreviewUrl);
      imageDrafts.value = draft.images.map((img) =>
        createDraftServerImageDraft(img),
      );
      imageDrafts.value = syncDraftCaptionsFromContent(
        imageDrafts.value,
        content.value,
      );
    }
    return draftId.value;
  } catch (err: unknown) {
    registerDraftInitError(
      pendingSaveKey(),
      extractErrorMessage(err) ?? 'Failed to start draft. Please try again.',
    );
    // Schedule a background retry
    draftInitRetryTimer = setTimeout(() => {
      draftInitRetryTimer = null;
      void ensureDraft();
    }, AUTOSAVE_DEBOUNCE_MS);
    return null;
  }
}

// Watch for path/day changes — abandon any existing draft and create a fresh one
watch(
  [selectedPathId, day],
  async ([pathId, dayVal], [prevPathId, prevDay]) => {
    const changed = pathId !== prevPathId || dayVal !== prevDay;
    if (!changed || !pathId || !dayVal) return;

    // Abandon the old draft if there is one
    if (draftId.value) {
      const oldDraftId = draftId.value;
      draftId.value = '';
      lastSavedContent = '';
      try {
        await abandonDraft({ draftId: oldDraftId });
      } catch {
        // Best-effort
      }
    }

    await ensureDraft();
  },
);

// ─── Content Autosave ─────────────────────────────────────────────────────

function scheduleContentAutosave() {
  if (!draftId.value) return;

  setContentSaving(pendingSaveKey(), true);
  if (autosaveTimer !== null) clearTimeout(autosaveTimer);

  autosaveTimer = setTimeout(() => {
    autosaveFlushPromise = flushContentAutosave().finally(() => {
      autosaveFlushPromise = null;
    });
  }, AUTOSAVE_DEBOUNCE_MS);
}

async function flushContentAutosave() {
  autosaveTimer = null;
  const currentContent = content.value;
  if (!draftId.value || currentContent === lastSavedContent) {
    setContentSaving(pendingSaveKey(), false);
    return;
  }

  try {
    await patchDraft({
      draftId: draftId.value,
      data: { content: currentContent },
    });
    lastSavedContent = currentContent;
    autosaveOffline.value = false;
  } catch {
    // Show an offline note if the device appears to be offline
    if (!navigator.onLine) {
      autosaveOffline.value = true;
    }
  } finally {
    setContentSaving(pendingSaveKey(), false);
  }
}

// ─── Image Upload ─────────────────────────────────────────────────────────

let draftImageRefreshTimer: ReturnType<typeof setTimeout> | null = null;

async function refreshDraftImages() {
  if (!draftId.value) return;

  try {
    const response = await getEntryDraft(draftId.value);
    if (response.status !== 200) return;

    const serverImages = response.data.images ?? [];
    const imagesByDraftId = new Map(
      serverImages.map((image) => [String(image.id), image]),
    );
    const imagesByClientId = new Map(
      serverImages
        .filter((image) => image.client_image_id)
        .map((image) => [String(image.client_image_id), image]),
    );

    imageDrafts.value = imageDrafts.value.map((draft) => {
      const matchingImage =
        (draft.draftImageId && imagesByDraftId.get(draft.draftImageId)) ||
        imagesByClientId.get(draft.localId);
      return matchingImage
        ? mergeDraftImageFromServer(draft, matchingImage)
        : draft;
    });
  } catch {
    // Best-effort polling only.
  }
}

watch(
  () => [
    draftId.value,
    imageDrafts.value.some((image) => image.status === 'draft-uploading'),
  ],
  ([nextDraftId, hasProcessingImages]) => {
    if (draftImageRefreshTimer !== null) {
      clearTimeout(draftImageRefreshTimer);
      draftImageRefreshTimer = null;
    }

    if (!nextDraftId || !hasProcessingImages) return;

    const tick = async () => {
      await refreshDraftImages();
      if (
        imageDrafts.value.some((image) => image.status === 'draft-uploading')
      ) {
        draftImageRefreshTimer = setTimeout(() => {
          void tick();
        }, 2000);
      } else {
        draftImageRefreshTimer = null;
      }
    };

    void tick();
  },
  { immediate: true },
);

function openImagePicker() {
  imageInputRef.value?.click();
}

function onImageSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files ? Array.from(input.files) : [];
  input.value = '';
  if (files.length === 0) return;

  const errors: string[] = [];
  const activeNames = new Set(imageDrafts.value.map((draft) => draft.filename));
  const acceptedFiles: File[] = [];

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      errors.push(`Not an image: ${file.name}`);
      continue;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      errors.push(`Exceeds 10 MB: ${file.name}`);
      continue;
    }
    if (activeNames.has(file.name)) {
      errors.push(`Duplicate filename: ${file.name}`);
      continue;
    }

    activeNames.add(file.name);
    acceptedFiles.push(file);
  }

  if (acceptedFiles.length > 0) {
    const newDrafts = acceptedFiles.map(createLocalImageDraft);
    imageDrafts.value = [...imageDrafts.value, ...newDrafts];
    // Upload each image immediately
    for (const draft of newDrafts) {
      void uploadImageToDraft(draft.localId, draft.file!);
    }
  }

  imageError.value = errors.join('; ');
}

async function uploadImageToDraft(localId: string, file: File) {
  const currentDraftId = draftId.value || (await ensureDraft());
  if (!currentDraftId) return;

  // Mark as uploading
  imageDrafts.value = imageDrafts.value.map((d) =>
    d.localId === localId ? { ...d, status: 'uploading' as const } : d,
  );

  const result = await uploadDraftImage(currentDraftId, file, localId);

  if (!result) {
    imageDrafts.value = imageDrafts.value.map((d) =>
      d.localId === localId
        ? { ...d, status: 'failed' as const, error: uploadError.value }
        : d,
    );
    return;
  }

  // Move to draft-uploading (background task processing on server)
  imageDrafts.value = imageDrafts.value.map((d) =>
    d.localId === localId
      ? {
          ...d,
          status: 'draft-uploading' as const,
          draftImageId: String(result.id),
          error: '',
        }
      : d,
  );
}

async function removeImage(localId: string) {
  const target = imageDrafts.value.find((draft) => draft.localId === localId);
  if (!target) return;

  // If it has a server-side draft image id, remove it on the server
  if (target.draftImageId && draftId.value) {
    try {
      await removeDraftImageApi({
        draftId: draftId.value,
        draftImageId: target.draftImageId,
      });
    } catch {
      // Best-effort; still remove locally
    }
  }

  revokeDraftPreviewUrl(target);
  imageDrafts.value = imageDrafts.value.filter(
    (draft) => draft.localId !== localId,
  );
  content.value = removeImageMarkdownReferences(content.value, target.filename);

  if (selectedImage.value?.localId === localId) {
    closeCaptionModal();
  }
}

// ─── Caption Modal ────────────────────────────────────────────────────────

function openCaptionModal(image: EntryImageDraft) {
  rememberSelection();
  selectedImage.value = image;
  captionDraft.value = image.captionDraft;
  isCaptionModalOpen.value = true;
}

function closeCaptionModal() {
  isCaptionModalOpen.value = false;
  selectedImage.value = null;
  captionDraft.value = '';
}

async function confirmImageInsert() {
  if (!selectedImage.value) return;
  const nextCaption = captionDraft.value.trim() || selectedImage.value.filename;
  imageDrafts.value = imageDrafts.value.map((draft) =>
    draft.localId === selectedImage.value?.localId
      ? { ...draft, captionDraft: nextCaption }
      : draft,
  );
  await insertImageMarkdown(selectedImage.value.filename, nextCaption);
  closeCaptionModal();
}

// ─── Commit ───────────────────────────────────────────────────────────────

/**
 * Build a human-readable label for the pending-save badge.
 * Uses path title + day if available.
 */
function buildPendingSaveLabel(): string {
  const pathTitle =
    ownedPaths.value.find((p) => p.path_id === selectedPathId.value)?.title ??
    selectedPathId.value;
  return `${pathTitle} — ${day.value}`;
}

/** Key used to identify this draft in the pending-saves store */
function pendingSaveKey(): string {
  return `create:${selectedPathId.value}:${day.value}`;
}

function logCommitFailure(
  context: string,
  err: unknown,
  extra: Record<string, unknown> = {},
) {
  const response =
    err && typeof err === 'object' && 'response' in err
      ? (err as { response?: { status?: number; data?: unknown } }).response
      : undefined;

  console.error(`[EntryCreateView] ${context}`, {
    status: response?.status,
    response: response?.data,
    draftId: draftId.value || null,
    pathId: selectedPathId.value || null,
    day: day.value || null,
    imageStates: imageDrafts.value.map((image) => ({
      filename: image.filename,
      status: image.status,
      draftImageId: image.draftImageId,
      removed: image.removed,
      error: image.error || null,
    })),
    ...extra,
  });
}

function resetCommitRetryState() {
  commitRetryAttempt = 0;
  commitFailWillRetry.value = true;
  backgroundCommitDelegated.value = false;
}

function nextCommitRetryDelay() {
  const delay = Math.min(
    AUTOSAVE_DEBOUNCE_MS * 2 ** commitRetryAttempt,
    MAX_COMMIT_RETRY_DELAY_MS,
  );
  commitRetryAttempt += 1;
  return delay;
}

function scheduleCommitRetry(reason: string) {
  const delay = nextCommitRetryDelay();
  console.info('[EntryCreateView] scheduling commit retry', {
    reason,
    delayMs: delay,
    attempt: commitRetryAttempt,
    draftId: draftId.value || null,
  });
  commitRetryTimer = setTimeout(() => void attemptCommitRetry(), delay);
}

async function acknowledgeCommitFailure() {
  commitFailDialogOpen.value = false;
  if (!commitFailWillRetry.value) return;

  backgroundCommitDelegated.value = true;
  if (selectedPathId.value) {
    await router.replace(`/path/${selectedPathId.value}`);
    return;
  }
  await router.replace('/');
}

/** Attempt a background commit retry (called after a failed manual save). */
async function attemptCommitRetry() {
  commitRetryTimer = null;
  if (!canCommit.value || commitRetrying.value) return;
  commitRetrying.value = true;

  try {
    const currentDraftId = draftId.value || (await ensureDraft());
    if (!currentDraftId) {
      // Still no draft — schedule another retry
      commitRetryTimer = setTimeout(
        () => void attemptCommitRetry(),
        AUTOSAVE_DEBOUNCE_MS,
      );
      return;
    }

    imageDrafts.value = syncDraftCaptionsFromContent(
      imageDrafts.value,
      content.value,
    );
    const finalContent = content.value;

    if (finalContent !== lastSavedContent) {
      await patchDraft({
        draftId: currentDraftId,
        data: { content: finalContent },
      });
      lastSavedContent = finalContent;
    }

    const commitResponse = await commitDraftApi({ draftId: currentDraftId });

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] }),
      queryClient.invalidateQueries({
        queryKey: ['v1', 'paths', selectedPathId.value, 'entries'],
      }),
    ]);

    // Success — deregister pending save and signal success
    removePendingSave(pendingSaveKey(), true);
    clearDraftInitError(pendingSaveKey());
    draftId.value = '';
    commitRetryAttempt = 0;
    const newEntryId =
      commitResponse.status === 200 ? commitResponse.data.id : null;
    const shouldNavigate = !backgroundCommitDelegated.value;
    backgroundCommitDelegated.value = false;
    if (shouldNavigate && newEntryId && selectedPathId.value) {
      await router.replace(`/entry/${selectedPathId.value}/${newEntryId}`);
    } else if (shouldNavigate) {
      router.back();
    }
  } catch (err: unknown) {
    logCommitFailure('background commit retry failed', err, {
      attempt: commitRetryAttempt,
    });
    const status =
      err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;

    if (status !== 422) {
      scheduleCommitRetry('retry_failed');
    } else {
      removePendingSave(pendingSaveKey(), false);
    }
  } finally {
    commitRetrying.value = false;
  }
}

async function commitDraft() {
  if (!canCommit.value) return;

  committing.value = true;
  commitError.value = '';
  backgroundCommitDelegated.value = false;
  commitRetryAttempt = 0;
  if (commitRetryTimer !== null) {
    clearTimeout(commitRetryTimer);
    commitRetryTimer = null;
  }

  try {
    // Cancel any pending debounce timer and await any in-flight autosave
    if (autosaveTimer !== null) {
      clearTimeout(autosaveTimer);
      autosaveTimer = null;
    }
    if (autosaveFlushPromise) {
      await autosaveFlushPromise;
    }

    // Ensure we have a draft — create one now if init failed earlier
    const currentDraftId = draftId.value || (await ensureDraft());
    if (!currentDraftId) {
      commitError.value =
        'Could not start a draft. Please check your connection and try again.';
      return;
    }

    imageDrafts.value = syncDraftCaptionsFromContent(
      imageDrafts.value,
      content.value,
    );
    const finalContent = content.value;

    // Patch the final content to the draft
    if (finalContent !== lastSavedContent) {
      await patchDraft({
        draftId: currentDraftId,
        data: { content: finalContent },
      });
      lastSavedContent = finalContent;
    }

    // Commit the draft
    const commitResponse = await commitDraftApi({ draftId: currentDraftId });

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] }),
      queryClient.invalidateQueries({
        queryKey: ['v1', 'paths', selectedPathId.value, 'entries'],
      }),
    ]);

    // Draft committed — no need to abandon on unmount
    clearSavedNotification();
    clearDraftInitError(pendingSaveKey());
    draftId.value = '';
    resetCommitRetryState();
    const newEntryId =
      commitResponse.status === 200 ? commitResponse.data.id : null;
    if (newEntryId && selectedPathId.value) {
      await router.replace(`/entry/${selectedPathId.value}/${newEntryId}`);
    } else {
      router.back();
    }
  } catch (err: unknown) {
    const status =
      err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;
    const detail =
      status === 422
        ? (err as { response?: { data?: { detail?: { code?: string } } } })
            .response?.data?.detail
        : undefined;

    let message: string;
    let willRetry = status !== 422;
    if (status === 422) {
      if (detail?.code === 'images_not_ready') {
        message = hasFailedImages.value
          ? 'One or more images failed to finish processing. Remove or retry them before saving.'
          : 'Some images are still uploading or processing. Please wait a moment, then try saving again.';
      } else {
        message =
          extractErrorMessage(err) ?? 'Failed to save. Please try again.';
      }
    } else {
      message = extractErrorMessage(err) ?? 'Failed to save. Please try again.';
    }

    logCommitFailure('manual commit failed', err, { willRetry });

    // Validation failures require user action; transient failures can retry.
    commitFailDialogMessage.value = message;
    commitFailWillRetry.value = willRetry;
    commitFailDialogOpen.value = true;
    if (willRetry) {
      registerPendingSave(pendingSaveKey(), buildPendingSaveLabel());
      scheduleCommitRetry('manual_commit_failed');
    } else {
      removePendingSave(pendingSaveKey(), false);
    }
  } finally {
    committing.value = false;
  }
}

// ─── Default Path Selection ───────────────────────────────────────────────

async function pickDefaultPath() {
  if (ownedPaths.value.length === 0) return;

  if (selectedPathId.value) return;

  const order = getPathOrder();
  const sorted = [...ownedPaths.value].sort((left, right) => {
    const leftIndex = order.indexOf(left.path_id);
    const rightIndex = order.indexOf(right.path_id);
    if (leftIndex === -1 && rightIndex === -1) return 0;
    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
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
  // If both path and day were pre-populated from route params, kick off draft
  // init immediately (the watch only fires on *changes*, not on initial values).
  if (selectedPathId.value && day.value) {
    void ensureDraft();
  }
  window.addEventListener('online', handleOnline);
});

function handleOnline() {
  autosaveOffline.value = false;
  if (content.value && content.value !== lastSavedContent) {
    scheduleContentAutosave();
  }
}

watch(ownedPaths, (nextPaths, previousPaths) => {
  if (
    previousPaths?.length === 0 &&
    nextPaths.length > 0 &&
    !selectedPathId.value
  ) {
    void pickDefaultPath();
  }
});

// ─── Cleanup ─────────────────────────────────────────────────────────────

onBeforeUnmount(async () => {
  if (autosaveTimer !== null) clearTimeout(autosaveTimer);
  if (draftInitRetryTimer !== null) clearTimeout(draftInitRetryTimer);
  if (!backgroundCommitDelegated.value && commitRetryTimer !== null) {
    clearTimeout(commitRetryTimer);
  }
  if (!backgroundCommitDelegated.value && draftImageRefreshTimer !== null) {
    clearTimeout(draftImageRefreshTimer);
  }
  window.removeEventListener('online', handleOnline);

  for (const draft of imageDrafts.value) {
    revokeDraftPreviewUrl(draft);
  }

  if (backgroundCommitDelegated.value) {
    return;
  }

  // Deregister any pending save entry (not succeeded — just navigating away)
  removePendingSave(pendingSaveKey(), false);
  setContentSaving(pendingSaveKey(), false);
  clearDraftInitError(pendingSaveKey());

  // Abandon the server draft if we navigated away without committing
  if (draftId.value) {
    try {
      await abandonDraft({ draftId: draftId.value });
    } catch {
      // Best-effort cleanup
    }
  }
});
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

.view-full-error,
.view-no-paths {
  padding: 28px 20px;
  border: 1px dashed var(--ion-border-color);
  border-radius: 18px;
  text-align: center;
}

.view-full-error-title,
.view-no-paths-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--ion-text-color);
}

.view-full-error-body,
.view-no-paths-body {
  font-size: 0.88rem;
  color: var(--ion-color-medium);
  margin: 0 0 20px;
}

.view-full-error-actions,
.view-no-paths-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
