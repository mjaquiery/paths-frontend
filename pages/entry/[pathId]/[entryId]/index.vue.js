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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/path/${pathId}`" />
        </ion-buttons>
        <ion-title>
          <span v-if="path">
            <span
              class="entry-path-dot"
              :style="{ backgroundColor: path.color }"
            ></span>
            {{ path.title }}
          </span>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button
            v-if="canEdit"
            color="primary"
            :router-link="`/entry/${pathId}/${entryId}/edit`"
            router-direction="forward"
            >Edit</ion-button
          >
          <ion-button v-if="canEdit" color="danger" @click="confirmDelete"
            >Delete</ion-button
          >
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p v-if="deleteError" class="delete-error">{{ deleteError }}</p>
      <p class="entry-meta">
        {{
          entry?.day
            ? new Date(entry.day + 'T00:00:00').toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : ''
        }}
      </p>
      <div v-if="entry?.content === undefined" class="entry-loading">
        Loading…
      </div>
      <div v-else-if="!entry.content" class="entry-empty">(no text)</div>
      <MarkdownContent v-else :content="entry.content" :images="entry.images" />

      <!-- On this day from other years -->
      <div v-if="previousYears.length > 0" class="entry-on-this-day">
        <h3>✨ On this day (other years)</h3>
        <div
          v-for="ye in previousYears"
          :key="`${ye.entryId}-${ye.year}`"
          class="entry-prev-chip"
          role="button"
          tabindex="0"
          @click="router.push(`/entry/${pathId}/${ye.entryId}`)"
          @keydown.enter="router.push(`/entry/${pathId}/${ye.entryId}`)"
        >
          <span class="entry-prev-year">{{ ye.year }}</span>
          <span class="entry-prev-preview">{{
            ye.preview || '(no text)'
          }}</span>
        </div>
      </div>
    </ion-content>

    <ion-alert
      :is-open="showDeleteAlert"
      header="Delete Entry"
      :message="`Delete the entry for ${entry?.day ? new Date(entry.day + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}? This action cannot be undone.`"
      :buttons="deleteAlertButtons"
      @didDismiss="showDeleteAlert = false"
    />
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
  IonAlert,
} from '@ionic/vue';
import RefreshStatus from '~/src/components/RefreshStatus.vue';
import { useRefreshStatus } from '~/src/composables/useRefreshStatus';
import { computed, ref } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { usePaths } from '~/src/composables/usePaths';
import { useMultiPathEntries } from '~/src/composables/useMultiPathEntries';
import { useDeleteEntry } from '~/src/generated/apiClient';
import { useCurrentUser } from '~/src/composables/useCurrentUser';
import { db } from '~/src/lib/db';
import MarkdownContent from '~/src/components/MarkdownContent.vue';

const route = useRoute();
const router = useRouter();
const pathId = computed(() => String(route.params.pathId));
const entryId = computed(() => String(route.params.entryId));

const { data: paths } = usePaths();
const path = computed(
  () => (paths.value ?? []).find((p) => p.path_id === pathId.value) ?? null,
);

const { currentUserId } = useCurrentUser();
const canEdit = computed(
  () =>
    !!currentUserId.value && path.value?.owner_user_id === currentUserId.value,
);

const {
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

const pathIdArr = computed(() => (pathId.value ? [pathId.value] : []));
const multiPathEntries = useMultiPathEntries(pathIdArr);

const entry = computed(() => {
  const pe = multiPathEntries.value.find((x) => x.pathId === pathId.value);
  return pe?.entries.find((e) => e.id === entryId.value) ?? null;
});

const thisYear = computed(() => new Date().getFullYear());
const previousYears = computed(() => {
  if (!entry.value) return [];
  const monthDay = entry.value.day.slice(5);
  const pe = multiPathEntries.value.find((x) => x.pathId === pathId.value);
  return (pe?.entries ?? [])
    .filter(
      (e) =>
        e.day.slice(5) === monthDay &&
        Number(e.day.slice(0, 4)) < thisYear.value &&
        e.id !== entryId.value,
    )
    .map((e) => ({
      entryId: e.id,
      year: Number(e.day.slice(0, 4)),
      preview: e.content,
    }))
    .sort((a, b) => b.year - a.year);
});

const queryClient = useQueryClient();
const { mutateAsync: doDeleteEntry } = useDeleteEntry();
const showDeleteAlert = ref(false);
const deleteError = ref('');

const deleteAlertButtons = computed(() => [
  { text: 'Cancel', role: 'cancel' },
  {
    text: 'Delete',
    role: 'destructive',
    handler: () => {
      void performDelete();
    },
  },
]);

function confirmDelete() {
  showDeleteAlert.value = true;
}

async function performDelete() {
  if (!entry.value) return;
  deleteError.value = '';
  try {
    await doDeleteEntry({
      pathCode: pathId.value,
      entrySlug: entryId.value,
    });
    void queryClient.invalidateQueries({
      queryKey: ['v1', 'paths', pathId.value, 'entries'],
    });
    try {
      await db.entryContent.delete(`${pathId.value}:${entryId.value}`);
      await db.entryImages.where('entry_id').equals(entryId.value).delete();
    } catch {
      /* IndexedDB may be unavailable */
    }
    router.back();
  } catch (err: unknown) {
    deleteError.value =
      (err instanceof Error ? err.message : null) ?? 'Failed to delete entry.';
  }
}
</script>

<style scoped>
.entry-path-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}
.entry-meta {
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}
.entry-loading,
.entry-empty {
  color: var(--ion-color-medium);
  font-style: italic;
}
.entry-on-this-day {
  margin-top: 32px;
  border-top: 1px solid var(--ion-border-color);
  padding-top: 16px;
}
.entry-on-this-day h3 {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ion-color-medium);
  margin-bottom: 12px;
}
.entry-prev-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--ion-card-background);
  border-radius: var(--paths-border-radius);
  margin-bottom: 6px;
  cursor: pointer;
}
.entry-prev-chip:hover {
  background: var(--paths-card-hover);
}
.entry-prev-year {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--ion-color-primary);
  min-width: 40px;
}
.entry-prev-preview {
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.delete-error {
  color: var(--ion-color-danger);
  font-size: 0.85rem;
  margin-top: 8px;
}
</style>
/// <reference types="../../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />

definePageMeta({
    pageTransition: { name: 'ion-forward', mode: 'out-in' },
});
var vue_1 = require("@ionic/vue");
var RefreshStatus_vue_1 = require("~/src/components/RefreshStatus.vue");
var useRefreshStatus_1 = require("~/src/composables/useRefreshStatus");
var vue_2 = require("vue");
var vue_query_1 = require("@tanstack/vue-query");
var usePaths_1 = require("~/src/composables/usePaths");
var useMultiPathEntries_1 = require("~/src/composables/useMultiPathEntries");
var apiClient_1 = require("~/src/generated/apiClient");
var useCurrentUser_1 = require("~/src/composables/useCurrentUser");
var db_1 = require("~/src/lib/db");
var MarkdownContent_vue_1 = require("~/src/components/MarkdownContent.vue");
var route = useRoute();
var router = useRouter();
var pathId = (0, vue_2.computed)(function () { return String(route.params.pathId); });
var entryId = (0, vue_2.computed)(function () { return String(route.params.entryId); });
var paths = (0, usePaths_1.usePaths)().data;
var path = (0, vue_2.computed)(function () { var _a, _b; return (_b = ((_a = paths.value) !== null && _a !== void 0 ? _a : []).find(function (p) { return p.path_id === pathId.value; })) !== null && _b !== void 0 ? _b : null; });
var currentUserId = (0, useCurrentUser_1.useCurrentUser)().currentUserId;
var canEdit = (0, vue_2.computed)(function () { var _a; return !!currentUserId.value && ((_a = path.value) === null || _a === void 0 ? void 0 : _a.owner_user_id) === currentUserId.value; });
var _e = (0, useRefreshStatus_1.useRefreshStatus)(), refreshStatusType = _e.statusType, refreshStatusText = _e.statusText, refreshLastCheckedAt = _e.lastCheckedAt;
var pathIdArr = (0, vue_2.computed)(function () { return (pathId.value ? [pathId.value] : []); });
var multiPathEntries = (0, useMultiPathEntries_1.useMultiPathEntries)(pathIdArr);
var entry = (0, vue_2.computed)(function () {
    var _a;
    var pe = multiPathEntries.value.find(function (x) { return x.pathId === pathId.value; });
    return (_a = pe === null || pe === void 0 ? void 0 : pe.entries.find(function (e) { return e.id === entryId.value; })) !== null && _a !== void 0 ? _a : null;
});
var thisYear = (0, vue_2.computed)(function () { return new Date().getFullYear(); });
var previousYears = (0, vue_2.computed)(function () {
    var _a;
    if (!entry.value)
        return [];
    var monthDay = entry.value.day.slice(5);
    var pe = multiPathEntries.value.find(function (x) { return x.pathId === pathId.value; });
    return ((_a = pe === null || pe === void 0 ? void 0 : pe.entries) !== null && _a !== void 0 ? _a : [])
        .filter(function (e) {
        return e.day.slice(5) === monthDay &&
            Number(e.day.slice(0, 4)) < thisYear.value &&
            e.id !== entryId.value;
    })
        .map(function (e) { return ({
        entryId: e.id,
        year: Number(e.day.slice(0, 4)),
        preview: e.content,
    }); })
        .sort(function (a, b) { return b.year - a.year; });
});
var queryClient = (0, vue_query_1.useQueryClient)();
var doDeleteEntry = (0, apiClient_1.useDeleteEntry)().mutateAsync;
var showDeleteAlert = (0, vue_2.ref)(false);
var deleteError = (0, vue_2.ref)('');
var deleteAlertButtons = (0, vue_2.computed)(function () { return [
    { text: 'Cancel', role: 'cancel' },
    {
        text: 'Delete',
        role: 'destructive',
        handler: function () {
            void performDelete();
        },
    },
]; });
function confirmDelete() {
    showDeleteAlert.value = true;
}
function performDelete() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, err_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!entry.value)
                        return [2 /*return*/];
                    deleteError.value = '';
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 8, , 9]);
                    return [4 /*yield*/, doDeleteEntry({
                            pathCode: pathId.value,
                            entrySlug: entryId.value,
                        })];
                case 2:
                    _c.sent();
                    void queryClient.invalidateQueries({
                        queryKey: ['v1', 'paths', pathId.value, 'entries'],
                    });
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 6, , 7]);
                    return [4 /*yield*/, db_1.db.entryContent.delete("".concat(pathId.value, ":").concat(entryId.value))];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, db_1.db.entryImages.where('entry_id').equals(entryId.value).delete()];
                case 5:
                    _c.sent();
                    return [3 /*break*/, 7];
                case 6:
                    _a = _c.sent();
                    return [3 /*break*/, 7];
                case 7:
                    router.back();
                    return [3 /*break*/, 9];
                case 8:
                    err_1 = _c.sent();
                    deleteError.value =
                        (_b = (err_1 instanceof Error ? err_1.message : null)) !== null && _b !== void 0 ? _b : 'Failed to delete entry.';
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['entry-on-this-day']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-prev-chip']} */ ;
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
    defaultHref: ("/path/".concat(__VLS_ctx.pathId)),
}));
var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([{
        defaultHref: ("/path/".concat(__VLS_ctx.pathId)),
    }], __VLS_functionalComponentArgsRest(__VLS_18), false));
var __VLS_16;
var __VLS_21 = {}.IonTitle;
/** @type {[typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, ]} */ ;
// @ts-ignore
var __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({}));
var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_22), false));
__VLS_24.slots.default;
if (__VLS_ctx.path) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "entry-path-dot" }, { style: ({ backgroundColor: __VLS_ctx.path.color }) }));
    (__VLS_ctx.path.title);
}
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
if (__VLS_ctx.canEdit) {
    var __VLS_29 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
        color: "primary",
        routerLink: ("/entry/".concat(__VLS_ctx.pathId, "/").concat(__VLS_ctx.entryId, "/edit")),
        routerDirection: "forward",
    }));
    var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([{
            color: "primary",
            routerLink: ("/entry/".concat(__VLS_ctx.pathId, "/").concat(__VLS_ctx.entryId, "/edit")),
            routerDirection: "forward",
        }], __VLS_functionalComponentArgsRest(__VLS_30), false));
    __VLS_32.slots.default;
    var __VLS_32;
}
if (__VLS_ctx.canEdit) {
    var __VLS_33 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33(__assign({ 'onClick': {} }, { color: "danger" })));
    var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { color: "danger" })], __VLS_functionalComponentArgsRest(__VLS_34), false));
    var __VLS_37 = void 0;
    var __VLS_38 = void 0;
    var __VLS_39 = void 0;
    var __VLS_40 = {
        onClick: (__VLS_ctx.confirmDelete)
    };
    __VLS_36.slots.default;
    var __VLS_36;
}
var __VLS_28;
var __VLS_12;
var __VLS_8;
var __VLS_41 = {}.IonContent;
/** @type {[typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, ]} */ ;
// @ts-ignore
var __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41(__assign({ class: "ion-padding" })));
var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([__assign({ class: "ion-padding" })], __VLS_functionalComponentArgsRest(__VLS_42), false));
__VLS_44.slots.default;
if (__VLS_ctx.deleteError) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "delete-error" }));
    (__VLS_ctx.deleteError);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "entry-meta" }));
(((_a = __VLS_ctx.entry) === null || _a === void 0 ? void 0 : _a.day)
    ? new Date(__VLS_ctx.entry.day + 'T00:00:00').toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
    : '');
if (((_b = __VLS_ctx.entry) === null || _b === void 0 ? void 0 : _b.content) === undefined) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "entry-loading" }));
}
else if (!__VLS_ctx.entry.content) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "entry-empty" }));
}
else {
    /** @type {[typeof MarkdownContent, ]} */ ;
    // @ts-ignore
    var __VLS_45 = __VLS_asFunctionalComponent(MarkdownContent_vue_1.default, new MarkdownContent_vue_1.default({
        content: (__VLS_ctx.entry.content),
        images: (__VLS_ctx.entry.images),
    }));
    var __VLS_46 = __VLS_45.apply(void 0, __spreadArray([{
            content: (__VLS_ctx.entry.content),
            images: (__VLS_ctx.entry.images),
        }], __VLS_functionalComponentArgsRest(__VLS_45), false));
}
if (__VLS_ctx.previousYears.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "entry-on-this-day" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    var _loop_1 = function (ye) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign(__assign(__assign(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.previousYears.length > 0))
                    return;
                __VLS_ctx.router.push("/entry/".concat(__VLS_ctx.pathId, "/").concat(ye.entryId));
            } }, { onKeydown: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.previousYears.length > 0))
                    return;
                __VLS_ctx.router.push("/entry/".concat(__VLS_ctx.pathId, "/").concat(ye.entryId));
            } }), { key: ("".concat(ye.entryId, "-").concat(ye.year)) }), { class: "entry-prev-chip" }), { role: "button", tabindex: "0" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "entry-prev-year" }));
        (ye.year);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "entry-prev-preview" }));
        (ye.preview || '(no text)');
    };
    for (var _i = 0, _f = __VLS_getVForSourceType((__VLS_ctx.previousYears)); _i < _f.length; _i++) {
        var ye = _f[_i][0];
        _loop_1(ye);
    }
}
var __VLS_44;
var __VLS_48 = {}.IonAlert;
/** @type {[typeof __VLS_components.IonAlert, typeof __VLS_components.ionAlert, ]} */ ;
// @ts-ignore
var __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48(__assign({ 'onDidDismiss': {} }, { isOpen: (__VLS_ctx.showDeleteAlert), header: "Delete Entry", message: ("Delete the entry for ".concat(((_c = __VLS_ctx.entry) === null || _c === void 0 ? void 0 : _c.day) ? new Date(__VLS_ctx.entry.day + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '', "? This action cannot be undone.")), buttons: (__VLS_ctx.deleteAlertButtons) })));
var __VLS_50 = __VLS_49.apply(void 0, __spreadArray([__assign({ 'onDidDismiss': {} }, { isOpen: (__VLS_ctx.showDeleteAlert), header: "Delete Entry", message: ("Delete the entry for ".concat(((_d = __VLS_ctx.entry) === null || _d === void 0 ? void 0 : _d.day) ? new Date(__VLS_ctx.entry.day + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '', "? This action cannot be undone.")), buttons: (__VLS_ctx.deleteAlertButtons) })], __VLS_functionalComponentArgsRest(__VLS_49), false));
var __VLS_52;
var __VLS_53;
var __VLS_54;
var __VLS_55 = {
    onDidDismiss: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showDeleteAlert = false;
    }
};
var __VLS_51;
var __VLS_56 = {}.IonFooter;
/** @type {[typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, ]} */ ;
// @ts-ignore
var __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
var __VLS_58 = __VLS_57.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_57), false));
__VLS_59.slots.default;
/** @type {[typeof RefreshStatus, ]} */ ;
// @ts-ignore
var __VLS_60 = __VLS_asFunctionalComponent(RefreshStatus_vue_1.default, new RefreshStatus_vue_1.default({
    statusType: (__VLS_ctx.refreshStatusType),
    statusText: (__VLS_ctx.refreshStatusText),
    lastCheckedAt: (__VLS_ctx.refreshLastCheckedAt),
}));
var __VLS_61 = __VLS_60.apply(void 0, __spreadArray([{
        statusType: (__VLS_ctx.refreshStatusType),
        statusText: (__VLS_ctx.refreshStatusText),
        lastCheckedAt: (__VLS_ctx.refreshLastCheckedAt),
    }], __VLS_functionalComponentArgsRest(__VLS_60), false));
var __VLS_59;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['entry-path-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['ion-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['delete-error']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-on-this-day']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-prev-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-prev-year']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-prev-preview']} */ ;
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
            IonAlert: vue_1.IonAlert,
            RefreshStatus: RefreshStatus_vue_1.default,
            MarkdownContent: MarkdownContent_vue_1.default,
            router: router,
            pathId: pathId,
            entryId: entryId,
            path: path,
            canEdit: canEdit,
            refreshStatusType: refreshStatusType,
            refreshStatusText: refreshStatusText,
            refreshLastCheckedAt: refreshLastCheckedAt,
            entry: entry,
            previousYears: previousYears,
            showDeleteAlert: showDeleteAlert,
            deleteError: deleteError,
            deleteAlertButtons: deleteAlertButtons,
            confirmDelete: confirmDelete,
        };
    },
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
