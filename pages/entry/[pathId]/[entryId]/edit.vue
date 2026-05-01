<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/entry/${pathId}/${entryId}`" />
        </ion-buttons>
        <ion-title>
          <span v-if="path && entry">
            <span
              class="edit-path-dot"
              :style="{ backgroundColor: path.color }"
            ></span>
            {{ path.title }} - {{ formattedEntryDay }}
          </span>
          <span v-else>Edit Entry</span>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button
            fill="outline"
            color="danger"
            :disabled="committing || resolvingConflict || discarding"
            @click="discardAlertOpen = true"
          >
            Discard
          </ion-button>
          <ion-button
            fill="outline"
            :disabled="savingDraft || committing || !draftId"
            @click="saveDraftAndNavigateBack"
          >
            {{ savingDraft ? 'Saving…' : 'Save Draft' }}
          </ion-button>
          <ion-button :disabled="committing || !canCommit" @click="commitDraft">
            {{ committing ? 'Publishing…' : 'Publish' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="entry-editor-content">
      <div class="entry-form">
        <!-- Entry not yet loaded (network fetch in progress) -->
        <div v-if="!entry" class="edit-loading">Loading entry...</div>
        <template v-else>
          <!-- 409 init conflict: offer to reload with remote content -->
          <div v-if="draftInitConflict" class="edit-conflict-banner">
            <p class="edit-conflict-banner-title">
              This entry was edited on another device.
            </p>
            <p class="edit-conflict-banner-body">
              You can load the latest version and continue editing from there.
            </p>
            <div class="edit-conflict-banner-actions">
              <ion-button fill="outline" @click="$router.back()"
                >Go back</ion-button
              >
              <ion-button @click="loadRemoteAndContinue"
                >Load latest version</ion-button
              >
            </div>
          </div>

          <EntryEditorPanel
            :bind-textarea-ref="bindTextareaRef"
            :bind-image-input-ref="bindImageInputRef"
            :content="content"
            :content-tab="contentTab"
            :committing="committing"
            :autosave-offline="autosaveOffline"
            :upload-disabled="committing || !draftId || autosaveOffline"
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

    <!-- Discard draft confirm alert -->
    <ion-alert
      :is-open="discardAlertOpen"
      header="Discard draft?"
      message="Your unsaved changes will be lost. This cannot be undone."
      :buttons="[
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            discardAlertOpen = false;
          },
        },
        { text: 'Discard', role: 'destructive', handler: discardDraft },
      ]"
      @didDismiss="discardAlertOpen = false"
    />

    <!-- Edit conflict resolution modal -->
    <ion-modal :is-open="isConflictModalOpen" :can-dismiss="false">
      <ion-header>
        <ion-toolbar>
          <ion-title>Edit Conflict</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding conflict-modal-content">
        <p class="conflict-description">
          This entry was edited on another device since you started editing.
          Choose which version to keep:
        </p>
        <div class="conflict-versions">
          <div class="conflict-version">
            <h3 class="conflict-version-title">Your version</h3>
            <div class="conflict-version-body">
              <MarkdownContent
                v-if="conflictLocalContent"
                :content="conflictLocalContent"
                :images="[]"
                :local-image-urls="{}"
              />
              <p v-else class="conflict-content-empty">(empty)</p>
            </div>
            <div class="conflict-version-select">
              <ion-button
                expand="block"
                fill="outline"
                :disabled="resolvingConflict"
                @click="resolveConflict('local')"
              >
                {{ resolvingConflict ? 'Saving...' : 'Keep mine' }}
              </ion-button>
            </div>
          </div>
          <div class="conflict-version">
            <h3 class="conflict-version-title">Remote version (current)</h3>
            <div class="conflict-version-body">
              <MarkdownContent
                v-if="conflictRemoteContent"
                :content="conflictRemoteContent"
                :images="[]"
                :local-image-urls="{}"
              />
              <p v-else class="conflict-content-empty">(empty)</p>
            </div>
            <div class="conflict-version-select">
              <ion-button
                expand="block"
                fill="outline"
                :disabled="resolvingConflict"
                @click="resolveConflict('remote')"
              >
                Use remote
              </ion-button>
            </div>
          </div>
        </div>
      </ion-content>
      <ion-footer>
        <ion-toolbar>
          <div class="conflict-actions">
            <ion-button
              fill="outline"
              :disabled="resolvingConflict"
              @click="resolveConflict('remote')"
            >
              Use remote
            </ion-button>
            <ion-button
              :disabled="resolvingConflict"
              @click="resolveConflict('local')"
            >
              {{ resolvingConflict ? 'Saving...' : 'Keep mine' }}
            </ion-button>
          </div>
        </ion-toolbar>
      </ion-footer>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
definePageMeta({
  pageTransition: { name: 'ion-forward', mode: 'out-in' },
});
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
  IonAlert,
  IonModal,
  IonTextarea,
} from '@ionic/vue';
import { useQueryClient } from '@tanstack/vue-query';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import EntryEditorPanel from '~/src/components/EntryEditorPanel.vue';
import MarkdownContent from '~/src/components/MarkdownContent.vue';
import { useDraftImageUpload } from '~/src/composables/useDraftImageUpload';
import { useMarkdownEditor } from '~/src/composables/useMarkdownEditor';
import { useMultiPathEntries } from '~/src/composables/useMultiPathEntries';
import { usePaths } from '~/src/composables/usePaths';
import { usePendingSaves } from '~/src/composables/usePendingSaves';
import { useApi } from '~/src/composables/useApi';
import {
  startEditEntryDraft,
  useAbandonEntryDraft,
  usePatchEntryDraft,
  useCommitEntryDraft,
  useRemoveDraftImage,
  getEntry,
  getEntryDraft,
} from '~/src/generated/apiClient';
import type { EntryContentResponse } from '~/src/generated/types';
import { extractErrorMessage } from '~/src/lib/errors';
import { db } from '~/src/lib/db';
import {
  buildLocalImageUrlMap,
  createDraftServerImageDraft,
  createLocalImageDraft,
  createServerImageDraft,
  getAttachedImageResponses,
  mergeDraftImageFromServer,
  revokeDraftPreviewUrl,
  syncDraftCaptionsFromContent,
  type EntryImageDraft,
} from '~/src/utils/entryImageDrafts';
import { removeImageMarkdownReferences } from '~/src/utils/markdown';

/**
 * Internal/test-only prop: when set to true the conflict resolution modal is
 * opened automatically as soon as the edit draft has been initialised.  This
 * is used by the ConflictResolution Storybook story so the modal is visible
 * without requiring the user to click Save.
 */
const props = withDefaults(defineProps<{ _openConflictOnMount?: boolean }>(), {
  _openConflictOnMount: false,
});

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

const pathId = computed(() => String(route.params.pathId));
const entryId = computed(() => String(route.params.entryId));

const { data: paths } = usePaths();
const path = computed(
  () =>
    (paths.value ?? []).find(
      (candidate) => candidate.path_id === pathId.value,
    ) ?? null,
);

const pathIdArr = computed(() => [pathId.value]);
const multiPathEntries = useMultiPathEntries(pathIdArr);
const entry = computed(() => {
  const pathEntries = multiPathEntries.value.find(
    (candidate) => candidate.pathId === pathId.value,
  );
  return (
    pathEntries?.entries.find((candidate) => candidate.id === entryId.value) ??
    null
  );
});

const { mutateAsync: abandonDraft } = useAbandonEntryDraft();
const { mutateAsync: patchDraft } = usePatchEntryDraft();
const { mutateAsync: commitDraftApi } = useCommitEntryDraft();
const { mutateAsync: removeDraftImageApi } = useRemoveDraftImage();
const { uploadError, uploadDraftImage } = useDraftImageUpload();

const {
  registerPendingSave,
  removePendingSave,
  clearSavedNotification,
  setContentSaving,
  registerDraftInitError,
  clearDraftInitError,
} = usePendingSaves();

const { enqueue, isOnline } = useApi();

const content = ref('');
const contentTab = ref<'write' | 'preview'>('write');
const committing = ref(false);
const savingDraft = ref(false);
const commitError = ref('');
const imageError = ref('');
const imageDrafts = ref<EntryImageDraft[]>([]);
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

/** The server-side draft id — set once the edit draft is started */
const draftId = ref('');

// When the _openConflictOnMount prop is set (Storybook ConflictResolution
// story), open the conflict modal as soon as the draft is ready.
// { once: true } ensures the watcher does not re-fire when resolveConflict
// sets a new draftId partway through the resolution flow.
watch(
  draftId,
  (nextId) => {
    if (props._openConflictOnMount && nextId) {
      void openConflictModal(content.value);
    }
  },
  { once: true },
);

/** True when a 409 is returned on draft init (stale edit_id) */
const draftInitConflict = ref(false);

/** True when autosave has failed and the device appears to be offline */
const autosaveOffline = ref(false);

/**
 * The latest content value that should be saved.  Set whenever content
 * changes and autosave needs to run.  null means nothing is pending.
 */
let pendingAutosaveContent: string | null = null;

/** True while a PATCH is running so we don't start a second one. */
let autosaveInFlight = false;

/** Promise that resolves when the current in-flight flush completes. */
let autosaveFlushPromise: Promise<void> | null = null;

/** Debounce timer before the first flush after a change. */
let autosaveTimer: ReturnType<typeof setTimeout> | null = null;

/** Timer handle for background draft-init retry */
let draftInitRetryTimer: ReturnType<typeof setTimeout> | null = null;

/** Last content value successfully PATCHed */
let lastSavedContent = '';

/**
 * The content of the entry as it was when first loaded (before any editing).
 * Used to determine whether the user has actually changed anything.
 */
let originalEntryContent = '';

/** Tracks which entry id we've already initialised, to avoid re-init on reactive re-runs */
const initializedEntryId = ref('');

/** Whether the commit-fail inform dialog is open */
const commitFailDialogOpen = ref(false);
/** Message shown in the commit-fail inform dialog */
const commitFailDialogMessage = ref('');
/** Whether the current commit failure will be retried automatically */
const commitFailWillRetry = ref(true);
const backgroundCommitDelegated = ref(false);

/** Whether the discard-draft confirm alert is open */
const discardAlertOpen = ref(false);
/** Whether a discard operation is in progress */
const discarding = ref(false);

// ─── Conflict resolution state ───────────────────────────────────────────

const isConflictModalOpen = ref(false);
const resolvingConflict = ref(false);
const conflictLocalContent = ref('');
const conflictRemoteContent = ref('');
/** The new edit_id fetched from the server during conflict resolution */
let conflictRemoteEditId = 0;

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

// ─── Derived ─────────────────────────────────────────────────────────────

const canCommit = computed(
  () =>
    !!content.value.trim() &&
    !draftInitConflict.value &&
    content.value.trim() !== originalEntryContent.trim() &&
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
  markContentDirty();
}

const formattedEntryDay = computed(() => {
  if (!entry.value?.day) return '';
  return new Date(entry.value.day + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

// ─── Load Remote Version (after 409 conflict on init) ────────────────────

async function loadRemoteAndContinue() {
  draftInitConflict.value = false;
  clearDraftInitError(pendingSaveKey());

  try {
    // Fetch the current remote entry to get its edit_id
    const response = await getEntry(pathId.value, entryId.value);
    if (response.status !== 200)
      throw new Error('Failed to load remote entry.');
    const remoteEntry = response.data as EntryContentResponse;
    const remoteEditId = (remoteEntry as { edit_id?: number }).edit_id ?? 0;

    // Seed content and images from the remote entry
    content.value = remoteEntry.content ?? '';
    lastSavedContent = content.value;
    originalEntryContent = content.value;
    imageDrafts.value.forEach(revokeDraftPreviewUrl);
    imageDrafts.value = [];

    // Start a fresh draft based on the remote edit_id
    await initEditDraft(remoteEditId);
  } catch (err: unknown) {
    registerDraftInitError(
      pendingSaveKey(),
      extractErrorMessage(err) ??
        'Failed to load the latest version. Please try again.',
    );
  }
}

// ─── Draft Initialisation ─────────────────────────────────────────────────

async function initEditDraft(editId: number) {
  clearDraftInitError(pendingSaveKey());
  draftInitConflict.value = false;
  if (draftInitRetryTimer !== null) {
    clearTimeout(draftInitRetryTimer);
    draftInitRetryTimer = null;
  }
  try {
    const response = await startEditEntryDraft(pathId.value, entryId.value, {
      based_on_edit_id: editId,
    });
    if (response.status !== 200)
      throw new Error('Failed to get or create edit draft.');
    const draft = response.data;
    draftId.value = String(draft.id);
    lastSavedContent = draft.content ?? '';
    content.value = lastSavedContent;
    // Capture the original content once (first time we load the draft)
    if (!originalEntryContent) {
      originalEntryContent = lastSavedContent;
    }
    contentTab.value = 'write';
    // Hydrate images from the draft
    imageDrafts.value.forEach(revokeDraftPreviewUrl);
    imageDrafts.value = (draft.images ?? []).map((img) =>
      createDraftServerImageDraft(img),
    );
    imageDrafts.value = syncDraftCaptionsFromContent(
      imageDrafts.value,
      content.value,
    );
  } catch (err: unknown) {
    const status =
      err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;
    if (status === 409) {
      // 409 = stale edit_id — let the user choose to load the remote version
      draftInitConflict.value = true;
    } else {
      // Any other error: keep the editor open with existing content; retry in background
      registerDraftInitError(
        pendingSaveKey(),
        extractErrorMessage(err) ??
          'Failed to start editing. Retrying in background.',
      );
      draftInitRetryTimer = setTimeout(() => {
        draftInitRetryTimer = null;
        void initEditDraft(entry.value?.edit_id ?? 0);
      }, AUTOSAVE_DEBOUNCE_MS);
    }
  }
}

// Watch for entry to load, then initialise the draft once
watch(
  entry,
  async (nextEntry) => {
    if (!nextEntry || initializedEntryId.value === nextEntry.id) return;
    initializedEntryId.value = nextEntry.id;

    // Populate the editor immediately from the cached entry so the user can
    // start editing even if draft init fails or is slow.
    if (!content.value) {
      content.value = nextEntry.content ?? '';
      lastSavedContent = content.value;
      originalEntryContent = content.value;
    }

    // Populate legacy server images while draft loads (show them as ready)
    imageDrafts.value.forEach(revokeDraftPreviewUrl);
    imageDrafts.value = (nextEntry.images ?? []).map((image) =>
      createServerImageDraft(image),
    );

    await initEditDraft(nextEntry.edit_id ?? 0);
  },
  { immediate: true },
);

// ─── Content Autosave ─────────────────────────────────────────────────────

/**
 * Mark the current content as needing to be saved and kick off the
 * autosave machinery.
 *
 * Replace-if-pending semantics:
 *  - If nothing is in flight, start a debounced flush immediately.
 *  - If a PATCH is in flight, just update `pendingAutosaveContent`; when
 *    the in-flight PATCH finishes it will see the newer value and re-fire.
 *  - If draftId is not yet available, store the pending content and watch
 *    for draftId to become set (see watch below).
 */
function markContentDirty() {
  pendingAutosaveContent = content.value;
  setContentSaving(pendingSaveKey(), true);

  if (!draftId.value) {
    // Draft not ready yet — the watch(draftId) below will flush when it arrives
    return;
  }

  if (autosaveInFlight) {
    // A PATCH is already running; it will pick up pendingAutosaveContent when done
    return;
  }

  // Schedule a debounced flush (reset timer if already pending)
  if (autosaveTimer !== null) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    autosaveTimer = null;
    autosaveFlushPromise = flushContentAutosave().finally(() => {
      autosaveFlushPromise = null;
    });
  }, AUTOSAVE_DEBOUNCE_MS);
}

/** Flush any pending autosave content to the server immediately. */
async function flushContentAutosave() {
  if (!draftId.value) return;

  const contentToSave = pendingAutosaveContent;
  if (contentToSave === null || contentToSave === lastSavedContent) {
    pendingAutosaveContent = null;
    setContentSaving(pendingSaveKey(), false);
    return;
  }

  autosaveInFlight = true;
  pendingAutosaveContent = null; // consumed — will be re-set if content changes again while in flight

  try {
    await patchDraft({
      draftId: draftId.value,
      data: { content: contentToSave },
    });
    lastSavedContent = contentToSave;
    autosaveOffline.value = false;
  } catch {
    if (!navigator.onLine) {
      autosaveOffline.value = true;
    }
    // Re-queue the failed content for retry so it isn't silently dropped
    if (pendingAutosaveContent === null) {
      pendingAutosaveContent = contentToSave;
    }
  } finally {
    autosaveInFlight = false;
    // If content changed again while we were in flight, flush again
    if (
      pendingAutosaveContent !== null &&
      pendingAutosaveContent !== lastSavedContent
    ) {
      autosaveFlushPromise = flushContentAutosave().finally(() => {
        autosaveFlushPromise = null;
      });
    } else {
      setContentSaving(pendingSaveKey(), false);
    }
  }
}

// When draftId becomes available, flush any content that was marked dirty
// before the draft was ready.
watch(draftId, (nextId) => {
  if (
    nextId &&
    pendingAutosaveContent !== null &&
    pendingAutosaveContent !== lastSavedContent
  ) {
    if (autosaveTimer !== null) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      autosaveTimer = null;
      autosaveFlushPromise = flushContentAutosave().finally(() => {
        autosaveFlushPromise = null;
      });
    }, AUTOSAVE_DEBOUNCE_MS);
  }
});

// ─── Image helpers ────────────────────────────────────────────────────────

let draftImageRefreshTimer: ReturnType<typeof setTimeout> | null = null;
/** Guard: true while the polling loop is active to prevent re-entrancy. */
let isPollingImages = false;

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

/**
 * Start the image-status polling loop if it is not already running.
 * Uses `isPollingImages` to prevent re-entrancy: assigning to
 * `imageDrafts.value` inside the loop would otherwise re-trigger any
 * reactive watcher that inspects the `draft-uploading` condition,
 * spawning thousands of concurrent requests.
 */
function ensureImagePolling() {
  if (isPollingImages) return;
  if (!draftId.value) return;
  if (!imageDrafts.value.some((img) => img.status === 'draft-uploading'))
    return;

  isPollingImages = true;

  const tick = async () => {
    await refreshDraftImages();
    if (imageDrafts.value.some((img) => img.status === 'draft-uploading')) {
      draftImageRefreshTimer = setTimeout(() => {
        void tick();
      }, 2000);
    } else {
      draftImageRefreshTimer = null;
      isPollingImages = false;
    }
  };

  void tick();
}

// Watch only for the conditions that should *start* a new polling loop.
// We intentionally do NOT watch `imageDrafts.value` here — that would
// re-fire on every poll result and cause re-entrancy.
watch(
  () => [
    draftId.value,
    imageDrafts.value.some((image) => image.status === 'draft-uploading'),
  ],
  ([nextDraftId, hasProcessingImages]) => {
    if (!nextDraftId || !hasProcessingImages) {
      // If conditions are no longer met, stop any running loop.
      if (draftImageRefreshTimer !== null) {
        clearTimeout(draftImageRefreshTimer);
        draftImageRefreshTimer = null;
      }
      isPollingImages = false;
      return;
    }
    ensureImagePolling();
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
    for (const draft of newDrafts) {
      void uploadImageToDraft(draft.localId, draft.file!);
    }
  }

  imageError.value = errors.join('; ');
}

async function uploadImageToDraft(localId: string, file: File) {
  if (!draftId.value) return;

  imageDrafts.value = imageDrafts.value.map((d) =>
    d.localId === localId ? { ...d, status: 'uploading' as const } : d,
  );

  const result = await uploadDraftImage(draftId.value, file, localId);

  if (!result) {
    imageDrafts.value = imageDrafts.value.map((d) =>
      d.localId === localId
        ? { ...d, status: 'failed' as const, error: uploadError.value }
        : d,
    );
    return;
  }

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
  // Content changed programmatically — trigger autosave
  markContentDirty();
}

// ─── Discard Draft ────────────────────────────────────────────────────────

async function discardDraft() {
  discarding.value = true;
  discardAlertOpen.value = false;
  if (autosaveTimer !== null) {
    clearTimeout(autosaveTimer);
    autosaveTimer = null;
  }
  pendingAutosaveContent = null;
  setContentSaving(pendingSaveKey(), false);
  clearDraftInitError(pendingSaveKey());

  const currentDraftId = draftId.value;
  draftId.value = '';
  if (currentDraftId) {
    try {
      await abandonDraft({ draftId: currentDraftId });
    } catch {
      // Best-effort
    }
  }
  discarding.value = false;
  await router.replace(`/entry/${pathId.value}/${entryId.value}`);
}

// ─── Commit ───────────────────────────────────────────────────────────────

/** Human-readable label for the pending-save badge. */
function buildPendingSaveLabel(): string {
  const pathTitle = path.value?.title ?? pathId.value;
  const entryDay = entry.value?.day ?? '';
  return entryDay ? `${pathTitle} — ${entryDay}` : pathTitle;
}

/** Key used to identify this draft in the pending-saves store */
function pendingSaveKey(): string {
  return `edit:${pathId.value}:${entryId.value}`;
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

  console.error(`[EntryEditView] ${context}`, {
    status: response?.status,
    response: response?.data,
    draftId: draftId.value || null,
    pathId: pathId.value || null,
    entryId: entryId.value || null,
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

async function acknowledgeCommitFailure() {
  commitFailDialogOpen.value = false;
  if (!commitFailWillRetry.value) return;

  backgroundCommitDelegated.value = true;
  await router.replace(`/entry/${pathId.value}/${entryId.value}`);
}

/**
 * Core commit logic shared between the initial attempt and background retries
 * (via enqueue). Throws on failure.
 */
async function executeCommit(): Promise<void> {
  if (!draftId.value) {
    await initEditDraft(entry.value?.edit_id ?? 0);
    if (!draftId.value) {
      throw new Error(
        'Could not start a draft. Please check your connection and try again.',
      );
    }
  }

  imageDrafts.value = syncDraftCaptionsFromContent(
    imageDrafts.value,
    content.value,
  );
  const finalContent = content.value;

  if (finalContent !== lastSavedContent) {
    await patchDraft({
      draftId: draftId.value,
      data: { content: finalContent },
    });
    lastSavedContent = finalContent;
  }

  await commitDraftApi({ draftId: draftId.value });

  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: ['v1', 'paths', pathId.value, 'entries'],
    }),
    queryClient.invalidateQueries({
      queryKey: ['v1', 'paths', pathId.value, 'entries', entryId.value],
    }),
  ]);

  try {
    await db.entryContent.delete(`${pathId.value}:${entryId.value}`);
    await db.entryImages.where('entry_id').equals(entryId.value).delete();
  } catch {
    /* IndexedDB may be unavailable */
  }

  clearSavedNotification();
  clearDraftInitError(pendingSaveKey());
  draftId.value = '';
}

/**
 * Flush the current content to the server draft and navigate back without
 * committing (publishing) the entry.  Preserves the draft so the user can
 * return and continue editing later.
 */
async function saveDraftAndNavigateBack() {
  if (savingDraft.value || committing.value || !draftId.value) return;
  savingDraft.value = true;
  try {
    // Cancel pending debounce timer.
    if (autosaveTimer !== null) {
      clearTimeout(autosaveTimer);
      autosaveTimer = null;
    }
    // Wait for any in-flight PATCH to finish.
    if (autosaveFlushPromise) await autosaveFlushPromise;
    // Flush any remaining pending content.
    const contentToSave = pendingAutosaveContent ?? content.value;
    if (contentToSave !== lastSavedContent) {
      await patchDraft({
        draftId: draftId.value,
        data: { content: contentToSave },
      });
      lastSavedContent = contentToSave;
    }
    pendingAutosaveContent = null;
    setContentSaving(pendingSaveKey(), false);
  } catch {
    // Best-effort — navigate back regardless.
  } finally {
    savingDraft.value = false;
  }
  // Prevent the onBeforeUnmount hook from abandoning the draft.
  backgroundCommitDelegated.value = true;
  router.back();
}

async function commitDraft() {
  if (!canCommit.value) return;

  committing.value = true;
  commitError.value = '';
  let finalContent = content.value;
  backgroundCommitDelegated.value = false;

  try {
    // Cancel any pending debounce timer and flush any in-flight / pending autosave
    if (autosaveTimer !== null) {
      clearTimeout(autosaveTimer);
      autosaveTimer = null;
    }
    // If a PATCH is in flight or we have pending content, flush it now before committing
    if (autosaveInFlight || pendingAutosaveContent !== null) {
      if (autosaveFlushPromise) await autosaveFlushPromise;
      if (
        pendingAutosaveContent !== null &&
        pendingAutosaveContent !== lastSavedContent
      ) {
        await flushContentAutosave();
      }
    }

    finalContent = content.value;
    await executeCommit();

    removePendingSave(pendingSaveKey(), true);
    backgroundCommitDelegated.value = false;
    await router.replace(`/entry/${pathId.value}/${entryId.value}`);
  } catch (err: unknown) {
    const status =
      err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;

    if (status === 409) {
      await openConflictModal(finalContent ?? content.value);
    } else {
      const detail =
        status === 422
          ? (err as { response?: { data?: { detail?: { code?: string } } } })
              .response?.data?.detail
          : undefined;
      let message: string;
      const willRetry = status !== 422;
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
        message =
          extractErrorMessage(err) ?? 'Failed to save. Please try again.';
      }

      logCommitFailure('manual commit failed', err, { willRetry });

      commitFailDialogMessage.value = message;
      commitFailWillRetry.value = willRetry;
      commitFailDialogOpen.value = true;
      if (willRetry) {
        // Hand off to useApi for background retries with automatic back-off
        registerPendingSave(pendingSaveKey(), buildPendingSaveLabel());
        enqueue({
          id: `commit-entry:${pendingSaveKey()}`,
          label: buildPendingSaveLabel(),
          execute: async () => {
            try {
              await executeCommit();
            } catch (retryErr: unknown) {
              const retryStatus =
                retryErr &&
                typeof retryErr === 'object' &&
                'response' in retryErr
                  ? (retryErr as { response?: { status?: number } }).response
                      ?.status
                  : undefined;
              if (retryStatus === 409) {
                // Conflict on retry — surface the conflict modal and stop retrying
                removePendingSave(pendingSaveKey(), false);
                await openConflictModal(content.value);
                return; // Don't re-throw so enqueue doesn't schedule further retries
              }
              logCommitFailure('background commit retry failed', retryErr);
              throw retryErr; // Let enqueue handle retry/abandon
            }
            removePendingSave(pendingSaveKey(), true);
            const shouldNavigate = !backgroundCommitDelegated.value;
            backgroundCommitDelegated.value = false;
            if (shouldNavigate) {
              await router.replace(`/entry/${pathId.value}/${entryId.value}`);
            }
          },
        });
      } else {
        removePendingSave(pendingSaveKey(), false);
      }
    }
  } finally {
    committing.value = false;
  }
}

// ─── Conflict Resolution ──────────────────────────────────────────────────

async function openConflictModal(localContent: string) {
  conflictLocalContent.value = localContent;
  conflictRemoteContent.value = '';
  conflictRemoteEditId = 0;

  try {
    const response = await getEntry(pathId.value, entryId.value);
    if (response.status === 200) {
      const remoteEntry = response.data as EntryContentResponse;
      conflictRemoteContent.value = remoteEntry.content ?? '';
      conflictRemoteEditId = (remoteEntry as { edit_id?: number }).edit_id ?? 0;
    }
  } catch {
    // Couldn't fetch remote — user can still keep local
  }

  isConflictModalOpen.value = true;
}

async function resolveConflict(choice: 'local' | 'remote') {
  resolvingConflict.value = true;
  commitError.value = '';

  try {
    const chosenContent =
      choice === 'local'
        ? conflictLocalContent.value
        : conflictRemoteContent.value;

    // Abandon the current (stale) draft
    if (draftId.value) {
      try {
        await abandonDraft({ draftId: draftId.value });
      } catch {
        // Best-effort
      }
      draftId.value = '';
    }

    // Re-open a fresh edit draft against the current remote edit_id
    const newEditId = conflictRemoteEditId || (entry.value?.edit_id ?? 0);
    const response = await startEditEntryDraft(pathId.value, entryId.value, {
      based_on_edit_id: newEditId,
    });
    if (response.status !== 200) throw new Error('Failed to re-open draft.');

    const newDraft = response.data;
    draftId.value = String(newDraft.id);

    // Patch with the chosen content
    await patchDraft({
      draftId: draftId.value,
      data: { content: chosenContent },
    });
    lastSavedContent = chosenContent;

    // Commit
    await commitDraftApi({ draftId: draftId.value });

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['v1', 'paths', pathId.value, 'entries'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['v1', 'paths', pathId.value, 'entries', entryId.value],
      }),
    ]);

    try {
      await db.entryContent.delete(`${pathId.value}:${entryId.value}`);
      await db.entryImages.where('entry_id').equals(entryId.value).delete();
    } catch {
      /* IndexedDB may be unavailable */
    }

    draftId.value = '';
    isConflictModalOpen.value = false;
    await router.replace(`/entry/${pathId.value}/${entryId.value}`);
  } catch (err: unknown) {
    commitError.value =
      extractErrorMessage(err) ??
      'Failed to resolve conflict. Please try again.';
    isConflictModalOpen.value = false;
  } finally {
    resolvingConflict.value = false;
  }
}

// ─── Cleanup ─────────────────────────────────────────────────────────────

// When connectivity is restored, clear the offline flag and flush any
// pending autosave.  useApi owns the single online/offline listener.
watch(isOnline, (online) => {
  if (online) {
    autosaveOffline.value = false;
    if (!draftId.value && entry.value && !draftInitConflict.value) {
      void initEditDraft(entry.value.edit_id ?? 0);
    } else if (content.value && content.value !== lastSavedContent) {
      markContentDirty();
    }
  }
});

onMounted(() => {
  // intentionally empty — online/offline handled via watch(isOnline)
});

onBeforeUnmount(async () => {
  if (autosaveTimer !== null) clearTimeout(autosaveTimer);
  if (draftInitRetryTimer !== null) clearTimeout(draftInitRetryTimer);
  if (!backgroundCommitDelegated.value && draftImageRefreshTimer !== null) {
    clearTimeout(draftImageRefreshTimer);
  }

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

  // Best-effort: flush any pending or in-flight autosave content before
  // abandoning so the user doesn't lose work typed since the last autosave.
  if (draftId.value) {
    try {
      // Wait for any in-flight flush to complete before we abandon
      if (autosaveFlushPromise) await autosaveFlushPromise;
      const contentToFlush = pendingAutosaveContent ?? content.value;
      if (contentToFlush !== null && contentToFlush !== lastSavedContent) {
        await patchDraft({
          draftId: draftId.value,
          data: { content: contentToFlush },
        });
      }
    } catch {
      // Best-effort — proceed to abandon regardless
    }
  }

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

.edit-loading {
  padding: 32px 20px;
  text-align: center;
  color: var(--ion-color-medium);
  border: 1px dashed var(--ion-border-color);
  border-radius: 18px;
}

.edit-conflict-banner {
  padding: 20px;
  border: 1px solid var(--ion-color-warning);
  border-radius: 18px;
  background: color-mix(in srgb, var(--ion-color-warning) 8%, transparent);
}

.edit-conflict-banner-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 6px;
  color: var(--ion-text-color);
}

.edit-conflict-banner-body {
  font-size: 0.88rem;
  color: var(--ion-color-medium);
  margin: 0 0 16px;
}

.edit-conflict-banner-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.edit-path-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  margin-right: 6px;
  vertical-align: middle;
  flex-shrink: 0;
}

/* Conflict resolution modal */
.conflict-modal-content {
  --padding-top: 16px;
}

.conflict-description {
  font-size: 0.92rem;
  color: var(--ion-color-medium-shade, #556);
  margin: 0 0 16px;
}

.conflict-versions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.conflict-version {
  border: 1px solid var(--ion-border-color);
  border-radius: 14px;
  overflow: hidden;
}

.conflict-version-title {
  margin: 0;
  padding: 10px 14px;
  font-size: 0.88rem;
  font-weight: 600;
  background: color-mix(in srgb, var(--ion-color-primary) 8%, transparent);
  border-bottom: 1px solid var(--ion-border-color);
}

.conflict-version-body {
  padding: 12px 14px;
  max-height: 200px;
  overflow-y: auto;
}

.conflict-content-empty {
  margin: 0;
  font-size: 0.82rem;
  color: var(--ion-color-medium);
  font-style: italic;
}

.conflict-version-select {
  padding: 8px 12px 12px;
  border-top: 1px solid var(--ion-border-color);
}

.conflict-actions {
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
