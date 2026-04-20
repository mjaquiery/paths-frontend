"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
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
import RefreshStatus from '~/src/components/RefreshStatus.vue';
import { useDraftImageUpload } from '~/src/composables/useDraftImageUpload';
import { useMarkdownEditor } from '~/src/composables/useMarkdownEditor';
import { useMultiPathEntries } from '~/src/composables/useMultiPathEntries';
import { usePaths } from '~/src/composables/usePaths';
import { usePendingSaves } from '~/src/composables/usePendingSaves';
import { useRefreshStatus } from '~/src/composables/useRefreshStatus';
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

const {
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

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
/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />

definePageMeta({
    pageTransition: { name: 'ion-forward', mode: 'out-in' },
});
var vue_1 = require("@ionic/vue");
var vue_query_1 = require("@tanstack/vue-query");
var vue_2 = require("vue");
var EntryEditorPanel_vue_1 = require("~/src/components/EntryEditorPanel.vue");
var MarkdownContent_vue_1 = require("~/src/components/MarkdownContent.vue");
var RefreshStatus_vue_1 = require("~/src/components/RefreshStatus.vue");
var useDraftImageUpload_1 = require("~/src/composables/useDraftImageUpload");
var useMarkdownEditor_1 = require("~/src/composables/useMarkdownEditor");
var useMultiPathEntries_1 = require("~/src/composables/useMultiPathEntries");
var usePaths_1 = require("~/src/composables/usePaths");
var usePendingSaves_1 = require("~/src/composables/usePendingSaves");
var useRefreshStatus_1 = require("~/src/composables/useRefreshStatus");
var useApi_1 = require("~/src/composables/useApi");
var apiClient_1 = require("~/src/generated/apiClient");
var errors_1 = require("~/src/lib/errors");
var db_1 = require("~/src/lib/db");
var entryImageDrafts_1 = require("~/src/utils/entryImageDrafts");
var markdown_1 = require("~/src/utils/markdown");
var props = withDefaults(defineProps(), {
    _openConflictOnMount: false,
});
var AUTOSAVE_DEBOUNCE_MS = 5000;
var MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
var ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif',
]);
var route = useRoute();
var router = useRouter();
var queryClient = (0, vue_query_1.useQueryClient)();
var pathId = (0, vue_2.computed)(function () { return String(route.params.pathId); });
var entryId = (0, vue_2.computed)(function () { return String(route.params.entryId); });
var paths = (0, usePaths_1.usePaths)().data;
var path = (0, vue_2.computed)(function () {
    var _a, _b;
    return (_b = ((_a = paths.value) !== null && _a !== void 0 ? _a : []).find(function (candidate) { return candidate.path_id === pathId.value; })) !== null && _b !== void 0 ? _b : null;
});
var pathIdArr = (0, vue_2.computed)(function () { return [pathId.value]; });
var multiPathEntries = (0, useMultiPathEntries_1.useMultiPathEntries)(pathIdArr);
var entry = (0, vue_2.computed)(function () {
    var _a;
    var pathEntries = multiPathEntries.value.find(function (candidate) { return candidate.pathId === pathId.value; });
    return ((_a = pathEntries === null || pathEntries === void 0 ? void 0 : pathEntries.entries.find(function (candidate) { return candidate.id === entryId.value; })) !== null && _a !== void 0 ? _a : null);
});
var abandonDraft = (0, apiClient_1.useAbandonEntryDraft)().mutateAsync;
var patchDraft = (0, apiClient_1.usePatchEntryDraft)().mutateAsync;
var commitDraftApi = (0, apiClient_1.useCommitEntryDraft)().mutateAsync;
var removeDraftImageApi = (0, apiClient_1.useRemoveDraftImage)().mutateAsync;
var _a = (0, useDraftImageUpload_1.useDraftImageUpload)(), uploadError = _a.uploadError, uploadDraftImage = _a.uploadDraftImage;
var _b = (0, usePendingSaves_1.usePendingSaves)(), registerPendingSave = _b.registerPendingSave, removePendingSave = _b.removePendingSave, clearSavedNotification = _b.clearSavedNotification, setContentSaving = _b.setContentSaving, registerDraftInitError = _b.registerDraftInitError, clearDraftInitError = _b.clearDraftInitError;
var _c = (0, useApi_1.useApi)(), enqueue = _c.enqueue, isOnline = _c.isOnline;
var _d = (0, useRefreshStatus_1.useRefreshStatus)(), refreshStatusType = _d.statusType, refreshStatusText = _d.statusText, refreshLastCheckedAt = _d.lastCheckedAt;
var content = (0, vue_2.ref)('');
var contentTab = (0, vue_2.ref)('write');
var committing = (0, vue_2.ref)(false);
var savingDraft = (0, vue_2.ref)(false);
var commitError = (0, vue_2.ref)('');
var imageError = (0, vue_2.ref)('');
var imageDrafts = (0, vue_2.ref)([]);
var textareaRef = (0, vue_2.ref)(null);
var imageInputRef = (0, vue_2.ref)(null);
var isCaptionModalOpen = (0, vue_2.ref)(false);
var captionDraft = (0, vue_2.ref)('');
var selectedImage = (0, vue_2.ref)(null);
function bindTextareaRef(el) {
    textareaRef.value = el;
}
function bindImageInputRef(el) {
    imageInputRef.value = el;
}
/** The server-side draft id — set once the edit draft is started */
var draftId = (0, vue_2.ref)('');
// When the _openConflictOnMount prop is set (Storybook ConflictResolution
// story), open the conflict modal as soon as the draft is ready.
// { once: true } ensures the watcher does not re-fire when resolveConflict
// sets a new draftId partway through the resolution flow.
(0, vue_2.watch)(draftId, function (nextId) {
    if (props._openConflictOnMount && nextId) {
        void openConflictModal(content.value);
    }
}, { once: true });
/** True when a 409 is returned on draft init (stale edit_id) */
var draftInitConflict = (0, vue_2.ref)(false);
/** True when autosave has failed and the device appears to be offline */
var autosaveOffline = (0, vue_2.ref)(false);
/**
 * The latest content value that should be saved.  Set whenever content
 * changes and autosave needs to run.  null means nothing is pending.
 */
var pendingAutosaveContent = null;
/** True while a PATCH is running so we don't start a second one. */
var autosaveInFlight = false;
/** Promise that resolves when the current in-flight flush completes. */
var autosaveFlushPromise = null;
/** Debounce timer before the first flush after a change. */
var autosaveTimer = null;
/** Timer handle for background draft-init retry */
var draftInitRetryTimer = null;
/** Last content value successfully PATCHed */
var lastSavedContent = '';
/**
 * The content of the entry as it was when first loaded (before any editing).
 * Used to determine whether the user has actually changed anything.
 */
