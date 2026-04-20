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
        <ion-title>Admin Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" color="medium" @click="logout">
            Log out
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding admin-content">
      <!-- ── Path Creation Approval ── -->
      <section class="admin-section">
        <h2 class="admin-section__heading">Path Creation Approval</h2>
        <p class="admin-section__desc">
          Grant or revoke a user's permission to create new Paths.
        </p>

        <AppErrorBanner v-if="approvalError" :message="approvalError" />

        <div
          v-if="approvalResult"
          class="admin-success-banner"
          role="status"
          aria-live="polite"
        >
          Updated: user
          <strong>{{ approvalResult.user_id }}</strong> is
          <strong>{{
            approvalResult.allowed ? 'allowed' : 'not allowed'
          }}</strong>
          to create paths.
        </div>

        <ion-list lines="full" class="admin-approval-list">
          <ion-item>
            <ion-label position="stacked">User ID</ion-label>
            <ion-input
              v-model="approvalUserId"
              type="text"
              placeholder="Enter user UUID"
              :disabled="approvalPending"
            />
          </ion-item>
        </ion-list>

        <div class="admin-approval-actions">
          <ion-button
            color="success"
            :disabled="approvalPending || !approvalUserId.trim()"
            @click="setApproval(true)"
          >
            {{
              approvalPending && approvalIntent === true ? 'Saving…' : 'Allow'
            }}
          </ion-button>
          <ion-button
            color="danger"
            fill="outline"
            :disabled="approvalPending || !approvalUserId.trim()"
            @click="setApproval(false)"
          >
            {{
              approvalPending && approvalIntent === false ? 'Saving…' : 'Deny'
            }}
          </ion-button>
        </div>
      </section>
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
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
} from '@ionic/vue';
import { ref } from 'vue';
import AppErrorBanner from '~/src/components/AppErrorBanner.vue';
import { setPathCreationApproval } from '~/src/generated/apiClient';
import { useAdminAuth } from '~/src/composables/useAdminAuth';
import type { PathCreationApprovalResponse } from '~/src/generated/types';

const { isAdminLoggedIn, clearToken, getAdminAuthHeaders } = useAdminAuth();

if (!isAdminLoggedIn.value) {
  await navigateTo('/admin/login', { replace: true });
}

// ── Path creation approval ────────────────────────────────────────────────────
const approvalUserId = ref('');
const approvalPending = ref(false);
const approvalIntent = ref<boolean | null>(null);
const approvalError = ref('');
const approvalResult = ref<PathCreationApprovalResponse | null>(null);

