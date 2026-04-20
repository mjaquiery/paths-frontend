"use strict";
/**
 * E2E tests: User exports data and downloads JSON / image archive.
 *
 * Scenarios (per AGENTS/plan.md Chunk 6):
 *
 *   Scenario 2 — User exports data:
 *     Starting from a state with ≥ 1 path and ≥ 1 entry, navigate to the
 *     Settings page, select the path checkbox, trigger an export, wait for the
 *     job to reach the "ready" state, and verify the Download JSON / Download
 *     images buttons appear.
 *
 *   Scenario 3 — User downloads JSON and image archive:
 *     Extends Scenario 2 by clicking each download button and asserting that
 *     the browser initiates a file download.
 *
 * All backend API calls are intercepted by page.route() — no real server
 * is required.
 */
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
var test_1 = require("playwright/test");
var index_js_1 = require("../fixtures/index.js");
var API_BASE = 'http://localhost:8080';
/**
 * Inject a mock authenticated session into localStorage before the page
 * loads, simulating a completed OAuth callback.
 */
function injectMockSession(page) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.addInitScript(function (_a) {
                        var user = _a.user, token = _a.token;
                        localStorage.setItem('session_token', token);
                        localStorage.setItem('user', JSON.stringify(user));
                    }, { user: index_js_1.MOCK_USER, token: index_js_1.MOCK_TOKEN })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Register all API routes needed by the Settings / Export flow.
 *
 * @param page          The Playwright page.
 * @param exportReadyImmediately  When true, the export job is returned as
 *   "ready" from the very first GET /v1/exports/{id} call.  Otherwise, it
 *   transitions from "queued" to "ready" on the second poll.
 */
