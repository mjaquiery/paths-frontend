<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Path visibility (local only)</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <ion-button size="small" @click="refreshPaths">Refresh paths</ion-button>
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
          <ion-button size="small" @click="emit('pathSelected', path.path_id)">Entries</ion-button>
          <ion-toggle :checked="!hiddenByPath[path.path_id]" @ionChange="togglePath(path.path_id, $event)"> </ion-toggle>
        </ion-item>
      </ion-list>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonItem, IonLabel, IonList, IonToggle, type ToggleCustomEvent } from '@ionic/vue';
import { computed, ref } from 'vue';

import type { PathResponse } from '../generated/types';
import { isPathHidden, setPathHidden } from '../lib/db';
import { api } from '../lib/api';

const emit = defineEmits<{
  pathSelected: [pathId: string];
  pathsUpdated: [paths: PathResponse[]];
}>();

const paths = ref<PathResponse[]>(await api.list_paths_v1_paths_get());
const hiddenByPath = ref<Record<string, boolean>>({});
const showHidden = ref(false);

const hiddenEntries = await Promise.all(paths.value.map(async (path) => [path.path_id, await isPathHidden(path.path_id)] as const));
hiddenByPath.value = Object.fromEntries(hiddenEntries);
emit('pathsUpdated', paths.value);

const displayPaths = computed(() => {
  if (showHidden.value) {
    return paths.value;
  }
  return paths.value.filter((path) => !hiddenByPath.value[path.path_id]);
});

async function refreshPaths() {
  paths.value = await api.list_paths_v1_paths_get();
  emit('pathsUpdated', paths.value);
}

async function togglePath(pathId: string, event: ToggleCustomEvent) {
  const visible = Boolean(event.detail.checked);
  hiddenByPath.value[pathId] = !visible;
  await setPathHidden(pathId, !visible);
}
</script>
