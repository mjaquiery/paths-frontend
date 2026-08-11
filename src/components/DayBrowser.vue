<template>
  <div class="day-browser df-ui">
    <!-- Date header -->
    <div class="db-header">
      <div class="db-header-text">
        <span class="db-weekday">{{ weekdayLabel }}</span>
        <h1 class="db-date">{{ longDateLabel }}</h1>
      </div>
      <div class="db-header-actions">
        <button
          class="db-icon-btn"
          aria-label="Previous day"
          @click="shiftDay(-1)"
        >
          ◀
        </button>
        <button class="db-icon-btn" aria-label="Next day" @click="shiftDay(1)">
          ▶
        </button>
        <button
          class="db-icon-btn"
          aria-label="Browse paths"
          @click="$emit('togglePaths')"
        >
          🗂️
        </button>
      </div>
    </div>

    <!-- Year tabs: current year + any earlier year with an entry on this day -->
    <div v-if="yearTabs.length > 1" class="db-year-tabs">
      <button
        v-for="tab in yearTabs"
        :key="tab.year"
        class="db-year-tab"
        :class="{ 'db-year-tab--active': tab.year === selectedYear }"
        @click="jumpToYear(tab.year)"
      >
        <span class="db-year-num">{{ tab.year }}</span>
        <span class="db-year-preview">{{ tab.preview }}</span>
      </button>
    </div>

    <!-- Week strip -->
    <div class="db-week-strip">
      <button
        v-for="d in weekDays"
        :key="d.dateStr"
        class="db-week-day"
        :class="{ 'db-week-day--selected': d.dateStr === selectedDate }"
        @click="selectDay(d.dateStr)"
      >
        <span class="db-week-dow">{{ d.dow }}</span>
        <span
          class="db-week-daynum"
          :class="{ 'db-week-daynum--today': d.isToday }"
          >{{ d.dayNum }}</span
        >
        <span v-if="d.dotColors.length" class="db-week-dots">
          <span
            v-for="(c, i) in d.dotColors"
            :key="i"
            class="db-dot"
            :style="{ backgroundColor: c }"
          />
        </span>
      </button>
    </div>

    <!-- Selected day's entries -->
    <div class="db-day-section">
      <div class="db-day-label-row">
        <p class="db-day-label">{{ selectedDayLabel }}</p>
        <button
          v-if="canCreate"
          class="db-day-create-btn"
          aria-label="Add entry"
          @click="openCreate(selectedDate)"
        >
          +
        </button>
      </div>

      <template v-if="selectedEntries.length > 0">
        <div
          v-for="pe in selectedEntries"
          :key="pe.pathId + '-' + pe.entryId"
          class="db-entry df-path-bar"
          :style="{ '--path-color': pe.color }"
        >
          <div
            class="db-entry-main"
            role="button"
            tabindex="0"
            :aria-label="`View entry from ${pe.pathTitle}`"
            @click="openDetail(pe)"
            @keydown.enter="openDetail(pe)"
            @keydown.space.prevent="openDetail(pe)"
          >
            <p class="db-entry-path">{{ pe.pathTitle }}</p>
            <p class="db-entry-preview df-body">
              {{
                pe.preview === undefined
                  ? 'Fetching…'
                  : pe.preview || '(no text)'
              }}
            </p>
          </div>
          <div v-if="pe.images.length > 0" class="db-entry-photos">
            <EntryImage
              v-for="img in pe.images.slice(0, 3)"
              :key="img.id"
              :image-id="img.id"
              :alt="img.filename"
              class="db-entry-photo"
            />
          </div>
        </div>
      </template>
      <p v-else class="db-day-empty">No entries yet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import type { PathResponse, ImageResponse } from '../generated/types';
import type { PathEntries } from '../composables/useMultiPathEntries';
import { useOnThisDay } from '../composables/useOnThisDay';
import { toLocalISODate } from '../utils/date';
import EntryImage from './EntryImage.vue';

const props = defineProps<{
  visiblePaths: PathResponse[];
  pathEntries: PathEntries[];
  canCreate: boolean;
  currentUserId: string;
}>();

defineEmits<{ togglePaths: [] }>();

const router = useRouter();

const selectedDate = ref(toLocalISODate(new Date()));

function shiftDay(delta: number) {
  const d = new Date(selectedDate.value + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  selectedDate.value = toLocalISODate(d);
}

function selectDay(dateStr: string) {
  selectedDate.value = dateStr;
}

const todayStr = toLocalISODate(new Date());

const selectedDateObj = computed(
  () => new Date(selectedDate.value + 'T00:00:00'),
);
const selectedYear = computed(() => selectedDateObj.value.getFullYear());

const weekdayLabel = computed(() =>
  selectedDateObj.value
    .toLocaleDateString(undefined, { weekday: 'long' })
    .toUpperCase(),
);

const longDateLabel = computed(() =>
  selectedDateObj.value.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
);

const selectedDayLabel = computed(() =>
  selectedDateObj.value
    .toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase(),
);

interface WeekDay {
  dateStr: string;
  dow: string;
  dayNum: number;
  isToday: boolean;
  dotColors: string[];
}

const pathById = computed(
  () => new Map(props.visiblePaths.map((p) => [p.path_id, p])),
);

function colorsForDay(dateStr: string): string[] {
  const colors: string[] = [];
  for (const { pathId, entries } of props.pathEntries) {
    const path = pathById.value.get(pathId);
    if (!path) continue;
    if (entries.some((e) => e.day === dateStr)) colors.push(path.color);
  }
  return colors;
}

const weekDays = computed<WeekDay[]>(() => {
  const base = selectedDateObj.value;
  const sunday = new Date(base);
  sunday.setDate(base.getDate() - base.getDay());

  const days: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const dateStr = toLocalISODate(d);
    days.push({
      dateStr,
      dow: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
      dayNum: d.getDate(),
      isToday: dateStr === todayStr,
      dotColors: colorsForDay(dateStr),
    });
  }
  return days;
});

