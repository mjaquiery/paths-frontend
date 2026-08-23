<template>
  <div class="path-browser df-ui">
    <div class="pb-header">
      <div class="pb-path-toggles" role="group" aria-label="Paths shown">
        <button
          v-for="path in paths"
          :key="path.path_id"
          type="button"
          class="pb-path-toggle"
          :class="{ 'pb-path-toggle--on': isSelected(path.path_id) }"
          :style="{ '--path-color': path.color }"
          :aria-pressed="isSelected(path.path_id)"
          @click="toggle(path.path_id)"
        >
          {{ path.title }}
        </button>
      </div>
    </div>

    <div class="pb-entry-section">
      <p v-if="notFoundPathIds.length > 0" class="pb-empty">
        {{
          notFoundPathIds.length > 1
            ? "Some of these paths couldn't be found. They may have been deleted."
            : "This path couldn't be found. It may have been deleted."
        }}
      </p>
      <div v-if="isLoading" class="pb-loading" data-testid="pb-loading">
        <ion-spinner name="crescent" aria-label="Loading entries" />
        <span>Loading entries…</span>
      </div>
      <template v-else-if="visibleEntries.length > 0">
        <div
          v-for="entry in visibleEntries"
          :key="`${entry.pathId}:${entry.id}`"
          :ref="(el) => registerEntryEl(entry.pathId, entry.day, el)"
          class="pb-entry df-path-bar"
          :class="{
            'pb-entry--centered': entry.day === props.centerDay,
          }"
          :style="{ '--path-color': entry.pathColor }"
        >
          <router-link
            class="pb-entry-main"
            :to="{
              path: `/entry/${entry.pathId}/${entry.id}`,
              query: { from: 'paths' },
            }"
            :aria-label="`View entry from ${dateLabel(entry.day)}`"
          >
            <p class="pb-entry-date">
              {{ dateLabel(entry.day) }}
              <span v-if="showPathLabels" class="pb-entry-path">
                · {{ entry.pathTitle }}</span
              >
            </p>
            <p class="pb-entry-preview df-body">
              <ion-spinner
                v-if="entry.content === undefined"
                name="crescent"
                class="pb-entry-spinner"
                data-testid="pb-entry-spinner"
                aria-label="Loading entry"
              />
              <template v-else>{{ entry.content || '(no text)' }}</template>
            </p>
          </router-link>
          <div v-if="entry.images.length > 0" class="pb-entry-photos">
            <EntryImage
              v-for="(img, idx) in entry.images.slice(0, 3)"
              :key="img.id"
              :image-id="img.id"
              :alt="img.filename"
              class="pb-entry-photo"
              @open="openLightbox(entry.images, idx, entry.day)"
            />
          </div>
        </div>
        <button v-if="hasMore" class="pb-load-more" @click="emit('load-more')">
          Load earlier entries
        </button>
      </template>
      <p v-else-if="notFoundPathIds.length === 0" class="pb-empty">
        No entries yet.
      </p>
    </div>

    <ImageLightbox
      :is-open="lightbox !== null"
      :images="lightbox?.images ?? []"
      :start-index="lightbox?.index ?? 0"
      :day="lightbox?.day ?? ''"
      @dismiss="lightbox = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { IonSpinner } from '@ionic/vue';

import type { ImageResponse, PathResponse } from '../generated/types';
import type { PathEntries } from '../composables/useMultiPathEntries';
import EntryImage from './EntryImage.vue';
import ImageLightbox from './ImageLightbox.vue';

const props = defineProps<{
  paths: PathResponse[];
  selectedPathIds: string[];
  pathEntries: PathEntries[];
  isLoading?: boolean;
  hasMore?: boolean;
  /** Selected path ids absent from the user's own path list — deleted, or stale/bad links. */
  notFoundPathIds?: string[];
  /** When set, scrolls to and highlights the entry for this day once it renders. */
  centerDay?: string;
}>();

const emit = defineEmits<{
  'update:selectedPathIds': [string[]];
  'load-more': [];
}>();

const notFoundPathIds = computed(() => props.notFoundPathIds ?? []);

function isSelected(pathId: string): boolean {
  return props.selectedPathIds.includes(pathId);
}

function toggle(pathId: string) {
  const next = isSelected(pathId)
    ? props.selectedPathIds.filter((id) => id !== pathId)
    : [...props.selectedPathIds, pathId];
  emit('update:selectedPathIds', next);
}

