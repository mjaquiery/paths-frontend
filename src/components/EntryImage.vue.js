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
var vue_1 = require("vue");
var apiClient_1 = require("../generated/apiClient");
var errors_1 = require("../lib/errors");
var props = defineProps();
var linked = (0, vue_1.computed)(function () { return props.linked !== false; });
var _a = (0, apiClient_1.useGetImageDownloadUrl)((0, vue_1.computed)(function () { return props.imageId; })), data = _a.data, isLoading = _a.isLoading, error = _a.error;
var imageUrl = (0, vue_1.computed)(function () { var _a, _b, _c; return (_c = (_b = (_a = data.value) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.image_url) !== null && _c !== void 0 ? _c : null; });
var thumbnailUrl = (0, vue_1.computed)(function () {
    var _a, _b, _c;
    return (_c = (_b = (_a = data.value) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.thumbnail_url) !== null && _c !== void 0 ? _c : null;
});
var errorMessage = (0, vue_1.computed)(function () { return (0, errors_1.extractErrorMessage)(error.value); });
var linkAttrs = (0, vue_1.computed)(function () {
    return linked.value
        ? {
            href: imageUrl.value || undefined,
            target: '_blank',
            rel: 'noopener noreferrer',
        }
        : {};
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
var __VLS_0 = ((__VLS_ctx.linked ? 'a' : 'div'));
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0(__assign(__assign(__assign({}, (__VLS_ctx.linkAttrs)), { class: "entry-image-link" }), { 'aria-label': (__VLS_ctx.alt || 'View image') })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign(__assign(__assign({}, (__VLS_ctx.linkAttrs)), { class: "entry-image-link" }), { 'aria-label': (__VLS_ctx.alt || 'View image') })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_4 = {};
__VLS_3.slots.default;
if (__VLS_ctx.imageUrl) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)(__assign(__assign({ src: (__VLS_ctx.thumbnailUrl || __VLS_ctx.imageUrl), alt: (__VLS_ctx.alt || 'Entry image') }, { class: "entry-image-thumb" }), { loading: "lazy" }));
}
else if (__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "entry-image-placeholder" }, { 'aria-label': "Loading image" }));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "entry-image-placeholder entry-image-placeholder--error" }, { title: (__VLS_ctx.errorMessage || 'Failed to load image'), 'aria-label': (__VLS_ctx.errorMessage || 'Failed to load image') }));
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['entry-image-link']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-image-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-image-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-image-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-image-placeholder--error']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            linked: linked,
            isLoading: isLoading,
            imageUrl: imageUrl,
            thumbnailUrl: thumbnailUrl,
            errorMessage: errorMessage,
            linkAttrs: linkAttrs,
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
