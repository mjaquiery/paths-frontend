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
var test_utils_1 = require("@vue/test-utils");
var vue_query_1 = require("@tanstack/vue-query");
var vue_1 = require("vue");
var MarkdownContent_vue_1 = require("../components/MarkdownContent.vue");
var fetchMock = vitest_1.vi.fn();
vitest_1.vi.stubGlobal('fetch', fetchMock);
function waitFor(assertion_1) {
    return __awaiter(this, arguments, void 0, function (assertion, attempts) {
        var attempt, error_1;
        if (attempts === void 0) { attempts = 10; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    attempt = 0;
                    _a.label = 1;
                case 1:
                    if (!(attempt < attempts)) return [3 /*break*/, 7];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 3, , 6]);
                    assertion();
                    return [2 /*return*/];
                case 3:
                    error_1 = _a.sent();
                    if (attempt === attempts - 1)
                        throw error_1;
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 0); })];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 6:
                    attempt++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/];
            }
        });
    });
}
vitest_1.vi.mock('../generated/apiClient', function () { return ({
    getImageDownloadUrl: function (imageId) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, ({
                    data: {
                        image_url: "/storybook-images/".concat(imageId, "/full"),
                        thumbnail_url: "/storybook-images/".concat(imageId, "/thumbnail"),
                        expires_in_seconds: 600,
                    },
                    status: 200,
                    headers: new Headers(),
                })];
        });
    }); },
}); });
(0, vitest_1.describe)('MarkdownContent image rendering', function () {
    (0, vitest_1.it)('resolves inline markdown image filenames to download URLs', function () { return __awaiter(void 0, void 0, void 0, function () {
        var queryClient, wrapper, image;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchMock.mockResolvedValueOnce({
                        ok: true,
                        status: 200,
                        blob: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, new Blob(['image-bytes'], { type: 'image/jpeg' })];
                        }); }); },
                    });
                    queryClient = new vue_query_1.QueryClient({
                        defaultOptions: { queries: { retry: false } },
                    });
                    wrapper = (0, test_utils_1.mount)(MarkdownContent_vue_1.default, {
                        props: {
                            content: '![Sunrise](sunrise-river.jpg)',
                            images: [
                                {
                                    id: 'img-sunrise-river',
                                    entry_id: 'entry-1',
                                    filename: 'sunrise-river.jpg',
                                    status: 'ready',
                                    strip_metadata: true,
                                    content_type: 'image/jpeg',
                                    byte_size: 1234,
                                },
                            ],
                        },
                        global: {
                            plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]],
                        },
                    });
                    return [4 /*yield*/, waitFor(function () {
                            var image = wrapper.find('img');
                            (0, vitest_1.expect)(image.exists()).toBe(true);
                            (0, vitest_1.expect)(fetchMock).toHaveBeenCalledWith('/storybook-images/img-sunrise-river/full');
                            (0, vitest_1.expect)(image.attributes('src')).toMatch(/^data:image\/jpeg;base64,/);
                        })];
                case 1:
                    _a.sent();
                    image = wrapper.find('img');
                    (0, vitest_1.expect)(image.attributes('alt')).toBe('Sunrise');
                    (0, vitest_1.expect)(wrapper.find('figcaption').text()).toBe('Sunrise');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('normalizes filenames with spaces before rendering markdown images', function () { return __awaiter(void 0, void 0, void 0, function () {
        var queryClient, filename, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchMock.mockResolvedValueOnce({
                        ok: true,
                        status: 200,
                        blob: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, new Blob(['image-bytes'], { type: 'image/png' })];
                        }); }); },
                    });
                    queryClient = new vue_query_1.QueryClient({
                        defaultOptions: { queries: { retry: false } },
                    });
                    filename = 'ChatGPT Image Apr 29, 2025, 07_47_54 AM.png';
                    wrapper = (0, test_utils_1.mount)(MarkdownContent_vue_1.default, {
                        props: {
                            content: "![".concat(filename, "](").concat(filename, ")"),
                            images: [
                                {
                                    id: 'img-chatgpt-image',
                                    entry_id: 'entry-1',
                                    filename: filename,
                                    status: 'ready',
                                    strip_metadata: true,
                                    content_type: 'image/png',
                                    byte_size: 1234,
                                },
                            ],
                        },
                        global: {
                            plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]],
                        },
                    });
                    return [4 /*yield*/, waitFor(function () {
                            var image = wrapper.find('img');
                            (0, vitest_1.expect)(image.exists()).toBe(true);
                            (0, vitest_1.expect)(image.attributes('src')).toMatch(/^data:image\/png;base64,/);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('does not double-encode an already-encoded markdown filename', function () { return __awaiter(void 0, void 0, void 0, function () {
        var queryClient, filename, encodedFilename, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchMock.mockResolvedValueOnce({
                        ok: true,
                        status: 200,
                        blob: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, new Blob(['image-bytes'], { type: 'image/png' })];
                        }); }); },
                    });
                    queryClient = new vue_query_1.QueryClient({
                        defaultOptions: { queries: { retry: false } },
                    });
                    filename = 'ChatGPT Image Apr 29, 2025, 07_47_54 AM.png';
                    encodedFilename = 'ChatGPT%20Image%20Apr%2029%2C%202025%2C%2007_47_54%20AM.png';
                    wrapper = (0, test_utils_1.mount)(MarkdownContent_vue_1.default, {
                        props: {
                            content: "![".concat(filename, "](").concat(encodedFilename, ")"),
                            images: [
                                {
                                    id: 'img-chatgpt-image-encoded',
                                    entry_id: 'entry-1',
                                    filename: filename,
                                    status: 'ready',
                                    strip_metadata: true,
                                    content_type: 'image/png',
                                    byte_size: 1234,
                                },
                            ],
                        },
                        global: {
                            plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]],
                        },
                    });
                    return [4 /*yield*/, waitFor(function () {
                            var image = wrapper.find('img');
                            (0, vitest_1.expect)(image.exists()).toBe(true);
                            (0, vitest_1.expect)(image.attributes('src')).toMatch(/^data:image\/png;base64,/);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('rewrites local preview URLs to data URLs for freshly uploaded images', function () { return __awaiter(void 0, void 0, void 0, function () {
        var queryClient, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fetchMock.mockResolvedValueOnce({
                        ok: true,
                        status: 200,
                        blob: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, new Blob(['local-image-bytes'], { type: 'image/png' })];
                        }); }); },
                    });
                    queryClient = new vue_query_1.QueryClient({
                        defaultOptions: { queries: { retry: false } },
                    });
                    wrapper = (0, test_utils_1.mount)(MarkdownContent_vue_1.default, {
                        props: {
                            content: '![Fresh upload](fresh-upload.png)',
                            localImageUrls: {
                                'fresh-upload.png': 'blob:http://localhost/fresh-upload',
                            },
                        },
                        global: {
                            plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]],
                        },
                    });
                    return [4 /*yield*/, waitFor(function () {
                            var image = wrapper.find('img');
                            (0, vitest_1.expect)(image.exists()).toBe(true);
                            (0, vitest_1.expect)(fetchMock).toHaveBeenCalledWith('blob:http://localhost/fresh-upload');
                            (0, vitest_1.expect)(image.attributes('src')).toMatch(/^data:image\/png;base64,/);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
