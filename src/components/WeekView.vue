<template>
  <div class="week-view">
    <!-- Past-week navigation -->
    <div v-if="hasPreviousEntries" class="week-nav week-nav--top">
      <ion-button
        fill="clear"
        size="small"
        aria-label="Navigate to older week"
        @click="weekOffset--"
      >
        ▲ Older week
      </ion-button>
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
          <span class="day-label">
            {{ dayInfo.label }}
          </span>
          <ion-button
            v-if="canCreate"
            size="small"
            fill="clear"
            class="day-create-btn"
            @click="openCreate(dayInfo.dateStr)"
          >
            +
          </ion-button>
        </div>

        <!-- Entries for this day, split across paths -->
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
          >
            <span
              class="day-entry-path-dot"
              :style="{ backgroundColor: pe.color }"
              :title="pe.pathTitle"
            ></span>
            <span class="day-entry-preview">{{
              pe.preview || '(no text)'
            }}</span>
          </div>
        </div>
        <div v-else class="day-empty"></div>
      </div>
    </div>

    <!-- Future-week navigation -->
    <div v-if="weekOffset < 0" class="week-nav week-nav--bottom">
      <ion-button
        fill="clear"
        size="small"
        aria-label="Navigate to newer week"
        @click="weekOffset++"
      >
        ▼ Newer week
      </ion-button>
    </div>
  </div>

  <!-- Entry creation modal -->
  <EntryCreateModal
    :is-open="showCreateModal"
    :paths="visiblePaths"
    :current-user-id="currentUserId"
    :initial-day="createModalDay"
    @dismiss="showCreateModal = false"
    @created="onEntryCreated"
  />
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue';
import { computed, ref } from 'vue';

import type { PathResponse } from '../generated/types';
import type { PathEntries } from '../composables/useMultiPathEntries';
import EntryCreateModal from './EntryCreateModal.vue';

const props = defineProps<{
  visiblePaths: PathResponse[];
  pathEntries: PathEntries[];
  canCreate: boolean;
  currentUserId: string;
}>();

const emit = defineEmits<{
  entryCreated: [];
}>();

const weekOffset = ref(0); // 0 = current week, -1 = last week, etc.
const showCreateModal = ref(false);
const createModalDay = ref('');

/** Build ISO date string for a day offset from today */
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
  preview: string;
}

interface DayInfo {
  dateStr: string;
  label: string;
  isToday: boolean;
  pathEntries: DayPathEntry[];
}

const weekDays = computed<DayInfo[]>(() => {
  const todayStr = isoDate(0);
  // 7-day window: oldest at index 0 (top), newest (today or future) at last (bottom)
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
      const dayEntries = entries.filter((e) => e.day === dateStr);
      for (const entry of dayEntries) {
        pathEntries.push({
          entryId: entry.id,
          pathId,
          pathTitle: path.title,
          color: path.color,
          preview: entry.content ?? '',
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

const hasPreviousEntries = computed(() => {
  // Show "older week" button if any visible path has entries before the oldest displayed day
  const oldestDay = weekDays.value[0]?.dateStr ?? '';
  return props.pathEntries.some(({ entries }) =>
    entries.some((e) => e.day < oldestDay),
  );
});

function openCreate(dateStr: string) {
  createModalDay.value = dateStr;
  showCreateModal.value = true;
}

function onEntryCreated() {
  emit('entryCreated');
}
</script>

<style scoped>
.week-view {
  padding: 0 8px;
}

.week-nav {
  text-align: center;
  padding: 4px 0;
}

.week-days {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.day-box {
  border: 1px solid var(--ion-color-light-shade, #e0e0e0);
  border-radius: var(--paths-border-radius, 8px);
  min-height: var(--paths-day-min-height, 72px);
  overflow: hidden;
  background: var(--ion-background-color, #fff);
}

.day-box--today {
  border-color: var(--ion-color-primary, #3949ab);
  border-width: 2px;
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 2px;
  background: var(--ion-color-light, #f4f4f4);
  border-bottom: 1px solid var(--ion-color-light-shade, #e0e0e0);
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

/* When multiple entries: split horizontally (side-by-side) */
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

.day-empty {
  min-height: 40px;
}
</style>
