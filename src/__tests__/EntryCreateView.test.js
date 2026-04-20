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
var vue_1 = require("vue");
var test_utils_1 = require("@vue/test-utils");
var vue_query_1 = require("@tanstack/vue-query");
var EntryCreateView_vue_1 = require("../views/EntryCreateView.vue");
// ─── Route / router mocks ────────────────────────────────────────────────────
var mockRouterBack = vitest_1.vi.fn();
var mockRouterReplace = vitest_1.vi.fn();
vitest_1.vi.mock('vue-router', function () { return ({
    useRoute: function () { return ({
        params: { pathId: 'p1' },
        query: { date: '2024-01-15' },
    }); },
    useRouter: function () { return ({
        push: vitest_1.vi.fn(),
        back: mockRouterBack,
        replace: mockRouterReplace,
    }); },
    RouterLink: { template: '<a><slot /></a>' },
}); });
// ─── Composable mocks ────────────────────────────────────────────────────────
vitest_1.vi.mock('../composables/useCurrentUser', function () { return ({
    useCurrentUser: function () { return ({ currentUserId: { value: 'user-1' } }); },
}); });
var mockPathsData = (0, vue_1.ref)([
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
]);
var mockPathsError = (0, vue_1.ref)(null);
var mockPaths = { data: mockPathsData, error: mockPathsError };
vitest_1.vi.mock('../composables/usePaths', function () { return ({
    usePaths: function () { return mockPaths; },
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
    getPathOrder: function () { return []; },
    isPathHidden: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, false];
    }); }); },
}); });
// ─── API client mocks ────────────────────────────────────────────────────────
var mockStartCreateEntryDraft = vitest_1.vi.fn();
var mockAbandonDraft = vitest_1.vi.fn();
var mockPatchDraft = vitest_1.vi.fn();
var mockCommitDraft = vitest_1.vi.fn();
var mockRemoveDraftImage = vitest_1.vi.fn();
var mockGetEntryDraft = vitest_1.vi.fn();
vitest_1.vi.mock('../generated/apiClient', function () { return ({
    startCreateEntryDraft: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return mockStartCreateEntryDraft.apply(void 0, args);
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
    IonItem: { template: '<div><slot /></div>' },
    IonLabel: { template: '<label><slot /></label>' },
    IonSelect: {
        template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
        props: ['modelValue', 'disabled'],
        emits: ['update:modelValue'],
    },
    IonSelectOption: {
        template: '<option :value="value"><slot /></option>',
        props: ['value', 'disabled'],
    },
    IonInput: {
        template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
        props: ['modelValue', 'type', 'disabled'],
        emits: ['update:modelValue'],
    },
    IonTextarea: {
        template: '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value); $emit(\'ionInput\', $event)"></textarea>',
        props: ['modelValue', 'rows', 'autoGrow'],
        emits: ['ionInput', 'update:modelValue'],
    },
    IonNote: { template: '<div><slot /></div>' },
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
// ─── Test helpers ─────────────────────────────────────────────────────────────
// jsdom does not implement scrollIntoView; suppress the unhandled rejection
// that comes from useMarkdownEditor calling el?.scrollIntoView(...)
Element.prototype.scrollIntoView = vitest_1.vi.fn();
function mountCreateView() {
    var queryClient = new vue_query_1.QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return (0, test_utils_1.mount)(EntryCreateView_vue_1.default, {
        global: {
            plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]],
            stubs: ionicStubs,
        },
    });
}
var draftResponse = function (id, content) {
    if (id === void 0) { id = 'draft-1'; }
    if (content === void 0) { content = ''; }
    return ({
        status: 200,
        data: {
            id: id,
            mode: 'create',
            state: 'open',
            path_id: 'p1',
            entry_id: null,
            day: '2024-01-15',
            content: content,
            based_on_edit_id: null,
            images: [],
            expires_at: '2024-01-16T00:00:00Z',
        },
    });
};
// ─── Tests ───────────────────────────────────────────────────────────────────
(0, test_utils_1.enableAutoUnmount)(vitest_1.afterEach);
(0, vitest_1.describe)('EntryCreateView', function () {
    (0, vitest_1.beforeEach)(function () {
        vitest_1.vi.clearAllMocks();
        mockStartCreateEntryDraft.mockResolvedValue(draftResponse());
        mockPatchDraft.mockResolvedValue({ status: 200, data: {} });
        mockCommitDraft.mockResolvedValue({
            status: 200,
            data: {
                id: 'new-entry-1',
                path_id: 'p1',
                day: '2024-01-15',
                edit_id: 1,
                content: '',
            },
        });
        mockAbandonDraft.mockResolvedValue({ status: 204, data: null });
        mockGetEntryDraft.mockResolvedValue(draftResponse());
        // Reset shared mutable mock state
        mockPaths.data.value = [
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
        ];
        mockPaths.error.value = null;
    });
    (0, vitest_1.it)('renders the path selector and date input', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wrapper = mountCreateView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toContain('Path');
                    (0, vitest_1.expect)(wrapper.html()).toContain('Day');
                    (0, vitest_1.expect)(wrapper.html()).toContain('Content');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('calls startCreateEntryDraft on mount when path and day are pre-set', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mountCreateView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(mockStartCreateEntryDraft).toHaveBeenCalledWith('p1', vitest_1.expect.objectContaining({ day: '2024-01-15' }));
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('restores content from a resumed draft', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockStartCreateEntryDraft.mockResolvedValue(draftResponse('draft-1', 'Resumed content'));
                    wrapper = mountCreateView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toContain('Resumed content');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('Publish button is enabled once path, day and content are filled', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, textarea, saveBtn;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    wrapper = mountCreateView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _b.sent();
                    textarea = wrapper.find('textarea');
                    return [4 /*yield*/, textarea.setValue('Hello world')];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 3:
                    _b.sent();
                    saveBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().includes('Publish'); });
                    (0, vitest_1.expect)((_a = saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.element) === null || _a === void 0 ? void 0 : _a.disabled).toBe(false);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('Publish button is enabled even when draft init failed (canCommit does not require draftId)', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, textarea, saveBtn;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    mockStartCreateEntryDraft.mockRejectedValue(new Error('Network error'));
                    wrapper = mountCreateView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _b.sent();
                    textarea = wrapper.find('textarea');
                    return [4 /*yield*/, textarea.setValue('Some content')];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 3:
                    _b.sent();
                    saveBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().includes('Publish'); });
                    (0, vitest_1.expect)((_a = saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.element) === null || _a === void 0 ? void 0 : _a.disabled).toBe(false);
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
                    wrapper = mountCreateView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _b.sent();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    wrapper.vm.content = 'Some content';
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
    (0, vitest_1.it)('shows inline error note when draft init fails (does not block the form)', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockStartCreateEntryDraft.mockRejectedValue(new Error('Draft failed'));
                    wrapper = mountCreateView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    // Form fields should still be present (not replaced by a full error state)
                    (0, vitest_1.expect)(wrapper.html()).toContain('Content');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('shows a full-state error when the paths API fails', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Simulate pathsError being set and paths.value being undefined.
                    // Must mutate .value on the existing ref objects (not replace the objects)
                    // so the view — which destructures them on setup — sees the change.
                    mockPaths.data.value = undefined;
                    mockPaths.error.value = new Error('Server error');
                    wrapper = mountCreateView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toContain('Could not load your paths');
                    // Restore
                    mockPaths.data.value = [
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
                    ];
                    mockPaths.error.value = null;
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('shows inline no-paths state when the user owns no paths', function () { return __awaiter(void 0, void 0, void 0, function () {
        var originalPaths, wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    originalPaths = mockPaths.data.value;
                    // Replace with a non-owned path only
                    mockPaths.data.value = [
                        {
                            path_id: 'shared-1',
                            title: 'Shared Path',
                            color: '#15803d',
                            owner_user_id: 'other-user',
                            uuid: 'u2',
                            description: null,
                            is_public: false,
                            created_at: '',
                            updated_at: '',
                        },
                    ];
                    wrapper = mountCreateView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(wrapper.html()).toMatch(/don't have any paths/i);
                    (0, vitest_1.expect)(wrapper.html()).toMatch(/Create a path/i);
                    // Restore
                    mockPaths.data.value = originalPaths;
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('calls commitDraft and navigates back on successful commit', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, textarea, saveBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wrapper = mountCreateView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    textarea = wrapper.find('textarea');
                    return [4 /*yield*/, textarea.setValue('My entry content')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 3:
                    _a.sent();
                    saveBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().includes('Publish'); });
                    return [4 /*yield*/, (saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.trigger('click'))];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 5:
                    _a.sent();
                    (0, vitest_1.expect)(mockCommitDraft).toHaveBeenCalled();
                    (0, vitest_1.expect)(mockRouterReplace).toHaveBeenCalledWith('/entry/p1/new-entry-1');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('does not auto-append image markdown for attached draft images on save', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, saveBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wrapper = mountCreateView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    wrapper.vm.content = 'My entry content';
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
                        data: vitest_1.expect.objectContaining({ content: 'My entry content' }),
                    }));
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('shows commit-fail dialog when commit fails', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, textarea, saveBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockCommitDraft.mockRejectedValue({ response: { status: 503 } });
                    wrapper = mountCreateView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    textarea = wrapper.find('textarea');
                    return [4 /*yield*/, textarea.setValue('My entry content')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 3:
                    _a.sent();
                    saveBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().includes('Publish'); });
                    return [4 /*yield*/, (saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.trigger('click'))];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 5:
                    _a.sent();
                    // The commit-fail dialog should be open (modal rendered with isOpen=true)
                    (0, vitest_1.expect)(wrapper.html()).toMatch(/Save failed/i);
                    (0, vitest_1.expect)(wrapper.html()).toMatch(/retrying to save in the background/i);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('navigates to the path view when OK is chosen for a retrying save failure', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper, textarea, saveBtn, okBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockCommitDraft.mockRejectedValue({ response: { status: 503 } });
                    wrapper = mountCreateView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    textarea = wrapper.find('textarea');
                    return [4 /*yield*/, textarea.setValue('My entry content')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 3:
                    _a.sent();
                    saveBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().includes('Publish'); });
                    return [4 /*yield*/, (saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.trigger('click'))];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 5:
                    _a.sent();
                    okBtn = wrapper.findAll('button').find(function (b) { return b.text() === 'OK'; });
                    return [4 /*yield*/, (okBtn === null || okBtn === void 0 ? void 0 : okBtn.trigger('click'))];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 7:
                    _a.sent();
                    (0, vitest_1.expect)(mockRouterReplace).toHaveBeenCalledWith('/path/p1');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('abandons the draft on unmount if not committed', function () { return __awaiter(void 0, void 0, void 0, function () {
        var wrapper;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wrapper = mountCreateView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(mockStartCreateEntryDraft).toHaveBeenCalled();
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
        var wrapper, textarea, saveBtn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wrapper = mountCreateView();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 1:
                    _a.sent();
                    textarea = wrapper.find('textarea');
                    return [4 /*yield*/, textarea.setValue('Content')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 3:
                    _a.sent();
                    saveBtn = wrapper
                        .findAll('button')
                        .find(function (b) { return b.text().includes('Publish'); });
                    return [4 /*yield*/, (saveBtn === null || saveBtn === void 0 ? void 0 : saveBtn.trigger('click'))];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 5:
                    _a.sent();
                    (0, vitest_1.expect)(mockCommitDraft).toHaveBeenCalled();
                    mockAbandonDraft.mockClear();
                    wrapper.unmount();
                    return [4 /*yield*/, (0, test_utils_1.flushPromises)()];
                case 6:
                    _a.sent();
                    (0, vitest_1.expect)(mockAbandonDraft).not.toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
});