const onThisDay = useOnThisDay(
  selectedDate,
  computed(() => props.visiblePaths),
  computed(() => props.pathEntries),
);

const yearTabs = computed(() => {
  const byYear = new Map<number, string>();
  // Newest-first from useOnThisDay; keep the highest-priority (first-seen) path per year.
  for (const entry of onThisDay.value) {
    if (!byYear.has(entry.year)) {
      byYear.set(entry.year, entry.content ? entry.content.slice(0, 20) : ' ');
    }
  }
  const tabs = Array.from(byYear.entries())
    .map(([year, preview]) => ({ year, preview }))
    .sort((a, b) => a.year - b.year);
  tabs.push({
    year: selectedYear.value,
    preview: selectedDate.value === todayStr ? 'Today' : ' ',
  });
  return tabs
    .filter(
      (t, i, arr) => arr.findIndex((o) => o.year === t.year) === i, // de-dup if selected year already had on-this-day
    )
    .sort((a, b) => a.year - b.year);
});

function jumpToYear(year: number) {
  const d = new Date(selectedDateObj.value);
  d.setFullYear(year);
  selectedDate.value = toLocalISODate(d);
}

interface DayPathEntry {
  entryId: string;
  pathId: string;
  pathTitle: string;
  color: string;
  preview: string | undefined;
  images: ImageResponse[];
}

const selectedEntries = computed<DayPathEntry[]>(() => {
  const result: DayPathEntry[] = [];
  for (const { pathId, entries } of props.pathEntries) {
    const path = pathById.value.get(pathId);
    if (!path) continue;
    for (const entry of entries.filter((e) => e.day === selectedDate.value)) {
      result.push({
        entryId: entry.id,
        pathId,
        pathTitle: path.title,
        color: path.color,
        preview: entry.content,
        images: entry.images ?? [],
      });
    }
  }
  return result;
});

function openCreate(dateStr: string) {
  router.push({ path: '/entry/new', query: { day: dateStr } });
}

function openDetail(pe: DayPathEntry) {
  router.push(`/entry/${pe.pathId}/${pe.entryId}`);
}
</script>

<style scoped>
.day-browser {
  padding: 0 var(--page-margin, 0.75rem);
}

.db-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-rule);
}

.db-weekday {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--color-ink-muted);
}

.db-date {
  margin: 0;
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: 1.6rem;
  color: var(--color-ink);
}

.db-header-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding-bottom: 0.25rem;
}

.db-icon-btn {
  background: none;
  border: none;
  font-size: 1rem;
  line-height: 1;
  padding: 0.4rem;
  color: var(--color-ink-muted);
  cursor: pointer;
}

.db-year-tabs {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--color-rule);
}

.db-year-tab {
  flex: 1 0 auto;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  padding: 0 0 0.4rem;
  border-bottom: 2px solid transparent;
  min-width: 4.5rem;
}

.db-year-tab--active {
  border-bottom-color: var(--color-ink);
}

.db-year-num {
  display: block;
  font-size: 0.95rem;
  color: var(--color-ink-muted);
}

.db-year-tab--active .db-year-num {
  font-weight: 700;
  color: var(--color-ink);
}

.db-year-preview {
  display: block;
  font-size: 0.7rem;
  color: var(--color-ink-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.db-year-tab--active .db-year-preview {
  color: var(--color-ink);
  font-weight: 600;
}

.db-week-strip {
  display: flex;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--color-rule);
}

.db-week-day {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.2rem 0;
}

.db-week-dow {
  font-size: 0.65rem;
  color: var(--color-ink-muted);
}

.db-week-daynum {
  font-size: 0.95rem;
  color: var(--color-ink);
  width: 1.8rem;
  height: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.db-week-daynum--today {
  font-weight: 700;
}

.db-week-day--selected .db-week-daynum {
  background: var(--color-ink);
  color: var(--color-paper);
}

.db-week-dots {
  display: flex;
  gap: 2px;
  min-height: 6px;
}

.db-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.db-day-section {
  padding: 0.75rem 0 1rem;
}

.db-day-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.db-day-label {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--color-ink-muted);
}

.db-day-create-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  line-height: 1;
  color: var(--color-ink);
  cursor: pointer;
  padding: 0 0.4rem;
}

.db-day-empty {
  color: var(--color-ink-muted);
  font-size: 0.85rem;
}

.db-entry {
  padding: 0.6rem 0 0.6rem calc(var(--page-margin, 0.75rem) - 2px);
  border-bottom: 1px solid var(--color-rule);
}

.db-entry:last-child {
  border-bottom: none;
}

.db-entry-main {
  cursor: pointer;
}

.db-entry-path {
  margin: 0 0 0.2rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--color-ink-muted);
  text-transform: uppercase;
}

.db-entry-preview {
  margin: 0;
  font-size: 1rem;
  color: var(--color-ink);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.db-entry-photos {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.db-entry-photo :deep(.entry-image-thumb),
.db-entry-photo :deep(.entry-image-placeholder) {
  width: 44px;
  height: 44px;
}
</style>
