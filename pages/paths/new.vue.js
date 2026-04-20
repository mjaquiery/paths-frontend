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
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>New Path</ion-title>
        <ion-buttons slot="end">
          <ion-button
            :disabled="!form.title.trim() || creating"
            @click="create"
          >
            {{ creating ? 'Creating…' : 'Create' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="path-create-content">
      <div class="path-create-form">
        <PathFormFields
          :title="form.title"
          :description="form.description"
          :color="form.color"
          color-input-id="path-colour-picker"
          @update:title="form.title = $event"
          @update:description="form.description = $event"
          @update:color="form.color = $event"
        />

        <ion-button
          expand="block"
          class="create-btn"
          :disabled="!form.title.trim() || creating"
          @click="create"
        >
          {{ creating ? 'Creating…' : 'Create Path' }}
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
import { ref } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import PathFormFields from '~/src/components/PathFormFields.vue';
import RefreshStatus from '~/src/components/RefreshStatus.vue';
import { useCreatePath } from '~/src/generated/apiClient';
import { useRefreshStatus } from '~/src/composables/useRefreshStatus';
import { useApi } from '~/src/composables/useApi';

const router = useRouter();
const route = useRoute();
const queryClient = useQueryClient();

const { mutateAsync: doCreatePath } = useCreatePath();
const { enqueue } = useApi();

const {
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

const form = ref({
  title: '',
  description: '',
  color: '#3949ab',
});

const creating = ref(false);

async function create() {
  if (!form.value.title.trim() || creating.value) return;
  creating.value = true;

  const title = form.value.title.trim();
  const description = form.value.description.trim() || undefined;
  const color = form.value.color;

  enqueue({
    id: `create-path:${title}`,
    label: `Create path "${title}"`,
    execute: async () => {
      await doCreatePath({ data: { title, description, color } });
      void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });

      const redirect = route.query.redirect;
      if (redirect && typeof redirect === 'string') {
        void router.replace(redirect);
      } else {
        void router.replace('/');
      }
    },
  });

  // Unblock the button optimistically — the queue shows progress.
  creating.value = false;
}
</script>

<style scoped>
.path-create-content {
  --padding-top: 20px;
  --padding-bottom: 32px;
  --padding-start: 16px;
  --padding-end: 16px;
}

.path-create-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 560px;
  margin: 0 auto;
}

.create-btn {
  margin-top: 4px;
}
</style>
/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />

