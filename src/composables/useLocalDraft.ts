import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue';
import { db, type LocalEntryDraft } from '../lib/db';

const AUTOSAVE_DEBOUNCE_MS = 500;
// Continuous typing keeps resetting the debounce, so also force a write at
// least this often while edits are pending — caps loss to a few seconds.
const AUTOSAVE_MAX_WAIT_MS = 3000;

/**
 * Local-only autosave for in-progress entry text, keyed to a specific "new entry for
 * pathId/day" or "editing entryId" slot. No server contact — purely a safety net against
 * losing typed content to a closed tab or crashed app, not a sync mechanism.
 *
 * Pending edits are flushed when the editor unmounts (Cancel, swipe/browser back, any
 * other navigation away) and when the page is hidden (app backgrounded or closed).
 *
 * When editing an existing entry, pass the latest server copy as `baseline`. Content
 * matching it is never stored (so an untouched editor can't leave a draft that later
 * shadows newer server edits), and each draft remembers the server edit_id it was
 * started from, so `isStale` can flag a draft whose entry has since changed elsewhere.
 */
export function useLocalDraft(
  pathId: Ref<string>,
  day: Ref<string>,
  entryId: Ref<string | null>,
  baseline?: Ref<{ content: string; editId: number } | null>,
) {
  const content = ref('');
  // Server edit_id the current draft was started from; null for legacy drafts
  // saved before this was tracked (their origin is unknown).
  const draftBaseEditId = ref<number | null>(null);
  let debounceHandle: ReturnType<typeof setTimeout> | undefined;
  let maxWaitHandle: ReturnType<typeof setTimeout> | undefined;
  // Snapshot of the slot + text to write, taken when the edit happened, so a
  // flush during navigation (when route params may already have changed)
  // still lands under the right key.
  let pending: LocalEntryDraft | null = null;
  let restoring = false;

  function draftKey(): string {
    return entryId.value
      ? `${pathId.value}:entry:${entryId.value}`
      : `${pathId.value}:new:${day.value}`;
  }

  async function restore(): Promise<void> {
    if (!pathId.value) return;
    restoring = true;
    try {
      const key = draftKey();
      const draft = await db.localDrafts.get(key);
      const base = baseline?.value;
      if (!base) {
        content.value = draft?.content ?? '';
      } else if (!draft || draft.content === base.content) {
        if (draft) await db.localDrafts.delete(key);
        content.value = base.content;
        draftBaseEditId.value = base.editId;
      } else {
        content.value = draft.content;
        draftBaseEditId.value = draft.baseEditId ?? null;
      }
    } catch {
      content.value = baseline?.value?.content ?? '';
    } finally {
      restoring = false;
    }
  }

  function cancelTimers(): void {
    clearTimeout(debounceHandle);
    clearTimeout(maxWaitHandle);
    debounceHandle = undefined;
    maxWaitHandle = undefined;
  }

  async function flush(): Promise<void> {
    cancelTimers();
    const draft = pending;
    pending = null;
    if (!draft) return;
    try {
      if (!draft.content) {
        await db.localDrafts.delete(draft.draftKey);
        return;
      }
      await db.localDrafts.put(draft);
    } catch {
      // IndexedDB may be unavailable; autosave is best-effort only.
    }
  }

  watch(
    content,
    () => {
      // Skip the write triggered by restore() itself setting content.value.
      if (restoring || !pathId.value) return;
      const base = baseline?.value;
      const unchanged = !!base && content.value === base.content;
      // Back in sync with the server copy: nothing unsaved, so any new edits
      // start from the current version.
      if (unchanged) draftBaseEditId.value = base.editId;
      pending = {
        draftKey: draftKey(),
        pathId: pathId.value,
        entryId: entryId.value,
        day: day.value,
        // Empty content means "delete the draft" to flush().
        content: unchanged ? '' : content.value,
        baseEditId: draftBaseEditId.value ?? undefined,
        updatedAt: Date.now(),
      };
      clearTimeout(debounceHandle);
      debounceHandle = setTimeout(flush, AUTOSAVE_DEBOUNCE_MS);
      maxWaitHandle ??= setTimeout(flush, AUTOSAVE_MAX_WAIT_MS);
    },
    { flush: 'sync' },
  );

  // The slot can become known after mount (e.g. the new-entry page picks the
  // first owned path once paths load). Pick up any draft saved there, unless
  // the user has already started typing.
  watch(draftKey, () => {
    if (pathId.value && !content.value) void restore();
  });

  function onPageHidden(): void {
    if (document.visibilityState === 'hidden') void flush();
  }
  function onPageHide(): void {
    void flush();
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('visibilitychange', onPageHidden);
  }

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('pagehide', onPageHide);
      document.removeEventListener('visibilitychange', onPageHidden);
    }
    void flush();
  });

  const isStale = computed(() => {
    const base = baseline?.value;
    return (
      !!base &&
      content.value !== base.content &&
      draftBaseEditId.value !== base.editId
    );
  });

  /** Throw away the local draft and load the latest server copy instead. */
  async function discardDraft(): Promise<void> {
    const key = draftKey();
    restoring = true;
    content.value = baseline?.value?.content ?? '';
    restoring = false;
    draftBaseEditId.value = baseline?.value?.editId ?? null;
    cancelTimers();
    pending = null;
    try {
      await db.localDrafts.delete(key);
    } catch {
      // IndexedDB may be unavailable.
    }
  }

  async function clear(): Promise<void> {
    const key = draftKey();
    content.value = '';
    // Drop the write that clearing content just queued (and any older one) so
    // an unmount flush can't race the delete below.
    cancelTimers();
    pending = null;
    try {
      await db.localDrafts.delete(key);
    } catch {
      // IndexedDB may be unavailable.
    }
  }

  return { content, restore, clear, isStale, discardDraft };
}