var originalEntryContent = '';
/** Tracks which entry id we've already initialised, to avoid re-init on reactive re-runs */
var initializedEntryId = (0, vue_2.ref)('');
/** Whether the commit-fail inform dialog is open */
var commitFailDialogOpen = (0, vue_2.ref)(false);
/** Message shown in the commit-fail inform dialog */
var commitFailDialogMessage = (0, vue_2.ref)('');
/** Whether the current commit failure will be retried automatically */
var commitFailWillRetry = (0, vue_2.ref)(true);
var backgroundCommitDelegated = (0, vue_2.ref)(false);
/** Whether the discard-draft confirm alert is open */
var discardAlertOpen = (0, vue_2.ref)(false);
/** Whether a discard operation is in progress */
var discarding = (0, vue_2.ref)(false);
// ─── Conflict resolution state ───────────────────────────────────────────
var isConflictModalOpen = (0, vue_2.ref)(false);
var resolvingConflict = (0, vue_2.ref)(false);
var conflictLocalContent = (0, vue_2.ref)('');
var conflictRemoteContent = (0, vue_2.ref)('');
/** The new edit_id fetched from the server during conflict resolution */
var conflictRemoteEditId = 0;
var hasBlockingImages = (0, vue_2.computed)(function () {
    return imageDrafts.value.some(function (image) {
        return !image.removed &&
            ['local', 'uploading', 'draft-uploading', 'failed'].includes(image.status);
    });
});
var hasFailedImages = (0, vue_2.computed)(function () {
    return imageDrafts.value.some(function (image) { return !image.removed && image.status === 'failed'; });
});
// ─── Derived ─────────────────────────────────────────────────────────────
var canCommit = (0, vue_2.computed)(function () {
    return !!content.value.trim() &&
        !draftInitConflict.value &&
        content.value.trim() !== originalEntryContent.trim() &&
        !hasBlockingImages.value;
});
var attachedImages = (0, vue_2.computed)(function () {
    return (0, entryImageDrafts_1.getAttachedImageResponses)(imageDrafts.value);
});
var localImageUrls = (0, vue_2.computed)(function () { return (0, entryImageDrafts_1.buildLocalImageUrlMap)(imageDrafts.value); });
var _e = (0, useMarkdownEditor_1.useMarkdownEditor)(content, textareaRef, contentTab), _onTextareaInput = _e.onTextareaInput, insertImageMarkdown = _e.insertImageMarkdown, rememberSelection = _e.rememberSelection;
function onTextareaInput(event) {
    _onTextareaInput(event);
    markContentDirty();
}
var formattedEntryDay = (0, vue_2.computed)(function () {
    var _a;
    if (!((_a = entry.value) === null || _a === void 0 ? void 0 : _a.day))
        return '';
    return new Date(entry.value.day + 'T00:00:00').toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
});
// ─── Load Remote Version (after 409 conflict on init) ────────────────────
function loadRemoteAndContinue() {
    return __awaiter(this, void 0, void 0, function () {
        var response, remoteEntry, remoteEditId, err_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    draftInitConflict.value = false;
                    clearDraftInitError(pendingSaveKey());
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, apiClient_1.getEntry)(pathId.value, entryId.value)];
                case 2:
                    response = _d.sent();
                    if (response.status !== 200)
                        throw new Error('Failed to load remote entry.');
                    remoteEntry = response.data;
                    remoteEditId = (_a = remoteEntry.edit_id) !== null && _a !== void 0 ? _a : 0;
                    // Seed content and images from the remote entry
                    content.value = (_b = remoteEntry.content) !== null && _b !== void 0 ? _b : '';
                    lastSavedContent = content.value;
                    originalEntryContent = content.value;
                    imageDrafts.value.forEach(entryImageDrafts_1.revokeDraftPreviewUrl);
                    imageDrafts.value = [];
                    // Start a fresh draft based on the remote edit_id
                    return [4 /*yield*/, initEditDraft(remoteEditId)];
                case 3:
                    // Start a fresh draft based on the remote edit_id
                    _d.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _d.sent();
                    registerDraftInitError(pendingSaveKey(), (_c = (0, errors_1.extractErrorMessage)(err_1)) !== null && _c !== void 0 ? _c : 'Failed to load the latest version. Please try again.');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// ─── Draft Initialisation ─────────────────────────────────────────────────
function initEditDraft(editId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, draft, err_2, status_1;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    clearDraftInitError(pendingSaveKey());
                    draftInitConflict.value = false;
                    if (draftInitRetryTimer !== null) {
                        clearTimeout(draftInitRetryTimer);
                        draftInitRetryTimer = null;
                    }
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, apiClient_1.startEditEntryDraft)(pathId.value, entryId.value, {
                            based_on_edit_id: editId,
                        })];
                case 2:
                    response = _e.sent();
                    if (response.status !== 200)
                        throw new Error('Failed to get or create edit draft.');
                    draft = response.data;
                    draftId.value = String(draft.id);
                    lastSavedContent = (_a = draft.content) !== null && _a !== void 0 ? _a : '';
                    content.value = lastSavedContent;
                    // Capture the original content once (first time we load the draft)
                    if (!originalEntryContent) {
                        originalEntryContent = lastSavedContent;
                    }
                    contentTab.value = 'write';
                    // Hydrate images from the draft
                    imageDrafts.value.forEach(entryImageDrafts_1.revokeDraftPreviewUrl);
                    imageDrafts.value = ((_b = draft.images) !== null && _b !== void 0 ? _b : []).map(function (img) {
                        return (0, entryImageDrafts_1.createDraftServerImageDraft)(img);
                    });
                    imageDrafts.value = (0, entryImageDrafts_1.syncDraftCaptionsFromContent)(imageDrafts.value, content.value);
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _e.sent();
                    status_1 = err_2 && typeof err_2 === 'object' && 'response' in err_2
                        ? (_c = err_2.response) === null || _c === void 0 ? void 0 : _c.status
                        : undefined;
                    if (status_1 === 409) {
                        // 409 = stale edit_id — let the user choose to load the remote version
                        draftInitConflict.value = true;
                    }
                    else {
                        // Any other error: keep the editor open with existing content; retry in background
                        registerDraftInitError(pendingSaveKey(), (_d = (0, errors_1.extractErrorMessage)(err_2)) !== null && _d !== void 0 ? _d : 'Failed to start editing. Retrying in background.');
                        draftInitRetryTimer = setTimeout(function () {
                            var _a, _b;
                            draftInitRetryTimer = null;
                            void initEditDraft((_b = (_a = entry.value) === null || _a === void 0 ? void 0 : _a.edit_id) !== null && _b !== void 0 ? _b : 0);
                        }, AUTOSAVE_DEBOUNCE_MS);
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Watch for entry to load, then initialise the draft once
(0, vue_2.watch)(entry, function (nextEntry) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (!nextEntry || initializedEntryId.value === nextEntry.id)
                    return [2 /*return*/];
                initializedEntryId.value = nextEntry.id;
                // Populate the editor immediately from the cached entry so the user can
                // start editing even if draft init fails or is slow.
                if (!content.value) {
                    content.value = (_a = nextEntry.content) !== null && _a !== void 0 ? _a : '';
                    lastSavedContent = content.value;
                    originalEntryContent = content.value;
                }
                // Populate legacy server images while draft loads (show them as ready)
                imageDrafts.value.forEach(entryImageDrafts_1.revokeDraftPreviewUrl);
                imageDrafts.value = ((_b = nextEntry.images) !== null && _b !== void 0 ? _b : []).map(function (image) {
                    return (0, entryImageDrafts_1.createServerImageDraft)(image);
                });
                return [4 /*yield*/, initEditDraft((_c = nextEntry.edit_id) !== null && _c !== void 0 ? _c : 0)];
            case 1:
                _d.sent();
                return [2 /*return*/];
        }
    });
}); }, { immediate: true });
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
    if (autosaveTimer !== null)
        clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(function () {
        autosaveTimer = null;
        autosaveFlushPromise = flushContentAutosave().finally(function () {
            autosaveFlushPromise = null;
        });
    }, AUTOSAVE_DEBOUNCE_MS);
}
/** Flush any pending autosave content to the server immediately. */
function flushContentAutosave() {
    return __awaiter(this, void 0, void 0, function () {
        var contentToSave, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!draftId.value)
                        return [2 /*return*/];
                    contentToSave = pendingAutosaveContent;
                    if (contentToSave === null || contentToSave === lastSavedContent) {
                        pendingAutosaveContent = null;
                        setContentSaving(pendingSaveKey(), false);
                        return [2 /*return*/];
                    }
                    autosaveInFlight = true;
                    pendingAutosaveContent = null; // consumed — will be re-set if content changes again while in flight
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, patchDraft({
                            draftId: draftId.value,
                            data: { content: contentToSave },
                        })];
                case 2:
                    _b.sent();
                    lastSavedContent = contentToSave;
                    autosaveOffline.value = false;
                    return [3 /*break*/, 5];
                case 3:
                    _a = _b.sent();
                    if (!navigator.onLine) {
                        autosaveOffline.value = true;
                    }
                    // Re-queue the failed content for retry so it isn't silently dropped
                    if (pendingAutosaveContent === null) {
                        pendingAutosaveContent = contentToSave;
                    }
                    return [3 /*break*/, 5];
                case 4:
                    autosaveInFlight = false;
                    // If content changed again while we were in flight, flush again
                    if (pendingAutosaveContent !== null &&
                        pendingAutosaveContent !== lastSavedContent) {
                        autosaveFlushPromise = flushContentAutosave().finally(function () {
                            autosaveFlushPromise = null;
                        });
                    }
                    else {
                        setContentSaving(pendingSaveKey(), false);
                    }
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// When draftId becomes available, flush any content that was marked dirty
// before the draft was ready.
(0, vue_2.watch)(draftId, function (nextId) {
    if (nextId &&
        pendingAutosaveContent !== null &&
        pendingAutosaveContent !== lastSavedContent) {
        if (autosaveTimer !== null)
            clearTimeout(autosaveTimer);
        autosaveTimer = setTimeout(function () {
            autosaveTimer = null;
            autosaveFlushPromise = flushContentAutosave().finally(function () {
                autosaveFlushPromise = null;
            });
        }, AUTOSAVE_DEBOUNCE_MS);
    }
});
// ─── Image helpers ────────────────────────────────────────────────────────
var draftImageRefreshTimer = null;
/** Guard: true while the polling loop is active to prevent re-entrancy. */
var isPollingImages = false;
function refreshDraftImages() {
    return __awaiter(this, void 0, void 0, function () {
        var response, serverImages, imagesByDraftId_1, imagesByClientId_1, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!draftId.value)
                        return [2 /*return*/];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, apiClient_1.getEntryDraft)(draftId.value)];
                case 2:
                    response = _c.sent();
                    if (response.status !== 200)
                        return [2 /*return*/];
                    serverImages = (_b = response.data.images) !== null && _b !== void 0 ? _b : [];
                    imagesByDraftId_1 = new Map(serverImages.map(function (image) { return [String(image.id), image]; }));
                    imagesByClientId_1 = new Map(serverImages
                        .filter(function (image) { return image.client_image_id; })
                        .map(function (image) { return [String(image.client_image_id), image]; }));
                    imageDrafts.value = imageDrafts.value.map(function (draft) {
                        var matchingImage = (draft.draftImageId && imagesByDraftId_1.get(draft.draftImageId)) ||
                            imagesByClientId_1.get(draft.localId);
                        return matchingImage
                            ? (0, entryImageDrafts_1.mergeDraftImageFromServer)(draft, matchingImage)
                            : draft;
                    });
                    return [3 /*break*/, 4];
                case 3:
                    _a = _c.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Start the image-status polling loop if it is not already running.
 * Uses `isPollingImages` to prevent re-entrancy: assigning to
 * `imageDrafts.value` inside the loop would otherwise re-trigger any
 * reactive watcher that inspects the `draft-uploading` condition,
 * spawning thousands of concurrent requests.
 */
function ensureImagePolling() {
    var _this = this;
    if (isPollingImages)
        return;
    if (!draftId.value)
        return;
    if (!imageDrafts.value.some(function (img) { return img.status === 'draft-uploading'; }))
        return;
    isPollingImages = true;
    var tick = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, refreshDraftImages()];
                case 1:
                    _a.sent();
                    if (imageDrafts.value.some(function (img) { return img.status === 'draft-uploading'; })) {
                        draftImageRefreshTimer = setTimeout(function () {
                            void tick();
                        }, 2000);
                    }
                    else {
                        draftImageRefreshTimer = null;
                        isPollingImages = false;
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    void tick();
}
// Watch only for the conditions that should *start* a new polling loop.
// We intentionally do NOT watch `imageDrafts.value` here — that would
// re-fire on every poll result and cause re-entrancy.
(0, vue_2.watch)(function () { return [
    draftId.value,
    imageDrafts.value.some(function (image) { return image.status === 'draft-uploading'; }),
]; }, function (_a) {
    var nextDraftId = _a[0], hasProcessingImages = _a[1];
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
}, { immediate: true });
function openImagePicker() {
    var _a;
    (_a = imageInputRef.value) === null || _a === void 0 ? void 0 : _a.click();
}
function onImageSelected(event) {
    var input = event.target;
    var files = input.files ? Array.from(input.files) : [];
    input.value = '';
    if (files.length === 0)
        return;
    var errors = [];
    var activeNames = new Set(imageDrafts.value.map(function (draft) { return draft.filename; }));
    var acceptedFiles = [];
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
            errors.push("Not an image: ".concat(file.name));
            continue;
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            errors.push("Exceeds 10 MB: ".concat(file.name));
            continue;
        }
        if (activeNames.has(file.name)) {
            errors.push("Duplicate filename: ".concat(file.name));
            continue;
        }
        activeNames.add(file.name);
        acceptedFiles.push(file);
    }
    if (acceptedFiles.length > 0) {
        var newDrafts = acceptedFiles.map(entryImageDrafts_1.createLocalImageDraft);
        imageDrafts.value = __spreadArray(__spreadArray([], imageDrafts.value, true), newDrafts, true);
        for (var _a = 0, newDrafts_1 = newDrafts; _a < newDrafts_1.length; _a++) {
            var draft = newDrafts_1[_a];
            void uploadImageToDraft(draft.localId, draft.file);
        }
    }
    imageError.value = errors.join('; ');
}
function uploadImageToDraft(localId, file) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!draftId.value)
                        return [2 /*return*/];
                    imageDrafts.value = imageDrafts.value.map(function (d) {
                        return d.localId === localId ? __assign(__assign({}, d), { status: 'uploading' }) : d;
                    });
                    return [4 /*yield*/, uploadDraftImage(draftId.value, file, localId)];
                case 1:
                    result = _a.sent();
                    if (!result) {
                        imageDrafts.value = imageDrafts.value.map(function (d) {
                            return d.localId === localId
                                ? __assign(__assign({}, d), { status: 'failed', error: uploadError.value }) : d;
                        });
                        return [2 /*return*/];
                    }
                    imageDrafts.value = imageDrafts.value.map(function (d) {
                        return d.localId === localId
                            ? __assign(__assign({}, d), { status: 'draft-uploading', draftImageId: String(result.id), error: '' }) : d;
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function removeImage(localId) {
    return __awaiter(this, void 0, void 0, function () {
        var target, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    target = imageDrafts.value.find(function (draft) { return draft.localId === localId; });
                    if (!target)
                        return [2 /*return*/];
                    if (!(target.draftImageId && draftId.value)) return [3 /*break*/, 4];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, removeDraftImageApi({
                            draftId: draftId.value,
                            draftImageId: target.draftImageId,
                        })];
                case 2:
                    _c.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _c.sent();
                    return [3 /*break*/, 4];
                case 4:
                    (0, entryImageDrafts_1.revokeDraftPreviewUrl)(target);
                    imageDrafts.value = imageDrafts.value.filter(function (draft) { return draft.localId !== localId; });
                    content.value = (0, markdown_1.removeImageMarkdownReferences)(content.value, target.filename);
                    if (((_b = selectedImage.value) === null || _b === void 0 ? void 0 : _b.localId) === localId) {
                        closeCaptionModal();
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// ─── Caption Modal ────────────────────────────────────────────────────────
function openCaptionModal(image) {
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
function confirmImageInsert() {
    return __awaiter(this, void 0, void 0, function () {
        var nextCaption;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedImage.value)
                        return [2 /*return*/];
                    nextCaption = captionDraft.value.trim() || selectedImage.value.filename;
                    imageDrafts.value = imageDrafts.value.map(function (draft) {
                        var _a;
                        return draft.localId === ((_a = selectedImage.value) === null || _a === void 0 ? void 0 : _a.localId)
                            ? __assign(__assign({}, draft), { captionDraft: nextCaption }) : draft;
                    });
                    return [4 /*yield*/, insertImageMarkdown(selectedImage.value.filename, nextCaption)];
                case 1:
                    _a.sent();
                    closeCaptionModal();
                    // Content changed programmatically — trigger autosave
                    markContentDirty();
                    return [2 /*return*/];
            }
        });
    });
}
// ─── Discard Draft ────────────────────────────────────────────────────────
function discardDraft() {
    return __awaiter(this, void 0, void 0, function () {
        var currentDraftId, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    discarding.value = true;
                    discardAlertOpen.value = false;
                    if (autosaveTimer !== null) {
                        clearTimeout(autosaveTimer);
                        autosaveTimer = null;
                    }
                    pendingAutosaveContent = null;
                    setContentSaving(pendingSaveKey(), false);
                    clearDraftInitError(pendingSaveKey());
                    currentDraftId = draftId.value;
                    draftId.value = '';
                    if (!currentDraftId) return [3 /*break*/, 4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, abandonDraft({ draftId: currentDraftId })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4:
                    discarding.value = false;
                    return [4 /*yield*/, router.replace("/entry/".concat(pathId.value, "/").concat(entryId.value))];
                case 5:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// ─── Commit ───────────────────────────────────────────────────────────────
/** Human-readable label for the pending-save badge. */
function buildPendingSaveLabel() {
    var _a, _b, _c, _d;
    var pathTitle = (_b = (_a = path.value) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : pathId.value;
    var entryDay = (_d = (_c = entry.value) === null || _c === void 0 ? void 0 : _c.day) !== null && _d !== void 0 ? _d : '';
    return entryDay ? "".concat(pathTitle, " \u2014 ").concat(entryDay) : pathTitle;
}
/** Key used to identify this draft in the pending-saves store */
function pendingSaveKey() {
    return "edit:".concat(pathId.value, ":").concat(entryId.value);
}
function logCommitFailure(context, err, extra) {
    if (extra === void 0) { extra = {}; }
    var response = err && typeof err === 'object' && 'response' in err
        ? err.response
        : undefined;
    console.error("[EntryEditView] ".concat(context), __assign({ status: response === null || response === void 0 ? void 0 : response.status, response: response === null || response === void 0 ? void 0 : response.data, draftId: draftId.value || null, pathId: pathId.value || null, entryId: entryId.value || null, imageStates: imageDrafts.value.map(function (image) { return ({
            filename: image.filename,
            status: image.status,
            draftImageId: image.draftImageId,
            removed: image.removed,
            error: image.error || null,
        }); }) }, extra));
}
function acknowledgeCommitFailure() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    commitFailDialogOpen.value = false;
                    if (!commitFailWillRetry.value)
                        return [2 /*return*/];
                    backgroundCommitDelegated.value = true;
                    return [4 /*yield*/, router.replace("/entry/".concat(pathId.value, "/").concat(entryId.value))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Core commit logic shared between the initial attempt and background retries
 * (via enqueue). Throws on failure.
 */
function executeCommit() {
    return __awaiter(this, void 0, void 0, function () {
        var finalContent, _a;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!!draftId.value) return [3 /*break*/, 2];
                    return [4 /*yield*/, initEditDraft((_c = (_b = entry.value) === null || _b === void 0 ? void 0 : _b.edit_id) !== null && _c !== void 0 ? _c : 0)];
                case 1:
                    _d.sent();
                    if (!draftId.value) {
                        throw new Error('Could not start a draft. Please check your connection and try again.');
                    }
                    _d.label = 2;
                case 2:
                    imageDrafts.value = (0, entryImageDrafts_1.syncDraftCaptionsFromContent)(imageDrafts.value, content.value);
                    finalContent = content.value;
                    if (!(finalContent !== lastSavedContent)) return [3 /*break*/, 4];
                    return [4 /*yield*/, patchDraft({
                            draftId: draftId.value,
                            data: { content: finalContent },
                        })];
                case 3:
                    _d.sent();
                    lastSavedContent = finalContent;
                    _d.label = 4;
                case 4: return [4 /*yield*/, commitDraftApi({ draftId: draftId.value })];
                case 5:
                    _d.sent();
                    return [4 /*yield*/, Promise.all([
                            queryClient.invalidateQueries({
                                queryKey: ['v1', 'paths', pathId.value, 'entries'],
                            }),
                            queryClient.invalidateQueries({
                                queryKey: ['v1', 'paths', pathId.value, 'entries', entryId.value],
                            }),
                        ])];
                case 6:
                    _d.sent();
                    _d.label = 7;
                case 7:
                    _d.trys.push([7, 10, , 11]);
                    return [4 /*yield*/, db_1.db.entryContent.delete("".concat(pathId.value, ":").concat(entryId.value))];
                case 8:
                    _d.sent();
                    return [4 /*yield*/, db_1.db.entryImages.where('entry_id').equals(entryId.value).delete()];
                case 9:
                    _d.sent();
                    return [3 /*break*/, 11];
                case 10:
                    _a = _d.sent();
                    return [3 /*break*/, 11];
                case 11:
                    clearSavedNotification();
                    clearDraftInitError(pendingSaveKey());
                    draftId.value = '';
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Flush the current content to the server draft and navigate back without
 * committing (publishing) the entry.  Preserves the draft so the user can
 * return and continue editing later.
 */
function saveDraftAndNavigateBack() {
    return __awaiter(this, void 0, void 0, function () {
        var contentToSave, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (savingDraft.value || committing.value || !draftId.value)
                        return [2 /*return*/];
                    savingDraft.value = true;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, 7, 8]);
                    // Cancel pending debounce timer.
                    if (autosaveTimer !== null) {
                        clearTimeout(autosaveTimer);
                        autosaveTimer = null;
                    }
                    if (!autosaveFlushPromise) return [3 /*break*/, 3];
                    return [4 /*yield*/, autosaveFlushPromise];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    contentToSave = pendingAutosaveContent !== null && pendingAutosaveContent !== void 0 ? pendingAutosaveContent : content.value;
                    if (!(contentToSave !== lastSavedContent)) return [3 /*break*/, 5];
                    return [4 /*yield*/, patchDraft({
                            draftId: draftId.value,
                            data: { content: contentToSave },
                        })];
                case 4:
                    _b.sent();
                    lastSavedContent = contentToSave;
                    _b.label = 5;
                case 5:
                    pendingAutosaveContent = null;
                    setContentSaving(pendingSaveKey(), false);
                    return [3 /*break*/, 8];
                case 6:
                    _a = _b.sent();
                    return [3 /*break*/, 8];
                case 7:
                    savingDraft.value = false;
                    return [7 /*endfinally*/];
                case 8:
                    // Prevent the onBeforeUnmount hook from abandoning the draft.
                    backgroundCommitDelegated.value = true;
                    router.back();
                    return [2 /*return*/];
            }
        });
    });
}
function commitDraft() {
    return __awaiter(this, void 0, void 0, function () {
        var finalContent, err_3, status_2, detail, message, willRetry;
        var _this = this;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!canCommit.value)
                        return [2 /*return*/];
                    committing.value = true;
                    commitError.value = '';
                    finalContent = content.value;
                    backgroundCommitDelegated.value = false;
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 8, 12, 13]);
                    // Cancel any pending debounce timer and flush any in-flight / pending autosave
                    if (autosaveTimer !== null) {
                        clearTimeout(autosaveTimer);
                        autosaveTimer = null;
                    }
                    if (!(autosaveInFlight || pendingAutosaveContent !== null)) return [3 /*break*/, 5];
                    if (!autosaveFlushPromise) return [3 /*break*/, 3];
                    return [4 /*yield*/, autosaveFlushPromise];
                case 2:
                    _f.sent();
                    _f.label = 3;
                case 3:
                    if (!(pendingAutosaveContent !== null &&
                        pendingAutosaveContent !== lastSavedContent)) return [3 /*break*/, 5];
                    return [4 /*yield*/, flushContentAutosave()];
                case 4:
                    _f.sent();
                    _f.label = 5;
                case 5:
                    finalContent = content.value;
                    return [4 /*yield*/, executeCommit()];
                case 6:
                    _f.sent();
                    removePendingSave(pendingSaveKey(), true);
                    backgroundCommitDelegated.value = false;
                    return [4 /*yield*/, router.replace("/entry/".concat(pathId.value, "/").concat(entryId.value))];
                case 7:
                    _f.sent();
                    return [3 /*break*/, 13];
                case 8:
                    err_3 = _f.sent();
                    status_2 = err_3 && typeof err_3 === 'object' && 'response' in err_3
                        ? (_a = err_3.response) === null || _a === void 0 ? void 0 : _a.status
                        : undefined;
                    if (!(status_2 === 409)) return [3 /*break*/, 10];
                    return [4 /*yield*/, openConflictModal(finalContent !== null && finalContent !== void 0 ? finalContent : content.value)];
                case 9:
                    _f.sent();
                    return [3 /*break*/, 11];
                case 10:
                    detail = status_2 === 422
                        ? (_c = (_b = err_3
                            .response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.detail
                        : undefined;
                    message = void 0;
                    willRetry = status_2 !== 422;
                    if (status_2 === 422) {
                        if ((detail === null || detail === void 0 ? void 0 : detail.code) === 'images_not_ready') {
                            message = hasFailedImages.value
                                ? 'One or more images failed to finish processing. Remove or retry them before saving.'
                                : 'Some images are still uploading or processing. Please wait a moment, then try saving again.';
                        }
                        else {
                            message =
                                (_d = (0, errors_1.extractErrorMessage)(err_3)) !== null && _d !== void 0 ? _d : 'Failed to save. Please try again.';
                        }
                    }
                    else {
                        message =
                            (_e = (0, errors_1.extractErrorMessage)(err_3)) !== null && _e !== void 0 ? _e : 'Failed to save. Please try again.';
                    }
                    logCommitFailure('manual commit failed', err_3, { willRetry: willRetry });
                    commitFailDialogMessage.value = message;
                    commitFailWillRetry.value = willRetry;
                    commitFailDialogOpen.value = true;
                    if (willRetry) {
                        // Hand off to useApi for background retries with automatic back-off
                        registerPendingSave(pendingSaveKey(), buildPendingSaveLabel());
                        enqueue({
                            id: "commit-entry:".concat(pendingSaveKey()),
                            label: buildPendingSaveLabel(),
                            execute: function () { return __awaiter(_this, void 0, void 0, function () {
                                var retryErr_1, retryStatus, shouldNavigate;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _b.trys.push([0, 2, , 5]);
                                            return [4 /*yield*/, executeCommit()];
                                        case 1:
                                            _b.sent();
                                            return [3 /*break*/, 5];
                                        case 2:
                                            retryErr_1 = _b.sent();
                                            retryStatus = retryErr_1 &&
                                                typeof retryErr_1 === 'object' &&
                                                'response' in retryErr_1
                                                ? (_a = retryErr_1.response) === null || _a === void 0 ? void 0 : _a.status
                                                : undefined;
                                            if (!(retryStatus === 409)) return [3 /*break*/, 4];
                                            // Conflict on retry — surface the conflict modal and stop retrying
                                            removePendingSave(pendingSaveKey(), false);
                                            return [4 /*yield*/, openConflictModal(content.value)];
                                        case 3:
                                            _b.sent();
                                            return [2 /*return*/]; // Don't re-throw so enqueue doesn't schedule further retries
                                        case 4:
                                            logCommitFailure('background commit retry failed', retryErr_1);
                                            throw retryErr_1; // Let enqueue handle retry/abandon
                                        case 5:
                                            removePendingSave(pendingSaveKey(), true);
                                            shouldNavigate = !backgroundCommitDelegated.value;
                                            backgroundCommitDelegated.value = false;
                                            if (!shouldNavigate) return [3 /*break*/, 7];
                                            return [4 /*yield*/, router.replace("/entry/".concat(pathId.value, "/").concat(entryId.value))];
                                        case 6:
                                            _b.sent();
                                            _b.label = 7;
                                        case 7: return [2 /*return*/];
                                    }
                                });
                            }); },
                        });
                    }
                    else {
                        removePendingSave(pendingSaveKey(), false);
                    }
                    _f.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    committing.value = false;
                    return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    });
}
// ─── Conflict Resolution ──────────────────────────────────────────────────
function openConflictModal(localContent) {
    return __awaiter(this, void 0, void 0, function () {
        var response, remoteEntry, _a;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    conflictLocalContent.value = localContent;
                    conflictRemoteContent.value = '';
                    conflictRemoteEditId = 0;
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, apiClient_1.getEntry)(pathId.value, entryId.value)];
                case 2:
                    response = _d.sent();
                    if (response.status === 200) {
                        remoteEntry = response.data;
                        conflictRemoteContent.value = (_b = remoteEntry.content) !== null && _b !== void 0 ? _b : '';
                        conflictRemoteEditId = (_c = remoteEntry.edit_id) !== null && _c !== void 0 ? _c : 0;
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _d.sent();
                    return [3 /*break*/, 4];
                case 4:
                    isConflictModalOpen.value = true;
                    return [2 /*return*/];
            }
        });
    });
}
function resolveConflict(choice) {
    return __awaiter(this, void 0, void 0, function () {
        var chosenContent, _a, newEditId, response, newDraft, _b, err_4;
        var _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    resolvingConflict.value = true;
                    commitError.value = '';
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 17, 18, 19]);
                    chosenContent = choice === 'local'
                        ? conflictLocalContent.value
                        : conflictRemoteContent.value;
                    if (!draftId.value) return [3 /*break*/, 6];
                    _f.label = 2;
                case 2:
                    _f.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, abandonDraft({ draftId: draftId.value })];
                case 3:
                    _f.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _f.sent();
                    return [3 /*break*/, 5];
                case 5:
                    draftId.value = '';
                    _f.label = 6;
                case 6:
                    newEditId = conflictRemoteEditId || ((_d = (_c = entry.value) === null || _c === void 0 ? void 0 : _c.edit_id) !== null && _d !== void 0 ? _d : 0);
                    return [4 /*yield*/, (0, apiClient_1.startEditEntryDraft)(pathId.value, entryId.value, {
                            based_on_edit_id: newEditId,
                        })];
                case 7:
                    response = _f.sent();
                    if (response.status !== 200)
                        throw new Error('Failed to re-open draft.');
                    newDraft = response.data;
                    draftId.value = String(newDraft.id);
                    // Patch with the chosen content
                    return [4 /*yield*/, patchDraft({
                            draftId: draftId.value,
                            data: { content: chosenContent },
                        })];
                case 8:
                    // Patch with the chosen content
                    _f.sent();
                    lastSavedContent = chosenContent;
                    // Commit
                    return [4 /*yield*/, commitDraftApi({ draftId: draftId.value })];
                case 9:
                    // Commit
                    _f.sent();
                    return [4 /*yield*/, Promise.all([
                            queryClient.invalidateQueries({
                                queryKey: ['v1', 'paths', pathId.value, 'entries'],
                            }),
                            queryClient.invalidateQueries({
                                queryKey: ['v1', 'paths', pathId.value, 'entries', entryId.value],
                            }),
                        ])];
                case 10:
                    _f.sent();
                    _f.label = 11;
                case 11:
                    _f.trys.push([11, 14, , 15]);
                    return [4 /*yield*/, db_1.db.entryContent.delete("".concat(pathId.value, ":").concat(entryId.value))];
                case 12:
                    _f.sent();
                    return [4 /*yield*/, db_1.db.entryImages.where('entry_id').equals(entryId.value).delete()];
                case 13:
                    _f.sent();
                    return [3 /*break*/, 15];
                case 14:
                    _b = _f.sent();
                    return [3 /*break*/, 15];
                case 15:
                    draftId.value = '';
                    isConflictModalOpen.value = false;
                    return [4 /*yield*/, router.replace("/entry/".concat(pathId.value, "/").concat(entryId.value))];
                case 16:
                    _f.sent();
                    return [3 /*break*/, 19];
                case 17:
                    err_4 = _f.sent();
                    commitError.value =
                        (_e = (0, errors_1.extractErrorMessage)(err_4)) !== null && _e !== void 0 ? _e : 'Failed to resolve conflict. Please try again.';
                    isConflictModalOpen.value = false;
                    return [3 /*break*/, 19];
                case 18:
                    resolvingConflict.value = false;
                    return [7 /*endfinally*/];
                case 19: return [2 /*return*/];
            }
        });
    });
}
// ─── Cleanup ─────────────────────────────────────────────────────────────
// When connectivity is restored, clear the offline flag and flush any
// pending autosave.  useApi owns the single online/offline listener.
(0, vue_2.watch)(isOnline, function (online) {
    var _a;
    if (online) {
        autosaveOffline.value = false;
        if (!draftId.value && entry.value && !draftInitConflict.value) {
            void initEditDraft((_a = entry.value.edit_id) !== null && _a !== void 0 ? _a : 0);
        }
        else if (content.value && content.value !== lastSavedContent) {
            markContentDirty();
        }
    }
});
(0, vue_2.onMounted)(function () {
    // intentionally empty — online/offline handled via watch(isOnline)
});
(0, vue_2.onBeforeUnmount)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _i, _a, draft, contentToFlush, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (autosaveTimer !== null)
                    clearTimeout(autosaveTimer);
                if (draftInitRetryTimer !== null)
                    clearTimeout(draftInitRetryTimer);
                if (!backgroundCommitDelegated.value && draftImageRefreshTimer !== null) {
                    clearTimeout(draftImageRefreshTimer);
                }
                for (_i = 0, _a = imageDrafts.value; _i < _a.length; _i++) {
                    draft = _a[_i];
                    (0, entryImageDrafts_1.revokeDraftPreviewUrl)(draft);
                }
                if (backgroundCommitDelegated.value) {
                    return [2 /*return*/];
                }
                // Deregister any pending save entry (not succeeded — just navigating away)
                removePendingSave(pendingSaveKey(), false);
                setContentSaving(pendingSaveKey(), false);
                clearDraftInitError(pendingSaveKey());
                if (!draftId.value) return [3 /*break*/, 7];
                _d.label = 1;
            case 1:
                _d.trys.push([1, 6, , 7]);
                if (!autosaveFlushPromise) return [3 /*break*/, 3];
                return [4 /*yield*/, autosaveFlushPromise];
            case 2:
                _d.sent();
                _d.label = 3;
            case 3:
                contentToFlush = pendingAutosaveContent !== null && pendingAutosaveContent !== void 0 ? pendingAutosaveContent : content.value;
                if (!(contentToFlush !== null && contentToFlush !== lastSavedContent)) return [3 /*break*/, 5];
                return [4 /*yield*/, patchDraft({
                        draftId: draftId.value,
                        data: { content: contentToFlush },
                    })];
            case 4:
                _d.sent();
                _d.label = 5;
            case 5: return [3 /*break*/, 7];
            case 6:
                _b = _d.sent();
                return [3 /*break*/, 7];
            case 7:
                if (!draftId.value) return [3 /*break*/, 11];
                _d.label = 8;
            case 8:
                _d.trys.push([8, 10, , 11]);
                return [4 /*yield*/, abandonDraft({ draftId: draftId.value })];
            case 9:
                _d.sent();
                return [3 /*break*/, 11];
            case 10:
                _c = _d.sent();
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_withDefaultsArg = (function (t) { return t; })({
    _openConflictOnMount: false,
});
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
var __VLS_0 = {}.IonPage;
/** @type {[typeof __VLS_components.IonPage, typeof __VLS_components.ionPage, typeof __VLS_components.IonPage, typeof __VLS_components.ionPage, ]} */ ;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_4 = {};
__VLS_3.slots.default;
var __VLS_5 = {}.IonHeader;
/** @type {[typeof __VLS_components.IonHeader, typeof __VLS_components.ionHeader, typeof __VLS_components.IonHeader, typeof __VLS_components.ionHeader, ]} */ ;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({}));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_6), false));
__VLS_8.slots.default;
var __VLS_9 = {}.IonToolbar;
/** @type {[typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, ]} */ ;
// @ts-ignore
var __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({}));
var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_10), false));
__VLS_12.slots.default;
var __VLS_13 = {}.IonButtons;
/** @type {[typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, ]} */ ;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    slot: "start",
}));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([{
        slot: "start",
    }], __VLS_functionalComponentArgsRest(__VLS_14), false));
