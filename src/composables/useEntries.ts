import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import type { Ref } from 'vue';
import type { EntryContentResponse, EntryResponse } from '../generated/types';
import { listEntriesV1PathIdEntriesGet, getEntryV1PathIdEntriesEntryIdGet } from '../generated/apiClient';

export function useEntries(pathId: Ref<string>) {
  return useQuery({
    queryKey: computed(() => ['entries', pathId.value]),
    queryFn: async () => (await listEntriesV1PathIdEntriesGet(pathId.value)).data as EntryResponse[],
    enabled: computed(() => !!pathId.value),
  });
}

export function useEntryContent(pathId: Ref<string>, entryId: Ref<string>, editId: Ref<string>) {
  return useQuery({
    queryKey: computed(() => ['entry-content', pathId.value, entryId.value, editId.value]),
    queryFn: async () =>
      (await getEntryV1PathIdEntriesEntryIdGet(pathId.value, entryId.value)).data as EntryContentResponse,
    enabled: computed(() => !!pathId.value && !!entryId.value && !!editId.value),
  });
}
