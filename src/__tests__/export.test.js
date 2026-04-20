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
var export_1 = require("../utils/export");
var db_1 = require("../lib/db");
(0, vitest_1.describe)('export status', function () {
    (0, vitest_1.it)('recognizes ready state', function () {
        (0, vitest_1.expect)((0, export_1.isExportReady)({
            id: '1',
            state: 'ready',
            requested_path_ids: [],
            created_at: '',
            updated_at: '',
            expires_at: null,
            failure_code: null,
            attempt_count: 1,
        })).toBe(true);
    });
    (0, vitest_1.it)('treats failed and expired as terminal', function () {
        (0, vitest_1.expect)((0, export_1.isExportTerminal)({
            id: '1',
            state: 'failed',
            requested_path_ids: [],
            created_at: '',
            updated_at: '',
            expires_at: null,
            failure_code: null,
            attempt_count: 1,
        })).toBe(true);
    });
});
(0, vitest_1.describe)('downloadFileFromUrl', function () {
    var anchorClickSpy;
    var anchorElement;
    (0, vitest_1.beforeEach)(function () {
        anchorClickSpy = vitest_1.vi.fn();
        anchorElement = {
            href: '',
            download: '',
            click: anchorClickSpy,
        };
        vitest_1.vi.spyOn(document, 'createElement').mockReturnValue(anchorElement);
        vitest_1.vi.spyOn(document.body, 'appendChild').mockImplementation(function () { return anchorElement; });
        vitest_1.vi.spyOn(document.body, 'removeChild').mockImplementation(function () { return anchorElement; });
        var mockBlob = new Blob(['{}'], { type: 'application/json' });
        global.fetch = vitest_1.vi.fn().mockResolvedValue({
            ok: true,
            blob: function () { return Promise.resolve(mockBlob); },
        });
        global.URL.createObjectURL = vitest_1.vi.fn().mockReturnValue('blob:mock-url');
        global.URL.revokeObjectURL = vitest_1.vi.fn();
    });
    (0, vitest_1.afterEach)(function () {
        vitest_1.vi.restoreAllMocks();
    });
    (0, vitest_1.it)('fetches the url and triggers a download with the given filename', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, export_1.downloadFileFromUrl)('https://example.com/export.json', 'export.json')];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(global.fetch).toHaveBeenCalledWith('https://example.com/export.json');
                    (0, vitest_1.expect)(global.URL.createObjectURL).toHaveBeenCalled();
                    (0, vitest_1.expect)(anchorElement.download).toBe('export.json');
                    (0, vitest_1.expect)(anchorClickSpy).toHaveBeenCalled();
                    (0, vitest_1.expect)(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('throws if the response is not ok', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    global.fetch = vitest_1.vi.fn().mockResolvedValue({
                        ok: false,
                        status: 404,
                        statusText: 'Not Found',
                    });
                    return [4 /*yield*/, (0, vitest_1.expect)((0, export_1.downloadFileFromUrl)('https://example.com/missing.json', 'export.json')).rejects.toThrow('Download failed: 404 Not Found')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
(0, vitest_1.describe)('exportLocalData', function () {
    var anchorClickSpy;
    var anchorElement;
    (0, vitest_1.beforeEach)(function () {
        anchorClickSpy = vitest_1.vi.fn();
        anchorElement = {
            href: '',
            download: '',
            click: anchorClickSpy,
        };
        vitest_1.vi.spyOn(document, 'createElement').mockReturnValue(anchorElement);
        vitest_1.vi.spyOn(document.body, 'appendChild').mockImplementation(function () { return anchorElement; });
        vitest_1.vi.spyOn(document.body, 'removeChild').mockImplementation(function () { return anchorElement; });
        global.URL.createObjectURL = vitest_1.vi.fn().mockReturnValue('blob:local-url');
        global.URL.revokeObjectURL = vitest_1.vi.fn();
    });
    (0, vitest_1.afterEach)(function () {
        vitest_1.vi.restoreAllMocks();
    });
    (0, vitest_1.it)('queries entryContent by path_id and triggers a JSON download', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockEntries;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockEntries = [
                        {
                            cache_key: 'path-1:entry-1',
                            id: 'entry-1',
                            path_id: 'path-1',
                            day: '2024-01-01',
                            edit_id: 42,
                            content: 'Hello world',
                            image_filenames: ['img.png'],
                        },
                    ];
                    vitest_1.vi.spyOn(db_1.db.entryContent, 'where').mockReturnValue({
                        anyOf: vitest_1.vi.fn().mockReturnValue({
                            toArray: vitest_1.vi.fn().mockResolvedValue(mockEntries),
                        }),
                    });
                    return [4 /*yield*/, (0, export_1.exportLocalData)(['path-1'])];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(db_1.db.entryContent.where).toHaveBeenCalledWith('path_id');
                    (0, vitest_1.expect)(global.URL.createObjectURL).toHaveBeenCalledWith(vitest_1.expect.any(Blob));
                    (0, vitest_1.expect)(anchorElement.download).toMatch(/^paths_local_backup_\d{8}\.json$/);
                    (0, vitest_1.expect)(anchorClickSpy).toHaveBeenCalled();
                    (0, vitest_1.expect)(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:local-url');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('includes all entry fields in the exported JSON', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockEntries, capturedBlob, text, parsed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockEntries = [
                        {
                            cache_key: 'path-1:entry-1',
                            id: 'entry-1',
                            path_id: 'path-1',
                            day: '2024-01-15',
                            edit_id: 7,
                            content: 'My journal entry',
                            image_filenames: ['photo.jpg', 'selfie.png'],
                        },
                    ];
                    vitest_1.vi.spyOn(db_1.db.entryContent, 'where').mockReturnValue({
                        anyOf: vitest_1.vi.fn().mockReturnValue({
                            toArray: vitest_1.vi.fn().mockResolvedValue(mockEntries),
                        }),
                    });
                    global.URL.createObjectURL = vitest_1.vi.fn().mockImplementation(function (blob) {
                        capturedBlob = blob;
                        return 'blob:local-url';
                    });
                    return [4 /*yield*/, (0, export_1.exportLocalData)(['path-1'])];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            var reader = new FileReader();
                            reader.onload = function () { return resolve(reader.result); };
                            reader.onerror = reject;
                            reader.readAsText(capturedBlob);
                        })];
                case 2:
                    text = _a.sent();
                    parsed = JSON.parse(text);
                    (0, vitest_1.expect)(parsed.source).toBe('local_cache');
                    (0, vitest_1.expect)(parsed.entries).toHaveLength(1);
                    (0, vitest_1.expect)(parsed.entries[0].entry_id).toBe('entry-1');
                    (0, vitest_1.expect)(parsed.entries[0].image_filenames).toEqual([
                        'photo.jpg',
                        'selfie.png',
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('defaults image_filenames to empty array when undefined', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockEntries, capturedBlob, text, parsed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockEntries = [
                        {
                            cache_key: 'path-1:entry-2',
                            id: 'entry-2',
                            path_id: 'path-1',
                            day: '2024-02-01',
                            edit_id: 1,
                            content: 'No images here',
                            // image_filenames intentionally omitted
                        },
                    ];
                    vitest_1.vi.spyOn(db_1.db.entryContent, 'where').mockReturnValue({
                        anyOf: vitest_1.vi.fn().mockReturnValue({
                            toArray: vitest_1.vi.fn().mockResolvedValue(mockEntries),
                        }),
                    });
                    global.URL.createObjectURL = vitest_1.vi.fn().mockImplementation(function (blob) {
                        capturedBlob = blob;
                        return 'blob:local-url';
                    });
                    return [4 /*yield*/, (0, export_1.exportLocalData)(['path-1'])];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            var reader = new FileReader();
                            reader.onload = function () { return resolve(reader.result); };
                            reader.onerror = reject;
                            reader.readAsText(capturedBlob);
                        })];
                case 2:
                    text = _a.sent();
                    parsed = JSON.parse(text);
                    (0, vitest_1.expect)(parsed.entries[0].image_filenames).toEqual([]);
                    return [2 /*return*/];
            }
        });
    }); });
});