__VLS_16.slots.default;
var __VLS_17 = {}.IonBackButton;
/** @type {[typeof __VLS_components.IonBackButton, typeof __VLS_components.ionBackButton, ]} */ ;
// @ts-ignore
var __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    defaultHref: ("/entry/".concat(__VLS_ctx.pathId, "/").concat(__VLS_ctx.entryId)),
}));
var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([{
        defaultHref: ("/entry/".concat(__VLS_ctx.pathId, "/").concat(__VLS_ctx.entryId)),
    }], __VLS_functionalComponentArgsRest(__VLS_18), false));
var __VLS_16;
var __VLS_21 = {}.IonTitle;
/** @type {[typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, ]} */ ;
// @ts-ignore
var __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({}));
var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_22), false));
__VLS_24.slots.default;
if (__VLS_ctx.path && __VLS_ctx.entry) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "edit-path-dot" }, { style: ({ backgroundColor: __VLS_ctx.path.color }) }));
    (__VLS_ctx.path.title);
    (__VLS_ctx.formattedEntryDay);
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
var __VLS_24;
var __VLS_25 = {}.IonButtons;
/** @type {[typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, ]} */ ;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    slot: "end",
}));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([{
        slot: "end",
    }], __VLS_functionalComponentArgsRest(__VLS_26), false));
