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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>New Entry</ion-title>
        <ion-buttons slot="end">
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

import EntryEditorPanel from '~/src/components/EntryEditorPanel.vue';
import RefreshStatus from '~/src/components/RefreshStatus.vue';
import { useCurrentUser } from '~/src/composables/useCurrentUser';
import { useDraftImageUpload } from '~/src/composables/useDraftImageUpload';
import { useMarkdownEditor } from '~/src/composables/useMarkdownEditor';
import { usePaths } from '~/src/composables/usePaths';
import { usePendingSaves } from '~/src/composables/usePendingSaves';
import { useRefreshStatus } from '~/src/composables/useRefreshStatus';
import { useApi } from '~/src/composables/useApi';
import {
  startCreateEntryDraft,
  getEntryDraft,
  useAbandonEntryDraft,
  usePatchEntryDraft,
  useCommitEntryDraft,
  useRemoveDraftImage,
} from '~/src/generated/apiClient';
import { extractErrorMessage } from '~/src/lib/errors';
import { getPathOrder, isPathHidden } from '~/src/lib/db';
import { removeImageMarkdownReferences } from '~/src/utils/markdown';
import {
  buildLocalImageUrlMap,
  createDraftServerImageDraft,
  createLocalImageDraft,
  getAttachedImageResponses,
  mergeDraftImageFromServer,
  revokeDraftPreviewUrl,
  syncDraftCaptionsFromContent,
  type EntryImageDraft,
} from '~/src/utils/entryImageDrafts';

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

const day = ref(
  String(route.query.date ?? new Date().toISOString().slice(0, 10)),
);
const selectedPathId = ref(String(route.params.pathId ?? ''));
const content = ref('');
const contentTab = ref<'write' | 'preview'>('write');
const committing = ref(false);
const savingDraft = ref(false);
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

/**
 * Core commit logic shared between the initial attempt and background retries
 * (via enqueue). Returns the new entry id on success or throws on failure.
 */
async function executeCommit(): Promise<string | null> {
  const currentDraftId = draftId.value || (await ensureDraft());
  if (!currentDraftId) {
    throw new Error(
      'Could not start a draft. Please check your connection and try again.',
    );
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

  clearSavedNotification();
  clearDraftInitError(pendingSaveKey());
  draftId.value = '';

  return commitResponse.status === 200 ? commitResponse.data.id : null;
}

/**
 * Flush the current content to the server draft and navigate back without
 * committing (publishing) the entry.  This preserves the draft so the user
 * can return and continue editing later.
 */
async function saveDraftAndNavigateBack() {
  if (savingDraft.value || committing.value || !draftId.value) return;
  savingDraft.value = true;
  try {
    // Cancel any pending debounce and await any in-flight autosave.
    if (autosaveTimer !== null) {
      clearTimeout(autosaveTimer);
      autosaveTimer = null;
    }
    if (autosaveFlushPromise) {
      await autosaveFlushPromise;
    }
    // Flush current content if it has changed since the last save.
    if (content.value !== lastSavedContent) {
      await patchDraft({
        draftId: draftId.value,
        data: { content: content.value },
      });
      lastSavedContent = content.value;
    }
  } catch {
    // Best-effort — navigate back regardless so the user isn't stuck.
  } finally {
    savingDraft.value = false;
  }
  // Prevent the onBeforeUnmount hook from abandoning the draft.
  backgroundCommitDelegated.value = true;
  router.back();
}

async function commitDraft() {
  if (!canCommit.value) return;

  // Cancel any pending debounce timer and await any in-flight autosave
  if (autosaveTimer !== null) {
    clearTimeout(autosaveTimer);
    autosaveTimer = null;
  }
  if (autosaveFlushPromise) {
    await autosaveFlushPromise;
  }

  committing.value = true;
  commitError.value = '';
  backgroundCommitDelegated.value = false;

  try {
    const newEntryId = await executeCommit();
    removePendingSave(pendingSaveKey(), true);
    backgroundCommitDelegated.value = false;
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
      message = extractErrorMessage(err) ?? 'Failed to save. Please try again.';
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
          const newEntryId = await executeCommit();
          removePendingSave(pendingSaveKey(), true);
          const shouldNavigate = !backgroundCommitDelegated.value;
          backgroundCommitDelegated.value = false;
          if (shouldNavigate && newEntryId && selectedPathId.value) {
            await router.replace(
              `/entry/${selectedPathId.value}/${newEntryId}`,
            );
          } else if (shouldNavigate) {
            router.back();
          }
        },
      });
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
});

// When connectivity is restored, clear the offline flag and flush any
// unsaved content.  useApi owns the single online/offline listener.
watch(isOnline, (online) => {
  if (online) {
    autosaveOffline.value = false;
    if (content.value && content.value !== lastSavedContent) {
      scheduleContentAutosave();
    }
  }
});

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
/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />

