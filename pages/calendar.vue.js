"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
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

    <ion-footer>
      <RefreshStatus
        :status-type="refreshStatusType"
        :status-text="refreshStatusText"
        :last-checked-at="refreshLastCheckedAt"
      />
    </ion-footer>
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
  IonFooter,
  IonButtons,
  IonBackButton,
  IonButton,
} from '@ionic/vue';
import { ref, computed } from 'vue';

import AppErrorBanner from '~/src/components/AppErrorBanner.vue';
import AppEmptyState from '~/src/components/AppEmptyState.vue';
import PathColorBar from '~/src/components/PathColorBar.vue';
import RefreshStatus from '~/src/components/RefreshStatus.vue';

import { usePaths } from '~/src/composables/usePaths';
import { useMultiPathEntries } from '~/src/composables/useMultiPathEntries';
import { useCurrentUser } from '~/src/composables/useCurrentUser';
import { useRefreshStatus } from '~/src/composables/useRefreshStatus';
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
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

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
/// <reference types="../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />

definePageMeta({
    pageTransition: { name: 'ion-forward', mode: 'out-in' },
});
var vue_1 = require("@ionic/vue");
var vue_2 = require("vue");
var AppErrorBanner_vue_1 = require("~/src/components/AppErrorBanner.vue");
var AppEmptyState_vue_1 = require("~/src/components/AppEmptyState.vue");
var PathColorBar_vue_1 = require("~/src/components/PathColorBar.vue");
var RefreshStatus_vue_1 = require("~/src/components/RefreshStatus.vue");
var usePaths_1 = require("~/src/composables/usePaths");
var useMultiPathEntries_1 = require("~/src/composables/useMultiPathEntries");
var useCurrentUser_1 = require("~/src/composables/useCurrentUser");
var useRefreshStatus_1 = require("~/src/composables/useRefreshStatus");
var errors_1 = require("~/src/lib/errors");
var router = useRouter();
var _a = (0, usePaths_1.usePaths)(), allPaths = _a.data, pathsError = _a.error;
var pathsErrorMsg = (0, vue_2.computed)(function () { var _a; return (_a = (0, errors_1.extractErrorMessage)(pathsError.value)) !== null && _a !== void 0 ? _a : 'Unable to load paths.'; });
var currentUserId = (0, useCurrentUser_1.useCurrentUser)().currentUserId;
var canCreate = (0, vue_2.computed)(function () {
    var _a;
    return !!currentUserId.value &&
        ((_a = allPaths.value) !== null && _a !== void 0 ? _a : []).some(function (p) { return p.owner_user_id === currentUserId.value; });
});
var pathIds = (0, vue_2.computed)(function () { var _a; return ((_a = allPaths.value) !== null && _a !== void 0 ? _a : []).map(function (p) { return p.path_id; }); });
var multiPathEntries = (0, useMultiPathEntries_1.useMultiPathEntries)(pathIds);
var _b = (0, useRefreshStatus_1.useRefreshStatus)(), refreshStatusType = _b.statusType, refreshStatusText = _b.statusText, refreshLastCheckedAt = _b.lastCheckedAt;
// ── Calendar state ──────────────────────────────────────────────────────────
var today = new Date();
var viewYear = (0, vue_2.ref)(today.getFullYear());
var viewMonth = (0, vue_2.ref)(today.getMonth()); // 0-based
var selectedDay = (0, vue_2.ref)(today.getDate());
var monthLabel = (0, vue_2.computed)(function () {
    return new Date(viewYear.value, viewMonth.value, 1).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
    });
});
var weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
var daysInMonth = (0, vue_2.computed)(function () {
    return new Date(viewYear.value, viewMonth.value + 1, 0).getDate();
});
// Monday-based leading blanks (0 = Mon … 6 = Sun)
var leadingBlanks = (0, vue_2.computed)(function () {
    var dow = new Date(viewYear.value, viewMonth.value, 1).getDay();
    return dow === 0 ? 6 : dow - 1;
});
function isToday(day) {
    return (day === today.getDate() &&
        viewMonth.value === today.getMonth() &&
        viewYear.value === today.getFullYear());
}
function isSelected(day) {
    return day === selectedDay.value;
}
function selectDay(day) {
    selectedDay.value = day;
}
function prevMonth() {
    if (viewMonth.value === 0) {
        viewMonth.value = 11;
        viewYear.value--;
    }
    else {
        viewMonth.value--;
    }
    selectedDay.value = null;
}
function nextMonth() {
    if (viewMonth.value === 11) {
        viewMonth.value = 0;
        viewYear.value++;
    }
    else {
        viewMonth.value++;
    }
    selectedDay.value = null;
}
function dayIsoStr(day) {
    var m = String(viewMonth.value + 1).padStart(2, '0');
    var d = String(day).padStart(2, '0');
    return "".concat(viewYear.value, "-").concat(m, "-").concat(d);
}
var selectedDayStr = (0, vue_2.computed)(function () {
    return selectedDay.value ? dayIsoStr(selectedDay.value) : '';
});
function getEntriesForDate(dateStr) {
    var _a, _b, _c, _d;
    var result = [];
    var _loop_3 = function (pe) {
        var path = ((_a = allPaths.value) !== null && _a !== void 0 ? _a : []).find(function (p) { return p.path_id === pe.pathId; });
        for (var _f = 0, _g = pe.entries; _f < _g.length; _f++) {
            var entry = _g[_f];
            if (entry.day === dateStr) {
                result.push({
                    entryId: entry.id,
                    pathId: pe.pathId,
                    pathTitle: (_b = path === null || path === void 0 ? void 0 : path.title) !== null && _b !== void 0 ? _b : pe.pathId,
                    color: (_c = path === null || path === void 0 ? void 0 : path.color) !== null && _c !== void 0 ? _c : '#3949ab',
                    preview: ((_d = entry.content) !== null && _d !== void 0 ? _d : '').slice(0, 120),
                });
            }
        }
    };
    for (var _i = 0, _e = multiPathEntries.value; _i < _e.length; _i++) {
        var pe = _e[_i];
        _loop_3(pe);
    }
    return result;
}
function hasDayEntries(day) {
    return getEntriesForDate(dayIsoStr(day)).length > 0;
}
function getDayColors(day) {
    var entries = getEntriesForDate(dayIsoStr(day));
    var seen = new Set();
    var colors = [];
    for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
        var e = entries_1[_i];
        if (!seen.has(e.color)) {
            seen.add(e.color);
            colors.push(e.color);
            if (colors.length >= 3)
                break;
        }
    }
    return colors;
}
var selectedDayEntries = (0, vue_2.computed)(function () {
    return selectedDay.value ? getEntriesForDate(selectedDayStr.value) : [];
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['cal-day-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-day-number']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-day-number']} */ ;
// CSS variable injection 
// CSS variable injection end 
var __VLS_0 = {}.IonPage;
/** @type {[typeof __VLS_components.IonPage, typeof __VLS_components.ionPage, typeof __VLS_components.IonPage, typeof __VLS_components.ionPage, ]} */ ;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_4 = {};
__VLS_3.slots.default;
var __VLS_5 = {}.IonHeader;
/** @type {[typeof __VLS_components.IonHeader, typeof __VLS_components.ionHeader, typeof __VLS_components.IonHeader, typeof __VLS_components.ionHeader, ]} */ ;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({}));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_6), false));
__VLS_8.slots.default;
var __VLS_9 = {}.IonToolbar;
/** @type {[typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, ]} */ ;
// @ts-ignore
var __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({}));
var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_10), false));
__VLS_12.slots.default;
var __VLS_13 = {}.IonButtons;
/** @type {[typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, ]} */ ;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    slot: "start",
}));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([{
        slot: "start",
    }], __VLS_functionalComponentArgsRest(__VLS_14), false));
