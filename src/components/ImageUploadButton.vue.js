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
var vue_2 = require("@ionic/vue");
var useImageUpload_1 = require("../composables/useImageUpload");
var markdown_1 = require("../utils/markdown");
var props = defineProps();
var emit = defineEmits();
var fileInput = (0, vue_1.ref)(null);
var pendingFile = (0, vue_1.ref)(null);
var caption = (0, vue_1.ref)('');
var _a = (0, useImageUpload_1.useImageUpload)(), uploading = _a.uploading, uploadError = _a.uploadError, uploadImage = _a.uploadImage;
function openPicker() {
    var _a;
    (_a = fileInput.value) === null || _a === void 0 ? void 0 : _a.click();
}
function onFileSelected(event) {
    var _a;
    var input = event.target;
    var file = (_a = input.files) === null || _a === void 0 ? void 0 : _a[0];
    if (!file)
        return;
    pendingFile.value = file;
    caption.value = '';
    // Reset so the same file can be re-picked
    input.value = '';
}
function cancelPending() {
    pendingFile.value = null;
    caption.value = '';
}
function confirmInsert() {
    return __awaiter(this, void 0, void 0, function () {
        var file, altText, result, markdown;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!pendingFile.value)
                        return [2 /*return*/];
                    file = pendingFile.value;
                    altText = caption.value.trim() || file.name;
                    return [4 /*yield*/, uploadImage(props.pathCode, props.entrySlug, file)];
                case 1:
                    result = _a.sent();
                    if (!result)
                        return [2 /*return*/]; // uploadError is already set
                    markdown = "![".concat(altText, "](").concat((0, markdown_1.encodeMarkdownImageFilename)(result.filename), ")");
                    emit('insert', markdown);
                    pendingFile.value = null;
                    caption.value = '';
                    return [2 /*return*/];
            }
        });
    });
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['caption-actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "image-upload-wrapper" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)(__assign(__assign(__assign({ onChange: (__VLS_ctx.onFileSelected) }, { ref: "fileInput", type: "file", accept: "image/*" }), { class: "image-upload-input" }), { disabled: (__VLS_ctx.uploading || __VLS_ctx.disabled) }));
/** @type {typeof __VLS_ctx.fileInput} */ ;
if (__VLS_ctx.pendingFile) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "image-caption-prompt" }));
    var __VLS_0 = {}.IonItem;
    /** @type {[typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, ]} */ ;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0(__assign({ class: "caption-field" })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "caption-field" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
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
    var __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8(__assign({ 'onKeydown': {} }, { modelValue: (__VLS_ctx.caption), placeholder: (__VLS_ctx.pendingFile.name), autocorrect: "off", spellcheck: (false) })));
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign({ 'onKeydown': {} }, { modelValue: (__VLS_ctx.caption), placeholder: (__VLS_ctx.pendingFile.name), autocorrect: "off", spellcheck: (false) })], __VLS_functionalComponentArgsRest(__VLS_9), false));
    var __VLS_12 = void 0;
    var __VLS_13 = void 0;
    var __VLS_14 = void 0;
    var __VLS_15 = {
        onKeydown: (__VLS_ctx.confirmInsert)
    };
    var __VLS_11;
    var __VLS_3;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "caption-actions" }));
    var __VLS_16 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16(__assign({ 'onClick': {} }, { size: "small", fill: "outline" })));
    var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "small", fill: "outline" })], __VLS_functionalComponentArgsRest(__VLS_17), false));
    var __VLS_20 = void 0;
    var __VLS_21 = void 0;
    var __VLS_22 = void 0;
    var __VLS_23 = {
        onClick: (__VLS_ctx.cancelPending)
    };
    __VLS_19.slots.default;
    var __VLS_19;
    var __VLS_24 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24(__assign({ 'onClick': {} }, { size: "small", disabled: (__VLS_ctx.uploading) })));
    var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "small", disabled: (__VLS_ctx.uploading) })], __VLS_functionalComponentArgsRest(__VLS_25), false));
    var __VLS_28 = void 0;
    var __VLS_29 = void 0;
    var __VLS_30 = void 0;
    var __VLS_31 = {
        onClick: (__VLS_ctx.confirmInsert)
    };
    __VLS_27.slots.default;
    (__VLS_ctx.uploading ? 'Uploading…' : 'Insert image');
    var __VLS_27;
    if (__VLS_ctx.uploadError) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "upload-error" }));
        (__VLS_ctx.uploadError);
    }
}
else {
    var __VLS_32 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32(__assign({ 'onClick': {} }, { size: "small", fill: "outline", disabled: (__VLS_ctx.uploading || __VLS_ctx.disabled) })));
    var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "small", fill: "outline", disabled: (__VLS_ctx.uploading || __VLS_ctx.disabled) })], __VLS_functionalComponentArgsRest(__VLS_33), false));
    var __VLS_36 = void 0;
    var __VLS_37 = void 0;
    var __VLS_38 = void 0;
    var __VLS_39 = {
        onClick: (__VLS_ctx.openPicker)
    };
    __VLS_35.slots.default;
    (__VLS_ctx.uploading ? 'Uploading…' : '+ Image');
    var __VLS_35;
}
/** @type {__VLS_StyleScopedClasses['image-upload-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['image-upload-input']} */ ;
/** @type {__VLS_StyleScopedClasses['image-caption-prompt']} */ ;
/** @type {__VLS_StyleScopedClasses['caption-field']} */ ;
/** @type {__VLS_StyleScopedClasses['caption-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-error']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            IonButton: vue_2.IonButton,
            IonItem: vue_2.IonItem,
            IonLabel: vue_2.IonLabel,
            IonInput: vue_2.IonInput,
            fileInput: fileInput,
            pendingFile: pendingFile,
            caption: caption,
            uploading: uploading,
            uploadError: uploadError,
            openPicker: openPicker,
            onFileSelected: onFileSelected,
            cancelPending: cancelPending,
            confirmInsert: confirmInsert,
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
