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
        <ion-title>{{ formattedDate }}</ion-title>
        <ion-buttons slot="end">
          <ion-button
            :router-link="`/date/${prevDate}`"
            router-direction="back"
            aria-label="Previous day"
          >
            <ion-icon slot="icon-only" name="chevron-back" />
          </ion-button>
          <ion-button
            :router-link="`/date/${nextDate}`"
            router-direction="forward"
            aria-label="Next day"
          >
            <ion-icon slot="icon-only" name="chevron-forward" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-text v-if="pathsError" color="danger" class="view-error-banner">
        {{ pathsErrorMessage }}
      </ion-text>
      <div v-if="dayEntries.length === 0" class="date-empty">
        <p>No entries for this day.</p>
        <ion-button
          v-if="ownedPaths.length > 0"
          :router-link="`/entry/new?date=${dateStr}`"
          router-direction="forward"
          expand="block"
          class="date-write-btn"
        >
          + Create entry
        </ion-button>
      </div>
      <div v-else>
        <div
          v-for="item in dayEntries"
          :key="item.entryId"
          class="date-entry-card"
          :style="{ borderLeftColor: item.color }"
          role="button"
          tabindex="0"
          @click="router.push(`/entry/${item.pathId}/${item.entryId}`)"
          @keydown.enter="router.push(`/entry/${item.pathId}/${item.entryId}`)"
        >
          <div class="date-entry-header">
            <span
              class="date-entry-dot"
              :style="{ backgroundColor: item.color }"
            ></span>
            <span class="date-entry-path">{{ item.pathTitle }}</span>
          </div>
          <p class="date-entry-preview">{{ item.preview || '(no text)' }}</p>
        </div>
        <ion-button
          v-if="ownedPaths.length > 0"
          :router-link="`/entry/new?date=${dateStr}`"
          router-direction="forward"
          expand="block"
          class="date-write-btn"
        >
          + Create entry
        </ion-button>
      </div>

      <!-- Previously on this day -->
      <div v-if="previousYears.length > 0" class="date-previously">
        <h3>✨ Previously on this day</h3>
        <div
          v-for="ye in previousYears"
          :key="`${ye.pathId}-${ye.year}`"
          class="date-prev-chip"
          role="button"
          tabindex="0"
          @click="router.push(`/date/${ye.year}-${todayMonthDay}`)"
          @keydown.enter="router.push(`/date/${ye.year}-${todayMonthDay}`)"
          @keydown.space.prevent="
            router.push(`/date/${ye.year}-${todayMonthDay}`)
          "
        >
          <span class="date-prev-year">{{ ye.year }}</span>
          <span class="date-prev-preview">{{ ye.preview || '(no text)' }}</span>
        </div>
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
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonText,
} from '@ionic/vue';
import RefreshStatus from '~/src/components/RefreshStatus.vue';
import { useRefreshStatus } from '~/src/composables/useRefreshStatus';
import { computed } from 'vue';
import { useMultiPathEntries } from '~/src/composables/useMultiPathEntries';
import { usePaths } from '~/src/composables/usePaths';
import { useCurrentUser } from '~/src/composables/useCurrentUser';
import { extractErrorMessage } from '~/src/lib/errors';

const route = useRoute();
const router = useRouter();

const dateStr = computed(() => String(route.params.date));

