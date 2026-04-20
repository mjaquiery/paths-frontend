"use strict";
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
exports.classifyFailure = classifyFailure;
exports.retryDelay = retryDelay;
exports.shouldRetry = shouldRetry;
exports.useApi = useApi;
exports.resetApiState = resetApiState;
var vue_1 = require("vue");
var customFetch_1 = require("../lib/customFetch");
// ─── Constants ────────────────────────────────────────────────────────────────
/** Initial retry delay in ms (5 s). */
var BASE_RETRY_DELAY_MS = 5000;
/** Maximum retry delay cap in ms (60 s). */
var MAX_RETRY_DELAY_MS = 60000;
/** Number of attempts before giving up on `server_error` failures. */
var MAX_SERVER_ERROR_ATTEMPTS = 5;
/** How long to keep a succeeded item in the list before removing it (ms). */
var SUCCESS_DISPLAY_MS = 3000;
/** How long to keep an abandoned item in the list before removing it (ms). */
var ABANDONED_DISPLAY_MS = 10000;
/**
 * Classify an error thrown by a fetch/mutation into an `ApiFailureKind`.
 *
 * We inspect the HTTP status code when available; otherwise we treat the
 * failure as a network error.
 */
function classifyFailure(err) {
    // TanStack Query wraps errors; Orval generated client throws plain Error
    // objects.  We look for a `.status` property (set by customFetch) or a
    // string like "Request failed: 401".
    var status = extractStatus(err);
    var message = extractMessage(err);
    if (status === 401 || status === 403) {
        return { kind: 'auth', message: message !== null && message !== void 0 ? message : 'Authentication required.' };
    }
    if (status === 409) {
        return {
            kind: 'conflict',
            message: message !== null && message !== void 0 ? message : 'Conflict — another change has been made.',
        };
    }
    if (status === 422) {
        return {
            kind: 'validation',
            message: message !== null && message !== void 0 ? message : 'Invalid data — cannot save.',
        };
    }
    if (status !== undefined && status >= 400) {
        return {
            kind: 'server_error',
            message: message !== null && message !== void 0 ? message : "Server error (".concat(status, ")."),
        };
    }
    // No HTTP status → network-level failure
    return {
        kind: 'network',
        message: message !== null && message !== void 0 ? message : 'Could not reach the server.',
    };
}
function extractStatus(err) {
    if (!err || typeof err !== 'object')
        return undefined;
    // ApiResponseError (thrown by customFetch) — most reliable
    if (err instanceof customFetch_1.ApiResponseError)
        return err.status;
    // Direct `.status` property (set by callers or legacy paths)
    if ('status' in err &&
        typeof err.status === 'number') {
        return err.status;
    }
    // Nested `.response.status`
    var resp = err.response;
    if (resp && typeof resp.status === 'number')
        return resp.status;
    // Parse from error message: "Request failed: 401"
    if (err instanceof Error) {
        var m = /Request failed:\s*(\d+)/.exec(err.message);
        if (m)
            return Number(m[1]);
    }
    return undefined;
}
function extractMessage(err) {
    if (!err)
        return undefined;
    if (typeof err === 'string')
        return err;
    // ApiResponseError — check structured body first
    if (err instanceof customFetch_1.ApiResponseError) {
        var data = err.responseData;
        if (data && typeof data === 'object') {
            var detail_1 = data.detail;
            if (typeof detail_1 === 'string')
                return detail_1;
        }
        return err.message;
    }
    if (err instanceof Error)
        return err.message;
    var obj = err;
    // Orval / FastAPI detail field
    var detail = obj.response &&
        typeof obj.response === 'object' &&
        obj.response.data &&
        typeof obj.response.data === 'object'
        ? obj.response.data.detail
        : undefined;
    if (typeof detail === 'string')
        return detail;
    if (typeof obj.message === 'string')
        return obj.message;
    return undefined;
}
// ─── Exponential back-off ─────────────────────────────────────────────────────
/**
 * Return the delay (ms) before the next retry, given the number of attempts
 * already made and the failure kind.
 */
