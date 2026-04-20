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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("@ionic/vue");
var EntryImageDraftPreview_vue_1 = require("./EntryImageDraftPreview.vue");
var MarkdownContent_vue_1 = require("./MarkdownContent.vue");
var __VLS_props = defineProps();
var emit = defineEmits();
function onContentInput(event) {
    var _a, _b, _c;
    var target = event.target;
    emit('update:content', String((_c = (_b = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : target === null || target === void 0 ? void 0 : target.value) !== null && _c !== void 0 ? _c : ''));
    emit('textarea-input', event);
}
function onCaptionInput(event) {
    var _a, _b, _c;
    var target = event.target;
    emit('update:captionDraft', String((_c = (_b = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : target === null || target === void 0 ? void 0 : target.value) !== null && _c !== void 0 ? _c : ''));
}
function imageStatusText(image) {
    if (image.status === 'uploading')
        return 'Uploading...';
    if (image.status === 'draft-uploading')
        return 'Processing...';
    if (image.status === 'failed')
        return image.error || 'Failed';
    if (image.status === 'local')
        return 'Pending draft...';
    return 'Attached';
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['content-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-image-chip-name']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-image-chip-status']} */ ;
/** @type {__VLS_StyleScopedClasses['image-caption-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['image-caption-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['image-caption-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['image-caption-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-image-chip']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)(__assign({ class: "editor-section" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "editor-header" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)(__assign({ class: "editor-label" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "editor-header-controls" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)(__assign(__assign(__assign({ onChange: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.$emit('image-selected', $event);
    } }, { ref: (__VLS_ctx.bindImageInputRef), type: "file", accept: "image/*" }), { class: "image-upload-input" }), { multiple: true, disabled: (__VLS_ctx.uploadDisabled) }));
var __VLS_0 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0(__assign({ 'onClick': {} }, { size: "small", fill: "outline", disabled: (__VLS_ctx.uploadDisabled), title: (__VLS_ctx.uploadButtonTitle) })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "small", fill: "outline", disabled: (__VLS_ctx.uploadDisabled), title: (__VLS_ctx.uploadButtonTitle) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_4;
var __VLS_5;
var __VLS_6;
var __VLS_7 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.$emit('open-image-picker');
    }
};
__VLS_3.slots.default;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "content-tabs" }, { role: "tablist", 'aria-label': "Editor mode" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.$emit('update:contentTab', 'write');
    } }, { class: "content-tab" }), { class: ({ active: __VLS_ctx.contentTab === 'write' }) }), { type: "button" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.$emit('update:contentTab', 'preview');
    } }, { class: "content-tab" }), { class: ({ active: __VLS_ctx.contentTab === 'preview' }) }), { type: "button" }));
if (__VLS_ctx.autosaveOffline) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "autosave-offline-note image-offline-note" }));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "editor-surface" }));
if (__VLS_ctx.contentTab === 'write') {
    var __VLS_8 = {}.IonTextarea;
    /** @type {[typeof __VLS_components.IonTextarea, typeof __VLS_components.ionTextarea, ]} */ ;
    // @ts-ignore
    var __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ 'onIonInput': {} }, { 'onIonFocus': {} }), { 'onIonBlur': {} }), { 'onKeyup': {} }), { 'onClick': {} }), { ref: (__VLS_ctx.bindTextareaRef), value: (__VLS_ctx.content) }), { class: "editor-textarea" }), { placeholder: "Write your entry... (markdown supported)", rows: (8), autoGrow: true, autocapitalize: "sentences", autocorrect: "on", spellcheck: (true) })));
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign(__assign(__assign({ 'onIonInput': {} }, { 'onIonFocus': {} }), { 'onIonBlur': {} }), { 'onKeyup': {} }), { 'onClick': {} }), { ref: (__VLS_ctx.bindTextareaRef), value: (__VLS_ctx.content) }), { class: "editor-textarea" }), { placeholder: "Write your entry... (markdown supported)", rows: (8), autoGrow: true, autocapitalize: "sentences", autocorrect: "on", spellcheck: (true) })], __VLS_functionalComponentArgsRest(__VLS_9), false));
    var __VLS_12 = void 0;
    var __VLS_13 = void 0;
    var __VLS_14 = void 0;
    var __VLS_15 = {
        onIonInput: (__VLS_ctx.onContentInput)
    };
    var __VLS_16 = {
        onIonFocus: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.contentTab === 'write'))
                return;
            __VLS_ctx.$emit('remember-selection');
        }
    };
    var __VLS_17 = {
        onIonBlur: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.contentTab === 'write'))
                return;
            __VLS_ctx.$emit('remember-selection');
        }
    };
    var __VLS_18 = {
        onKeyup: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.contentTab === 'write'))
                return;
            __VLS_ctx.$emit('remember-selection');
        }
    };
    var __VLS_19 = {
        onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.contentTab === 'write'))
                return;
            __VLS_ctx.$emit('remember-selection');
        }
    };
    var __VLS_11;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "content-preview" }));
    if (__VLS_ctx.content) {
        /** @type {[typeof MarkdownContent, ]} */ ;
        // @ts-ignore
        var __VLS_20 = __VLS_asFunctionalComponent(MarkdownContent_vue_1.default, new MarkdownContent_vue_1.default({
            content: (__VLS_ctx.content),
            images: (__VLS_ctx.attachedImages),
            localImageUrls: (__VLS_ctx.localImageUrls),
        }));
        var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([{
                content: (__VLS_ctx.content),
                images: (__VLS_ctx.attachedImages),
                localImageUrls: (__VLS_ctx.localImageUrls),
            }], __VLS_functionalComponentArgsRest(__VLS_20), false));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "content-preview-empty" }));
    }
}
if (__VLS_ctx.imageError) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "save-error" }));
    (__VLS_ctx.imageError);
}
else if (__VLS_ctx.autosaveOffline) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "autosave-offline-note" }));
}
var __VLS_23 = {}.IonModal;
/** @type {[typeof __VLS_components.IonModal, typeof __VLS_components.ionModal, typeof __VLS_components.IonModal, typeof __VLS_components.ionModal, ]} */ ;
// @ts-ignore
var __VLS_24 = __VLS_asFunctionalComponent(__VLS_23, new __VLS_23(__assign({ 'onDidDismiss': {} }, { isOpen: (__VLS_ctx.commitFailDialogOpen) })));
var __VLS_25 = __VLS_24.apply(void 0, __spreadArray([__assign({ 'onDidDismiss': {} }, { isOpen: (__VLS_ctx.commitFailDialogOpen) })], __VLS_functionalComponentArgsRest(__VLS_24), false));
var __VLS_27;
var __VLS_28;
var __VLS_29;
var __VLS_30 = {
    onDidDismiss: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.$emit('close-commit-fail');
    }
};
__VLS_26.slots.default;
var __VLS_31 = {}.IonHeader;
/** @type {[typeof __VLS_components.IonHeader, typeof __VLS_components.ionHeader, typeof __VLS_components.IonHeader, typeof __VLS_components.ionHeader, ]} */ ;
// @ts-ignore
var __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({}));
var __VLS_33 = __VLS_32.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_32), false));
__VLS_34.slots.default;
var __VLS_35 = {}.IonToolbar;
/** @type {[typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, ]} */ ;
// @ts-ignore
var __VLS_36 = __VLS_asFunctionalComponent(__VLS_35, new __VLS_35({}));
var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_36), false));
__VLS_38.slots.default;
var __VLS_39 = {}.IonTitle;
/** @type {[typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, ]} */ ;
// @ts-ignore
var __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({}));
var __VLS_41 = __VLS_40.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_40), false));
__VLS_42.slots.default;
var __VLS_42;
var __VLS_38;
var __VLS_34;
var __VLS_43 = {}.IonContent;
/** @type {[typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, ]} */ ;
// @ts-ignore
var __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43(__assign({ class: "ion-padding commit-fail-dialog-content" })));
var __VLS_45 = __VLS_44.apply(void 0, __spreadArray([__assign({ class: "ion-padding commit-fail-dialog-content" })], __VLS_functionalComponentArgsRest(__VLS_44), false));
__VLS_46.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "commit-fail-dialog-message" }));
(__VLS_ctx.commitFailDialogMessage);
if (__VLS_ctx.commitFailWillRetry) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "commit-fail-dialog-note" }));
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "commit-fail-dialog-note" }));
}
var __VLS_46;
var __VLS_47 = {}.IonFooter;
/** @type {[typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, ]} */ ;
// @ts-ignore
var __VLS_48 = __VLS_asFunctionalComponent(__VLS_47, new __VLS_47({}));
var __VLS_49 = __VLS_48.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_48), false));
__VLS_50.slots.default;
var __VLS_51 = {}.IonToolbar;
/** @type {[typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, ]} */ ;
// @ts-ignore
var __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({}));
var __VLS_53 = __VLS_52.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_52), false));
__VLS_54.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "commit-fail-dialog-actions" }));
var __VLS_55 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55(__assign({ 'onClick': {} }, { fill: "outline" })));
var __VLS_57 = __VLS_56.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { fill: "outline" })], __VLS_functionalComponentArgsRest(__VLS_56), false));
var __VLS_59;
var __VLS_60;
var __VLS_61;
var __VLS_62 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.$emit('close-commit-fail');
    }
};
__VLS_58.slots.default;
var __VLS_58;
var __VLS_63 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63(__assign({ 'onClick': {} })));
var __VLS_65 = __VLS_64.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_64), false));
var __VLS_67;
var __VLS_68;
var __VLS_69;
var __VLS_70 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.$emit('acknowledge-commit-failure');
    }
};
__VLS_66.slots.default;
var __VLS_66;
var __VLS_54;
var __VLS_50;
var __VLS_26;
var __VLS_71 = {}.IonModal;
/** @type {[typeof __VLS_components.IonModal, typeof __VLS_components.ionModal, typeof __VLS_components.IonModal, typeof __VLS_components.ionModal, ]} */ ;
// @ts-ignore
var __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71(__assign({ 'onDidDismiss': {} }, { isOpen: (__VLS_ctx.isCaptionModalOpen) })));
var __VLS_73 = __VLS_72.apply(void 0, __spreadArray([__assign({ 'onDidDismiss': {} }, { isOpen: (__VLS_ctx.isCaptionModalOpen) })], __VLS_functionalComponentArgsRest(__VLS_72), false));
var __VLS_75;
var __VLS_76;
var __VLS_77;
var __VLS_78 = {
    onDidDismiss: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.$emit('close-caption');
    }
};
__VLS_74.slots.default;
var __VLS_79 = {}.IonHeader;
/** @type {[typeof __VLS_components.IonHeader, typeof __VLS_components.ionHeader, typeof __VLS_components.IonHeader, typeof __VLS_components.ionHeader, ]} */ ;
// @ts-ignore
var __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({}));
var __VLS_81 = __VLS_80.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_80), false));
__VLS_82.slots.default;
var __VLS_83 = {}.IonToolbar;
/** @type {[typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, ]} */ ;
// @ts-ignore
var __VLS_84 = __VLS_asFunctionalComponent(__VLS_83, new __VLS_83({}));
var __VLS_85 = __VLS_84.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_84), false));
__VLS_86.slots.default;
var __VLS_87 = {}.IonTitle;
/** @type {[typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, ]} */ ;
// @ts-ignore
var __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({}));
var __VLS_89 = __VLS_88.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_88), false));
__VLS_90.slots.default;
(__VLS_ctx.selectedImage ? "Insert ".concat(__VLS_ctx.selectedImage.filename) : 'Insert image');
var __VLS_90;
var __VLS_91 = {}.IonButtons;
/** @type {[typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, ]} */ ;
// @ts-ignore
var __VLS_92 = __VLS_asFunctionalComponent(__VLS_91, new __VLS_91({
    slot: "end",
}));
var __VLS_93 = __VLS_92.apply(void 0, __spreadArray([{
        slot: "end",
    }], __VLS_functionalComponentArgsRest(__VLS_92), false));