__VLS_16.slots.default;
var __VLS_17 = {}.IonBackButton;
/** @type {[typeof __VLS_components.IonBackButton, typeof __VLS_components.ionBackButton, ]} */ ;
// @ts-ignore
var __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    defaultHref: "/",
}));
var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([{
        defaultHref: "/",
    }], __VLS_functionalComponentArgsRest(__VLS_18), false));
var __VLS_16;
var __VLS_21 = {}.IonTitle;
/** @type {[typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, ]} */ ;
// @ts-ignore
var __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({}));
var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_22), false));
__VLS_24.slots.default;
(__VLS_ctx.monthLabel);
var __VLS_24;
var __VLS_25 = {}.IonButtons;
/** @type {[typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, ]} */ ;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({
    slot: "end",
}));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([{
        slot: "end",
    }], __VLS_functionalComponentArgsRest(__VLS_26), false));
__VLS_28.slots.default;
var __VLS_29 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29(__assign({ 'onClick': {} }, { 'aria-label': "Previous month" })));
var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { 'aria-label': "Previous month" })], __VLS_functionalComponentArgsRest(__VLS_30), false));
var __VLS_33;
var __VLS_34;
var __VLS_35;
var __VLS_36 = {
    onClick: (__VLS_ctx.prevMonth)
};
__VLS_32.slots.default;
var __VLS_32;
var __VLS_37 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37(__assign({ 'onClick': {} }, { 'aria-label': "Next month" })));
var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { 'aria-label': "Next month" })], __VLS_functionalComponentArgsRest(__VLS_38), false));
var __VLS_41;
var __VLS_42;
var __VLS_43;
var __VLS_44 = {
    onClick: (__VLS_ctx.nextMonth)
};
__VLS_40.slots.default;
var __VLS_40;
var __VLS_28;
var __VLS_12;
var __VLS_8;
var __VLS_45 = {}.IonContent;
/** @type {[typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, ]} */ ;
// @ts-ignore
var __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45(__assign({ class: "calendar-content" })));
var __VLS_47 = __VLS_46.apply(void 0, __spreadArray([__assign({ class: "calendar-content" })], __VLS_functionalComponentArgsRest(__VLS_46), false));
__VLS_48.slots.default;
if (__VLS_ctx.pathsError) {
    /** @type {[typeof AppErrorBanner, ]} */ ;
    // @ts-ignore
    var __VLS_49 = __VLS_asFunctionalComponent(AppErrorBanner_vue_1.default, new AppErrorBanner_vue_1.default({
        message: (__VLS_ctx.pathsErrorMsg),
    }));
    var __VLS_50 = __VLS_49.apply(void 0, __spreadArray([{
            message: (__VLS_ctx.pathsErrorMsg),
        }], __VLS_functionalComponentArgsRest(__VLS_49), false));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "cal-grid-wrap" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "cal-weekday-row" }));
