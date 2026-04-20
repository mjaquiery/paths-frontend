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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
        <ion-title>Logging in...</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-text v-if="error" color="danger">{{ error }}</ion-text>
      <p v-else>Completing login, please wait...</p>
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
  IonText,
} from '@ionic/vue';
import { onMounted, ref } from 'vue';

import { useAuthCallback } from '~/src/generated/apiClient';
import type { OAuthCallbackResponse } from '~/src/generated/types';

const router = useRouter();
const route = useRoute();
const error = ref('');
const { mutateAsync: doAuthCallback } = useAuthCallback();

onMounted(async () => {
  const rawCode = route.query.code;
  const rawState = route.query.state;

  const code = Array.isArray(rawCode) ? rawCode[0] : rawCode;
  const state = Array.isArray(rawState) ? rawState[0] : rawState;

  if (!code || !state) {
    error.value = 'Missing code or state parameter.';
    return;
  }

  const callbackUri = `${window.location.origin}/auth/callback`;

  try {
    const result = await doAuthCallback({
      data: { code, state, callback_uri: callbackUri },
    });
    if (result.data) {
      const { token, ...safeData } = result.data as OAuthCallbackResponse;
      localStorage.setItem('session_token', token);
      localStorage.setItem('user', JSON.stringify(safeData));
    }
  } catch {
    error.value = 'Login failed. Please try again.';
  } finally {
    router.push('/');
  }
});
</script>
/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />

definePageMeta({
    pageTransition: { name: 'ion-forward', mode: 'out-in' },
});
var vue_1 = require("@ionic/vue");
var vue_2 = require("vue");
var apiClient_1 = require("~/src/generated/apiClient");
var router = useRouter();
var route = useRoute();
var error = (0, vue_2.ref)('');
var doAuthCallback = (0, apiClient_1.useAuthCallback)().mutateAsync;
(0, vue_2.onMounted)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var rawCode, rawState, code, state, callbackUri, result, _a, token, safeData, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                rawCode = route.query.code;
                rawState = route.query.state;
                code = Array.isArray(rawCode) ? rawCode[0] : rawCode;
                state = Array.isArray(rawState) ? rawState[0] : rawState;
                if (!code || !state) {
                    error.value = 'Missing code or state parameter.';
                    return [2 /*return*/];
                }
                callbackUri = "".concat(window.location.origin, "/auth/callback");
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, 4, 5]);
                return [4 /*yield*/, doAuthCallback({
                        data: { code: code, state: state, callback_uri: callbackUri },
                    })];
            case 2:
                result = _c.sent();
                if (result.data) {
                    _a = result.data, token = _a.token, safeData = __rest(_a, ["token"]);
                    localStorage.setItem('session_token', token);
                    localStorage.setItem('user', JSON.stringify(safeData));
                }
                return [3 /*break*/, 5];
            case 3:
                _b = _c.sent();
                error.value = 'Login failed. Please try again.';
                return [3 /*break*/, 5];
            case 4:
                router.push('/');
                return [7 /*endfinally*/];
            case 5: return [2 /*return*/];
        }
    });
}); });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
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
var __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17(__assign({ class: "ion-padding" })));
var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([__assign({ class: "ion-padding" })], __VLS_functionalComponentArgsRest(__VLS_18), false));
__VLS_20.slots.default;
if (__VLS_ctx.error) {
    var __VLS_21 = {}.IonText;
    /** @type {[typeof __VLS_components.IonText, typeof __VLS_components.ionText, typeof __VLS_components.IonText, typeof __VLS_components.ionText, ]} */ ;
    // @ts-ignore
    var __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
        color: "danger",
    }));
    var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([{
            color: "danger",
        }], __VLS_functionalComponentArgsRest(__VLS_22), false));
    __VLS_24.slots.default;
    (__VLS_ctx.error);
    var __VLS_24;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
}
var __VLS_20;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['ion-padding']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            IonPage: vue_1.IonPage,
            IonHeader: vue_1.IonHeader,
            IonToolbar: vue_1.IonToolbar,
            IonTitle: vue_1.IonTitle,
            IonContent: vue_1.IonContent,
            IonText: vue_1.IonText,
            error: error,
        };
    },
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