const formattedDate = computed(() => {
  const d = new Date(dateStr.value + 'T00:00:00');
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

function offsetDate(base: string, days: number): string {
  const d = new Date(base + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
const prevDate = computed(() => offsetDate(dateStr.value, -1));
const nextDate = computed(() => offsetDate(dateStr.value, 1));

const { data: paths, error: pathsError } = usePaths();
const allPaths = computed(() => paths.value ?? []);
const pathsErrorMessage = computed(
  () => extractErrorMessage(pathsError.value) ?? 'Unable to load paths.',
);
const pathIds = computed(() => allPaths.value.map((p) => p.path_id));
const multiPathEntries = useMultiPathEntries(pathIds);

const { currentUserId } = useCurrentUser();

const {
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

const ownedPaths = computed(() =>
  allPaths.value.filter((p) => p.owner_user_id === currentUserId.value),
);

const dayEntries = computed(() => {
  const result: Array<{
    entryId: string;
    pathId: string;
    pathTitle: string;
    color: string;
    preview: string | undefined;
  }> = [];
  for (const { pathId, entries } of multiPathEntries.value) {
    const path = allPaths.value.find((p) => p.path_id === pathId);
    if (!path) continue;
    for (const entry of entries) {
      if (entry.day === dateStr.value) {
        result.push({
          entryId: entry.id,
          pathId,
          pathTitle: path.title,
          color: path.color,
          preview: entry.content,
        });
      }
    }
  }
  return result;
});

const thisYear = computed(() => new Date().getFullYear());
const todayMonthDay = computed(() => dateStr.value.slice(5));

const previousYears = computed(() => {
  const result: Array<{
    pathId: string;
    year: number;
    preview: string | undefined;
  }> = [];
  for (const { pathId, entries } of multiPathEntries.value) {
    for (const entry of entries) {
      if (
        entry.day.slice(5) === todayMonthDay.value &&
        Number(entry.day.slice(0, 4)) < thisYear.value
      ) {
        result.push({
          pathId,
          year: Number(entry.day.slice(0, 4)),
          preview: entry.content,
        });
      }
    }
  }
  return result.sort((a, b) => b.year - a.year);
});
</script>

<style scoped>
.date-entry-card {
  background: var(--ion-card-background);
  border-left: 4px solid transparent;
  border-radius: var(--paths-border-radius);
  padding: 12px 16px;
  margin-bottom: 10px;
  cursor: pointer;
}
.date-entry-card:hover {
  background: var(--paths-card-hover);
}
.date-entry-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.date-entry-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.date-entry-path {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ion-color-medium);
}
.date-entry-preview {
  font-size: 0.9rem;
  color: var(--ion-text-color);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  margin: 0;
}
.date-empty {
  padding: 24px 0;
  text-align: center;
  color: var(--ion-color-medium);
}
.date-write-btn {
  margin-top: 12px;
}
.date-previously {
  margin-top: 24px;
}
.date-previously h3 {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--ion-color-medium);
}
.date-prev-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--ion-card-background);
  border-radius: var(--paths-border-radius);
  margin-bottom: 6px;
  cursor: pointer;
}
.date-prev-chip:hover {
  background: var(--paths-card-hover);
}
.date-prev-year {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--ion-color-primary);
  min-width: 40px;
}
.date-prev-preview {
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.view-error-banner {
  display: block;
  margin-bottom: 16px;
  font-size: 0.9rem;
}
</style>
/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />

definePageMeta({
    pageTransition: { name: 'ion-forward', mode: 'out-in' },
});
var vue_1 = require("@ionic/vue");
var RefreshStatus_vue_1 = require("~/src/components/RefreshStatus.vue");
var useRefreshStatus_1 = require("~/src/composables/useRefreshStatus");
var vue_2 = require("vue");
var useMultiPathEntries_1 = require("~/src/composables/useMultiPathEntries");
var usePaths_1 = require("~/src/composables/usePaths");
var useCurrentUser_1 = require("~/src/composables/useCurrentUser");
var errors_1 = require("~/src/lib/errors");
var route = useRoute();
var router = useRouter();
var dateStr = (0, vue_2.computed)(function () { return String(route.params.date); });
var formattedDate = (0, vue_2.computed)(function () {
    var d = new Date(dateStr.value + 'T00:00:00');
    return d.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
});
function offsetDate(base, days) {
    var d = new Date(base + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}
var prevDate = (0, vue_2.computed)(function () { return offsetDate(dateStr.value, -1); });
var nextDate = (0, vue_2.computed)(function () { return offsetDate(dateStr.value, 1); });
var _a = (0, usePaths_1.usePaths)(), paths = _a.data, pathsError = _a.error;
var allPaths = (0, vue_2.computed)(function () { var _a; return (_a = paths.value) !== null && _a !== void 0 ? _a : []; });
var pathsErrorMessage = (0, vue_2.computed)(function () { var _a; return (_a = (0, errors_1.extractErrorMessage)(pathsError.value)) !== null && _a !== void 0 ? _a : 'Unable to load paths.'; });
var pathIds = (0, vue_2.computed)(function () { return allPaths.value.map(function (p) { return p.path_id; }); });
var multiPathEntries = (0, useMultiPathEntries_1.useMultiPathEntries)(pathIds);
var currentUserId = (0, useCurrentUser_1.useCurrentUser)().currentUserId;
var _b = (0, useRefreshStatus_1.useRefreshStatus)(), refreshStatusType = _b.statusType, refreshStatusText = _b.statusText, refreshLastCheckedAt = _b.lastCheckedAt;
var ownedPaths = (0, vue_2.computed)(function () {
    return allPaths.value.filter(function (p) { return p.owner_user_id === currentUserId.value; });
});
var dayEntries = (0, vue_2.computed)(function () {
    var result = [];
    var _loop_3 = function (pathId, entries) {
        var path = allPaths.value.find(function (p) { return p.path_id === pathId; });
        if (!path)
            return "continue";
        for (var _c = 0, entries_1 = entries; _c < entries_1.length; _c++) {
            var entry = entries_1[_c];
            if (entry.day === dateStr.value) {
                result.push({
                    entryId: entry.id,
                    pathId: pathId,
                    pathTitle: path.title,
                    color: path.color,
                    preview: entry.content,
                });
            }
        }
    };
    for (var _i = 0, _a = multiPathEntries.value; _i < _a.length; _i++) {
        var _b = _a[_i], pathId = _b.pathId, entries = _b.entries;
        _loop_3(pathId, entries);
    }
    return result;
});
var thisYear = (0, vue_2.computed)(function () { return new Date().getFullYear(); });
var todayMonthDay = (0, vue_2.computed)(function () { return dateStr.value.slice(5); });
var previousYears = (0, vue_2.computed)(function () {
    var result = [];
    for (var _i = 0, _a = multiPathEntries.value; _i < _a.length; _i++) {
        var _b = _a[_i], pathId = _b.pathId, entries = _b.entries;
        for (var _c = 0, entries_2 = entries; _c < entries_2.length; _c++) {
            var entry = entries_2[_c];
            if (entry.day.slice(5) === todayMonthDay.value &&
                Number(entry.day.slice(0, 4)) < thisYear.value) {
                result.push({
                    pathId: pathId,
                    year: Number(entry.day.slice(0, 4)),
                    preview: entry.content,
                });
            }
        }
    }
    return result.sort(function (a, b) { return b.year - a.year; });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['date-entry-card']} */ ;
/** @type {__VLS_StyleScopedClasses['date-previously']} */ ;
/** @type {__VLS_StyleScopedClasses['date-prev-chip']} */ ;
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
(__VLS_ctx.formattedDate);
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
var __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
    routerLink: ("/date/".concat(__VLS_ctx.prevDate)),
    routerDirection: "back",
    'aria-label': "Previous day",
}));
var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([{
        routerLink: ("/date/".concat(__VLS_ctx.prevDate)),
        routerDirection: "back",
        'aria-label': "Previous day",
    }], __VLS_functionalComponentArgsRest(__VLS_30), false));