__VLS_28.slots.default;
var __VLS_29 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29(__assign({ 'onClick': {} }, { fill: "outline", color: "danger", disabled: (__VLS_ctx.committing || __VLS_ctx.resolvingConflict || __VLS_ctx.discarding) })));
var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { fill: "outline", color: "danger", disabled: (__VLS_ctx.committing || __VLS_ctx.resolvingConflict || __VLS_ctx.discarding) })], __VLS_functionalComponentArgsRest(__VLS_30), false));
var __VLS_33;
var __VLS_34;
var __VLS_35;
var __VLS_36 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.discardAlertOpen = true;
    }
};
__VLS_32.slots.default;
var __VLS_32;
var __VLS_37 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37(__assign({ 'onClick': {} }, { fill: "outline", disabled: (__VLS_ctx.savingDraft || __VLS_ctx.committing || !__VLS_ctx.draftId) })));
var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { fill: "outline", disabled: (__VLS_ctx.savingDraft || __VLS_ctx.committing || !__VLS_ctx.draftId) })], __VLS_functionalComponentArgsRest(__VLS_38), false));
var __VLS_41;
var __VLS_42;
var __VLS_43;
var __VLS_44 = {
    onClick: (__VLS_ctx.saveDraftAndNavigateBack)
};
__VLS_40.slots.default;
(__VLS_ctx.savingDraft ? 'Saving…' : 'Save Draft');
var __VLS_40;
var __VLS_45 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45(__assign({ 'onClick': {} }, { disabled: (__VLS_ctx.committing || !__VLS_ctx.canCommit) })));
var __VLS_47 = __VLS_46.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { disabled: (__VLS_ctx.committing || !__VLS_ctx.canCommit) })], __VLS_functionalComponentArgsRest(__VLS_46), false));
var __VLS_49;
var __VLS_50;
var __VLS_51;
var __VLS_52 = {
    onClick: (__VLS_ctx.commitDraft)
};
__VLS_48.slots.default;
(__VLS_ctx.committing ? 'Publishing…' : 'Publish');
var __VLS_48;
var __VLS_28;
var __VLS_12;
var __VLS_8;
var __VLS_53 = {}.IonContent;
/** @type {[typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, ]} */ ;
// @ts-ignore
var __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53(__assign({ class: "entry-editor-content" })));
var __VLS_55 = __VLS_54.apply(void 0, __spreadArray([__assign({ class: "entry-editor-content" })], __VLS_functionalComponentArgsRest(__VLS_54), false));
__VLS_56.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "entry-form" }));
if (!__VLS_ctx.entry) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "edit-loading" }));
}
else {
    if (__VLS_ctx.draftInitConflict) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "edit-conflict-banner" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "edit-conflict-banner-title" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "edit-conflict-banner-body" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "edit-conflict-banner-actions" }));
        var __VLS_57 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57(__assign({ 'onClick': {} }, { fill: "outline" })));
        var __VLS_59 = __VLS_58.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { fill: "outline" })], __VLS_functionalComponentArgsRest(__VLS_58), false));
        var __VLS_61 = void 0;
        var __VLS_62 = void 0;
        var __VLS_63 = void 0;
        var __VLS_64 = {
            onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(!__VLS_ctx.entry))
                    return;
                if (!(__VLS_ctx.draftInitConflict))
                    return;
                __VLS_ctx.$router.back();
            }
        };
        __VLS_60.slots.default;
        var __VLS_60;
        var __VLS_65 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65(__assign({ 'onClick': {} })));
        var __VLS_67 = __VLS_66.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_66), false));
        var __VLS_69 = void 0;
        var __VLS_70 = void 0;
        var __VLS_71 = void 0;
        var __VLS_72 = {
            onClick: (__VLS_ctx.loadRemoteAndContinue)
        };
        __VLS_68.slots.default;
        var __VLS_68;
    }
    /** @type {[typeof EntryEditorPanel, ]} */ ;
    // @ts-ignore
    var __VLS_73 = __VLS_asFunctionalComponent(EntryEditorPanel_vue_1.default, new EntryEditorPanel_vue_1.default(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ 'onUpdate:content': {} }, { 'onUpdate:contentTab': {} }), { 'onUpdate:captionDraft': {} }), { 'onTextareaInput': {} }), { 'onRememberSelection': {} }), { 'onOpenImagePicker': {} }), { 'onImageSelected': {} }), { 'onCloseCommitFail': {} }), { 'onAcknowledgeCommitFailure': {} }), { 'onCloseCaption': {} }), { 'onConfirmImageInsert': {} }), { 'onOpenCaption': {} }), { 'onRemoveImage': {} }), { bindTextareaRef: (__VLS_ctx.bindTextareaRef), bindImageInputRef: (__VLS_ctx.bindImageInputRef), content: (__VLS_ctx.content), contentTab: (__VLS_ctx.contentTab), committing: (__VLS_ctx.committing), autosaveOffline: (__VLS_ctx.autosaveOffline), uploadDisabled: (__VLS_ctx.committing || !__VLS_ctx.draftId || __VLS_ctx.autosaveOffline), uploadButtonTitle: (__VLS_ctx.autosaveOffline
            ? 'Image upload is unavailable while offline'
            : undefined), imageError: (__VLS_ctx.imageError), attachedImages: (__VLS_ctx.attachedImages), localImageUrls: (__VLS_ctx.localImageUrls), imageDrafts: (__VLS_ctx.imageDrafts), selectedImage: (__VLS_ctx.selectedImage), isCaptionModalOpen: (__VLS_ctx.isCaptionModalOpen), captionDraft: (__VLS_ctx.captionDraft), commitFailDialogOpen: (__VLS_ctx.commitFailDialogOpen), commitFailDialogMessage: (__VLS_ctx.commitFailDialogMessage), commitFailWillRetry: (__VLS_ctx.commitFailWillRetry) })));
    var __VLS_74 = __VLS_73.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ 'onUpdate:content': {} }, { 'onUpdate:contentTab': {} }), { 'onUpdate:captionDraft': {} }), { 'onTextareaInput': {} }), { 'onRememberSelection': {} }), { 'onOpenImagePicker': {} }), { 'onImageSelected': {} }), { 'onCloseCommitFail': {} }), { 'onAcknowledgeCommitFailure': {} }), { 'onCloseCaption': {} }), { 'onConfirmImageInsert': {} }), { 'onOpenCaption': {} }), { 'onRemoveImage': {} }), { bindTextareaRef: (__VLS_ctx.bindTextareaRef), bindImageInputRef: (__VLS_ctx.bindImageInputRef), content: (__VLS_ctx.content), contentTab: (__VLS_ctx.contentTab), committing: (__VLS_ctx.committing), autosaveOffline: (__VLS_ctx.autosaveOffline), uploadDisabled: (__VLS_ctx.committing || !__VLS_ctx.draftId || __VLS_ctx.autosaveOffline), uploadButtonTitle: (__VLS_ctx.autosaveOffline
                ? 'Image upload is unavailable while offline'
                : undefined), imageError: (__VLS_ctx.imageError), attachedImages: (__VLS_ctx.attachedImages), localImageUrls: (__VLS_ctx.localImageUrls), imageDrafts: (__VLS_ctx.imageDrafts), selectedImage: (__VLS_ctx.selectedImage), isCaptionModalOpen: (__VLS_ctx.isCaptionModalOpen), captionDraft: (__VLS_ctx.captionDraft), commitFailDialogOpen: (__VLS_ctx.commitFailDialogOpen), commitFailDialogMessage: (__VLS_ctx.commitFailDialogMessage), commitFailWillRetry: (__VLS_ctx.commitFailWillRetry) })], __VLS_functionalComponentArgsRest(__VLS_73), false));
    var __VLS_76 = void 0;
    var __VLS_77 = void 0;
    var __VLS_78 = void 0;
    var __VLS_79 = {
        'onUpdate:content': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!!(!__VLS_ctx.entry))
                return;
            __VLS_ctx.content = $event;
        }
    };
    var __VLS_80 = {
        'onUpdate:contentTab': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!!(!__VLS_ctx.entry))
                return;
            __VLS_ctx.contentTab = $event;
        }
    };
    var __VLS_81 = {
        'onUpdate:captionDraft': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!!(!__VLS_ctx.entry))
                return;
            __VLS_ctx.captionDraft = $event;
        }
    };
    var __VLS_82 = {
        onTextareaInput: (__VLS_ctx.onTextareaInput)
    };
    var __VLS_83 = {
        onRememberSelection: (__VLS_ctx.rememberSelection)
    };
    var __VLS_84 = {
        onOpenImagePicker: (__VLS_ctx.openImagePicker)
    };
    var __VLS_85 = {
        onImageSelected: (__VLS_ctx.onImageSelected)
    };
    var __VLS_86 = {
        onCloseCommitFail: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!!(!__VLS_ctx.entry))
                return;
            __VLS_ctx.commitFailDialogOpen = false;
        }
    };
    var __VLS_87 = {
        onAcknowledgeCommitFailure: (__VLS_ctx.acknowledgeCommitFailure)
    };
    var __VLS_88 = {
        onCloseCaption: (__VLS_ctx.closeCaptionModal)
    };
    var __VLS_89 = {
        onConfirmImageInsert: (__VLS_ctx.confirmImageInsert)
    };
    var __VLS_90 = {
        onOpenCaption: (__VLS_ctx.openCaptionModal)
    };
    var __VLS_91 = {
        onRemoveImage: (__VLS_ctx.removeImage)
    };
    var __VLS_75;
}
var __VLS_56;
var __VLS_92 = {}.IonAlert;
/** @type {[typeof __VLS_components.IonAlert, typeof __VLS_components.ionAlert, ]} */ ;
// @ts-ignore
var __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92(__assign({ 'onDidDismiss': {} }, { isOpen: (__VLS_ctx.discardAlertOpen), header: "Discard draft?", message: "Your unsaved changes will be lost. This cannot be undone.", buttons: ([
        {
            text: 'Cancel',
            role: 'cancel',
            handler: function () {
                __VLS_ctx.discardAlertOpen = false;
            },
        },
        { text: 'Discard', role: 'destructive', handler: __VLS_ctx.discardDraft },
    ]) })));
