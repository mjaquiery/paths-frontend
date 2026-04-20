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
/**
 * Tests for WeekView multi-path and multi-entry rendering.
 */
var vitest_1 = require("vitest");
var vue_1 = require("vue");
var vue_query_1 = require("@tanstack/vue-query");
var test_utils_1 = require("@vue/test-utils");
var WeekView_vue_1 = require("../components/WeekView.vue");
// ---------------------------------------------------------------------------
// Mock router
// ---------------------------------------------------------------------------
var mockPush = vitest_1.vi.fn();
vitest_1.vi.mock('vue-router', function () { return ({
    useRouter: function () { return ({ push: mockPush }); },
    useRoute: function () { return ({ params: {}, query: {} }); },
}); });
// ---------------------------------------------------------------------------
// Stub Ionic components
// ---------------------------------------------------------------------------
var ionicStubs = {
    IonButton: {
        template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
        props: ['disabled', 'size', 'fill', 'expand'],
        emits: ['click'],
    },
};
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function today() {
    return new Date().toISOString().slice(0, 10);
}
function makePathResponse(overrides) {
    if (overrides === void 0) { overrides = {}; }
    return __assign({ path_id: 'p1', uuid: 'uuid-p1', owner_user_id: 'user-1', title: 'Path One', description: null, color: '#3949ab', is_public: false, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }, overrides);
}
function createQueryClient() {
    return new vue_query_1.QueryClient({ defaultOptions: { queries: { retry: false } } });
}
function mountWeekView(visiblePaths, pathEntries) {
    var queryClient = createQueryClient();
    return (0, test_utils_1.mount)(WeekView_vue_1.default, {
        props: {
            visiblePaths: visiblePaths,
            pathEntries: pathEntries,
            canCreate: true,
            currentUserId: 'user-1',
        },
        global: {
            plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]],
            stubs: ionicStubs,
        },
    });
}
(0, vitest_1.beforeEach)(function () {
    mockPush.mockClear();
});
// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
(0, vitest_1.describe)('WeekView – multi-path entries on the same day', function () {
    (0, vitest_1.it)('shows entries from two different paths on the same day', function () { return __awaiter(void 0, void 0, void 0, function () {
        var pathA, pathB, todayStr, pathEntries, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pathA = makePathResponse({
                        path_id: 'p1',
                        title: 'Path A',
                        color: '#f00',
                    });
                    pathB = makePathResponse({
                        path_id: 'p2',
                        title: 'Path B',
                        color: '#00f',
                        owner_user_id: 'user-2',
                    });
                    todayStr = today();
                    pathEntries = [
                        {
                            pathId: 'p1',
                            entries: [
                                {
                                    id: 'e1',
                                    path_id: 'p1',
                                    day: todayStr,
                                    edit_id: 1,
                                    content: 'Entry from Path A',
                                },
                            ],
                        },
                        {
                            pathId: 'p2',
                            entries: [
                                {
                                    id: 'e2',
                                    path_id: 'p2',
                                    day: todayStr,
                                    edit_id: 2,
                                    content: 'Entry from Path B',
                                },
                            ],
                        },
                    ];
                    wrapper = mountWeekView([pathA, pathB], pathEntries);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toContain('Entry from Path A');
                    (0, vitest_1.expect)(wrapper.html()).toContain('Entry from Path B');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('displays both entries in the same day box when from different paths', function () { return __awaiter(void 0, void 0, void 0, function () {
        var pathA, pathB, todayStr, pathEntries, wrapper, dayEntries, entryTexts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pathA = makePathResponse({
                        path_id: 'p1',
                        title: 'Path A',
                        color: '#f00',
                    });
                    pathB = makePathResponse({
                        path_id: 'p2',
                        title: 'Path B',
                        color: '#00f',
                        owner_user_id: 'user-2',
                    });
                    todayStr = today();
                    pathEntries = [
                        {
                            pathId: 'p1',
                            entries: [
                                {
                                    id: 'e1',
                                    path_id: 'p1',
                                    day: todayStr,
                                    edit_id: 1,
                                    content: 'Alpha content',
                                },
                            ],
                        },
                        {
                            pathId: 'p2',
                            entries: [
                                {
                                    id: 'e2',
                                    path_id: 'p2',
                                    day: todayStr,
                                    edit_id: 2,
                                    content: 'Beta content',
                                },
                            ],
                        },
                    ];
                    wrapper = mountWeekView([pathA, pathB], pathEntries);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    dayEntries = wrapper.findAll('.day-entry');
                    entryTexts = dayEntries.map(function (e) { return e.text(); });
                    (0, vitest_1.expect)(entryTexts.some(function (t) { return t.includes('Alpha content'); })).toBe(true);
                    (0, vitest_1.expect)(entryTexts.some(function (t) { return t.includes('Beta content'); })).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('WeekView – multiple entries from the same path on the same day', function () {
    (0, vitest_1.it)('shows all entries from the same path on the same day', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, todayStr, pathEntries, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePathResponse({
                        path_id: 'p1',
                        title: 'My Path',
                        color: '#3949ab',
                    });
                    todayStr = today();
                    pathEntries = [
                        {
                            pathId: 'p1',
                            entries: [
                                {
                                    id: 'e1',
                                    path_id: 'p1',
                                    day: todayStr,
                                    edit_id: 1,
                                    content: 'First entry today',
                                },
                                {
                                    id: 'e2',
                                    path_id: 'p1',
                                    day: todayStr,
                                    edit_id: 2,
                                    content: 'Second entry today',
                                },
                            ],
                        },
                    ];
                    wrapper = mountWeekView([path], pathEntries);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toContain('First entry today');
                    (0, vitest_1.expect)(wrapper.html()).toContain('Second entry today');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('renders a separate .day-entry element for each entry', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, todayStr, pathEntries, wrapper, dayEntries;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePathResponse({ path_id: 'p1' });
                    todayStr = today();
                    pathEntries = [
                        {
                            pathId: 'p1',
                            entries: [
                                {
                                    id: 'e1',
                                    path_id: 'p1',
                                    day: todayStr,
                                    edit_id: 1,
                                    content: 'Entry One',
                                },
                                {
                                    id: 'e2',
                                    path_id: 'p1',
                                    day: todayStr,
                                    edit_id: 2,
                                    content: 'Entry Two',
                                },
                                {
                                    id: 'e3',
                                    path_id: 'p1',
                                    day: todayStr,
                                    edit_id: 3,
                                    content: 'Entry Three',
                                },
                            ],
                        },
                    ];
                    wrapper = mountWeekView([path], pathEntries);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    dayEntries = wrapper.findAll('.day-entry');
                    (0, vitest_1.expect)(dayEntries.length).toBeGreaterThanOrEqual(3);
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('WeekView – image thumbnail indicator', function () {
    (0, vitest_1.it)('shows 📷 indicator when an entry has images', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, todayStr, pathEntries, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePathResponse({ path_id: 'p1' });
                    todayStr = today();
                    pathEntries = [
                        {
                            pathId: 'p1',
                            entries: [
                                {
                                    id: 'e1',
                                    path_id: 'p1',
                                    day: todayStr,
                                    edit_id: 1,
                                    content: 'Entry with photo',
                                    image_filenames: ['photo.jpg'],
                                },
                            ],
                        },
                    ];
                    wrapper = mountWeekView([path], pathEntries);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toContain('📷');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('does not show 📷 indicator when an entry has no images', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, todayStr, pathEntries, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePathResponse({ path_id: 'p1' });
                    todayStr = today();
                    pathEntries = [
                        {
                            pathId: 'p1',
                            entries: [
                                {
                                    id: 'e1',
                                    path_id: 'p1',
                                    day: todayStr,
                                    edit_id: 1,
                                    content: 'Entry without photo',
                                    image_filenames: [],
                                },
                            ],
                        },
                    ];
                    wrapper = mountWeekView([path], pathEntries);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).not.toContain('📷');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('shows 📷 for entries with images and not for those without, on the same day', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, todayStr, pathEntries, wrapper, indicators;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePathResponse({ path_id: 'p1' });
                    todayStr = today();
                    pathEntries = [
                        {
                            pathId: 'p1',
                            entries: [
                                {
                                    id: 'e1',
                                    path_id: 'p1',
                                    day: todayStr,
                                    edit_id: 1,
                                    content: 'Has photo',
                                    image_filenames: ['cat.jpg'],
                                },
                                {
                                    id: 'e2',
                                    path_id: 'p1',
                                    day: todayStr,
                                    edit_id: 2,
                                    content: 'No photo',
                                    image_filenames: [],
                                },
                            ],
                        },
                    ];
                    wrapper = mountWeekView([path], pathEntries);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    indicators = wrapper.findAll('.day-entry-image-indicator');
                    (0, vitest_1.expect)(indicators).toHaveLength(1);
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('WeekView – content placeholder text', function () {
    (0, vitest_1.it)('shows "Fetching..." when entry content is undefined (not yet loaded)', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, todayStr, pathEntries, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePathResponse({ path_id: 'p1' });
                    todayStr = today();
                    pathEntries = [
                        {
                            pathId: 'p1',
                            entries: [
                                {
                                    id: 'e1',
                                    path_id: 'p1',
                                    day: todayStr,
                                    edit_id: 1,
                                    content: undefined,
                                },
                            ],
                        },
                    ];
                    wrapper = mountWeekView([path], pathEntries);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toContain('Fetching...');
                    (0, vitest_1.expect)(wrapper.html()).not.toContain('(no text)');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('shows "(no text)" when entry content is an empty string (fetched but empty)', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, todayStr, pathEntries, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePathResponse({ path_id: 'p1' });
                    todayStr = today();
                    pathEntries = [
                        {
                            pathId: 'p1',
                            entries: [
                                { id: 'e1', path_id: 'p1', day: todayStr, edit_id: 1, content: '' },
                            ],
                        },
                    ];
                    wrapper = mountWeekView([path], pathEntries);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toContain('(no text)');
                    (0, vitest_1.expect)(wrapper.html()).not.toContain('Fetching...');
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('WeekView – route navigation', function () {
    function makeDetailPathEntries(todayStr) {
        return [
            {
                pathId: 'p1',
                entries: [
                    {
                        id: 'e1',
                        path_id: 'p1',
                        day: todayStr,
                        edit_id: 1,
                        content: 'Detailed entry content',
                    },
                ],
            },
        ];
    }
    (0, vitest_1.it)('navigates to entry view when a day-entry is clicked', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, todayStr, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePathResponse({
                        path_id: 'p1',
                        title: 'My Path',
                        color: '#3949ab',
                    });
                    todayStr = today();
                    wrapper = mountWeekView([path], makeDetailPathEntries(todayStr));
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, wrapper.find('.day-entry').trigger('click')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 3:
                    _a.sent();
                    (0, vitest_1.expect)(mockPush).toHaveBeenCalledWith('/entry/p1/e1');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('navigates to entry view when Enter is pressed on a day-entry', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, todayStr, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePathResponse({
                        path_id: 'p1',
                        title: 'My Path',
                        color: '#3949ab',
                    });
                    todayStr = today();
                    wrapper = mountWeekView([path], makeDetailPathEntries(todayStr));
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, wrapper.find('.day-entry').trigger('keydown.enter')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 3:
                    _a.sent();
                    (0, vitest_1.expect)(mockPush).toHaveBeenCalledWith('/entry/p1/e1');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('navigates to entry view when Space is pressed on a day-entry', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, todayStr, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePathResponse({
                        path_id: 'p1',
                        title: 'My Path',
                        color: '#3949ab',
                    });
                    todayStr = today();
                    wrapper = mountWeekView([path], makeDetailPathEntries(todayStr));
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, wrapper.find('.day-entry').trigger('keydown.space')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 3:
                    _a.sent();
                    (0, vitest_1.expect)(mockPush).toHaveBeenCalledWith('/entry/p1/e1');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('navigates to create entry view when + button is clicked', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, todayStr, wrapper, dayBox, createBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePathResponse({
                        path_id: 'p1',
                        title: 'My Path',
                        color: '#3949ab',
                        owner_user_id: 'user-1',
                    });
                    todayStr = today();
                    wrapper = mountWeekView([path], makeDetailPathEntries(todayStr));
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    dayBox = wrapper
                        .findAll('.day-box')
                        .find(function (box) { return box.classes('day-box--today'); });
                    (0, vitest_1.expect)(dayBox).toBeTruthy();
                    createBtn = dayBox.find('.day-create-btn');
                    return [4 /*yield*/, createBtn.trigger('click')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 3:
                    _a.sent();
                    (0, vitest_1.expect)(mockPush).toHaveBeenCalledWith("/entry/p1/new?date=".concat(todayStr));
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('entries are keyboard-accessible (role=button, tabindex=0)', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, todayStr, pathEntries, wrapper, entry;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePathResponse({ path_id: 'p1' });
                    todayStr = today();
                    pathEntries = [
                        {
                            pathId: 'p1',
                            entries: [
                                {
                                    id: 'e1',
                                    path_id: 'p1',
                                    day: todayStr,
                                    edit_id: 1,
                                    content: 'Accessible entry',
                                },
                            ],
                        },
                    ];
                    wrapper = mountWeekView([path], pathEntries);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    entry = wrapper.find('.day-entry');
                    (0, vitest_1.expect)(entry.attributes('role')).toBe('button');
                    (0, vitest_1.expect)(entry.attributes('tabindex')).toBe('0');
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('WeekView – day ordering', function () {
    (0, vitest_1.it)('shows today at position 6 (1-indexed) in the 7-day window', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, wrapper, dayBoxes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePathResponse({ path_id: 'p1' });
                    wrapper = mountWeekView([path], [{ pathId: 'p1', entries: [] }]);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    dayBoxes = wrapper.findAll('.day-box');
                    (0, vitest_1.expect)(dayBoxes).toHaveLength(7);
                    // Position 6 (index 5) should be labelled "Today"
                    (0, vitest_1.expect)(dayBoxes[5].text()).toContain('Today');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('shows tomorrow at position 7 (last position)', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, wrapper, dayBoxes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePathResponse({ path_id: 'p1' });
                    wrapper = mountWeekView([path], [{ pathId: 'p1', entries: [] }]);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    dayBoxes = wrapper.findAll('.day-box');
                    // Last position should not be labelled "Today"
                    (0, vitest_1.expect)(dayBoxes[6].text()).not.toContain('Today');
                    // And it should not have the today class
                    (0, vitest_1.expect)(dayBoxes[6].classes()).not.toContain('day-box--today');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('shows today with the today marker CSS class at position 6', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, wrapper, dayBoxes, todayBoxes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePathResponse({ path_id: 'p1' });
                    wrapper = mountWeekView([path], [{ pathId: 'p1', entries: [] }]);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    dayBoxes = wrapper.findAll('.day-box');
                    todayBoxes = dayBoxes.filter(function (box) {
                        return box.classes().includes('day-box--today');
                    });
                    (0, vitest_1.expect)(todayBoxes).toHaveLength(1);
                    (0, vitest_1.expect)(dayBoxes.indexOf(todayBoxes[0])).toBe(5);
                    return [2 /*return*/];
            }
        });
    }); });
});
