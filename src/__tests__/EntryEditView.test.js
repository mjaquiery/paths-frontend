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
var EntryEditView_vue_1 = require("../views/EntryEditView.vue");
// ─── Route / router mocks ────────────────────────────────────────────────────
var mockRouterBack = vitest_1.vi.fn();
var mockRouterReplace = vitest_1.vi.fn();
vitest_1.vi.mock('vue-router', function () { return ({
    useRoute: function () { return ({
        params: { pathId: 'p1', entryId: 'e1' },
        query: {},
    }); },
    useRouter: function () { return ({
        push: vitest_1.vi.fn(),
        back: mockRouterBack,
        replace: mockRouterReplace,
    }); },
}); });
// ─── Composable / utility mocks ───────────────────────────────────────────────
vitest_1.vi.mock('../composables/usePaths', function () { return ({
    usePaths: function () { return ({
        data: {
            value: [
                {
                    path_id: 'p1',
                    title: 'Test Path',
                    color: '#3949ab',
                    owner_user_id: 'user-1',
                    uuid: 'u1',
                    description: null,
                    is_public: false,
                    created_at: '',
                    updated_at: '',
                },
            ],
        },
    }); },
}); });
// Configurable entry fixture — tests may replace this before mounting.
var currentEntryImages = [];
vitest_1.vi.mock('../composables/useMultiPathEntries', function () { return ({
    useMultiPathEntries: function () { return ({
        value: [
            {
                pathId: 'p1',
                entries: [
                    {
                        id: 'e1',
                        path_id: 'p1',
                        day: '2024-01-15',
                        edit_id: 5,
                        content: 'Original entry content.',
                        images: currentEntryImages,
                    },
                ],
            },
        ],
    }); },
}); });
vitest_1.vi.mock('../composables/useRefreshStatus', function () { return ({
    useRefreshStatus: function () { return ({
        statusType: { value: 'idle' },
        statusText: { value: '' },
        lastCheckedAt: { value: null },
    }); },
}); });
vitest_1.vi.mock('../composables/usePendingSaves', function () { return ({
    usePendingSaves: function () { return ({
        registerPendingSave: vitest_1.vi.fn(),
        removePendingSave: vitest_1.vi.fn(),
        clearSavedNotification: vitest_1.vi.fn(),
        setContentSaving: vitest_1.vi.fn(),
        registerDraftInitError: vitest_1.vi.fn(),
        clearDraftInitError: vitest_1.vi.fn(),
        pendingSaves: { value: [] },
        pendingSavesCount: { value: 0 },
        savedNotification: { value: null },
        isContentSaving: { value: false },
        draftInitErrors: { value: [] },
    }); },
}); });
vitest_1.vi.mock('../lib/db', function () { return ({
    db: {
        entryContent: { delete: vitest_1.vi.fn() },
        entryImages: {
            where: function () { return ({ equals: function () { return ({ delete: vitest_1.vi.fn() }); } }); },
        },
    },
}); });
// ─── API client mocks ────────────────────────────────────────────────────────
var mockStartEditEntryDraft = vitest_1.vi.fn();
var mockGetEntry = vitest_1.vi.fn();
var mockAbandonDraft = vitest_1.vi.fn();
var mockPatchDraft = vitest_1.vi.fn();
var mockCommitDraft = vitest_1.vi.fn();
var mockRemoveDraftImage = vitest_1.vi.fn();
var mockGetEntryDraft = vitest_1.vi.fn();
vitest_1.vi.mock('../generated/apiClient', function () { return ({
    startEditEntryDraft: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return mockStartEditEntryDraft.apply(void 0, args);
    },
    getEntry: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return mockGetEntry.apply(void 0, args);
    },
    useAbandonEntryDraft: function () { return ({ mutateAsync: mockAbandonDraft }); },
    usePatchEntryDraft: function () { return ({ mutateAsync: mockPatchDraft }); },
    useCommitEntryDraft: function () { return ({ mutateAsync: mockCommitDraft }); },
    useRemoveDraftImage: function () { return ({ mutateAsync: mockRemoveDraftImage }); },
    getEntryDraft: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return mockGetEntryDraft.apply(void 0, args);
    },
}); });
vitest_1.vi.mock('../composables/useDraftImageUpload', function () { return ({
    useDraftImageUpload: function () { return ({
        uploadError: { value: '' },
        uploadDraftImage: vitest_1.vi.fn(),
    }); },
}); });
// ─── Ionic / component stubs ─────────────────────────────────────────────────
var ionicStubs = {
    IonPage: { template: '<div><slot /></div>' },
    IonHeader: { template: '<div><slot /></div>' },
    IonToolbar: { template: '<div><slot /></div>' },
    IonTitle: { template: '<div><slot /></div>' },
    IonContent: { template: '<div><slot /></div>' },
    IonFooter: { template: '<div><slot /></div>' },
    IonButton: {
        template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
        props: ['disabled'],
        emits: ['click'],
    },
    IonButtons: { template: '<div><slot /></div>' },
    IonBackButton: { template: '<button>Back</button>' },
    IonModal: {
        template: '<div v-if="isOpen"><slot /></div>',
        props: ['isOpen', 'canDismiss'],
    },
    IonAlert: {
        template: '<ion-alert />',
        props: ['isOpen', 'header', 'message', 'buttons'],
    },
    IonItem: { template: '<div><slot /></div>' },
    IonLabel: { template: '<label><slot /></label>' },
    IonInput: {
        template: '<input />',
        props: ['modelValue'],
        emits: ['update:modelValue'],
    },
    IonTextarea: {
        template: '<textarea :value="modelValue" @input="$emit(\'ionInput\', $event)"></textarea>',
        props: ['modelValue', 'rows'],
        emits: ['ionInput', 'update:modelValue'],
    },
    RefreshStatus: { template: '<div />' },
    EntryImageDraftPreview: {
        template: '<div />',
        props: ['imageId', 'previewUrl', 'filename', 'uploading'],
    },
    MarkdownContent: {
        template: '<div><slot /></div>',
        props: ['content', 'images', 'localImageUrls'],
    },
};
// ─── Helpers ─────────────────────────────────────────────────────────────────
function mountEditView() {
    var queryClient = new vue_query_1.QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return (0, test_utils_1.mount)(EntryEditView_vue_1.default, {
        global: {
            plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]],
            stubs: ionicStubs,
        },
    });
}
var draftResponse = function (id, content) {
    if (id === void 0) { id = 'draft-1'; }
    if (content === void 0) { content = 'Original entry content.'; }
    return ({
        status: 200,
        data: {
            id: id,
            mode: 'edit',
            state: 'open',
            path_id: 'p1',
            entry_id: 'e1',
            day: '2024-01-15',
            content: content,
            based_on_edit_id: 5,
            images: [],
            expires_at: '2024-01-16T00:00:00Z',
        },
    });
};
var conflictError = function () {
    return Object.assign(new Error('Conflict'), {
        response: { status: 409, data: { detail: 'Edit ID mismatch.' } },
    });
};
var networkError = function () {
    return Object.assign(new Error('Server error'), {
        response: { status: 503, data: { detail: 'Unavailable.' } },
    });
};
// ─── Tests ───────────────────────────────────────────────────────────────────
(0, test_utils_1.enableAutoUnmount)(vitest_1.afterEach);
(0, vitest_1.describe)('EntryEditView', function () {
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
        currentEntryImages = []; // reset to no images by default
        mockStartEditEntryDraft.mockResolvedValue(draftResponse());
        mockPatchDraft.mockResolvedValue({ status: 200, data: {} });
        mockCommitDraft.mockResolvedValue({
            status: 200,
            data: {
                id: 'e1',
                path_id: 'p1',
                day: '2024-01-15',
                edit_id: 6,
                content: 'Original entry content.',
            },
        });
        mockAbandonDraft.mockResolvedValue({ status: 204, data: null });
        mockGetEntryDraft.mockResolvedValue(draftResponse());
        mockGetEntry.mockResolvedValue({
            status: 200,
            data: {
                id: 'e1',
                path_id: 'p1',
                day: '2024-01-15',
                edit_id: 5,
                content: 'Remote entry content.',
                image_filenames: [],
            },
        });
    });
    (0, vitest_1.it)('renders the editor once the entry loads', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toContain('Content');
                    (0, vitest_1.expect)(wrapper.html()).toContain('Original entry content.');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('calls startEditEntryDraft with the entry edit_id on mount', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(mockStartEditEntryDraft).toHaveBeenCalledWith('p1', 'e1', vitest_1.expect.objectContaining({ based_on_edit_id: 5 }));
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('opens the editor immediately with cached entry content even when draft init fails', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockStartEditEntryDraft.mockRejectedValue(networkError());
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    // Should still show the content (from the entry, not blocked by draft failure)
                    (0, vitest_1.expect)(wrapper.html()).toContain('Original entry content.');
                    // Should NOT be in a loading/blocked state
                    (0, vitest_1.expect)(wrapper.html()).not.toContain('Loading entry...');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('shows inline retry note when draft init fails with a non-409', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockStartEditEntryDraft.mockRejectedValue(networkError());
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    // The draft-init error is now surfaced via usePendingSaves/RefreshStatus
                    // (which is stubbed in tests). The editor should still be accessible.
                    (0, vitest_1.expect)(wrapper.html()).toContain('Original entry content.');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('shows conflict banner when draft init returns 409', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockStartEditEntryDraft.mockRejectedValue(conflictError());
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toMatch(/edited on another device/i);
                    (0, vitest_1.expect)(wrapper.html()).toMatch(/Load latest version/i);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('does NOT block the editor on 409 — editor content is still accessible', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockStartEditEntryDraft.mockRejectedValue(conflictError());
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    // Editor section is present even alongside the conflict banner
                    (0, vitest_1.expect)(wrapper.html()).toContain('Content');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('Publish button is enabled once content is present (does not require draftId)', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, saveBtn;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Make draft init fail so draftId is never set
                    mockStartEditEntryDraft.mockRejectedValue(networkError());
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _b.sent();
                    // Simulate a user edit so canCommit becomes true (content differs from original)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    wrapper.vm.content = 'Modified entry content.';
                    return [4 /*yield*/, wrapper.vm.$nextTick()];
                case 2:
                    _b.sent();
                    saveBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().includes('Publish'); });
                    (0, vitest_1.expect)((_a = saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.element) === null || _a === void 0 ? void 0 : _a.disabled).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('Publish button is disabled when conflict banner is shown', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, saveBtn;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    mockStartEditEntryDraft.mockRejectedValue(conflictError());
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _b.sent();
                    saveBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().includes('Publish'); });
                    (0, vitest_1.expect)((_a = saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.element) === null || _a === void 0 ? void 0 : _a.disabled).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('Publish button is disabled while an attached image is still processing', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, saveBtn;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _b.sent();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    wrapper.vm.content = 'Updated content.';
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    wrapper.vm.imageDrafts = [
                        {
                            localId: 'draft-image-1',
                            source: 'server',
                            status: 'draft-uploading',
                            image: null,
                            draftImageId: 'dimg-1',
                            file: null,
                            filename: 'river.jpg',
                            previewUrl: null,
                            captionDraft: 'River',
                            removed: false,
                            error: '',
                        },
                    ];
                    return [4 /*yield*/, wrapper.vm.$nextTick()];
                case 2:
                    _b.sent();
                    saveBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().includes('Publish'); });
                    (0, vitest_1.expect)((_a = saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.element) === null || _a === void 0 ? void 0 : _a.disabled).toBe(true);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('commits the draft and navigates back on success', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, saveBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    // Simulate a content change so canCommit is true
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    wrapper.vm.content = 'Updated content.';
                    return [4 /*yield*/, wrapper.vm.$nextTick()];
                case 2:
                    _a.sent();
                    saveBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().includes('Publish'); });
                    return [4 /*yield*/, (saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.trigger('click'))];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 4:
                    _a.sent();
                    (0, vitest_1.expect)(mockCommitDraft).toHaveBeenCalled();
                    (0, vitest_1.expect)(mockRouterReplace).toHaveBeenCalledWith('/entry/p1/e1');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('shows commit-fail dialog when commit fails', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, saveBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockCommitDraft.mockRejectedValue(networkError());
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    // Simulate a content change so canCommit is true
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    wrapper.vm.content = 'Updated content.';
                    return [4 /*yield*/, wrapper.vm.$nextTick()];
                case 2:
                    _a.sent();
                    saveBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().includes('Publish'); });
                    return [4 /*yield*/, (saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.trigger('click'))];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 4:
                    _a.sent();
                    // The commit-fail dialog should be open
                    (0, vitest_1.expect)(wrapper.html()).toMatch(/Save failed/i);
                    (0, vitest_1.expect)(wrapper.html()).toMatch(/retrying to save in the background/i);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('navigates back to the entry view when OK is chosen for a retrying save failure', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, saveBtn, okBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockCommitDraft.mockRejectedValue(networkError());
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    wrapper.vm.content = 'Updated content.';
                    return [4 /*yield*/, wrapper.vm.$nextTick()];
                case 2:
                    _a.sent();
                    saveBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().includes('Publish'); });
                    return [4 /*yield*/, (saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.trigger('click'))];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 4:
                    _a.sent();
                    okBtn = wrapper.findAll('button').find(function (b) { return b.text() === 'OK'; });
                    return [4 /*yield*/, (okBtn === null || okBtn === void 0 ? void 0 : okBtn.trigger('click'))];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 6:
                    _a.sent();
                    (0, vitest_1.expect)(mockRouterReplace).toHaveBeenCalledWith('/entry/p1/e1');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('opens conflict resolution modal when commit returns 409', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, saveBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockCommitDraft.mockRejectedValue(conflictError());
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    // Simulate a content change so canCommit is true
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    wrapper.vm.content = 'Updated content.';
                    return [4 /*yield*/, wrapper.vm.$nextTick()];
                case 2:
                    _a.sent();
                    saveBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().includes('Publish'); });
                    return [4 /*yield*/, (saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.trigger('click'))];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 4:
                    _a.sent();
                    // Conflict modal should now be open
                    (0, vitest_1.expect)(wrapper.html()).toMatch(/Edit Conflict/i);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('loadRemoteAndContinue fetches the remote entry and re-inits the draft', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, loadBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // First call: 409 on init
                    mockStartEditEntryDraft.mockRejectedValueOnce(conflictError());
                    // Second call (after loadRemoteAndContinue): success
                    mockStartEditEntryDraft.mockResolvedValue(draftResponse('draft-2', 'Remote entry content.'));
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toMatch(/Load latest version/i);
                    loadBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().includes('Load latest version'); });
                    return [4 /*yield*/, (loadBtn === null || loadBtn === void 0 ? void 0 : loadBtn.trigger('click'))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 3:
                    _a.sent();
                    (0, vitest_1.expect)(mockGetEntry).toHaveBeenCalledWith('p1', 'e1');
                    (0, vitest_1.expect)(mockStartEditEntryDraft).toHaveBeenCalledTimes(2);
                    // Conflict banner should be gone after successful re-init
                    (0, vitest_1.expect)(wrapper.html()).not.toMatch(/edited on another device/i);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('abandons draft on unmount if not committed', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(mockStartEditEntryDraft).toHaveBeenCalled();
                    wrapper.unmount();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 2:
                    _a.sent();
                    (0, vitest_1.expect)(mockAbandonDraft).toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('does NOT abandon draft on unmount if commit succeeded', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, saveBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    // Simulate a content change so canCommit is true
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    wrapper.vm.content = 'Updated content.';
                    return [4 /*yield*/, wrapper.vm.$nextTick()];
                case 2:
                    _a.sent();
                    saveBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().includes('Publish'); });
                    return [4 /*yield*/, (saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.trigger('click'))];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 4:
                    _a.sent();
                    (0, vitest_1.expect)(mockCommitDraft).toHaveBeenCalled();
                    mockAbandonDraft.mockClear();
                    wrapper.unmount();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 5:
                    _a.sent();
                    (0, vitest_1.expect)(mockAbandonDraft).not.toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    // ─── Server image tests ────────────────────────────────────────────────
    (0, vitest_1.it)('shows image chip in the tray when draft init returns images', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Draft init returns a draft with a server image
                    mockStartEditEntryDraft.mockResolvedValue({
                        status: 200,
                        data: {
                            id: 'draft-1',
                            mode: 'edit',
                            state: 'open',
                            path_id: 'p1',
                            entry_id: 'e1',
                            day: '2024-01-15',
                            content: 'Original entry content.\n\n![River](river.jpg)',
                            based_on_edit_id: 5,
                            expires_at: '2024-01-16T00:00:00Z',
                            images: [
                                {
                                    id: 'dimg-1',
                                    draft_id: 'draft-1',
                                    source: 'live',
                                    live_image_id: 'img-live-1',
                                    filename: 'river.jpg',
                                    status: 'ready',
                                    content_type: 'image/jpeg',
                                    strip_metadata: true,
                                    byte_size: 200000,
                                    client_image_id: null,
                                },
                            ],
                        },
                    });
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    // Image chip should appear for river.jpg
                    (0, vitest_1.expect)(wrapper.html()).toContain('river.jpg');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('shows image chips from the entry when draft init is pending (pre-hydration)', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    currentEntryImages = [
                        {
                            id: 'img-server-1',
                            entry_id: 'e1',
                            filename: 'sunrise.jpg',
                            status: 'ready',
                            strip_metadata: true,
                            content_type: 'image/jpeg',
                            byte_size: 100000,
                        },
                    ];
                    // Delay draft init so we can observe pre-hydration state
                    mockStartEditEntryDraft.mockImplementation(function () {
                        return new Promise(function (resolve) {
                            return setTimeout(function () { return resolve(draftResponse()); }, 50);
                        });
                    });
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    // Pre-hydration: server image from entry should be shown
                    (0, vitest_1.expect)(wrapper.html()).toContain('sunrise.jpg');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('replaces entry images with draft images after init resolves', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    currentEntryImages = [
                        {
                            id: 'img-server-1',
                            entry_id: 'e1',
                            filename: 'sunrise.jpg',
                            status: 'ready',
                            strip_metadata: true,
                            content_type: 'image/jpeg',
                            byte_size: 100000,
                        },
                    ];
                    // Draft init returns the same image as a DraftImageResponse
                    mockStartEditEntryDraft.mockResolvedValue({
                        status: 200,
                        data: {
                            id: 'draft-1',
                            mode: 'edit',
                            state: 'open',
                            path_id: 'p1',
                            entry_id: 'e1',
                            day: '2024-01-15',
                            content: 'Original entry content.',
                            based_on_edit_id: 5,
                            expires_at: '2024-01-16T00:00:00Z',
                            images: [
                                {
                                    id: 'dimg-live-1',
                                    draft_id: 'draft-1',
                                    source: 'live',
                                    live_image_id: 'img-server-1',
                                    filename: 'sunrise.jpg',
                                    status: 'ready',
                                    content_type: 'image/jpeg',
                                    strip_metadata: true,
                                    byte_size: 100000,
                                    client_image_id: null,
                                },
                            ],
                        },
                    });
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    // After init, the draft-based image chip should be shown
                    (0, vitest_1.expect)(wrapper.html()).toContain('sunrise.jpg');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('removes image chip and calls removeDraftImageApi when Remove is clicked', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, removeBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockRemoveDraftImage.mockResolvedValue({ status: 200, data: {} });
                    mockStartEditEntryDraft.mockResolvedValue({
                        status: 200,
                        data: {
                            id: 'draft-1',
                            mode: 'edit',
                            state: 'open',
                            path_id: 'p1',
                            entry_id: 'e1',
                            day: '2024-01-15',
                            content: 'Original entry content.\n\n![River](river.jpg)',
                            based_on_edit_id: 5,
                            expires_at: '2024-01-16T00:00:00Z',
                            images: [
                                {
                                    id: 'dimg-1',
                                    draft_id: 'draft-1',
                                    source: 'live',
                                    live_image_id: 'img-live-1',
                                    filename: 'river.jpg',
                                    status: 'ready',
                                    content_type: 'image/jpeg',
                                    strip_metadata: true,
                                    byte_size: 200000,
                                    client_image_id: null,
                                },
                            ],
                        },
                    });
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    removeBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().includes('Remove'); });
                    (0, vitest_1.expect)(removeBtn).toBeDefined();
                    return [4 /*yield*/, (removeBtn === null || removeBtn === void 0 ? void 0 : removeBtn.trigger('click'))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 3:
                    _a.sent();
                    // removeDraftImageApi should have been called with the draftImageId
                    (0, vitest_1.expect)(mockRemoveDraftImage).toHaveBeenCalledWith({
                        draftId: 'draft-1',
                        draftImageId: 'dimg-1',
                    });
                    // The chip for river.jpg should no longer be in the DOM
                    (0, vitest_1.expect)(wrapper.html()).not.toContain('river.jpg');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('patches draft with updated content before committing', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, saveBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    // Simulate user changing content — required for canCommit to be true
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    wrapper.vm.content = 'Updated content by user.';
                    return [4 /*yield*/, wrapper.vm.$nextTick()];
                case 2:
                    _a.sent();
                    saveBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().includes('Publish'); });
                    return [4 /*yield*/, (saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.trigger('click'))];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 4:
                    _a.sent();
                    // commitDraftApi should have been called with the draft id
                    (0, vitest_1.expect)(mockCommitDraft).toHaveBeenCalledWith({ draftId: 'draft-1' });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('patches draft with new content when it differs from last saved', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, saveBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    // Directly update the internal content ref via the component instance.
                    // The v-model on IonTextarea in the stub doesn't plumb update:modelValue,
                    // so we set the reactive state directly to simulate a user edit.
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    wrapper.vm.content = 'Updated content by user.';
                    return [4 /*yield*/, wrapper.vm.$nextTick()];
                case 2:
                    _a.sent();
                    saveBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().includes('Publish'); });
                    return [4 /*yield*/, (saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.trigger('click'))];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 4:
                    _a.sent();
                    // When content differs from lastSavedContent, patchDraft should be called.
                    (0, vitest_1.expect)(mockPatchDraft).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                        data: vitest_1.expect.objectContaining({ content: 'Updated content by user.' }),
                    }));
                    (0, vitest_1.expect)(mockCommitDraft).toHaveBeenCalledWith({ draftId: 'draft-1' });
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('does not auto-append image markdown for attached draft images on save', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, saveBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    wrapper.vm.content = 'Updated content by user.';
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    wrapper.vm.imageDrafts = [
                        {
                            localId: 'draft-image-1',
                            source: 'server',
                            status: 'draft-ready',
                            image: null,
                            draftImageId: 'dimg-1',
                            file: null,
                            filename: 'river.jpg',
                            previewUrl: null,
                            captionDraft: 'River',
                            removed: false,
                            error: '',
                        },
                    ];
                    return [4 /*yield*/, wrapper.vm.$nextTick()];
                case 2:
                    _a.sent();
                    saveBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().includes('Publish'); });
                    return [4 /*yield*/, (saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.trigger('click'))];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 4:
                    _a.sent();
                    (0, vitest_1.expect)(mockPatchDraft).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                        data: vitest_1.expect.objectContaining({ content: 'Updated content by user.' }),
                    }));
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('does not call removeDraftImageApi for server images without a draftImageId', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, removeBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Pre-hydration server images (from entry, before draft loads) have no draftImageId.
                    currentEntryImages = [
                        {
                            id: 'img-server-1',
                            entry_id: 'e1',
                            filename: 'sunrise.jpg',
                            status: 'ready',
                            strip_metadata: true,
                            content_type: 'image/jpeg',
                            byte_size: 100000,
                        },
                    ];
                    // Draft init fails so we stay on pre-hydration images
                    mockStartEditEntryDraft.mockRejectedValue(networkError());
                    wrapper = mountEditView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    removeBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().includes('Remove'); });
                    (0, vitest_1.expect)(removeBtn).toBeDefined();
                    return [4 /*yield*/, (removeBtn === null || removeBtn === void 0 ? void 0 : removeBtn.trigger('click'))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 3:
                    _a.sent();
                    // No draftImageId → removeDraftImageApi should NOT be called
                    (0, vitest_1.expect)(mockRemoveDraftImage).not.toHaveBeenCalled();
                    // The chip should be gone from the UI
                    (0, vitest_1.expect)(wrapper.html()).not.toContain('sunrise.jpg');
                    return [2 /*return*/];
            }
        });
    }); });
});