definePageMeta({
    pageTransition: { name: 'ion-forward', mode: 'out-in' },
});
var vue_1 = require("@ionic/vue");
var vue_query_1 = require("@tanstack/vue-query");
var vue_2 = require("vue");
var EntryEditorPanel_vue_1 = require("~/src/components/EntryEditorPanel.vue");
var RefreshStatus_vue_1 = require("~/src/components/RefreshStatus.vue");
var useCurrentUser_1 = require("~/src/composables/useCurrentUser");
var useDraftImageUpload_1 = require("~/src/composables/useDraftImageUpload");
var useMarkdownEditor_1 = require("~/src/composables/useMarkdownEditor");
var usePaths_1 = require("~/src/composables/usePaths");
var usePendingSaves_1 = require("~/src/composables/usePendingSaves");
var useRefreshStatus_1 = require("~/src/composables/useRefreshStatus");
var useApi_1 = require("~/src/composables/useApi");
var apiClient_1 = require("~/src/generated/apiClient");
var errors_1 = require("~/src/lib/errors");
var db_1 = require("~/src/lib/db");
var markdown_1 = require("~/src/utils/markdown");
var entryImageDrafts_1 = require("~/src/utils/entryImageDrafts");
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
var _c = (0, usePaths_1.usePaths)(), paths = _c.data, pathsError = _c.error;
var currentUserId = (0, useCurrentUser_1.useCurrentUser)().currentUserId;
var abandonDraft = (0, apiClient_1.useAbandonEntryDraft)().mutateAsync;
var patchDraft = (0, apiClient_1.usePatchEntryDraft)().mutateAsync;
var commitDraftApi = (0, apiClient_1.useCommitEntryDraft)().mutateAsync;
var removeDraftImageApi = (0, apiClient_1.useRemoveDraftImage)().mutateAsync;
var _d = (0, useDraftImageUpload_1.useDraftImageUpload)(), uploadError = _d.uploadError, uploadDraftImage = _d.uploadDraftImage;
var ownedPaths = (0, vue_2.computed)(function () {
    var _a;
    return ((_a = paths.value) !== null && _a !== void 0 ? _a : []).filter(function (path) { return path.owner_user_id === currentUserId.value; });
});
var pathsErrorMessage = (0, vue_2.computed)(function () { var _a; return (_a = (0, errors_1.extractErrorMessage)(pathsError.value)) !== null && _a !== void 0 ? _a : 'Unable to load paths.'; });
var _e = (0, usePendingSaves_1.usePendingSaves)(), registerPendingSave = _e.registerPendingSave, removePendingSave = _e.removePendingSave, clearSavedNotification = _e.clearSavedNotification, setContentSaving = _e.setContentSaving, registerDraftInitError = _e.registerDraftInitError, clearDraftInitError = _e.clearDraftInitError;
var _f = (0, useApi_1.useApi)(), enqueue = _f.enqueue, isOnline = _f.isOnline;
var _g = (0, useRefreshStatus_1.useRefreshStatus)(), refreshStatusType = _g.statusType, refreshStatusText = _g.statusText, refreshLastCheckedAt = _g.lastCheckedAt;
var day = (0, vue_2.ref)(String((_a = route.query.date) !== null && _a !== void 0 ? _a : new Date().toISOString().slice(0, 10)));
var selectedPathId = (0, vue_2.ref)(String((_b = route.params.pathId) !== null && _b !== void 0 ? _b : ''));
var content = (0, vue_2.ref)('');
var contentTab = (0, vue_2.ref)('write');
var committing = (0, vue_2.ref)(false);
var savingDraft = (0, vue_2.ref)(false);
var commitError = (0, vue_2.ref)('');
var imageError = (0, vue_2.ref)('');
var imageDrafts = (0, vue_2.ref)([]);
/** Server-side draft id — set once the draft has been created */
var draftId = (0, vue_2.ref)('');
/** True when autosave has failed and the device appears to be offline */
var autosaveOffline = (0, vue_2.ref)(false);
/** Timer handle for the content autosave debounce */
var autosaveTimer = null;
/** In-flight flush promise (set while flushContentAutosave is running) */
var autosaveFlushPromise = null;
/** Last content value that was successfully PATCHed to the server */
var lastSavedContent = '';
/** Whether the commit-fail inform dialog is open */
var commitFailDialogOpen = (0, vue_2.ref)(false);
/** Message shown in the commit-fail inform dialog */
var commitFailDialogMessage = (0, vue_2.ref)('');
/** Whether the current commit failure will be retried automatically */
var commitFailWillRetry = (0, vue_2.ref)(true);
var backgroundCommitDelegated = (0, vue_2.ref)(false);
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
var hasBlockingImages = (0, vue_2.computed)(function () {
    return imageDrafts.value.some(function (image) {
        return !image.removed &&
            ['local', 'uploading', 'draft-uploading', 'failed'].includes(image.status);
    });
});
var hasFailedImages = (0, vue_2.computed)(function () {
    return imageDrafts.value.some(function (image) { return !image.removed && image.status === 'failed'; });
});
var canCommit = (0, vue_2.computed)(function () {
    return !!selectedPathId.value &&
        !!day.value &&
        !!content.value.trim() &&
        !hasBlockingImages.value;
});
var attachedImages = (0, vue_2.computed)(function () {
    return (0, entryImageDrafts_1.getAttachedImageResponses)(imageDrafts.value);
});
var localImageUrls = (0, vue_2.computed)(function () { return (0, entryImageDrafts_1.buildLocalImageUrlMap)(imageDrafts.value); });
var _h = (0, useMarkdownEditor_1.useMarkdownEditor)(content, textareaRef, contentTab), _onTextareaInput = _h.onTextareaInput, insertImageMarkdown = _h.insertImageMarkdown, rememberSelection = _h.rememberSelection;
function onTextareaInput(event) {
    _onTextareaInput(event);
    scheduleContentAutosave();
}
// ─── Draft Initialisation ──────────────────────────────────────────────────
/** Whether a background draft-init retry is pending */
var draftInitRetryTimer = null;
function ensureDraft() {
    return __awaiter(this, void 0, void 0, function () {
        var response, draft, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (draftId.value)
                        return [2 /*return*/, draftId.value];
                    if (!selectedPathId.value || !day.value)
                        return [2 /*return*/, null];
                    clearDraftInitError(pendingSaveKey());
                    if (draftInitRetryTimer !== null) {
                        clearTimeout(draftInitRetryTimer);
                        draftInitRetryTimer = null;
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, apiClient_1.startCreateEntryDraft)(selectedPathId.value, {
                            day: day.value,
                        })];
                case 2:
                    response = _c.sent();
                    if (response.status !== 200)
                        throw new Error('Failed to get or create draft.');
                    draft = response.data;
                    draftId.value = String(draft.id);
                    // Restore any previously saved content and images from the server draft
                    if (draft.content) {
                        content.value = draft.content;
                    }
                    lastSavedContent = (_a = draft.content) !== null && _a !== void 0 ? _a : '';
                    if (draft.images && draft.images.length > 0) {
                        imageDrafts.value.forEach(entryImageDrafts_1.revokeDraftPreviewUrl);
                        imageDrafts.value = draft.images.map(function (img) {
                            return (0, entryImageDrafts_1.createDraftServerImageDraft)(img);
                        });
                        imageDrafts.value = (0, entryImageDrafts_1.syncDraftCaptionsFromContent)(imageDrafts.value, content.value);
                    }
                    return [2 /*return*/, draftId.value];
                case 3:
                    err_1 = _c.sent();
                    registerDraftInitError(pendingSaveKey(), (_b = (0, errors_1.extractErrorMessage)(err_1)) !== null && _b !== void 0 ? _b : 'Failed to start draft. Please try again.');
                    // Schedule a background retry
                    draftInitRetryTimer = setTimeout(function () {
                        draftInitRetryTimer = null;
                        void ensureDraft();
                    }, AUTOSAVE_DEBOUNCE_MS);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Watch for path/day changes — abandon any existing draft and create a fresh one
(0, vue_2.watch)([selectedPathId, day], function (_a, _b) { return __awaiter(void 0, [_a, _b], void 0, function (_c, _d) {
    var changed, oldDraftId, _e;
    var pathId = _c[0], dayVal = _c[1];
    var prevPathId = _d[0], prevDay = _d[1];
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                changed = pathId !== prevPathId || dayVal !== prevDay;
                if (!changed || !pathId || !dayVal)
                    return [2 /*return*/];
                if (!draftId.value) return [3 /*break*/, 4];
                oldDraftId = draftId.value;
                draftId.value = '';
                lastSavedContent = '';
                _f.label = 1;
            case 1:
                _f.trys.push([1, 3, , 4]);
                return [4 /*yield*/, abandonDraft({ draftId: oldDraftId })];
            case 2:
                _f.sent();
                return [3 /*break*/, 4];
            case 3:
                _e = _f.sent();
                return [3 /*break*/, 4];
            case 4: return [4 /*yield*/, ensureDraft()];
            case 5:
                _f.sent();
                return [2 /*return*/];
        }
    });
}); });
// ─── Content Autosave ─────────────────────────────────────────────────────
function scheduleContentAutosave() {
    if (!draftId.value)
        return;
    setContentSaving(pendingSaveKey(), true);
    if (autosaveTimer !== null)
        clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(function () {
        autosaveFlushPromise = flushContentAutosave().finally(function () {
            autosaveFlushPromise = null;
        });
    }, AUTOSAVE_DEBOUNCE_MS);
}
function flushContentAutosave() {
    return __awaiter(this, void 0, void 0, function () {
        var currentContent, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    autosaveTimer = null;
                    currentContent = content.value;
                    if (!draftId.value || currentContent === lastSavedContent) {
                        setContentSaving(pendingSaveKey(), false);
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, patchDraft({
                            draftId: draftId.value,
                            data: { content: currentContent },
                        })];
                case 2:
                    _b.sent();
                    lastSavedContent = currentContent;
                    autosaveOffline.value = false;
                    return [3 /*break*/, 5];
                case 3:
                    _a = _b.sent();
                    // Show an offline note if the device appears to be offline
                    if (!navigator.onLine) {
                        autosaveOffline.value = true;
                    }
                    return [3 /*break*/, 5];
                case 4:
                    setContentSaving(pendingSaveKey(), false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// ─── Image Upload ─────────────────────────────────────────────────────────
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
        // Upload each image immediately
        for (var _a = 0, newDrafts_1 = newDrafts; _a < newDrafts_1.length; _a++) {
            var draft = newDrafts_1[_a];
            void uploadImageToDraft(draft.localId, draft.file);
        }
    }
    imageError.value = errors.join('; ');
}
function uploadImageToDraft(localId, file) {
    return __awaiter(this, void 0, void 0, function () {
        var currentDraftId, _a, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = draftId.value;
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, ensureDraft()];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2:
                    currentDraftId = _a;
                    if (!currentDraftId)
                        return [2 /*return*/];
                    // Mark as uploading
                    imageDrafts.value = imageDrafts.value.map(function (d) {
                        return d.localId === localId ? __assign(__assign({}, d), { status: 'uploading' }) : d;
                    });
                    return [4 /*yield*/, uploadDraftImage(currentDraftId, file, localId)];
                case 3:
                    result = _b.sent();
                    if (!result) {
                        imageDrafts.value = imageDrafts.value.map(function (d) {
                            return d.localId === localId
                                ? __assign(__assign({}, d), { status: 'failed', error: uploadError.value }) : d;
                        });
                        return [2 /*return*/];
                    }
                    // Move to draft-uploading (background task processing on server)
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
                    return [2 /*return*/];
            }
        });
    });
}
// ─── Commit ───────────────────────────────────────────────────────────────
/**
 * Build a human-readable label for the pending-save badge.
 * Uses path title + day if available.
 */
