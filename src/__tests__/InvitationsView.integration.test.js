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
 * Integration tests for InvitationsView.
 *
 * Tests that path_title and inviter_email are displayed in the invitation list,
 * replacing the less informative path_code.
 *
 * Note: GET /v1/invitations and GET /v1/invitations/blocklist are pre-populated
 * in the TanStack Query cache to avoid timing issues with useQuery scheduling
 * in the test environment.
 */
var vitest_1 = require("vitest");
var vue_query_1 = require("@tanstack/vue-query");
var test_utils_1 = require("@vue/test-utils");
var InvitationsView_vue_1 = require("../views/InvitationsView.vue");
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
    IonPage: { template: '<div><slot /></div>' },
    IonHeader: { template: '<div><slot /></div>' },
    IonToolbar: { template: '<div><slot /></div>' },
    IonTitle: { template: '<div><slot /></div>' },
    IonButtons: { template: '<div><slot /></div>' },
    IonBackButton: { template: '<button />' },
    IonContent: { template: '<div><slot /></div>' },
    IonCard: { template: '<div><slot /></div>' },
    IonCardHeader: { template: '<div><slot /></div>' },
    IonCardTitle: { template: '<div><slot /></div>' },
    IonCardContent: { template: '<div><slot /></div>' },
    IonList: { template: '<ul><slot /></ul>' },
    IonItem: { template: '<li><slot /></li>' },
    IonLabel: { template: '<div><slot /></div>' },
    IonButton: {
        template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
        props: ['disabled', 'size', 'fill', 'color'],
        emits: ['click'],
    },
};
// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
var activeInvitation = {
    id: 'inv-1',
    path_id: 'path-1',
    path_code: 'AB3X7K',
    path_title: 'My Travel Journal',
    inviter_user_id: 'user-2',
    inviter_email: 'owner@example.com',
    invited_email: 'subscriber@example.com',
    invited_user_id: null,
    status: 'invited',
    created_at: '2024-03-15T09:00:00Z',
    updated_at: '2024-03-15T09:00:00Z',
};
var ignoredInvitation = {
    id: 'inv-2',
    path_id: 'path-2',
    path_code: 'CD5Y9Z',
    path_title: 'Weekend Adventures',
    inviter_user_id: 'user-3',
    inviter_email: 'friend@example.com',
    invited_email: 'subscriber@example.com',
    invited_user_id: null,
    status: 'ignored',
    created_at: '2024-03-10T09:00:00Z',
    updated_at: '2024-03-11T09:00:00Z',
};
var invitationWithNullEmail = {
    id: 'inv-3',
    path_id: 'path-3',
    path_code: 'EF7W2P',
    path_title: 'Secret Project',
    inviter_user_id: 'user-4',
    inviter_email: null,
    invited_email: 'subscriber@example.com',
    invited_user_id: null,
    status: 'invited',
    created_at: '2024-03-12T09:00:00Z',
    updated_at: '2024-03-12T09:00:00Z',
};
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function createQueryClient() {
    return new vue_query_1.QueryClient({ defaultOptions: { queries: { retry: false } } });
}
function mountView(invitations) {
    return __awaiter(this, void 0, void 0, function () {
        var queryClient, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    queryClient = createQueryClient();
                    queryClient.setQueryData(['v1', 'invitations'], {
                        data: invitations,
                        status: 200,
                        headers: new Headers(),
                    });
                    queryClient.setQueryData(['v1', 'invitations', 'blocklist'], {
                        data: [],
                        status: 200,
                        headers: new Headers(),
                    });
                    wrapper = (0, test_utils_1.mount)(InvitationsView_vue_1.default, {
                        global: {
                            plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]],
                            stubs: ionicStubs,
                        },
                    });
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, wrapper];
            }
        });
    });
}
// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
(0, vitest_1.describe)('InvitationsView – displaying path_title and inviter_email', function () {
    (0, vitest_1.it)('displays path_title for active invitations instead of path_code', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mountView([activeInvitation, ignoredInvitation])];
                case 1:
                    wrapper = _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toContain('My Travel Journal');
                    (0, vitest_1.expect)(wrapper.html()).not.toContain('AB3X7K');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('displays inviter_email for active invitations', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mountView([activeInvitation, ignoredInvitation])];
                case 1:
                    wrapper = _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toContain('owner@example.com');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('displays path_title for ignored invitations', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mountView([activeInvitation, ignoredInvitation])];
                case 1:
                    wrapper = _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toContain('Weekend Adventures');
                    (0, vitest_1.expect)(wrapper.html()).not.toContain('CD5Y9Z');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('displays inviter_email for ignored invitations', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mountView([activeInvitation, ignoredInvitation])];
                case 1:
                    wrapper = _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toContain('friend@example.com');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('does not show "From:" line when inviter_email is null', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mountView([invitationWithNullEmail])];
                case 1:
                    wrapper = _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toContain('Secret Project');
                    (0, vitest_1.expect)(wrapper.html()).not.toContain('From:');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('shows empty state when there are no invitations', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mountView([])];
                case 1:
                    wrapper = _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toContain('No pending invitations');
                    return [2 /*return*/];
            }
        });
    }); });
});
