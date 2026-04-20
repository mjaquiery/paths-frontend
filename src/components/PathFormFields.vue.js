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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "path-form-fields" }));
var __VLS_0 = {}.IonItem;
/** @type {[typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, ]} */ ;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0(__assign({ class: "path-form-field" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "path-form-field" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
__VLS_3.slots.default;
var __VLS_4 = {}.IonLabel;
/** @type {[typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, ]} */ ;
// @ts-ignore
var __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    position: "stacked",
}));
var __VLS_6 = __VLS_5.apply(void 0, __spreadArray([{
        position: "stacked",
    }], __VLS_functionalComponentArgsRest(__VLS_5), false));
__VLS_7.slots.default;
var __VLS_7;
var __VLS_8 = {}.IonInput;
/** @type {[typeof __VLS_components.IonInput, typeof __VLS_components.ionInput, ]} */ ;
// @ts-ignore
var __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8(__assign({ 'onIonInput': {} }, { value: (__VLS_ctx.title), placeholder: "Path title", maxlength: (120), autocapitalize: "words" })));
var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign({ 'onIonInput': {} }, { value: (__VLS_ctx.title), placeholder: "Path title", maxlength: (120), autocapitalize: "words" })], __VLS_functionalComponentArgsRest(__VLS_9), false));
var __VLS_12;
var __VLS_13;
var __VLS_14;
var __VLS_15 = {
    onIonInput: function () {
        var _a, _b;
        var _c = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _c[_i] = arguments[_i];
        }
        var $event = _c[0];
        __VLS_ctx.emit('update:title', String((_b = (_a = $event.detail) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : ''));
    }
};
var __VLS_11;
var __VLS_3;
var __VLS_16 = {}.IonItem;
/** @type {[typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, ]} */ ;
// @ts-ignore
var __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16(__assign({ class: "path-form-field" })));
var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([__assign({ class: "path-form-field" })], __VLS_functionalComponentArgsRest(__VLS_17), false));
__VLS_19.slots.default;
var __VLS_20 = {}.IonLabel;
/** @type {[typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, ]} */ ;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    position: "stacked",
}));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([{
        position: "stacked",
    }], __VLS_functionalComponentArgsRest(__VLS_21), false));
__VLS_23.slots.default;
var __VLS_23;
var __VLS_24 = {}.IonInput;
/** @type {[typeof __VLS_components.IonInput, typeof __VLS_components.ionInput, ]} */ ;
// @ts-ignore
var __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24(__assign({ 'onIonInput': {} }, { value: (__VLS_ctx.description), placeholder: "Optional description", maxlength: (1024) })));
var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([__assign({ 'onIonInput': {} }, { value: (__VLS_ctx.description), placeholder: "Optional description", maxlength: (1024) })], __VLS_functionalComponentArgsRest(__VLS_25), false));
var __VLS_28;
var __VLS_29;
var __VLS_30;
var __VLS_31 = {
    onIonInput: function () {
        var _a, _b;
        var _c = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _c[_i] = arguments[_i];
        }
        var $event = _c[0];
        __VLS_ctx.emit('update:description', String((_b = (_a = $event.detail) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : ''));
    }
};
var __VLS_27;
var __VLS_19;
var __VLS_32 = {}.IonItem;
/** @type {[typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, ]} */ ;
// @ts-ignore
var __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32(__assign({ class: "path-form-field" })));
var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([__assign({ class: "path-form-field" })], __VLS_functionalComponentArgsRest(__VLS_33), false));
__VLS_35.slots.default;
var __VLS_36 = {}.IonLabel;
/** @type {[typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, ]} */ ;
// @ts-ignore
var __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    for: (__VLS_ctx.colorInputId),
    position: "stacked",
}));
var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([{
        for: (__VLS_ctx.colorInputId),
        position: "stacked",
    }], __VLS_functionalComponentArgsRest(__VLS_37), false));
__VLS_39.slots.default;
var __VLS_39;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "path-colour-row" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)(__assign(__assign({ onInput: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.emit('update:color', $event.target.value);
    } }, { id: (__VLS_ctx.colorInputId), value: (__VLS_ctx.color), type: "color" }), { class: "path-colour-input" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "path-colour-hex" }));
(__VLS_ctx.color);
var __VLS_35;
if (__VLS_ctx.errorMessage) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "path-form-error" }));
    (__VLS_ctx.errorMessage);
}
/** @type {__VLS_StyleScopedClasses['path-form-fields']} */ ;
/** @type {__VLS_StyleScopedClasses['path-form-field']} */ ;
/** @type {__VLS_StyleScopedClasses['path-form-field']} */ ;
/** @type {__VLS_StyleScopedClasses['path-form-field']} */ ;
/** @type {__VLS_StyleScopedClasses['path-colour-row']} */ ;
/** @type {__VLS_StyleScopedClasses['path-colour-input']} */ ;
/** @type {__VLS_StyleScopedClasses['path-colour-hex']} */ ;
/** @type {__VLS_StyleScopedClasses['path-form-error']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            IonInput: vue_1.IonInput,
            IonItem: vue_1.IonItem,
            IonLabel: vue_1.IonLabel,
            emit: emit,
        };
    },
    __typeEmits: {},
    __typeProps: {},
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
    __typeEmits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
