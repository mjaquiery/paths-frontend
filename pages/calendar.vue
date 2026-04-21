<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>{{ monthLabel }}</ion-title>
        <ion-buttons slot="end">
          <ion-button aria-label="Previous month" @click="prevMonth"
            >‹</ion-button
          >
          <ion-button aria-label="Next month" @click="nextMonth">›</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="calendar-content">
      <AppErrorBanner v-if="pathsError" :message="pathsErrorMsg" />

      <!-- Month grid -->
      <div class="cal-grid-wrap">
        <div class="cal-weekday-row">
          <span v-for="wd in weekdays" :key="wd" class="cal-weekday-cell">
            {{ wd }}
          </span>
        </div>
        <div class="cal-days-grid">
          <!-- Leading empty cells -->
          <span
            v-for="n in leadingBlanks"
            :key="`blank-${n}`"
            class="cal-day-cell cal-day-cell--blank"
          />
          <!-- Day cells -->
          <button
            v-for="d in daysInMonth"
            :key="d"
            class="cal-day-cell"
            :class="{
              'cal-day-cell--today': isToday(d),
              'cal-day-cell--selected': isSelected(d),
              'cal-day-cell--has-entries': hasDayEntries(d),
            }"
            :aria-label="`${d} ${monthLabel}`"
            :aria-current="isToday(d) ? 'date' : undefined"
            @click="selectDay(d)"
          >
            <span class="cal-day-number">{{ d }}</span>
            <!-- Path colour dots -->
            <span class="cal-dot-row">
              <span
                v-for="color in getDayColors(d)"
                :key="color"
                class="cal-dot"
                :style="{ background: color }"
              />
            </span>
          </button>
        </div>
      </div>

      <!-- Day panel -->
      <div v-if="selectedDay" class="cal-day-panel">
        <h2 class="cal-day-panel__heading">
          {{
            new Date(selectedDayStr + 'T00:00:00').toLocaleDateString(
              undefined,
              { weekday: 'long', month: 'long', day: 'numeric' },
            )
          }}
        </h2>

        <AppEmptyState
          v-if="selectedDayEntries.length === 0"
          :cta-label="canCreate ? '+ Write entry' : undefined"
          :cta-href="
            canCreate ? `/entry/new?date=${selectedDayStr}` : undefined
          "
        >
          No entries for this day.
        </AppEmptyState>

        <ul v-else class="cal-entry-list">
          <li
            v-for="item in selectedDayEntries"
            :key="item.entryId"
            class="cal-entry-row"
          >
            <PathColorBar :color="item.color">
              <button
                class="cal-entry-btn"
                @click="router.push(`/entry/${item.pathId}/${item.entryId}`)"
              >
                <span class="cal-entry-path">{{ item.pathTitle }}</span>
                <span class="cal-entry-preview">{{
                  item.preview || '(no text)'
                }}</span>
              </button>
            </PathColorBar>
          </li>
        </ul>

        <ion-button
          v-if="canCreate && selectedDayEntries.length > 0"
          fill="outline"
          size="small"
          :router-link="`/entry/new?date=${selectedDayStr}`"
          router-direction="forward"
          class="cal-add-btn"
        >
          + Add entry
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
definePageMeta({
  pageTransition: { name: 'ion-forward', mode: 'out-in' },
});
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
} from '@ionic/vue';
import { ref, computed } from 'vue';

import AppErrorBanner from '~/src/components/AppErrorBanner.vue';
import AppEmptyState from '~/src/components/AppEmptyState.vue';
import PathColorBar from '~/src/components/PathColorBar.vue';

import { usePaths } from '~/src/composables/usePaths';
import { useMultiPathEntries } from '~/src/composables/useMultiPathEntries';
import { useCurrentUser } from '~/src/composables/useCurrentUser';
import { extractErrorMessage } from '~/src/lib/errors';

const router = useRouter();

const { data: allPaths, error: pathsError } = usePaths();
const pathsErrorMsg = computed(
  () => extractErrorMessage(pathsError.value) ?? 'Unable to load paths.',
);

const { currentUserId } = useCurrentUser();

const canCreate = computed(
  () =>
    !!currentUserId.value &&
    (allPaths.value ?? []).some((p) => p.owner_user_id === currentUserId.value),
);

const pathIds = computed(() => (allPaths.value ?? []).map((p) => p.path_id));
const multiPathEntries = useMultiPathEntries(pathIds);

const {

// ── Calendar state ──────────────────────────────────────────────────────────
const today = new Date();
const viewYear = ref(today.getFullYear());
const viewMonth = ref(today.getMonth()); // 0-based

const selectedDay = ref<number | null>(today.getDate());

const monthLabel = computed(() =>
  new Date(viewYear.value, viewMonth.value, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  }),
);

