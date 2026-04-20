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
var vue_1 = require("@ionic/vue");
var vue_2 = require("vue");
var vue_query_1 = require("@tanstack/vue-query");
var PathFormFields_vue_1 = require("./PathFormFields.vue");
var apiClient_1 = require("../generated/apiClient");
var useApi_1 = require("../composables/useApi");
var props = defineProps();
var emit = defineEmits();
var queryClient = (0, vue_query_1.useQueryClient)();
var doUpdatePath = (0, apiClient_1.useUpdatePath)().mutateAsync;
var enqueue = (0, useApi_1.useApi)().enqueue;
var form = (0, vue_2.ref)({ title: '', description: '', color: '' });
var saving = (0, vue_2.ref)(false);
(0, vue_2.watch)(function () { return props.isOpen; }, function (open) {
    var _a;
    if (open) {
        form.value = {
            title: props.path.title,
            description: (_a = props.path.description) !== null && _a !== void 0 ? _a : '',
            color: props.path.color,
        };
    }
});
function save() {
    return __awaiter(this, void 0, void 0, function () {
        var title, description, color, pathCode;
        var _this = this;
        return __generator(this, function (_a) {
            if (!form.value.title.trim())
                return [2 /*return*/];
            saving.value = true;
            title = form.value.title.trim();
            description = form.value.description.trim() || null;
            color = form.value.color;
            pathCode = props.path.path_id;
            enqueue({
                id: "update-path:".concat(pathCode),
                label: "Update path \"".concat(title, "\""),
                execute: function () { return __awaiter(_this, void 0, void 0, function () {
                    var result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, doUpdatePath({
                                    pathCode: pathCode,
                                    data: { title: title, description: description, color: color },
                                })];
                            case 1:
                                result = _a.sent();
                                void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
                                if (result.status === 200) {
                                    emit('updated', result.data);
                                }
                                emit('dismiss');
                                return [2 /*return*/];
                        }
                    });
                }); },
            });
            // Close modal optimistically — queue shows progress / errors.
            saving.value = false;
            emit('dismiss');
            return [2 /*return*/];
        });
    });
}
function onDismiss() {
    emit('dismiss');
}
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
    onDidDismiss: (__VLS_ctx.onDismiss)
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
var __VLS_25 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25(__assign({ 'onClick': {} })));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_26), false));
var __VLS_29;
var __VLS_30;
var __VLS_31;
var __VLS_32 = {
    onClick: (__VLS_ctx.onDismiss)
};
__VLS_28.slots.default;
var __VLS_28;
var __VLS_24;
var __VLS_16;
var __VLS_12;
var __VLS_33 = {}.IonContent;
/** @type {[typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, ]} */ ;
// @ts-ignore
var __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33(__assign({ class: "ion-padding" })));
var __VLS_35 = __VLS_34.apply(void 0, __spreadArray([__assign({ class: "ion-padding" })], __VLS_functionalComponentArgsRest(__VLS_34), false));
__VLS_36.slots.default;
/** @type {[typeof PathFormFields, ]} */ ;
// @ts-ignore
var __VLS_37 = __VLS_asFunctionalComponent(PathFormFields_vue_1.default, new PathFormFields_vue_1.default(__assign(__assign(__assign({ 'onUpdate:title': {} }, { 'onUpdate:description': {} }), { 'onUpdate:color': {} }), { title: (__VLS_ctx.form.title), description: (__VLS_ctx.form.description), color: (__VLS_ctx.form.color), colorInputId: "edit-path-colour-picker" })));
var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onUpdate:title': {} }, { 'onUpdate:description': {} }), { 'onUpdate:color': {} }), { title: (__VLS_ctx.form.title), description: (__VLS_ctx.form.description), color: (__VLS_ctx.form.color), colorInputId: "edit-path-colour-picker" })], __VLS_functionalComponentArgsRest(__VLS_37), false));
var __VLS_40;
var __VLS_41;
var __VLS_42;
var __VLS_43 = {
    'onUpdate:title': function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.form.title = $event;
    }
};
var __VLS_44 = {
    'onUpdate:description': function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.form.description = $event;
    }
};
var __VLS_45 = {
    'onUpdate:color': function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.form.color = $event;
    }
};
var __VLS_39;
var __VLS_36;
var __VLS_46 = {}.IonFooter;
/** @type {[typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, ]} */ ;
// @ts-ignore
var __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({}));
var __VLS_48 = __VLS_47.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_47), false));
__VLS_49.slots.default;
var __VLS_50 = {}.IonToolbar;
/** @type {[typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, ]} */ ;
// @ts-ignore
var __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({}));
var __VLS_52 = __VLS_51.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_51), false));
__VLS_53.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "path-edit-actions" }));
var __VLS_54 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54(__assign({ 'onClick': {} }, { expand: "block", disabled: (!__VLS_ctx.form.title.trim() || __VLS_ctx.saving) })));
var __VLS_56 = __VLS_55.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { expand: "block", disabled: (!__VLS_ctx.form.title.trim() || __VLS_ctx.saving) })], __VLS_functionalComponentArgsRest(__VLS_55), false));
var __VLS_58;
var __VLS_59;
var __VLS_60;
var __VLS_61 = {
    onClick: (__VLS_ctx.save)
};
__VLS_57.slots.default;
(__VLS_ctx.saving ? 'Saving…' : 'Save');
var __VLS_57;
var __VLS_53;
var __VLS_49;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['ion-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['path-edit-actions']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            IonModal: vue_1.IonModal,
            IonHeader: vue_1.IonHeader,
            IonToolbar: vue_1.IonToolbar,
            IonTitle: vue_1.IonTitle,
            IonButtons: vue_1.IonButtons,
            IonButton: vue_1.IonButton,
            IonContent: vue_1.IonContent,
            IonFooter: vue_1.IonFooter,
            PathFormFields: PathFormFields_vue_1.default,
            form: form,
            saving: saving,
            save: save,
            onDismiss: onDismiss,
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
