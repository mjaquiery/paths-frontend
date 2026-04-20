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
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("vue");
var vue_query_1 = require("@tanstack/vue-query");
var usePendingSaves_1 = require("../composables/usePendingSaves");
var useApi_1 = require("../composables/useApi");
var db_1 = require("../lib/db");
var props = defineProps();
var queryClient = (0, vue_query_1.useQueryClient)();
var confirmingDelete = (0, vue_1.ref)(false);
var _a = (0, usePendingSaves_1.usePendingSaves)(), savedNotification = _a.savedNotification, isContentSaving = _a.isContentSaving;
var _b = (0, useApi_1.useApi)(), queue = _b.queue, pendingCount = _b.pendingCount, abandonedWrites = _b.abandonedWrites, abandon = _b.abandon, retry = _b.retry, clearAbandoned = _b.clearAbandoned;
var summaryAriaLabel = (0, vue_1.computed)(function () {
    var base = "API status: ".concat(props.statusText || 'unknown', ".");
    var pending = pendingCount.value > 0
        ? " ".concat(pendingCount.value, " write ").concat(pendingCount.value === 1 ? 'operation' : 'operations', " pending.")
        : '';
    var failed = abandonedWrites.value.length > 0
        ? " ".concat(abandonedWrites.value.length, " write ").concat(abandonedWrites.value.length === 1 ? 'operation' : 'operations', " failed.")
        : '';
    return "".concat(base).concat(pending).concat(failed, " Click to expand.");
});
// ── Queue-item countdown timer ────────────────────────────────────────────────
/** Seconds until each item's next retry, keyed by item.id */
var retryCountdowns = (0, vue_1.ref)({});
var countdownInterval = null;
function retryCountdown(nextRetryAt) {
    return Math.max(0, Math.ceil((nextRetryAt - Date.now()) / 1000));
}
function updateCountdowns() {
    var next = {};
    for (var _i = 0, _a = queue.value; _i < _a.length; _i++) {
        var item = _a[_i];
        if (item.nextRetryAt) {
            next[item.id] = retryCountdown(item.nextRetryAt);
        }
    }
    retryCountdowns.value = next;
}
(0, vue_1.onMounted)(function () {
    countdownInterval = setInterval(updateCountdowns, 1000);
    updateCountdowns();
});
(0, vue_1.onUnmounted)(function () {
    if (countdownInterval !== null)
        clearInterval(countdownInterval);
});
// ── Queue-item helpers ────────────────────────────────────────────────────────
function queueItemIcon(item) {
    switch (item.status) {
        case 'running':
            return '↻';
        case 'repairing':
            return '🔑';
        case 'success':
            return '✓';
        case 'abandoned':
            return '✕';
        default:
            return item.failureKind ? '⚠' : '↑';
    }
}
function failureKindLabel(kind) {
    switch (kind) {
        case 'network':
            return 'offline';
        case 'auth':
            return 'auth error';
        case 'conflict':
            return 'conflict';
        case 'validation':
            return 'invalid';
        case 'server_error':
            return 'server error';
    }
}
function canRetry(item) {
    return ((item.status === 'pending' || item.status === 'abandoned') &&
        item.failureKind !== null &&
        item.failureKind !== 'conflict' &&
        item.failureKind !== 'validation');
}
function canAbandon(item) {
    return item.status === 'pending' || item.status === 'running';
}
// ── Standard actions ──────────────────────────────────────────────────────────
function handleRefresh() {
    void queryClient.invalidateQueries({ queryKey: ['v1'] });
}
function handleDeleteCacheClick() {
    confirmingDelete.value = true;
}
function confirmDeleteCache() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    confirmingDelete.value = false;
                    return [4 /*yield*/, Promise.all([
                            db_1.db.queryCache.clear(),
                            db_1.db.entryContent.clear(),
                            db_1.db.entryImages.clear(),
                            db_1.db.pathPreferences.clear(),
                        ])];
                case 1:
                    _a.sent();
                    localStorage.removeItem('pathOrder');
                    window.location.reload();
                    return [2 /*return*/];
            }
        });
    });
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['refresh-status__summary']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__summary']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__chevron']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__summary']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__summary']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__summary']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__summary']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__queue-item-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__queue-item-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__queue-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__action-btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)(__assign({ class: "refresh-status" }, { class: ("refresh-status--".concat(__VLS_ctx.statusType)) }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)(__assign({ class: "refresh-status__summary" }, { 'aria-label': (__VLS_ctx.summaryAriaLabel) }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span)(__assign({ class: "refresh-status__dot" }, { 'aria-hidden': "true" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "refresh-status__text" }));
(__VLS_ctx.statusText);
if (__VLS_ctx.isContentSaving) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "refresh-status__autosave-badge" }, { 'aria-label': "Autosaving draft…", 'aria-live': "polite" }));
}
if (__VLS_ctx.pendingCount > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "refresh-status__pending-badge" }, { 'aria-label': ("".concat(__VLS_ctx.pendingCount, " write ").concat(__VLS_ctx.pendingCount === 1 ? 'operation' : 'operations', " pending")), 'aria-live': "polite" }));
    (__VLS_ctx.pendingCount);
}
if (__VLS_ctx.abandonedWrites.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "refresh-status__error-badge" }, { 'aria-label': ("".concat(__VLS_ctx.abandonedWrites.length, " write ").concat(__VLS_ctx.abandonedWrites.length === 1 ? 'operation' : 'operations', " failed")), 'aria-live': "polite" }));
    (__VLS_ctx.abandonedWrites.length);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "refresh-status__chevron" }, { 'aria-hidden': "true" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "refresh-status__panel" }, { role: "status", 'aria-live': "polite" }));
