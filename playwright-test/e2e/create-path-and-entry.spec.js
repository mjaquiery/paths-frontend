"use strict";
/**
 * E2E test: User creates a Path and an Entry.
 *
 * Scenario (per AGENTS/plan.md Chunk 6):
 *   - Log in via mocked localStorage (simulating a completed OAuth callback).
 *   - Navigate to /paths/new, fill in a title, submit — verify redirect to /.
 *   - Navigate to /entry/{pathId}/new, fill in content, publish — verify
 *     navigation to the new entry view.
 *
 * All backend API calls are intercepted by page.route() so no real server
 * is required.
 */
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
var test_1 = require("playwright/test");
var index_js_1 = require("../fixtures/index.js");
var API_BASE = 'http://localhost:8080';
/**
 * Inject a mock authenticated session into localStorage before the page
 * loads.  This simulates a completed OAuth callback without requiring a
 * real OAuth provider.
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
test_1.test.describe('create path and entry', function () {
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
    (0, test_1.test)('user creates a new path', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var pathsCreated;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    pathsCreated = false;
                    return [4 /*yield*/, page.route("".concat(API_BASE, "/v1/paths"), function (route, request) {
                            if (request.method() === 'POST') {
                                pathsCreated = true;
                                return route.fulfill({ status: 201, json: index_js_1.MOCK_PATH });
                            }
                            // GET: empty until the path is created, then return it
                            return route.fulfill({ json: pathsCreated ? [index_js_1.MOCK_PATH] : [] });
                        })];
                case 1:
                    _c.sent();
                    // Absorb any other API requests so they don't cause network errors
                    return [4 /*yield*/, page.route("".concat(API_BASE, "/**"), function (route) {
                            return route.fulfill({ status: 204 });
                        })];
                case 2:
                    // Absorb any other API requests so they don't cause network errors
                    _c.sent();
                    return [4 /*yield*/, page.goto('/paths/new')];
                case 3:
                    _c.sent();
                    // Fill in the path title — ion-input wraps a native <input> in shadow DOM;
                    // Playwright's getByPlaceholder pierces shadow roots automatically.
                    return [4 /*yield*/, page.getByPlaceholder('Path title').fill('E2E Test Path')];
                case 4:
                    // Fill in the path title — ion-input wraps a native <input> in shadow DOM;
                    // Playwright's getByPlaceholder pierces shadow roots automatically.
                    _c.sent();
                    // Submit the form
                    return [4 /*yield*/, page.getByRole('button', { name: 'Create Path' }).click()];
                case 5:
                    // Submit the form
                    _c.sent();
                    // The new.vue handler calls router.replace('/') on success
                    return [4 /*yield*/, page.waitForURL('/')];
                case 6:
                    // The new.vue handler calls router.replace('/') on success
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page).toHaveURL('/')];
                case 7:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, test_1.test)('user creates a new entry for an existing path', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var pathId, draftId, entryId;
        var page = _b.page;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    pathId = index_js_1.MOCK_PATH.path_id;
                    draftId = index_js_1.MOCK_DRAFT.id;
                    entryId = index_js_1.MOCK_ENTRY.id;
                    // Paths: return the pre-existing mock path so the editor can load
                    return [4 /*yield*/, page.route("".concat(API_BASE, "/v1/paths"), function (route, request) {
                            if (request.method() === 'GET') {
                                return route.fulfill({ json: [index_js_1.MOCK_PATH] });
                            }
                            return route.continue();
                        })];
                case 1:
                    // Paths: return the pre-existing mock path so the editor can load
                    _c.sent();
                    // Draft creation: GET /v1/paths/{pathId}/entries/drafts?day=…
                    return [4 /*yield*/, page.route(new RegExp("".concat(API_BASE.replace(/\./g, '\\.'), "/v1/paths/").concat(pathId, "/entries/drafts")), function (route) { return route.fulfill({ json: index_js_1.MOCK_DRAFT }); })];
                case 2:
                    // Draft creation: GET /v1/paths/{pathId}/entries/drafts?day=…
                    _c.sent();
                    // Draft patch (autosave / content flush before commit)
                    return [4 /*yield*/, page.route("".concat(API_BASE, "/v1/entry-drafts/").concat(draftId), function (route, request) {
                            if (request.method() === 'PATCH') {
                                return route.fulfill({
                                    json: __assign(__assign({}, index_js_1.MOCK_DRAFT), { content: 'Hello E2E world' }),
                                });
                            }
                            if (request.method() === 'DELETE') {
                                return route.fulfill({ status: 204 });
                            }
                            return route.continue();
                        })];
                case 3:
                    // Draft patch (autosave / content flush before commit)
                    _c.sent();
                    // Draft commit: POST /v1/entry-drafts/{draftId}/commit
                    return [4 /*yield*/, page.route("".concat(API_BASE, "/v1/entry-drafts/").concat(draftId, "/commit"), function (route) {
                            return route.fulfill({ json: index_js_1.MOCK_ENTRY });
                        })];
                case 4:
                    // Draft commit: POST /v1/entry-drafts/{draftId}/commit
                    _c.sent();
                    // Entries list returned after cache invalidation on the entry view
                    return [4 /*yield*/, page.route(new RegExp("".concat(API_BASE.replace(/\./g, '\\.'), "/v1/paths/").concat(pathId, "/entries")), function (route) { return route.fulfill({ json: [index_js_1.MOCK_ENTRY] }); })];
                case 5:
                    // Entries list returned after cache invalidation on the entry view
                    _c.sent();
                    // Absorb remaining API calls
                    return [4 /*yield*/, page.route("".concat(API_BASE, "/**"), function (route) {
                            return route.fulfill({ status: 204 });
                        })];
                case 6:
                    // Absorb remaining API calls
                    _c.sent();
                    // Navigate directly to the entry-creation view for the given path.
                    // The route param pre-populates selectedPathId, which triggers ensureDraft()
                    // immediately on mount (no need to interact with the ion-select).
                    return [4 /*yield*/, page.goto("/entry/".concat(pathId, "/new"))];
                case 7:
                    // Navigate directly to the entry-creation view for the given path.
                    // The route param pre-populates selectedPathId, which triggers ensureDraft()
                    // immediately on mount (no need to interact with the ion-select).
                    _c.sent();
                    // Wait for the editor textarea to be visible (draft has been initialised)
                    return [4 /*yield*/, page.waitForSelector('ion-textarea', { timeout: 10000 })];
                case 8:
                    // Wait for the editor textarea to be visible (draft has been initialised)
                    _c.sent();
                    // Fill in the entry content — ion-textarea wraps a native <textarea>
                    return [4 /*yield*/, page
                            .getByPlaceholder('Write your entry... (markdown supported)')
                            .fill('Hello E2E world')];
                case 9:
                    // Fill in the entry content — ion-textarea wraps a native <textarea>
                    _c.sent();
                    // Publish the entry
                    return [4 /*yield*/, page.getByRole('button', { name: 'Publish' }).click()];
                case 10:
                    // Publish the entry
                    _c.sent();
                    // After a successful commit the app navigates to /entry/{pathId}/{entryId}
                    return [4 /*yield*/, page.waitForURL(new RegExp("/entry/".concat(pathId, "/").concat(entryId)), {
                            timeout: 15000,
                        })];
                case 11:
                    // After a successful commit the app navigates to /entry/{pathId}/{entryId}
                    _c.sent();
                    return [4 /*yield*/, (0, test_1.expect)(page).toHaveURL(new RegExp("/entry/".concat(pathId, "/").concat(entryId)))];
                case 12:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
