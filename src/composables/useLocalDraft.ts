import { onBeforeUnmount, ref, watch, type Ref } from 'vue';
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
 */
export function useLocalDraft(
  pathId: Ref<string>,
  day: Ref<string>,
  entryId: Ref<string | null>,
) {
  const content = ref('');
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
      const draft = await db.localDrafts.get(draftKey());
      content.value = draft?.content ?? '';
    } catch {
      content.value = '';
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
      pending = {
        draftKey: draftKey(),
        pathId: pathId.value,
        entryId: entryId.value,
        day: day.value,
        content: content.value,
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

  return { content, restore, clear };
}
