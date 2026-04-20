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
Object.defineProperty(exports, "__esModule", { value: true });
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/path/${pathId}`" />
        </ion-buttons>
        <ion-title>Edit Path</ion-title>
        <ion-buttons slot="end">
          <ion-button :disabled="!form.title.trim() || saving" @click="save">
            {{ saving ? 'Saving…' : 'Save' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="path-edit-content">
      <AppErrorBanner v-if="errorMessage" :message="errorMessage" />

      <div v-if="!path && !pathsError" class="path-edit-loading">
        <AppSpinner label="Loading path…" />
      </div>

      <div v-else-if="pathsError" class="path-edit-error">
        <AppErrorBanner :message="pathsErrorMsg" />
      </div>

      <div v-else-if="path" class="path-edit-form">
        <PathFormFields
          :title="form.title"
          :description="form.description"
          :color="form.color"
          color-input-id="path-edit-colour-picker"
          :error-message="errorMessage"
          @update:title="form.title = $event"
          @update:description="form.description = $event"
          @update:color="form.color = $event"
        />

        <ion-button
          expand="block"
          class="save-btn"
          :disabled="!form.title.trim() || saving"
          @click="save"
        >
          {{ saving ? 'Saving…' : 'Save changes' }}
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
  IonButton,
  IonButtons,
  IonBackButton,
} from '@ionic/vue';
import { ref, computed, watch } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';

import AppErrorBanner from '~/src/components/AppErrorBanner.vue';
import AppSpinner from '~/src/components/AppSpinner.vue';
import PathFormFields from '~/src/components/PathFormFields.vue';
import RefreshStatus from '~/src/components/RefreshStatus.vue';

import { usePaths } from '~/src/composables/usePaths';
import { useRefreshStatus } from '~/src/composables/useRefreshStatus';
import { useApi } from '~/src/composables/useApi';
import { extractErrorMessage } from '~/src/lib/errors';
import { useUpdatePath } from '~/src/generated/apiClient';

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const pathId = computed(() => String(route.params.pathId));

const { data: paths, error: pathsError } = usePaths();
const path = computed(
  () => (paths.value ?? []).find((p) => p.path_id === pathId.value) ?? null,
);
const pathsErrorMsg = computed(
  () => extractErrorMessage(pathsError.value) ?? 'Unable to load this path.',
);

const {
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

const { mutateAsync: doUpdatePath } = useUpdatePath();
const { enqueue } = useApi();

const form = ref({
  title: '',
  description: '',
  color: '#3949ab',
});

const errorMessage = ref('');
const saving = ref(false);

// Populate form when path data arrives
watch(
  path,
  (p) => {
    if (p) {
      form.value.title = p.title ?? '';
      form.value.description = p.description ?? '';
      form.value.color = p.color ?? '#3949ab';
    }
  },
  { immediate: true },
);

function save() {
  if (!form.value.title.trim() || saving.value) return;
  errorMessage.value = '';
  saving.value = true;

  const title = form.value.title.trim();
  const description = form.value.description.trim() || null;
  const color = form.value.color;

  enqueue({
    id: `update-path:${pathId.value}`,
    label: `Update path "${title}"`,
    execute: async () => {
      try {
        await doUpdatePath({
          pathCode: pathId.value,
          data: { title, description, color },
        });
        void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
        void router.replace(`/path/${pathId.value}`);
      } catch (e) {
        errorMessage.value =
          extractErrorMessage(e) ?? 'Failed to save changes.';
      } finally {
        saving.value = false;
      }
    },
  });
}
</script>

<style scoped>
.path-edit-content {
  --background: var(--color-paper);
  --padding-top: 20px;
  --padding-bottom: 32px;
  --padding-start: var(--page-margin);
  --padding-end: var(--page-margin);
}

.path-edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 560px;
  margin: 0 auto;
}

.path-edit-loading,
.path-edit-error {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}

.save-btn {
  margin-top: 4px;
}
</style>
/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />

definePageMeta({
    pageTransition: { name: 'ion-forward', mode: 'out-in' },
});
var vue_1 = require("@ionic/vue");
var vue_2 = require("vue");
var vue_query_1 = require("@tanstack/vue-query");
var AppErrorBanner_vue_1 = require("~/src/components/AppErrorBanner.vue");
var AppSpinner_vue_1 = require("~/src/components/AppSpinner.vue");
var PathFormFields_vue_1 = require("~/src/components/PathFormFields.vue");
var RefreshStatus_vue_1 = require("~/src/components/RefreshStatus.vue");
var usePaths_1 = require("~/src/composables/usePaths");
var useRefreshStatus_1 = require("~/src/composables/useRefreshStatus");
var useApi_1 = require("~/src/composables/useApi");
var errors_1 = require("~/src/lib/errors");
var apiClient_1 = require("~/src/generated/apiClient");
var route = useRoute();
var router = useRouter();
var queryClient = (0, vue_query_1.useQueryClient)();
var pathId = (0, vue_2.computed)(function () { return String(route.params.pathId); });
var _a = (0, usePaths_1.usePaths)(), paths = _a.data, pathsError = _a.error;
var path = (0, vue_2.computed)(function () { var _a, _b; return (_b = ((_a = paths.value) !== null && _a !== void 0 ? _a : []).find(function (p) { return p.path_id === pathId.value; })) !== null && _b !== void 0 ? _b : null; });
var pathsErrorMsg = (0, vue_2.computed)(function () { var _a; return (_a = (0, errors_1.extractErrorMessage)(pathsError.value)) !== null && _a !== void 0 ? _a : 'Unable to load this path.'; });
var _b = (0, useRefreshStatus_1.useRefreshStatus)(), refreshStatusType = _b.statusType, refreshStatusText = _b.statusText, refreshLastCheckedAt = _b.lastCheckedAt;
var doUpdatePath = (0, apiClient_1.useUpdatePath)().mutateAsync;
var enqueue = (0, useApi_1.useApi)().enqueue;
var form = (0, vue_2.ref)({
    title: '',
    description: '',
    color: '#3949ab',
});
var errorMessage = (0, vue_2.ref)('');
var saving = (0, vue_2.ref)(false);
// Populate form when path data arrives
(0, vue_2.watch)(path, function (p) {
    var _a, _b, _c;
    if (p) {
        form.value.title = (_a = p.title) !== null && _a !== void 0 ? _a : '';
        form.value.description = (_b = p.description) !== null && _b !== void 0 ? _b : '';
        form.value.color = (_c = p.color) !== null && _c !== void 0 ? _c : '#3949ab';
    }
}, { immediate: true });
function save() {
    var _this = this;
    if (!form.value.title.trim() || saving.value)
        return;
    errorMessage.value = '';
    saving.value = true;
    var title = form.value.title.trim();
    var description = form.value.description.trim() || null;
    var color = form.value.color;
    enqueue({
        id: "update-path:".concat(pathId.value),
        label: "Update path \"".concat(title, "\""),
        execute: function () { return __awaiter(_this, void 0, void 0, function () {
            var e_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, 3, 4]);
                        return [4 /*yield*/, doUpdatePath({
                                pathCode: pathId.value,
                                data: { title: title, description: description, color: color },
                            })];
                    case 1:
                        _b.sent();
                        void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
                        void router.replace("/path/".concat(pathId.value));
                        return [3 /*break*/, 4];
                    case 2:
                        e_1 = _b.sent();
                        errorMessage.value =
                            (_a = (0, errors_1.extractErrorMessage)(e_1)) !== null && _a !== void 0 ? _a : 'Failed to save changes.';
                        return [3 /*break*/, 4];
                    case 3:
                        saving.value = false;
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); },
    });
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
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
var __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29(__assign({ 'onClick': {} }, { disabled: (!__VLS_ctx.form.title.trim() || __VLS_ctx.saving) })));
var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { disabled: (!__VLS_ctx.form.title.trim() || __VLS_ctx.saving) })], __VLS_functionalComponentArgsRest(__VLS_30), false));
var __VLS_33;
var __VLS_34;
var __VLS_35;
var __VLS_36 = {
    onClick: (__VLS_ctx.save)
};
__VLS_32.slots.default;
(__VLS_ctx.saving ? 'Saving…' : 'Save');
var __VLS_32;
var __VLS_28;
var __VLS_12;
var __VLS_8;
var __VLS_37 = {}.IonContent;
/** @type {[typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, ]} */ ;
// @ts-ignore
var __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37(__assign({ class: "path-edit-content" })));
var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([__assign({ class: "path-edit-content" })], __VLS_functionalComponentArgsRest(__VLS_38), false));
__VLS_40.slots.default;
if (__VLS_ctx.errorMessage) {
    /** @type {[typeof AppErrorBanner, ]} */ ;
    // @ts-ignore
    var __VLS_41 = __VLS_asFunctionalComponent(AppErrorBanner_vue_1.default, new AppErrorBanner_vue_1.default({
        message: (__VLS_ctx.errorMessage),
    }));
    var __VLS_42 = __VLS_41.apply(void 0, __spreadArray([{
            message: (__VLS_ctx.errorMessage),
        }], __VLS_functionalComponentArgsRest(__VLS_41), false));
}
if (!__VLS_ctx.path && !__VLS_ctx.pathsError) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "path-edit-loading" }));
    /** @type {[typeof AppSpinner, ]} */ ;
    // @ts-ignore
    var __VLS_44 = __VLS_asFunctionalComponent(AppSpinner_vue_1.default, new AppSpinner_vue_1.default({
        label: "Loading path…",
    }));
    var __VLS_45 = __VLS_44.apply(void 0, __spreadArray([{
            label: "Loading path…",
        }], __VLS_functionalComponentArgsRest(__VLS_44), false));
}
else if (__VLS_ctx.pathsError) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "path-edit-error" }));
    /** @type {[typeof AppErrorBanner, ]} */ ;
    // @ts-ignore
    var __VLS_47 = __VLS_asFunctionalComponent(AppErrorBanner_vue_1.default, new AppErrorBanner_vue_1.default({
        message: (__VLS_ctx.pathsErrorMsg),
    }));
    var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([{
            message: (__VLS_ctx.pathsErrorMsg),
        }], __VLS_functionalComponentArgsRest(__VLS_47), false));
}
else if (__VLS_ctx.path) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "path-edit-form" }));
    /** @type {[typeof PathFormFields, ]} */ ;
    // @ts-ignore
    var __VLS_50 = __VLS_asFunctionalComponent(PathFormFields_vue_1.default, new PathFormFields_vue_1.default(__assign(__assign(__assign({ 'onUpdate:title': {} }, { 'onUpdate:description': {} }), { 'onUpdate:color': {} }), { title: (__VLS_ctx.form.title), description: (__VLS_ctx.form.description), color: (__VLS_ctx.form.color), colorInputId: "path-edit-colour-picker", errorMessage: (__VLS_ctx.errorMessage) })));
    var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onUpdate:title': {} }, { 'onUpdate:description': {} }), { 'onUpdate:color': {} }), { title: (__VLS_ctx.form.title), description: (__VLS_ctx.form.description), color: (__VLS_ctx.form.color), colorInputId: "path-edit-colour-picker", errorMessage: (__VLS_ctx.errorMessage) })], __VLS_functionalComponentArgsRest(__VLS_50), false));
    var __VLS_53 = void 0;
    var __VLS_54 = void 0;
    var __VLS_55 = void 0;
    var __VLS_56 = {
        'onUpdate:title': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!!(!__VLS_ctx.path && !__VLS_ctx.pathsError))
                return;
            if (!!(__VLS_ctx.pathsError))
                return;
            if (!(__VLS_ctx.path))
                return;
            __VLS_ctx.form.title = $event;
        }
    };
    var __VLS_57 = {
        'onUpdate:description': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!!(!__VLS_ctx.path && !__VLS_ctx.pathsError))
                return;
            if (!!(__VLS_ctx.pathsError))
                return;
            if (!(__VLS_ctx.path))
                return;
            __VLS_ctx.form.description = $event;
        }
    };
    var __VLS_58 = {
        'onUpdate:color': function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!!(!__VLS_ctx.path && !__VLS_ctx.pathsError))
                return;
            if (!!(__VLS_ctx.pathsError))
                return;
            if (!(__VLS_ctx.path))
                return;
            __VLS_ctx.form.color = $event;
        }
    };
    var __VLS_52;
    var __VLS_59 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59(__assign(__assign(__assign({ 'onClick': {} }, { expand: "block" }), { class: "save-btn" }), { disabled: (!__VLS_ctx.form.title.trim() || __VLS_ctx.saving) })));
    var __VLS_61 = __VLS_60.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onClick': {} }, { expand: "block" }), { class: "save-btn" }), { disabled: (!__VLS_ctx.form.title.trim() || __VLS_ctx.saving) })], __VLS_functionalComponentArgsRest(__VLS_60), false));
    var __VLS_63 = void 0;
    var __VLS_64 = void 0;
    var __VLS_65 = void 0;
    var __VLS_66 = {
        onClick: (__VLS_ctx.save)
    };
    __VLS_62.slots.default;
    (__VLS_ctx.saving ? 'Saving…' : 'Save changes');
    var __VLS_62;
}
var __VLS_40;
var __VLS_67 = {}.IonFooter;
/** @type {[typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, ]} */ ;
// @ts-ignore
var __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({}));
var __VLS_69 = __VLS_68.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_68), false));
__VLS_70.slots.default;
/** @type {[typeof RefreshStatus, ]} */ ;
// @ts-ignore
var __VLS_71 = __VLS_asFunctionalComponent(RefreshStatus_vue_1.default, new RefreshStatus_vue_1.default({
    statusType: (__VLS_ctx.refreshStatusType),
    statusText: (__VLS_ctx.refreshStatusText),
    lastCheckedAt: (__VLS_ctx.refreshLastCheckedAt),
}));
var __VLS_72 = __VLS_71.apply(void 0, __spreadArray([{
        statusType: (__VLS_ctx.refreshStatusType),
        statusText: (__VLS_ctx.refreshStatusText),
        lastCheckedAt: (__VLS_ctx.refreshLastCheckedAt),
    }], __VLS_functionalComponentArgsRest(__VLS_71), false));
var __VLS_70;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['path-edit-content']} */ ;
/** @type {__VLS_StyleScopedClasses['path-edit-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['path-edit-error']} */ ;
/** @type {__VLS_StyleScopedClasses['path-edit-form']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
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
            AppErrorBanner: AppErrorBanner_vue_1.default,
            AppSpinner: AppSpinner_vue_1.default,
            PathFormFields: PathFormFields_vue_1.default,
            RefreshStatus: RefreshStatus_vue_1.default,
            pathId: pathId,
            pathsError: pathsError,
            path: path,
            pathsErrorMsg: pathsErrorMsg,
            refreshStatusType: refreshStatusType,
            refreshStatusText: refreshStatusText,
            refreshLastCheckedAt: refreshLastCheckedAt,
            form: form,
            errorMessage: errorMessage,
            saving: saving,
            save: save,
        };
    },
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
