<template>
  <ion-page>
    <ion-content>
      <PathBrowser
        v-if="currentUser"
        :paths="visiblePaths"
        v-model:selected-path-ids="selectedPathIds"
        :path-entries="multiPathEntries"
        :is-loading="anyPathIsListLoading"
        :has-more="anyPathHasMore"
        :not-found-path-ids="notFoundPathIds"
        :center-day="centerDay"
        @load-more="loadMore()"
      />
    </ion-content>

    <BottomBar
      v-if="currentUser"
      alt-icon="📅"
      alt-label="Browse days"
      alt-to="/"
      :can-create="canCreateAny"
      :write-entry-query="{ day: todayStr, pathId: writeEntryPathId }"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import PathBrowser from '../components/PathBrowser.vue';
import BottomBar from '../components/BottomBar.vue';
import type { OAuthCallbackResponse } from '../generated/types';
import { usePaths } from '../composables/usePaths';
import { usePathVisibility } from '../composables/usePathVisibility';
import { useMultiPathEntries } from '../composables/useMultiPathEntries';
import { toLocalISODate } from '../utils/date';

const route = useRoute();
const currentUser = ref<OAuthCallbackResponse | null>(null);

const { data: allPaths, isPending: pathsLoading } = usePaths();
const { visiblePaths } = usePathVisibility(allPaths);

const centerDay =
  typeof route.query.day === 'string' ? route.query.day : undefined;

// Repeated ?pathId=a&pathId=b query params select multiple paths; a single
// ?pathId=a still works (vue-router hands it back as a plain string). No
// pathId at all defaults to every currently-visible path once they load.
function pathIdsFromQuery(): string[] {
  const raw = route.query.pathId;
  if (Array.isArray(raw)) return raw.filter((v): v is string => !!v);
  return typeof raw === 'string' ? [raw] : [];
}

const selectedPathIds = ref<string[]>(pathIdsFromQuery());
watch(
  visiblePaths,
  (paths) => {
    if (selectedPathIds.value.length === 0 && paths.length > 0) {
      selectedPathIds.value = paths.map((p) => p.path_id);
    }
  },
  { immediate: true },
);

// Checked against allPaths (not visiblePaths, which also excludes paths the
// user has merely hidden) — a pathId absent from the user's own path list
// entirely means deleted, or a stale/bad link, not a display preference.
const notFoundPathIds = computed(() =>
  pathsLoading.value
    ? []
    : selectedPathIds.value.filter(
        (id) => !allPaths.value?.some((p) => p.path_id === id),
      ),
);

const {
  pathEntries: multiPathEntries,
  loadMore,
  ensureDayLoaded,
} = useMultiPathEntries(selectedPathIds);

watch(
  selectedPathIds,
  (ids) => {
    if (centerDay && ids.length > 0) ensureDayLoaded(centerDay);
  },
  { immediate: true },
);

const anyPathIsListLoading = computed(() =>
  multiPathEntries.value.some((pe) => pe.isListLoading),
);
const anyPathHasMore = computed(() =>
  multiPathEntries.value.some((pe) => pe.hasMore),
);

// New entries need a single path to attach to — the first selected path the
// current user owns, falling back to the first selected path at all.
const writeEntryPathId = computed(() => {
  const owned = visiblePaths.value.find(
    (p) =>
      selectedPathIds.value.includes(p.path_id) &&
      p.owner_user_id === currentUser.value?.user_id,
  );
  return owned?.path_id ?? selectedPathIds.value[0];
});

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