var __VLS_94 = __VLS_93.apply(void 0, __spreadArray([__assign({ 'onDidDismiss': {} }, { isOpen: (__VLS_ctx.discardAlertOpen), header: "Discard draft?", message: "Your unsaved changes will be lost. This cannot be undone.", buttons: ([
            {
                text: 'Cancel',
                role: 'cancel',
                handler: function () {
                    __VLS_ctx.discardAlertOpen = false;
                },
            },
            { text: 'Discard', role: 'destructive', handler: __VLS_ctx.discardDraft },
        ]) })], __VLS_functionalComponentArgsRest(__VLS_93), false));
var __VLS_96;
var __VLS_97;
var __VLS_98;
var __VLS_99 = {
    onDidDismiss: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.discardAlertOpen = false;
    }
};
var __VLS_95;
var __VLS_100 = {}.IonModal;
/** @type {[typeof __VLS_components.IonModal, typeof __VLS_components.ionModal, typeof __VLS_components.IonModal, typeof __VLS_components.ionModal, ]} */ ;
// @ts-ignore
var __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    isOpen: (__VLS_ctx.isConflictModalOpen),
    canDismiss: (false),
}));
var __VLS_102 = __VLS_101.apply(void 0, __spreadArray([{
        isOpen: (__VLS_ctx.isConflictModalOpen),
        canDismiss: (false),
    }], __VLS_functionalComponentArgsRest(__VLS_101), false));
