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
/**
 * Tests that useMultiPathEntries continues to fetch entry content from the
 * remote API when the Dexie (IndexedDB) cache is unavailable, rather than
 * crashing or silently showing empty content.
 */
var vitest_1 = require("vitest");
var vue_1 = require("vue");
var vue_query_1 = require("@tanstack/vue-query");
var test_utils_1 = require("@vue/test-utils");
var vue_2 = require("vue");
vitest_1.vi.mock('../lib/customFetch', function () { return ({
    customFetch: vitest_1.vi.fn(),
}); });
vitest_1.vi.mock('../lib/db', function () { return ({
    db: {
        entryContent: {
            get: vitest_1.vi.fn().mockRejectedValue(new Error('IndexedDB unavailable')),
            put: vitest_1.vi.fn().mockRejectedValue(new Error('IndexedDB unavailable')),
        },
        entryImages: {
            where: vitest_1.vi.fn().mockReturnValue({
                equals: vitest_1.vi.fn().mockReturnValue({
                    toArray: vitest_1.vi
                        .fn()
                        .mockRejectedValue(new Error('IndexedDB unavailable')),
                    delete: vitest_1.vi.fn().mockRejectedValue(new Error('IndexedDB unavailable')),
                }),
            }),
            bulkPut: vitest_1.vi.fn().mockRejectedValue(new Error('IndexedDB unavailable')),
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
var useMultiPathEntries_1 = require("../composables/useMultiPathEntries");
(0, vitest_1.describe)('useMultiPathEntries – Dexie unavailable', function () {
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('still fetches entry content from the API when the Dexie cache throws', function () { return __awaiter(void 0, void 0, void 0, function () {
        var pathIds, queryClient, result, TestComponent;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    vitest_1.vi.mocked(customFetch_1.customFetch).mockImplementation(function (url) {
                        if (url.match(/\/images$/)) {
                            return Promise.resolve({
                                data: [],
                                status: 200,
                                headers: new Headers(),
                            });
                        }
                        if (url === '/v1/paths/p1/entries') {
                            return Promise.resolve({
                                data: [{ id: 'e1', path_id: 'p1', day: '2024-01-01', edit_id: 1 }],
                                status: 200,
                                headers: new Headers(),
                            });
                        }
                        if (url === '/v1/paths/p1/entries/e1') {
                            return Promise.resolve({
                                data: {
                                    id: 'e1',
                                    path_id: 'p1',
                                    day: '2024-01-01',
                                    edit_id: 1,
                                    content: 'Remote content',
                                },
                                status: 200,
                                headers: new Headers(),
                            });
                        }
                        return Promise.resolve({ data: [], status: 200, headers: new Headers() });
                    });
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
                    _c.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 2:
                    _c.sent();
                    // Content must be populated from the API even though Dexie is broken.
                    (0, vitest_1.expect)((_b = (_a = result === null || result === void 0 ? void 0 : result.value[0]) === null || _a === void 0 ? void 0 : _a.entries[0]) === null || _b === void 0 ? void 0 : _b.content).toBe('Remote content');
                    return [2 /*return*/];
            }
        });
    }); });
});
