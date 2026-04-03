<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>New Entry</ion-title>
        <ion-buttons slot="end">
          <span
            v-if="contentSaving"
            class="autosave-indicator"
            aria-label="Saving..."
          >
            <span class="autosave-spinner" />
          </span>
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

          <section class="editor-section">
            <div class="editor-header">
              <label class="editor-label">Content *</label>
              <div class="editor-header-controls">
                <input
                  ref="imageInputRef"
                  type="file"
                  accept="image/*"
                  class="image-upload-input"
                  multiple
                  :disabled="committing || !draftId"
                  @change="onImageSelected"
                />
                <ion-button
                  size="small"
                  fill="outline"
                  :disabled="!selectedPathId || committing || !draftId"
                  @click="openImagePicker"
                >
                  + Image
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
                ref="textareaRef"
                v-model="content"
                class="editor-textarea"
                placeholder="Write your entry... (markdown supported)"
                :rows="8"
                auto-grow
                autocapitalize="sentences"
                autocorrect="on"
                :spellcheck="true"
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
                  :images="attachedImages"
                  :local-image-urls="localImageUrls"
                />
                <p v-else class="content-preview-empty">(nothing to preview)</p>
              </div>
            </div>
          </section>

          <p v-if="imageError" class="save-error">{{ imageError }}</p>
          <p v-else-if="draftInitError" class="autosave-offline-note">
            {{ draftInitError }} — retrying in background.
          </p>
          <p v-else-if="autosaveOffline" class="autosave-offline-note">
            Currently offline — your changes will be saved when you reconnect.
          </p>
        </template>
      </div>
    </ion-content>

    <!-- Commit-fail inform dialog (save failed, retrying in background) -->
    <ion-modal
      :is-open="commitFailDialogOpen"
      @didDismiss="commitFailDialogOpen = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title>Save failed</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding commit-fail-dialog-content">
        <p class="commit-fail-dialog-message">{{ commitFailDialogMessage }}</p>
        <p class="commit-fail-dialog-note">
          Your entry will keep retrying to save in the background. You can watch
          the status bar at the bottom of the screen for updates.
        </p>
      </ion-content>
      <ion-footer>
        <ion-toolbar>
          <div class="commit-fail-dialog-actions">
            <ion-button @click="commitFailDialogOpen = false">OK</ion-button>
          </div>
        </ion-toolbar>
      </ion-footer>
    </ion-modal>

    <!-- Caption insert modal -->
    <ion-modal :is-open="isCaptionModalOpen" @didDismiss="closeCaptionModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>
            {{
              selectedImage
                ? `Insert ${selectedImage.filename}`
                : 'Insert image'
            }}
          </ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeCaptionModal">Cancel</ion-button>
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
              @click="openCaptionModal(image)"
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
              @click="removeImage(image.localId)"
            >
              Remove
            </button>
          </div>
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
  IonSelect,
  IonSelectOption,
  IonInput,
  IonTextarea,
  IonNote,
} from '@ionic/vue';
import { useQueryClient } from '@tanstack/vue-query';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import EntryImageDraftPreview from '../components/EntryImageDraftPreview.vue';
import MarkdownContent from '../components/MarkdownContent.vue';
import RefreshStatus from '../components/RefreshStatus.vue';
import { useCurrentUser } from '../composables/useCurrentUser';
import { useDraftImageUpload } from '../composables/useDraftImageUpload';
import { useMarkdownEditor } from '../composables/useMarkdownEditor';
import { usePaths } from '../composables/usePaths';
import { useRefreshStatus } from '../composables/useRefreshStatus';
import { usePendingSaves } from '../composables/usePendingSaves';
import {
  startCreateEntryDraft,
  useAbandonEntryDraft,
  usePatchEntryDraft,
  useCommitEntryDraft,
  useRemoveDraftImage,
} from '../generated/apiClient';
import { extractErrorMessage } from '../lib/errors';
import { getPathOrder, isPathHidden } from '../lib/db';
import { removeImageMarkdownReferences } from '../utils/markdown';
import {
  appendMissingImageMarkdown,
  buildLocalImageUrlMap,
  createDraftServerImageDraft,
  createLocalImageDraft,
  getAttachedImageResponses,
  revokeDraftPreviewUrl,
  syncDraftCaptionsFromContent,
  type EntryImageDraft,
} from '../utils/entryImageDrafts';

const AUTOSAVE_DEBOUNCE_MS = 5000;
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
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

const { registerPendingSave, removePendingSave, clearSavedNotification } =
  usePendingSaves();

const day = ref(
  String(route.query.date ?? new Date().toISOString().slice(0, 10)),
);
const selectedPathId = ref(String(route.params.pathId ?? ''));
const content = ref('');
const contentTab = ref<'write' | 'preview'>('write');
const committing = ref(false);
const commitError = ref('');
const imageError = ref('');
const draftInitError = ref('');
const imageDrafts = ref<EntryImageDraft[]>([]);

/** Server-side draft id — set once the draft has been created */
const draftId = ref('');

/** Whether content is being auto-saved (debounce in progress or PATCH in flight) */
const contentSaving = ref(false);

/** True when autosave has failed and the device appears to be offline */
const autosaveOffline = ref(false);

/** Timer handle for the content autosave debounce */
let autosaveTimer: ReturnType<typeof setTimeout> | null = null;