__VLS_103.slots.default;
var __VLS_104 = {}.IonHeader;
/** @type {[typeof __VLS_components.IonHeader, typeof __VLS_components.ionHeader, typeof __VLS_components.IonHeader, typeof __VLS_components.ionHeader, ]} */ ;
// @ts-ignore
var __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({}));
var __VLS_106 = __VLS_105.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_105), false));
__VLS_107.slots.default;
var __VLS_108 = {}.IonToolbar;
/** @type {[typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, ]} */ ;
// @ts-ignore
var __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({}));
var __VLS_110 = __VLS_109.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_109), false));
__VLS_111.slots.default;
var __VLS_112 = {}.IonTitle;
/** @type {[typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, ]} */ ;
// @ts-ignore
var __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({}));
var __VLS_114 = __VLS_113.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_113), false));
__VLS_115.slots.default;
var __VLS_115;
var __VLS_111;
var __VLS_107;
var __VLS_116 = {}.IonContent;
/** @type {[typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, ]} */ ;
// @ts-ignore
var __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116(__assign({ class: "ion-padding conflict-modal-content" })));
var __VLS_118 = __VLS_117.apply(void 0, __spreadArray([__assign({ class: "ion-padding conflict-modal-content" })], __VLS_functionalComponentArgsRest(__VLS_117), false));
__VLS_119.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "conflict-description" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "conflict-versions" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "conflict-version" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)(__assign({ class: "conflict-version-title" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "conflict-version-body" }));
if (__VLS_ctx.conflictLocalContent) {
    /** @type {[typeof MarkdownContent, ]} */ ;
    // @ts-ignore
    var __VLS_120 = __VLS_asFunctionalComponent(MarkdownContent_vue_1.default, new MarkdownContent_vue_1.default({
        content: (__VLS_ctx.conflictLocalContent),
        images: ([]),
        localImageUrls: ({}),
    }));
    var __VLS_121 = __VLS_120.apply(void 0, __spreadArray([{
            content: (__VLS_ctx.conflictLocalContent),
            images: ([]),
            localImageUrls: ({}),
        }], __VLS_functionalComponentArgsRest(__VLS_120), false));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "conflict-content-empty" }));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "conflict-version-select" }));