__VLS_32.slots.default;
var __VLS_33 = {}.IonIcon;
/** @type {[typeof __VLS_components.IonIcon, typeof __VLS_components.ionIcon, ]} */ ;
// @ts-ignore
var __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
    slot: "icon-only",
    name: "chevron-back",
}));
var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([{
        slot: "icon-only",
        name: "chevron-back",
    }], __VLS_functionalComponentArgsRest(__VLS_34), false));
var __VLS_32;
var __VLS_37 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
    routerLink: ("/date/".concat(__VLS_ctx.nextDate)),
    routerDirection: "forward",
    'aria-label': "Next day",
}));
var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([{
        routerLink: ("/date/".concat(__VLS_ctx.nextDate)),
        routerDirection: "forward",
        'aria-label': "Next day",
    }], __VLS_functionalComponentArgsRest(__VLS_38), false));
__VLS_40.slots.default;
var __VLS_41 = {}.IonIcon;
/** @type {[typeof __VLS_components.IonIcon, typeof __VLS_components.ionIcon, ]} */ ;
// @ts-ignore
var __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
    slot: "icon-only",
    name: "chevron-forward",
}));
var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([{
        slot: "icon-only",
        name: "chevron-forward",
    }], __VLS_functionalComponentArgsRest(__VLS_42), false));