definePageMeta({
    pageTransition: { name: 'ion-forward', mode: 'out-in' },
});
var vue_1 = require("@ionic/vue");
var vue_2 = require("vue");
var vue_query_1 = require("@tanstack/vue-query");
var PathFormFields_vue_1 = require("~/src/components/PathFormFields.vue");
var RefreshStatus_vue_1 = require("~/src/components/RefreshStatus.vue");
var apiClient_1 = require("~/src/generated/apiClient");
var useRefreshStatus_1 = require("~/src/composables/useRefreshStatus");
var useApi_1 = require("~/src/composables/useApi");
var router = useRouter();
var route = useRoute();
var queryClient = (0, vue_query_1.useQueryClient)();
var doCreatePath = (0, apiClient_1.useCreatePath)().mutateAsync;
var enqueue = (0, useApi_1.useApi)().enqueue;
var _a = (0, useRefreshStatus_1.useRefreshStatus)(), refreshStatusType = _a.statusType, refreshStatusText = _a.statusText, refreshLastCheckedAt = _a.lastCheckedAt;
var form = (0, vue_2.ref)({
    title: '',
    description: '',
    color: '#3949ab',
});
var creating = (0, vue_2.ref)(false);
function create() {
    return __awaiter(this, void 0, void 0, function () {
        var title, description, color;
        var _this = this;
        return __generator(this, function (_a) {
            if (!form.value.title.trim() || creating.value)
                return [2 /*return*/];
            creating.value = true;
            title = form.value.title.trim();
            description = form.value.description.trim() || undefined;
            color = form.value.color;
            enqueue({
                id: "create-path:".concat(title),
                label: "Create path \"".concat(title, "\""),
                execute: function () { return __awaiter(_this, void 0, void 0, function () {
                    var redirect;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, doCreatePath({ data: { title: title, description: description, color: color } })];
                            case 1:
                                _a.sent();
                                void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
                                redirect = route.query.redirect;
                                if (redirect && typeof redirect === 'string') {
                                    void router.replace(redirect);
                                }
                                else {
                                    void router.replace('/');
                                }
                                return [2 /*return*/];
                        }
                    });
                }); },
            });
            // Unblock the button optimistically — the queue shows progress.
            creating.value = false;
            return [2 /*return*/];
        });
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
var __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29(__assign({ 'onClick': {} }, { disabled: (!__VLS_ctx.form.title.trim() || __VLS_ctx.creating) })));
var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { disabled: (!__VLS_ctx.form.title.trim() || __VLS_ctx.creating) })], __VLS_functionalComponentArgsRest(__VLS_30), false));
var __VLS_33;
var __VLS_34;
var __VLS_35;
var __VLS_36 = {
    onClick: (__VLS_ctx.create)
};
__VLS_32.slots.default;
(__VLS_ctx.creating ? 'Creating…' : 'Create');
var __VLS_32;
var __VLS_28;
var __VLS_12;
var __VLS_8;
var __VLS_37 = {}.IonContent;
/** @type {[typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, ]} */ ;
// @ts-ignore
var __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37(__assign({ class: "path-create-content" })));
var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([__assign({ class: "path-create-content" })], __VLS_functionalComponentArgsRest(__VLS_38), false));
__VLS_40.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "path-create-form" }));
/** @type {[typeof PathFormFields, ]} */ ;
// @ts-ignore
var __VLS_41 = __VLS_asFunctionalComponent(PathFormFields_vue_1.default, new PathFormFields_vue_1.default(__assign(__assign(__assign({ 'onUpdate:title': {} }, { 'onUpdate:description': {} }), { 'onUpdate:color': {} }), { title: (__VLS_ctx.form.title), description: (__VLS_ctx.form.description), color: (__VLS_ctx.form.color), colorInputId: "path-colour-picker" })));
var __VLS_42 = __VLS_41.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onUpdate:title': {} }, { 'onUpdate:description': {} }), { 'onUpdate:color': {} }), { title: (__VLS_ctx.form.title), description: (__VLS_ctx.form.description), color: (__VLS_ctx.form.color), colorInputId: "path-colour-picker" })], __VLS_functionalComponentArgsRest(__VLS_41), false));
var __VLS_44;
var __VLS_45;
var __VLS_46;
var __VLS_47 = {
    'onUpdate:title': function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.form.title = $event;
    }
};
var __VLS_48 = {
    'onUpdate:description': function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.form.description = $event;
    }
};
var __VLS_49 = {
    'onUpdate:color': function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.form.color = $event;
    }
};
var __VLS_43;
var __VLS_50 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50(__assign(__assign(__assign({ 'onClick': {} }, { expand: "block" }), { class: "create-btn" }), { disabled: (!__VLS_ctx.form.title.trim() || __VLS_ctx.creating) })));
var __VLS_52 = __VLS_51.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onClick': {} }, { expand: "block" }), { class: "create-btn" }), { disabled: (!__VLS_ctx.form.title.trim() || __VLS_ctx.creating) })], __VLS_functionalComponentArgsRest(__VLS_51), false));
var __VLS_54;
var __VLS_55;
var __VLS_56;
var __VLS_57 = {
    onClick: (__VLS_ctx.create)
};
__VLS_53.slots.default;
(__VLS_ctx.creating ? 'Creating…' : 'Create Path');
var __VLS_53;
var __VLS_40;
var __VLS_58 = {}.IonFooter;
/** @type {[typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, ]} */ ;
// @ts-ignore
var __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({}));
var __VLS_60 = __VLS_59.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_59), false));
__VLS_61.slots.default;
/** @type {[typeof RefreshStatus, ]} */ ;
// @ts-ignore
var __VLS_62 = __VLS_asFunctionalComponent(RefreshStatus_vue_1.default, new RefreshStatus_vue_1.default({
    statusType: (__VLS_ctx.refreshStatusType),
    statusText: (__VLS_ctx.refreshStatusText),
    lastCheckedAt: (__VLS_ctx.refreshLastCheckedAt),
}));
var __VLS_63 = __VLS_62.apply(void 0, __spreadArray([{
        statusType: (__VLS_ctx.refreshStatusType),
        statusText: (__VLS_ctx.refreshStatusText),
        lastCheckedAt: (__VLS_ctx.refreshLastCheckedAt),
    }], __VLS_functionalComponentArgsRest(__VLS_62), false));
var __VLS_61;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['path-create-content']} */ ;
/** @type {__VLS_StyleScopedClasses['path-create-form']} */ ;
/** @type {__VLS_StyleScopedClasses['create-btn']} */ ;
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
            PathFormFields: PathFormFields_vue_1.default,
            RefreshStatus: RefreshStatus_vue_1.default,
            refreshStatusType: refreshStatusType,
            refreshStatusText: refreshStatusText,
            refreshLastCheckedAt: refreshLastCheckedAt,
            form: form,
            creating: creating,
            create: create,
        };
    },
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