__VLS_94.slots.default;
var __VLS_95 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95(__assign({ 'onClick': {} })));
var __VLS_97 = __VLS_96.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_96), false));
var __VLS_99;
var __VLS_100;
var __VLS_101;
var __VLS_102 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.$emit('close-caption');
    }
};
__VLS_98.slots.default;
var __VLS_98;
var __VLS_94;
var __VLS_86;
var __VLS_82;
var __VLS_103 = {}.IonContent;
/** @type {[typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, ]} */ ;
// @ts-ignore
var __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103(__assign({ class: "ion-padding image-caption-modal-content" })));
var __VLS_105 = __VLS_104.apply(void 0, __spreadArray([__assign({ class: "ion-padding image-caption-modal-content" })], __VLS_functionalComponentArgsRest(__VLS_104), false));
__VLS_106.slots.default;
if (__VLS_ctx.selectedImage) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "image-caption-preview" }));
    /** @type {[typeof EntryImageDraftPreview, ]} */ ;
    // @ts-ignore
    var __VLS_107 = __VLS_asFunctionalComponent(EntryImageDraftPreview_vue_1.default, new EntryImageDraftPreview_vue_1.default({
        imageId: ((_b = (_a = __VLS_ctx.selectedImage.image) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null),
        previewUrl: (__VLS_ctx.selectedImage.previewUrl),
        filename: (__VLS_ctx.selectedImage.filename),
        uploading: (__VLS_ctx.selectedImage.status === 'uploading' ||
            __VLS_ctx.selectedImage.status === 'draft-uploading'),
    }));
    var __VLS_108 = __VLS_107.apply(void 0, __spreadArray([{
            imageId: ((_d = (_c = __VLS_ctx.selectedImage.image) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : null),
            previewUrl: (__VLS_ctx.selectedImage.previewUrl),
            filename: (__VLS_ctx.selectedImage.filename),
            uploading: (__VLS_ctx.selectedImage.status === 'uploading' ||
                __VLS_ctx.selectedImage.status === 'draft-uploading'),
        }], __VLS_functionalComponentArgsRest(__VLS_107), false));
}
var __VLS_110 = {}.IonItem;
/** @type {[typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, ]} */ ;
// @ts-ignore
var __VLS_111 = __VLS_asFunctionalComponent(__VLS_110, new __VLS_110(__assign({ lines: "none" }, { class: "image-caption-field" })));
var __VLS_112 = __VLS_111.apply(void 0, __spreadArray([__assign({ lines: "none" }, { class: "image-caption-field" })], __VLS_functionalComponentArgsRest(__VLS_111), false));
__VLS_113.slots.default;
var __VLS_114 = {}.IonLabel;
/** @type {[typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, ]} */ ;
// @ts-ignore
var __VLS_115 = __VLS_asFunctionalComponent(__VLS_114, new __VLS_114({
    position: "stacked",
}));
var __VLS_116 = __VLS_115.apply(void 0, __spreadArray([{
        position: "stacked",
    }], __VLS_functionalComponentArgsRest(__VLS_115), false));
__VLS_117.slots.default;
var __VLS_117;
var __VLS_118 = {}.IonInput;
/** @type {[typeof __VLS_components.IonInput, typeof __VLS_components.ionInput, ]} */ ;
// @ts-ignore
var __VLS_119 = __VLS_asFunctionalComponent(__VLS_118, new __VLS_118(__assign(__assign({ 'onIonInput': {} }, { 'onKeydown': {} }), { value: (__VLS_ctx.captionDraft), placeholder: ((_f = (_e = __VLS_ctx.selectedImage) === null || _e === void 0 ? void 0 : _e.filename) !== null && _f !== void 0 ? _f : '') })));
var __VLS_120 = __VLS_119.apply(void 0, __spreadArray([__assign(__assign({ 'onIonInput': {} }, { 'onKeydown': {} }), { value: (__VLS_ctx.captionDraft), placeholder: ((_h = (_g = __VLS_ctx.selectedImage) === null || _g === void 0 ? void 0 : _g.filename) !== null && _h !== void 0 ? _h : '') })], __VLS_functionalComponentArgsRest(__VLS_119), false));
var __VLS_122;
var __VLS_123;
var __VLS_124;
var __VLS_125 = {
    onIonInput: (__VLS_ctx.onCaptionInput)
};
var __VLS_126 = {
    onKeydown: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.$emit('confirm-image-insert');
    }
};
var __VLS_121;
var __VLS_113;
var __VLS_106;
var __VLS_127 = {}.IonFooter;
/** @type {[typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, ]} */ ;
// @ts-ignore
var __VLS_128 = __VLS_asFunctionalComponent(__VLS_127, new __VLS_127({}));
var __VLS_129 = __VLS_128.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_128), false));
__VLS_130.slots.default;
var __VLS_131 = {}.IonToolbar;
/** @type {[typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, ]} */ ;
// @ts-ignore
var __VLS_132 = __VLS_asFunctionalComponent(__VLS_131, new __VLS_131({}));
var __VLS_133 = __VLS_132.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_132), false));
__VLS_134.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "image-caption-actions" }));
var __VLS_135 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_136 = __VLS_asFunctionalComponent(__VLS_135, new __VLS_135(__assign({ 'onClick': {} }, { fill: "outline" })));
var __VLS_137 = __VLS_136.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { fill: "outline" })], __VLS_functionalComponentArgsRest(__VLS_136), false));
var __VLS_139;
var __VLS_140;
var __VLS_141;
var __VLS_142 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.$emit('close-caption');
    }
};
__VLS_138.slots.default;
var __VLS_138;
var __VLS_143 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_144 = __VLS_asFunctionalComponent(__VLS_143, new __VLS_143(__assign({ 'onClick': {} }, { disabled: (!__VLS_ctx.selectedImage) })));
var __VLS_145 = __VLS_144.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { disabled: (!__VLS_ctx.selectedImage) })], __VLS_functionalComponentArgsRest(__VLS_144), false));
var __VLS_147;
var __VLS_148;
var __VLS_149;
var __VLS_150 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.$emit('confirm-image-insert');
    }
};
__VLS_146.slots.default;
var __VLS_146;
var __VLS_134;
var __VLS_130;
var __VLS_74;
var __VLS_151 = {}.IonFooter;
/** @type {[typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, ]} */ ;
// @ts-ignore
var __VLS_152 = __VLS_asFunctionalComponent(__VLS_151, new __VLS_151({}));
var __VLS_153 = __VLS_152.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_152), false));
__VLS_154.slots.default;
if (__VLS_ctx.imageDrafts.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "editor-image-tray" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "editor-image-tray-hint" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "editor-image-tray-scroll" }));
    var _loop_1 = function (image) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ key: (image.localId) }, { class: "editor-image-chip" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.imageDrafts.length > 0))
                    return;
                __VLS_ctx.$emit('open-caption', image);
            } }, { type: "button" }), { class: "editor-image-chip-main" }), { 'aria-label': ("Add caption for ".concat(image.filename)) }));
        /** @type {[typeof EntryImageDraftPreview, ]} */ ;
        // @ts-ignore
        var __VLS_155 = __VLS_asFunctionalComponent(EntryImageDraftPreview_vue_1.default, new EntryImageDraftPreview_vue_1.default({
            imageId: ((_k = (_j = image.image) === null || _j === void 0 ? void 0 : _j.id) !== null && _k !== void 0 ? _k : null),
            previewUrl: (image.previewUrl),
            filename: (image.filename),
            uploading: (image.status === 'uploading' ||
                image.status === 'draft-uploading'),
        }));
        var __VLS_156 = __VLS_155.apply(void 0, __spreadArray([{
                imageId: ((_m = (_l = image.image) === null || _l === void 0 ? void 0 : _l.id) !== null && _m !== void 0 ? _m : null),
                previewUrl: (image.previewUrl),
                filename: (image.filename),
                uploading: (image.status === 'uploading' ||
                    image.status === 'draft-uploading'),
            }], __VLS_functionalComponentArgsRest(__VLS_155), false));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "editor-image-chip-name" }));
        (image.filename);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "editor-image-chip-status" }));
        (__VLS_ctx.imageStatusText(image));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.imageDrafts.length > 0))
                    return;
                __VLS_ctx.$emit('remove-image', image.localId);
            } }, { type: "button" }), { class: "editor-image-chip-remove" }), { disabled: (__VLS_ctx.committing ||
                image.status === 'uploading' ||
                image.status === 'draft-uploading'), 'aria-label': ("Remove ".concat(image.filename)) }));
    };
    for (var _i = 0, _o = __VLS_getVForSourceType((__VLS_ctx.imageDrafts)); _i < _o.length; _i++) {
        var image = _o[_i][0];
        _loop_1(image);
    }
}
var __VLS_154;
/** @type {__VLS_StyleScopedClasses['editor-section']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-header']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-label']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-header-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['image-upload-input']} */ ;
/** @type {__VLS_StyleScopedClasses['content-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['content-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['content-tab']} */ ;
/** @type {__VLS_StyleScopedClasses['autosave-offline-note']} */ ;
/** @type {__VLS_StyleScopedClasses['image-offline-note']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-surface']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-textarea']} */ ;
/** @type {__VLS_StyleScopedClasses['content-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['content-preview-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['save-error']} */ ;
/** @type {__VLS_StyleScopedClasses['autosave-offline-note']} */ ;
/** @type {__VLS_StyleScopedClasses['ion-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['commit-fail-dialog-content']} */ ;
/** @type {__VLS_StyleScopedClasses['commit-fail-dialog-message']} */ ;
/** @type {__VLS_StyleScopedClasses['commit-fail-dialog-note']} */ ;
/** @type {__VLS_StyleScopedClasses['commit-fail-dialog-note']} */ ;
/** @type {__VLS_StyleScopedClasses['commit-fail-dialog-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['ion-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['image-caption-modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['image-caption-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['image-caption-field']} */ ;
/** @type {__VLS_StyleScopedClasses['image-caption-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-image-tray']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-image-tray-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-image-tray-scroll']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-image-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-image-chip-main']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-image-chip-name']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-image-chip-status']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-image-chip-remove']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            IonButton: vue_1.IonButton,
            IonButtons: vue_1.IonButtons,
            IonContent: vue_1.IonContent,
            IonFooter: vue_1.IonFooter,
            IonHeader: vue_1.IonHeader,
            IonInput: vue_1.IonInput,
            IonItem: vue_1.IonItem,
            IonLabel: vue_1.IonLabel,
            IonModal: vue_1.IonModal,
            IonTextarea: vue_1.IonTextarea,
            IonTitle: vue_1.IonTitle,
            IonToolbar: vue_1.IonToolbar,
            EntryImageDraftPreview: EntryImageDraftPreview_vue_1.default,
            MarkdownContent: MarkdownContent_vue_1.default,
            onContentInput: onContentInput,
            onCaptionInput: onCaptionInput,
            imageStatusText: imageStatusText,
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
