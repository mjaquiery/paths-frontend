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
var vue_query_1 = require("@tanstack/vue-query");
var test_utils_1 = require("@vue/test-utils");
var useRefreshStatus_1 = require("../composables/useRefreshStatus");
var useApi_1 = require("../composables/useApi");
// ─── helpers ────────────────────────────────────────────────────────────────
function createQueryClient() {
    return new vue_query_1.QueryClient({ defaultOptions: { queries: { retry: false } } });
}
function mountWithStatus(queryClient) {
    var exposed;
    var TestComponent = (0, vue_1.defineComponent)({
        setup: function () {
            exposed = (0, useRefreshStatus_1.useRefreshStatus)();
            return {};
        },
        template: '<div></div>',
    });
    var wrapper = (0, test_utils_1.mount)(TestComponent, {
        global: { plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]] },
    });
    return { wrapper: wrapper, exposed: exposed };
}
// ─── formatRelativeTime ─────────────────────────────────────────────────────
(0, vitest_1.describe)('formatRelativeTime', function () {
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.useFakeTimers();
    });
    (0, vitest_1.afterEach)(function () {
        vitest_1.vi.useRealTimers();
    });
    (0, vitest_1.it)('returns "just now" for dates fewer than 10 seconds ago', function () {
        var now = new Date();
        vitest_1.vi.setSystemTime(now);
        var d = new Date(now.getTime() - 5000);
        (0, vitest_1.expect)((0, useRefreshStatus_1.formatRelativeTime)(d)).toBe('just now');
    });
    (0, vitest_1.it)('returns seconds for dates between 10 and 59 seconds ago', function () {
        var now = new Date();
        vitest_1.vi.setSystemTime(now);
        var d = new Date(now.getTime() - 30000);
        (0, vitest_1.expect)((0, useRefreshStatus_1.formatRelativeTime)(d)).toBe('30s ago');
    });
    (0, vitest_1.it)('returns minutes for dates between 1 and 59 minutes ago', function () {
        var now = new Date();
        vitest_1.vi.setSystemTime(now);
        var d = new Date(now.getTime() - 3 * 60000);
        (0, vitest_1.expect)((0, useRefreshStatus_1.formatRelativeTime)(d)).toBe('3m ago');
    });
    (0, vitest_1.it)('returns hours for dates 60+ minutes ago', function () {
        var now = new Date();
        vitest_1.vi.setSystemTime(now);
        var d = new Date(now.getTime() - 2 * 3600000);
        (0, vitest_1.expect)((0, useRefreshStatus_1.formatRelativeTime)(d)).toBe('2h ago');
    });
});
// ─── useRefreshStatus ───────────────────────────────────────────────────────
(0, vitest_1.describe)('useRefreshStatus', function () {
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.useFakeTimers();
        // Reset the useApi singleton so _lastRead (and other state) doesn't leak
        // between tests — it is module-level and persists across test cases.
        (0, useApi_1.resetApiState)();
        // Reset useRefreshStatus module-level state (_hasError) for the same reason.
        (0, useRefreshStatus_1.resetRefreshStatusState)();
    });
    (0, vitest_1.afterEach)(function () {
        vitest_1.vi.useRealTimers();
        vitest_1.vi.restoreAllMocks();
    });
    (0, vitest_1.it)('starts with statusType "ok" when online', function () { return __awaiter(void 0, void 0, void 0, function () {
        var queryClient, _a, wrapper, exposed;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    queryClient = createQueryClient();
                    _a = mountWithStatus(queryClient), wrapper = _a.wrapper, exposed = _a.exposed;
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _b.sent();
                    (0, vitest_1.expect)(exposed.isOnline.value).toBe(true);
                    (0, vitest_1.expect)(exposed.statusType.value).toBe('ok');
                    wrapper.unmount();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('switches statusType to "offline" on the offline event', function () { return __awaiter(void 0, void 0, void 0, function () {
        var queryClient, _a, wrapper, exposed;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    queryClient = createQueryClient();
                    _a = mountWithStatus(queryClient), wrapper = _a.wrapper, exposed = _a.exposed;
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _b.sent();
                    window.dispatchEvent(new Event('offline'));
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 2:
                    _b.sent();
                    (0, vitest_1.expect)(exposed.isOnline.value).toBe(false);
                    (0, vitest_1.expect)(exposed.statusType.value).toBe('offline');
                    (0, vitest_1.expect)(exposed.statusText.value).toBe('Offline');
                    wrapper.unmount();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('switches back to "ok" on the online event', function () { return __awaiter(void 0, void 0, void 0, function () {
        var queryClient, _a, wrapper, exposed;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    queryClient = createQueryClient();
                    _a = mountWithStatus(queryClient), wrapper = _a.wrapper, exposed = _a.exposed;
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _b.sent();
                    window.dispatchEvent(new Event('offline'));
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 2:
                    _b.sent();
                    window.dispatchEvent(new Event('online'));
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 3:
                    _b.sent();
                    (0, vitest_1.expect)(exposed.isOnline.value).toBe(true);
                    (0, vitest_1.expect)(exposed.statusType.value).toBe('ok');
                    wrapper.unmount();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('updates lastCheckedAt when an entry-list query succeeds', function () { return __awaiter(void 0, void 0, void 0, function () {
        var queryClient, _a, wrapper, exposed, now;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    queryClient = createQueryClient();
                    _a = mountWithStatus(queryClient), wrapper = _a.wrapper, exposed = _a.exposed;
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _b.sent();
                    (0, vitest_1.expect)(exposed.lastCheckedAt.value).toBeNull();
                    now = new Date();
                    vitest_1.vi.setSystemTime(now);
                    // Simulate a successful entry-list query result being written to cache
                    queryClient.setQueryData(['v1', 'paths', 'p1', 'entries'], { data: [] });
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 2:
                    _b.sent();
                    (0, vitest_1.expect)(exposed.lastCheckedAt.value).not.toBeNull();
                    wrapper.unmount();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('sets hasError when an entry-list query errors', function () { return __awaiter(void 0, void 0, void 0, function () {
        var queryClient, _a, wrapper, exposed;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    queryClient = new vue_query_1.QueryClient({
                        defaultOptions: { queries: { retry: false } },
                    });
                    _a = mountWithStatus(queryClient), wrapper = _a.wrapper, exposed = _a.exposed;
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _b.sent();
                    // prefetchQuery swallows errors but transitions the query to 'error' state,
                    // which triggers the cache subscription with query.state.status === 'error'.
                    return [4 /*yield*/, queryClient.prefetchQuery({
                            queryKey: ['v1', 'paths', 'p1', 'entries'],
                            queryFn: function () { return Promise.reject(new Error('API down')); },
                            retry: false,
                        })];
                case 2:
                    // prefetchQuery swallows errors but transitions the query to 'error' state,
                    // which triggers the cache subscription with query.state.status === 'error'.
                    _b.sent();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 3:
                    _b.sent();
                    (0, vitest_1.expect)(exposed.hasError.value).toBe(true);
                    (0, vitest_1.expect)(exposed.statusType.value).toBe('error');
                    (0, vitest_1.expect)(exposed.statusText.value).toBe('Unable to connect');
                    wrapper.unmount();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('seeds lastCheckedAt from an already-successful cached query on mount', function () { return __awaiter(void 0, void 0, void 0, function () {
        var queryClient, _a, wrapper, exposed;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    queryClient = createQueryClient();
                    // Pre-populate a successful entry-list query in the cache
                    queryClient.setQueryData(['v1', 'paths', 'p1', 'entries'], { data: [] });
                    _a = mountWithStatus(queryClient), wrapper = _a.wrapper, exposed = _a.exposed;
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _b.sent();
                    // Should have seeded lastCheckedAt from the existing cache entry
                    (0, vitest_1.expect)(exposed.lastCheckedAt.value).not.toBeNull();
                    wrapper.unmount();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('returns empty statusText when there is no lastCheckedAt and status is ok', function () { return __awaiter(void 0, void 0, void 0, function () {
        var queryClient, _a, wrapper, exposed;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    queryClient = createQueryClient();
                    _a = mountWithStatus(queryClient), wrapper = _a.wrapper, exposed = _a.exposed;
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _b.sent();
                    (0, vitest_1.expect)(exposed.lastCheckedAt.value).toBeNull();
                    (0, vitest_1.expect)(exposed.statusText.value).toBe('');
                    wrapper.unmount();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('cleans up the query cache subscription on unmount', function () { return __awaiter(void 0, void 0, void 0, function () {
        var queryClient, cache, originalSubscribe, capturedUnsubscribe, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    queryClient = createQueryClient();
                    cache = queryClient.getQueryCache();
                    originalSubscribe = cache.subscribe.bind(cache);
                    capturedUnsubscribe = null;
                    vitest_1.vi.spyOn(cache, 'subscribe').mockImplementation(function (listener) {
                        var unsubscribe = originalSubscribe(listener);
                        capturedUnsubscribe = vitest_1.vi.fn(function () { return unsubscribe(); });
                        return capturedUnsubscribe;
                    });
                    wrapper = mountWithStatus(queryClient).wrapper;
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(capturedUnsubscribe).not.toBeNull();
                    wrapper.unmount();
                    (0, vitest_1.expect)(capturedUnsubscribe).toHaveBeenCalledOnce();
                    return [2 /*return*/];
            }
        });
    }); });
});
