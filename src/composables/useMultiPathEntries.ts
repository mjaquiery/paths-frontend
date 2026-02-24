import { computed, ref, watch, type Ref } from 'vue';
import { useQueries } from '@tanstack/vue-query';
import { listEntries, getEntry } from '../generated/apiClient';
import type { EntryContentResponse, EntryResponse } from '../generated/types';
import { db } from '../lib/db';

export interface EntryWithContent extends EntryResponse {
  content?: string;
}

export interface PathEntries {
  pathId: string;
  entries: EntryWithContent[];
}

/** Tracks which edit_id we last loaded content for, keyed by entry id. */
interface ContentState {
  editId: string;
  content?: string;
}

export function useMultiPathEntries(pathIds: Ref<string[]>) {
  const contentCache = ref<Record<string, ContentState>>({});

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
            };
            continue;
          }

          // Fetch from API and store in Dexie.
          try {
            const resp = await getEntry(pathId, entry.id);
            const content =
              (resp.data as EntryContentResponse | undefined)?.content ?? '';
            await db.entryContent.put({
              id: entry.id,
              path_id: entry.path_id,
              day: entry.day,
              edit_id: entry.edit_id,
              content,
            });
            contentCache.value[entry.id] = { editId: entry.edit_id, content };
          } catch {
            // Keep stale content if present, or mark as attempted.
            contentCache.value[entry.id] = {
              editId: entry.edit_id,
              content: contentCache.value[entry.id]?.content,
            };
          }
        }
      }
    },
    { deep: true },
  );

  return computed<PathEntries[]>(() =>
    pathIds.value.map((pathId, i) => ({
      pathId,
      entries:
        (
          results.value[i]?.data as { data?: EntryResponse[] } | undefined
        )?.data?.map((entry) => ({
          ...entry,
          content: contentCache.value[entry.id]?.content,
        })) ?? [],
    })),
  );
}
