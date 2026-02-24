<template>
  <ion-card v-if="spotlightYears.length > 0" class="on-this-day-card">
    <ion-card-header>
      <ion-card-subtitle>Previously on this day</ion-card-subtitle>
      <ion-card-title>{{ formattedToday }}</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <!-- Primary entry: most recent year for the top-priority path -->
      <div v-if="primaryEntry" class="spotlight-primary">
        <span
          class="spotlight-path-dot"
          :style="{ backgroundColor: primaryPath?.color }"
        ></span>
        <div class="spotlight-text">
          <span class="spotlight-year">{{ primaryEntry.year }}</span>
          <span v-if="primaryEntry.content" class="spotlight-preview">{{
            primaryEntry.content
          }}</span>
          <span v-else class="spotlight-preview spotlight-preview--empty"
            >(no text)</span
          >
        </div>
      </div>

      <!-- Year indicators for other paths/years -->
      <div v-if="otherIndicators.length > 0" class="spotlight-indicators">
        <span
          v-for="ind in otherIndicators"
          :key="ind.key"
          class="spotlight-indicator"
          :style="{ backgroundColor: ind.color }"
          :title="`${ind.year} — ${ind.pathTitle}`"
        ></span>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from '@ionic/vue';
import { computed } from 'vue';

import type { EntryContentResponse, PathResponse } from '../generated/types';
import type { PathEntries } from '../composables/useMultiPathEntries';

const props = defineProps<{
  /** Ordered visible paths (index 0 = highest priority) */
  visiblePaths: PathResponse[];
  /** Entries per path from useMultiPathEntries */
  pathEntries: PathEntries[];
  /** Pre-fetched content keyed by entry id (optional) */
  entryContent?: Record<string, EntryContentResponse>;
}>();

const today = new Date();
const todayMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
const todayYear = today.getFullYear();

const formattedToday = today.toLocaleDateString(undefined, {
  month: 'long',
  day: 'numeric',
});

interface YearEntry {
  year: number;
  entryId: string;
  pathId: string;
  content?: string;
}

const spotlightYears = computed<YearEntry[]>(() => {
  const results: YearEntry[] = [];
  for (const { pathId, entries } of props.pathEntries) {
    for (const entry of entries) {
      // Match month-day but exclude current year
      if (
        entry.day.slice(5) === todayMonthDay &&
        Number(entry.day.slice(0, 4)) < todayYear
      ) {
        const content = props.entryContent?.[entry.id]?.content;
        results.push({
          year: Number(entry.day.slice(0, 4)),
          entryId: entry.id,
          pathId,
          content,
        });
      }
    }
  }
  // Sort descending by year, then by path priority
  return results.sort((a, b) => b.year - a.year);
});

const primaryEntry = computed<YearEntry | null>(() => {
  if (spotlightYears.value.length === 0) return null;
  // Pick the most recent year for the top-priority visible path
  for (const path of props.visiblePaths) {
    const entry = spotlightYears.value.find((e) => e.pathId === path.path_id);
    if (entry) return entry;
  }
  return spotlightYears.value[0] ?? null;
});

const primaryPath = computed(() =>
  props.visiblePaths.find((p) => p.path_id === primaryEntry.value?.pathId),
);

const visiblePathById = computed(
  () => new Map(props.visiblePaths.map((p) => [p.path_id, p])),
);

const otherIndicators = computed(() => {
  const pathMap = visiblePathById.value;
  return spotlightYears.value
    .filter(
      (e) =>
        e.entryId !== primaryEntry.value?.entryId ||
        e.pathId !== primaryEntry.value?.pathId,
    )
    .slice(0, 12)
    .map((e) => {
      const path = pathMap.get(e.pathId);
      return {
        key: `${e.pathId}-${e.year}`,
        year: e.year,
        color: path?.color ?? '#aaa',
        pathTitle: path?.title ?? '',
      };
    });
});
</script>

<style scoped>
.on-this-day-card {
  margin: 8px;
  border-left: 4px solid var(--ion-color-primary, #3949ab);
}

.spotlight-primary {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
}

.spotlight-path-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
}

.spotlight-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.spotlight-year {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--ion-color-primary, #3949ab);
}

.spotlight-preview {
  font-size: 0.9rem;
  color: var(--ion-color-dark, #333);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.spotlight-preview--empty {
  color: var(--ion-color-medium, #999);
  font-style: italic;
}

.spotlight-indicators {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.spotlight-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  cursor: default;
}
</style>
