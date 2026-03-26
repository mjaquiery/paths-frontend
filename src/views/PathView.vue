<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>
          <span v-if="path" class="path-view-title">
            <span
              class="path-view-dot"
              :style="{ backgroundColor: path.color }"
            ></span>
            {{ path.title }}
          </span>
          <span v-else>Path</span>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button
            v-if="isOwned"
            :router-link="`/entry/${pathId}/new`"
            router-direction="forward"
            >+ Entry</ion-button
          >
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="groupedEntries.length === 0" class="path-empty">
        <p>No entries yet.</p>
        <ion-button
          v-if="isOwned"
          :router-link="`/entry/${pathId}/new`"
          router-direction="forward"
          >Write first entry</ion-button
        >
      </div>
      <div v-for="group in groupedEntries" :key="group.label">
        <h3 class="path-month-label">{{ group.label }}</h3>
        <div
          v-for="entry in group.entries"
          :key="entry.id"
          class="path-entry-row"
          role="button"
          tabindex="0"
          @click="router.push(`/entry/${pathId}/${entry.id}`)"
          @keydown.enter="router.push(`/entry/${pathId}/${entry.id}`)"
          @keydown.space.prevent="router.push(`/entry/${pathId}/${entry.id}`)"
        >
          <span class="path-entry-date">{{ entry.day }}</span>
          <span class="path-entry-preview">{{
            entry.content || '(no text)'
          }}</span>
          <span
            v-if="(entry.image_filenames?.length ?? 0) > 0"
            class="path-entry-images"
            >📷 {{ entry.image_filenames?.length }}</span
          >
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonBackButton,
} from '@ionic/vue';
import { useRoute, useRouter } from '@ionic/vue-router';
import { computed } from 'vue';
import { usePaths } from '../composables/usePaths';
import { useMultiPathEntries } from '../composables/useMultiPathEntries';

const route = useRoute();
const router = useRouter();
const pathId = computed(() => String(route.params.pathId));

const { data: paths } = usePaths();
const path = computed(
  () => (paths.value ?? []).find((p) => p.path_id === pathId.value) ?? null,
);

const storedUser = localStorage.getItem('user');
let currentUserId = '';
try {
  currentUserId = storedUser
    ? (JSON.parse(storedUser) as { user_id: string }).user_id
    : '';
} catch {
  currentUserId = '';
}
const isOwned = computed(() => path.value?.owner_user_id === currentUserId);

const pathIdArr = computed(() => (path.value ? [pathId.value] : []));
const multiPathEntries = useMultiPathEntries(pathIdArr);

const entries = computed(() => {
  const pe = multiPathEntries.value.find((x) => x.pathId === pathId.value);
  return (pe?.entries ?? []).slice().sort((a, b) => b.day.localeCompare(a.day));
});

interface EntryGroup {
  label: string;
  entries: typeof entries.value;
}
const groupedEntries = computed<EntryGroup[]>(() => {
  const groups: Map<string, EntryGroup> = new Map();
  for (const entry of entries.value) {
    const d = new Date(entry.day + 'T00:00:00');
    const label = d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
    });
    if (!groups.has(label)) groups.set(label, { label, entries: [] });
    groups.get(label)!.entries.push(entry);
  }
  return Array.from(groups.values());
});
</script>

<style scoped>
.path-view-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.path-view-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.path-empty {
  padding: 24px 0;
  text-align: center;
  color: var(--ion-color-medium);
}
.path-month-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ion-color-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 20px 0 8px;
}
.path-entry-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--ion-card-background);
  border-radius: var(--paths-border-radius);
  margin-bottom: 6px;
  cursor: pointer;
}
.path-entry-row:hover {
  background: var(--paths-card-hover);
}
.path-entry-date {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  min-width: 88px;
  flex-shrink: 0;
}
.path-entry-preview {
  font-size: 0.9rem;
  color: var(--ion-text-color);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  flex: 1;
}
.path-entry-images {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  flex-shrink: 0;
}
</style>
