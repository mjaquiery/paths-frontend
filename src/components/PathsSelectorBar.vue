<template>
  <div v-if="currentUser" class="paths-selector-bar">
    <!-- Compact bar -->
    <div class="paths-bar-row">
      <!-- Mobile summary (shown via CSS on small screens when not expanded) -->
      <span
        class="paths-count-label"
        :class="{ 'paths-count-label--expanded': expanded }"
      >
        {{ visibleCount }} path{{ visibleCount === 1 ? '' : 's' }} shown
      </span>

      <!-- Chip list (always rendered; CSS controls visibility on mobile) -->
      <div
        class="paths-chip-list"
        :class="{ 'paths-chip-list--expanded': expanded }"
      >
        <button
          v-for="path in orderedPaths"
          :key="path.path_id"
          class="path-chip"
          :class="{ 'path-chip--hidden': hiddenByPath[path.path_id] }"
          :style="{
            '--chip-color': path.color,
            borderColor: path.color,
            backgroundColor: hiddenByPath[path.path_id]
              ? 'transparent'
              : hexToRgba(path.color, 0.15),
          }"
          :title="path.title"
          @click="toggleVisibility(path.path_id)"
        >
          <span
            class="path-chip-dot"
            :style="{ backgroundColor: path.color }"
          ></span>
          {{ path.title }}
        </button>
      </div>

      <div class="paths-bar-actions">
        <ion-button size="small" fill="clear" @click="expanded = !expanded">
          {{ expanded ? 'Less' : 'More' }}
        </ion-button>
        <ion-button
          v-if="currentUser"
          size="small"
          fill="clear"
          @click="openCreateForm"
          >+ New Path</ion-button
        >
      </div>
    </div>

    <!-- Expanded management view -->
    <div v-if="expanded" class="paths-expanded">
      <!-- New path form -->
      <ion-card v-if="showCreateForm" class="paths-create-card">
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
            <ion-label for="path-colour-picker" position="stacked"
              >Colour</ion-label
            >
            <div class="colour-picker-row">
              <input
                id="path-colour-picker"
                type="color"
                v-model="newPath.color"
                class="colour-picker-input"
              />
              <span class="colour-picker-hex">{{ newPath.color }}</span>
            </div>
          </ion-item>
          <div class="paths-form-actions">
            <ion-button
              size="small"
              :disabled="!newPath.title || creating"
              @click="createPath"
              >{{ creating ? 'Creating…' : 'Create' }}</ion-button
            >
            <ion-button size="small" fill="outline" @click="cancelCreate"
              >Cancel</ion-button
            >
          </div>
          <p v-if="createError" class="paths-error">{{ createError }}</p>
        </ion-card-content>
      </ion-card>

      <!-- Path list with reorder controls -->
      <ion-list class="paths-list">
        <ion-item v-for="(path, index) in orderedPaths" :key="path.path_id">
          <!-- Reorder arrows -->
          <div class="paths-reorder-arrows" slot="start">
            <ion-button
              size="small"
              fill="clear"
              :disabled="index === 0"
              aria-label="Move path up"
              @click="moveUp(index)"
              >▲</ion-button
            >
            <ion-button
              size="small"
              fill="clear"
              :disabled="index === orderedPaths.length - 1"
              aria-label="Move path down"
              @click="moveDown(index)"
              >▼</ion-button
            >
          </div>

          <!-- Color swatch -->
          <span
            class="path-swatch"
            :style="{ backgroundColor: path.color }"
            slot="start"
          ></span>

          <ion-label>
            <h2>{{ path.title }}</h2>
            <p v-if="path.description">{{ path.description }}</p>
          </ion-label>

          <!-- Visibility toggle -->
          <ion-toggle
            slot="end"
            :checked="!hiddenByPath[path.path_id]"
            @ionChange="onToggleChange(path.path_id, $event)"
          />

          <!-- Public/private chip -->
          <ion-chip
            slot="end"
            :color="path.is_public ? 'success' : 'medium'"
            class="paths-public-chip"
          >
            {{ path.is_public ? 'Public' : 'Private' }}
          </ion-chip>
        </ion-item>
      </ion-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonToggle,
  type ToggleCustomEvent,
} from '@ionic/vue';
import { computed, ref, watch } from 'vue';

import type { OAuthCallbackResponse, PathResponse } from '../generated/types';
import {
  isPathHidden,
  setPathHidden,
  getPathOrder,
  setPathOrder,
} from '../lib/db';
import { extractErrorMessage } from '../lib/errors';
import { useCreatePath } from '../generated/apiClient';
import { usePaths } from '../composables/usePaths';

defineProps<{
  currentUser: OAuthCallbackResponse | null;
}>();

const emit = defineEmits<{
  pathsChanged: [paths: PathResponse[]];
}>();

const { data: allPaths, refetch } = usePaths();
const { mutateAsync: createPathMutation, isPending: creating } =
  useCreatePath();

const expanded = ref(false);
const showCreateForm = ref(false);
const createError = ref('');
const hiddenByPath = ref<Record<string, boolean>>({});
const pathOrder = ref<string[]>([]);

const DEFAULT_COLOR = '#3949ab';
const newPath = ref({ title: '', description: '', color: DEFAULT_COLOR });

