<template>
  <div class="week-view">
    <!-- Week navigation header -->
    <div class="week-nav-header">
      <ion-button
        fill="clear"
        size="small"
        aria-label="Previous week"
        @click="weekOffset--"
        >◄ Prev</ion-button
      >
      <span class="week-range-label">{{ weekRangeLabel }}</span>
      <ion-button
        fill="clear"
        size="small"
        :disabled="weekOffset >= 0"
        aria-label="Next week"
        @click="weekOffset++"
        >Next ►</ion-button
      >
    </div>

    <div class="week-days">
      <div
        v-for="dayInfo in weekDays"
        :key="dayInfo.dateStr"
        class="day-box"
        :class="{ 'day-box--today': dayInfo.isToday }"
      >
        <!-- Day header -->
        <div class="day-header">
          <span class="day-label">{{ dayInfo.label }}</span>
          <ion-button
            v-if="canCreate && firstOwnedPath"
            size="small"
            fill="clear"
            class="day-create-btn"
            :aria-label="`Create entry for ${dayInfo.dateStr}`"
            @click="openCreate(dayInfo.dateStr)"
            >+</ion-button
          >
        </div>

        <!-- Entries for this day -->
        <div
          v-if="dayInfo.pathEntries.length > 0"
          class="day-entries"
          :class="`day-entries--count-${dayInfo.pathEntries.length}`"
        >
          <div
            v-for="pe in dayInfo.pathEntries"
            :key="pe.pathId + '-' + pe.entryId"
            class="day-entry"
            :style="{ borderLeftColor: pe.color }"
            role="button"
            tabindex="0"
            :aria-label="`View entry from ${pe.pathTitle}`"
            @click="openDetail(pe)"
            @keydown.enter="openDetail(pe)"
            @keydown.space.prevent="openDetail(pe)"
          >
            <span
              class="day-entry-path-dot"
              :style="{ backgroundColor: pe.color }"
              :title="pe.pathTitle"
            ></span>
            <span class="day-entry-preview">{{
              pe.preview === undefined
                ? 'Fetching...'
                : pe.preview || '(no text)'
            }}</span>
            <span
              v-if="pe.hasImages"
              class="day-entry-image-indicator"
              title="Has images"
              aria-label="Has images"
              >📷</span
            >
          </div>
        </div>
        <div v-else class="day-empty"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { computed, ref } from 'vue';

import type { PathResponse, ImageResponse } from '../generated/types';
import type { PathEntries } from '../composables/useMultiPathEntries';

const props = defineProps<{
  visiblePaths: PathResponse[];
  pathEntries: PathEntries[];
  canCreate: boolean;
  currentUserId: string;
}>();

const emit = defineEmits<{
  entryCreated: [];
}>();

const router = useRouter();
const weekOffset = ref(0);

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function dayLabel(dateStr: string, isToday: boolean): string {
  if (isToday) return 'Today';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

interface DayPathEntry {
  entryId: string;
  pathId: string;
  pathTitle: string;
  color: string;
  preview: string | undefined;
  hasImages: boolean;
  images?: ImageResponse[];
  edit_id?: number;
  canEdit: boolean;
}

interface DayInfo {
  dateStr: string;
  label: string;
  isToday: boolean;
  pathEntries: DayPathEntry[];
}

const weekDays = computed<DayInfo[]>(() => {
  const todayStr = isoDate(0);
  const days: DayInfo[] = [];
  const baseOffset = weekOffset.value * 7;
  for (let i = 6; i >= 0; i--) {
    const offsetFromToday = baseOffset - i;
    const dateStr = isoDate(offsetFromToday);
    const isToday = dateStr === todayStr;
    const pathEntries: DayPathEntry[] = [];
    for (const { pathId, entries } of props.pathEntries) {
      const path = props.visiblePaths.find((p) => p.path_id === pathId);
      if (!path) continue;
      for (const entry of entries.filter((e) => e.day === dateStr)) {
        pathEntries.push({
          entryId: entry.id,
          pathId,
          pathTitle: path.title,
          color: path.color,
          preview: entry.content,
          hasImages: (entry.image_filenames?.length ?? 0) > 0,
          images: entry.images,
          edit_id: entry.edit_id,
          canEdit:
            !!props.currentUserId && path.owner_user_id === props.currentUserId,
        });
      }
    }
    days.push({
      dateStr,
      label: dayLabel(dateStr, isToday),
      isToday,
      pathEntries,
    });
  }
  return days;
});

const weekRangeLabel = computed(() => {
  const first = weekDays.value[0];
  const last = weekDays.value[weekDays.value.length - 1];
  if (!first || !last) return '';
  const fmt = (ds: string) =>
    new Date(ds + 'T00:00:00').toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  const year = new Date(last.dateStr + 'T00:00:00').getFullYear();
  return `Week of ${fmt(first.dateStr)} – ${fmt(last.dateStr)}, ${year}`;
});

const firstOwnedPath = computed(
  () =>
    props.visiblePaths.find((p) => p.owner_user_id === props.currentUserId) ??
    null,
);

function openDetail(pe: DayPathEntry) {
  void router.push(`/entry/${pe.pathId}/${pe.entryId}`);
}

function openCreate(dateStr: string) {
  if (!firstOwnedPath.value) return;
  void router.push(
    `/entry/${firstOwnedPath.value.path_id}/new?date=${dateStr}`,
  );
}
</script>

<style scoped>
.week-view {
  padding: 0 8px;
}

.week-nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 4px;
  margin-bottom: 8px;
}

.week-range-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ion-text-color);
}

.week-days {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.day-box {
  border: 1px solid var(--ion-border-color, #e0e0e0);
  border-radius: var(--paths-border-radius, 8px);
  min-height: var(--paths-day-min-height, 72px);
  overflow: hidden;
  background: var(--ion-card-background, #fff);
}

.day-box--today {
  border-color: var(--paths-today-border, #3949ab);
  border-left-width: 4px;
  border-left-style: solid;
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 2px;
  background: var(--ion-color-light, #f4f4f4);
  border-bottom: 1px solid var(--ion-border-color, #e0e0e0);
}

.day-box--today .day-header {
  background: rgba(57, 73, 171, 0.08);
}

.day-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ion-color-dark, #333);
}

.day-create-btn {
  --padding-start: 4px;
  --padding-end: 4px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ion-color-primary, #3949ab);
}

.day-entries {
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100%;
}

.day-entries--count-2,
.day-entries--count-3,
.day-entries--count-4 {
  flex-direction: row;
  flex-wrap: wrap;
}

.day-entry {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 6px 8px;
  border-left: 3px solid transparent;
  overflow: hidden;
  cursor: pointer;
}

.day-entry:hover {
  background: var(--paths-card-hover, rgba(57, 73, 171, 0.06));
}

.day-entry:focus-visible {
  outline: 2px solid var(--ion-color-primary, #3949ab);
  outline-offset: -2px;
}

.day-entry-path-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 3px;
  flex-shrink: 0;
}

.day-entry-preview {
  font-size: 0.82rem;
  color: var(--ion-color-dark, #333);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.day-entry-image-indicator {
  font-size: 0.75rem;
  flex-shrink: 0;
  margin-left: auto;
}

.day-empty {
  min-height: 40px;
}
</style>
