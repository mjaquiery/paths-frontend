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
// We need to mock matchMedia before the module is imported
var mockMatches = { value: false };
var mockListeners = [];
var mockMediaQuery = {
    get matches() {
        return mockMatches.value;
    },
    addEventListener: vitest_1.vi.fn(function (_, fn) {
        mockListeners.push(fn);
    }),
    removeEventListener: vitest_1.vi.fn(),
};
vitest_1.vi.stubGlobal('matchMedia', vitest_1.vi.fn(function () { return mockMediaQuery; }));
// Stub localStorage
var localStorageStore = {};
vitest_1.vi.stubGlobal('localStorage', {
    getItem: vitest_1.vi.fn(function (key) { var _a; return (_a = localStorageStore[key]) !== null && _a !== void 0 ? _a : null; }),
    setItem: vitest_1.vi.fn(function (key, value) {
        localStorageStore[key] = value;
    }),
    removeItem: vitest_1.vi.fn(function (key) {
        delete localStorageStore[key];
    }),
});
(0, vitest_1.describe)('useDarkMode', function () {
    var classListToggleSpy;
    (0, vitest_1.beforeEach)(function () {
        // Reset state between tests
        mockMatches.value = false;
        mockListeners.length = 0;
        for (var _i = 0, _a = Object.keys(localStorageStore); _i < _a.length; _i++) {
            var key = _a[_i];
            delete localStorageStore[key];
        }
        classListToggleSpy = vitest_1.vi.spyOn(document.documentElement.classList, 'toggle');
        classListToggleSpy.mockImplementation(function () { return false; });
        vitest_1.vi.resetModules();
    });
    (0, vitest_1.afterEach)(function () {
        classListToggleSpy.mockRestore();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('defaults to system preference (light) when no localStorage value', function () { return __awaiter(void 0, void 0, void 0, function () {
        var useDarkMode, _a, isDark, preference;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../composables/useDarkMode'); })];
                case 1:
                    useDarkMode = (_b.sent()).useDarkMode;
                    _a = useDarkMode(), isDark = _a.isDark, preference = _a.preference;
                    (0, vitest_1.expect)(preference.value).toBe('system');
                    (0, vitest_1.expect)(isDark.value).toBe(false);
                    (0, vitest_1.expect)(classListToggleSpy).toHaveBeenCalledWith('ion-palette-dark', false);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('defaults to system preference (dark) when OS prefers dark', function () { return __awaiter(void 0, void 0, void 0, function () {
        var useDarkMode, _a, isDark, preference;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    mockMatches.value = true;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../composables/useDarkMode'); })];
                case 1:
                    useDarkMode = (_b.sent()).useDarkMode;
                    _a = useDarkMode(), isDark = _a.isDark, preference = _a.preference;
                    (0, vitest_1.expect)(preference.value).toBe('system');
                    (0, vitest_1.expect)(isDark.value).toBe(true);
                    (0, vitest_1.expect)(classListToggleSpy).toHaveBeenCalledWith('ion-palette-dark', true);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('restores dark preference from localStorage', function () { return __awaiter(void 0, void 0, void 0, function () {
        var useDarkMode, _a, isDark, preference;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    localStorageStore['darkModePreference'] = 'dark';
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../composables/useDarkMode'); })];
                case 1:
                    useDarkMode = (_b.sent()).useDarkMode;
                    _a = useDarkMode(), isDark = _a.isDark, preference = _a.preference;
                    (0, vitest_1.expect)(preference.value).toBe('dark');
                    (0, vitest_1.expect)(isDark.value).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('restores light preference from localStorage', function () { return __awaiter(void 0, void 0, void 0, function () {
        var useDarkMode, _a, isDark, preference;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    localStorageStore['darkModePreference'] = 'light';
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../composables/useDarkMode'); })];
                case 1:
                    useDarkMode = (_b.sent()).useDarkMode;
                    _a = useDarkMode(), isDark = _a.isDark, preference = _a.preference;
                    (0, vitest_1.expect)(preference.value).toBe('light');
                    (0, vitest_1.expect)(isDark.value).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('toggle from system (light OS) goes to light explicit preference', function () { return __awaiter(void 0, void 0, void 0, function () {
        var useDarkMode, _a, isDark, preference, toggle;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    mockMatches.value = false;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../composables/useDarkMode'); })];
                case 1:
                    useDarkMode = (_b.sent()).useDarkMode;
                    _a = useDarkMode(), isDark = _a.isDark, preference = _a.preference, toggle = _a.toggle;
                    (0, vitest_1.expect)(preference.value).toBe('system');
                    (0, vitest_1.expect)(isDark.value).toBe(false);
                    toggle();
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 0); })];
                case 2:
                    _b.sent();
                    // system → light (first step in the cycle: light → dark → system → light)
                    (0, vitest_1.expect)(preference.value).toBe('light');
                    (0, vitest_1.expect)(isDark.value).toBe(false);
                    (0, vitest_1.expect)(localStorageStore['darkModePreference']).toBe('light');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('toggle from system (dark OS) goes to light (not dark)', function () { return __awaiter(void 0, void 0, void 0, function () {
        var useDarkMode, _a, isDark, preference, toggle;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    mockMatches.value = true;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../composables/useDarkMode'); })];
                case 1:
                    useDarkMode = (_b.sent()).useDarkMode;
                    _a = useDarkMode(), isDark = _a.isDark, preference = _a.preference, toggle = _a.toggle;
                    (0, vitest_1.expect)(preference.value).toBe('system');
                    (0, vitest_1.expect)(isDark.value).toBe(true);
                    toggle();
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 0); })];
                case 2:
                    _b.sent();
                    // system (dark OS) → light (next state after 'system' is 'light')
                    (0, vitest_1.expect)(preference.value).toBe('light');
                    (0, vitest_1.expect)(isDark.value).toBe(false);
                    (0, vitest_1.expect)(localStorageStore['darkModePreference']).toBe('light');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('toggle cycles: light → dark → system → light', function () { return __awaiter(void 0, void 0, void 0, function () {
        var useDarkMode, _a, preference, toggle;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    localStorageStore['darkModePreference'] = 'light';
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../composables/useDarkMode'); })];
                case 1:
                    useDarkMode = (_b.sent()).useDarkMode;
                    _a = useDarkMode(), preference = _a.preference, toggle = _a.toggle;
                    (0, vitest_1.expect)(preference.value).toBe('light');
                    toggle();
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 0); })];
                case 2:
                    _b.sent();
                    (0, vitest_1.expect)(preference.value).toBe('dark');
                    (0, vitest_1.expect)(localStorageStore['darkModePreference']).toBe('dark');
                    toggle();
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 0); })];
                case 3:
                    _b.sent();
                    (0, vitest_1.expect)(preference.value).toBe('system');
                    // 'system' must NOT be written to localStorage — key should be absent
                    (0, vitest_1.expect)(localStorageStore['darkModePreference']).toBeUndefined();
                    toggle();
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 0); })];
                case 4:
                    _b.sent();
                    (0, vitest_1.expect)(preference.value).toBe('light');
                    (0, vitest_1.expect)(localStorageStore['darkModePreference']).toBe('light');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('toggle switches from dark to system (removes localStorage)', function () { return __awaiter(void 0, void 0, void 0, function () {
        var useDarkMode, _a, preference, toggle;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    localStorageStore['darkModePreference'] = 'dark';
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../composables/useDarkMode'); })];
                case 1:
                    useDarkMode = (_b.sent()).useDarkMode;
                    _a = useDarkMode(), preference = _a.preference, toggle = _a.toggle;
                    (0, vitest_1.expect)(preference.value).toBe('dark');
                    toggle();
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 0); })];
                case 2:
                    _b.sent();
                    (0, vitest_1.expect)(preference.value).toBe('system');
                    (0, vitest_1.expect)(localStorageStore['darkModePreference']).toBeUndefined();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('toggle switches from light to dark', function () { return __awaiter(void 0, void 0, void 0, function () {
        var useDarkMode, _a, isDark, toggle;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    localStorageStore['darkModePreference'] = 'light';
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../composables/useDarkMode'); })];
                case 1:
                    useDarkMode = (_b.sent()).useDarkMode;
                    _a = useDarkMode(), isDark = _a.isDark, toggle = _a.toggle;
                    (0, vitest_1.expect)(isDark.value).toBe(false);
                    toggle();
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 0); })];
                case 2:
                    _b.sent();
                    (0, vitest_1.expect)(isDark.value).toBe(true);
                    (0, vitest_1.expect)(localStorageStore['darkModePreference']).toBe('dark');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('responds to OS preference changes when in system mode', function () { return __awaiter(void 0, void 0, void 0, function () {
        var useDarkMode, _a, isDark, preference;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    mockMatches.value = false;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../composables/useDarkMode'); })];
                case 1:
                    useDarkMode = (_b.sent()).useDarkMode;
                    _a = useDarkMode(), isDark = _a.isDark, preference = _a.preference;
                    (0, vitest_1.expect)(preference.value).toBe('system');
                    (0, vitest_1.expect)(isDark.value).toBe(false);
                    // Simulate OS switching to dark mode
                    mockMatches.value = true;
                    (0, vitest_1.expect)(mockListeners).toHaveLength(1);
                    mockListeners[0]({ matches: true });
                    (0, vitest_1.expect)(isDark.value).toBe(true);
                    (0, vitest_1.expect)(classListToggleSpy).toHaveBeenCalledWith('ion-palette-dark', true);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('ignores OS changes when preference is not system', function () { return __awaiter(void 0, void 0, void 0, function () {
        var useDarkMode, isDark;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    localStorageStore['darkModePreference'] = 'light';
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../composables/useDarkMode'); })];
                case 1:
                    useDarkMode = (_b.sent()).useDarkMode;
                    isDark = useDarkMode().isDark;
                    (0, vitest_1.expect)(isDark.value).toBe(false);
                    // Simulate OS switching to dark mode — should be ignored
                    mockMatches.value = true;
                    (_a = mockListeners[0]) === null || _a === void 0 ? void 0 : _a.call(mockListeners, { matches: true });
                    // isDark stays false because preference overrides system
                    (0, vitest_1.expect)(isDark.value).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('defaults to system when localStorage contains invalid value', function () { return __awaiter(void 0, void 0, void 0, function () {
        var useDarkMode, preference;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    localStorageStore['darkModePreference'] = 'invalid-mode';
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../composables/useDarkMode'); })];
                case 1:
                    useDarkMode = (_a.sent()).useDarkMode;
                    preference = useDarkMode().preference;
                    (0, vitest_1.expect)(preference.value).toBe('system');
                    return [2 /*return*/];
            }
        });
    }); });
});
