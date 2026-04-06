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
          <ion-button :disabled="committing || !canCommit" @click="commitDraft">
            {{ committing ? 'Saving...' : 'Save' }}
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
                  :disabled="committing || !draftId || autosaveOffline"
                  @change="onImageSelected"
                />
                <ion-button
                  size="small"
                  fill="outline"
                  :disabled="committing || !draftId || autosaveOffline"
                  :title="
                    autosaveOffline
                      ? 'Image upload is unavailable while offline'
                      : undefined
                  "
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

            <p
              v-if="autosaveOffline"
              class="autosave-offline-note image-offline-note"
            >
              Image upload is unavailable while offline.
            </p>

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
          <p v-else-if="autosaveOffline" class="autosave-offline-note">
            Currently offline — your changes will be saved when you reconnect.
          </p>
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

    <!-- Commit-fail dialog (save failed, retrying in background) -->
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
            <ion-button fill="outline" @click="commitFailDialogOpen = false"
              >Cancel</ion-button
            >
            <ion-button @click="commitFailDialogOpen = false"
              >OK — keep retrying</ion-button
            >
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
  IonAlert,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
} from '@ionic/vue';
import { useQueryClient } from '@tanstack/vue-query';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import EntryImageDraftPreview from '../components/EntryImageDraftPreview.vue';
import MarkdownContent from '../components/MarkdownContent.vue';
import RefreshStatus from '../components/RefreshStatus.vue';
import { useDraftImageUpload } from '../composables/useDraftImageUpload';
import { useMarkdownEditor } from '../composables/useMarkdownEditor';
import { useMultiPathEntries } from '../composables/useMultiPathEntries';
import { usePaths } from '../composables/usePaths';
import { useRefreshStatus } from '../composables/useRefreshStatus';
import { usePendingSaves } from '../composables/usePendingSaves';
import {
  startEditEntryDraft,
  useAbandonEntryDraft,
  usePatchEntryDraft,
  useCommitEntryDraft,
  useRemoveDraftImage,
  getEntry,
  getEntryDraft,
} from '../generated/apiClient';
import type { EntryContentResponse } from '../generated/types';
import { extractErrorMessage } from '../lib/errors';
import { db } from '../lib/db';
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
} from '../utils/entryImageDrafts';
import { removeImageMarkdownReferences } from '../utils/markdown';

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
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

const {
  registerPendingSave,
  removePendingSave,
  clearSavedNotification,
  setContentSaving,
  registerDraftInitError,
  clearDraftInitError,
} = usePendingSaves();

const content = ref('');
const contentTab = ref<'write' | 'preview'>('write');
const committing = ref(false);
const commitError = ref('');
const imageError = ref('');
const imageDrafts = ref<EntryImageDraft[]>([]);
const textareaRef = ref<InstanceType<typeof IonTextarea> | null>(null);
const imageInputRef = ref<HTMLInputElement | null>(null);
const isCaptionModalOpen = ref(false);
const captionDraft = ref('');
const selectedImage = ref<EntryImageDraft | null>(null);

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

/** Background commit-retry timer (after a manual save failure) */
let commitRetryTimer: ReturnType<typeof setTimeout> | null = null;
/** Whether a commit retry is currently in progress */
const commitRetrying = ref(false);

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

// ─── Derived ─────────────────────────────────────────────────────────────

const canCommit = computed(
  () =>
    !!content.value.trim() &&
    !draftInitConflict.value &&
    content.value.trim() !== originalEntryContent.trim(),
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
    void flushContentAutosave();
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
  } finally {
    autosaveInFlight = false;
    // If content changed again while we were in flight, flush again
    if (
      pendingAutosaveContent !== null &&
      pendingAutosaveContent !== lastSavedContent
    ) {
      void flushContentAutosave();
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
      void flushContentAutosave();
    }, AUTOSAVE_DEBOUNCE_MS);
  }
});

// ─── Image helpers ────────────────────────────────────────────────────────

function imageStatusText(image: EntryImageDraft) {
  if (image.status === 'uploading') return 'Uploading...';
  if (image.status === 'draft-uploading') return 'Processing...';
  if (image.status === 'failed') return image.error || 'Failed';
  return 'Attached';
}

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

