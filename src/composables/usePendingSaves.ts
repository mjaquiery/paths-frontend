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

  return {
    pendingSaves,
    pendingSavesCount,
    savedNotification,
    registerPendingSave,
    removePendingSave,
    clearSavedNotification,
  };
}
