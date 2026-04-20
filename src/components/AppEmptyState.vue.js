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
var __VLS_props = defineProps();
var emit = defineEmits();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "app-empty-state" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "app-empty-state__message" }));
var __VLS_0 = {};
if (__VLS_ctx.ctaLabel && __VLS_ctx.ctaHref) {
    var __VLS_2 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_3 = __VLS_asFunctionalComponent(__VLS_2, new __VLS_2(__assign({ routerLink: (__VLS_ctx.ctaHref), routerDirection: "forward" }, { class: "app-empty-state__cta" })));
    var __VLS_4 = __VLS_3.apply(void 0, __spreadArray([__assign({ routerLink: (__VLS_ctx.ctaHref), routerDirection: "forward" }, { class: "app-empty-state__cta" })], __VLS_functionalComponentArgsRest(__VLS_3), false));
    __VLS_5.slots.default;
    (__VLS_ctx.ctaLabel);
    var __VLS_5;
}
else if (__VLS_ctx.ctaLabel) {
    var __VLS_6 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6(__assign({ 'onClick': {} }, { class: "app-empty-state__cta" })));
    var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { class: "app-empty-state__cta" })], __VLS_functionalComponentArgsRest(__VLS_7), false));
    var __VLS_10 = void 0;
    var __VLS_11 = void 0;
    var __VLS_12 = void 0;
    var __VLS_13 = {
        onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!!(__VLS_ctx.ctaLabel && __VLS_ctx.ctaHref))
                return;
            if (!(__VLS_ctx.ctaLabel))
                return;
            __VLS_ctx.emit('cta');
        }
    };
    __VLS_9.slots.default;
    (__VLS_ctx.ctaLabel);
    var __VLS_9;
}
/** @type {__VLS_StyleScopedClasses['app-empty-state']} */ ;
/** @type {__VLS_StyleScopedClasses['app-empty-state__message']} */ ;
/** @type {__VLS_StyleScopedClasses['app-empty-state__cta']} */ ;
/** @type {__VLS_StyleScopedClasses['app-empty-state__cta']} */ ;
// @ts-ignore
var __VLS_1 = __VLS_0;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            IonButton: vue_1.IonButton,
            emit: emit,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
var __VLS_component = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
exports.default = {};
; /* PartiallyEnd: #4569/main.vue */
