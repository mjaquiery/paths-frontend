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
var vue_1 = require("@ionic/vue");
var useInstallBanner_1 = require("~/src/composables/useInstallBanner");
var _a = (0, useInstallBanner_1.useInstallBanner)(), deferredPrompt = _a.deferredPrompt, promptInstall = _a.promptInstall, dismissInstall = _a.dismissInstall;
var installToastButtons = [
    { text: 'Install', handler: promptInstall },
    { text: 'Not now', role: 'cancel' },
];
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
var __VLS_0 = {}.IonApp;
/** @type {[typeof __VLS_components.IonApp, typeof __VLS_components.ionApp, typeof __VLS_components.IonApp, typeof __VLS_components.ionApp, ]} */ ;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_4 = {};
__VLS_3.slots.default;
var __VLS_5 = {}.NuxtPage;
/** @type {[typeof __VLS_components.NuxtPage, ]} */ ;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({}));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_6), false));
var __VLS_9 = {}.IonToast;
/** @type {[typeof __VLS_components.IonToast, typeof __VLS_components.ionToast, ]} */ ;
// @ts-ignore
var __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9(__assign({ 'onDidDismiss': {} }, { isOpen: (!!__VLS_ctx.deferredPrompt), message: "Install Paths for offline access", position: "bottom", buttons: (__VLS_ctx.installToastButtons) })));
var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([__assign({ 'onDidDismiss': {} }, { isOpen: (!!__VLS_ctx.deferredPrompt), message: "Install Paths for offline access", position: "bottom", buttons: (__VLS_ctx.installToastButtons) })], __VLS_functionalComponentArgsRest(__VLS_10), false));
var __VLS_13;
var __VLS_14;
var __VLS_15;
var __VLS_16 = {
    onDidDismiss: (__VLS_ctx.dismissInstall)
};
var __VLS_12;
var __VLS_3;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            IonApp: vue_1.IonApp,
            IonToast: vue_1.IonToast,
            deferredPrompt: deferredPrompt,
            dismissInstall: dismissInstall,
            installToastButtons: installToastButtons,
        };
    },
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
