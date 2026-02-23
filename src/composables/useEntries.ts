import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import type { Ref } from 'vue';
import type { EntryContentResponse, EntryResponse } from '../generated/types';
import { listEntries, getEntry } from '../generated/apiClient';

export function useEntries(pathId: Ref<string>) {
  return useQuery({
    queryKey: computed(() => ['v1', 'paths', pathId.value, 'entries']),
    queryFn: async () => (await listEntries(pathId.value)).data as EntryResponse[],
    enabled: computed(() => !!pathId.value),
  });
}

export function useEntryContent(
  pathId: Ref<string>,
  entryId: Ref<string>,
  editId: Ref<string>,
) {
  return useQuery({
    queryKey: computed(() => [
      'entry-content',
      pathId.value,
      entryId.value,
      editId.value,
    ]),
    queryFn: async () =>
      (await getEntry(pathId.value, entryId.value)).data as EntryContentResponse,
    enabled: computed(
      () => !!pathId.value && !!entryId.value && !!editId.value,
    ),
  });
}
