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
var vitest_1 = require("vitest");
var test_utils_1 = require("@vue/test-utils");
var vue_1 = require("vue");
var PathsSelectorBar_vue_1 = require("../components/PathsSelectorBar.vue");
var routerPush = vitest_1.vi.fn();
var invalidateQueries = vitest_1.vi.fn();
var refetchPaths = vitest_1.vi.fn();
var refetchInvitations = vitest_1.vi.fn();
var currentUser = {
    token: 'tok',
    user_id: 'user-1',
    display_name: 'Test User',
};
var existingPath = {
    path_id: 'path-1',
    uuid: 'uuid-path-1',
    owner_user_id: 'user-1',
    title: 'Existing Path',
    description: null,
    color: '#3949ab',
    is_public: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
};
vitest_1.vi.mock('../lib/db', function () { return ({
    isPathHidden: vitest_1.vi.fn().mockResolvedValue(false),
    setPathHidden: vitest_1.vi.fn().mockResolvedValue(undefined),
    getPathOrder: vitest_1.vi.fn().mockReturnValue([]),
    setPathOrder: vitest_1.vi.fn(),
}); });
vitest_1.vi.mock('vue-router', function () { return ({
    useRouter: function () { return ({ push: routerPush }); },
}); });
vitest_1.vi.mock('@tanstack/vue-query', function () { return ({
    useQueryClient: function () { return ({ invalidateQueries: invalidateQueries }); },
}); });
vitest_1.vi.mock('../composables/usePaths', function () { return ({
    usePaths: function () { return ({
        data: (0, vue_1.ref)([existingPath]),
        refetch: refetchPaths,
    }); },
}); });
vitest_1.vi.mock('../generated/apiClient', function () { return ({
    useListInvitations: function () { return ({
        data: (0, vue_1.ref)({ data: [] }),
        refetch: refetchInvitations,
    }); },
    useAcceptInvitation: function () { return ({ mutateAsync: vitest_1.vi.fn() }); },
    useIgnoreInvitation: function () { return ({ mutateAsync: vitest_1.vi.fn() }); },
    useBlockInviter: function () { return ({ mutateAsync: vitest_1.vi.fn() }); },
    useDeleteSubscription: function () { return ({ mutateAsync: vitest_1.vi.fn() }); },
}); });
var ionicStubs = {
    IonButton: {
        template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
        props: ['disabled', 'size', 'fill', 'expand', 'color'],
        emits: ['click'],
    },
    IonButtons: { template: '<div><slot /></div>' },
    IonChip: { template: '<span><slot /></span>' },
    IonContent: { template: '<div><slot /></div>' },
    IonHeader: { template: '<div><slot /></div>' },
    IonItem: { template: '<div><slot /></div>' },
    IonLabel: { template: '<label><slot /></label>' },
    IonList: { template: '<div><slot /></div>' },
    IonModal: {
        template: '<div v-if="isOpen"><slot /></div>',
        props: ['isOpen'],
    },
    IonTitle: { template: '<div><slot /></div>' },
    IonToggle: {
        template: '<input type="checkbox" :checked="checked" @change="$emit(\'ionChange\', { detail: { checked: $event.target.checked } })" />',
        props: ['checked'],
        emits: ['ionChange'],
    },
    IonToolbar: { template: '<div><slot /></div>' },
};
function mountComponent() {
    return (0, test_utils_1.mount)(PathsSelectorBar_vue_1.default, {
        props: { currentUser: currentUser },
        global: {
            stubs: __assign(__assign({}, ionicStubs), { PathSubscriptionManager: true, PathEditModal: true, PathDeleteModal: true, PathShareModal: true }),
        },
    });
}
(0, vitest_1.describe)('PathsSelectorBar route wiring', function () {
    (0, vitest_1.beforeEach)(function () {
        routerPush.mockReset();
        invalidateQueries.mockReset();
        refetchPaths.mockReset();
        refetchInvitations.mockReset();
    });
    (0, vitest_1.it)('routes the top-level "+ New Path" action to the create page', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, newPathButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wrapper = mountComponent();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    newPathButton = wrapper
                        .findAll('button')
                        .find(function (button) { return button.text().trim() === '+ New Path'; });
                    (0, vitest_1.expect)(newPathButton).toBeDefined();
                    return [4 /*yield*/, newPathButton.trigger('click')];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(routerPush).toHaveBeenCalledWith('/paths/new');
                    (0, vitest_1.expect)(wrapper.text()).not.toContain('Create');
                    (0, vitest_1.expect)(wrapper.text()).not.toContain('Cancel');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('routes the manage modal "+ New Path" action to the same create page', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, manageButton, modalNewPathButton;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wrapper = mountComponent();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 1:
                    _a.sent();
                    manageButton = wrapper
                        .findAll('button')
                        .find(function (button) { return button.text().trim() === 'Manage'; });
                    (0, vitest_1.expect)(manageButton).toBeDefined();
                    return [4 /*yield*/, manageButton.trigger('click')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 3:
                    _a.sent();
                    modalNewPathButton = wrapper
                        .findAll('button')
                        .find(function (button, index) { return button.text().trim() === '+ New Path' && index > 0; });
                    (0, vitest_1.expect)(modalNewPathButton).toBeDefined();
                    return [4 /*yield*/, modalNewPathButton.trigger('click')];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, vue_1.nextTick)()];
                case 5:
                    _a.sent();
                    (0, vitest_1.expect)(routerPush).toHaveBeenCalledWith('/paths/new');
                    (0, vitest_1.expect)(wrapper.text()).not.toContain('Done+ New Path');
                    return [2 /*return*/];
            }
        });
    }); });
});
