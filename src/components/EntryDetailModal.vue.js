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
var vue_2 = require("vue");
var EntryImage_vue_1 = require("./EntryImage.vue");
var MarkdownContent_vue_1 = require("./MarkdownContent.vue");
var useModalBackNavigation_1 = require("../composables/useModalBackNavigation");
var markdown_1 = require("../utils/markdown");
var props = defineProps();
var emit = defineEmits();
(0, useModalBackNavigation_1.useModalBackNavigation)(function () { return props.isOpen; }, function () { return emit('dismiss'); });
var currentIndex = (0, vue_2.ref)(props.startIndex);
// Reset to the clicked entry whenever the modal opens
(0, vue_2.watch)(function () { return props.isOpen; }, function (open) {
    if (open)
        currentIndex.value = props.startIndex;
});
var currentEntry = (0, vue_2.computed)(function () {
    var _a;
    return (_a = props.entries[currentIndex.value]) !== null && _a !== void 0 ? _a : {
        pathId: '',
        entryId: '',
        pathTitle: '',
        color: '',
        day: '',
        content: undefined,
        hasImages: false,
        images: [],
        edit_id: undefined,
        canEdit: false,
    };
});
/** Filenames referenced in the markdown content via ![alt](filename) syntax. */
var referencedFilenames = (0, vue_2.computed)(function () {
    var content = currentEntry.value.content;
    if (!content)
        return new Set();
    return (0, markdown_1.referencedImageFilenames)(content);
});
/** Images that are not already embedded in the markdown content. */
var unreferencedImages = (0, vue_2.computed)(function () {
    var images = currentEntry.value.images;
    if (!images || images.length === 0)
        return [];
    var refs = referencedFilenames.value;
    return images.filter(function (img) { return !refs.has(img.filename); });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
var __VLS_0 = {}.IonModal;
/** @type {[typeof __VLS_components.IonModal, typeof __VLS_components.ionModal, typeof __VLS_components.IonModal, typeof __VLS_components.ionModal, ]} */ ;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0(__assign({ 'onDidDismiss': {} }, { isOpen: (__VLS_ctx.isOpen) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onDidDismiss': {} }, { isOpen: (__VLS_ctx.isOpen) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_4;
var __VLS_5;
var __VLS_6;
var __VLS_7 = {
    onDidDismiss: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.$emit('dismiss');
    }
};
var __VLS_8 = {};
__VLS_3.slots.default;
var __VLS_9 = {}.IonHeader;
/** @type {[typeof __VLS_components.IonHeader, typeof __VLS_components.ionHeader, typeof __VLS_components.IonHeader, typeof __VLS_components.ionHeader, ]} */ ;
// @ts-ignore
var __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({}));
var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_10), false));
__VLS_12.slots.default;
var __VLS_13 = {}.IonToolbar;
/** @type {[typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, ]} */ ;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({}));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_14), false));
__VLS_16.slots.default;
var __VLS_17 = {}.IonTitle;
/** @type {[typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, ]} */ ;
// @ts-ignore
var __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({}));
var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_18), false));
__VLS_20.slots.default;
(__VLS_ctx.currentEntry.day || 'Entry');
var __VLS_20;
var __VLS_21 = {}.IonButtons;
/** @type {[typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, ]} */ ;
// @ts-ignore
var __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    slot: "end",
}));
var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([{
        slot: "end",
    }], __VLS_functionalComponentArgsRest(__VLS_22), false));