if (__VLS_ctx.savedNotification) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "refresh-status__saved-note" }));
    (__VLS_ctx.savedNotification);
}
if (__VLS_ctx.queue.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "refresh-status__queue" }, { 'aria-label': "Active write operations" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "refresh-status__section-title" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)(__assign({ class: "refresh-status__queue-list" }));
    var _loop_1 = function (item) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)(__assign(__assign({ key: (item.id) }, { class: "refresh-status__queue-item" }), { class: ("refresh-status__queue-item--".concat(item.status)) }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "refresh-status__queue-item-icon" }, { 'aria-hidden': "true" }));
        (__VLS_ctx.queueItemIcon(item));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "refresh-status__queue-item-label" }));
        (item.label);
        if (item.failureKind) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "refresh-status__queue-item-kind" }, { class: ("refresh-status__queue-item-kind--".concat(item.failureKind)) }));
            (__VLS_ctx.failureKindLabel(item.failureKind));
        }
        if (item.nextRetryAt) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "refresh-status__queue-item-retry" }));
            (__VLS_ctx.retryCountdown(item.nextRetryAt));
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "refresh-status__queue-item-actions" }));
        if (__VLS_ctx.canRetry(item)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign({ onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.queue.length > 0))
                        return;
                    if (!(__VLS_ctx.canRetry(item)))
                        return;
                    __VLS_ctx.retry(item.id);
                } }, { class: "refresh-status__queue-action-btn" }), { type: "button" }));
        }
        if (__VLS_ctx.canAbandon(item)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign({ onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(__VLS_ctx.queue.length > 0))
                        return;
                    if (!(__VLS_ctx.canAbandon(item)))
                        return;
                    __VLS_ctx.abandon(item.id);
                } }, { class: "refresh-status__queue-action-btn refresh-status__queue-action-btn--danger" }), { type: "button" }));
        }
        if (item.failureMessage && item.status !== 'success') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "refresh-status__queue-item-message" }));
            (item.failureMessage);
        }
    };
    for (var _i = 0, _c = __VLS_getVForSourceType((__VLS_ctx.queue)); _i < _c.length; _i++) {
        var item = _c[_i][0];
        _loop_1(item);
    }
}
if (__VLS_ctx.abandonedWrites.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "refresh-status__abandoned" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "refresh-status__abandoned-header" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "refresh-status__section-title refresh-status__section-title--danger" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign({ onClick: (__VLS_ctx.clearAbandoned) }, { class: "refresh-status__action-btn" }), { type: "button" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)(__assign({ class: "refresh-status__abandoned-list" }));
    for (var _d = 0, _e = __VLS_getVForSourceType((__VLS_ctx.abandonedWrites)); _d < _e.length; _d++) {
        var aw = _e[_d][0];
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)(__assign({ key: (aw.id) }, { class: "refresh-status__abandoned-item" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "refresh-status__abandoned-label" }));
        (aw.label);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "refresh-status__abandoned-note" }));
        (aw.note);
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "refresh-status__detail-text" }));
if (__VLS_ctx.statusType === 'offline') {
}
else if (__VLS_ctx.statusType === 'error') {
}
else if (__VLS_ctx.statusType === 'fetching') {
}
else if (__VLS_ctx.lastCheckedAt) {
    (__VLS_ctx.lastCheckedAt.toLocaleTimeString());
}
else {
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "refresh-status__actions" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign({ onClick: (__VLS_ctx.handleRefresh) }, { class: "refresh-status__action-btn" }), { type: "button", disabled: (__VLS_ctx.statusType === 'fetching') }));
(__VLS_ctx.statusType === 'fetching' ? 'Refreshing…' : 'Refresh now');
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign({ onClick: (__VLS_ctx.handleDeleteCacheClick) }, { class: "refresh-status__action-btn refresh-status__action-btn--danger" }), { type: "button", disabled: (__VLS_ctx.confirmingDelete) }));
if (__VLS_ctx.confirmingDelete) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "refresh-status__confirm" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "refresh-status__confirm-text" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "refresh-status__confirm-actions" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign({ onClick: (__VLS_ctx.confirmDeleteCache) }, { class: "refresh-status__action-btn refresh-status__action-btn--danger" }), { type: "button" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.confirmingDelete))
                return;
            __VLS_ctx.confirmingDelete = false;
        } }, { class: "refresh-status__action-btn" }), { type: "button" }));
}
/** @type {__VLS_StyleScopedClasses['refresh-status']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__summary']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__dot']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__text']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__autosave-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__pending-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__error-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__chevron']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__panel']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__saved-note']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__queue']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__queue-list']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__queue-item']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__queue-item-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__queue-item-label']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__queue-item-kind']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__queue-item-retry']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__queue-item-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__queue-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__queue-action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__queue-action-btn--danger']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__queue-item-message']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__abandoned']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__abandoned-header']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__section-title--danger']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__abandoned-list']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__abandoned-item']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__abandoned-label']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__abandoned-note']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__detail-text']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__actions']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__action-btn--danger']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__confirm']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__confirm-text']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__confirm-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__action-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__action-btn--danger']} */ ;
/** @type {__VLS_StyleScopedClasses['refresh-status__action-btn']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            confirmingDelete: confirmingDelete,
            savedNotification: savedNotification,
            isContentSaving: isContentSaving,
            queue: queue,
            pendingCount: pendingCount,
            abandonedWrites: abandonedWrites,
            abandon: abandon,
            retry: retry,
            clearAbandoned: clearAbandoned,
            summaryAriaLabel: summaryAriaLabel,
            retryCountdown: retryCountdown,
            queueItemIcon: queueItemIcon,
            failureKindLabel: failureKindLabel,
            canRetry: canRetry,
            canAbandon: canAbandon,
            handleRefresh: handleRefresh,
            handleDeleteCacheClick: handleDeleteCacheClick,
            confirmDeleteCache: confirmDeleteCache,
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
