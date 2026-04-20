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
        <ion-title>Admin Login</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding admin-login-content">
      <div class="admin-login-form">
        <h2 class="admin-login-heading">Admin Access</h2>

        <AppErrorBanner v-if="errorMessage" :message="errorMessage" />

        <ion-list lines="full">
          <ion-item>
            <ion-label position="stacked">Username</ion-label>
            <ion-input
              v-model="username"
              type="text"
              autocomplete="username"
              placeholder="Enter admin username"
              :disabled="isPending"
              @keydown.enter="submit"
            />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Password</ion-label>
            <ion-input
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="Enter admin password"
              :disabled="isPending"
              @keydown.enter="submit"
            />
          </ion-item>
        </ion-list>

        <ion-button
          expand="block"
          class="admin-login-btn"
          :disabled="isPending || !username || !password"
          @click="submit"
        >
          {{ isPending ? 'Logging in…' : 'Log in' }}
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
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
} from '@ionic/vue';
import { ref } from 'vue';
import AppErrorBanner from '~/src/components/AppErrorBanner.vue';
import { adminLogin } from '~/src/generated/apiClient';
import { useAdminAuth } from '~/src/composables/useAdminAuth';

const { storeToken, isAdminLoggedIn } = useAdminAuth();

if (isAdminLoggedIn.value) {
  await navigateTo('/admin', { replace: true });
}

const username = ref('');
const password = ref('');
const isPending = ref(false);
const errorMessage = ref('');

async function submit() {
  if (!username.value || !password.value || isPending.value) return;

  isPending.value = true;
  errorMessage.value = '';

  try {
    const response = await adminLogin({
      username: username.value,
      password: password.value,
    });

    if (response.status === 200) {
      storeToken(response.data.token);
      await navigateTo('/admin', { replace: true });
    } else {
      errorMessage.value = 'Login failed. Please check your credentials.';
    }
  } catch {
    errorMessage.value = 'Login failed. Please check your credentials.';
  } finally {
    isPending.value = false;
  }
}
</script>

<style scoped>
.admin-login-content {
  --background: var(--ion-background-color);
}

.admin-login-form {
  max-width: 400px;
  margin: 40px auto 0;
}

.admin-login-heading {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--ion-text-color);
}

.admin-login-btn {
  margin-top: 20px;
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
var _a = (0, useAdminAuth_1.useAdminAuth)(), storeToken = _a.storeToken, isAdminLoggedIn = _a.isAdminLoggedIn;
if (isAdminLoggedIn.value) {
    await navigateTo('/admin', { replace: true });
}
var username = (0, vue_2.ref)('');
var password = (0, vue_2.ref)('');
var isPending = (0, vue_2.ref)(false);
var errorMessage = (0, vue_2.ref)('');
function submit() {
    return __awaiter(this, void 0, void 0, function () {
        var response, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!username.value || !password.value || isPending.value)
                        return [2 /*return*/];
                    isPending.value = true;
                    errorMessage.value = '';
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, (0, apiClient_1.adminLogin)({
                            username: username.value,
                            password: password.value,
                        })];
                case 2:
                    response = _b.sent();
                    if (!(response.status === 200)) return [3 /*break*/, 4];
                    storeToken(response.data.token);
                    return [4 /*yield*/, navigateTo('/admin', { replace: true })];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    errorMessage.value = 'Login failed. Please check your credentials.';
                    _b.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    _a = _b.sent();
                    errorMessage.value = 'Login failed. Please check your credentials.';
                    return [3 /*break*/, 8];
                case 7:
                    isPending.value = false;
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
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
var __VLS_12;
var __VLS_8;
var __VLS_17 = {}.IonContent;
/** @type {[typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, ]} */ ;
// @ts-ignore
var __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17(__assign({ class: "ion-padding admin-login-content" })));
var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([__assign({ class: "ion-padding admin-login-content" })], __VLS_functionalComponentArgsRest(__VLS_18), false));
__VLS_20.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "admin-login-form" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)(__assign({ class: "admin-login-heading" }));
if (__VLS_ctx.errorMessage) {
    /** @type {[typeof AppErrorBanner, ]} */ ;
    // @ts-ignore
    var __VLS_21 = __VLS_asFunctionalComponent(AppErrorBanner_vue_1.default, new AppErrorBanner_vue_1.default({
        message: (__VLS_ctx.errorMessage),
    }));
    var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([{
            message: (__VLS_ctx.errorMessage),
        }], __VLS_functionalComponentArgsRest(__VLS_21), false));
}
var __VLS_24 = {}.IonList;
/** @type {[typeof __VLS_components.IonList, typeof __VLS_components.ionList, typeof __VLS_components.IonList, typeof __VLS_components.ionList, ]} */ ;
// @ts-ignore
var __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    lines: "full",
}));
var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([{
        lines: "full",
    }], __VLS_functionalComponentArgsRest(__VLS_25), false));
