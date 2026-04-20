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
 * Tests for the OnThisDaySpotlight priority-based selection algorithm.
 */
var vitest_1 = require("vitest");
var vue_1 = require("vue");
var test_utils_1 = require("@vue/test-utils");
var OnThisDaySpotlight_vue_1 = require("../components/OnThisDaySpotlight.vue");
// ---------------------------------------------------------------------------
// Stub Ionic components
// ---------------------------------------------------------------------------
var ionicStubs = {
    IonCard: { template: '<div class="ion-card"><slot /></div>' },
    IonCardHeader: { template: '<div class="ion-card-header"><slot /></div>' },
    IonCardSubtitle: {
        template: '<div class="ion-card-subtitle"><slot /></div>',
    },
    IonCardTitle: { template: '<div class="ion-card-title"><slot /></div>' },
    IonCardContent: { template: '<div class="ion-card-content"><slot /></div>' },
};
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
var today = new Date();
function dateString(offsetDays) {
    var d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
}
function yearAgo(years, offsetDays) {
    if (offsetDays === void 0) { offsetDays = 0; }
    var d = new Date(today);
    d.setFullYear(d.getFullYear() - years);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
}
function makePath(id, overrides) {
    if (overrides === void 0) { overrides = {}; }
    return __assign({ path_id: id, uuid: "uuid-".concat(id), owner_user_id: 'user-1', title: "Path ".concat(id), description: null, color: '#3949ab', is_public: false, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }, overrides);
}
function mountSpotlight(visiblePaths, pathEntries) {
    return (0, test_utils_1.mount)(OnThisDaySpotlight_vue_1.default, {
        props: { visiblePaths: visiblePaths, pathEntries: pathEntries },
        global: { stubs: ionicStubs },
    });
}
// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
(0, vitest_1.describe)('OnThisDaySpotlight – not shown without matching entries', function () {
    (0, vitest_1.it)('renders nothing when there are no matching entries', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePath('p1');
                    wrapper = mountSpotlight([path], [{ pathId: 'p1', entries: [] }]);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.find('.ion-card').exists()).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('excludes today itself from the spotlight', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, todayStr, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePath('p1');
                    todayStr = dateString(0);
                    wrapper = mountSpotlight([path], [
                        {
                            pathId: 'p1',
                            entries: [
                                {
                                    id: 'e1',
                                    path_id: 'p1',
                                    day: todayStr,
                                    edit_id: 1,
                                    content: 'Today',
                                },
                            ],
                        },
                    ]);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.find('.ion-card').exists()).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('OnThisDaySpotlight – priority 1: first path + exact day, previous years', function () {
    (0, vitest_1.it)('shows an exact-day match from a previous year', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, oneYearAgo, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePath('p1');
                    oneYearAgo = yearAgo(1);
                    wrapper = mountSpotlight([path], [
                        {
                            pathId: 'p1',
                            entries: [
                                {
                                    id: 'e1',
                                    path_id: 'p1',
                                    day: oneYearAgo,
                                    edit_id: 1,
                                    content: 'Last year today',
                                },
                            ],
                        },
                    ]);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.find('.ion-card').exists()).toBe(true);
                    (0, vitest_1.expect)(wrapper.html()).toContain('Last year today');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('prefers exact day over adjacent days', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, exactDayLastYear, adjacentDayLastYear, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePath('p1');
                    exactDayLastYear = yearAgo(1);
                    adjacentDayLastYear = yearAgo(1, 1);
                    wrapper = mountSpotlight([path], [
                        {
                            pathId: 'p1',
                            entries: [
                                {
                                    id: 'e1',
                                    path_id: 'p1',
                                    day: exactDayLastYear,
                                    edit_id: 1,
                                    content: 'Exact day',
                                },
                                {
                                    id: 'e2',
                                    path_id: 'p1',
                                    day: adjacentDayLastYear,
                                    edit_id: 2,
                                    content: 'Adjacent day',
                                },
                            ],
                        },
                    ]);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.find('.spotlight-primary').exists()).toBe(true);
                    (0, vitest_1.expect)(wrapper.find('.spotlight-primary').text()).toContain('Exact day');
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('OnThisDaySpotlight – priority 2: other paths + exact day', function () {
    (0, vitest_1.it)('shows exact-day match from first path before second path', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path1, path2, lastYear, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path1 = makePath('p1');
                    path2 = makePath('p2');
                    lastYear = yearAgo(1);
                    wrapper = mountSpotlight([path1, path2], [
                        {
                            pathId: 'p1',
                            entries: [
                                {
                                    id: 'e1',
                                    path_id: 'p1',
                                    day: lastYear,
                                    edit_id: 1,
                                    content: 'From p1',
                                },
                            ],
                        },
                        {
                            pathId: 'p2',
                            entries: [
                                {
                                    id: 'e2',
                                    path_id: 'p2',
                                    day: lastYear,
                                    edit_id: 2,
                                    content: 'From p2',
                                },
                            ],
                        },
                    ]);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.find('.spotlight-primary').text()).toContain('From p1');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('shows second-path exact match when first path has none', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path1, path2, lastYear, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path1 = makePath('p1');
                    path2 = makePath('p2');
                    lastYear = yearAgo(1);
                    wrapper = mountSpotlight([path1, path2], [
                        { pathId: 'p1', entries: [] },
                        {
                            pathId: 'p2',
                            entries: [
                                {
                                    id: 'e2',
                                    path_id: 'p2',
                                    day: lastYear,
                                    edit_id: 2,
                                    content: 'P2 exact',
                                },
                            ],
                        },
                    ]);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.find('.ion-card').exists()).toBe(true);
                    (0, vitest_1.expect)(wrapper.find('.spotlight-primary').text()).toContain('P2 exact');
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('OnThisDaySpotlight – adjacent day matching', function () {
    (0, vitest_1.it)('shows adjacent day (±2 days) entry when no exact match exists', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, adjacentLastYear, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePath('p1');
                    adjacentLastYear = yearAgo(1, 1);
                    wrapper = mountSpotlight([path], [
                        {
                            pathId: 'p1',
                            entries: [
                                {
                                    id: 'e1',
                                    path_id: 'p1',
                                    day: adjacentLastYear,
                                    edit_id: 1,
                                    content: 'Adjacent entry',
                                },
                            ],
                        },
                    ]);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.find('.ion-card').exists()).toBe(true);
                    (0, vitest_1.expect)(wrapper.html()).toContain('Adjacent entry');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('does not show entry more than 2 days away', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, farLastYear, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePath('p1');
                    farLastYear = yearAgo(1, 3);
                    wrapper = mountSpotlight([path], [
                        {
                            pathId: 'p1',
                            entries: [
                                {
                                    id: 'e1',
                                    path_id: 'p1',
                                    day: farLastYear,
                                    edit_id: 1,
                                    content: 'Far entry',
                                },
                            ],
                        },
                    ]);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.find('.ion-card').exists()).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('OnThisDaySpotlight – this-year adjacent', function () {
    (0, vitest_1.it)('falls back to this-year adjacent entries when nothing from previous years', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, adjacentThisYear, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePath('p1');
                    adjacentThisYear = dateString(1);
                    wrapper = mountSpotlight([path], [
                        {
                            pathId: 'p1',
                            entries: [
                                {
                                    id: 'e1',
                                    path_id: 'p1',
                                    day: adjacentThisYear,
                                    edit_id: 1,
                                    content: 'Tomorrow this year',
                                },
                            ],
                        },
                    ]);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.find('.ion-card').exists()).toBe(true);
                    (0, vitest_1.expect)(wrapper.html()).toContain('Tomorrow this year');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('prefers previous-year adjacent over this-year adjacent', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, adjacentLastYear, adjacentThisYear, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePath('p1');
                    adjacentLastYear = yearAgo(1, 1);
                    adjacentThisYear = dateString(1);
                    wrapper = mountSpotlight([path], [
                        {
                            pathId: 'p1',
                            entries: [
                                {
                                    id: 'e1',
                                    path_id: 'p1',
                                    day: adjacentLastYear,
                                    edit_id: 1,
                                    content: 'Last year adjacent',
                                },
                                {
                                    id: 'e2',
                                    path_id: 'p1',
                                    day: adjacentThisYear,
                                    edit_id: 2,
                                    content: 'This year adjacent',
                                },
                            ],
                        },
                    ]);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.find('.spotlight-primary').text()).toContain('Last year adjacent');
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('OnThisDaySpotlight – other indicators', function () {
    (0, vitest_1.it)('shows additional year indicators for entries beyond the primary', function () { return __awaiter(void 0, void 0, void 0, function () {
        var path, twoYearsAgo, threeYearsAgo, oneYearAgo, wrapper, indicators;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = makePath('p1');
                    twoYearsAgo = yearAgo(2);
                    threeYearsAgo = yearAgo(3);
                    oneYearAgo = yearAgo(1);
                    wrapper = mountSpotlight([path], [
                        {
                            pathId: 'p1',
                            entries: [
                                {
                                    id: 'e1',
                                    path_id: 'p1',
                                    day: oneYearAgo,
                                    edit_id: 1,
                                    content: 'One year ago',
                                },
                                {
                                    id: 'e2',
                                    path_id: 'p1',
                                    day: twoYearsAgo,
                                    edit_id: 2,
                                    content: 'Two years ago',
                                },
                                {
                                    id: 'e3',
                                    path_id: 'p1',
                                    day: threeYearsAgo,
                                    edit_id: 3,
                                    content: 'Three years ago',
                                },
                            ],
                        },
                    ]);
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    indicators = wrapper.findAll('.spotlight-indicator');
                    (0, vitest_1.expect)(indicators.length).toBe(2);
                    return [2 /*return*/];
            }
        });
    }); });
});
