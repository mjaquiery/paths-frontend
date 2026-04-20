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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>
          <span v-if="path" class="path-view-title">
            <span
              class="path-view-dot"
              :style="{ backgroundColor: path.color }"
            ></span>
            {{ path.title }}
          </span>
          <span v-else>Path</span>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button
            v-if="isOwned"
            :router-link="`/entry/${pathId}/new`"
            router-direction="forward"
            >+ Entry</ion-button
          >
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-text v-if="pathsError" color="danger" class="view-error-banner">
        {{ pathsErrorMessage }}
      </ion-text>
      <div v-if="groupedEntries.length === 0" class="path-empty">
        <p>No entries yet.</p>
        <ion-button
          v-if="isOwned"
          :router-link="`/entry/${pathId}/new`"
          router-direction="forward"
          >Write first entry</ion-button
        >
      </div>
      <div v-for="group in groupedEntries" :key="group.label">
        <h3 class="path-month-label">{{ group.label }}</h3>
        <div
          v-for="entry in group.entries"
          :key="entry.id"
          class="path-entry-row"
          role="button"
          tabindex="0"
          @click="router.push(`/entry/${pathId}/${entry.id}`)"
          @keydown.enter="router.push(`/entry/${pathId}/${entry.id}`)"
          @keydown.space.prevent="router.push(`/entry/${pathId}/${entry.id}`)"
        >
          <span class="path-entry-date">{{
            new Date(entry.day + 'T00:00:00').toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          }}</span>
          <span class="path-entry-preview">{{
            entry.content || '(no text)'
          }}</span>
          <span
            v-if="(entry.image_filenames?.length ?? 0) > 0"
            class="path-entry-images"
            >📷 {{ entry.image_filenames?.length }}</span
          >
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
  IonText,
} from '@ionic/vue';
import { computed } from 'vue';
import { usePaths } from '~/src/composables/usePaths';
import { useMultiPathEntries } from '~/src/composables/useMultiPathEntries';
import { useCurrentUser } from '~/src/composables/useCurrentUser';
import { useRefreshStatus } from '~/src/composables/useRefreshStatus';
import { extractErrorMessage } from '~/src/lib/errors';
import RefreshStatus from '~/src/components/RefreshStatus.vue';

const route = useRoute();
const router = useRouter();
const pathId = computed(() => String(route.params.pathId));

const { data: paths, error: pathsError } = usePaths();
const path = computed(
  () => (paths.value ?? []).find((p) => p.path_id === pathId.value) ?? null,
);
const pathsErrorMessage = computed(
  () => extractErrorMessage(pathsError.value) ?? 'Unable to load this path.',
);

const { currentUserId } = useCurrentUser();
const isOwned = computed(
  () => path.value?.owner_user_id === currentUserId.value,
);

const {
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

const pathIdArr = computed(() => (path.value ? [pathId.value] : []));
const multiPathEntries = useMultiPathEntries(pathIdArr);

const entries = computed(() => {
  const pe = multiPathEntries.value.find((x) => x.pathId === pathId.value);
  return (pe?.entries ?? []).slice().sort((a, b) => b.day.localeCompare(a.day));
});

interface EntryGroup {
  label: string;
  entries: typeof entries.value;
}
const groupedEntries = computed<EntryGroup[]>(() => {
  const groups: Map<string, EntryGroup> = new Map();
  for (const entry of entries.value) {
    const d = new Date(entry.day + 'T00:00:00');
    const label = d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
    });
    if (!groups.has(label)) groups.set(label, { label, entries: [] });
    groups.get(label)!.entries.push(entry);
  }
  return Array.from(groups.values());
});
</script>