__VLS_27.slots.default;
var __VLS_28 = {}.IonItem;
/** @type {[typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, ]} */ ;
// @ts-ignore
var __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({}));
var __VLS_30 = __VLS_29.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_29), false));
__VLS_31.slots.default;
var __VLS_32 = {}.IonLabel;
/** @type {[typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, ]} */ ;
// @ts-ignore
var __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    position: "stacked",
}));
var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([{
        position: "stacked",
    }], __VLS_functionalComponentArgsRest(__VLS_33), false));
__VLS_35.slots.default;
var __VLS_35;
var __VLS_36 = {}.IonInput;
/** @type {[typeof __VLS_components.IonInput, typeof __VLS_components.ionInput, ]} */ ;
// @ts-ignore
var __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36(__assign({ 'onKeydown': {} }, { modelValue: (__VLS_ctx.username), type: "text", autocomplete: "username", placeholder: "Enter admin username", disabled: (__VLS_ctx.isPending) })));
var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([__assign({ 'onKeydown': {} }, { modelValue: (__VLS_ctx.username), type: "text", autocomplete: "username", placeholder: "Enter admin username", disabled: (__VLS_ctx.isPending) })], __VLS_functionalComponentArgsRest(__VLS_37), false));
var __VLS_40;
var __VLS_41;
var __VLS_42;
var __VLS_43 = {
    onKeydown: (__VLS_ctx.submit)
};
var __VLS_39;
var __VLS_31;
var __VLS_44 = {}.IonItem;
/** @type {[typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, ]} */ ;
// @ts-ignore
var __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({}));
var __VLS_46 = __VLS_45.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_45), false));
__VLS_47.slots.default;
var __VLS_48 = {}.IonLabel;
/** @type {[typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, ]} */ ;
// @ts-ignore
var __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    position: "stacked",
}));
var __VLS_50 = __VLS_49.apply(void 0, __spreadArray([{
        position: "stacked",
    }], __VLS_functionalComponentArgsRest(__VLS_49), false));
__VLS_51.slots.default;
var __VLS_51;
var __VLS_52 = {}.IonInput;
/** @type {[typeof __VLS_components.IonInput, typeof __VLS_components.ionInput, ]} */ ;
// @ts-ignore
var __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52(__assign({ 'onKeydown': {} }, { modelValue: (__VLS_ctx.password), type: "password", autocomplete: "current-password", placeholder: "Enter admin password", disabled: (__VLS_ctx.isPending) })));
var __VLS_54 = __VLS_53.apply(void 0, __spreadArray([__assign({ 'onKeydown': {} }, { modelValue: (__VLS_ctx.password), type: "password", autocomplete: "current-password", placeholder: "Enter admin password", disabled: (__VLS_ctx.isPending) })], __VLS_functionalComponentArgsRest(__VLS_53), false));
var __VLS_56;
var __VLS_57;
var __VLS_58;
var __VLS_59 = {
    onKeydown: (__VLS_ctx.submit)
};
var __VLS_55;
var __VLS_47;
var __VLS_27;
var __VLS_60 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60(__assign(__assign(__assign({ 'onClick': {} }, { expand: "block" }), { class: "admin-login-btn" }), { disabled: (__VLS_ctx.isPending || !__VLS_ctx.username || !__VLS_ctx.password) })));
var __VLS_62 = __VLS_61.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onClick': {} }, { expand: "block" }), { class: "admin-login-btn" }), { disabled: (__VLS_ctx.isPending || !__VLS_ctx.username || !__VLS_ctx.password) })], __VLS_functionalComponentArgsRest(__VLS_61), false));
var __VLS_64;
var __VLS_65;
var __VLS_66;
var __VLS_67 = {
    onClick: (__VLS_ctx.submit)
};
__VLS_63.slots.default;
(__VLS_ctx.isPending ? 'Logging in…' : 'Log in');
var __VLS_63;
var __VLS_20;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['ion-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-login-content']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-login-form']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-login-heading']} */ ;
/** @type {__VLS_StyleScopedClasses['admin-login-btn']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            IonPage: vue_1.IonPage,
            IonHeader: vue_1.IonHeader,
            IonToolbar: vue_1.IonToolbar,
            IonTitle: vue_1.IonTitle,
            IonContent: vue_1.IonContent,
            IonList: vue_1.IonList,
            IonItem: vue_1.IonItem,
            IonLabel: vue_1.IonLabel,
            IonInput: vue_1.IonInput,
            IonButton: vue_1.IonButton,
            AppErrorBanner: AppErrorBanner_vue_1.default,
            username: username,
            password: password,
            isPending: isPending,
            errorMessage: errorMessage,
            submit: submit,
        };
    },
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
