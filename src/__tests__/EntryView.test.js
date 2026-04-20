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
var EntryView_vue_1 = require("../views/EntryView.vue");
vitest_1.vi.mock('vue-router', function () { return ({
    useRoute: function () { return ({ params: { pathId: 'p1', entryId: 'e1' }, query: {} }); },
    useRouter: function () { return ({ push: vitest_1.vi.fn(), back: vitest_1.vi.fn() }); },
}); });
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
                        edit_id: 1,
                        content: 'Test entry content',
                    },
                ],
            },
        ],
    }); },
}); });
vitest_1.vi.mock('../generated/apiClient', function () { return ({
    useDeleteEntry: function () { return ({ mutateAsync: vitest_1.vi.fn() }); },
}); });
vitest_1.vi.mock('../lib/db', function () { return ({
    db: {
        entryContent: { delete: vitest_1.vi.fn() },
        entryImages: {
            where: function () { return ({ equals: function () { return ({ delete: vitest_1.vi.fn() }); } }); },
        },
    },
}); });
var ionicStubs = {
    IonPage: { template: '<div><slot /></div>' },
    IonHeader: { template: '<div><slot /></div>' },
    IonToolbar: { template: '<div><slot /></div>' },
    IonTitle: { template: '<div><slot /></div>' },
    IonContent: { template: '<div><slot /></div>' },
    IonButton: {
        template: '<button @click="$emit(\'click\')"><slot /></button>',
        emits: ['click'],
    },
    IonButtons: { template: '<div><slot /></div>' },
    IonBackButton: { template: '<button>Back</button>' },
    IonAlert: {
        template: '<div></div>',
        props: ['isOpen', 'header', 'message', 'buttons'],
    },
    MarkdownContent: {
        template: '<div><slot /></div>',
        props: ['content', 'images'],
    },
};
(0, vitest_1.describe)('EntryView', function () {
    (0, vitest_1.it)('renders without crashing', function () { return __awaiter(void 0, void 0, void 0, function () {
        var queryClient, wrapper;
        return __generator(this, function (_a) {
            queryClient = new vue_query_1.QueryClient({
                defaultOptions: { queries: { retry: false } },
            });
            wrapper = (0, test_utils_1.mount)(EntryView_vue_1.default, {
                global: {
                    plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]],
                    stubs: ionicStubs,
                },
            });
            (0, vitest_1.expect)(wrapper.exists()).toBe(true);
            return [2 /*return*/];
        });
    }); });
});