function setupExportRoutes(page_1) {
    return __awaiter(this, arguments, void 0, function (page, exportReadyImmediately) {
        var jobId, pollCount;
        if (exportReadyImmediately === void 0) { exportReadyImmediately = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jobId = index_js_1.MOCK_EXPORT_JOB_QUEUED.id;
                    // Paths list
                    return [4 /*yield*/, page.route("".concat(API_BASE, "/v1/paths"), function (route, request) {
                            if (request.method() === 'GET') {
                                return route.fulfill({ json: [index_js_1.MOCK_PATH] });
                            }
                            return route.continue();
                        })];
                case 1:
                    // Paths list
                    _a.sent();
                    // Create export job
                    return [4 /*yield*/, page.route("".concat(API_BASE, "/v1/exports"), function (route, request) {
                            if (request.method() === 'POST') {
                                return route.fulfill({ status: 202, json: index_js_1.MOCK_EXPORT_JOB_QUEUED });
                            }
                            return route.continue();
                        })];
                case 2:
                    // Create export job
                    _a.sent();
                    pollCount = 0;
                    return [4 /*yield*/, page.route("".concat(API_BASE, "/v1/exports/").concat(jobId), function (route) {
                            pollCount += 1;
                            var ready = exportReadyImmediately || pollCount >= 2;
                            return route.fulfill({
                                json: ready ? index_js_1.MOCK_EXPORT_JOB_READY : index_js_1.MOCK_EXPORT_JOB_QUEUED,
                            });
                        })];
                case 3:
                    _a.sent();
                    // Download URL endpoints
                    return [4 /*yield*/, page.route("".concat(API_BASE, "/v1/exports/").concat(jobId, "/download/json"), function (route) {
                            return route.fulfill({ json: index_js_1.MOCK_DOWNLOAD_URL_JSON });
                        })];
                case 4:
                    // Download URL endpoints
                    _a.sent();
                    return [4 /*yield*/, page.route("".concat(API_BASE, "/v1/exports/").concat(jobId, "/download/images"), function (route) {
                            return route.fulfill({ json: index_js_1.MOCK_DOWNLOAD_URL_IMAGES });
                        })];
                case 5:
                    _a.sent();
                    // Mock the actual file download URLs so downloadFileFromUrl() can fetch them
                    return [4 /*yield*/, page.route("".concat(API_BASE, "/mock-download/paths_export.json"), function (route) {
                            return route.fulfill({
                                status: 200,
                                contentType: 'application/json',
                                body: JSON.stringify({ source: 'e2e_mock', entries: [] }),
                            });
                        })];
                case 6:
                    // Mock the actual file download URLs so downloadFileFromUrl() can fetch them
                    _a.sent();
                    return [4 /*yield*/, page.route("".concat(API_BASE, "/mock-download/paths_export.zip"), function (route) {
                            return route.fulfill({
                                status: 200,
                                contentType: 'application/zip',
                                body: Buffer.from('PK'),
                            });
                        })];
                case 7:
                    _a.sent();
                    // Absorb any remaining API requests
                    return [4 /*yield*/, page.route("".concat(API_BASE, "/**"), function (route) { return route.fulfill({ status: 204 }); })];
                case 8:
                    // Absorb any remaining API requests
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
test_1.test.describe('export data', function () {
    test_1.test.beforeEach(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, injectMockSession(page)];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('user triggers an export and sees download buttons', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, setupExportRoutes(page)];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, page.goto('/settings')];
                case 2:
                    _c.sent();
                    // Wait for the ExportCard to render (it is inside a <Suspense> block)
                    return [4 /*yield*/, page.waitForSelector('ion-checkbox', { timeout: 10000 })];
                case 3:
                    // Wait for the ExportCard to render (it is inside a <Suspense> block)
                    _c.sent();
                    // Select the path checkbox in the export card
                    return [4 /*yield*/, page.locator('ion-checkbox').first().click()];
                case 4:
                    // Select the path checkbox in the export card
                    _c.sent();
                    // Trigger the export
                    return [4 /*yield*/, page.getByRole('button', { name: 'Trigger export' }).click()];
                case 5:
                    // Trigger the export
                    _c.sent();
                    // The export job polls until "ready" and then reveals download buttons.
                    // Allow up to 20 s to account for the 2-second polling interval.
                    return [4 /*yield*/, page.waitForSelector('ion-button:has-text("Download JSON")', {
                            timeout: 20000,
                        })];
                case 6:
                    // The export job polls until "ready" and then reveals download buttons.
                    // Allow up to 20 s to account for the 2-second polling interval.
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.getByRole('button', { name: 'Download JSON' })).toBeVisible()];
                case 7:
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page.getByRole('button', { name: 'Download images' })).toBeVisible()];
                case 8:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('user downloads JSON and image archive', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var jsonDownload, imagesDownload;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: 
                // Use immediately-ready export so the download buttons appear quickly
                return [4 /*yield*/, setupExportRoutes(page, true)];
                case 1:
                    // Use immediately-ready export so the download buttons appear quickly
                    _c.sent();
                    return [4 /*yield*/, page.goto('/settings')];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForSelector('ion-checkbox', { timeout: 10000 })];
                case 3:
                    _c.sent();
                    // Select the path for export
                    return [4 /*yield*/, page.locator('ion-checkbox').first().click()];
                case 4:
                    // Select the path for export
                    _c.sent();
                    // Trigger the export
                    return [4 /*yield*/, page.getByRole('button', { name: 'Trigger export' }).click()];
                case 5:
                    // Trigger the export
                    _c.sent();
                    // Wait for download buttons
                    return [4 /*yield*/, page.waitForSelector('ion-button:has-text("Download JSON")', {
                            timeout: 20000,
                        })];
                case 6:
                    // Wait for download buttons
                    _c.sent();
                    return [4 /*yield*/, Promise.all([
                            page.waitForEvent('download'),
                            page.getByRole('button', { name: 'Download JSON' }).click(),
                        ])];
                case 7:
                    jsonDownload = (_c.sent())[0];
                    (0, test_1.expect)(jsonDownload.suggestedFilename()).toMatch(/\.json$/);
                    return [4 /*yield*/, Promise.all([
                            page.waitForEvent('download'),
                            page.getByRole('button', { name: 'Download images' }).click(),
                        ])];
                case 8:
                    imagesDownload = (_c.sent())[0];
                    (0, test_1.expect)(imagesDownload.suggestedFilename()).toMatch(/\.zip$/);
                    return [2 /*return*/];
            }
        });
    }); });
});