var __VLS_40;
var __VLS_28;
var __VLS_12;
var __VLS_8;
var __VLS_45 = {}.IonContent;
/** @type {[typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, ]} */ ;
// @ts-ignore
var __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45(__assign({ class: "ion-padding" })));
var __VLS_47 = __VLS_46.apply(void 0, __spreadArray([__assign({ class: "ion-padding" })], __VLS_functionalComponentArgsRest(__VLS_46), false));
__VLS_48.slots.default;
if (__VLS_ctx.pathsError) {
    var __VLS_49 = {}.IonText;
    /** @type {[typeof __VLS_components.IonText, typeof __VLS_components.ionText, typeof __VLS_components.IonText, typeof __VLS_components.ionText, ]} */ ;
    // @ts-ignore
    var __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49(__assign({ color: "danger" }, { class: "view-error-banner" })));
    var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([__assign({ color: "danger" }, { class: "view-error-banner" })], __VLS_functionalComponentArgsRest(__VLS_50), false));
    __VLS_52.slots.default;
    (__VLS_ctx.pathsErrorMessage);
    var __VLS_52;
}
if (__VLS_ctx.dayEntries.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "date-empty" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    if (__VLS_ctx.ownedPaths.length > 0) {
        var __VLS_53 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_54 = __VLS_asFunctionalComponent(__VLS_53, new __VLS_53(__assign({ routerLink: ("/entry/new?date=".concat(__VLS_ctx.dateStr)), routerDirection: "forward", expand: "block" }, { class: "date-write-btn" })));
        var __VLS_55 = __VLS_54.apply(void 0, __spreadArray([__assign({ routerLink: ("/entry/new?date=".concat(__VLS_ctx.dateStr)), routerDirection: "forward", expand: "block" }, { class: "date-write-btn" })], __VLS_functionalComponentArgsRest(__VLS_54), false));
        __VLS_56.slots.default;
        var __VLS_56;
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    var _loop_1 = function (item) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign(__assign(__assign(__assign(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(__VLS_ctx.dayEntries.length === 0))
                    return;
                __VLS_ctx.router.push("/entry/".concat(item.pathId, "/").concat(item.entryId));
            } }, { onKeydown: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(__VLS_ctx.dayEntries.length === 0))
                    return;
                __VLS_ctx.router.push("/entry/".concat(item.pathId, "/").concat(item.entryId));
            } }), { key: (item.entryId) }), { class: "date-entry-card" }), { style: ({ borderLeftColor: item.color }) }), { role: "button", tabindex: "0" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "date-entry-header" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "date-entry-dot" }, { style: ({ backgroundColor: item.color }) }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "date-entry-path" }));
        (item.pathTitle);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "date-entry-preview" }));
        (item.preview || '(no text)');
    };
    for (var _i = 0, _c = __VLS_getVForSourceType((__VLS_ctx.dayEntries)); _i < _c.length; _i++) {
        var item = _c[_i][0];
        _loop_1(item);
    }
    if (__VLS_ctx.ownedPaths.length > 0) {
        var __VLS_57 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57(__assign({ routerLink: ("/entry/new?date=".concat(__VLS_ctx.dateStr)), routerDirection: "forward", expand: "block" }, { class: "date-write-btn" })));
        var __VLS_59 = __VLS_58.apply(void 0, __spreadArray([__assign({ routerLink: ("/entry/new?date=".concat(__VLS_ctx.dateStr)), routerDirection: "forward", expand: "block" }, { class: "date-write-btn" })], __VLS_functionalComponentArgsRest(__VLS_58), false));
        __VLS_60.slots.default;
        var __VLS_60;
    }
}
if (__VLS_ctx.previousYears.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "date-previously" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    var _loop_2 = function (ye) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign(__assign(__assign(__assign(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.previousYears.length > 0))
                    return;
                __VLS_ctx.router.push("/date/".concat(ye.year, "-").concat(__VLS_ctx.todayMonthDay));
            } }, { onKeydown: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.previousYears.length > 0))
                    return;
                __VLS_ctx.router.push("/date/".concat(ye.year, "-").concat(__VLS_ctx.todayMonthDay));
            } }), { onKeydown: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.previousYears.length > 0))
                    return;
                __VLS_ctx.router.push("/date/".concat(ye.year, "-").concat(__VLS_ctx.todayMonthDay));
            } }), { key: ("".concat(ye.pathId, "-").concat(ye.year)) }), { class: "date-prev-chip" }), { role: "button", tabindex: "0" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "date-prev-year" }));
        (ye.year);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "date-prev-preview" }));
        (ye.preview || '(no text)');
    };
    for (var _d = 0, _e = __VLS_getVForSourceType((__VLS_ctx.previousYears)); _d < _e.length; _d++) {
        var ye = _e[_d][0];
        _loop_2(ye);
    }
}
var __VLS_48;
var __VLS_61 = {}.IonFooter;
/** @type {[typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, ]} */ ;
// @ts-ignore
var __VLS_62 = __VLS_asFunctionalComponent(__VLS_61, new __VLS_61({}));
var __VLS_63 = __VLS_62.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_62), false));
__VLS_64.slots.default;
/** @type {[typeof RefreshStatus, ]} */ ;
// @ts-ignore
var __VLS_65 = __VLS_asFunctionalComponent(RefreshStatus_vue_1.default, new RefreshStatus_vue_1.default({
    statusType: (__VLS_ctx.refreshStatusType),
    statusText: (__VLS_ctx.refreshStatusText),
    lastCheckedAt: (__VLS_ctx.refreshLastCheckedAt),
}));
var __VLS_66 = __VLS_65.apply(void 0, __spreadArray([{
        statusType: (__VLS_ctx.refreshStatusType),
        statusText: (__VLS_ctx.refreshStatusText),
        lastCheckedAt: (__VLS_ctx.refreshLastCheckedAt),
    }], __VLS_functionalComponentArgsRest(__VLS_65), false));