function buildPendingSaveLabel() {
    var _a, _b;
    var pathTitle = (_b = (_a = ownedPaths.value.find(function (p) { return p.path_id === selectedPathId.value; })) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : selectedPathId.value;
    return "".concat(pathTitle, " \u2014 ").concat(day.value);
}
/** Key used to identify this draft in the pending-saves store */
function pendingSaveKey() {
    return "create:".concat(selectedPathId.value, ":").concat(day.value);
}
function logCommitFailure(context, err, extra) {
    if (extra === void 0) { extra = {}; }
    var response = err && typeof err === 'object' && 'response' in err
        ? err.response
        : undefined;
    console.error("[EntryCreateView] ".concat(context), __assign({ status: response === null || response === void 0 ? void 0 : response.status, response: response === null || response === void 0 ? void 0 : response.data, draftId: draftId.value || null, pathId: selectedPathId.value || null, day: day.value || null, imageStates: imageDrafts.value.map(function (image) { return ({
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
                    if (!selectedPathId.value) return [3 /*break*/, 2];
                    return [4 /*yield*/, router.replace("/path/".concat(selectedPathId.value))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
                case 2: return [4 /*yield*/, router.replace('/')];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Core commit logic shared between the initial attempt and background retries
 * (via enqueue). Returns the new entry id on success or throws on failure.
 */
function executeCommit() {
    return __awaiter(this, void 0, void 0, function () {
        var currentDraftId, _a, finalContent, commitResponse;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = draftId.value;
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, ensureDraft()];
                case 1:
                    _a = (_b.sent());
                    _b.label = 2;
                case 2:
                    currentDraftId = _a;
                    if (!currentDraftId) {
                        throw new Error('Could not start a draft. Please check your connection and try again.');
                    }
                    imageDrafts.value = (0, entryImageDrafts_1.syncDraftCaptionsFromContent)(imageDrafts.value, content.value);
                    finalContent = content.value;
                    if (!(finalContent !== lastSavedContent)) return [3 /*break*/, 4];
                    return [4 /*yield*/, patchDraft({
                            draftId: currentDraftId,
                            data: { content: finalContent },
                        })];
                case 3:
                    _b.sent();
                    lastSavedContent = finalContent;
                    _b.label = 4;
                case 4: return [4 /*yield*/, commitDraftApi({ draftId: currentDraftId })];
                case 5:
                    commitResponse = _b.sent();
                    return [4 /*yield*/, Promise.all([
                            queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] }),
                            queryClient.invalidateQueries({
                                queryKey: ['v1', 'paths', selectedPathId.value, 'entries'],
                            }),
                        ])];
                case 6:
                    _b.sent();
                    clearSavedNotification();
                    clearDraftInitError(pendingSaveKey());
                    draftId.value = '';
                    return [2 /*return*/, commitResponse.status === 200 ? commitResponse.data.id : null];
            }
        });
    });
}
/**
 * Flush the current content to the server draft and navigate back without
 * committing (publishing) the entry.  This preserves the draft so the user
 * can return and continue editing later.
 */
function saveDraftAndNavigateBack() {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (savingDraft.value || committing.value || !draftId.value)
                        return [2 /*return*/];
                    savingDraft.value = true;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, 7, 8]);
                    // Cancel any pending debounce and await any in-flight autosave.
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
                    if (!(content.value !== lastSavedContent)) return [3 /*break*/, 5];
                    return [4 /*yield*/, patchDraft({
                            draftId: draftId.value,
                            data: { content: content.value },
                        })];
                case 4:
                    _b.sent();
                    lastSavedContent = content.value;
                    _b.label = 5;
                case 5: return [3 /*break*/, 8];
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
        var newEntryId, err_2, status_1, detail, message, willRetry;
        var _this = this;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!canCommit.value)
                        return [2 /*return*/];
                    // Cancel any pending debounce timer and await any in-flight autosave
                    if (autosaveTimer !== null) {
                        clearTimeout(autosaveTimer);
                        autosaveTimer = null;
                    }
                    if (!autosaveFlushPromise) return [3 /*break*/, 2];
                    return [4 /*yield*/, autosaveFlushPromise];
                case 1:
                    _f.sent();
                    _f.label = 2;
                case 2:
                    committing.value = true;
                    commitError.value = '';
                    backgroundCommitDelegated.value = false;
                    _f.label = 3;
                case 3:
                    _f.trys.push([3, 8, 9, 10]);
                    return [4 /*yield*/, executeCommit()];
                case 4:
                    newEntryId = _f.sent();
                    removePendingSave(pendingSaveKey(), true);
                    backgroundCommitDelegated.value = false;
                    if (!(newEntryId && selectedPathId.value)) return [3 /*break*/, 6];
                    return [4 /*yield*/, router.replace("/entry/".concat(selectedPathId.value, "/").concat(newEntryId))];
                case 5:
                    _f.sent();
                    return [3 /*break*/, 7];
                case 6:
                    router.back();
                    _f.label = 7;
                case 7: return [3 /*break*/, 10];
                case 8:
                    err_2 = _f.sent();
                    status_1 = err_2 && typeof err_2 === 'object' && 'response' in err_2
                        ? (_a = err_2.response) === null || _a === void 0 ? void 0 : _a.status
                        : undefined;
                    detail = status_1 === 422
                        ? (_c = (_b = err_2
                            .response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.detail
                        : undefined;
                    message = void 0;
                    willRetry = status_1 !== 422;
                    if (status_1 === 422) {
                        if ((detail === null || detail === void 0 ? void 0 : detail.code) === 'images_not_ready') {
                            message = hasFailedImages.value
                                ? 'One or more images failed to finish processing. Remove or retry them before saving.'
                                : 'Some images are still uploading or processing. Please wait a moment, then try saving again.';
                        }
                        else {
                            message =
                                (_d = (0, errors_1.extractErrorMessage)(err_2)) !== null && _d !== void 0 ? _d : 'Failed to save. Please try again.';
                        }
                    }
                    else {
                        message = (_e = (0, errors_1.extractErrorMessage)(err_2)) !== null && _e !== void 0 ? _e : 'Failed to save. Please try again.';
                    }
                    logCommitFailure('manual commit failed', err_2, { willRetry: willRetry });
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
                                var newEntryId, shouldNavigate;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, executeCommit()];
                                        case 1:
                                            newEntryId = _a.sent();
                                            removePendingSave(pendingSaveKey(), true);
                                            shouldNavigate = !backgroundCommitDelegated.value;
                                            backgroundCommitDelegated.value = false;
                                            if (!(shouldNavigate && newEntryId && selectedPathId.value)) return [3 /*break*/, 3];
                                            return [4 /*yield*/, router.replace("/entry/".concat(selectedPathId.value, "/").concat(newEntryId))];
                                        case 2:
                                            _a.sent();
                                            return [3 /*break*/, 4];
                                        case 3:
                                            if (shouldNavigate) {
                                                router.back();
                                            }
                                            _a.label = 4;
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); },
                        });
                    }
                    else {
                        removePendingSave(pendingSaveKey(), false);
                    }
                    return [3 /*break*/, 10];
                case 9:
                    committing.value = false;
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    });
}
// ─── Default Path Selection ───────────────────────────────────────────────
function pickDefaultPath() {
    return __awaiter(this, void 0, void 0, function () {
        var order, sorted, _i, sorted_1, path;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (ownedPaths.value.length === 0)
                        return [2 /*return*/];
                    if (selectedPathId.value)
                        return [2 /*return*/];
                    order = (0, db_1.getPathOrder)();
                    sorted = __spreadArray([], ownedPaths.value, true).sort(function (left, right) {
                        var leftIndex = order.indexOf(left.path_id);
                        var rightIndex = order.indexOf(right.path_id);
                        if (leftIndex === -1 && rightIndex === -1)
                            return 0;
                        if (leftIndex === -1)
                            return 1;
                        if (rightIndex === -1)
                            return -1;
                        return leftIndex - rightIndex;
                    });
                    _i = 0, sorted_1 = sorted;
                    _c.label = 1;
                case 1:
                    if (!(_i < sorted_1.length)) return [3 /*break*/, 4];
                    path = sorted_1[_i];
                    return [4 /*yield*/, (0, db_1.isPathHidden)(path.path_id)];
                case 2:
                    if (!(_c.sent())) {
                        selectedPathId.value = path.path_id;
                        return [2 /*return*/];
                    }
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    selectedPathId.value = (_b = (_a = sorted[0]) === null || _a === void 0 ? void 0 : _a.path_id) !== null && _b !== void 0 ? _b : '';
                    return [2 /*return*/];
            }
        });
    });
}
(0, vue_2.onMounted)(function () {
    if (ownedPaths.value.length > 0 || paths.value !== undefined) {
        void pickDefaultPath();
    }
    // If both path and day were pre-populated from route params, kick off draft
    // init immediately (the watch only fires on *changes*, not on initial values).
    if (selectedPathId.value && day.value) {
        void ensureDraft();
    }
});
// When connectivity is restored, clear the offline flag and flush any
// unsaved content.  useApi owns the single online/offline listener.
(0, vue_2.watch)(isOnline, function (online) {
    if (online) {
        autosaveOffline.value = false;
        if (content.value && content.value !== lastSavedContent) {
            scheduleContentAutosave();
        }
    }
});
(0, vue_2.watch)(ownedPaths, function (nextPaths, previousPaths) {
    if ((previousPaths === null || previousPaths === void 0 ? void 0 : previousPaths.length) === 0 &&
        nextPaths.length > 0 &&
        !selectedPathId.value) {
        void pickDefaultPath();
    }
});
// ─── Cleanup ─────────────────────────────────────────────────────────────
(0, vue_2.onBeforeUnmount)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _i, _a, draft, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
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
                if (!draftId.value) return [3 /*break*/, 4];
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                return [4 /*yield*/, abandonDraft({ draftId: draftId.value })];
            case 2:
                _c.sent();
                return [3 /*break*/, 4];
            case 3:
                _b = _c.sent();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
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
    defaultHref: "/",
}));
var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([{
        defaultHref: "/",
    }], __VLS_functionalComponentArgsRest(__VLS_18), false));
