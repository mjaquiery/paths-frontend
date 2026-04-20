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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("@ionic/vue");
var vue_2 = require("vue");
var vue_query_1 = require("@tanstack/vue-query");
var db_1 = require("../lib/db");
var apiClient_1 = require("../generated/apiClient");
var usePaths_1 = require("../composables/usePaths");
var PathSubscriptionManager_vue_1 = require("./PathSubscriptionManager.vue");
var PathEditModal_vue_1 = require("./PathEditModal.vue");
var PathDeleteModal_vue_1 = require("./PathDeleteModal.vue");
var PathShareModal_vue_1 = require("./PathShareModal.vue");
/** Maximum number of pills shown in the compact bar before the +N overflow chip. */
var MAX_PILLS = 4;
var props = defineProps();
var emit = defineEmits();
var router = useRouter();
var queryClient = (0, vue_query_1.useQueryClient)();
var _d = (0, usePaths_1.usePaths)(), allPaths = _d.data, refetch = _d.refetch;
// Invitations
var _e = (0, apiClient_1.useListInvitations)(), invitationsData = _e.data, refetchInvitations = _e.refetch;
var doAccept = (0, apiClient_1.useAcceptInvitation)().mutateAsync;
var doIgnore = (0, apiClient_1.useIgnoreInvitation)().mutateAsync;
var doBlock = (0, apiClient_1.useBlockInviter)().mutateAsync;
var pendingInvitations = (0, vue_2.computed)(function () { var _a, _b, _c; return (_c = (_b = (_a = invitationsData.value) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.filter(function (i) { return i.status === 'invited'; })) !== null && _c !== void 0 ? _c : []; });
// Unsubscribe
var doDeleteSubscription = (0, apiClient_1.useDeleteSubscription)().mutateAsync;
var unsubscribing = (0, vue_2.ref)({});
// Edit / delete path
var showEditModal = (0, vue_2.ref)(false);
var editingPath = (0, vue_2.ref)(null);
var showDeleteModal = (0, vue_2.ref)(false);
var deletingPath = (0, vue_2.ref)(null);
// Share path
var showShareModal = (0, vue_2.ref)(false);
var sharingPath = (0, vue_2.ref)(null);
// Manage modal
var showManageModal = (0, vue_2.ref)(false);
var hiddenByPath = (0, vue_2.ref)({});
var pathOrder = (0, vue_2.ref)([]);
// Invitation action busy state
var invitationBusy = (0, vue_2.ref)({});
// Build ordered + hidden state when paths load
(0, vue_2.watch)(allPaths, function (paths) { return __awaiter(void 0, void 0, void 0, function () {
    var hidden, stored, ids, ordered;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!paths)
                    return [2 /*return*/];
                return [4 /*yield*/, Promise.all(paths.map(function (p) { return __awaiter(void 0, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _a = [p.path_id];
                                return [4 /*yield*/, (0, db_1.isPathHidden)(p.path_id)];
                            case 1: return [2 /*return*/, _a.concat([_b.sent()])];
                        }
                    }); }); }))];
            case 1:
                hidden = _a.sent();
                hiddenByPath.value = Object.fromEntries(hidden);
                stored = (0, db_1.getPathOrder)();
                ids = paths.map(function (p) { return p.path_id; });
                ordered = __spreadArray(__spreadArray([], stored.filter(function (id) { return ids.includes(id); }), true), ids.filter(function (id) { return !stored.includes(id); }), true);
                pathOrder.value = ordered;
                return [2 /*return*/];
        }
    });
}); }, { immediate: true });
var orderedPaths = (0, vue_2.computed)(function () {
    if (!allPaths.value)
        return [];
    return pathOrder.value
        .map(function (id) { return allPaths.value.find(function (p) { return p.path_id === id; }); })
        .filter(function (p) { return !!p; });
});
var ownedPaths = (0, vue_2.computed)(function () {
    return orderedPaths.value.filter(function (p) { var _a; return p.owner_user_id === ((_a = props.currentUser) === null || _a === void 0 ? void 0 : _a.user_id); });
});
/** Pills shown in the compact bar (at most MAX_PILLS). */
var visiblePills = (0, vue_2.computed)(function () { return orderedPaths.value.slice(0, MAX_PILLS); });
/** Number of paths hidden behind the +N chip. */
var overflowCount = (0, vue_2.computed)(function () {
    return Math.max(0, orderedPaths.value.length - MAX_PILLS);
});
// Emit visible ordered paths whenever they change
(0, vue_2.watch)([orderedPaths, hiddenByPath], function () {
    var visible = orderedPaths.value.filter(function (p) { return !hiddenByPath.value[p.path_id]; });
    emit('pathsChanged', visible);
}, { deep: true, immediate: true });
function toggleVisibility(pathId) {
    return __awaiter(this, void 0, void 0, function () {
        var nowHidden;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nowHidden = !hiddenByPath.value[pathId];
                    hiddenByPath.value[pathId] = nowHidden;
                    return [4 /*yield*/, (0, db_1.setPathHidden)(pathId, nowHidden)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function onToggleChange(pathId, event) {
    return __awaiter(this, void 0, void 0, function () {
        var visible;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    visible = Boolean(event.detail.checked);
                    hiddenByPath.value[pathId] = !visible;
                    return [4 /*yield*/, (0, db_1.setPathHidden)(pathId, !visible)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function moveUp(index) {
    if (index === 0)
        return;
    var ids = __spreadArray([], pathOrder.value, true);
    var tmp = ids[index - 1];
    ids[index - 1] = ids[index];
    ids[index] = tmp;
    pathOrder.value = ids;
    (0, db_1.setPathOrder)(ids);
}
function moveDown(index) {
    if (index >= pathOrder.value.length - 1)
        return;
    var ids = __spreadArray([], pathOrder.value, true);
    var tmp = ids[index];
    ids[index] = ids[index + 1];
    ids[index + 1] = tmp;
    pathOrder.value = ids;
    (0, db_1.setPathOrder)(ids);
}
function openNewPath() {
    showManageModal.value = false;
    void router.push('/paths/new');
}
function acceptInv(invitationId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    invitationBusy.value[invitationId] = true;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, doAccept({ invitationId: invitationId })];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, Promise.all([refetchInvitations(), refetch()])];
                case 3:
                    _b.sent();
                    void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
                    return [3 /*break*/, 6];
                case 4:
                    _a = _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    invitationBusy.value[invitationId] = false;
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function ignoreInv(invitationId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    invitationBusy.value[invitationId] = true;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, doIgnore({ invitationId: invitationId })];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, refetchInvitations()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 4:
                    _a = _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    invitationBusy.value[invitationId] = false;
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function blockInv(invitationId, inviterUserId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    invitationBusy.value[invitationId] = true;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, doBlock({ data: { user_id: inviterUserId } })];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, refetchInvitations()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 4:
                    _a = _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    invitationBusy.value[invitationId] = false;
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function unsubscribe(pathId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!props.currentUser)
                        return [2 /*return*/];
                    unsubscribing.value[pathId] = true;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, doDeleteSubscription({
                            pathCode: pathId,
                            targetUserId: props.currentUser.user_id,
                        })];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, refetch()];
                case 3:
                    _b.sent();
                    void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
                    return [3 /*break*/, 6];
                case 4:
                    _a = _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    unsubscribing.value[pathId] = false;
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function openEdit(path) {
    editingPath.value = path;
    showEditModal.value = true;
}
function openShare(path) {
    sharingPath.value = path;
    showShareModal.value = true;
}
function onPathUpdated(_updated) {
    editingPath.value = null;
    void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
    void refetch();
}
function openDelete(path) {
    deletingPath.value = path;
    showDeleteModal.value = true;
}
function onPathDeleted() {
    deletingPath.value = null;
    void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
    void refetch();
}
function hexToRgba(hex, alpha) {
    if (typeof hex !== 'string')
        return "rgba(0,0,0,".concat(alpha, ")");
    var normalized = hex.trim();
    if (!normalized.startsWith('#'))
        normalized = "#".concat(normalized);
    // Expand 3-digit shorthand (#rgb → #rrggbb)
    if (/^#[0-9a-fA-F]{3}$/.test(normalized)) {
        normalized = "#".concat(normalized[1]).concat(normalized[1]).concat(normalized[2]).concat(normalized[2]).concat(normalized[3]).concat(normalized[3]);
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(normalized))
        return "rgba(0,0,0,".concat(alpha, ")");
    var r = parseInt(normalized.slice(1, 3), 16);
    var g = parseInt(normalized.slice(3, 5), 16);
    var b = parseInt(normalized.slice(5, 7), 16);
    return "rgba(".concat(r, ",").concat(g, ",").concat(b, ",").concat(alpha, ")");
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.currentUser) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "paths-selector-bar" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "paths-bar-row" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "paths-chip-list" }));
    var _loop_1 = function (path) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign(__assign(__assign(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.currentUser))
                    return;
                __VLS_ctx.toggleVisibility(path.path_id);
            } }, { key: (path.path_id) }), { class: "path-chip" }), { class: ({ 'path-chip--hidden': __VLS_ctx.hiddenByPath[path.path_id] }) }), { style: ({
                '--chip-color': path.color,
                borderColor: path.color,
                backgroundColor: __VLS_ctx.hiddenByPath[path.path_id]
                    ? 'transparent'
                    : __VLS_ctx.hexToRgba(path.color, 0.15),
            }) }), { title: (path.title) }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "path-chip-dot" }, { style: ({ backgroundColor: path.color }) }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "path-chip-label" }));
        (path.title);
    };
    for (var _i = 0, _f = __VLS_getVForSourceType((__VLS_ctx.visiblePills)); _i < _f.length; _i++) {
        var path = _f[_i][0];
        _loop_1(path);
    }
    if (__VLS_ctx.overflowCount > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign({ onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.currentUser))
                    return;
                if (!(__VLS_ctx.overflowCount > 0))
                    return;
                __VLS_ctx.showManageModal = true;
            } }, { class: "path-chip path-chip--overflow" }), { title: ("".concat(__VLS_ctx.overflowCount, " more path").concat(__VLS_ctx.overflowCount === 1 ? '' : 's', " \u2014 open Manage to see all")) }));
        (__VLS_ctx.overflowCount);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "paths-bar-actions" }));
    var __VLS_0 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0(__assign({ 'onClick': {} }, { size: "small", fill: "clear" })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "small", fill: "clear" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_4 = void 0;
    var __VLS_5 = void 0;
    var __VLS_6 = void 0;
    var __VLS_7 = {
        onClick: (__VLS_ctx.openNewPath)
    };
    __VLS_3.slots.default;
    var __VLS_3;
    var __VLS_8 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8(__assign({ 'onClick': {} }, { size: "small", fill: "clear" })));
    var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "small", fill: "clear" })], __VLS_functionalComponentArgsRest(__VLS_9), false));
    var __VLS_12 = void 0;
    var __VLS_13 = void 0;
    var __VLS_14 = void 0;
    var __VLS_15 = {
        onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.currentUser))
                return;
            __VLS_ctx.showManageModal = true;
        }
    };
    __VLS_11.slots.default;
    var __VLS_11;
    if (__VLS_ctx.pendingInvitations.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "invitations-row" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "invitations-row-text" }));
        (__VLS_ctx.pendingInvitations.length);
        (__VLS_ctx.pendingInvitations.length === 1 ? '' : 's');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "invitation-cards" }));
        var _loop_2 = function (inv) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ key: (inv.id) }, { class: "invitation-card" }));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "invitation-path" }));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            ((_a = inv.path_title) !== null && _a !== void 0 ? _a : inv.path_code);
            (inv.inviter_email);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "invitation-actions" }));
            var __VLS_16 = {}.IonButton;
            /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
            // @ts-ignore
            var __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16(__assign({ 'onClick': {} }, { size: "small", color: "success", disabled: (__VLS_ctx.invitationBusy[inv.id]) })));
            var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "small", color: "success", disabled: (__VLS_ctx.invitationBusy[inv.id]) })], __VLS_functionalComponentArgsRest(__VLS_17), false));
            var __VLS_20 = void 0;
            var __VLS_21 = void 0;
            var __VLS_22 = void 0;
            var __VLS_23 = {
                onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.currentUser))
                        return;
                    if (!(__VLS_ctx.pendingInvitations.length > 0))
                        return;
                    __VLS_ctx.acceptInv(inv.id);
                }
            };
            __VLS_19.slots.default;
            var __VLS_24 = {}.IonButton;
            /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
            // @ts-ignore
            var __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24(__assign({ 'onClick': {} }, { size: "small", color: "medium", fill: "outline", disabled: (__VLS_ctx.invitationBusy[inv.id]) })));
            var __VLS_26 = __VLS_25.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "small", color: "medium", fill: "outline", disabled: (__VLS_ctx.invitationBusy[inv.id]) })], __VLS_functionalComponentArgsRest(__VLS_25), false));
            var __VLS_28 = void 0;
            var __VLS_29 = void 0;
            var __VLS_30 = void 0;
            var __VLS_31 = {
                onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.currentUser))
                        return;
                    if (!(__VLS_ctx.pendingInvitations.length > 0))
                        return;
                    __VLS_ctx.ignoreInv(inv.id);
                }
            };
            __VLS_27.slots.default;
            var __VLS_32 = {}.IonButton;
            /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
            // @ts-ignore
            var __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32(__assign({ 'onClick': {} }, { size: "small", color: "danger", fill: "outline", disabled: (__VLS_ctx.invitationBusy[inv.id]) })));
            var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "small", color: "danger", fill: "outline", disabled: (__VLS_ctx.invitationBusy[inv.id]) })], __VLS_functionalComponentArgsRest(__VLS_33), false));
            var __VLS_36 = void 0;
            var __VLS_37 = void 0;
            var __VLS_38 = void 0;
            var __VLS_39 = {
                onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.currentUser))
                        return;
                    if (!(__VLS_ctx.pendingInvitations.length > 0))
                        return;
                    __VLS_ctx.blockInv(inv.id, inv.inviter_user_id);
                }
            };
            __VLS_35.slots.default;
        };
        var __VLS_19, __VLS_27, __VLS_35;
        for (var _g = 0, _h = __VLS_getVForSourceType((__VLS_ctx.pendingInvitations)); _g < _h.length; _g++) {
            var inv = _h[_g][0];
            _loop_2(inv);
        }
    }
}
var __VLS_40 = {}.IonModal;
/** @type {[typeof __VLS_components.IonModal, typeof __VLS_components.ionModal, typeof __VLS_components.IonModal, typeof __VLS_components.ionModal, ]} */ ;
// @ts-ignore
var __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40(__assign({ 'onDidDismiss': {} }, { isOpen: (__VLS_ctx.showManageModal) })));
var __VLS_42 = __VLS_41.apply(void 0, __spreadArray([__assign({ 'onDidDismiss': {} }, { isOpen: (__VLS_ctx.showManageModal) })], __VLS_functionalComponentArgsRest(__VLS_41), false));
var __VLS_44;
var __VLS_45;
var __VLS_46;
var __VLS_47 = {
    onDidDismiss: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showManageModal = false;
    }
};
__VLS_43.slots.default;
var __VLS_48 = {}.IonHeader;
/** @type {[typeof __VLS_components.IonHeader, typeof __VLS_components.ionHeader, typeof __VLS_components.IonHeader, typeof __VLS_components.ionHeader, ]} */ ;
// @ts-ignore
var __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({}));
var __VLS_50 = __VLS_49.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_49), false));
__VLS_51.slots.default;
var __VLS_52 = {}.IonToolbar;
/** @type {[typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, ]} */ ;
// @ts-ignore
var __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({}));
var __VLS_54 = __VLS_53.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_53), false));
__VLS_55.slots.default;
var __VLS_56 = {}.IonTitle;
/** @type {[typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, ]} */ ;
// @ts-ignore
var __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({}));
var __VLS_58 = __VLS_57.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_57), false));
__VLS_59.slots.default;
var __VLS_59;
var __VLS_60 = {}.IonButtons;
/** @type {[typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, ]} */ ;
// @ts-ignore
var __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    slot: "end",
}));
var __VLS_62 = __VLS_61.apply(void 0, __spreadArray([{
        slot: "end",
    }], __VLS_functionalComponentArgsRest(__VLS_61), false));
