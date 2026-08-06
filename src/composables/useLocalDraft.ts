import { ref, watch, type Ref } from 'vue';
import { db } from '../lib/db';

const AUTOSAVE_DEBOUNCE_MS = 500;

/**
 * Local-only autosave for in-progress entry text, keyed to a specific "new entry for
 * pathId/day" or "editing entryId" slot. No server contact — purely a safety net against
 * losing typed content to a closed tab or crashed app, not a sync mechanism.
 */
export function useLocalDraft(
  pathId: Ref<string>,
  day: Ref<string>,
  entryId: Ref<string | null>,
) {
  const content = ref('');
  let debounceHandle: ReturnType<typeof setTimeout> | undefined;
  let restored = false;

  function draftKey(): string {
    return entryId.value
      ? `${pathId.value}:entry:${entryId.value}`
      : `${pathId.value}:new:${day.value}`;
  }

  async function restore(): Promise<void> {
    restored = false;
    if (!pathId.value) return;
    try {
      const draft = await db.localDrafts.get(draftKey());
      content.value = draft?.content ?? '';
    } catch {
      content.value = '';
    } finally {
      restored = true;
    }
  }

  async function save(): Promise<void> {
    if (!pathId.value) return;
    try {
      if (!content.value) {
        await db.localDrafts.delete(draftKey());
        return;
      }
      await db.localDrafts.put({
        draftKey: draftKey(),
        pathId: pathId.value,
        entryId: entryId.value,
        day: day.value,
        content: content.value,
        updatedAt: Date.now(),
      });
    } catch {
      // IndexedDB may be unavailable; autosave is best-effort only.
    }
  }

  watch(content, () => {
    // Skip the write triggered by restore() itself setting content.value.
    if (!restored) return;
    clearTimeout(debounceHandle);
    debounceHandle = setTimeout(save, AUTOSAVE_DEBOUNCE_MS);
  });

  async function clear(): Promise<void> {
    clearTimeout(debounceHandle);
    try {
      await db.localDrafts.delete(draftKey());
    } catch {
      // IndexedDB may be unavailable.
    }
    content.value = '';
  }

  return { content, restore, clear };
}
