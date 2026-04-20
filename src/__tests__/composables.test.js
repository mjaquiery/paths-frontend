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
var vue_2 = require("vue");
var usePaths_1 = require("../composables/usePaths");
var useEntries_1 = require("../composables/useEntries");
var useMultiPathEntries_1 = require("../composables/useMultiPathEntries");
vitest_1.vi.mock('../lib/customFetch', function () { return ({
    customFetch: vitest_1.vi.fn(),
}); });
// Mock Dexie db used by useMultiPathEntries
vitest_1.vi.mock('../lib/db', function () { return ({
    db: {
        entryContent: {
            get: vitest_1.vi.fn().mockResolvedValue(undefined),
            put: vitest_1.vi.fn().mockResolvedValue(undefined),
        },
        entryImages: {
            where: vitest_1.vi.fn().mockReturnValue({
                equals: vitest_1.vi.fn().mockReturnValue({
                    toArray: vitest_1.vi.fn().mockResolvedValue([]),
                    delete: vitest_1.vi.fn().mockResolvedValue(0),
                }),
            }),
            bulkPut: vitest_1.vi.fn().mockResolvedValue(undefined),
        },
        pathPreferences: {},
        queryCache: {},
    },
    isPathHidden: vitest_1.vi.fn().mockResolvedValue(false),
    setPathHidden: vitest_1.vi.fn().mockResolvedValue(undefined),
    getPathOrder: vitest_1.vi.fn().mockReturnValue([]),
    setPathOrder: vitest_1.vi.fn(),
}); });
var customFetch_1 = require("../lib/customFetch");
function createQueryClient() {
    return new vue_query_1.QueryClient({ defaultOptions: { queries: { retry: false } } });
}
(0, vitest_1.describe)('usePaths', function () {
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
        vitest_1.vi.mocked(customFetch_1.customFetch).mockResolvedValue({
            data: [],
            status: 200,
            headers: new Headers(),
        });
    });
    (0, vitest_1.it)('fetches paths from the API', function () { return __awaiter(void 0, void 0, void 0, function () {
        var queryClient, TestComponent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    queryClient = createQueryClient();
                    TestComponent = (0, vue_2.defineComponent)({
                        setup: function () {
                            (0, usePaths_1.usePaths)();
                            return {};
                        },
                        template: '<div></div>',
                    });
                    (0, test_utils_1.mount)(TestComponent, {
                        global: { plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]] },
                    });
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(vitest_1.vi.mocked(customFetch_1.customFetch)).toHaveBeenCalledWith('/v1/paths', vitest_1.expect.objectContaining({ method: 'GET' }));
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('useEntries', function () {
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
        vitest_1.vi.mocked(customFetch_1.customFetch).mockResolvedValue({
            data: [],
            status: 200,
            headers: new Headers(),
        });
    });
    (0, vitest_1.it)('does not call API when pathId is empty', function () {
        var pathId = (0, vue_1.ref)('');
        var queryClient = createQueryClient();
        var TestComponent = (0, vue_2.defineComponent)({
            setup: function () {
                (0, useEntries_1.useEntries)(pathId);
                return {};
            },
            template: '<div></div>',
        });
        (0, test_utils_1.mount)(TestComponent, {
            global: { plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]] },
        });
        (0, vitest_1.expect)(vitest_1.vi.mocked(customFetch_1.customFetch)).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('fetches entries when pathId is set', function () { return __awaiter(void 0, void 0, void 0, function () {
        var pathId, queryClient, TestComponent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.mocked(customFetch_1.customFetch).mockResolvedValue({
                        data: [{ id: 'e1', path_id: 'p1', day: '2024-01-01', edit_id: 1 }],
                        status: 200,
                        headers: new Headers(),
                    });
                    pathId = (0, vue_1.ref)('p1');
                    queryClient = createQueryClient();
                    TestComponent = (0, vue_2.defineComponent)({
                        setup: function () {
                            (0, useEntries_1.useEntries)(pathId);
                            return {};
                        },
                        template: '<div></div>',
                    });
                    (0, test_utils_1.mount)(TestComponent, {
                        global: { plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]] },
                    });
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(vitest_1.vi.mocked(customFetch_1.customFetch)).toHaveBeenCalledWith('/v1/paths/p1/entries', vitest_1.expect.objectContaining({ method: 'GET' }));
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('useEntryContent', function () {
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
        vitest_1.vi.mocked(customFetch_1.customFetch).mockResolvedValue({
            data: {
                id: 'e1',
                path_id: 'p1',
                day: '2024-01-01',
                edit_id: 1,
                content: 'hello',
            },
            status: 200,
            headers: new Headers(),
        });
    });
    (0, vitest_1.it)('does not call API when editId is empty', function () {
        var pathId = (0, vue_1.ref)('p1');
        var entryId = (0, vue_1.ref)('e1');
        var editId = (0, vue_1.ref)('');
        var queryClient = createQueryClient();
        var TestComponent = (0, vue_2.defineComponent)({
            setup: function () {
                (0, useEntries_1.useEntryContent)(pathId, entryId, editId);
                return {};
            },
            template: '<div></div>',
        });
        (0, test_utils_1.mount)(TestComponent, {
            global: { plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]] },
        });
        (0, vitest_1.expect)(vitest_1.vi.mocked(customFetch_1.customFetch)).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)('fetches content when all ids are set', function () { return __awaiter(void 0, void 0, void 0, function () {
        var pathId, entryId, editId, queryClient, TestComponent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pathId = (0, vue_1.ref)('p1');
                    entryId = (0, vue_1.ref)('e1');
                    editId = (0, vue_1.ref)('edit-1');
                    queryClient = createQueryClient();
                    TestComponent = (0, vue_2.defineComponent)({
                        setup: function () {
                            (0, useEntries_1.useEntryContent)(pathId, entryId, editId);
                            return {};
                        },
                        template: '<div></div>',
                    });
                    (0, test_utils_1.mount)(TestComponent, {
                        global: { plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]] },
                    });
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(vitest_1.vi.mocked(customFetch_1.customFetch)).toHaveBeenCalledWith('/v1/paths/p1/entries/e1', vitest_1.expect.objectContaining({ method: 'GET' }));
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('re-fetches when editId changes (smart refetch)', function () { return __awaiter(void 0, void 0, void 0, function () {
        var pathId, entryId, editId, queryClient, TestComponent, callCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pathId = (0, vue_1.ref)('p1');
                    entryId = (0, vue_1.ref)('e1');
                    editId = (0, vue_1.ref)('edit-1');
                    queryClient = createQueryClient();
                    TestComponent = (0, vue_2.defineComponent)({
                        setup: function () {
                            (0, useEntries_1.useEntryContent)(pathId, entryId, editId);
                            return {};
                        },
                        template: '<div></div>',
                    });
                    (0, test_utils_1.mount)(TestComponent, {
                        global: { plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]] },
                    });
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    callCount = vitest_1.vi.mocked(customFetch_1.customFetch).mock.calls.length;
                    // Changing the editId should trigger a new fetch since it's part of the query key
                    editId.value = 'edit-2';
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 3:
                    _a.sent();
                    (0, vitest_1.expect)(vitest_1.vi.mocked(customFetch_1.customFetch).mock.calls.length).toBeGreaterThan(callCount);
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('useMultiPathEntries', function () {
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
        vitest_1.vi.mocked(customFetch_1.customFetch).mockResolvedValue({
            data: [],
            status: 200,
            headers: new Headers(),
        });
    });
    (0, vitest_1.it)('returns an empty array when no pathIds are provided', function () { return __awaiter(void 0, void 0, void 0, function () {
        var pathIds, queryClient, result, TestComponent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pathIds = (0, vue_1.ref)([]);
                    queryClient = createQueryClient();
                    TestComponent = (0, vue_2.defineComponent)({
                        setup: function () {
                            result = (0, useMultiPathEntries_1.useMultiPathEntries)(pathIds);
                            return {};
                        },
                        template: '<div></div>',
                    });
                    (0, test_utils_1.mount)(TestComponent, {
                        global: { plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]] },
                    });
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(result === null || result === void 0 ? void 0 : result.value).toEqual([]);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('fetches entries for each provided pathId', function () { return __awaiter(void 0, void 0, void 0, function () {
        var pathIds, queryClient, result, TestComponent;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    vitest_1.vi.mocked(customFetch_1.customFetch).mockImplementation(function (url) {
                        // Images endpoint: /v1/paths/{id}/entries/{entryId}/images
                        if (url.match(/\/v1\/paths\/[^/]+\/entries\/[^/]+\/images$/)) {
                            return Promise.resolve({
                                data: [],
                                status: 200,
                                headers: new Headers(),
                            });
                        }
                        // Match specific content fetch: /v1/paths/{id}/entries/{entryId} (no trailing segment)
                        var contentMatch = url.match(/\/v1\/paths\/([^/]+)\/entries\/([^/]+)$/);
                        if (contentMatch &&
                            !url.endsWith('/entries/p1') &&
                            !url.endsWith('/entries/p2')) {
                            var pathId = contentMatch[1], entryId = contentMatch[2];
                            return Promise.resolve({
                                data: {
                                    id: entryId,
                                    path_id: pathId,
                                    day: '2024-01-01',
                                    edit_id: 1,
                                    content: "Content for ".concat(entryId),
                                },
                                status: 200,
                                headers: new Headers(),
                            });
                        }
                        if (url.includes('/v1/paths/p1/entries')) {
                            return Promise.resolve({
                                data: [{ id: 'e1', path_id: 'p1', day: '2024-01-01', edit_id: 1 }],
                                status: 200,
                                headers: new Headers(),
                            });
                        }
                        if (url.includes('/v1/paths/p2/entries')) {
                            return Promise.resolve({
                                data: [{ id: 'e2', path_id: 'p2', day: '2024-01-02', edit_id: 2 }],
                                status: 200,
                                headers: new Headers(),
                            });
                        }
                        return Promise.resolve({ data: [], status: 200, headers: new Headers() });
                    });
                    pathIds = (0, vue_1.ref)(['p1', 'p2']);
                    queryClient = createQueryClient();
                    TestComponent = (0, vue_2.defineComponent)({
                        setup: function () {
                            result = (0, useMultiPathEntries_1.useMultiPathEntries)(pathIds);
                            return {};
                        },
                        template: '<div></div>',
                    });
                    (0, test_utils_1.mount)(TestComponent, {
                        global: { plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]] },
                    });
                    // First flush: TanStack Query resolves entry lists
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    // First flush: TanStack Query resolves entry lists
                    _e.sent();
                    // Second flush: async watch resolves content fetches
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 2:
                    // Second flush: async watch resolves content fetches
                    _e.sent();
                    (0, vitest_1.expect)(result === null || result === void 0 ? void 0 : result.value).toHaveLength(2);
                    (0, vitest_1.expect)((_a = result === null || result === void 0 ? void 0 : result.value[0]) === null || _a === void 0 ? void 0 : _a.pathId).toBe('p1');
                    (0, vitest_1.expect)((_b = result === null || result === void 0 ? void 0 : result.value[0]) === null || _b === void 0 ? void 0 : _b.entries).toHaveLength(1);
                    (0, vitest_1.expect)((_c = result === null || result === void 0 ? void 0 : result.value[1]) === null || _c === void 0 ? void 0 : _c.pathId).toBe('p2');
                    (0, vitest_1.expect)((_d = result === null || result === void 0 ? void 0 : result.value[1]) === null || _d === void 0 ? void 0 : _d.entries).toHaveLength(1);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('returns empty entries array when a query fails', function () { return __awaiter(void 0, void 0, void 0, function () {
        var pathIds, queryClient, result, TestComponent;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    vitest_1.vi.mocked(customFetch_1.customFetch).mockRejectedValue(new Error('Network error'));
                    pathIds = (0, vue_1.ref)(['p1']);
                    queryClient = new vue_query_1.QueryClient({
                        defaultOptions: { queries: { retry: false } },
                    });
                    TestComponent = (0, vue_2.defineComponent)({
                        setup: function () {
                            result = (0, useMultiPathEntries_1.useMultiPathEntries)(pathIds);
                            return {};
                        },
                        template: '<div></div>',
                    });
                    (0, test_utils_1.mount)(TestComponent, {
                        global: { plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]] },
                    });
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _b.sent();
                    (0, vitest_1.expect)((_a = result === null || result === void 0 ? void 0 : result.value[0]) === null || _a === void 0 ? void 0 : _a.entries).toEqual([]);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('hydrates immediately when entry lists are already in the query cache', function () { return __awaiter(void 0, void 0, void 0, function () {
        var pathIds, queryClient, result, TestComponent;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    vitest_1.vi.mocked(customFetch_1.customFetch).mockImplementation(function (url) {
                        if (url === '/v1/paths/p1/entries/e1') {
                            return Promise.resolve({
                                data: {
                                    id: 'e1',
                                    path_id: 'p1',
                                    day: '2024-01-01',
                                    edit_id: 1,
                                    content: 'Warm cache content',
                                },
                                status: 200,
                                headers: new Headers(),
                            });
                        }
                        if (url === '/v1/paths/p1/entries/e1/images') {
                            return Promise.resolve({
                                data: [],
                                status: 200,
                                headers: new Headers(),
                            });
                        }
                        return Promise.resolve({
                            data: [],
                            status: 200,
                            headers: new Headers(),
                        });
                    });
                    pathIds = (0, vue_1.ref)(['p1']);
                    queryClient = new vue_query_1.QueryClient({
                        defaultOptions: {
                            queries: {
                                retry: false,
                                staleTime: Infinity,
                            },
                        },
                    });
                    queryClient.setQueryData(['v1', 'paths', 'p1', 'entries'], {
                        data: [{ id: 'e1', path_id: 'p1', day: '2024-01-01', edit_id: 1 }],
                        status: 200,
                        headers: new Headers(),
                    });
                    TestComponent = (0, vue_2.defineComponent)({
                        setup: function () {
                            result = (0, useMultiPathEntries_1.useMultiPathEntries)(pathIds);
                            return {};
                        },
                        template: '<div></div>',
                    });
                    (0, test_utils_1.mount)(TestComponent, {
                        global: { plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]] },
                    });
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _f.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 2:
                    _f.sent();
                    (0, vitest_1.expect)(result === null || result === void 0 ? void 0 : result.value).toHaveLength(1);
                    (0, vitest_1.expect)((_a = result === null || result === void 0 ? void 0 : result.value[0]) === null || _a === void 0 ? void 0 : _a.entries).toHaveLength(1);
                    (0, vitest_1.expect)((_c = (_b = result === null || result === void 0 ? void 0 : result.value[0]) === null || _b === void 0 ? void 0 : _b.entries[0]) === null || _c === void 0 ? void 0 : _c.id).toBe('e1');
                    (0, vitest_1.expect)((_e = (_d = result === null || result === void 0 ? void 0 : result.value[0]) === null || _d === void 0 ? void 0 : _d.entries[0]) === null || _e === void 0 ? void 0 : _e.content).toBe('Warm cache content');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('keeps each pathId associated with its own entries when pathIds are reordered', function () { return __awaiter(void 0, void 0, void 0, function () {
        var pathIds, queryClient, result, TestComponent, p2Slot, p1Slot;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0:
                    vitest_1.vi.mocked(customFetch_1.customFetch).mockImplementation(function (url) {
                        // Images endpoint: /v1/paths/{id}/entries/{entryId}/images
                        if (url.match(/\/v1\/paths\/[^/]+\/entries\/[^/]+\/images$/)) {
                            return Promise.resolve({
                                data: [],
                                status: 200,
                                headers: new Headers(),
                            });
                        }
                        // Content fetch: /v1/paths/{pathId}/entries/{entryId}
                        var contentMatch = url.match(/\/v1\/paths\/([^/]+)\/entries\/([^/]+)$/);
                        if (contentMatch &&
                            !url.endsWith('/entries/p1') &&
                            !url.endsWith('/entries/p2')) {
                            var pathId = contentMatch[1], entryId = contentMatch[2];
                            return Promise.resolve({
                                data: {
                                    id: entryId,
                                    path_id: pathId,
                                    day: '2024-06-01',
                                    edit_id: 1,
                                    content: "Content for ".concat(pathId),
                                },
                                status: 200,
                                headers: new Headers(),
                            });
                        }
                        if (url.includes('/v1/paths/p1/entries')) {
                            return Promise.resolve({
                                data: [{ id: 'e1', path_id: 'p1', day: '2024-06-01', edit_id: 1 }],
                                status: 200,
                                headers: new Headers(),
                            });
                        }
                        if (url.includes('/v1/paths/p2/entries')) {
                            return Promise.resolve({
                                data: [{ id: 'e2', path_id: 'p2', day: '2024-06-01', edit_id: 1 }],
                                status: 200,
                                headers: new Headers(),
                            });
                        }
                        return Promise.resolve({ data: [], status: 200, headers: new Headers() });
                    });
                    pathIds = (0, vue_1.ref)(['p1', 'p2']);
                    queryClient = createQueryClient();
                    TestComponent = (0, vue_2.defineComponent)({
                        setup: function () {
                            result = (0, useMultiPathEntries_1.useMultiPathEntries)(pathIds);
                            return {};
                        },
                        template: '<div></div>',
                    });
                    (0, test_utils_1.mount)(TestComponent, {
                        global: { plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]] },
                    });
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _l.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 2:
                    _l.sent();
                    // Verify baseline before reorder
                    (0, vitest_1.expect)((_a = result === null || result === void 0 ? void 0 : result.value[0]) === null || _a === void 0 ? void 0 : _a.pathId).toBe('p1');
                    (0, vitest_1.expect)((_c = (_b = result === null || result === void 0 ? void 0 : result.value[0]) === null || _b === void 0 ? void 0 : _b.entries[0]) === null || _c === void 0 ? void 0 : _c.path_id).toBe('p1');
                    (0, vitest_1.expect)((_d = result === null || result === void 0 ? void 0 : result.value[1]) === null || _d === void 0 ? void 0 : _d.pathId).toBe('p2');
                    (0, vitest_1.expect)((_f = (_e = result === null || result === void 0 ? void 0 : result.value[1]) === null || _e === void 0 ? void 0 : _e.entries[0]) === null || _f === void 0 ? void 0 : _f.path_id).toBe('p2');
                    // Reorder: promote p2 to first position
                    pathIds.value = ['p2', 'p1'];
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 3:
                    _l.sent();
                    p2Slot = result === null || result === void 0 ? void 0 : result.value.find(function (pe) { return pe.pathId === 'p2'; });
                    p1Slot = result === null || result === void 0 ? void 0 : result.value.find(function (pe) { return pe.pathId === 'p1'; });
                    (0, vitest_1.expect)((_g = p2Slot === null || p2Slot === void 0 ? void 0 : p2Slot.entries[0]) === null || _g === void 0 ? void 0 : _g.path_id).toBe('p2');
                    (0, vitest_1.expect)((_h = p1Slot === null || p1Slot === void 0 ? void 0 : p1Slot.entries[0]) === null || _h === void 0 ? void 0 : _h.path_id).toBe('p1');
                    // After async queries settle, the association must still be correct
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 4:
                    // After async queries settle, the association must still be correct
                    _l.sent();
                    p2Slot = result === null || result === void 0 ? void 0 : result.value.find(function (pe) { return pe.pathId === 'p2'; });
                    p1Slot = result === null || result === void 0 ? void 0 : result.value.find(function (pe) { return pe.pathId === 'p1'; });
                    (0, vitest_1.expect)((_j = p2Slot === null || p2Slot === void 0 ? void 0 : p2Slot.entries[0]) === null || _j === void 0 ? void 0 : _j.path_id).toBe('p2');
                    (0, vitest_1.expect)((_k = p1Slot === null || p1Slot === void 0 ? void 0 : p1Slot.entries[0]) === null || _k === void 0 ? void 0 : _k.path_id).toBe('p1');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('does not overwrite content when two paths share the same entry slug', function () { return __awaiter(void 0, void 0, void 0, function () {
        var pathIds, queryClient, result, TestComponent, p1Entry, p2Entry;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // Both paths have an entry with the same id ('same-slug') but different content.
                    vitest_1.vi.mocked(customFetch_1.customFetch).mockImplementation(function (url) {
                        if (url.match(/\/v1\/paths\/[^/]+\/entries\/[^/]+\/images$/)) {
                            return Promise.resolve({
                                data: [],
                                status: 200,
                                headers: new Headers(),
                            });
                        }
                        if (url === '/v1/paths/p1/entries/same-slug') {
                            return Promise.resolve({
                                data: {
                                    id: 'same-slug',
                                    path_id: 'p1',
                                    day: '2024-03-01',
                                    edit_id: 1,
                                    content: 'Content from p1',
                                },
                                status: 200,
                                headers: new Headers(),
                            });
                        }
                        if (url === '/v1/paths/p2/entries/same-slug') {
                            return Promise.resolve({
                                data: {
                                    id: 'same-slug',
                                    path_id: 'p2',
                                    day: '2024-03-01',
                                    edit_id: 2,
                                    content: 'Content from p2',
                                },
                                status: 200,
                                headers: new Headers(),
                            });
                        }
                        if (url === '/v1/paths/p1/entries') {
                            return Promise.resolve({
                                data: [
                                    {
                                        id: 'same-slug',
                                        path_id: 'p1',
                                        day: '2024-03-01',
                                        edit_id: 1,
                                    },
                                ],
                                status: 200,
                                headers: new Headers(),
                            });
                        }
                        if (url === '/v1/paths/p2/entries') {
                            return Promise.resolve({
                                data: [
                                    {
                                        id: 'same-slug',
                                        path_id: 'p2',
                                        day: '2024-03-01',
                                        edit_id: 2,
                                    },
                                ],
                                status: 200,
                                headers: new Headers(),
                            });
                        }
                        return Promise.resolve({ data: [], status: 200, headers: new Headers() });
                    });
                    pathIds = (0, vue_1.ref)(['p1', 'p2']);
                    queryClient = createQueryClient();
                    TestComponent = (0, vue_2.defineComponent)({
                        setup: function () {
                            result = (0, useMultiPathEntries_1.useMultiPathEntries)(pathIds);
                            return {};
                        },
                        template: '<div></div>',
                    });
                    (0, test_utils_1.mount)(TestComponent, {
                        global: { plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]] },
                    });
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 2:
                    _c.sent();
                    p1Entry = (_a = result === null || result === void 0 ? void 0 : result.value.find(function (pe) { return pe.pathId === 'p1'; })) === null || _a === void 0 ? void 0 : _a.entries[0];
                    p2Entry = (_b = result === null || result === void 0 ? void 0 : result.value.find(function (pe) { return pe.pathId === 'p2'; })) === null || _b === void 0 ? void 0 : _b.entries[0];
                    (0, vitest_1.expect)(p1Entry === null || p1Entry === void 0 ? void 0 : p1Entry.content).toBe('Content from p1');
                    (0, vitest_1.expect)(p2Entry === null || p2Entry === void 0 ? void 0 : p2Entry.content).toBe('Content from p2');
                    return [2 /*return*/];
            }
        });
    }); });
});