// Build ordered + hidden state when paths load
watch(
  allPaths,
  async (paths) => {
    if (!paths) return;
    const hidden = await Promise.all(
      paths.map(
        async (p: PathResponse) =>
          [p.path_id, await isPathHidden(p.path_id)] as const,
      ),
    );
    hiddenByPath.value = Object.fromEntries(hidden);

    // Merge stored order with current paths
    const stored = getPathOrder();
    const ids = paths.map((p: PathResponse) => p.path_id);
    const ordered = [
      ...stored.filter((id) => ids.includes(id)),
      ...ids.filter((id) => !stored.includes(id)),
    ];
    pathOrder.value = ordered;
  },
  { immediate: true },
);

const orderedPaths = computed<PathResponse[]>(() => {
  if (!allPaths.value) return [];
  return pathOrder.value
    .map((id) => allPaths.value!.find((p: PathResponse) => p.path_id === id))
    .filter((p): p is PathResponse => !!p);
});

const visibleCount = computed(
  () => orderedPaths.value.filter((p) => !hiddenByPath.value[p.path_id]).length,
);

// Emit visible ordered paths whenever they change
watch(
  [orderedPaths, hiddenByPath],
  () => {
    const visible = orderedPaths.value.filter(
      (p) => !hiddenByPath.value[p.path_id],
    );
    emit('pathsChanged', visible);
  },
  { deep: true, immediate: true },
);

async function toggleVisibility(pathId: string) {
  const nowHidden = !hiddenByPath.value[pathId];
  hiddenByPath.value[pathId] = nowHidden;
  await setPathHidden(pathId, nowHidden);
}

async function onToggleChange(pathId: string, event: ToggleCustomEvent) {
  const visible = Boolean(event.detail.checked);
  hiddenByPath.value[pathId] = !visible;
  await setPathHidden(pathId, !visible);
}

function moveUp(index: number) {
  if (index === 0) return;
  const ids = [...pathOrder.value];
  const tmp = ids[index - 1]!;
  ids[index - 1] = ids[index]!;
  ids[index] = tmp;
  pathOrder.value = ids;
  setPathOrder(ids);
}

function moveDown(index: number) {
  if (index >= pathOrder.value.length - 1) return;
  const ids = [...pathOrder.value];
  const tmp = ids[index]!;
  ids[index] = ids[index + 1]!;
  ids[index + 1] = tmp;
  pathOrder.value = ids;
  setPathOrder(ids);
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
  } catch (err: unknown) {
    const detail = extractErrorMessage(err);
    createError.value = detail
      ? `Failed to create path: ${detail}`
      : 'Failed to create path. Please try again.';
  }
}

function openCreateForm() {
  expanded.value = true;
  showCreateForm.value = true;
}

function cancelCreate() {
  showCreateForm.value = false;
  newPath.value = { title: '', description: '', color: DEFAULT_COLOR };
  createError.value = '';
}

function hexToRgba(hex: string, alpha: number): string {
  if (typeof hex !== 'string') return `rgba(0,0,0,${alpha})`;
  let normalized = hex.trim();
  if (!normalized.startsWith('#')) normalized = `#${normalized}`;
  // Expand 3-digit shorthand (#rgb → #rrggbb)
  if (/^#[0-9a-fA-F]{3}$/.test(normalized)) {
    normalized = `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(normalized)) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
</script>

<style scoped>
.paths-selector-bar {
  border-bottom: 1px solid var(--ion-color-light-shade, #e0e0e0);
  background: var(--ion-background-color, #fff);
  padding: 4px 8px;
}

.paths-bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* Default (≥768 px): hide count label, show chips */
.paths-count-label {
  display: none;
  flex: 1;
  font-size: 0.875rem;
  color: var(--ion-color-medium, #666);
}

.paths-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

/* Mobile (<768 px): show count, hide chips unless expanded */
@media (max-width: 767px) {
  .paths-count-label {
    display: inline;
  }

  .paths-count-label--expanded {
    display: none;
  }

  .paths-chip-list {
    display: none;
  }

  .paths-chip-list--expanded {
    display: flex;
  }
}

.path-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px 3px 6px;
  border-radius: 999px;
  border: 2px solid;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.15s,
    opacity 0.15s;
  background: none;
}

.path-chip--hidden {
  opacity: 0.45;
}

.path-chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.paths-bar-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
}

.paths-expanded {
  padding: 4px 0;
}

.paths-create-card {
  margin: 8px 0;
}

.paths-form-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.paths-error {
  color: var(--ion-color-danger, red);
  font-size: 0.85rem;
  margin-top: 4px;
}

.paths-list {
  padding: 0;
}

.path-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 6px;
  flex-shrink: 0;
}

.paths-reorder-arrows {
  display: flex;
  flex-direction: column;
}

.paths-public-chip {
  font-size: 0.75rem;
}

.colour-picker-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.colour-picker-input {
  width: 44px;
  height: 36px;
  border: 1px solid var(--ion-color-light-shade, #ccc);
  border-radius: 4px;
  cursor: pointer;
  padding: 2px;
  background: none;
}

.colour-picker-hex {
  font-size: 0.875rem;
  color: var(--ion-color-dark, #333);
  font-family: monospace;
}
</style>