for (var _i = 0, _c = __VLS_getVForSourceType((__VLS_ctx.weekdays)); _i < _c.length; _i++) {
    var wd = _c[_i][0];
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ key: (wd) }, { class: "cal-weekday-cell" }));
    (wd);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "cal-days-grid" }));
for (var _d = 0, _e = __VLS_getVForSourceType((__VLS_ctx.leadingBlanks)); _d < _e.length; _d++) {
    var n = _e[_d][0];
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span)(__assign({ key: ("blank-".concat(n)) }, { class: "cal-day-cell cal-day-cell--blank" }));
}
var _loop_1 = function (d) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.selectDay(d);
        } }, { key: (d) }), { class: "cal-day-cell" }), { class: ({
            'cal-day-cell--today': __VLS_ctx.isToday(d),
            'cal-day-cell--selected': __VLS_ctx.isSelected(d),
            'cal-day-cell--has-entries': __VLS_ctx.hasDayEntries(d),
        }) }), { 'aria-label': ("".concat(d, " ").concat(__VLS_ctx.monthLabel)), 'aria-current': (__VLS_ctx.isToday(d) ? 'date' : undefined) }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "cal-day-number" }));
    (d);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "cal-dot-row" }));
    for (var _k = 0, _l = __VLS_getVForSourceType((__VLS_ctx.getDayColors(d))); _k < _l.length; _k++) {
        var color = _l[_k][0];
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span)(__assign(__assign({ key: (color) }, { class: "cal-dot" }), { style: ({ background: color }) }));
    }
};
for (var _f = 0, _g = __VLS_getVForSourceType((__VLS_ctx.daysInMonth)); _f < _g.length; _f++) {
    var d = _g[_f][0];
    _loop_1(d);
}
if (__VLS_ctx.selectedDay) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "cal-day-panel" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)(__assign({ class: "cal-day-panel__heading" }));
    (new Date(__VLS_ctx.selectedDayStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }));
    if (__VLS_ctx.selectedDayEntries.length === 0) {
        /** @type {[typeof AppEmptyState, typeof AppEmptyState, ]} */ ;
        // @ts-ignore
        var __VLS_52 = __VLS_asFunctionalComponent(AppEmptyState_vue_1.default, new AppEmptyState_vue_1.default({
            ctaLabel: (__VLS_ctx.canCreate ? '+ Write entry' : undefined),
            ctaHref: (__VLS_ctx.canCreate ? "/entry/new?date=".concat(__VLS_ctx.selectedDayStr) : undefined),
        }));
        var __VLS_53 = __VLS_52.apply(void 0, __spreadArray([{
                ctaLabel: (__VLS_ctx.canCreate ? '+ Write entry' : undefined),
                ctaHref: (__VLS_ctx.canCreate ? "/entry/new?date=".concat(__VLS_ctx.selectedDayStr) : undefined),
            }], __VLS_functionalComponentArgsRest(__VLS_52), false));
        __VLS_54.slots.default;
        var __VLS_54;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)(__assign({ class: "cal-entry-list" }));
        var _loop_2 = function (item) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)(__assign({ key: (item.entryId) }, { class: "cal-entry-row" }));
            /** @type {[typeof PathColorBar, typeof PathColorBar, ]} */ ;
            // @ts-ignore
            var __VLS_55 = __VLS_asFunctionalComponent(PathColorBar_vue_1.default, new PathColorBar_vue_1.default({
                color: (item.color),
            }));
            var __VLS_56 = __VLS_55.apply(void 0, __spreadArray([{
                    color: (item.color),
                }], __VLS_functionalComponentArgsRest(__VLS_55), false));
            __VLS_57.slots.default;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign({ onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.selectedDay))
                        return;
                    if (!!(__VLS_ctx.selectedDayEntries.length === 0))
                        return;
                    __VLS_ctx.router.push("/entry/".concat(item.pathId, "/").concat(item.entryId));
                } }, { class: "cal-entry-btn" }));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "cal-entry-path" }));
            (item.pathTitle);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "cal-entry-preview" }));
            (item.preview || '(no text)');
        };
        var __VLS_57;
        for (var _h = 0, _j = __VLS_getVForSourceType((__VLS_ctx.selectedDayEntries)); _h < _j.length; _h++) {
            var item = _j[_h][0];
            _loop_2(item);
        }
    }
    if (__VLS_ctx.canCreate && __VLS_ctx.selectedDayEntries.length > 0) {
        var __VLS_58 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58(__assign({ fill: "outline", size: "small", routerLink: ("/entry/new?date=".concat(__VLS_ctx.selectedDayStr)), routerDirection: "forward" }, { class: "cal-add-btn" })));
        var __VLS_60 = __VLS_59.apply(void 0, __spreadArray([__assign({ fill: "outline", size: "small", routerLink: ("/entry/new?date=".concat(__VLS_ctx.selectedDayStr)), routerDirection: "forward" }, { class: "cal-add-btn" })], __VLS_functionalComponentArgsRest(__VLS_59), false));
        __VLS_61.slots.default;
        var __VLS_61;
    }
}
var __VLS_48;
var __VLS_62 = {}.IonFooter;
/** @type {[typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, ]} */ ;
// @ts-ignore
var __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({}));
var __VLS_64 = __VLS_63.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_63), false));
__VLS_65.slots.default;
/** @type {[typeof RefreshStatus, ]} */ ;
// @ts-ignore
var __VLS_66 = __VLS_asFunctionalComponent(RefreshStatus_vue_1.default, new RefreshStatus_vue_1.default({
    statusType: (__VLS_ctx.refreshStatusType),
    statusText: (__VLS_ctx.refreshStatusText),
    lastCheckedAt: (__VLS_ctx.refreshLastCheckedAt),
}));
var __VLS_67 = __VLS_66.apply(void 0, __spreadArray([{
        statusType: (__VLS_ctx.refreshStatusType),
        statusText: (__VLS_ctx.refreshStatusText),
        lastCheckedAt: (__VLS_ctx.refreshLastCheckedAt),
    }], __VLS_functionalComponentArgsRest(__VLS_66), false));