__VLS_63.slots.default;
var __VLS_64 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64(__assign({ 'onClick': {} })));
var __VLS_66 = __VLS_65.apply(void 0, __spreadArray([__assign({ 'onClick': {} })], __VLS_functionalComponentArgsRest(__VLS_65), false));
var __VLS_68;
var __VLS_69;
var __VLS_70;
var __VLS_71 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showManageModal = false;
    }
};
__VLS_67.slots.default;
var __VLS_67;
var __VLS_63;
var __VLS_55;
var __VLS_51;
var __VLS_72 = {}.IonContent;
/** @type {[typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, ]} */ ;
// @ts-ignore
var __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72(__assign({ class: "ion-padding" })));
var __VLS_74 = __VLS_73.apply(void 0, __spreadArray([__assign({ class: "ion-padding" })], __VLS_functionalComponentArgsRest(__VLS_73), false));
__VLS_75.slots.default;
var __VLS_76 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76(__assign({ 'onClick': {} }, { expand: "block", fill: "outline" })));
var __VLS_78 = __VLS_77.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { expand: "block", fill: "outline" })], __VLS_functionalComponentArgsRest(__VLS_77), false));
var __VLS_80;
var __VLS_81;
var __VLS_82;
var __VLS_83 = {
    onClick: (__VLS_ctx.openNewPath)
};
__VLS_79.slots.default;
var __VLS_79;
var __VLS_84 = {}.IonList;
/** @type {[typeof __VLS_components.IonList, typeof __VLS_components.ionList, typeof __VLS_components.IonList, typeof __VLS_components.ionList, ]} */ ;
// @ts-ignore
var __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84(__assign({ class: "paths-list" })));
var __VLS_86 = __VLS_85.apply(void 0, __spreadArray([__assign({ class: "paths-list" })], __VLS_functionalComponentArgsRest(__VLS_85), false));
__VLS_87.slots.default;
var _loop_3 = function (path, index) {
    var __VLS_88 = {}.IonItem;
    /** @type {[typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, ]} */ ;
    // @ts-ignore
    var __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        key: (path.path_id),
    }));
    var __VLS_90 = __VLS_89.apply(void 0, __spreadArray([{
            key: (path.path_id),
        }], __VLS_functionalComponentArgsRest(__VLS_89), false));
    __VLS_91.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "paths-reorder-arrows" }, { slot: "start" }));
    var __VLS_92 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92(__assign({ 'onClick': {} }, { size: "small", fill: "clear", disabled: (index === 0), 'aria-label': "Move path up" })));
    var __VLS_94 = __VLS_93.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "small", fill: "clear", disabled: (index === 0), 'aria-label': "Move path up" })], __VLS_functionalComponentArgsRest(__VLS_93), false));
    var __VLS_96 = void 0;
    var __VLS_97 = void 0;
    var __VLS_98 = void 0;
    var __VLS_99 = {
        onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.moveUp(index);
        }
    };
    __VLS_95.slots.default;
    var __VLS_100 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100(__assign({ 'onClick': {} }, { size: "small", fill: "clear", disabled: (index === __VLS_ctx.orderedPaths.length - 1), 'aria-label': "Move path down" })));
    var __VLS_102 = __VLS_101.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "small", fill: "clear", disabled: (index === __VLS_ctx.orderedPaths.length - 1), 'aria-label': "Move path down" })], __VLS_functionalComponentArgsRest(__VLS_101), false));
    var __VLS_104 = void 0;
    var __VLS_105 = void 0;
    var __VLS_106 = void 0;
    var __VLS_107 = {
        onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.moveDown(index);
        }
    };
    __VLS_103.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign(__assign({ class: "path-swatch" }, { style: ({ backgroundColor: path.color }) }), { slot: "start" }));
    var __VLS_108 = {}.IonLabel;
    /** @type {[typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, ]} */ ;
    // @ts-ignore
    var __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({}));
    var __VLS_110 = __VLS_109.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_109), false));
    __VLS_111.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    (path.title);
    if (path.description) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (path.description);
    }
    var __VLS_112 = {}.IonToggle;
    /** @type {[typeof __VLS_components.IonToggle, typeof __VLS_components.ionToggle, ]} */ ;
    // @ts-ignore
    var __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112(__assign({ 'onIonChange': {} }, { slot: "end", checked: (!__VLS_ctx.hiddenByPath[path.path_id]) })));
    var __VLS_114 = __VLS_113.apply(void 0, __spreadArray([__assign({ 'onIonChange': {} }, { slot: "end", checked: (!__VLS_ctx.hiddenByPath[path.path_id]) })], __VLS_functionalComponentArgsRest(__VLS_113), false));
    var __VLS_116 = void 0;
    var __VLS_117 = void 0;
    var __VLS_118 = void 0;
    var __VLS_119 = {
        onIonChange: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            __VLS_ctx.onToggleChange(path.path_id, $event);
        }
    };
    var __VLS_120 = {}.IonChip;
    /** @type {[typeof __VLS_components.IonChip, typeof __VLS_components.ionChip, typeof __VLS_components.IonChip, typeof __VLS_components.ionChip, ]} */ ;
    // @ts-ignore
    var __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120(__assign({ slot: "end", color: (path.is_public ? 'success' : 'medium') }, { class: "paths-public-chip" })));
    var __VLS_122 = __VLS_121.apply(void 0, __spreadArray([__assign({ slot: "end", color: (path.is_public ? 'success' : 'medium') }, { class: "paths-public-chip" })], __VLS_functionalComponentArgsRest(__VLS_121), false));
    __VLS_123.slots.default;
    (path.is_public ? 'Public' : 'Private');
    if (path.owner_user_id !== ((_b = __VLS_ctx.currentUser) === null || _b === void 0 ? void 0 : _b.user_id)) {
        var __VLS_124 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124(__assign({ 'onClick': {} }, { slot: "end", size: "small", fill: "outline", color: "danger", disabled: (__VLS_ctx.unsubscribing[path.path_id]) })));
        var __VLS_126 = __VLS_125.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { slot: "end", size: "small", fill: "outline", color: "danger", disabled: (__VLS_ctx.unsubscribing[path.path_id]) })], __VLS_functionalComponentArgsRest(__VLS_125), false));
        var __VLS_128 = void 0;
        var __VLS_129 = void 0;
        var __VLS_130 = void 0;
        var __VLS_131 = {
            onClick: function () {
                var _a;
                var _b = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _b[_i] = arguments[_i];
                }
                var $event = _b[0];
                if (!(path.owner_user_id !== ((_a = __VLS_ctx.currentUser) === null || _a === void 0 ? void 0 : _a.user_id)))
                    return;
                __VLS_ctx.unsubscribe(path.path_id);
            }
        };
        __VLS_127.slots.default;
        (__VLS_ctx.unsubscribing[path.path_id] ? 'Leaving…' : 'Unsubscribe');
    }
    if (path.owner_user_id === ((_c = __VLS_ctx.currentUser) === null || _c === void 0 ? void 0 : _c.user_id)) {
        var __VLS_132 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132(__assign({ 'onClick': {} }, { slot: "end", size: "small", fill: "outline", color: "primary" })));
        var __VLS_134 = __VLS_133.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { slot: "end", size: "small", fill: "outline", color: "primary" })], __VLS_functionalComponentArgsRest(__VLS_133), false));
        var __VLS_136 = void 0;
        var __VLS_137 = void 0;
        var __VLS_138 = void 0;
        var __VLS_139 = {
            onClick: function () {
                var _a;
                var _b = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _b[_i] = arguments[_i];
                }
                var $event = _b[0];
                if (!(path.owner_user_id === ((_a = __VLS_ctx.currentUser) === null || _a === void 0 ? void 0 : _a.user_id)))
                    return;
                __VLS_ctx.openShare(path);
            }
        };
        __VLS_135.slots.default;
        var __VLS_140 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140(__assign({ 'onClick': {} }, { slot: "end", size: "small", fill: "outline" })));
        var __VLS_142 = __VLS_141.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { slot: "end", size: "small", fill: "outline" })], __VLS_functionalComponentArgsRest(__VLS_141), false));
        var __VLS_144 = void 0;
        var __VLS_145 = void 0;
        var __VLS_146 = void 0;
        var __VLS_147 = {
            onClick: function () {
                var _a;
                var _b = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _b[_i] = arguments[_i];
                }
                var $event = _b[0];
                if (!(path.owner_user_id === ((_a = __VLS_ctx.currentUser) === null || _a === void 0 ? void 0 : _a.user_id)))
                    return;
                __VLS_ctx.openEdit(path);
            }
        };
        __VLS_143.slots.default;
        var __VLS_148 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148(__assign({ 'onClick': {} }, { slot: "end", size: "small", fill: "outline", color: "danger" })));
        var __VLS_150 = __VLS_149.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { slot: "end", size: "small", fill: "outline", color: "danger" })], __VLS_functionalComponentArgsRest(__VLS_149), false));
        var __VLS_152 = void 0;
        var __VLS_153 = void 0;
        var __VLS_154 = void 0;
        var __VLS_155 = {
            onClick: function () {
                var _a;
                var _b = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _b[_i] = arguments[_i];
                }
                var $event = _b[0];
                if (!(path.owner_user_id === ((_a = __VLS_ctx.currentUser) === null || _a === void 0 ? void 0 : _a.user_id)))
                    return;
                __VLS_ctx.openDelete(path);
            }
        };
        __VLS_151.slots.default;
    }
};
var __VLS_95, __VLS_103, __VLS_111, __VLS_115, __VLS_123, __VLS_127, __VLS_135, __VLS_143, __VLS_151, __VLS_91;
for (var _j = 0, _k = __VLS_getVForSourceType((__VLS_ctx.orderedPaths)); _j < _k.length; _j++) {
    var _l = _k[_j], path = _l[0], index = _l[1];
    _loop_3(path, index);
}
var __VLS_87;
for (var _m = 0, _o = __VLS_getVForSourceType((__VLS_ctx.ownedPaths)); _m < _o.length; _m++) {
    var path = _o[_m][0];
    /** @type {[typeof PathSubscriptionManager, ]} */ ;
    // @ts-ignore
    var __VLS_156 = __VLS_asFunctionalComponent(PathSubscriptionManager_vue_1.default, new PathSubscriptionManager_vue_1.default({
        key: ('sub-' + path.path_id),
        pathCode: (path.path_id),
        pathTitle: (path.title),
    }));
    var __VLS_157 = __VLS_156.apply(void 0, __spreadArray([{
            key: ('sub-' + path.path_id),
            pathCode: (path.path_id),
            pathTitle: (path.title),
        }], __VLS_functionalComponentArgsRest(__VLS_156), false));
}
var __VLS_75;
var __VLS_43;
if (__VLS_ctx.editingPath) {
    /** @type {[typeof PathEditModal, ]} */ ;
    // @ts-ignore
    var __VLS_159 = __VLS_asFunctionalComponent(PathEditModal_vue_1.default, new PathEditModal_vue_1.default(__assign(__assign({ 'onDismiss': {} }, { 'onUpdated': {} }), { isOpen: (__VLS_ctx.showEditModal), path: (__VLS_ctx.editingPath) })));
    var __VLS_160 = __VLS_159.apply(void 0, __spreadArray([__assign(__assign({ 'onDismiss': {} }, { 'onUpdated': {} }), { isOpen: (__VLS_ctx.showEditModal), path: (__VLS_ctx.editingPath) })], __VLS_functionalComponentArgsRest(__VLS_159), false));
    var __VLS_162 = void 0;
    var __VLS_163 = void 0;
    var __VLS_164 = void 0;
    var __VLS_165 = {
        onDismiss: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.editingPath))
                return;
            __VLS_ctx.showEditModal = false;
        }
    };
    var __VLS_166 = {
        onUpdated: (__VLS_ctx.onPathUpdated)
    };
    var __VLS_161;
}
if (__VLS_ctx.deletingPath) {
    /** @type {[typeof PathDeleteModal, ]} */ ;
    // @ts-ignore
    var __VLS_167 = __VLS_asFunctionalComponent(PathDeleteModal_vue_1.default, new PathDeleteModal_vue_1.default(__assign(__assign({ 'onDismiss': {} }, { 'onDeleted': {} }), { isOpen: (__VLS_ctx.showDeleteModal), path: (__VLS_ctx.deletingPath) })));
    var __VLS_168 = __VLS_167.apply(void 0, __spreadArray([__assign(__assign({ 'onDismiss': {} }, { 'onDeleted': {} }), { isOpen: (__VLS_ctx.showDeleteModal), path: (__VLS_ctx.deletingPath) })], __VLS_functionalComponentArgsRest(__VLS_167), false));
    var __VLS_170 = void 0;
    var __VLS_171 = void 0;
    var __VLS_172 = void 0;
    var __VLS_173 = {
        onDismiss: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.deletingPath))
                return;
            __VLS_ctx.showDeleteModal = false;
        }
    };
    var __VLS_174 = {
        onDeleted: (__VLS_ctx.onPathDeleted)
    };
    var __VLS_169;
}
if (__VLS_ctx.sharingPath) {
    /** @type {[typeof PathShareModal, ]} */ ;
    // @ts-ignore
    var __VLS_175 = __VLS_asFunctionalComponent(PathShareModal_vue_1.default, new PathShareModal_vue_1.default(__assign({ 'onDismiss': {} }, { isOpen: (__VLS_ctx.showShareModal), path: (__VLS_ctx.sharingPath) })));
    var __VLS_176 = __VLS_175.apply(void 0, __spreadArray([__assign({ 'onDismiss': {} }, { isOpen: (__VLS_ctx.showShareModal), path: (__VLS_ctx.sharingPath) })], __VLS_functionalComponentArgsRest(__VLS_175), false));
    var __VLS_178 = void 0;
    var __VLS_179 = void 0;
    var __VLS_180 = void 0;
    var __VLS_181 = {
        onDismiss: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.sharingPath))
                return;
            __VLS_ctx.showShareModal = false;
        }
    };
    var __VLS_177;
}
/** @type {__VLS_StyleScopedClasses['paths-selector-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['paths-bar-row']} */ ;
/** @type {__VLS_StyleScopedClasses['paths-chip-list']} */ ;
/** @type {__VLS_StyleScopedClasses['path-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['path-chip-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['path-chip-label']} */ ;
/** @type {__VLS_StyleScopedClasses['path-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['path-chip--overflow']} */ ;
/** @type {__VLS_StyleScopedClasses['paths-bar-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['invitations-row']} */ ;
/** @type {__VLS_StyleScopedClasses['invitations-row-text']} */ ;
/** @type {__VLS_StyleScopedClasses['invitation-cards']} */ ;
/** @type {__VLS_StyleScopedClasses['invitation-card']} */ ;
/** @type {__VLS_StyleScopedClasses['invitation-path']} */ ;
/** @type {__VLS_StyleScopedClasses['invitation-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['ion-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['paths-list']} */ ;
/** @type {__VLS_StyleScopedClasses['paths-reorder-arrows']} */ ;
/** @type {__VLS_StyleScopedClasses['path-swatch']} */ ;
/** @type {__VLS_StyleScopedClasses['paths-public-chip']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            IonButton: vue_1.IonButton,
            IonButtons: vue_1.IonButtons,
            IonChip: vue_1.IonChip,
            IonContent: vue_1.IonContent,
            IonHeader: vue_1.IonHeader,
            IonItem: vue_1.IonItem,
            IonLabel: vue_1.IonLabel,
            IonList: vue_1.IonList,
            IonModal: vue_1.IonModal,
            IonTitle: vue_1.IonTitle,
            IonToggle: vue_1.IonToggle,
            IonToolbar: vue_1.IonToolbar,
            PathSubscriptionManager: PathSubscriptionManager_vue_1.default,
            PathEditModal: PathEditModal_vue_1.default,
            PathDeleteModal: PathDeleteModal_vue_1.default,
            PathShareModal: PathShareModal_vue_1.default,
            pendingInvitations: pendingInvitations,
            unsubscribing: unsubscribing,
            showEditModal: showEditModal,
            editingPath: editingPath,
            showDeleteModal: showDeleteModal,
            deletingPath: deletingPath,
            showShareModal: showShareModal,
            sharingPath: sharingPath,
            showManageModal: showManageModal,
            hiddenByPath: hiddenByPath,
            invitationBusy: invitationBusy,
            orderedPaths: orderedPaths,
            ownedPaths: ownedPaths,
            visiblePills: visiblePills,
            overflowCount: overflowCount,
            toggleVisibility: toggleVisibility,
            onToggleChange: onToggleChange,
            moveUp: moveUp,
            moveDown: moveDown,
            openNewPath: openNewPath,
            acceptInv: acceptInv,
            ignoreInv: ignoreInv,
            blockInv: blockInv,
            unsubscribe: unsubscribe,
            openEdit: openEdit,
            openShare: openShare,
            onPathUpdated: onPathUpdated,
            openDelete: openDelete,
            onPathDeleted: onPathDeleted,
            hexToRgba: hexToRgba,
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
