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
var __VLS_props = withDefaults(defineProps(), {
    title: '',
    showBack: false,
    backHref: '/',
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_withDefaultsArg = (function (t) { return t; })({
    title: '',
    showBack: false,
    backHref: '/',
});
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
var __VLS_0 = {}.IonHeader;
/** @type {[typeof __VLS_components.IonHeader, typeof __VLS_components.ionHeader, typeof __VLS_components.IonHeader, typeof __VLS_components.ionHeader, ]} */ ;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_4 = {};
__VLS_3.slots.default;
var __VLS_5 = {}.IonToolbar;
/** @type {[typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, ]} */ ;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5(__assign({ class: "df-toolbar" })));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([__assign({ class: "df-toolbar" })], __VLS_functionalComponentArgsRest(__VLS_6), false));
__VLS_8.slots.default;
if (__VLS_ctx.showBack) {
    var __VLS_9 = {}.IonButtons;
    /** @type {[typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, ]} */ ;
    // @ts-ignore
    var __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
        slot: "start",
    }));
    var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([{
            slot: "start",
        }], __VLS_functionalComponentArgsRest(__VLS_10), false));
    __VLS_12.slots.default;
    var __VLS_13 = {}.IonBackButton;
    /** @type {[typeof __VLS_components.IonBackButton, typeof __VLS_components.ionBackButton, ]} */ ;
    // @ts-ignore
    var __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
        defaultHref: (__VLS_ctx.backHref),
    }));
    var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([{
            defaultHref: (__VLS_ctx.backHref),
        }], __VLS_functionalComponentArgsRest(__VLS_14), false));
    var __VLS_12;
}
var __VLS_17 = {};
var __VLS_19 = {}.IonTitle;
/** @type {[typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, ]} */ ;
// @ts-ignore
var __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19(__assign({ class: "df-header-title" })));
var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([__assign({ class: "df-header-title" })], __VLS_functionalComponentArgsRest(__VLS_20), false));
__VLS_22.slots.default;
var __VLS_23 = {};
(__VLS_ctx.title);
var __VLS_22;
var __VLS_25 = {};
var __VLS_8;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['df-toolbar']} */ ;
/** @type {__VLS_StyleScopedClasses['df-header-title']} */ ;
// @ts-ignore
var __VLS_18 = __VLS_17, __VLS_24 = __VLS_23, __VLS_26 = __VLS_25;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            IonHeader: vue_1.IonHeader,
            IonToolbar: vue_1.IonToolbar,
            IonTitle: vue_1.IonTitle,
            IonButtons: vue_1.IonButtons,
            IonBackButton: vue_1.IonBackButton,
        };
    },
    __typeProps: {},
    props: {},
});
var __VLS_component = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
    __typeProps: {},
    props: {},
});
exports.default = {};
; /* PartiallyEnd: #4569/main.vue */
