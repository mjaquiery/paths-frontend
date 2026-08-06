import { computed, type Ref } from 'vue';
import { useQueries } from '@tanstack/vue-query';
import { listEntries, getEntry, listEntryImages } from '../generated/apiClient';
import type {
  EntryContentResponse,
  EntryResponse,
  ImageResponse,
} from '../generated/types';

export interface EntryWithContent extends EntryResponse {
  content?: string;
  images?: ImageResponse[];
}

export interface PathEntries {
  pathId: string;
  entries: EntryWithContent[];
}

/**
 * Fetches entry lists + content for a set of paths using TanStack Query as the only cache
 * layer (persisted via lib/queryPersister.ts's Dexie-backed persister). Content queries are
 * keyed on `entry.edit_id`, so an edit_id bump — the server's signal that content changed —
 * naturally busts the cache and refetches; no manual diffing against a second store.
 */
export function useMultiPathEntries(pathIds: Ref<string[]>) {
  const listResults = useQueries({
    queries: computed(() =>
      pathIds.value.map((pathId) => ({
        queryKey: ['v1', 'paths', pathId, 'entries'],
        queryFn: () => listEntries(pathId),
        enabled: !!pathId,
        refetchInterval: 25_000,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      })),
    ),
  });

  const entryLists = computed<{ pathId: string; entries: EntryResponse[] }[]>(
    () =>
      pathIds.value.map((pathId, i) => ({
        pathId,
        entries:
          (listResults.value[i]?.data as { data: EntryResponse[] } | undefined)
            ?.data ?? [],
      })),
  );

  const contentQueries = computed(() =>
    entryLists.value.flatMap(({ pathId, entries }) =>
      entries.map((entry) => ({
        queryKey: [
          'v1',
          'paths',
          pathId,
          'entries',
          entry.id,
          'content',
          entry.edit_id,
        ],
        queryFn: async () => {
          const [entryResult, imagesResult] = await Promise.all([
            getEntry(pathId, entry.id),
            listEntryImages(pathId, entry.id),
          ]);
          return {
            content: (entryResult.data as EntryContentResponse).content,
            images: imagesResult.data as ImageResponse[],
          };
        },
        staleTime: Infinity, // immutable for this edit_id — a new edit_id gets a new key
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      })),
    ),
  );

  const contentResults = useQueries({ queries: contentQueries });

  return computed<PathEntries[]>(() => {
    let cursor = 0;
    return entryLists.value.map(({ pathId, entries }) => ({
      pathId,
      entries: entries.map((entry): EntryWithContent => {
        const contentResult = contentResults.value[cursor++];
        const data = contentResult?.data as
          | { content: string; images: ImageResponse[] }
          | undefined;
        return { ...entry, content: data?.content, images: data?.images };
      }),
    }));
  });
}
