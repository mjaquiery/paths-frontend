import { computed } from 'vue';
import type { Ref } from 'vue';
import type { EntryContentResponse, EntryResponse } from '../generated/types';
import { useListEntries, useGetEntry } from '../generated/apiClient';

export function useEntries(pathId: Ref<string>) {
  return useListEntries(pathId, {
    query: {
      // orval's generated default only excludes null/undefined, not '' — explicit
      // override needed so an empty pathId (e.g. before a path is selected) doesn't fire.
      enabled: computed(() => !!pathId.value),
      select: (r) => r.data as EntryResponse[],
    },
  });
}

export function useEntryContent(
  pathId: Ref<string>,
  entryId: Ref<string>,
  editId: Ref<string>,
) {
  return useGetEntry(pathId, entryId, {
    query: {
      queryKey: ['v1', 'paths', pathId, 'entries', entryId, editId],
      enabled: computed(
        () => !!pathId.value && !!entryId.value && !!editId.value,
      ),
      select: (r) => r.data as EntryContentResponse,
    },
  });
}
