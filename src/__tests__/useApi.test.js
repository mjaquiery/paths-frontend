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
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var vue_1 = require("vue");
var customFetch_1 = require("../lib/customFetch");
var useApi_1 = require("../composables/useApi");
// ─── classifyFailure ─────────────────────────────────────────────────────────
(0, vitest_1.describe)('classifyFailure', function () {
    (0, vitest_1.it)('classifies ApiResponseError 401 as auth', function () {
        var err = new customFetch_1.ApiResponseError(401, null);
        (0, vitest_1.expect)((0, useApi_1.classifyFailure)(err).kind).toBe('auth');
    });
    (0, vitest_1.it)('classifies ApiResponseError 403 as auth', function () {
        var err = new customFetch_1.ApiResponseError(403, null);
        (0, vitest_1.expect)((0, useApi_1.classifyFailure)(err).kind).toBe('auth');
    });
    (0, vitest_1.it)('classifies ApiResponseError 409 as conflict', function () {
        var err = new customFetch_1.ApiResponseError(409, null);
        (0, vitest_1.expect)((0, useApi_1.classifyFailure)(err).kind).toBe('conflict');
    });
    (0, vitest_1.it)('classifies ApiResponseError 422 as validation', function () {
        var err = new customFetch_1.ApiResponseError(422, null);
        (0, vitest_1.expect)((0, useApi_1.classifyFailure)(err).kind).toBe('validation');
    });
    (0, vitest_1.it)('classifies ApiResponseError 500 as server_error', function () {
        var err = new customFetch_1.ApiResponseError(500, null);
        (0, vitest_1.expect)((0, useApi_1.classifyFailure)(err).kind).toBe('server_error');
    });
    (0, vitest_1.it)('classifies a plain Error (no status) as network', function () {
        var err = new Error('fetch failed');
        (0, vitest_1.expect)((0, useApi_1.classifyFailure)(err).kind).toBe('network');
    });
    (0, vitest_1.it)('classifies a TypeError (offline) as network', function () {
        var err = new TypeError('Failed to fetch');
        (0, vitest_1.expect)((0, useApi_1.classifyFailure)(err).kind).toBe('network');
    });
    (0, vitest_1.it)('extracts a FastAPI detail string from ApiResponseError body', function () {
        var err = new customFetch_1.ApiResponseError(422, { detail: 'Field required' });
        var result = (0, useApi_1.classifyFailure)(err);
        (0, vitest_1.expect)(result.kind).toBe('validation');
        (0, vitest_1.expect)(result.message).toBe('Field required');
    });
    (0, vitest_1.it)('parses legacy "Request failed: 403" error messages', function () {
        var err = new Error('Request failed: 403');
        (0, vitest_1.expect)((0, useApi_1.classifyFailure)(err).kind).toBe('auth');
    });
    (0, vitest_1.it)('parses legacy "Request failed: 409" error messages', function () {
        var err = new Error('Request failed: 409');
        (0, vitest_1.expect)((0, useApi_1.classifyFailure)(err).kind).toBe('conflict');
    });
    (0, vitest_1.it)('handles objects with a nested response.status', function () {
        var err = { response: { status: 500 } };
        (0, vitest_1.expect)((0, useApi_1.classifyFailure)(err).kind).toBe('server_error');
    });
    (0, vitest_1.it)('handles null gracefully', function () {
        (0, vitest_1.expect)((0, useApi_1.classifyFailure)(null).kind).toBe('network');
    });
});
// ─── retryDelay ──────────────────────────────────────────────────────────────
(0, vitest_1.describe)('retryDelay', function () {
    (0, vitest_1.it)('returns BASE_RETRY_DELAY_MS for the first attempt', function () {
        // attempts = 1 → 5000 * 2^0 = 5000
        (0, vitest_1.expect)((0, useApi_1.retryDelay)(1, 'network')).toBe(5000);
    });
    (0, vitest_1.it)('doubles for each subsequent attempt', function () {
        (0, vitest_1.expect)((0, useApi_1.retryDelay)(2, 'network')).toBe(10000);
        (0, vitest_1.expect)((0, useApi_1.retryDelay)(3, 'network')).toBe(20000);
        (0, vitest_1.expect)((0, useApi_1.retryDelay)(4, 'network')).toBe(40000);
    });
    (0, vitest_1.it)('caps at MAX_RETRY_DELAY_MS (60 s)', function () {
        (0, vitest_1.expect)((0, useApi_1.retryDelay)(10, 'network')).toBe(60000);
    });
});
// ─── shouldRetry ─────────────────────────────────────────────────────────────
(0, vitest_1.describe)('shouldRetry', function () {
    (0, vitest_1.it)('retries network failures when attempts < 5', function () {
        (0, vitest_1.expect)((0, useApi_1.shouldRetry)({ failureKind: 'network', attempts: 1, repair: undefined })).toBe(true);
    });
    (0, vitest_1.it)('stops retrying network failures after 5 attempts', function () {
        (0, vitest_1.expect)((0, useApi_1.shouldRetry)({ failureKind: 'network', attempts: 5, repair: undefined })).toBe(false);
    });
    (0, vitest_1.it)('does not retry conflict failures', function () {
        (0, vitest_1.expect)((0, useApi_1.shouldRetry)({ failureKind: 'conflict', attempts: 1, repair: undefined })).toBe(false);
    });
    (0, vitest_1.it)('does not retry validation failures', function () {
        (0, vitest_1.expect)((0, useApi_1.shouldRetry)({
            failureKind: 'validation',
            attempts: 1,
            repair: undefined,
        })).toBe(false);
    });
    (0, vitest_1.it)('retries auth failures when a repair callback is provided', function () {
        (0, vitest_1.expect)((0, useApi_1.shouldRetry)({
            failureKind: 'auth',
            attempts: 1,
            repair: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, true];
            }); }); },
        })).toBe(true);
    });
    (0, vitest_1.it)('does not retry auth failures without a repair callback', function () {
        (0, vitest_1.expect)((0, useApi_1.shouldRetry)({ failureKind: 'auth', attempts: 1, repair: undefined })).toBe(false);
    });
});
// ─── useApi ──────────────────────────────────────────────────────────────────
(0, vitest_1.describe)('useApi', function () {
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.useFakeTimers();
        (0, useApi_1.resetApiState)();
    });
    (0, vitest_1.afterEach)(function () {
        vitest_1.vi.useRealTimers();
        (0, useApi_1.resetApiState)();
    });
    (0, vitest_1.it)('starts with an empty queue and no abandoned writes', function () {
        var _a = (0, useApi_1.useApi)(), queue = _a.queue, pendingCount = _a.pendingCount, abandonedWrites = _a.abandonedWrites;
        (0, vitest_1.expect)(queue.value).toHaveLength(0);
        (0, vitest_1.expect)(pendingCount.value).toBe(0);
        (0, vitest_1.expect)(abandonedWrites.value).toHaveLength(0);
    });
    (0, vitest_1.it)('enqueue executes the operation immediately and transitions to success', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, queue, enqueue, execute;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = (0, useApi_1.useApi)(), queue = _a.queue, enqueue = _a.enqueue;
                    execute = vitest_1.vi.fn().mockResolvedValue('ok');
                    enqueue({ id: 'w1', label: 'Test write', execute: execute });
                    // Running state
                    (0, vitest_1.expect)((_b = queue.value[0]) === null || _b === void 0 ? void 0 : _b.status).toBe('running');
                    // Flush the promise microtasks so execute resolves and status becomes 'success',
                    // but do NOT advance timers yet (that would fire the SUCCESS_DISPLAY_MS cleanup).
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    // Flush the promise microtasks so execute resolves and status becomes 'success',
                    // but do NOT advance timers yet (that would fire the SUCCESS_DISPLAY_MS cleanup).
                    _d.sent();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 2:
                    _d.sent();
                    (0, vitest_1.expect)(execute).toHaveBeenCalledOnce();
                    // After success the item stays visible briefly before being cleaned up
                    (0, vitest_1.expect)((_c = queue.value[0]) === null || _c === void 0 ? void 0 : _c.status).toBe('success');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('removes a succeeded item after SUCCESS_DISPLAY_MS', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, queue, enqueue;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = (0, useApi_1.useApi)(), queue = _a.queue, enqueue = _a.enqueue;
                    enqueue({
                        id: 'w1',
                        label: 'Test',
                        execute: vitest_1.vi.fn().mockResolvedValue('ok'),
                    });
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, vitest_1.vi.runAllTimersAsync()];
                case 2:
                    _b.sent();
                    (0, vitest_1.expect)(queue.value).toHaveLength(0);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('retries a network failure with exponential back-off', function () { return __awaiter(void 0, void 0, void 0, function () {
        var execute, _a, queue, enqueue;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    execute = vitest_1.vi
                        .fn()
                        .mockRejectedValueOnce(new Error('fetch failed'))
                        .mockResolvedValue('ok');
                    _a = (0, useApi_1.useApi)(), queue = _a.queue, enqueue = _a.enqueue;
                    enqueue({ id: 'w1', label: 'Net write', execute: execute });
                    // First attempt fails
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    // First attempt fails
                    _d.sent();
                    (0, vitest_1.expect)(execute).toHaveBeenCalledTimes(1);
                    (0, vitest_1.expect)((_b = queue.value[0]) === null || _b === void 0 ? void 0 : _b.status).toBe('pending');
                    (0, vitest_1.expect)((_c = queue.value[0]) === null || _c === void 0 ? void 0 : _c.failureKind).toBe('network');
                    // Advance past the first retry delay (5 s)
                    return [4 /*yield*/, vitest_1.vi.advanceTimersByTimeAsync(5001)];
                case 2:
                    // Advance past the first retry delay (5 s)
                    _d.sent();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 3:
                    _d.sent();
                    (0, vitest_1.expect)(execute).toHaveBeenCalledTimes(2);
                    return [4 /*yield*/, vitest_1.vi.runAllTimersAsync()];
                case 4:
                    _d.sent();
                    (0, vitest_1.expect)(queue.value).toHaveLength(0);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('abandons a conflict failure immediately', function () { return __awaiter(void 0, void 0, void 0, function () {
        var execute, _a, queue, abandonedWrites, enqueue;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    execute = vitest_1.vi.fn().mockRejectedValue(new customFetch_1.ApiResponseError(409, null));
                    _a = (0, useApi_1.useApi)(), queue = _a.queue, abandonedWrites = _a.abandonedWrites, enqueue = _a.enqueue;
                    enqueue({ id: 'w1', label: 'Conflict write', execute: execute });
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _d.sent();
                    (0, vitest_1.expect)((_b = queue.value[0]) === null || _b === void 0 ? void 0 : _b.status).toBe('abandoned');
                    (0, vitest_1.expect)(abandonedWrites.value).toHaveLength(1);
                    (0, vitest_1.expect)((_c = abandonedWrites.value[0]) === null || _c === void 0 ? void 0 : _c.note).toMatch(/conflict/i);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('abandons a validation failure immediately', function () { return __awaiter(void 0, void 0, void 0, function () {
        var execute, _a, abandonedWrites, enqueue;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    execute = vitest_1.vi
                        .fn()
                        .mockRejectedValue(new customFetch_1.ApiResponseError(422, { detail: 'Bad field' }));
                    _a = (0, useApi_1.useApi)(), abandonedWrites = _a.abandonedWrites, enqueue = _a.enqueue;
                    enqueue({ id: 'w1', label: 'Invalid write', execute: execute });
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _c.sent();
                    (0, vitest_1.expect)(abandonedWrites.value).toHaveLength(1);
                    (0, vitest_1.expect)((_b = abandonedWrites.value[0]) === null || _b === void 0 ? void 0 : _b.note).toMatch(/invalid/i);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('calls the repair callback on auth failure and retries if repair succeeds', function () { return __awaiter(void 0, void 0, void 0, function () {
        var execute, repair, _a, queue, enqueue;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    execute = vitest_1.vi
                        .fn()
                        .mockRejectedValueOnce(new customFetch_1.ApiResponseError(401, null))
                        .mockResolvedValue('ok');
                    repair = vitest_1.vi.fn().mockResolvedValue(true);
                    _a = (0, useApi_1.useApi)(), queue = _a.queue, enqueue = _a.enqueue;
                    enqueue({ id: 'w1', label: 'Auth write', execute: execute, repair: repair });
                    // First attempt fails → repairing
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    // First attempt fails → repairing
                    _b.sent();
                    (0, vitest_1.expect)(repair).toHaveBeenCalledOnce();
                    // After repair, retry runs immediately
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 2:
                    // After repair, retry runs immediately
                    _b.sent();
                    return [4 /*yield*/, vitest_1.vi.runAllTimersAsync()];
                case 3:
                    _b.sent();
                    (0, vitest_1.expect)(execute).toHaveBeenCalledTimes(2);
                    (0, vitest_1.expect)(queue.value).toHaveLength(0); // cleaned up
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('abandons on auth failure when repair returns false', function () { return __awaiter(void 0, void 0, void 0, function () {
        var execute, repair, _a, abandonedWrites, enqueue;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    execute = vitest_1.vi.fn().mockRejectedValue(new customFetch_1.ApiResponseError(401, null));
                    repair = vitest_1.vi.fn().mockResolvedValue(false);
                    _a = (0, useApi_1.useApi)(), abandonedWrites = _a.abandonedWrites, enqueue = _a.enqueue;
                    enqueue({ id: 'w1', label: 'Auth write', execute: execute, repair: repair });
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 2:
                    _c.sent();
                    (0, vitest_1.expect)(abandonedWrites.value).toHaveLength(1);
                    (0, vitest_1.expect)((_b = abandonedWrites.value[0]) === null || _b === void 0 ? void 0 : _b.note).toMatch(/auth/i);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('abandon() manually removes an item from the queue', function () { return __awaiter(void 0, void 0, void 0, function () {
        var resolveExecute, execute, _a, queue, enqueue, abandon;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    execute = vitest_1.vi.fn(function () {
                        return new Promise(function (resolve) {
                            resolveExecute = resolve;
                        });
                    });
                    _a = (0, useApi_1.useApi)(), queue = _a.queue, enqueue = _a.enqueue, abandon = _a.abandon;
                    enqueue({ id: 'w1', label: 'Long write', execute: execute });
                    (0, vitest_1.expect)(queue.value).toHaveLength(1);
                    abandon('w1', 'Manual cancel');
                    resolveExecute === null || resolveExecute === void 0 ? void 0 : resolveExecute(); // resolve the promise so no unhandled rejection
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, vitest_1.vi.runAllTimersAsync()];
                case 2:
                    _b.sent();
                    (0, vitest_1.expect)(queue.value.find(function (w) { return w.id === 'w1' && w.status !== 'abandoned'; })).toBeUndefined();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('retry() triggers an immediate re-attempt', function () { return __awaiter(void 0, void 0, void 0, function () {
        var execute, _a, queue, enqueue, retry;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    execute = vitest_1.vi
                        .fn()
                        .mockRejectedValueOnce(new Error('first fail'))
                        .mockResolvedValue('ok');
                    _a = (0, useApi_1.useApi)(), queue = _a.queue, enqueue = _a.enqueue, retry = _a.retry;
                    enqueue({ id: 'w1', label: 'Retry write', execute: execute });
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _c.sent();
                    // Failed — waiting for scheduled retry
                    (0, vitest_1.expect)((_b = queue.value[0]) === null || _b === void 0 ? void 0 : _b.failureKind).toBe('network');
                    // Trigger an immediate retry rather than waiting for the timer
                    retry('w1');
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, vitest_1.vi.runAllTimersAsync()];
                case 3:
                    _c.sent();
                    (0, vitest_1.expect)(execute).toHaveBeenCalledTimes(2);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('clearAbandoned() removes all abandoned write notices', function () { return __awaiter(void 0, void 0, void 0, function () {
        var execute, _a, abandonedWrites, enqueue, clearAbandoned;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    execute = vitest_1.vi.fn().mockRejectedValue(new customFetch_1.ApiResponseError(409, null));
                    _a = (0, useApi_1.useApi)(), abandonedWrites = _a.abandonedWrites, enqueue = _a.enqueue, clearAbandoned = _a.clearAbandoned;
                    enqueue({ id: 'w1', label: 'w1', execute: execute });
                    enqueue({ id: 'w2', label: 'w2', execute: execute });
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _b.sent();
                    (0, vitest_1.expect)(abandonedWrites.value.length).toBeGreaterThanOrEqual(1);
                    clearAbandoned();
                    (0, vitest_1.expect)(abandonedWrites.value).toHaveLength(0);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('hasFailure is true when a pending item has a failure kind', function () { return __awaiter(void 0, void 0, void 0, function () {
        var execute, _a, hasFailure, enqueue;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    execute = vitest_1.vi
                        .fn()
                        .mockRejectedValueOnce(new Error('fetch failed'))
                        .mockResolvedValue('ok');
                    _a = (0, useApi_1.useApi)(), hasFailure = _a.hasFailure, enqueue = _a.enqueue;
                    enqueue({ id: 'w1', label: 'Failing write', execute: execute });
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _b.sent();
                    (0, vitest_1.expect)(hasFailure.value).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('replaces an existing queue item when enqueue is called with the same id', function () { return __awaiter(void 0, void 0, void 0, function () {
        var stall, execute1, execute2, _a, queue, enqueue;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    execute1 = vitest_1.vi.fn(function () {
                        return new Promise(function (res) {
                            stall = res;
                        });
                    });
                    execute2 = vitest_1.vi.fn().mockResolvedValue('ok');
                    _a = (0, useApi_1.useApi)(), queue = _a.queue, enqueue = _a.enqueue;
                    enqueue({ id: 'w1', label: 'First', execute: execute1 });
                    (0, vitest_1.expect)(queue.value).toHaveLength(1);
                    // Enqueue a replacement — should displace the first
                    enqueue({ id: 'w1', label: 'Second', execute: execute2 });
                    stall === null || stall === void 0 ? void 0 : stall();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, vitest_1.vi.runAllTimersAsync()];
                case 2:
                    _b.sent();
                    (0, vitest_1.expect)(execute2).toHaveBeenCalledOnce();
                    return [2 /*return*/];
            }
        });
    }); });
});
