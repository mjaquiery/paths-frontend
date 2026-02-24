<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Path visibility (local only)</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <ion-button size="small" @click="refetch">Refresh paths</ion-button>
      <ion-button
        v-if="canCreatePaths"
        size="small"
        @click="showCreateForm = !showCreateForm"
        >New Path</ion-button
      >
      <ion-item lines="none">
        <ion-label>Show hidden paths</ion-label>
        <ion-toggle v-model="showHidden"></ion-toggle>
      </ion-item>
      <ion-card v-if="showCreateForm">
        <ion-card-content>
          <ion-item>
            <ion-label position="stacked">Title *</ion-label>
            <ion-input v-model="newPath.title" placeholder="Path title" />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Description</ion-label>
            <ion-input
              v-model="newPath.description"
              placeholder="Optional description"
            />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Color</ion-label>
            <ion-input
              v-model="newPath.color"
              :placeholder="DEFAULT_COLOR"
              pattern="^#[0-9A-Fa-f]{6}$"
              :maxlength="7"
            />
          </ion-item>
          <ion-button
            size="small"
            :disabled="!newPath.title || creating"
            @click="createPath"
            >{{ creating ? 'Creating...' : 'Create' }}</ion-button
          >
          <ion-button size="small" fill="outline" @click="cancelCreate"
            >Cancel</ion-button
          >
          <p v-if="createError" style="color: red">{{ createError }}</p>
        </ion-card-content>
      </ion-card>
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
  IonInput,
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
import { useCreatePath } from '../generated/apiClient';

const props = withDefaults(
  defineProps<{
    canCreatePaths?: boolean;
  }>(),
  { canCreatePaths: true },
);

const emit = defineEmits<{
  pathSelected: [pathId: string];
  pathsUpdated: [paths: PathResponse[]];
}>();

const { data: paths, refetch } = usePaths();
const { mutateAsync: createPathMutation, isPending: creating } =
  useCreatePath();
const hiddenByPath = ref<Record<string, boolean>>({});
const showHidden = ref(false);

const DEFAULT_COLOR = '#3880ff';

const showCreateForm = ref(false);
const createError = ref('');
const newPath = ref({ title: '', description: '', color: DEFAULT_COLOR });

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

async function createPath() {
  if (!newPath.value.title) return;
  createError.value = '';
  try {
    await createPathMutation({
      data: {
        title: newPath.value.title,
        description: newPath.value.description || null,
        color: newPath.value.color || DEFAULT_COLOR,
      },
    });
    cancelCreate();
    await refetch();
  } catch (e) {
    createError.value = 'Failed to create path. Please try again.';
  }
}

function cancelCreate() {
  showCreateForm.value = false;
  newPath.value = { title: '', description: '', color: DEFAULT_COLOR };
  createError.value = '';
}
</script>