var __VLS_16;
var __VLS_21 = {}.IonTitle;
/** @type {[typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, ]} */ ;
// @ts-ignore
var __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({}));
var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_22), false));
__VLS_24.slots.default;
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
var __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29(__assign({ 'onClick': {} }, { fill: "outline", disabled: (__VLS_ctx.savingDraft || __VLS_ctx.committing || !__VLS_ctx.draftId) })));
var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { fill: "outline", disabled: (__VLS_ctx.savingDraft || __VLS_ctx.committing || !__VLS_ctx.draftId) })], __VLS_functionalComponentArgsRest(__VLS_30), false));
var __VLS_33;
var __VLS_34;
var __VLS_35;
var __VLS_36 = {
    onClick: (__VLS_ctx.saveDraftAndNavigateBack)
};
__VLS_32.slots.default;
(__VLS_ctx.savingDraft ? 'Saving…' : 'Save Draft');
var __VLS_32;
var __VLS_37 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37(__assign({ 'onClick': {} }, { disabled: (__VLS_ctx.committing || !__VLS_ctx.canCommit) })));
var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { disabled: (__VLS_ctx.committing || !__VLS_ctx.canCommit) })], __VLS_functionalComponentArgsRest(__VLS_38), false));
var __VLS_41;
var __VLS_42;
var __VLS_43;
var __VLS_44 = {
    onClick: (__VLS_ctx.commitDraft)
};
__VLS_40.slots.default;
(__VLS_ctx.committing ? 'Publishing…' : 'Publish');
var __VLS_40;
var __VLS_28;
var __VLS_12;
var __VLS_8;
var __VLS_45 = {}.IonContent;
/** @type {[typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, ]} */ ;
// @ts-ignore
var __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45(__assign({ class: "entry-editor-content" })));
var __VLS_47 = __VLS_46.apply(void 0, __spreadArray([__assign({ class: "entry-editor-content" })], __VLS_functionalComponentArgsRest(__VLS_46), false));
__VLS_48.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "entry-form" }));
if (__VLS_ctx.pathsError && !__VLS_ctx.paths) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "view-full-error" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "view-full-error-title" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "view-full-error-body" }));
    (__VLS_ctx.pathsErrorMessage);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "view-full-error-actions" }));
    var __VLS_49 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49(__assign({ 'onClick': {} }, { fill: "outline" })));
    var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { fill: "outline" })], __VLS_functionalComponentArgsRest(__VLS_50), false));
    var __VLS_53 = void 0;
    var __VLS_54 = void 0;
    var __VLS_55 = void 0;
    var __VLS_56 = {
        onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.pathsError && !__VLS_ctx.paths))
                return;
            __VLS_ctx.$router.back();
        }
    };
    __VLS_52.slots.default;
    var __VLS_52;
}
else if (__VLS_ctx.paths !== undefined && __VLS_ctx.ownedPaths.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "view-no-paths" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "view-no-paths-title" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "view-no-paths-body" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "view-no-paths-actions" }));
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
            if (!!(__VLS_ctx.pathsError && !__VLS_ctx.paths))
                return;
            if (!(__VLS_ctx.paths !== undefined && __VLS_ctx.ownedPaths.length === 0))
                return;
            __VLS_ctx.$router.back();
        }
    };
    __VLS_60.slots.default;
    var __VLS_60;
    var __VLS_65 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({
        routerLink: "/paths/new",
    }));
    var __VLS_67 = __VLS_66.apply(void 0, __spreadArray([{
            routerLink: "/paths/new",
        }], __VLS_functionalComponentArgsRest(__VLS_66), false));
    __VLS_68.slots.default;
    var __VLS_68;
}
else if (__VLS_ctx.ownedPaths.length > 0) {
    var __VLS_69 = {}.IonItem;
    /** @type {[typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, ]} */ ;
    // @ts-ignore
    var __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69(__assign({ class: "entry-field" })));
    var __VLS_71 = __VLS_70.apply(void 0, __spreadArray([__assign({ class: "entry-field" })], __VLS_functionalComponentArgsRest(__VLS_70), false));
    __VLS_72.slots.default;
    var __VLS_73 = {}.IonLabel;
    /** @type {[typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, ]} */ ;
    // @ts-ignore
    var __VLS_74 = __VLS_asFunctionalComponent(__VLS_73, new __VLS_73({
        position: "stacked",
    }));
    var __VLS_75 = __VLS_74.apply(void 0, __spreadArray([{
            position: "stacked",
        }], __VLS_functionalComponentArgsRest(__VLS_74), false));
    __VLS_76.slots.default;
    var __VLS_76;
    var __VLS_77 = {}.IonSelect;
    /** @type {[typeof __VLS_components.IonSelect, typeof __VLS_components.ionSelect, typeof __VLS_components.IonSelect, typeof __VLS_components.ionSelect, ]} */ ;
    // @ts-ignore
    var __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77({
        modelValue: (__VLS_ctx.selectedPathId),
        placeholder: "Select a path",
        interface: "action-sheet",
    }));
    var __VLS_79 = __VLS_78.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.selectedPathId),
            placeholder: "Select a path",
            interface: "action-sheet",
        }], __VLS_functionalComponentArgsRest(__VLS_78), false));
    __VLS_80.slots.default;
    for (var _i = 0, _j = __VLS_getVForSourceType((__VLS_ctx.ownedPaths)); _i < _j.length; _i++) {
        var path = _j[_i][0];
        var __VLS_81 = {}.IonSelectOption;
        /** @type {[typeof __VLS_components.IonSelectOption, typeof __VLS_components.ionSelectOption, typeof __VLS_components.IonSelectOption, typeof __VLS_components.ionSelectOption, ]} */ ;
        // @ts-ignore
        var __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
            key: (path.path_id),
            value: (path.path_id),
        }));
        var __VLS_83 = __VLS_82.apply(void 0, __spreadArray([{
                key: (path.path_id),
                value: (path.path_id),
            }], __VLS_functionalComponentArgsRest(__VLS_82), false));
        __VLS_84.slots.default;
        (path.title);
        var __VLS_84;
    }
    var __VLS_80;
    var __VLS_72;
    var __VLS_85 = {}.IonItem;
    /** @type {[typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, ]} */ ;
    // @ts-ignore
    var __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85(__assign({ class: "entry-field" })));
    var __VLS_87 = __VLS_86.apply(void 0, __spreadArray([__assign({ class: "entry-field" })], __VLS_functionalComponentArgsRest(__VLS_86), false));
    __VLS_88.slots.default;
    var __VLS_89 = {}.IonLabel;
    /** @type {[typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, ]} */ ;
    // @ts-ignore
    var __VLS_90 = __VLS_asFunctionalComponent(__VLS_89, new __VLS_89({
        position: "stacked",
    }));
    var __VLS_91 = __VLS_90.apply(void 0, __spreadArray([{
            position: "stacked",
        }], __VLS_functionalComponentArgsRest(__VLS_90), false));
    __VLS_92.slots.default;
    var __VLS_92;
    var __VLS_93 = {}.IonNote;
    /** @type {[typeof __VLS_components.IonNote, typeof __VLS_components.ionNote, typeof __VLS_components.IonNote, typeof __VLS_components.ionNote, ]} */ ;
    // @ts-ignore
    var __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
        slot: "helper",
    }));
    var __VLS_95 = __VLS_94.apply(void 0, __spreadArray([{
            slot: "helper",
        }], __VLS_functionalComponentArgsRest(__VLS_94), false));
    __VLS_96.slots.default;
    var __VLS_96;
    var __VLS_97 = {}.IonInput;
    /** @type {[typeof __VLS_components.IonInput, typeof __VLS_components.ionInput, ]} */ ;
    // @ts-ignore
    var __VLS_98 = __VLS_asFunctionalComponent(__VLS_97, new __VLS_97({
        modelValue: (__VLS_ctx.day),
        type: "date",
    }));
    var __VLS_99 = __VLS_98.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.day),
            type: "date",
        }], __VLS_functionalComponentArgsRest(__VLS_98), false));
    var __VLS_88;
    /** @type {[typeof EntryEditorPanel, ]} */ ;
    // @ts-ignore
    var __VLS_101 = __VLS_asFunctionalComponent(EntryEditorPanel_vue_1.default, new EntryEditorPanel_vue_1.default(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ 'onUpdate:content': {} }, { 'onUpdate:contentTab': {} }), { 'onUpdate:captionDraft': {} }), { 'onTextareaInput': {} }), { 'onRememberSelection': {} }), { 'onOpenImagePicker': {} }), { 'onImageSelected': {} }), { 'onCloseCommitFail': {} }), { 'onAcknowledgeCommitFailure': {} }), { 'onCloseCaption': {} }), { 'onConfirmImageInsert': {} }), { 'onOpenCaption': {} }), { 'onRemoveImage': {} }), { bindTextareaRef: (__VLS_ctx.bindTextareaRef), bindImageInputRef: (__VLS_ctx.bindImageInputRef), content: (__VLS_ctx.content), contentTab: (__VLS_ctx.contentTab), committing: (__VLS_ctx.committing), autosaveOffline: (__VLS_ctx.autosaveOffline), uploadDisabled: (!__VLS_ctx.selectedPathId || __VLS_ctx.committing || !__VLS_ctx.draftId || __VLS_ctx.autosaveOffline), uploadButtonTitle: (__VLS_ctx.autosaveOffline
            ? 'Image upload is unavailable while offline'
            : undefined), imageError: (__VLS_ctx.imageError), attachedImages: (__VLS_ctx.attachedImages), localImageUrls: (__VLS_ctx.localImageUrls), imageDrafts: (__VLS_ctx.imageDrafts), selectedImage: (__VLS_ctx.selectedImage), isCaptionModalOpen: (__VLS_ctx.isCaptionModalOpen), captionDraft: (__VLS_ctx.captionDraft), commitFailDialogOpen: (__VLS_ctx.commitFailDialogOpen), commitFailDialogMessage: (__VLS_ctx.commitFailDialogMessage), commitFailWillRetry: (__VLS_ctx.commitFailWillRetry) })));
    var __VLS_102 = __VLS_101.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ 'onUpdate:content': {} }, { 'onUpdate:contentTab': {} }), { 'onUpdate:captionDraft': {} }), { 'onTextareaInput': {} }), { 'onRememberSelection': {} }), { 'onOpenImagePicker': {} }), { 'onImageSelected': {} }), { 'onCloseCommitFail': {} }), { 'onAcknowledgeCommitFailure': {} }), { 'onCloseCaption': {} }), { 'onConfirmImageInsert': {} }), { 'onOpenCaption': {} }), { 'onRemoveImage': {} }), { bindTextareaRef: (__VLS_ctx.bindTextareaRef), bindImageInputRef: (__VLS_ctx.bindImageInputRef), content: (__VLS_ctx.content), contentTab: (__VLS_ctx.contentTab), committing: (__VLS_ctx.committing), autosaveOffline: (__VLS_ctx.autosaveOffline), uploadDisabled: (!__VLS_ctx.selectedPathId || __VLS_ctx.committing || !__VLS_ctx.draftId || __VLS_ctx.autosaveOffline), uploadButtonTitle: (__VLS_ctx.autosaveOffline
                ? 'Image upload is unavailable while offline'
                : undefined), imageError: (__VLS_ctx.imageError), attachedImages: (__VLS_ctx.attachedImages), localImageUrls: (__VLS_ctx.localImageUrls), imageDrafts: (__VLS_ctx.imageDrafts), selectedImage: (__VLS_ctx.selectedImage), isCaptionModalOpen: (__VLS_ctx.isCaptionModalOpen), captionDraft: (__VLS_ctx.captionDraft), commitFailDialogOpen: (__VLS_ctx.commitFailDialogOpen), commitFailDialogMessage: (__VLS_ctx.commitFailDialogMessage), commitFailWillRetry: (__VLS_ctx.commitFailWillRetry) })], __VLS_functionalComponentArgsRest(__VLS_101), false));
    var __VLS_104 = void 0;
    var __VLS_105 = void 0;
    var __VLS_106 = void 0;
    var __VLS_107 = {
        'onUpdate:content': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!!(__VLS_ctx.pathsError && !__VLS_ctx.paths))
                return;
            if (!!(__VLS_ctx.paths !== undefined && __VLS_ctx.ownedPaths.length === 0))
                return;
            if (!(__VLS_ctx.ownedPaths.length > 0))
                return;
            __VLS_ctx.content = $event;
        }
    };
    var __VLS_108 = {
        'onUpdate:contentTab': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!!(__VLS_ctx.pathsError && !__VLS_ctx.paths))
                return;
            if (!!(__VLS_ctx.paths !== undefined && __VLS_ctx.ownedPaths.length === 0))
                return;
            if (!(__VLS_ctx.ownedPaths.length > 0))
                return;
            __VLS_ctx.contentTab = $event;
        }
    };
    var __VLS_109 = {
        'onUpdate:captionDraft': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!!(__VLS_ctx.pathsError && !__VLS_ctx.paths))
                return;
            if (!!(__VLS_ctx.paths !== undefined && __VLS_ctx.ownedPaths.length === 0))
                return;
            if (!(__VLS_ctx.ownedPaths.length > 0))
                return;
            __VLS_ctx.captionDraft = $event;
        }
    };
    var __VLS_110 = {
        onTextareaInput: (__VLS_ctx.onTextareaInput)
    };
    var __VLS_111 = {
        onRememberSelection: (__VLS_ctx.rememberSelection)
    };
    var __VLS_112 = {
        onOpenImagePicker: (__VLS_ctx.openImagePicker)
    };
    var __VLS_113 = {
        onImageSelected: (__VLS_ctx.onImageSelected)
    };
    var __VLS_114 = {
        onCloseCommitFail: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!!(__VLS_ctx.pathsError && !__VLS_ctx.paths))
                return;
            if (!!(__VLS_ctx.paths !== undefined && __VLS_ctx.ownedPaths.length === 0))
                return;
            if (!(__VLS_ctx.ownedPaths.length > 0))
                return;
            __VLS_ctx.commitFailDialogOpen = false;
        }
    };
    var __VLS_115 = {
        onAcknowledgeCommitFailure: (__VLS_ctx.acknowledgeCommitFailure)
    };
    var __VLS_116 = {
        onCloseCaption: (__VLS_ctx.closeCaptionModal)
    };
    var __VLS_117 = {
        onConfirmImageInsert: (__VLS_ctx.confirmImageInsert)
    };
    var __VLS_118 = {
        onOpenCaption: (__VLS_ctx.openCaptionModal)
    };
    var __VLS_119 = {
        onRemoveImage: (__VLS_ctx.removeImage)
    };
    var __VLS_103;
}
var __VLS_48;
var __VLS_120 = {}.IonFooter;
/** @type {[typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, ]} */ ;
// @ts-ignore
var __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({}));
var __VLS_122 = __VLS_121.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_121), false));
__VLS_123.slots.default;
/** @type {[typeof RefreshStatus, ]} */ ;
// @ts-ignore
var __VLS_124 = __VLS_asFunctionalComponent(RefreshStatus_vue_1.default, new RefreshStatus_vue_1.default({
    statusType: (__VLS_ctx.refreshStatusType),
    statusText: (__VLS_ctx.refreshStatusText),
    lastCheckedAt: (__VLS_ctx.refreshLastCheckedAt),
}));
var __VLS_125 = __VLS_124.apply(void 0, __spreadArray([{
        statusType: (__VLS_ctx.refreshStatusType),
        statusText: (__VLS_ctx.refreshStatusText),
        lastCheckedAt: (__VLS_ctx.refreshLastCheckedAt),
    }], __VLS_functionalComponentArgsRest(__VLS_124), false));
