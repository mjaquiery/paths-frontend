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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("@ionic/vue");
var vue_2 = require("vue");
var apiClient_1 = require("../generated/apiClient");
var export_1 = require("../utils/export");
var useApi_1 = require("../composables/useApi");
var __VLS_props = defineProps();
var selectedForExport = (0, vue_2.ref)(new Set());
var exportJob = (0, vue_2.ref)(null);
var jsonDownloadUrl = (0, vue_2.ref)('');
var imagesDownloadUrl = (0, vue_2.ref)('');
var downloadError = (0, vue_2.ref)('');
var showLocalExportAlert = (0, vue_2.ref)(false);
var localExportAlertMessage = (0, vue_2.ref)('');
var createExportMutation = (0, apiClient_1.useCreateExport)().mutateAsync;
var enqueue = (0, useApi_1.useApi)().enqueue;
function todayYYYYMMDD() {
    return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}
function handleDownload(url, extension) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    downloadError.value = '';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, export_1.downloadFileFromUrl)(url, "paths_backup_".concat(todayYYYYMMDD(), ".").concat(extension))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    downloadError.value = e_1 instanceof Error ? e_1.message : String(e_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function setExportPath(pathId, event) {
    if (event.detail.checked)
        selectedForExport.value.add(pathId);
    else
        selectedForExport.value.delete(pathId);
}
function triggerExport() {
    var _this = this;
    jsonDownloadUrl.value = '';
    imagesDownloadUrl.value = '';
    enqueue({
        id: "trigger-export:".concat(__spreadArray([], selectedForExport.value, true).sort().join(',')),
        label: 'Trigger export',
        execute: function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, e_2, msg;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        _a = exportJob;
                        return [4 /*yield*/, createExportMutation({
                                data: { path_ids: __spreadArray([], selectedForExport.value, true) },
                            })];
                    case 1:
                        _a.value = (_b.sent()).data;
                        return [4 /*yield*/, pollExport()];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _b.sent();
                        msg = e_2 instanceof Error ? e_2.message : String(e_2);
                        localExportAlertMessage.value = "Remote export failed: ".concat(msg, ". Would you like to export your locally cached data instead?");
                        showLocalExportAlert.value = true;
                        // Re-throw so enqueue classifies the failure correctly
                        throw e_2;
                    case 4: return [2 /*return*/];
                }
            });
        }); },
    });
}
function pollExport() {
    return __awaiter(this, void 0, void 0, function () {
        var latest, _a, jsonUrl, imagesUrl;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!exportJob.value)
                        return [2 /*return*/];
                    return [4 /*yield*/, (0, apiClient_1.getExport)(exportJob.value.id)];
                case 1:
                    latest = (_b.sent())
                        .data;
                    exportJob.value = latest;
                    if (!(0, export_1.isExportReady)(latest)) return [3 /*break*/, 3];
                    return [4 /*yield*/, Promise.all([
                            (0, apiClient_1.downloadExportJson)(latest.id),
                            (0, apiClient_1.downloadExportImages)(latest.id),
                        ])];
                case 2:
                    _a = _b.sent(), jsonUrl = _a[0], imagesUrl = _a[1];
                    jsonDownloadUrl.value = jsonUrl.data.url;
                    imagesDownloadUrl.value = imagesUrl.data.url;
                    return [3 /*break*/, 4];
                case 3:
                    if (!(0, export_1.isExportTerminal)(latest)) {
                        window.setTimeout(pollExport, 2000);
                    }
                    _b.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function handleLocalExport() {
    return __awaiter(this, void 0, void 0, function () {
        var e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    downloadError.value = '';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, export_1.exportLocalData)(__spreadArray([], selectedForExport.value, true))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_3 = _a.sent();
                    downloadError.value = e_3 instanceof Error ? e_3.message : String(e_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
var localExportAlertButtons = [
    { text: 'Export local data', handler: handleLocalExport },
    { text: 'Cancel', role: 'cancel' },
];
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['export-actions-row']} */ ;
/** @type {__VLS_StyleScopedClasses['export-actions-row']} */ ;
// CSS variable injection 
// CSS variable injection end 
var __VLS_0 = {}.IonCard;
/** @type {[typeof __VLS_components.IonCard, typeof __VLS_components.ionCard, typeof __VLS_components.IonCard, typeof __VLS_components.ionCard, ]} */ ;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0(__assign({ class: "export-card" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "export-card" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
__VLS_3.slots.default;
var __VLS_4 = {}.IonCardHeader;
/** @type {[typeof __VLS_components.IonCardHeader, typeof __VLS_components.ionCardHeader, typeof __VLS_components.IonCardHeader, typeof __VLS_components.ionCardHeader, ]} */ ;
// @ts-ignore
var __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({}));
var __VLS_6 = __VLS_5.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_5), false));
__VLS_7.slots.default;
var __VLS_8 = {}.IonCardTitle;
/** @type {[typeof __VLS_components.IonCardTitle, typeof __VLS_components.ionCardTitle, typeof __VLS_components.IonCardTitle, typeof __VLS_components.ionCardTitle, ]} */ ;
// @ts-ignore
var __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_9), false));
__VLS_11.slots.default;
var __VLS_11;
var __VLS_7;
var __VLS_12 = {}.IonCardContent;
/** @type {[typeof __VLS_components.IonCardContent, typeof __VLS_components.ionCardContent, typeof __VLS_components.IonCardContent, typeof __VLS_components.ionCardContent, ]} */ ;
// @ts-ignore
var __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12(__assign({ class: "export-card__content" })));
var __VLS_14 = __VLS_13.apply(void 0, __spreadArray([__assign({ class: "export-card__content" })], __VLS_functionalComponentArgsRest(__VLS_13), false));
__VLS_15.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "export-card__body" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "export-paths" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "export-hint" }));
(__VLS_ctx.selectedForExport.size);
var __VLS_16 = {}.IonList;
/** @type {[typeof __VLS_components.IonList, typeof __VLS_components.ionList, typeof __VLS_components.IonList, typeof __VLS_components.ionList, ]} */ ;
// @ts-ignore
var __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16(__assign({ class: "export-list" })));
var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([__assign({ class: "export-list" })], __VLS_functionalComponentArgsRest(__VLS_17), false));
__VLS_19.slots.default;
var _loop_1 = function (path) {
    var __VLS_20 = {}.IonItem;
    /** @type {[typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, ]} */ ;
    // @ts-ignore
    var __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        key: ("export-".concat(path.path_id)),
    }));
    var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([{
            key: ("export-".concat(path.path_id)),
        }], __VLS_functionalComponentArgsRest(__VLS_21), false));
    __VLS_23.slots.default;
    var __VLS_24 = {}.IonCheckbox;
    /** @type {[typeof __VLS_components.IonCheckbox, typeof __VLS_components.ionCheckbox, typeof __VLS_components.IonCheckbox, typeof __VLS_components.ionCheckbox, ]} */ ;
    // @ts-ignore
    var __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24(__assign({ 'onIonChange': {} }, { slot: "start", checked: (__VLS_ctx.selectedForExport.has(path.path_id)) })));
    var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([__assign({ 'onIonChange': {} }, { slot: "start", checked: (__VLS_ctx.selectedForExport.has(path.path_id)) })], __VLS_functionalComponentArgsRest(__VLS_25), false));
    var __VLS_28 = void 0;
    var __VLS_29 = void 0;
    var __VLS_30 = void 0;
    var __VLS_31 = {
        onIonChange: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.setExportPath(path.path_id, $event);
        }
    };
    var __VLS_32 = {}.IonLabel;
    /** @type {[typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, ]} */ ;
    // @ts-ignore
    var __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({}));
    var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_33), false));
    __VLS_35.slots.default;
    (path.title);
};
var __VLS_27, __VLS_35, __VLS_23;
for (var _i = 0, _b = __VLS_getVForSourceType((__VLS_ctx.paths)); _i < _b.length; _i++) {
    var path = _b[_i][0];
    _loop_1(path);
}
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "export-actions" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "export-actions-row" }));
var __VLS_36 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36(__assign({ 'onClick': {} }, { expand: "block", disabled: (__VLS_ctx.selectedForExport.size === 0) })));
var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { expand: "block", disabled: (__VLS_ctx.selectedForExport.size === 0) })], __VLS_functionalComponentArgsRest(__VLS_37), false));
var __VLS_40;
var __VLS_41;
var __VLS_42;
var __VLS_43 = {
    onClick: (__VLS_ctx.triggerExport)
};
__VLS_39.slots.default;
var __VLS_39;
var __VLS_44 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44(__assign({ 'onClick': {} }, { expand: "block", fill: "outline", disabled: (!__VLS_ctx.exportJob) })));
var __VLS_46 = __VLS_45.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { expand: "block", fill: "outline", disabled: (!__VLS_ctx.exportJob) })], __VLS_functionalComponentArgsRest(__VLS_45), false));
var __VLS_48;
var __VLS_49;
var __VLS_50;
var __VLS_51 = {
    onClick: (__VLS_ctx.pollExport)
};
__VLS_47.slots.default;
var __VLS_47;
if (__VLS_ctx.exportJob) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "export-status" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.exportJob.state);
}
if (((_a = __VLS_ctx.exportJob) === null || _a === void 0 ? void 0 : _a.state) === 'expired') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "export-status export-status--warning" }));
}
if (__VLS_ctx.downloadError) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "export-status export-status--error" }));
    (__VLS_ctx.downloadError);
}
if (__VLS_ctx.jsonDownloadUrl || __VLS_ctx.imagesDownloadUrl) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "export-actions-row export-actions-row--downloads" }));
    if (__VLS_ctx.jsonDownloadUrl) {
        var __VLS_52 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52(__assign({ 'onClick': {} }, { expand: "block" })));
        var __VLS_54 = __VLS_53.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { expand: "block" })], __VLS_functionalComponentArgsRest(__VLS_53), false));
        var __VLS_56 = void 0;
        var __VLS_57 = void 0;
        var __VLS_58 = void 0;
        var __VLS_59 = {
            onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.jsonDownloadUrl || __VLS_ctx.imagesDownloadUrl))
                    return;
                if (!(__VLS_ctx.jsonDownloadUrl))
                    return;
                __VLS_ctx.handleDownload(__VLS_ctx.jsonDownloadUrl, 'json');
            }
        };
        __VLS_55.slots.default;
        var __VLS_55;
    }
    if (__VLS_ctx.imagesDownloadUrl) {
        var __VLS_60 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60(__assign({ 'onClick': {} }, { expand: "block" })));
        var __VLS_62 = __VLS_61.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { expand: "block" })], __VLS_functionalComponentArgsRest(__VLS_61), false));
        var __VLS_64 = void 0;
        var __VLS_65 = void 0;
        var __VLS_66 = void 0;
        var __VLS_67 = {
            onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.jsonDownloadUrl || __VLS_ctx.imagesDownloadUrl))
                    return;
                if (!(__VLS_ctx.imagesDownloadUrl))
                    return;
                __VLS_ctx.handleDownload(__VLS_ctx.imagesDownloadUrl, 'zip');
            }
        };
        __VLS_63.slots.default;
        var __VLS_63;
    }
}
var __VLS_15;
var __VLS_3;
var __VLS_68 = {}.IonAlert;
/** @type {[typeof __VLS_components.IonAlert, typeof __VLS_components.ionAlert, ]} */ ;
// @ts-ignore
var __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68(__assign({ 'onDidDismiss': {} }, { isOpen: (__VLS_ctx.showLocalExportAlert), header: "Export unavailable", message: (__VLS_ctx.localExportAlertMessage), buttons: (__VLS_ctx.localExportAlertButtons) })));
var __VLS_70 = __VLS_69.apply(void 0, __spreadArray([__assign({ 'onDidDismiss': {} }, { isOpen: (__VLS_ctx.showLocalExportAlert), header: "Export unavailable", message: (__VLS_ctx.localExportAlertMessage), buttons: (__VLS_ctx.localExportAlertButtons) })], __VLS_functionalComponentArgsRest(__VLS_69), false));
var __VLS_72;
var __VLS_73;
var __VLS_74;
var __VLS_75 = {
    onDidDismiss: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showLocalExportAlert = false;
    }
};
var __VLS_71;
/** @type {__VLS_StyleScopedClasses['export-card']} */ ;
/** @type {__VLS_StyleScopedClasses['export-card__content']} */ ;
/** @type {__VLS_StyleScopedClasses['export-card__body']} */ ;
/** @type {__VLS_StyleScopedClasses['export-paths']} */ ;
/** @type {__VLS_StyleScopedClasses['export-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['export-list']} */ ;
/** @type {__VLS_StyleScopedClasses['export-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['export-actions-row']} */ ;
/** @type {__VLS_StyleScopedClasses['export-status']} */ ;
/** @type {__VLS_StyleScopedClasses['export-status']} */ ;
/** @type {__VLS_StyleScopedClasses['export-status--warning']} */ ;
/** @type {__VLS_StyleScopedClasses['export-status']} */ ;
/** @type {__VLS_StyleScopedClasses['export-status--error']} */ ;
/** @type {__VLS_StyleScopedClasses['export-actions-row']} */ ;
/** @type {__VLS_StyleScopedClasses['export-actions-row--downloads']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            IonAlert: vue_1.IonAlert,
            IonButton: vue_1.IonButton,
            IonCard: vue_1.IonCard,
            IonCardContent: vue_1.IonCardContent,
            IonCardHeader: vue_1.IonCardHeader,
            IonCardTitle: vue_1.IonCardTitle,
            IonCheckbox: vue_1.IonCheckbox,
            IonItem: vue_1.IonItem,
            IonLabel: vue_1.IonLabel,
            IonList: vue_1.IonList,
            selectedForExport: selectedForExport,
            exportJob: exportJob,
            jsonDownloadUrl: jsonDownloadUrl,
            imagesDownloadUrl: imagesDownloadUrl,
            downloadError: downloadError,
            showLocalExportAlert: showLocalExportAlert,
            localExportAlertMessage: localExportAlertMessage,
            handleDownload: handleDownload,
            setExportPath: setExportPath,
            triggerExport: triggerExport,
            pollExport: pollExport,
            localExportAlertButtons: localExportAlertButtons,
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