/** Attempt a background commit retry (called after a failed manual save). */
async function attemptCommitRetry() {
  commitRetryTimer = null;
  if (!canCommit.value || commitRetrying.value) return;
  commitRetrying.value = true;

  let finalContent = content.value;
  try {
    if (!draftId.value) {
      await initEditDraft(entry.value?.edit_id ?? 0);
      if (!draftId.value) {
        commitRetryTimer = setTimeout(
          () => void attemptCommitRetry(),
          AUTOSAVE_DEBOUNCE_MS,
        );
        return;
      }
    }

    imageDrafts.value = syncDraftCaptionsFromContent(
      imageDrafts.value,
      content.value,
    );
    finalContent = content.value;

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

    // Success — deregister pending save and signal success
    removePendingSave(pendingSaveKey(), true);
    clearDraftInitError(pendingSaveKey());
    draftId.value = '';
    await router.replace(`/entry/${pathId.value}/${entryId.value}`);
  } catch (err: unknown) {
    const status =
      err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;

    if (status === 409) {
      // Conflict on retry — surface the conflict modal and stop retrying
      removePendingSave(pendingSaveKey(), false);
      await openConflictModal(finalContent ?? content.value);
    } else {
      // Still failing — schedule another retry
      commitRetryTimer = setTimeout(
        () => void attemptCommitRetry(),
        AUTOSAVE_DEBOUNCE_MS,
      );
    }
  } finally {
    commitRetrying.value = false;
  }
}

async function commitDraft() {
  if (!canCommit.value) return;

  committing.value = true;
  commitError.value = '';
  let finalContent = content.value;

  try {
    // Cancel any pending debounce timer and flush any in-flight / pending autosave
    if (autosaveTimer !== null) {
      clearTimeout(autosaveTimer);
      autosaveTimer = null;
    }
    // If a PATCH is in flight or we have pending content, flush it now before committing
    if (autosaveInFlight || pendingAutosaveContent !== null) {
      // Let any in-flight PATCH finish, then flush remaining if needed
      await new Promise<void>((resolve) => {
        const poll = () => {
          if (!autosaveInFlight) {
            resolve();
          } else {
            setTimeout(poll, 50);
          }
        };
        poll();
      });
      if (
        pendingAutosaveContent !== null &&
        pendingAutosaveContent !== lastSavedContent
      ) {
        await flushContentAutosave();
      }
    }

    // Ensure we have a draft — attempt init if it failed earlier
    if (!draftId.value) {
      await initEditDraft(entry.value?.edit_id ?? 0);
      if (!draftId.value) {
        commitError.value =
          'Could not start a draft. Please check your connection and try again.';
        return;
      }
    }

    imageDrafts.value = syncDraftCaptionsFromContent(
      imageDrafts.value,
      content.value,
    );
    finalContent = content.value;

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

    // Draft committed — skip abandon on unmount
    clearSavedNotification();
    clearDraftInitError(pendingSaveKey());
    draftId.value = '';
    await router.replace(`/entry/${pathId.value}/${entryId.value}`);
  } catch (err: unknown) {
    const status =
      err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;

    if (status === 409) {
      await openConflictModal(finalContent ?? content.value);
    } else {
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
        message =
          extractErrorMessage(err) ?? 'Failed to save. Please try again.';
      }

      // Show the inform dialog and start a background retry
      commitFailDialogMessage.value = message;
      commitFailDialogOpen.value = true;
      registerPendingSave(pendingSaveKey(), buildPendingSaveLabel());
      commitRetryTimer = setTimeout(
        () => void attemptCommitRetry(),
        AUTOSAVE_DEBOUNCE_MS,
      );
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

function handleOnline() {
  autosaveOffline.value = false;
  if (!draftId.value && entry.value && !draftInitConflict.value) {
    // Try to init the draft now that we're back online
    void initEditDraft(entry.value.edit_id ?? 0);
  } else if (content.value && content.value !== lastSavedContent) {
    markContentDirty();
  }
}

onMounted(() => {
  window.addEventListener('online', handleOnline);
});

onBeforeUnmount(async () => {
  if (autosaveTimer !== null) clearTimeout(autosaveTimer);
  if (draftInitRetryTimer !== null) clearTimeout(draftInitRetryTimer);
  if (commitRetryTimer !== null) clearTimeout(commitRetryTimer);
  if (draftImageRefreshTimer !== null) clearTimeout(draftImageRefreshTimer);
  window.removeEventListener('online', handleOnline);

  // Deregister any pending save entry (not succeeded — just navigating away)
  removePendingSave(pendingSaveKey(), false);
  setContentSaving(pendingSaveKey(), false);
  clearDraftInitError(pendingSaveKey());

  for (const draft of imageDrafts.value) {
    revokeDraftPreviewUrl(draft);
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

.image-offline-note {
  margin-top: 0;
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