function retryDelay(attempts, _kind) {
    return Math.min(BASE_RETRY_DELAY_MS * Math.pow(2, (attempts - 1)), MAX_RETRY_DELAY_MS);
}
/**
 * Return `true` when a failed item should be retried automatically.
 *
 * - `network` / `server_error`: retry up to `MAX_SERVER_ERROR_ATTEMPTS` times.
 * - `auth`: handled by the repair path (caller provides a `repair` callback).
 * - `conflict` / `validation`: permanent — abandon immediately.
 */
function shouldRetry(item) {
    var failureKind = item.failureKind, attempts = item.attempts, repair = item.repair;
    if (!failureKind)
        return false;
    if (failureKind === 'conflict' || failureKind === 'validation')
        return false;
    if (failureKind === 'auth')
        return !!repair;
    // network / server_error
    return attempts < MAX_SERVER_ERROR_ATTEMPTS;
}
// ─── Module-level singleton state ─────────────────────────────────────────────
// All component instances share the same write queue so the status bar
// (mounted in a footer) can observe operations enqueued by any view.
var _queue = (0, vue_1.ref)([]);
var _abandonedWrites = (0, vue_1.ref)([]);
var _isOnline = (0, vue_1.ref)(typeof navigator !== 'undefined' ? navigator.onLine : true);
/** The most recent successful read operation recorded by `trackRead`. */
var _lastRead = (0, vue_1.ref)(null);
// Map of item.id → timer handle for scheduled retries
var _retryTimers = new Map();
// Map of item.id → AbortController for in-flight requests
var _abortControllers = new Map();
// Wire up online/offline listeners exactly once
if (typeof window !== 'undefined') {
    window.addEventListener('online', function () {
        _isOnline.value = true;
        // Resume any pending items immediately when we come back online
        _queue.value
            .filter(function (item) { return item.status === 'pending' && !_retryTimers.has(item.id); })
            .forEach(function (item) { return scheduleRetry(item, 0); });
    });
    window.addEventListener('offline', function () {
        _isOnline.value = false;
    });
}
// ─── Internal helpers ─────────────────────────────────────────────────────────
function scheduleRetry(item, delayMs) {
    if (_retryTimers.has(item.id))
        return;
    item.nextRetryAt = Date.now() + delayMs;
    var handle = setTimeout(function () {
        _retryTimers.delete(item.id);
        void runItem(item);
    }, delayMs);
    _retryTimers.set(item.id, handle);
}
function runItem(item) {
    return __awaiter(this, void 0, void 0, function () {
        var ac, err_1, _a, kind, message, repairSucceeded, _b, delay;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // Guard: could have been abandoned or already running
                    if (item.status === 'abandoned' || item.status === 'running')
                        return [2 /*return*/];
                    item.status = 'running';
                    item.nextRetryAt = null;
                    item.lastAttemptAt = Date.now();
                    item.attempts += 1;
                    // Trigger Vue reactivity by reassigning the array
                    _queue.value = __spreadArray([], _queue.value, true);
                    ac = new AbortController();
                    _abortControllers.set(item.id, ac);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, 9, 10]);
                    return [4 /*yield*/, item.execute(ac.signal)];
                case 2:
                    _c.sent();
                    item.status = 'success';
                    _queue.value = __spreadArray([], _queue.value, true);
                    // Remove from queue after a brief display window
                    setTimeout(function () {
                        _queue.value = _queue.value.filter(function (w) { return w.id !== item.id; });
                    }, SUCCESS_DISPLAY_MS);
                    return [3 /*break*/, 10];
                case 3:
                    err_1 = _c.sent();
                    if (ac.signal.aborted)
                        return [2 /*return*/];
                    _a = classifyFailure(err_1), kind = _a.kind, message = _a.message;
                    item.failureKind = kind;
                    item.failureMessage = message;
                    if (!(kind === 'auth' && item.repair)) return [3 /*break*/, 8];
                    // Attempt repair (re-login etc.)
                    item.status = 'repairing';
                    _queue.value = __spreadArray([], _queue.value, true);
                    repairSucceeded = false;
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, item.repair(kind)];
                case 5:
                    repairSucceeded = _c.sent();
                    return [3 /*break*/, 7];
                case 6:
                    _b = _c.sent();
                    return [3 /*break*/, 7];
                case 7:
                    if (repairSucceeded) {
                        item.status = 'pending';
                        _queue.value = __spreadArray([], _queue.value, true);
                        scheduleRetry(item, 0);
                        return [2 /*return*/];
                    }
                    // Repair failed — abandon immediately without going through shouldRetry
                    abandonItem(item, 'Abandoned: authentication failed — please log in and try again.');
                    return [2 /*return*/];
                case 8:
                    if (shouldRetry(item)) {
                        delay = retryDelay(item.attempts, kind);
                        item.status = 'pending';
                        _queue.value = __spreadArray([], _queue.value, true);
                        scheduleRetry(item, delay);
                    }
                    else {
                        abandonItem(item, kind === 'conflict'
                            ? 'Abandoned: a conflicting change was already saved.'
                            : kind === 'validation'
                                ? 'Abandoned: the data was invalid and cannot be saved.'
                                : kind === 'auth'
                                    ? 'Abandoned: authentication failed — please log in and try again.'
                                    : "Abandoned after ".concat(item.attempts, " attempts: ").concat(message));
                    }
                    return [3 /*break*/, 10];
                case 9:
                    _abortControllers.delete(item.id);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function abandonItem(item, note) {
    item.status = 'abandoned';
    item.abandonNote = note;
    _queue.value = __spreadArray([], _queue.value, true);
    _abandonedWrites.value = __spreadArray(__spreadArray([], _abandonedWrites.value, true), [
        { id: item.id, label: item.label, note: note, at: Date.now() },
    ], false);
    // Remove from the active queue after ABANDONED_DISPLAY_MS
    setTimeout(function () {
        _queue.value = _queue.value.filter(function (w) { return w.id !== item.id; });
    }, ABANDONED_DISPLAY_MS);
}
// ─── Public composable ────────────────────────────────────────────────────────
/**
 * `useApi` — application-wide API status context.
 *
 * Exposes:
 * - `isOnline`: whether the browser reports network connectivity.
 * - `queue`: reactive list of all queued write operations and their status.
 * - `pendingCount`: number of writes not yet succeeded/abandoned.
 * - `hasFailure`: true when any write is in a failed/retrying state.
 * - `abandonedWrites`: list of recently abandoned writes with explanatory notes.
 * - `lastRead`: the most recent read operation tracked by `trackRead`, or null.
 * - `enqueue(item)`: add a write to the queue and execute it immediately.
 * - `abandon(id)`: manually abandon a queued write by id.
 * - `retry(id)`: manually trigger an immediate retry for a pending item.
 * - `clearAbandoned()`: dismiss all abandoned write notices.
 * - `trackRead(label)`: record that a read (GET) was just performed.
 */
