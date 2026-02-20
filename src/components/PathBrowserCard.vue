<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Path visibility (local only)</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <ion-button size="small" @click="refetch">Refresh paths</ion-button>
      <ion-item lines="none">
        <ion-label>Show hidden paths</ion-label>
        <ion-toggle v-model="showHidden"></ion-toggle>
      </ion-item>
      <ion-list>
        <ion-item v-for="path in displayPaths" :key="path.path_id">
          <ion-label>
            <h2>{{ path.title }}</h2>
            <p>{{ path.path_id }}</p>
          </ion-label>
          <ion-chip :color="path.is_public ? 'success' : 'medium'">
            <ion-label>{{ path.is_public ? 'public' : 'private' }}</ion-label>
          </ion-chip>
          <ion-button size="small" @click="emit('pathSelected', path.path_id)"
            >Entries</ion-button
          >
          <ion-toggle
            :checked="!hiddenByPath[path.path_id]"
            @ionChange="togglePath(path.path_id, $event)"
          >
          </ion-toggle>
        </ion-item>
      </ion-list>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonItem,
  IonLabel,
  IonList,
  IonToggle,
  type ToggleCustomEvent,
} from '@ionic/vue';
import { computed, ref, watch } from 'vue';

import type { PathResponse } from '../generated/types';
import { isPathHidden, setPathHidden } from '../lib/db';
import { usePaths } from '../composables/usePaths';

const emit = defineEmits<{
  pathSelected: [pathId: string];
  pathsUpdated: [paths: PathResponse[]];
}>();

const { data: paths, refetch } = usePaths();
const hiddenByPath = ref<Record<string, boolean>>({});
const showHidden = ref(false);

watch(
  paths,
  async (newPaths) => {
    if (!newPaths) return;
    const hiddenEntries = await Promise.all(
      newPaths.map(
        async (path: PathResponse) =>
          [path.path_id, await isPathHidden(path.path_id)] as const,
      ),
    );
    hiddenByPath.value = Object.fromEntries(hiddenEntries);
    emit('pathsUpdated', newPaths);
  },
  { immediate: true },
);

const displayPaths = computed(() => {
  if (!paths.value) return [];
  if (showHidden.value) {
    return paths.value;
  }
  return paths.value.filter(
    (path: PathResponse) => !hiddenByPath.value[path.path_id],
  );
});

async function togglePath(pathId: string, event: ToggleCustomEvent) {
  const visible = Boolean(event.detail.checked);
  hiddenByPath.value[pathId] = !visible;
  await setPathHidden(pathId, !visible);
}
</script>