var __VLS_123 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_124 = __VLS_asFunctionalComponent(__VLS_123, new __VLS_123(__assign({ 'onClick': {} }, { expand: "block", fill: "outline", disabled: (__VLS_ctx.resolvingConflict) })));
var __VLS_125 = __VLS_124.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { expand: "block", fill: "outline", disabled: (__VLS_ctx.resolvingConflict) })], __VLS_functionalComponentArgsRest(__VLS_124), false));
var __VLS_127;
var __VLS_128;
var __VLS_129;
var __VLS_130 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.resolveConflict('local');
    }
};
__VLS_126.slots.default;
(__VLS_ctx.resolvingConflict ? 'Saving...' : 'Keep mine');
var __VLS_126;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "conflict-version" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)(__assign({ class: "conflict-version-title" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "conflict-version-body" }));
if (__VLS_ctx.conflictRemoteContent) {
    /** @type {[typeof MarkdownContent, ]} */ ;
    // @ts-ignore
    var __VLS_131 = __VLS_asFunctionalComponent(MarkdownContent_vue_1.default, new MarkdownContent_vue_1.default({
        content: (__VLS_ctx.conflictRemoteContent),
        images: ([]),
        localImageUrls: ({}),
    }));
    var __VLS_132 = __VLS_131.apply(void 0, __spreadArray([{
            content: (__VLS_ctx.conflictRemoteContent),
            images: ([]),
            localImageUrls: ({}),
        }], __VLS_functionalComponentArgsRest(__VLS_131), false));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "conflict-content-empty" }));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "conflict-version-select" }));