async function setApproval(allowed: boolean) {
  const uid = approvalUserId.value.trim();
  if (!uid || approvalPending.value) return;

  approvalPending.value = true;
  approvalIntent.value = allowed;
  approvalError.value = '';
  approvalResult.value = null;

  try {
    const response = await setPathCreationApproval(
      uid,
      { allowed },
      { headers: getAdminAuthHeaders() },
    );

    if (response.status === 200) {
      approvalResult.value = response.data;
    } else {
      approvalError.value = 'Request failed. Please try again.';
    }
  } catch {
    approvalError.value =
      'Request failed. Please check the user ID and try again.';
  } finally {
    approvalPending.value = false;
    approvalIntent.value = null;
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
async function logout() {
  clearToken();
  await navigateTo('/admin/login', { replace: true });
}
</script>

<style scoped>
.admin-content {
  --background: var(--ion-background-color);
}

.admin-section {
  max-width: 560px;
  margin: 0 auto 32px;
}

.admin-section__heading {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--ion-text-color);
}

.admin-section__desc {
  font-size: 0.9rem;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.admin-success-banner {
  background: var(--ion-color-success-tint);
  color: var(--ion-color-success-shade);
  border-radius: var(--paths-border-radius, 8px);
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.admin-approval-list {
  margin-bottom: 16px;
}

.admin-approval-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />

definePageMeta({
    pageTransition: { name: 'ion-forward', mode: 'out-in' },
});
var vue_1 = require("@ionic/vue");
var vue_2 = require("vue");
var AppErrorBanner_vue_1 = require("~/src/components/AppErrorBanner.vue");
var apiClient_1 = require("~/src/generated/apiClient");
var useAdminAuth_1 = require("~/src/composables/useAdminAuth");
var _a = (0, useAdminAuth_1.useAdminAuth)(), isAdminLoggedIn = _a.isAdminLoggedIn, clearToken = _a.clearToken, getAdminAuthHeaders = _a.getAdminAuthHeaders;
if (!isAdminLoggedIn.value) {
    await navigateTo('/admin/login', { replace: true });
}
// ── Path creation approval ────────────────────────────────────────────────────
var approvalUserId = (0, vue_2.ref)('');
var approvalPending = (0, vue_2.ref)(false);
var approvalIntent = (0, vue_2.ref)(null);
var approvalError = (0, vue_2.ref)('');
var approvalResult = (0, vue_2.ref)(null);
function setApproval(allowed) {
    return __awaiter(this, void 0, void 0, function () {
        var uid, response, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    uid = approvalUserId.value.trim();
                    if (!uid || approvalPending.value)
                        return [2 /*return*/];
                    approvalPending.value = true;
                    approvalIntent.value = allowed;
                    approvalError.value = '';
                    approvalResult.value = null;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, (0, apiClient_1.setPathCreationApproval)(uid, { allowed: allowed }, { headers: getAdminAuthHeaders() })];
                case 2:
                    response = _b.sent();
                    if (response.status === 200) {
                        approvalResult.value = response.data;
                    }
                    else {
                        approvalError.value = 'Request failed. Please try again.';
                    }
                    return [3 /*break*/, 5];
                case 3:
                    _a = _b.sent();
                    approvalError.value =
                        'Request failed. Please check the user ID and try again.';
                    return [3 /*break*/, 5];
                case 4:
                    approvalPending.value = false;
                    approvalIntent.value = null;
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// ── Logout ────────────────────────────────────────────────────────────────────
function logout() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    clearToken();
                    return [4 /*yield*/, navigateTo('/admin/login', { replace: true })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
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
var __VLS_13 = {}.IonTitle;
/** @type {[typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, ]} */ ;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({}));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_14), false));
__VLS_16.slots.default;
var __VLS_16;
var __VLS_17 = {}.IonButtons;
/** @type {[typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, ]} */ ;
// @ts-ignore
var __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    slot: "end",
}));
var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([{
        slot: "end",
    }], __VLS_functionalComponentArgsRest(__VLS_18), false));
__VLS_20.slots.default;
var __VLS_21 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21(__assign({ 'onClick': {} }, { fill: "clear", color: "medium" })));
var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { fill: "clear", color: "medium" })], __VLS_functionalComponentArgsRest(__VLS_22), false));
var __VLS_25;
var __VLS_26;
var __VLS_27;
var __VLS_28 = {
    onClick: (__VLS_ctx.logout)
};
__VLS_24.slots.default;
var __VLS_24;
var __VLS_20;
var __VLS_12;
var __VLS_8;
var __VLS_29 = {}.IonContent;
/** @type {[typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, ]} */ ;
// @ts-ignore
var __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29(__assign({ class: "ion-padding admin-content" })));
var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([__assign({ class: "ion-padding admin-content" })], __VLS_functionalComponentArgsRest(__VLS_30), false));
__VLS_32.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)(__assign({ class: "admin-section" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)(__assign({ class: "admin-section__heading" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "admin-section__desc" }));
if (__VLS_ctx.approvalError) {
    /** @type {[typeof AppErrorBanner, ]} */ ;
    // @ts-ignore
    var __VLS_33 = __VLS_asFunctionalComponent(AppErrorBanner_vue_1.default, new AppErrorBanner_vue_1.default({
        message: (__VLS_ctx.approvalError),
    }));
    var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([{
            message: (__VLS_ctx.approvalError),
        }], __VLS_functionalComponentArgsRest(__VLS_33), false));
}
if (__VLS_ctx.approvalResult) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "admin-success-banner" }, { role: "status", 'aria-live': "polite" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.approvalResult.user_id);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.approvalResult.allowed ? 'allowed' : 'not allowed');
}
var __VLS_36 = {}.IonList;
/** @type {[typeof __VLS_components.IonList, typeof __VLS_components.ionList, typeof __VLS_components.IonList, typeof __VLS_components.ionList, ]} */ ;
// @ts-ignore
var __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36(__assign({ lines: "full" }, { class: "admin-approval-list" })));
var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([__assign({ lines: "full" }, { class: "admin-approval-list" })], __VLS_functionalComponentArgsRest(__VLS_37), false));
__VLS_39.slots.default;
var __VLS_40 = {}.IonItem;
/** @type {[typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, ]} */ ;
// @ts-ignore
var __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({}));
var __VLS_42 = __VLS_41.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_41), false));
__VLS_43.slots.default;
var __VLS_44 = {}.IonLabel;
/** @type {[typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, ]} */ ;
// @ts-ignore
var __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    position: "stacked",
}));
var __VLS_46 = __VLS_45.apply(void 0, __spreadArray([{
        position: "stacked",
    }], __VLS_functionalComponentArgsRest(__VLS_45), false));
