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
var mockFetch = vitest_1.vi.fn();
vitest_1.vi.stubGlobal('fetch', mockFetch);
// Stub localStorage for bearer-token tests
var localStorageStore = {};
vitest_1.vi.stubGlobal('localStorage', {
    getItem: vitest_1.vi.fn(function (key) { var _a; return (_a = localStorageStore[key]) !== null && _a !== void 0 ? _a : null; }),
    setItem: vitest_1.vi.fn(function (key, value) {
        localStorageStore[key] = value;
    }),
    removeItem: vitest_1.vi.fn(function (key) {
        delete localStorageStore[key];
    }),
    clear: vitest_1.vi.fn(function () {
        for (var _i = 0, _a = Object.keys(localStorageStore); _i < _a.length; _i++) {
            var key = _a[_i];
            delete localStorageStore[key];
        }
    }),
});
// Reset module between tests so VITE_API_BASE_URL env changes take effect
(0, vitest_1.beforeEach)(function () {
    vitest_1.vi.resetModules();
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: vitest_1.vi.fn().mockResolvedValue({}),
    });
    // Clear stored token between tests
    delete localStorageStore['session_token'];
});
(0, vitest_1.afterEach)(function () {
    vitest_1.vi.unstubAllEnvs();
});
(0, vitest_1.describe)('customFetch', function () {
    (0, vitest_1.it)('always sends credentials: include, even when options omits credentials', function () { return __awaiter(void 0, void 0, void 0, function () {
        var customFetch, _a, fetchOptions;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../lib/customFetch'); })];
                case 1:
                    customFetch = (_b.sent()).customFetch;
                    return [4 /*yield*/, customFetch('/test', { method: 'GET', credentials: 'omit' })];
                case 2:
                    _b.sent();
                    _a = mockFetch.mock.calls[0], fetchOptions = _a[1];
                    (0, vitest_1.expect)(fetchOptions.credentials).toBe('include');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('always sends credentials: include when options passes same-origin', function () { return __awaiter(void 0, void 0, void 0, function () {
        var customFetch, _a, fetchOptions;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../lib/customFetch'); })];
                case 1:
                    customFetch = (_b.sent()).customFetch;
                    return [4 /*yield*/, customFetch('/test', { credentials: 'same-origin' })];
                case 2:
                    _b.sent();
                    _a = mockFetch.mock.calls[0], fetchOptions = _a[1];
                    (0, vitest_1.expect)(fetchOptions.credentials).toBe('include');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('always sends credentials: include when no options are provided', function () { return __awaiter(void 0, void 0, void 0, function () {
        var customFetch, _a, fetchOptions;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../lib/customFetch'); })];
                case 1:
                    customFetch = (_b.sent()).customFetch;
                    return [4 /*yield*/, customFetch('/test')];
                case 2:
                    _b.sent();
                    _a = mockFetch.mock.calls[0], fetchOptions = _a[1];
                    (0, vitest_1.expect)(fetchOptions.credentials).toBe('include');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('merges caller headers with the default Content-Type header', function () { return __awaiter(void 0, void 0, void 0, function () {
        var customFetch, _a, fetchOptions, headers;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../lib/customFetch'); })];
                case 1:
                    customFetch = (_b.sent()).customFetch;
                    return [4 /*yield*/, customFetch('/test', {
                            method: 'POST',
                            headers: { 'X-Custom-Header': 'my-value' },
                        })];
                case 2:
                    _b.sent();
                    _a = mockFetch.mock.calls[0], fetchOptions = _a[1];
                    headers = fetchOptions.headers;
                    (0, vitest_1.expect)(headers['Content-Type']).toBe('application/json');
                    (0, vitest_1.expect)(headers['X-Custom-Header']).toBe('my-value');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('caller headers do not lose Content-Type even when options.headers is also set', function () { return __awaiter(void 0, void 0, void 0, function () {
        var customFetch, _a, fetchOptions, headers;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../lib/customFetch'); })];
                case 1:
                    customFetch = (_b.sent()).customFetch;
                    return [4 /*yield*/, customFetch('/test', {
                            headers: { 'Content-Type': 'text/plain' },
                        })];
                case 2:
                    _b.sent();
                    _a = mockFetch.mock.calls[0], fetchOptions = _a[1];
                    headers = fetchOptions.headers;
                    (0, vitest_1.expect)(headers['Content-Type']).toBe('text/plain');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('attaches Authorization: Bearer header when session_token is stored', function () { return __awaiter(void 0, void 0, void 0, function () {
        var customFetch, _a, fetchOptions, headers;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    localStorageStore['session_token'] = 'test-token-abc';
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../lib/customFetch'); })];
                case 1:
                    customFetch = (_b.sent()).customFetch;
                    return [4 /*yield*/, customFetch('/v1/paths')];
                case 2:
                    _b.sent();
                    _a = mockFetch.mock.calls[0], fetchOptions = _a[1];
                    headers = fetchOptions.headers;
                    (0, vitest_1.expect)(headers['Authorization']).toBe('Bearer test-token-abc');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('does not attach Authorization header when no session_token is stored', function () { return __awaiter(void 0, void 0, void 0, function () {
        var customFetch, _a, fetchOptions, headers;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../lib/customFetch'); })];
                case 1:
                    customFetch = (_b.sent()).customFetch;
                    return [4 /*yield*/, customFetch('/v1/paths')];
                case 2:
                    _b.sent();
                    _a = mockFetch.mock.calls[0], fetchOptions = _a[1];
                    headers = fetchOptions.headers;
                    (0, vitest_1.expect)(headers['Authorization']).toBeUndefined();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('caller-supplied Authorization header takes precedence over stored token', function () { return __awaiter(void 0, void 0, void 0, function () {
        var customFetch, _a, fetchOptions, headers;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    localStorageStore['session_token'] = 'stored-token';
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../lib/customFetch'); })];
                case 1:
                    customFetch = (_b.sent()).customFetch;
                    return [4 /*yield*/, customFetch('/v1/paths', {
                            headers: { Authorization: 'Bearer caller-token' },
                        })];
                case 2:
                    _b.sent();
                    _a = mockFetch.mock.calls[0], fetchOptions = _a[1];
                    headers = fetchOptions.headers;
                    (0, vitest_1.expect)(headers['Authorization']).toBe('Bearer caller-token');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('prepends the base URL from VITE_API_BASE_URL env var', function () { return __awaiter(void 0, void 0, void 0, function () {
        var customFetch, url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../lib/customFetch'); })];
                case 1:
                    customFetch = (_a.sent()).customFetch;
                    return [4 /*yield*/, customFetch('/v1/paths')];
                case 2:
                    _a.sent();
                    url = mockFetch.mock.calls[0][0];
                    (0, vitest_1.expect)(url).toBe('https://api.example.com/v1/paths');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('strips trailing slash from base URL before prepending path', function () { return __awaiter(void 0, void 0, void 0, function () {
        var customFetch, url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../lib/customFetch'); })];
                case 1:
                    customFetch = (_a.sent()).customFetch;
                    return [4 /*yield*/, customFetch('/v1/paths')];
                case 2:
                    _a.sent();
                    url = mockFetch.mock.calls[0][0];
                    (0, vitest_1.expect)(url).toBe('https://api.example.com/v1/paths');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('falls back to localhost:8080 when VITE_API_BASE_URL is not set', function () { return __awaiter(void 0, void 0, void 0, function () {
        var customFetch, url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    vitest_1.vi.stubEnv('VITE_API_BASE_URL', '');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../lib/customFetch'); })];
                case 1:
                    customFetch = (_a.sent()).customFetch;
                    return [4 /*yield*/, customFetch('/health')];
                case 2:
                    _a.sent();
                    url = mockFetch.mock.calls[0][0];
                    (0, vitest_1.expect)(url).toBe('http://localhost:8080/health');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('passes method and body from options through to fetch', function () { return __awaiter(void 0, void 0, void 0, function () {
        var customFetch, _a, fetchOptions;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../lib/customFetch'); })];
                case 1:
                    customFetch = (_b.sent()).customFetch;
                    return [4 /*yield*/, customFetch('/v1/paths', {
                            method: 'POST',
                            body: JSON.stringify({ name: 'test' }),
                        })];
                case 2:
                    _b.sent();
                    _a = mockFetch.mock.calls[0], fetchOptions = _a[1];
                    (0, vitest_1.expect)(fetchOptions.method).toBe('POST');
                    (0, vitest_1.expect)(fetchOptions.body).toBe(JSON.stringify({ name: 'test' }));
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('throws when the response is not ok', function () { return __awaiter(void 0, void 0, void 0, function () {
        var customFetch;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockFetch.mockResolvedValue({
                        ok: false,
                        status: 401,
                        headers: new Headers(),
                    });
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../lib/customFetch'); })];
                case 1:
                    customFetch = (_a.sent()).customFetch;
                    return [4 /*yield*/, (0, vitest_1.expect)(customFetch('/v1/paths')).rejects.toThrow('Request failed: 401')];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('returns undefined data for 204 No Content responses', function () { return __awaiter(void 0, void 0, void 0, function () {
        var customFetch, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockFetch.mockResolvedValue({
                        ok: true,
                        status: 204,
                        headers: new Headers(),
                        json: vitest_1.vi.fn(),
                    });
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../lib/customFetch'); })];
                case 1:
                    customFetch = (_a.sent()).customFetch;
                    return [4 /*yield*/, customFetch('/v1/paths')];
                case 2:
                    result = (_a.sent());
                    (0, vitest_1.expect)(result.data).toBeUndefined();
                    (0, vitest_1.expect)(result.status).toBe(204);
                    return [2 /*return*/];
            }
        });
    }); });
});