var __VLS_134 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134(__assign({ 'onClick': {} }, { expand: "block", fill: "outline", disabled: (__VLS_ctx.resolvingConflict) })));
var __VLS_136 = __VLS_135.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { expand: "block", fill: "outline", disabled: (__VLS_ctx.resolvingConflict) })], __VLS_functionalComponentArgsRest(__VLS_135), false));
var __VLS_138;
var __VLS_139;
var __VLS_140;
var __VLS_141 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.resolveConflict('remote');
    }
};
__VLS_137.slots.default;
var __VLS_137;
var __VLS_119;
var __VLS_142 = {}.IonFooter;
/** @type {[typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, ]} */ ;
// @ts-ignore
var __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({}));
var __VLS_144 = __VLS_143.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_143), false));
__VLS_145.slots.default;
var __VLS_146 = {}.IonToolbar;
/** @type {[typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, ]} */ ;
// @ts-ignore
var __VLS_147 = __VLS_asFunctionalComponent(__VLS_146, new __VLS_146({}));
var __VLS_148 = __VLS_147.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_147), false));
__VLS_149.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "conflict-actions" }));
var __VLS_150 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_151 = __VLS_asFunctionalComponent(__VLS_150, new __VLS_150(__assign({ 'onClick': {} }, { fill: "outline", disabled: (__VLS_ctx.resolvingConflict) })));
var __VLS_152 = __VLS_151.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { fill: "outline", disabled: (__VLS_ctx.resolvingConflict) })], __VLS_functionalComponentArgsRest(__VLS_151), false));
var __VLS_154;
var __VLS_155;
var __VLS_156;
var __VLS_157 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.resolveConflict('remote');
    }
};
__VLS_153.slots.default;
var __VLS_153;
var __VLS_158 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_159 = __VLS_asFunctionalComponent(__VLS_158, new __VLS_158(__assign({ 'onClick': {} }, { disabled: (__VLS_ctx.resolvingConflict) })));
var __VLS_160 = __VLS_159.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { disabled: (__VLS_ctx.resolvingConflict) })], __VLS_functionalComponentArgsRest(__VLS_159), false));
var __VLS_162;
var __VLS_163;
var __VLS_164;
var __VLS_165 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.resolveConflict('local');
    }
};
__VLS_161.slots.default;
(__VLS_ctx.resolvingConflict ? 'Saving...' : 'Keep mine');
var __VLS_161;
var __VLS_149;
var __VLS_145;
var __VLS_103;
var __VLS_166 = {}.IonFooter;
/** @type {[typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, ]} */ ;
// @ts-ignore
var __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({}));
var __VLS_168 = __VLS_167.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_167), false));
__VLS_169.slots.default;
/** @type {[typeof RefreshStatus, ]} */ ;
// @ts-ignore
var __VLS_170 = __VLS_asFunctionalComponent(RefreshStatus_vue_1.default, new RefreshStatus_vue_1.default({
    statusType: (__VLS_ctx.refreshStatusType),
    statusText: (__VLS_ctx.refreshStatusText),
    lastCheckedAt: (__VLS_ctx.refreshLastCheckedAt),
}));
var __VLS_171 = __VLS_170.apply(void 0, __spreadArray([{
        statusType: (__VLS_ctx.refreshStatusType),
        statusText: (__VLS_ctx.refreshStatusText),
        lastCheckedAt: (__VLS_ctx.refreshLastCheckedAt),
    }], __VLS_functionalComponentArgsRest(__VLS_170), false));
var __VLS_169;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['edit-path-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-editor-content']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-form']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-conflict-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-conflict-banner-title']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-conflict-banner-body']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-conflict-banner-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['ion-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['conflict-modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['conflict-description']} */ ;
/** @type {__VLS_StyleScopedClasses['conflict-versions']} */ ;
/** @type {__VLS_StyleScopedClasses['conflict-version']} */ ;
/** @type {__VLS_StyleScopedClasses['conflict-version-title']} */ ;
/** @type {__VLS_StyleScopedClasses['conflict-version-body']} */ ;
/** @type {__VLS_StyleScopedClasses['conflict-content-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['conflict-version-select']} */ ;
/** @type {__VLS_StyleScopedClasses['conflict-version']} */ ;
/** @type {__VLS_StyleScopedClasses['conflict-version-title']} */ ;
/** @type {__VLS_StyleScopedClasses['conflict-version-body']} */ ;
/** @type {__VLS_StyleScopedClasses['conflict-content-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['conflict-version-select']} */ ;
/** @type {__VLS_StyleScopedClasses['conflict-actions']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            IonPage: vue_1.IonPage,
            IonHeader: vue_1.IonHeader,
            IonToolbar: vue_1.IonToolbar,
            IonTitle: vue_1.IonTitle,
            IonContent: vue_1.IonContent,
            IonFooter: vue_1.IonFooter,
            IonButton: vue_1.IonButton,
            IonButtons: vue_1.IonButtons,
            IonBackButton: vue_1.IonBackButton,
            IonAlert: vue_1.IonAlert,
            IonModal: vue_1.IonModal,
            EntryEditorPanel: EntryEditorPanel_vue_1.default,
            MarkdownContent: MarkdownContent_vue_1.default,
            RefreshStatus: RefreshStatus_vue_1.default,
            pathId: pathId,
            entryId: entryId,
            path: path,
            entry: entry,
            refreshStatusType: refreshStatusType,
            refreshStatusText: refreshStatusText,
            refreshLastCheckedAt: refreshLastCheckedAt,
            content: content,
            contentTab: contentTab,
            committing: committing,
            savingDraft: savingDraft,
            imageError: imageError,
            imageDrafts: imageDrafts,
            isCaptionModalOpen: isCaptionModalOpen,
            captionDraft: captionDraft,
            selectedImage: selectedImage,
            bindTextareaRef: bindTextareaRef,
            bindImageInputRef: bindImageInputRef,
            draftId: draftId,
            draftInitConflict: draftInitConflict,
            autosaveOffline: autosaveOffline,
            commitFailDialogOpen: commitFailDialogOpen,
            commitFailDialogMessage: commitFailDialogMessage,
            commitFailWillRetry: commitFailWillRetry,
            discardAlertOpen: discardAlertOpen,
            discarding: discarding,
            isConflictModalOpen: isConflictModalOpen,
            resolvingConflict: resolvingConflict,
            conflictLocalContent: conflictLocalContent,
            conflictRemoteContent: conflictRemoteContent,
            canCommit: canCommit,
            attachedImages: attachedImages,
            localImageUrls: localImageUrls,
            rememberSelection: rememberSelection,
            onTextareaInput: onTextareaInput,
            formattedEntryDay: formattedEntryDay,
            loadRemoteAndContinue: loadRemoteAndContinue,
            openImagePicker: openImagePicker,
            onImageSelected: onImageSelected,
            removeImage: removeImage,
            openCaptionModal: openCaptionModal,
            closeCaptionModal: closeCaptionModal,
            confirmImageInsert: confirmImageInsert,
            discardDraft: discardDraft,
            acknowledgeCommitFailure: acknowledgeCommitFailure,
            saveDraftAndNavigateBack: saveDraftAndNavigateBack,
            commitDraft: commitDraft,
            resolveConflict: resolveConflict,
        };
    },
    __typeProps: {},
    props: {},
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