__VLS_47.slots.default;
var __VLS_47;
var __VLS_48 = {}.IonInput;
/** @type {[typeof __VLS_components.IonInput, typeof __VLS_components.ionInput, ]} */ ;
// @ts-ignore
var __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    modelValue: (__VLS_ctx.approvalUserId),
    type: "text",
    placeholder: "Enter user UUID",
    disabled: (__VLS_ctx.approvalPending),
}));
var __VLS_50 = __VLS_49.apply(void 0, __spreadArray([{
        modelValue: (__VLS_ctx.approvalUserId),
        type: "text",
        placeholder: "Enter user UUID",
        disabled: (__VLS_ctx.approvalPending),
    }], __VLS_functionalComponentArgsRest(__VLS_49), false));
var __VLS_43;
var __VLS_39;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "admin-approval-actions" }));
var __VLS_52 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52(__assign({ 'onClick': {} }, { color: "success", disabled: (__VLS_ctx.approvalPending || !__VLS_ctx.approvalUserId.trim()) })));
var __VLS_54 = __VLS_53.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { color: "success", disabled: (__VLS_ctx.approvalPending || !__VLS_ctx.approvalUserId.trim()) })], __VLS_functionalComponentArgsRest(__VLS_53), false));
var __VLS_56;
var __VLS_57;
var __VLS_58;
var __VLS_59 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.setApproval(true);
    }
};
__VLS_55.slots.default;
(__VLS_ctx.approvalPending && __VLS_ctx.approvalIntent === true ? 'Saving…' : 'Allow');
var __VLS_55;
var __VLS_60 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60(__assign({ 'onClick': {} }, { color: "danger", fill: "outline", disabled: (__VLS_ctx.approvalPending || !__VLS_ctx.approvalUserId.trim()) })));
var __VLS_62 = __VLS_61.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { color: "danger", fill: "outline", disabled: (__VLS_ctx.approvalPending || !__VLS_ctx.approvalUserId.trim()) })], __VLS_functionalComponentArgsRest(__VLS_61), false));
var __VLS_64;
var __VLS_65;
var __VLS_66;
var __VLS_67 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.setApproval(false);
    }
};
__VLS_63.slots.default;
(__VLS_ctx.approvalPending && __VLS_ctx.approvalIntent === false ? 'Saving…' : 'Deny');
var __VLS_63;
var __VLS_32;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['ion-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-content']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section__heading']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-section__desc']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-success-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-approval-list']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-approval-actions']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            IonPage: vue_1.IonPage,
            IonHeader: vue_1.IonHeader,
            IonToolbar: vue_1.IonToolbar,
            IonTitle: vue_1.IonTitle,
            IonContent: vue_1.IonContent,
            IonButtons: vue_1.IonButtons,
            IonButton: vue_1.IonButton,
            IonList: vue_1.IonList,
            IonItem: vue_1.IonItem,
            IonLabel: vue_1.IonLabel,
            IonInput: vue_1.IonInput,
            AppErrorBanner: AppErrorBanner_vue_1.default,
            approvalUserId: approvalUserId,
            approvalPending: approvalPending,
            approvalIntent: approvalIntent,
            approvalError: approvalError,
            approvalResult: approvalResult,
            setApproval: setApproval,
            logout: logout,
        };
    },
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