const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const daysInMonth = computed(() =>
  new Date(viewYear.value, viewMonth.value + 1, 0).getDate(),
);

// Monday-based leading blanks (0 = Mon … 6 = Sun)
const leadingBlanks = computed(() => {
  const dow = new Date(viewYear.value, viewMonth.value, 1).getDay();
  return dow === 0 ? 6 : dow - 1;
});

function isToday(day: number): boolean {
  return (
    day === today.getDate() &&
    viewMonth.value === today.getMonth() &&
    viewYear.value === today.getFullYear()
  );
}

function isSelected(day: number): boolean {
  return day === selectedDay.value;
}

function selectDay(day: number) {
  selectedDay.value = day;
}

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11;
    viewYear.value--;
  } else {
    viewMonth.value--;
  }
  selectedDay.value = null;
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0;
    viewYear.value++;
  } else {
    viewMonth.value++;
  }
  selectedDay.value = null;
}

function dayIsoStr(day: number): string {
  const m = String(viewMonth.value + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${viewYear.value}-${m}-${d}`;
}

const selectedDayStr = computed(() =>
  selectedDay.value ? dayIsoStr(selectedDay.value) : '',
);

interface DayEntry {
  entryId: string;
  pathId: string;
  pathTitle: string;
  color: string;
  preview: string;
}

function getEntriesForDate(dateStr: string): DayEntry[] {
  const result: DayEntry[] = [];
  for (const pe of multiPathEntries.value) {
    const path = (allPaths.value ?? []).find((p) => p.path_id === pe.pathId);
    for (const entry of pe.entries) {
      if (entry.day === dateStr) {
        result.push({
          entryId: entry.id,
          pathId: pe.pathId,
          pathTitle: path?.title ?? pe.pathId,
          color: path?.color ?? '#3949ab',
          preview: (entry.content ?? '').slice(0, 120),
        });
      }
    }
  }
  return result;
}

function hasDayEntries(day: number): boolean {
  return getEntriesForDate(dayIsoStr(day)).length > 0;
}

function getDayColors(day: number): string[] {
  const entries = getEntriesForDate(dayIsoStr(day));
  const seen = new Set<string>();
  const colors: string[] = [];
  for (const e of entries) {
    if (!seen.has(e.color)) {
      seen.add(e.color);
      colors.push(e.color);
      if (colors.length >= 3) break;
    }
  }
  return colors;
}

const selectedDayEntries = computed(() =>
  selectedDay.value ? getEntriesForDate(selectedDayStr.value) : [],
);
</script>

<style scoped>
.calendar-content {
  --background: var(--color-paper);
  --padding-start: var(--page-margin);
  --padding-end: var(--page-margin);
  --padding-top: var(--section-gap);
  --padding-bottom: 32px;
}

/* ── Month grid ── */
.cal-grid-wrap {
  margin-bottom: var(--section-gap);
}

.cal-weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}

.cal-weekday-cell {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-ink-muted);
  text-align: center;
  padding: 4px 0;
}

.cal-days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cal-day-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 0;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  min-height: 48px;
  font-family: var(--font-sans);
  color: var(--color-ink);
  transition: background 0.1s;
}

.cal-day-cell--blank {
  pointer-events: none;
}

.cal-day-cell:hover {
  background: rgba(0, 0, 0, 0.04);
}

.cal-day-cell--today .cal-day-number {
  background: var(--ion-color-primary, #3949ab);
  color: #fff;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cal-day-cell--selected {
  background: rgba(0, 0, 0, 0.07);
}

.cal-day-cell--has-entries .cal-day-number {
  font-weight: 700;
}

.cal-day-number {
  font-size: 0.875rem;
  line-height: 1;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cal-dot-row {
  display: flex;
  gap: 2px;
  height: 4px;
  min-height: 4px;
}

.cal-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── Day panel ── */
.cal-day-panel {
  padding-top: var(--section-gap);
  border-top: 1px solid var(--color-rule);
}

.cal-day-panel__heading {
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-ink);
  margin: 0 0 12px;
}

.cal-entry-list {
  list-style: none;
  margin: 0 0 12px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cal-entry-row {
  display: block;
}

.cal-entry-btn {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.cal-entry-path {
  display: block;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-ink-muted);
  margin-bottom: 2px;
}

.cal-entry-preview {
  display: block;
  font-family: var(--font-serif);
  font-size: 0.9rem;
  color: var(--color-ink);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.cal-add-btn {
  margin-top: 8px;
}
</style>
