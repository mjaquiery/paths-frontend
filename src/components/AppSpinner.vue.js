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
    size: 'medium',
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_withDefaultsArg = (function (t) { return t; })({
    size: 'medium',
});
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign(__assign({ class: "app-spinner" }, { class: ("app-spinner--".concat(__VLS_ctx.size)) }), { role: "status" }));
var __VLS_0 = {}.IonSpinner;
/** @type {[typeof __VLS_components.IonSpinner, typeof __VLS_components.ionSpinner, ]} */ ;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0(__assign({ name: "crescent" }, { class: ("app-spinner__icon--".concat(__VLS_ctx.size)) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ name: "crescent" }, { class: ("app-spinner__icon--".concat(__VLS_ctx.size)) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
if (__VLS_ctx.label) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "app-spinner__label" }));
    (__VLS_ctx.label);
}
/** @type {__VLS_StyleScopedClasses['app-spinner']} */ ;
/** @type {__VLS_StyleScopedClasses['app-spinner__label']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            IonSpinner: vue_1.IonSpinner,
        };
    },
    __typeProps: {},
    props: {},
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