var __VLS_64;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['ion-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['view-error-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['date-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['date-write-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['date-entry-card']} */ ;
/** @type {__VLS_StyleScopedClasses['date-entry-header']} */ ;
/** @type {__VLS_StyleScopedClasses['date-entry-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['date-entry-path']} */ ;
/** @type {__VLS_StyleScopedClasses['date-entry-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['date-write-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['date-previously']} */ ;
/** @type {__VLS_StyleScopedClasses['date-prev-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['date-prev-year']} */ ;
/** @type {__VLS_StyleScopedClasses['date-prev-preview']} */ ;
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
            IonButton: vue_1.IonButton,
            IonButtons: vue_1.IonButtons,
            IonBackButton: vue_1.IonBackButton,
            IonIcon: vue_1.IonIcon,
            IonText: vue_1.IonText,
            RefreshStatus: RefreshStatus_vue_1.default,
            router: router,
            dateStr: dateStr,
            formattedDate: formattedDate,
            prevDate: prevDate,
            nextDate: nextDate,
            pathsError: pathsError,
            pathsErrorMessage: pathsErrorMessage,
            refreshStatusType: refreshStatusType,
            refreshStatusText: refreshStatusText,
            refreshLastCheckedAt: refreshLastCheckedAt,
            ownedPaths: ownedPaths,
            dayEntries: dayEntries,
            todayMonthDay: todayMonthDay,
            previousYears: previousYears,
        };
    },
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