var __VLS_65;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['calendar-content']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-grid-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-weekday-row']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-weekday-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-days-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-day-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-day-cell--blank']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-day-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-day-number']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-dot-row']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-day-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-day-panel__heading']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-entry-list']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-entry-row']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-entry-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-entry-path']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-entry-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['cal-add-btn']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            IonPage: vue_1.IonPage,
            IonHeader: vue_1.IonHeader,
            IonToolbar: vue_1.IonToolbar,
            IonTitle: vue_1.IonTitle,
            IonContent: vue_1.IonContent,
            IonFooter: vue_1.IonFooter,
            IonButtons: vue_1.IonButtons,
            IonBackButton: vue_1.IonBackButton,
            IonButton: vue_1.IonButton,
            AppErrorBanner: AppErrorBanner_vue_1.default,
            AppEmptyState: AppEmptyState_vue_1.default,
            PathColorBar: PathColorBar_vue_1.default,
            RefreshStatus: RefreshStatus_vue_1.default,
            router: router,
            pathsError: pathsError,
            pathsErrorMsg: pathsErrorMsg,
            canCreate: canCreate,
            refreshStatusType: refreshStatusType,
            refreshStatusText: refreshStatusText,
            refreshLastCheckedAt: refreshLastCheckedAt,
            selectedDay: selectedDay,
            monthLabel: monthLabel,
            weekdays: weekdays,
            daysInMonth: daysInMonth,
            leadingBlanks: leadingBlanks,
            isToday: isToday,
            isSelected: isSelected,
            selectDay: selectDay,
            prevMonth: prevMonth,
            nextMonth: nextMonth,
            selectedDayStr: selectedDayStr,
            hasDayEntries: hasDayEntries,
            getDayColors: getDayColors,
            selectedDayEntries: selectedDayEntries,
        };
    },
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
