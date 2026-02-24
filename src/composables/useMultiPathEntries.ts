import { computed, type Ref } from 'vue';
import { useQueries } from '@tanstack/vue-query';
import { listEntries } from '../generated/apiClient';
import type { EntryResponse } from '../generated/types';

export interface PathEntries {
  pathId: string;
  entries: EntryResponse[];
}

export function useMultiPathEntries(pathIds: Ref<string[]>) {
  const results = useQueries({
    queries: computed(() =>
      pathIds.value.map((pathId) => ({
        queryKey: ['v1', 'paths', pathId, 'entries'],
        queryFn: () => listEntries(pathId),
        enabled: !!pathId,
      })),
    ),
  });

  return computed<PathEntries[]>(() =>
    pathIds.value.map((pathId, i) => ({
      pathId,
      entries:
        (results.value[i]?.data as { data?: EntryResponse[] } | undefined)
          ?.data ?? [],
    })),
  );
}