/** Last content value that was successfully PATCHed to the server */
let lastSavedContent = '';

/** Whether the commit-fail inform dialog is open */
const commitFailDialogOpen = ref(false);
/** Message shown in the commit-fail inform dialog */
const commitFailDialogMessage = ref('');

/** Background commit-retry timer (after a manual save failure) */
let commitRetryTimer: ReturnType<typeof setTimeout> | null = null;
/** Whether a commit retry is currently in progress */
const commitRetrying = ref(false);

const textareaRef = ref<InstanceType<typeof IonTextarea> | null>(null);
const imageInputRef = ref<HTMLInputElement | null>(null);
const isCaptionModalOpen = ref(false);
const captionDraft = ref('');
const selectedImage = ref<EntryImageDraft | null>(null);

const canCommit = computed(
  () => !!selectedPathId.value && !!day.value && !!content.value.trim(),
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

  draftInitError.value = '';
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
    draftInitError.value =
      extractErrorMessage(err) ?? 'Failed to start draft. Please try again.';
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

  contentSaving.value = true;
  if (autosaveTimer !== null) clearTimeout(autosaveTimer);

  autosaveTimer = setTimeout(() => {
    void flushContentAutosave();
  }, AUTOSAVE_DEBOUNCE_MS);
}

async function flushContentAutosave() {
  autosaveTimer = null;
  const currentContent = content.value;
  if (!draftId.value || currentContent === lastSavedContent) {
    contentSaving.value = false;
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
    contentSaving.value = false;
  }
}

// ─── Image Upload ─────────────────────────────────────────────────────────

function imageStatusText(image: EntryImageDraft) {
  if (image.status === 'uploading' || image.status === 'draft-uploading')
    return 'Uploading...';
  if (image.status === 'failed') return image.error || 'Failed';
  if (image.status === 'local') return 'Pending draft...';
  return 'Attached';
}

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
    const finalContent = appendMissingImageMarkdown(
      content.value,
      imageDrafts.value,
    );
    content.value = finalContent;

    if (finalContent !== lastSavedContent) {
      await patchDraft({
        draftId: currentDraftId,
        data: { content: finalContent },
      });
      lastSavedContent = finalContent;
    }

    await commitDraftApi({ draftId: currentDraftId });

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] }),
      queryClient.invalidateQueries({
        queryKey: ['v1', 'paths', selectedPathId.value, 'entries'],
      }),
    ]);

    // Success — deregister pending save and signal success
    removePendingSave(pendingSaveKey(), true);
    draftId.value = '';
    router.back();
  } catch {
    // Still failing — schedule another retry
    commitRetryTimer = setTimeout(
      () => void attemptCommitRetry(),
      AUTOSAVE_DEBOUNCE_MS,
    );
  } finally {
    commitRetrying.value = false;
  }
}

async function commitDraft() {
  if (!canCommit.value) return;

  committing.value = true;
  commitError.value = '';

  try {
    // Flush any pending autosave first
    if (autosaveTimer !== null) {
      clearTimeout(autosaveTimer);
      autosaveTimer = null;
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
    const finalContent = appendMissingImageMarkdown(
      content.value,
      imageDrafts.value,
    );
    content.value = finalContent;

    // Patch the final content to the draft
    if (finalContent !== lastSavedContent) {
      await patchDraft({
        draftId: currentDraftId,
        data: { content: finalContent },
      });
      lastSavedContent = finalContent;
    }

    // Commit the draft
    await commitDraftApi({ draftId: currentDraftId });

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] }),
      queryClient.invalidateQueries({
        queryKey: ['v1', 'paths', selectedPathId.value, 'entries'],
      }),
    ]);

    // Draft committed — no need to abandon on unmount
    clearSavedNotification();
    draftId.value = '';
    router.back();
  } catch (err: unknown) {
    const status =
      err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;

    let message: string;
    if (status === 422) {
      const detail = (
        err as { response?: { data?: { detail?: { code?: string } } } }
      ).response?.data?.detail;
      if (detail?.code === 'images_not_ready') {
        message =
          'Some images are still uploading. Please wait a moment and try again.';
      } else {
        message =
          extractErrorMessage(err) ?? 'Failed to save. Please try again.';
      }
    } else {
      message = extractErrorMessage(err) ?? 'Failed to save. Please try again.';
    }

    // Show the inform dialog and start a background retry
    commitFailDialogMessage.value = message;
    commitFailDialogOpen.value = true;
    registerPendingSave(pendingSaveKey(), buildPendingSaveLabel());
    commitRetryTimer = setTimeout(
      () => void attemptCommitRetry(),
      AUTOSAVE_DEBOUNCE_MS,
    );
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
  if (commitRetryTimer !== null) clearTimeout(commitRetryTimer);
  window.removeEventListener('online', handleOnline);

  // Deregister any pending save entry (not succeeded — just navigating away)
  removePendingSave(pendingSaveKey(), false);

  for (const draft of imageDrafts.value) {
    revokeDraftPreviewUrl(draft);
  }

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

.autosave-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  opacity: 0.5;
}

.autosave-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: autosave-spin 0.8s linear infinite;
}

@keyframes autosave-spin {
  to {
    transform: rotate(360deg);
  }
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

.autosave-offline-note {
  color: var(--ion-color-medium);
  font-size: 0.82rem;
  margin: 0 4px;
  font-style: italic;
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