function useApi() {
    var queue = (0, vue_1.computed)(function () { return _queue.value; });
    var isOnline = (0, vue_1.computed)(function () { return _isOnline.value; });
    var lastRead = (0, vue_1.computed)(function () { return _lastRead.value; });
    var pendingCount = (0, vue_1.computed)(function () {
        return _queue.value.filter(function (w) {
            return w.status === 'pending' ||
                w.status === 'running' ||
                w.status === 'repairing';
        }).length;
    });
    var hasFailure = (0, vue_1.computed)(function () {
        return _queue.value.some(function (w) {
            return w.status === 'pending' &&
                w.failureKind !== null &&
                w.failureKind !== undefined;
        });
    });
    var abandonedWrites = (0, vue_1.computed)(function () { return _abandonedWrites.value; });
    /**
     * Add a write to the queue and start executing it immediately.
     *
     * If an item with the same `id` is already in the queue it is replaced
     * (label may have changed).
     */
    function enqueue(item) {
        // Cancel and remove any existing item with the same id
        var existing = _queue.value.find(function (w) { return w.id === item.id; });
        if (existing) {
            abandon(item.id);
        }
        var entry = {
            id: item.id,
            label: item.label,
            execute: item.execute,
            repair: item.repair,
            status: 'pending',
            attempts: 0,
            lastAttemptAt: null,
            nextRetryAt: null,
            failureKind: null,
            failureMessage: null,
            abandonNote: null,
        };
        _queue.value = __spreadArray(__spreadArray([], _queue.value, true), [entry], false);
        void runItem(entry);
    }
    /**
     * Manually abandon a queued write.  The abort signal for any in-flight
     * request is triggered.
     */
    function abandon(id, note) {
        if (note === void 0) { note = 'Manually abandoned.'; }
        var item = _queue.value.find(function (w) { return w.id === id; });
        if (!item)
            return;
        // Cancel any scheduled retry
        var timer = _retryTimers.get(id);
        if (timer !== undefined) {
            clearTimeout(timer);
            _retryTimers.delete(id);
        }
        // Abort any in-flight request
        var ac = _abortControllers.get(id);
        if (ac) {
            ac.abort();
            _abortControllers.delete(id);
        }
        abandonItem(item, note);
    }
    /**
     * Manually trigger an immediate retry for a pending item.
     */
    function retry(id) {
        var item = _queue.value.find(function (w) { return w.id === id; });
        if (!item || item.status === 'running' || item.status === 'repairing')
            return;
        if (item.status === 'abandoned')
            return;
        // Cancel any scheduled timer so we run immediately
        var timer = _retryTimers.get(id);
        if (timer !== undefined) {
            clearTimeout(timer);
            _retryTimers.delete(id);
        }
        item.status = 'pending';
        _queue.value = __spreadArray([], _queue.value, true);
        void runItem(item);
    }
    /** Dismiss all abandoned write notices. */
    function clearAbandoned() {
        _abandonedWrites.value = [];
    }
    /**
     * Record that a read (GET) operation just completed successfully.
     * This updates `lastRead` so the status bar can display "Last read: X".
     *
     * Call this after any successful data fetch that is meaningful to surface.
     */
    function trackRead(label) {
        _lastRead.value = { label: label, at: Date.now() };
    }
    return {
        isOnline: (0, vue_1.readonly)(isOnline),
        queue: (0, vue_1.readonly)(queue),
        pendingCount: (0, vue_1.readonly)(pendingCount),
        hasFailure: (0, vue_1.readonly)(hasFailure),
        abandonedWrites: (0, vue_1.readonly)(abandonedWrites),
        lastRead: (0, vue_1.readonly)(lastRead),
        enqueue: enqueue,
        abandon: abandon,
        retry: retry,
        clearAbandoned: clearAbandoned,
        trackRead: trackRead,
    };
}
/**
 * Reset all singleton state.  Call in Storybook `prepareStoryEnvironment`
 * or between tests so each scenario starts clean.
 */
function resetApiState() {
    // Abort all in-flight requests
    _abortControllers.forEach(function (ac) { return ac.abort(); });
    _abortControllers.clear();
    // Clear all retry timers
    _retryTimers.forEach(function (handle) { return clearTimeout(handle); });
    _retryTimers.clear();
    _queue.value = [];
    _abandonedWrites.value = [];
    _lastRead.value = null;
    _isOnline.value = typeof navigator !== 'undefined' ? navigator.onLine : true;
}
