<template>
  <div class="path-browser df-ui">
    <div class="pb-header">
      <select
        v-model="localSelectedPathId"
        class="pb-path-select"
        aria-label="Path"
        :style="{ borderColor: selectedPath?.color }"
      >
        <option v-for="path in paths" :key="path.path_id" :value="path.path_id">
          {{ path.title }}
        </option>
      </select>
    </div>

    <div class="pb-entry-section">
      <div v-if="isLoading" class="pb-loading" data-testid="pb-loading">
        <ion-spinner name="crescent" aria-label="Loading entries" />
        <span>Loading entries…</span>
      </div>
      <template v-else-if="visibleEntries.length > 0">
        <div
          v-for="entry in visibleEntries"
          :key="entry.id"
          class="pb-entry df-path-bar"
          :style="{ '--path-color': selectedPath?.color }"
        >
          <router-link
            class="pb-entry-main"
            :to="`/entry/${props.selectedPathId}/${entry.id}`"
            :aria-label="`View entry from ${dateLabel(entry.day)}`"
          >
            <p class="pb-entry-date">{{ dateLabel(entry.day) }}</p>
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
          <div v-if="(entry.images?.length ?? 0) > 0" class="pb-entry-photos">
            <EntryImage
              v-for="(img, idx) in entry.images!.slice(0, 3)"
              :key="img.id"
              :image-id="img.id"
              :alt="img.filename"
              class="pb-entry-photo"
              @open="openLightbox(entry.images!, idx, entry.day)"
            />
          </div>
        </div>
        <button v-if="hasMore" class="pb-load-more" @click="emit('load-more')">
          Load earlier entries
        </button>
      </template>
      <p v-else class="pb-empty">No entries yet.</p>
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
import { computed, ref } from 'vue';
import { IonSpinner } from '@ionic/vue';

import type { ImageResponse, PathResponse } from '../generated/types';
import type { EntryWithContent } from '../composables/useMultiPathEntries';
import EntryImage from './EntryImage.vue';
import ImageLightbox from './ImageLightbox.vue';

const props = defineProps<{
  paths: PathResponse[];
  selectedPathId: string;
  entries: EntryWithContent[];
  isLoading?: boolean;
  hasMore?: boolean;
}>();

const emit = defineEmits<{
  'update:selectedPathId': [string];
  'load-more': [];
}>();

const localSelectedPathId = computed({
  get: () => props.selectedPathId,
  set: (value: string) => emit('update:selectedPathId', value),
});

const selectedPath = computed(() =>
  props.paths.find((p) => p.path_id === props.selectedPathId),
);

const sortedEntries = computed(() =>
  [...props.entries].sort((a, b) =>
    a.day < b.day ? 1 : a.day > b.day ? -1 : 0,
  ),
);

const visibleEntries = computed(() =>
  sortedEntries.value.filter((entry) => entry.inWindow),
);

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

.pb-path-select {
  border: 1px solid var(--color-rule);
  border-radius: 999px;
  background: none;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.9rem;
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