// A path badge on every entry only earns its place once there's more than one
// path's entries to tell apart in the merged, date-ordered feed below.
const showPathLabels = computed(() => props.selectedPathIds.length > 1);

interface MergedEntry {
  id: string;
  pathId: string;
  pathTitle: string;
  pathColor: string;
  day: string;
  content: string | undefined;
  images: ImageResponse[];
}

const pathById = computed(
  () => new Map(props.paths.map((p) => [p.path_id, p])),
);

const visibleEntries = computed<MergedEntry[]>(() => {
  const merged: MergedEntry[] = [];
  for (const { pathId, entries } of props.pathEntries) {
    const path = pathById.value.get(pathId);
    if (!path) continue;
    for (const entry of entries) {
      if (!entry.inWindow) continue;
      merged.push({
        id: entry.id,
        pathId,
        pathTitle: path.title,
        pathColor: path.color,
        day: entry.day,
        content: entry.content,
        images: entry.images ?? [],
      });
    }
  }
  return merged.sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0));
});

const lightbox = ref<{
  images: ImageResponse[];
  index: number;
  day: string;
} | null>(null);
function openLightbox(images: ImageResponse[], index: number, day: string) {
  lightbox.value = { images, index, day };
}

function dateLabel(day: string): string {
  return new Date(day + 'T00:00:00').toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const entryEls = new Map<string, HTMLElement>();
function registerEntryEl(pathId: string, day: string, el: unknown) {
  const key = `${pathId}:${day}`;
  if (el instanceof HTMLElement) entryEls.set(key, el);
  else entryEls.delete(key);
}

// Scrolls to the day the caller wants this view "centred" on (e.g. arriving
// here from an entry's path label) as soon as that entry's row exists —
// which may only be after ensureDayLoaded() pulls it into the render window.
watch(
  () => [props.centerDay, visibleEntries.value.length] as const,
  async () => {
    if (!props.centerDay) return;
    await nextTick();
    const match = visibleEntries.value.find((e) => e.day === props.centerDay);
    if (!match) return;
    entryEls
      .get(`${match.pathId}:${match.day}`)
      ?.scrollIntoView({ block: 'center' });
  },
  { immediate: true },
);
</script>

<style scoped>
.path-browser {
  padding: 0 var(--page-margin, 0.75rem);
}

.pb-header {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 0.5rem 0;
  background: var(--color-paper);
  border-bottom: 1px solid var(--color-rule);
}

.pb-path-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.pb-path-toggle {
  border: 1px solid var(--path-color, var(--color-rule));
  border-radius: 999px;
  background: none;
  font-family: var(--font-sans);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.3rem 0.8rem;
  color: var(--color-ink-muted);
  cursor: pointer;
}

.pb-path-toggle--on {
  background: color-mix(
    in srgb,
    var(--path-color, var(--color-ink)) 15%,
    transparent
  );
  color: var(--color-ink);
}

.pb-entry-section {
  padding: 0.75rem 0 1rem;
}

.pb-empty {
  color: var(--color-ink-muted);
  font-size: 0.85rem;
}

.pb-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-ink-muted);
  font-size: 0.85rem;
  padding: 0.5rem 0;
}

.pb-entry-spinner {
  width: 1rem;
  height: 1rem;
}

.pb-load-more {
  display: block;
  width: 100%;
  background: none;
  border: none;
  color: var(--color-ink-muted);
  font-size: 0.85rem;
  text-decoration: underline;
  cursor: pointer;
  padding: 0.9rem 0;
  text-align: center;
}

.pb-entry {
  padding: 0.6rem 0 0.6rem calc(var(--page-margin, 0.75rem) - 2px);
  border-bottom: 1px solid var(--color-rule);
}

.pb-entry:last-child {
  border-bottom: none;
}

.pb-entry--centered {
  background: color-mix(
    in srgb,
    var(--path-color, var(--color-ink)) 8%,
    transparent
  );
}

.pb-entry-main {
  display: block;
  text-decoration: none;
  color: inherit;
}

.pb-entry-date {
  margin: 0 0 0.2rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-ink-muted);
  text-transform: uppercase;
}

.pb-entry-path {
  color: var(--path-color, var(--color-ink-muted));
}

.pb-entry-preview {
  margin: 0;
  font-size: 1rem;
  color: var(--color-ink);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.pb-entry-photos {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.pb-entry-photo :deep(.entry-image-thumb),
.pb-entry-photo :deep(.entry-image-placeholder) {
  width: 44px;
  height: 44px;
}
</style>
