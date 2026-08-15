<template>
  <ion-page>
    <ion-content>
      <PathBrowser
        v-if="currentUser"
        :paths="visiblePaths"
        v-model:selected-path-id="selectedPathId"
        :entries="selectedPathEntries"
        :is-loading="selectedPathIsLoading"
        :has-more="selectedPathHasMore"
        @load-more="loadMore(selectedPathId)"
      />
    </ion-content>

    <BottomBar
      v-if="currentUser"
      alt-icon="📅"
      alt-label="Browse days"
      alt-to="/"
      :can-create="canCreateAny"
      :write-entry-query="{ day: todayStr, pathId: selectedPathId }"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { computed, onMounted, ref, watch } from 'vue';

import PathBrowser from '../components/PathBrowser.vue';
import BottomBar from '../components/BottomBar.vue';
import type { OAuthCallbackResponse } from '../generated/types';
import { usePaths } from '../composables/usePaths';
import { usePathVisibility } from '../composables/usePathVisibility';
import { useMultiPathEntries } from '../composables/useMultiPathEntries';
import { toLocalISODate } from '../utils/date';

const currentUser = ref<OAuthCallbackResponse | null>(null);

const { data: allPaths } = usePaths();
const { visiblePaths } = usePathVisibility(allPaths);

const selectedPathId = ref('');
watch(
  visiblePaths,
  (paths) => {
    if (!selectedPathId.value && paths.length > 0) {
      selectedPathId.value = paths[0]!.path_id;
    }
  },
  { immediate: true },
);

const selectedPathIds = computed(() =>
  selectedPathId.value ? [selectedPathId.value] : [],
);
const { pathEntries: multiPathEntries, loadMore } =
  useMultiPathEntries(selectedPathIds);
const selectedPathEntries = computed(
  () => multiPathEntries.value[0]?.entries ?? [],
);
const selectedPathIsLoading = computed(
  () => multiPathEntries.value[0]?.isListLoading ?? false,
);
const selectedPathHasMore = computed(
  () => multiPathEntries.value[0]?.hasMore ?? false,
);

const todayStr = toLocalISODate(new Date());

const canCreateAny = computed(
  () =>
    !!currentUser.value &&
    visiblePaths.value.some(
      (p) => p.owner_user_id === currentUser.value!.user_id,
    ),
);

onMounted(() => {
  const stored = localStorage.getItem('user');
  if (stored) {
    try {
      currentUser.value = JSON.parse(stored) as OAuthCallbackResponse;
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('session_token');
    }
  }
});
</script>

<style scoped>
ion-content {
  --padding-bottom: calc(var(--app-footer-clearance, 3rem) + 3.5rem) !important;
}
</style>
