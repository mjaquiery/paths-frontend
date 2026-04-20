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
 * Integration tests for PathsSelectorBar subscription management.
 *
 * Tests the "Invite user" flow: user fills in an email address for one of
 * their owned paths, clicks "Invite", and the POST
 * /v1/paths/:pathCode/subscriptions request is made via the MSW-intercepted
 * API.
 *
 * Note: GET /v1/paths is pre-populated in the TanStack Query cache to avoid
 * timing issues with useQuery scheduling in the test environment.
 * POST requests to create subscriptions are tested via MSW as genuine HTTP.
 */
var vitest_1 = require("vitest");
var vue_1 = require("vue");
var vue_query_1 = require("@tanstack/vue-query");
var test_utils_1 = require("@vue/test-utils");
var node_1 = require("msw/node");
var msw_1 = require("msw");
var PathSubscriptionManager_vue_1 = require("../components/PathSubscriptionManager.vue");
// ---------------------------------------------------------------------------
// Mock Dexie
// ---------------------------------------------------------------------------
vitest_1.vi.mock('../lib/db', function () { return ({
    isPathHidden: vitest_1.vi.fn().mockResolvedValue(false),
    setPathHidden: vitest_1.vi.fn().mockResolvedValue(undefined),
    getPathOrder: vitest_1.vi.fn().mockReturnValue([]),
    setPathOrder: vitest_1.vi.fn(),
}); });
// ---------------------------------------------------------------------------
// Stub Ionic components
// ---------------------------------------------------------------------------
var ionicStubs = {
    IonButton: {
        template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
        props: ['disabled', 'size', 'fill', 'color'],
        emits: ['click'],
    },
    IonInput: {
        template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
        props: ['modelValue', 'placeholder', 'type'],
        emits: ['update:modelValue'],
    },
};
// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
var ownedPath = {
    path_id: 'path-1',
    uuid: 'uuid-path-1',
    owner_user_id: 'user-1',
    title: 'My Path',
    description: null,
    color: '#3949ab',
    is_public: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
};
// ---------------------------------------------------------------------------
// MSW server — only for mutation endpoints
// ---------------------------------------------------------------------------
var server = (0, node_1.setupServer)(msw_1.http.get('*/v1/paths/:pathCode/subscriptions', function () {
    return msw_1.HttpResponse.json([], { status: 200 });
}), msw_1.http.post('*/v1/paths/:pathCode/subscriptions', function () {
    return msw_1.HttpResponse.json({ invitation_id: 'inv-1', status: 'invited' }, { status: 201 });
}));
(0, vitest_1.beforeAll)(function () { return server.listen({ onUnhandledRequest: 'warn' }); });
(0, vitest_1.afterEach)(function () { return server.resetHandlers(); });
(0, vitest_1.afterAll)(function () { return server.close(); });
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function createQueryClient() {
    return new vue_query_1.QueryClient({ defaultOptions: { queries: { retry: false } } });
}
function mountManager() {
    return __awaiter(this, void 0, void 0, function () {
        var queryClient, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    queryClient = createQueryClient();
                    wrapper = (0, test_utils_1.mount)(PathSubscriptionManager_vue_1.default, {
                        props: { pathCode: ownedPath.path_id, pathTitle: ownedPath.title },
                        global: {
                            plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]],
                            stubs: ionicStubs,
                        },
                    });
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, wrapper];
            }
        });
    });
}
// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
(0, vitest_1.describe)('PathSubscriptionManager – subscription management (MSW integration)', function () {
    (0, vitest_1.it)('shows the subscriber management section for a path', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mountManager()];
                case 1:
                    wrapper = _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toContain('My Path');
                    (0, vitest_1.expect)(wrapper.html()).toContain('Invite');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('Invite button is disabled when email field is empty', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, inviteBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mountManager()];
                case 1:
                    wrapper = _a.sent();
                    inviteBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().trim() === 'Invite'; });
                    (0, vitest_1.expect)(inviteBtn).toBeDefined();
                    (0, vitest_1.expect)(inviteBtn.attributes('disabled')).toBeDefined();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('Invite button becomes enabled when an email is entered', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, inputs, inviteBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mountManager()];
                case 1:
                    wrapper = _a.sent();
                    inputs = wrapper.findAll('input');
                    (0, vitest_1.expect)(inputs.length).toBeGreaterThan(0);
                    return [4 /*yield*/, inputs[inputs.length - 1].setValue('user@example.com')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 3:
                    _a.sent();
                    inviteBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().trim() === 'Invite'; });
                    (0, vitest_1.expect)(inviteBtn.attributes('disabled')).toBeUndefined();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('calls POST /v1/paths/:pathCode/subscriptions with the correct email', function () { return __awaiter(void 0, void 0, void 0, function () {
        var subscriptionRequests, wrapper, inputs, inviteBtn, body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    subscriptionRequests = [];
                    server.use(msw_1.http.post('*/v1/paths/:pathCode/subscriptions', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                        var request = _b.request;
                        return __generator(this, function (_c) {
                            subscriptionRequests.push(request.clone());
                            return [2 /*return*/, msw_1.HttpResponse.json({ invitation_id: 'inv-1', status: 'invited' }, { status: 201 })];
                        });
                    }); }));
                    return [4 /*yield*/, mountManager()];
                case 1:
                    wrapper = _a.sent();
                    inputs = wrapper.findAll('input');
                    return [4 /*yield*/, inputs[inputs.length - 1].setValue('invited@example.com')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 3:
                    _a.sent();
                    inviteBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().trim() === 'Invite'; });
                    return [4 /*yield*/, inviteBtn.trigger('click')];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 5:
                    _a.sent();
                    (0, vitest_1.expect)(subscriptionRequests).toHaveLength(1);
                    return [4 /*yield*/, subscriptionRequests[0].json()];
                case 6:
                    body = _a.sent();
                    (0, vitest_1.expect)(body.email).toBe('invited@example.com');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('shows a success message after successful invitation', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, inputs, inviteBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mountManager()];
                case 1:
                    wrapper = _a.sent();
                    inputs = wrapper.findAll('input');
                    return [4 /*yield*/, inputs[inputs.length - 1].setValue('user@example.com')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 3:
                    _a.sent();
                    inviteBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().trim() === 'Invite'; });
                    return [4 /*yield*/, inviteBtn.trigger('click')];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 5:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toContain('Invitation sent successfully');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('clears the email field after a successful invitation', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, inputs, inviteInput, inviteBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mountManager()];
                case 1:
                    wrapper = _a.sent();
                    inputs = wrapper.findAll('input');
                    inviteInput = inputs[inputs.length - 1];
                    return [4 /*yield*/, inviteInput.setValue('user@example.com')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 3:
                    _a.sent();
                    inviteBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().trim() === 'Invite'; });
                    return [4 /*yield*/, inviteBtn.trigger('click')];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 5:
                    _a.sent();
                    (0, vitest_1.expect)(inviteInput.element.value).toBe('');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('shows an error message when the invitation fails', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, inputs, inviteBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    server.use(msw_1.http.post('*/v1/paths/:pathCode/subscriptions', function () {
                        return msw_1.HttpResponse.json({ detail: 'User not found' }, { status: 404 });
                    }));
                    return [4 /*yield*/, mountManager()];
                case 1:
                    wrapper = _a.sent();
                    inputs = wrapper.findAll('input');
                    return [4 /*yield*/, inputs[inputs.length - 1].setValue('bad@example.com')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 3:
                    _a.sent();
                    inviteBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().trim() === 'Invite'; });
                    return [4 /*yield*/, inviteBtn.trigger('click')];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 5:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toContain('Failed to invite');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('clears the success message when the user starts typing a new email', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, inputs, inviteInput, inviteBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mountManager()];
                case 1:
                    wrapper = _a.sent();
                    inputs = wrapper.findAll('input');
                    inviteInput = inputs[inputs.length - 1];
                    return [4 /*yield*/, inviteInput.setValue('first@example.com')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 3:
                    _a.sent();
                    inviteBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().trim() === 'Invite'; });
                    return [4 /*yield*/, inviteBtn.trigger('click')];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 5:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toContain('Invitation sent successfully');
                    return [4 /*yield*/, inviteInput.setValue('second@example.com')];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 7:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).not.toContain('Invitation sent successfully');
                    return [2 /*return*/];
            }
        });
    }); });
});
