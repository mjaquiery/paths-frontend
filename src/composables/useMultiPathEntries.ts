import { computed, ref, watch, type Ref } from 'vue';
import { useQueries } from '@tanstack/vue-query';
import { listEntries, getEntry, listEntryImages } from '../generated/apiClient';
import type { EntryContentResponse, EntryResponse, ImageResponse } from '../generated/types';
import { db } from '../lib/db';

export interface EntryWithContent extends EntryResponse {
  content?: string;
  image_filenames?: string[];
}

export interface PathEntries {
  pathId: string;
  entries: EntryWithContent[];
}

/** Tracks which edit_id we last loaded content for, keyed by entry id. */
interface ContentState {
  editId: string;
  content?: string;
  image_filenames?: string[];
}

export function useMultiPathEntries(pathIds: Ref<string[]>) {
  const contentCache = ref<Record<string, ContentState>>({});

  /**
   * Stable map from pathId → raw entry list, updated synchronously
   * inside the `watch(results, …)` callback.  Using a keyed map (rather
   * than positional index into `results`) means that a path-priority
   * reorder — which changes `pathIds.value` order but not the underlying
   * data — never causes one path to accidentally read another path's
   * entries while TanStack Query's internal result array catches up.
   */
  const rawEntriesMap = ref<Record<string, EntryResponse[]>>({});

  const results = useQueries({
    queries: computed(() =>
      pathIds.value.map((pathId) => ({
        queryKey: ['v1', 'paths', pathId, 'entries'],
        queryFn: () => listEntries(pathId),
        enabled: !!pathId,
      })),
    ),
  });

  // When entry lists change, populate content from Dexie or fetch from API.
  watch(
    results,
    async (queryResults) => {
      // Synchronously update the pathId → entries map so that the return
      // computed always has correctly-keyed data even if this watcher runs
      // before or after a path-order change.
      const newMap: Record<string, EntryResponse[]> = {};
      for (let i = 0; i < pathIds.value.length; i++) {
        const pathId = pathIds.value[i];
        if (!pathId) continue;
        newMap[pathId] =
          (queryResults[i]?.data as { data?: EntryResponse[] } | undefined)
            ?.data ?? [];
      }
      rawEntriesMap.value = newMap;

      for (let i = 0; i < pathIds.value.length; i++) {
        const pathId = pathIds.value[i];
        if (!pathId) continue;
        const entries =
          (queryResults[i]?.data as { data?: EntryResponse[] } | undefined)
            ?.data ?? [];

        for (const entry of entries) {
          // Skip if we already have up-to-date content for this edit_id.
          if (contentCache.value[entry.id]?.editId === entry.edit_id) continue;

          // Try Dexie cache first.
          const cached = await db.entryContent.get(entry.id);
          if (cached && cached.edit_id === entry.edit_id) {
            contentCache.value[entry.id] = {
              editId: entry.edit_id,
              content: cached.content,
              image_filenames: cached.image_filenames,
            };
            continue;
          }

          // Fetch from API and store in Dexie.
          try {
            const [entryResp, imagesResp] = await Promise.all([
              getEntry(pathId, entry.id),
              listEntryImages(pathId, entry.id),
            ]);
            const content =
              (entryResp.data as EntryContentResponse | undefined)?.content ?? '';
            const image_filenames =
              (imagesResp.data as ImageResponse[] | undefined)?.map(
                (img) => img.filename,
              ) ?? [];
            await db.entryContent.put({
              id: entry.id,
              path_id: entry.path_id,
              day: entry.day,
              edit_id: entry.edit_id,
              content,
              image_filenames,
            });
            contentCache.value[entry.id] = {
              editId: entry.edit_id,
              content,
              image_filenames,
            };
          } catch {
            // Keep stale content if present, or mark as attempted.
            contentCache.value[entry.id] = {
              editId: entry.edit_id,
              content: contentCache.value[entry.id]?.content,
              image_filenames: contentCache.value[entry.id]?.image_filenames,
            };
          }
        }
      }
    },
    { deep: true },
  );

  return computed<PathEntries[]>(() =>
    pathIds.value.map((pathId) => ({
      pathId,
      entries: (rawEntriesMap.value[pathId] ?? []).map((entry) => ({
        ...entry,
        content: contentCache.value[entry.id]?.content,
        image_filenames: contentCache.value[entry.id]?.image_filenames,
      })),
    })),
  );
}