var __VLS_123;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['entry-editor-content']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-form']} */ ;
/** @type {__VLS_StyleScopedClasses['view-full-error']} */ ;
/** @type {__VLS_StyleScopedClasses['view-full-error-title']} */ ;
/** @type {__VLS_StyleScopedClasses['view-full-error-body']} */ ;
/** @type {__VLS_StyleScopedClasses['view-full-error-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['view-no-paths']} */ ;
/** @type {__VLS_StyleScopedClasses['view-no-paths-title']} */ ;
/** @type {__VLS_StyleScopedClasses['view-no-paths-body']} */ ;
/** @type {__VLS_StyleScopedClasses['view-no-paths-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-field']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-field']} */ ;
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
            IonItem: vue_1.IonItem,
            IonLabel: vue_1.IonLabel,
            IonSelect: vue_1.IonSelect,
            IonSelectOption: vue_1.IonSelectOption,
            IonInput: vue_1.IonInput,
            IonNote: vue_1.IonNote,
            EntryEditorPanel: EntryEditorPanel_vue_1.default,
            RefreshStatus: RefreshStatus_vue_1.default,
            paths: paths,
            pathsError: pathsError,
            ownedPaths: ownedPaths,
            pathsErrorMessage: pathsErrorMessage,
            refreshStatusType: refreshStatusType,
            refreshStatusText: refreshStatusText,
            refreshLastCheckedAt: refreshLastCheckedAt,
            day: day,
            selectedPathId: selectedPathId,
            content: content,
            contentTab: contentTab,
            committing: committing,
            savingDraft: savingDraft,
            imageError: imageError,
            imageDrafts: imageDrafts,
            draftId: draftId,
            autosaveOffline: autosaveOffline,
            commitFailDialogOpen: commitFailDialogOpen,
            commitFailDialogMessage: commitFailDialogMessage,
            commitFailWillRetry: commitFailWillRetry,
            isCaptionModalOpen: isCaptionModalOpen,
            captionDraft: captionDraft,
            selectedImage: selectedImage,
            bindTextareaRef: bindTextareaRef,
            bindImageInputRef: bindImageInputRef,
            canCommit: canCommit,
            attachedImages: attachedImages,
            localImageUrls: localImageUrls,
            rememberSelection: rememberSelection,
            onTextareaInput: onTextareaInput,
            openImagePicker: openImagePicker,
            onImageSelected: onImageSelected,
            removeImage: removeImage,
            openCaptionModal: openCaptionModal,
            closeCaptionModal: closeCaptionModal,
            confirmImageInsert: confirmImageInsert,
            acknowledgeCommitFailure: acknowledgeCommitFailure,
            saveDraftAndNavigateBack: saveDraftAndNavigateBack,
            commitDraft: commitDraft,
        };
    },
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
