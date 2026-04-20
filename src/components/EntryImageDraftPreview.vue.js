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
var EntryImage_vue_1 = require("./EntryImage.vue");
var __VLS_props = defineProps();
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "entry-image-draft-preview" }));
if (__VLS_ctx.previewUrl) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)(__assign({ src: (__VLS_ctx.previewUrl), alt: (__VLS_ctx.alt || __VLS_ctx.filename) }, { class: "entry-image-draft-preview__image" }));
}
else if (__VLS_ctx.imageId) {
    /** @type {[typeof EntryImage, ]} */ ;
    // @ts-ignore
    var __VLS_0 = __VLS_asFunctionalComponent(EntryImage_vue_1.default, new EntryImage_vue_1.default({
        imageId: (__VLS_ctx.imageId),
        alt: (__VLS_ctx.alt || __VLS_ctx.filename),
        linked: (false),
    }));
    var __VLS_1 = __VLS_0.apply(void 0, __spreadArray([{
            imageId: (__VLS_ctx.imageId),
            alt: (__VLS_ctx.alt || __VLS_ctx.filename),
            linked: (false),
        }], __VLS_functionalComponentArgsRest(__VLS_0), false));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "entry-image-draft-preview__placeholder" }));
}
if (__VLS_ctx.uploading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "entry-image-draft-preview__overlay" }, { 'aria-hidden': "true" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span)(__assign({ class: "entry-image-draft-preview__spinner" }));
}
/** @type {__VLS_StyleScopedClasses['entry-image-draft-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-image-draft-preview__image']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-image-draft-preview__placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-image-draft-preview__overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-image-draft-preview__spinner']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            EntryImage: EntryImage_vue_1.default,
        };
    },
    __typeProps: {},
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