<style scoped>
.path-view-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.path-view-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.path-empty {
  padding: 24px 0;
  text-align: center;
  color: var(--ion-color-medium);
}
.path-month-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ion-color-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 20px 0 8px;
}
.path-entry-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--ion-card-background);
  border-radius: var(--paths-border-radius);
  margin-bottom: 6px;
  cursor: pointer;
}
.path-entry-row:hover {
  background: var(--paths-card-hover);
}
.path-entry-row:focus-visible {
  outline: 2px solid var(--ion-color-primary, #3949ab);
  outline-offset: 1px;
}
.path-entry-date {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  min-width: 88px;
  flex-shrink: 0;
}
.path-entry-preview {
  font-size: 0.9rem;
  color: var(--ion-text-color);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  flex: 1;
}
.path-entry-images {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  flex-shrink: 0;
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
var vue_2 = require("vue");
var usePaths_1 = require("~/src/composables/usePaths");
var useMultiPathEntries_1 = require("~/src/composables/useMultiPathEntries");
var useCurrentUser_1 = require("~/src/composables/useCurrentUser");
var useRefreshStatus_1 = require("~/src/composables/useRefreshStatus");
var errors_1 = require("~/src/lib/errors");
var RefreshStatus_vue_1 = require("~/src/components/RefreshStatus.vue");
var route = useRoute();
var router = useRouter();
var pathId = (0, vue_2.computed)(function () { return String(route.params.pathId); });
var _d = (0, usePaths_1.usePaths)(), paths = _d.data, pathsError = _d.error;
var path = (0, vue_2.computed)(function () { var _a, _b; return (_b = ((_a = paths.value) !== null && _a !== void 0 ? _a : []).find(function (p) { return p.path_id === pathId.value; })) !== null && _b !== void 0 ? _b : null; });
var pathsErrorMessage = (0, vue_2.computed)(function () { var _a; return (_a = (0, errors_1.extractErrorMessage)(pathsError.value)) !== null && _a !== void 0 ? _a : 'Unable to load this path.'; });
var currentUserId = (0, useCurrentUser_1.useCurrentUser)().currentUserId;
var isOwned = (0, vue_2.computed)(function () { var _a; return ((_a = path.value) === null || _a === void 0 ? void 0 : _a.owner_user_id) === currentUserId.value; });
var _e = (0, useRefreshStatus_1.useRefreshStatus)(), refreshStatusType = _e.statusType, refreshStatusText = _e.statusText, refreshLastCheckedAt = _e.lastCheckedAt;
var pathIdArr = (0, vue_2.computed)(function () { return (path.value ? [pathId.value] : []); });
var multiPathEntries = (0, useMultiPathEntries_1.useMultiPathEntries)(pathIdArr);
var entries = (0, vue_2.computed)(function () {
    var _a;
    var pe = multiPathEntries.value.find(function (x) { return x.pathId === pathId.value; });
    return ((_a = pe === null || pe === void 0 ? void 0 : pe.entries) !== null && _a !== void 0 ? _a : []).slice().sort(function (a, b) { return b.day.localeCompare(a.day); });
});
var groupedEntries = (0, vue_2.computed)(function () {
    var groups = new Map();
    for (var _i = 0, _a = entries.value; _i < _a.length; _i++) {
        var entry = _a[_i];
        var d = new Date(entry.day + 'T00:00:00');
        var label = d.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
        });
        if (!groups.has(label))
            groups.set(label, { label: label, entries: [] });
        groups.get(label).entries.push(entry);
    }
    return Array.from(groups.values());
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['path-entry-row']} */ ;
/** @type {__VLS_StyleScopedClasses['path-entry-row']} */ ;
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
if (__VLS_ctx.path) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "path-view-title" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "path-view-dot" }, { style: ({ backgroundColor: __VLS_ctx.path.color }) }));
    (__VLS_ctx.path.title);
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
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
if (__VLS_ctx.isOwned) {
    var __VLS_29 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29({
        routerLink: ("/entry/".concat(__VLS_ctx.pathId, "/new")),
        routerDirection: "forward",
    }));
    var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([{
            routerLink: ("/entry/".concat(__VLS_ctx.pathId, "/new")),
            routerDirection: "forward",
        }], __VLS_functionalComponentArgsRest(__VLS_30), false));
    __VLS_32.slots.default;
    var __VLS_32;
}
var __VLS_28;
var __VLS_12;
var __VLS_8;
var __VLS_33 = {}.IonContent;
/** @type {[typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, ]} */ ;
// @ts-ignore
var __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33(__assign({ class: "ion-padding" })));
var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([__assign({ class: "ion-padding" })], __VLS_functionalComponentArgsRest(__VLS_34), false));
__VLS_36.slots.default;
if (__VLS_ctx.pathsError) {
    var __VLS_37 = {}.IonText;
    /** @type {[typeof __VLS_components.IonText, typeof __VLS_components.ionText, typeof __VLS_components.IonText, typeof __VLS_components.ionText, ]} */ ;
    // @ts-ignore
    var __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37(__assign({ color: "danger" }, { class: "view-error-banner" })));
    var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([__assign({ color: "danger" }, { class: "view-error-banner" })], __VLS_functionalComponentArgsRest(__VLS_38), false));
    __VLS_40.slots.default;
    (__VLS_ctx.pathsErrorMessage);
    var __VLS_40;
}
if (__VLS_ctx.groupedEntries.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "path-empty" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    if (__VLS_ctx.isOwned) {
        var __VLS_41 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41({
            routerLink: ("/entry/".concat(__VLS_ctx.pathId, "/new")),
            routerDirection: "forward",
        }));
        var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([{
                routerLink: ("/entry/".concat(__VLS_ctx.pathId, "/new")),
                routerDirection: "forward",
            }], __VLS_functionalComponentArgsRest(__VLS_42), false));
        __VLS_44.slots.default;
        var __VLS_44;
    }
}
for (var _i = 0, _f = __VLS_getVForSourceType((__VLS_ctx.groupedEntries)); _i < _f.length; _i++) {
    var group = _f[_i][0];
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (group.label),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)(__assign({ class: "path-month-label" }));
    (group.label);
    var _loop_1 = function (entry) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign(__assign(__assign(__assign(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.router.push("/entry/".concat(__VLS_ctx.pathId, "/").concat(entry.id));
            } }, { onKeydown: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.router.push("/entry/".concat(__VLS_ctx.pathId, "/").concat(entry.id));
            } }), { onKeydown: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                __VLS_ctx.router.push("/entry/".concat(__VLS_ctx.pathId, "/").concat(entry.id));
            } }), { key: (entry.id) }), { class: "path-entry-row" }), { role: "button", tabindex: "0" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "path-entry-date" }));
        (new Date(entry.day + 'T00:00:00').toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "path-entry-preview" }));
        (entry.content || '(no text)');
        if (((_b = (_a = entry.image_filenames) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "path-entry-images" }));
            ((_c = entry.image_filenames) === null || _c === void 0 ? void 0 : _c.length);
        }
    };
    for (var _g = 0, _h = __VLS_getVForSourceType((group.entries)); _g < _h.length; _g++) {
        var entry = _h[_g][0];
        _loop_1(entry);
    }
}
var __VLS_36;
var __VLS_45 = {}.IonFooter;
/** @type {[typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, ]} */ ;
// @ts-ignore
var __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({}));
var __VLS_47 = __VLS_46.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_46), false));
__VLS_48.slots.default;
/** @type {[typeof RefreshStatus, ]} */ ;
// @ts-ignore
var __VLS_49 = __VLS_asFunctionalComponent(RefreshStatus_vue_1.default, new RefreshStatus_vue_1.default({
    statusType: (__VLS_ctx.refreshStatusType),
    statusText: (__VLS_ctx.refreshStatusText),
    lastCheckedAt: (__VLS_ctx.refreshLastCheckedAt),
}));
var __VLS_50 = __VLS_49.apply(void 0, __spreadArray([{
        statusType: (__VLS_ctx.refreshStatusType),
        statusText: (__VLS_ctx.refreshStatusText),
        lastCheckedAt: (__VLS_ctx.refreshLastCheckedAt),
    }], __VLS_functionalComponentArgsRest(__VLS_49), false));
var __VLS_48;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['path-view-title']} */ ;
/** @type {__VLS_StyleScopedClasses['path-view-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['ion-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['view-error-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['path-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['path-month-label']} */ ;
/** @type {__VLS_StyleScopedClasses['path-entry-row']} */ ;
/** @type {__VLS_StyleScopedClasses['path-entry-date']} */ ;
/** @type {__VLS_StyleScopedClasses['path-entry-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['path-entry-images']} */ ;
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
            IonText: vue_1.IonText,
            RefreshStatus: RefreshStatus_vue_1.default,
            router: router,
            pathId: pathId,
            pathsError: pathsError,
            path: path,
            pathsErrorMessage: pathsErrorMessage,
            isOwned: isOwned,
            refreshStatusType: refreshStatusType,
            refreshStatusText: refreshStatusText,
            refreshLastCheckedAt: refreshLastCheckedAt,
            groupedEntries: groupedEntries,
        };
    },
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
