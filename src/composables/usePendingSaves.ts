import { ref, computed } from 'vue';

/**
 * A single entry that is queued for a background save retry.
 */
export interface PendingSaveEntry {
  /** Unique key for this pending save (e.g. "create:p1:2024-01-15" or "edit:e1") */
  key: string;
  /** Human-readable label shown in the expanded panel */
  label: string;
}

// ─── Module-level singleton state ──────────────────────────────────────────
// Using module-level refs so all component instances share the same state,
// enabling RefreshStatus (mounted in a footer) to read saves registered by
// editor views without prop-drilling.

const _pendingSaves = ref<PendingSaveEntry[]>([]);
const _savedNotification = ref<string | null>(null);

/** Keys of views currently autosaving content */
const _contentSavingKeys = ref<Set<string>>(new Set());

/** Map of draft-init errors keyed by a view key */
const _draftInitErrors = ref<Map<string, string>>(new Map());

/**
 * Composable that tracks background commit-retry attempts and shows a
 * "saved" notification when a retry eventually succeeds.
 *
 * The state is module-level (singleton) so the editor views and the
 * RefreshStatus footer widget share the same data without prop-drilling.
 */
export function usePendingSaves() {
  const pendingSaves = computed(() => _pendingSaves.value);
  const pendingSavesCount = computed(() => _pendingSaves.value.length);
  const savedNotification = computed(() => _savedNotification.value);

  /** True when any view is currently autosaving */
  const isContentSaving = computed(() => _contentSavingKeys.value.size > 0);

  /** All current draft-init error messages (values of the map) */
  const draftInitErrors = computed(() =>
    Array.from(_draftInitErrors.value.values()),
  );

  /**
   * Register a pending save retry. If an entry with this key already exists
   * it is replaced (label may have changed).
   */
  function registerPendingSave(key: string, label: string) {
    const idx = _pendingSaves.value.findIndex((e) => e.key === key);
    if (idx >= 0) {
      _pendingSaves.value = _pendingSaves.value.map((e, i) =>
        i === idx ? { key, label } : e,
      );
    } else {
      _pendingSaves.value = [..._pendingSaves.value, { key, label }];
    }
  }

  /**
   * Remove a pending save by key (e.g. after a retry succeeds or the view
   * unmounts without a successful save).
   *
   * @param succeeded - when true a "Saved" notification is stored so the
   *   RefreshStatus widget can surface it until the user navigates away.
   */
  function removePendingSave(key: string, succeeded: boolean) {
    _pendingSaves.value = _pendingSaves.value.filter((e) => e.key !== key);
    if (succeeded) {
      _savedNotification.value = 'Entry saved successfully.';
    }
  }

  /** Clear the saved notification (called on navigation). */
  function clearSavedNotification() {
    _savedNotification.value = null;
  }

  /** Mark a view key as currently autosaving content. */
  function setContentSaving(key: string, saving: boolean) {
    const next = new Set(_contentSavingKeys.value);
    if (saving) {
      next.add(key);
    } else {
      next.delete(key);
    }
    _contentSavingKeys.value = next;
  }

  /** Register or update a draft-init error for a given view key. */
  function registerDraftInitError(key: string, message: string) {
    const next = new Map(_draftInitErrors.value);
    next.set(key, message);
    _draftInitErrors.value = next;
  }

  /** Clear the draft-init error for a given view key. */
  function clearDraftInitError(key: string) {
    if (!_draftInitErrors.value.has(key)) return;
    const next = new Map(_draftInitErrors.value);
    next.delete(key);
    _draftInitErrors.value = next;
  }

  return {
    pendingSaves,
    pendingSavesCount,
    savedNotification,
    isContentSaving,
    draftInitErrors,
    registerPendingSave,
    removePendingSave,
    clearSavedNotification,
    setContentSaving,
    registerDraftInitError,
    clearDraftInitError,
  };
}

/**
 * Reset all singleton state back to empty.
 * Call this in Storybook's `prepareStoryEnvironment` so each story starts
 * with a clean slate.
 */
export function resetPendingSaves() {
  _pendingSaves.value = [];
  _savedNotification.value = null;
  _contentSavingKeys.value = new Set();
  _draftInitErrors.value = new Map();
}
