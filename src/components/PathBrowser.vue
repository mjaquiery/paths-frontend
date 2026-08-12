<template>
  <div class="path-browser df-ui">
    <div class="pb-header">
      <select
        v-model="localSelectedPathId"
        class="pb-path-select"
        aria-label="Path"
        :style="{ borderColor: selectedPath?.color, color: selectedPath?.color }"
      >
        <option v-for="path in paths" :key="path.path_id" :value="path.path_id">
          {{ path.title }}
        </option>
      </select>
    </div>

    <div class="pb-entry-section">
      <template v-if="sortedEntries.length > 0">
        <div
          v-for="entry in sortedEntries"
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
              {{
                entry.content === undefined
                  ? 'Fetching…'
                  : entry.content || '(no text)'
              }}
            </p>
          </router-link>
          <div v-if="(entry.images?.length ?? 0) > 0" class="pb-entry-photos">
            <EntryImage
              v-for="img in entry.images!.slice(0, 3)"
              :key="img.id"
              :image-id="img.id"
              :alt="img.filename"
              class="pb-entry-photo"
            />
          </div>
        </div>
      </template>
      <p v-else class="pb-empty">No entries yet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { PathResponse } from '../generated/types';
import type { EntryWithContent } from '../composables/useMultiPathEntries';
import EntryImage from './EntryImage.vue';

const props = defineProps<{
  paths: PathResponse[];
  selectedPathId: string;
  entries: EntryWithContent[];
}>();

const emit = defineEmits<{ 'update:selectedPathId': [string] }>();

const localSelectedPathId = computed({
  get: () => props.selectedPathId,
  set: (value: string) => emit('update:selectedPathId', value),
});

const selectedPath = computed(() =>
  props.paths.find((p) => p.path_id === props.selectedPathId),
);

const sortedEntries = computed(() =>
  [...props.entries].sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0)),
);

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
  padding: 0.75rem 0;
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