__VLS_24.slots.default;
if (__VLS_ctx.currentEntry.canEdit) {
    var __VLS_25 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25(__assign({ 'onClick': {} }, { color: "primary", 'aria-label': "Edit entry" })));
    var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { color: "primary", 'aria-label': "Edit entry" })], __VLS_functionalComponentArgsRest(__VLS_26), false));
    var __VLS_29 = void 0;
    var __VLS_30 = void 0;
    var __VLS_31 = void 0;
    var __VLS_32 = {
        onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.currentEntry.canEdit))
                return;
            __VLS_ctx.$emit('edit', __VLS_ctx.currentEntry);
        }
    };
    __VLS_28.slots.default;
    var __VLS_28;
}
if (__VLS_ctx.currentEntry.canEdit) {
    var __VLS_33 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33(__assign({ 'onClick': {} }, { color: "danger", 'aria-label': "Delete entry" })));
    var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { color: "danger", 'aria-label': "Delete entry" })], __VLS_functionalComponentArgsRest(__VLS_34), false));
    var __VLS_37 = void 0;
    var __VLS_38 = void 0;
    var __VLS_39 = void 0;
    var __VLS_40 = {
        onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.currentEntry.canEdit))
                return;
            __VLS_ctx.$emit('delete', __VLS_ctx.currentEntry);
        }
    };
    __VLS_36.slots.default;
    var __VLS_36;
}
var __VLS_41 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_42 = __VLS_asFunctionalComponent(__VLS_41, new __VLS_41(__assign({ 'onClick': {} })));
var __VLS_43 = __VLS_42.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_42), false));
var __VLS_45;
var __VLS_46;
var __VLS_47;
var __VLS_48 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.$emit('dismiss');
    }
};
__VLS_44.slots.default;
var __VLS_44;
var __VLS_24;
var __VLS_16;
var __VLS_12;
var __VLS_49 = {}.IonContent;
/** @type {[typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, ]} */ ;
// @ts-ignore
var __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49(__assign({ class: "ion-padding" })));
var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([__assign({ class: "ion-padding" })], __VLS_functionalComponentArgsRest(__VLS_50), false));
__VLS_52.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "entry-detail-meta" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign(__assign({ class: "entry-detail-path-dot" }, { style: ({ backgroundColor: __VLS_ctx.currentEntry.color }) }), { 'aria-hidden': "true" }));
(__VLS_ctx.currentEntry.pathTitle);
(__VLS_ctx.currentEntry.day);
if (__VLS_ctx.currentEntry.content === undefined) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "entry-detail-content" }));
}
else if (!__VLS_ctx.currentEntry.content) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "entry-detail-content" }));
}
else {
    /** @type {[typeof MarkdownContent, ]} */ ;
    // @ts-ignore
    var __VLS_53 = __VLS_asFunctionalComponent(MarkdownContent_vue_1.default, new MarkdownContent_vue_1.default({
        content: (__VLS_ctx.currentEntry.content),
        images: (__VLS_ctx.currentEntry.images),
    }));
    var __VLS_54 = __VLS_53.apply(void 0, __spreadArray([{
            content: (__VLS_ctx.currentEntry.content),
            images: (__VLS_ctx.currentEntry.images),
        }], __VLS_functionalComponentArgsRest(__VLS_53), false));
}
if (__VLS_ctx.unreferencedImages.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "entry-detail-images" }));
    for (var _i = 0, _a = __VLS_getVForSourceType((__VLS_ctx.unreferencedImages)); _i < _a.length; _i++) {
        var img = _a[_i][0];
        /** @type {[typeof EntryImage, ]} */ ;
        // @ts-ignore
        var __VLS_56 = __VLS_asFunctionalComponent(EntryImage_vue_1.default, new EntryImage_vue_1.default({
            key: (img.id),
            imageId: (img.id),
            alt: (img.filename),
        }));
        var __VLS_57 = __VLS_56.apply(void 0, __spreadArray([{
                key: (img.id),
                imageId: (img.id),
                alt: (img.filename),
            }], __VLS_functionalComponentArgsRest(__VLS_56), false));
    }
}
var __VLS_52;
if (__VLS_ctx.entries.length > 1) {
    var __VLS_59 = {}.IonFooter;
    /** @type {[typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, ]} */ ;
    // @ts-ignore
    var __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({}));
    var __VLS_61 = __VLS_60.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_60), false));
    __VLS_62.slots.default;
    var __VLS_63 = {}.IonToolbar;
    /** @type {[typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, ]} */ ;
    // @ts-ignore
    var __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({}));
    var __VLS_65 = __VLS_64.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_64), false));
    __VLS_66.slots.default;
    var __VLS_67 = {}.IonButtons;
    /** @type {[typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, ]} */ ;
    // @ts-ignore
    var __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({
        slot: "start",
    }));
    var __VLS_69 = __VLS_68.apply(void 0, __spreadArray([{
            slot: "start",
        }], __VLS_functionalComponentArgsRest(__VLS_68), false));
    __VLS_70.slots.default;
    var __VLS_71 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71(__assign({ 'onClick': {} }, { disabled: (__VLS_ctx.currentIndex === 0), 'aria-label': "Previous entry" })));
    var __VLS_73 = __VLS_72.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { disabled: (__VLS_ctx.currentIndex === 0), 'aria-label': "Previous entry" })], __VLS_functionalComponentArgsRest(__VLS_72), false));
    var __VLS_75 = void 0;
    var __VLS_76 = void 0;
    var __VLS_77 = void 0;
    var __VLS_78 = {
        onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.entries.length > 1))
                return;
            __VLS_ctx.currentIndex--;
        }
    };
    __VLS_74.slots.default;
    var __VLS_74;
    var __VLS_70;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "entry-detail-counter" }));
    (__VLS_ctx.currentIndex + 1);
    (__VLS_ctx.entries.length);
    var __VLS_79 = {}.IonButtons;
    /** @type {[typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, ]} */ ;
    // @ts-ignore
    var __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({
        slot: "end",
    }));
    var __VLS_81 = __VLS_80.apply(void 0, __spreadArray([{
            slot: "end",
        }], __VLS_functionalComponentArgsRest(__VLS_80), false));
    __VLS_82.slots.default;
    var __VLS_83 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83(__assign({ 'onClick': {} }, { disabled: (__VLS_ctx.currentIndex === __VLS_ctx.entries.length - 1), 'aria-label': "Next entry" })));
    var __VLS_85 = __VLS_84.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { disabled: (__VLS_ctx.currentIndex === __VLS_ctx.entries.length - 1), 'aria-label': "Next entry" })], __VLS_functionalComponentArgsRest(__VLS_84), false));
    var __VLS_87 = void 0;
    var __VLS_88 = void 0;
    var __VLS_89 = void 0;
    var __VLS_90 = {
        onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.entries.length > 1))
                return;
            __VLS_ctx.currentIndex++;
        }
    };
    __VLS_86.slots.default;
    var __VLS_86;
    var __VLS_82;
    var __VLS_66;
    var __VLS_62;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['ion-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-detail-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-detail-path-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-detail-content']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-detail-content']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-detail-images']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-detail-counter']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            IonModal: vue_1.IonModal,
            IonHeader: vue_1.IonHeader,
            IonFooter: vue_1.IonFooter,
            IonToolbar: vue_1.IonToolbar,
            IonTitle: vue_1.IonTitle,
            IonButtons: vue_1.IonButtons,
            IonButton: vue_1.IonButton,
            IonContent: vue_1.IonContent,
            EntryImage: EntryImage_vue_1.default,
            MarkdownContent: MarkdownContent_vue_1.default,
            currentIndex: currentIndex,
            currentEntry: currentEntry,
            unreferencedImages: unreferencedImages,
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
