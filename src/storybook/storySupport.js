"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.withStorybookChrome = exports.storybookRouter = exports.storybookQueryClient = exports.storybookPaths = exports.storybookUser = void 0;
exports.createPopulatedState = createPopulatedState;
exports.createEmptyState = createEmptyState;
exports.buildPathEntries = buildPathEntries;
exports.buildEntryDetail = buildEntryDetail;
exports.buildEntryDetailsForPath = buildEntryDetailsForPath;
exports.createStoryParameters = createStoryParameters;
exports.prepareStoryEnvironment = prepareStoryEnvironment;
exports.createStoryPath = createStoryPath;
exports.createStoryEntry = createStoryEntry;
exports.createStoryApiError = createStoryApiError;
exports.createStoryNetworkError = createStoryNetworkError;
exports.storyDateOffset = storyDateOffset;
exports.storyDateYearsAgo = storyDateYearsAgo;
exports.storyTimestampOffset = storyTimestampOffset;
var vue_1 = require("@ionic/vue");
var vue_query_1 = require("@tanstack/vue-query");
var vue_router_1 = require("vue-router");
var vue_router_2 = require("vue-router");
var msw_1 = require("msw");
var vue3_1 = require("@storybook/vue3");
var vue_2 = require("vue");
var apiClient_1 = require("../generated/apiClient");
var db_1 = require("../lib/db");
var usePendingSaves_1 = require("../composables/usePendingSaves");
var STORYBOOK_NOW_ISO = '2025-03-15T12:00:00.000Z';
var STORYBOOK_NOW = new Date(STORYBOOK_NOW_ISO);
var STORYBOOK_TOKEN = 'storybook-session-token';
var ZIP_DATA_URL = 'data:application/zip;base64,UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA==';
var STORYBOOK_DARK_MODE_KEY = 'darkModePreference';
var DummyRoute = { template: '<div />' };
exports.storybookUser = {
    token: STORYBOOK_TOKEN,
    user_id: 'user-alpha',
    display_name: 'Alex Rivers',
};
exports.storybookPaths = {
    daily: createStoryPath({
        path_id: 'daily-river',
        owner_user_id: exports.storybookUser.user_id,
        title: 'Daily River',
        description: 'The ordinary details: weather, meals, conversations.',
        color: '#2B6CB0',
    }),
    studio: createStoryPath({
        path_id: 'studio-notes',
        owner_user_id: exports.storybookUser.user_id,
        title: 'Studio Notes',
        description: 'Product work, release prep, and half-finished ideas.',
        color: '#D97706',
    }),
    shared: createStoryPath({
        path_id: 'family-trip',
        owner_user_id: 'user-bravo',
        title: 'Family Trip',
        description: 'Shared plans, tickets, and travel photos.',
        color: '#15803D',
    }),
};
var sunriseImage = createImage({
    id: 'img-sunrise-river',
    entry_id: 'entry-daily-today',
    filename: 'sunrise-river.jpg',
    content_type: 'image/jpeg',
    byte_size: 310442,
});
var whiteboardImage = createImage({
    id: 'img-whiteboard',
    entry_id: 'entry-studio-today',
    filename: 'whiteboard-plan.png',
    content_type: 'image/png',
    byte_size: 198204,
});
var ticketImage = createImage({
    id: 'img-train-ticket',
    entry_id: 'entry-shared-yesterday',
    filename: 'train-ticket.webp',
    content_type: 'image/webp',
    byte_size: 144120,
});
var defaultEntriesByPath = (_a = {},
    _a[exports.storybookPaths.daily.path_id] = [
        createStoryEntry({
            id: 'entry-daily-today',
            path_id: exports.storybookPaths.daily.path_id,
            day: storyDateOffset(0),
            edit_id: 41,
            content: [
                'Swam before sunrise and the river was glassy quiet.',
                '',
                '![Sunrise over the river](sunrise-river.jpg)',
                '',
                'Picked up oranges on the walk back and cooked lentil soup for dinner.',
            ].join('\n'),
            images: [sunriseImage],
        }),
        createStoryEntry({
            id: 'entry-daily-yesterday',
            path_id: exports.storybookPaths.daily.path_id,
            day: storyDateOffset(-1),
            edit_id: 40,
            content: 'Heavy rain all afternoon. Stayed in, finished a chapter, and answered old messages.',
        }),
        createStoryEntry({
            id: 'entry-daily-last-year',
            path_id: exports.storybookPaths.daily.path_id,
            day: storyDateYearsAgo(1),
            edit_id: 32,
            content: 'Same date, different weather. The first daffodils finally opened along the fence.',
        }),
        createStoryEntry({
            id: 'entry-daily-two-years',
            path_id: exports.storybookPaths.daily.path_id,
            day: storyDateYearsAgo(2),
            edit_id: 19,
            content: 'Cleaned the kitchen radio and played Nina Simone all evening.',
        }),
    ],
    _a[exports.storybookPaths.studio.path_id] = [
        createStoryEntry({
            id: 'entry-studio-today',
            path_id: exports.storybookPaths.studio.path_id,
            day: storyDateOffset(0),
            edit_id: 14,
            content: [
                'Closed the export polling loop and cut a beta build.',
                '',
                'Need one more pass on the failure copy before release.',
                '',
                '![Release checklist](whiteboard-plan.png)',
            ].join('\n'),
            images: [whiteboardImage],
        }),
        createStoryEntry({
            id: 'entry-studio-thursday',
            path_id: exports.storybookPaths.studio.path_id,
            day: storyDateOffset(-2),
            edit_id: 12,
            content: 'Reviewed the onboarding copy with support and trimmed the empty states.',
        }),
        createStoryEntry({
            id: 'entry-studio-last-year',
            path_id: exports.storybookPaths.studio.path_id,
            day: storyDateYearsAgo(1),
            edit_id: 4,
            content: 'Sketched the first Paths wireframes on paper and kept the container model to a single Path.',
        }),
    ],
    _a[exports.storybookPaths.shared.path_id] = [
        createStoryEntry({
            id: 'entry-shared-yesterday',
            path_id: exports.storybookPaths.shared.path_id,
            day: storyDateOffset(-1),
            edit_id: 7,
            content: [
                'Uploaded the train tickets and shared the arrival window with Eli.',
                '',
                '![Train ticket](train-ticket.webp)',
            ].join('\n'),
            images: [ticketImage],
        }),
        createStoryEntry({
            id: 'entry-shared-last-year',
            path_id: exports.storybookPaths.shared.path_id,
            day: storyDateYearsAgo(1),
            edit_id: 2,
            content: 'Booked the apartment with the tiny balcony near the station.',
        }),
    ],
    _a);
var defaultInvitations = [
    {
        id: 'invitation-pending-1',
        path_id: 'path-invite-1',
        path_code: 'book-club',
        path_title: 'Book Club Notes',
        inviter_user_id: 'user-charlie',
        inviter_email: 'charlie@example.com',
        invited_email: 'alex@example.com',
        invited_user_id: null,
        status: 'invited',
        created_at: storyTimestampOffset(-3),
        updated_at: storyTimestampOffset(-3),
    },
    {
        id: 'invitation-ignored-1',
        path_id: 'path-invite-2',
        path_code: 'garden-log',
        path_title: 'Garden Log',
        inviter_user_id: 'user-delta',
        inviter_email: 'delta@example.com',
        invited_email: 'alex@example.com',
        invited_user_id: null,
        status: 'ignored',
        created_at: storyTimestampOffset(-10),
        updated_at: storyTimestampOffset(-2),
    },
];
var defaultBlocklist = [
    {
        id: 'blocked-1',
        blocked_user_id: 'user-echo',
        created_at: storyTimestampOffset(-20),
    },
];
var defaultSubscriptionsByPath = (_b = {},
    _b[exports.storybookPaths.daily.path_id] = [
        {
            user_id: 'user-foxtrot',
            email: 'foxtrot@example.com',
            display_name: 'Morgan Lee',
        },
        {
            user_id: 'user-golf',
            email: 'golf@example.com',
            display_name: 'Priya Shah',
        },
    ],
    _b[exports.storybookPaths.studio.path_id] = [],
    _b);
exports.storybookQueryClient = new vue_query_1.QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            staleTime: Infinity,
            gcTime: Infinity,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: false,
        },
    },
});
exports.storybookRouter = (0, vue_router_1.createRouter)({
    history: (0, vue_router_2.createMemoryHistory)(),
    routes: [
        { path: '/', component: DummyRoute },
        { path: '/auth/callback', component: DummyRoute },
        { path: '/export', component: DummyRoute },
        { path: '/delete', component: DummyRoute },
        { path: '/invitations', component: DummyRoute },
        { path: '/date/:date', component: DummyRoute },
        { path: '/path/:pathId', component: DummyRoute },
        { path: '/entry/new', component: DummyRoute },
        { path: '/entry/:pathId/new', component: DummyRoute },
        { path: '/entry/:pathId/:entryId', component: DummyRoute },
        { path: '/entry/:pathId/:entryId/edit', component: DummyRoute },
        { path: '/paths/new', component: DummyRoute },
    ],
});
installDeterministicDate();
installMatchMediaStub();
installNavigatorOnlineStub();
(0, vue3_1.setup)(function (app) {
    app.use(vue_1.IonicVue, { mode: 'md' });
    app.use(vue_query_1.VueQueryPlugin, { queryClient: exports.storybookQueryClient });
    app.use(exports.storybookRouter);
});
function createPopulatedState(overrides) {
    if (overrides === void 0) { overrides = {}; }
    return __assign({ currentUser: exports.storybookUser, paths: [exports.storybookPaths.daily, exports.storybookPaths.studio, exports.storybookPaths.shared], entriesByPath: cloneEntriesByPath(defaultEntriesByPath), invitations: clone(defaultInvitations), blocklist: clone(defaultBlocklist), subscriptionsByPath: clone(defaultSubscriptionsByPath), authLoginUrl: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=storybook&state=storybook' }, overrides);
}
function createEmptyState(overrides) {
    var _a;
    if (overrides === void 0) { overrides = {}; }
    var base = createPopulatedState({
        invitations: [],
        blocklist: [],
        subscriptionsByPath: (_a = {},
            _a[exports.storybookPaths.daily.path_id] = [],
            _a[exports.storybookPaths.studio.path_id] = [],
            _a),
    });
    return __assign(__assign(__assign({}, base), { entriesByPath: Object.fromEntries(base.paths.map(function (path) { return [path.path_id, []]; })) }), overrides);
}
function buildPathEntries(state, pathIds) {
    if (pathIds === void 0) { pathIds = state.paths.map(function (path) { return path.path_id; }); }
    return pathIds.map(function (pathId) {
        var _a;
        return ({
            pathId: pathId,
            entries: ((_a = state.entriesByPath[pathId]) !== null && _a !== void 0 ? _a : []).map(function (record) { return (__assign(__assign({}, record.summary), { content: record.content, image_filenames: record.images.map(function (image) { return image.filename; }), images: record.images })); }),
        });
    });
}
function buildEntryDetail(state, entryId) {
    var match = findEntryRecord(state, entryId);
    if (!match) {
        throw new Error("Story entry \"".concat(entryId, "\" was not found."));
    }
    var path = state.paths.find(function (item) { return item.path_id === match.pathId; });
    if (!path) {
        throw new Error("Story path \"".concat(match.pathId, "\" was not found."));
    }
    var canEdit = !!state.currentUser && path.owner_user_id === state.currentUser.user_id;
    return {
        pathId: match.pathId,
        entryId: match.record.summary.id,
        pathTitle: path.title,
        color: path.color,
        day: match.record.summary.day,
        content: match.record.content,
        hasImages: match.record.images.length > 0,
        images: match.record.images,
        edit_id: match.record.summary.edit_id,
        canEdit: canEdit,
    };
}
function buildEntryDetailsForPath(state, pathId) {
    var _a;
    return ((_a = state.entriesByPath[pathId]) !== null && _a !== void 0 ? _a : []).map(function (record) {
        return buildEntryDetail(state, record.summary.id);
    });
}
function createStoryParameters(options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    if (options === void 0) { options = {}; }
    var state = (_a = options.state) !== null && _a !== void 0 ? _a : createPopulatedState();
    return {
        route: (_b = options.route) !== null && _b !== void 0 ? _b : '/',
        sessionUser: (_c = options.sessionUser) !== null && _c !== void 0 ? _c : state.currentUser,
        hiddenPathIds: (_d = options.hiddenPathIds) !== null && _d !== void 0 ? _d : [],
        pathOrder: (_e = options.pathOrder) !== null && _e !== void 0 ? _e : state.paths.map(function (path) { return path.path_id; }),
        networkMode: (_f = options.networkMode) !== null && _f !== void 0 ? _f : 'online',
        seedCacheFromState: (_g = options.seedCacheFromState) !== null && _g !== void 0 ? _g : false,
        requestOverrides: (_h = options.requestOverrides) !== null && _h !== void 0 ? _h : [],
        draftSeeds: (_j = options.draftSeeds) !== null && _j !== void 0 ? _j : [],
        storyState: state,
        msw: {
            handlers: createMockHandlers(state, (_k = options.requestOverrides) !== null && _k !== void 0 ? _k : [], (_l = options.draftSeeds) !== null && _l !== void 0 ? _l : []),
        },
    };
}
function prepareStoryEnvironment(context) {
    return __awaiter(this, void 0, void 0, function () {
        var params, globals, route, sessionUser, hiddenPathIds, pathOrder, networkMode, seedCacheFromState, colorMode, state, _i, hiddenPathIds_1, pathId;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    params = (_a = context.parameters) !== null && _a !== void 0 ? _a : {};
                    globals = (_b = context.globals) !== null && _b !== void 0 ? _b : {};
                    route = typeof params.route === 'string' ? params.route : '/';
                    sessionUser = (_c = params.sessionUser) !== null && _c !== void 0 ? _c : null;
                    hiddenPathIds = Array.isArray(params.hiddenPathIds)
                        ? params.hiddenPathIds
                        : [];
                    pathOrder = Array.isArray(params.pathOrder)
                        ? params.pathOrder
                        : [];
                    networkMode = params.networkMode === 'offline' ? 'offline' : 'online';
                    seedCacheFromState = Boolean(params.seedCacheFromState);
                    colorMode = normalizeStoryColorMode(globals.colorMode);
                    state = (_d = params.storyState) !== null && _d !== void 0 ? _d : null;
                    exports.storybookQueryClient.clear();
                    clearSessionStorage();
                    return [4 /*yield*/, clearStoryDatabase()];
                case 1:
                    _e.sent();
                    (0, usePendingSaves_1.resetPendingSaves)();
                    if (pathOrder.length > 0) {
                        localStorage.setItem('pathOrder', JSON.stringify(pathOrder));
                    }
                    if (!(seedCacheFromState && state)) return [3 /*break*/, 3];
                    return [4 /*yield*/, seedStoryCache(state)];
                case 2:
                    _e.sent();
                    _e.label = 3;
                case 3:
                    _i = 0, hiddenPathIds_1 = hiddenPathIds;
                    _e.label = 4;
                case 4:
                    if (!(_i < hiddenPathIds_1.length)) return [3 /*break*/, 7];
                    pathId = hiddenPathIds_1[_i];
                    return [4 /*yield*/, db_1.db.pathPreferences.put({ pathId: pathId, hidden: true })];
                case 5:
                    _e.sent();
                    _e.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7:
                    if (sessionUser) {
                        localStorage.setItem('user', JSON.stringify({
                            user_id: sessionUser.user_id,
                            display_name: sessionUser.display_name,
                        }));
                        localStorage.setItem('session_token', sessionUser.token);
                    }
                    applyStorybookColorMode(colorMode);
                    applyStorybookNetworkMode(networkMode);
                    // Wait for the router's initial navigation to finish before navigating.
                    // Without this, isReady() hangs if the current route already matches the
                    // target route and the initial navigation has not yet been completed.
                    return [4 /*yield*/, Promise.race([
                            exports.storybookRouter.isReady(),
                            new Promise(function (resolve) { return setTimeout(resolve, 500); }),
                        ])];
                case 8:
                    // Wait for the router's initial navigation to finish before navigating.
                    // Without this, isReady() hangs if the current route already matches the
                    // target route and the initial navigation has not yet been completed.
                    _e.sent();
                    if (!(exports.storybookRouter.currentRoute.value.fullPath !== route)) return [3 /*break*/, 10];
                    return [4 /*yield*/, exports.storybookRouter.replace(route)];
                case 9:
                    _e.sent();
                    _e.label = 10;
                case 10: return [2 /*return*/, {}];
            }
        });
    });
}
var withStorybookChrome = function (story, context) {
    var _a, _b;
    ensureStorybookChromeStyles();
    var isViewStory = (_b = (_a = context.title) === null || _a === void 0 ? void 0 : _a.startsWith('Views/')) !== null && _b !== void 0 ? _b : false;
    return {
        components: { StoryComponent: story(), IonApp: vue_1.IonApp },
        setup: function () {
            var colorMode = (0, vue_2.computed)(function () { var _a; return normalizeStoryColorMode((_a = context.globals) === null || _a === void 0 ? void 0 : _a.colorMode); });
            (0, vue_2.watchEffect)(function () {
                applyStorybookColorMode(colorMode.value);
            });
            return { isViewStory: isViewStory, colorMode: colorMode };
        },
        template: isViewStory
            ? "\n        <ion-app class=\"sb-story-root\" :data-color-mode=\"colorMode\">\n          <div class=\"sb-phone-stage\">\n            <div class=\"sb-phone-frame\" :data-color-mode=\"colorMode\">\n              <div class=\"sb-phone-speaker\" aria-hidden=\"true\"></div>\n              <div class=\"sb-phone-screen\">\n                <StoryComponent />\n              </div>\n            </div>\n          </div>\n        </ion-app>\n      "
            : '<ion-app class="sb-story-root" :data-color-mode="colorMode"><StoryComponent /></ion-app>',
    };
};
exports.withStorybookChrome = withStorybookChrome;
function createMockHandlers(inputState, requestOverrides, draftSeeds) {
    var _this = this;
    var _a, _b, _c;
    if (requestOverrides === void 0) { requestOverrides = []; }
    if (draftSeeds === void 0) { draftSeeds = []; }
    var state = clone(inputState);
    var exportPolls = {};
    var exportRequests = {};
    // Index: `create:${pathId}:${day}` or `edit:${pathId}:${entryId}` → draftId
    var draftIndex = new Map();
    var drafts = new Map();
    // Pre-seed drafts from story seeds
    var draftCounter = 0;
    var draftImageCounter = 0;
    for (var _i = 0, draftSeeds_1 = draftSeeds; _i < draftSeeds_1.length; _i++) {
        var seed = draftSeeds_1[_i];
        draftCounter += 1;
        var parts = seed.key.split(':');
        var mode = parts[0];
        var pathId = (_a = parts[1]) !== null && _a !== void 0 ? _a : '';
        var entryOrDay = (_b = parts[2]) !== null && _b !== void 0 ? _b : '';
        var seedDraft = {
            id: "draft-seed-".concat(draftCounter),
            mode: mode,
            pathId: pathId,
            entryId: mode === 'edit' ? entryOrDay : null,
            day: mode === 'create' ? entryOrDay : storyDateOffset(0),
            content: seed.content,
            based_on_edit_id: null,
            images: ((_c = seed.images) !== null && _c !== void 0 ? _c : []).map(function (image) {
                return image.status === 'ready' && !image.live_image_id
                    ? __assign(__assign({}, image), { live_image_id: image.id }) : image;
            }),
            state: 'open',
        };
        drafts.set(seedDraft.id, seedDraft);
        draftIndex.set(seed.key, seedDraft.id);
    }
    var pendingDraftUploads = new Map();
    function makeDraftResponse(draft) {
        return {
            id: draft.id,
            mode: draft.mode,
            state: draft.state,
            path_id: draft.pathId,
            entry_id: draft.entryId,
            day: draft.day,
            content: draft.content,
            based_on_edit_id: draft.based_on_edit_id,
            images: draft.images,
            expires_at: storyTimestampOffset(1),
        };
    }
    function getOrCreateDraft(key, init) {
        var existingId = draftIndex.get(key);
        if (existingId) {
            var existing = drafts.get(existingId);
            if (existing && existing.state === 'open')
                return existing;
        }
        var draft = init();
        drafts.set(draft.id, draft);
        draftIndex.set(key, draft.id);
        return draft;
    }
    return __spreadArray(__spreadArray([], createOverrideHandlers(requestOverrides), true), [
        msw_1.http.get('*/v1/paths', function () {
            return msw_1.HttpResponse.json(state.paths, { status: 200 });
        }),
        msw_1.http.post('*/v1/paths', function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var body, created;
            var _c, _d;
            var request = _b.request;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, request.json()];
                    case 1:
                        body = (_e.sent());
                        created = createStoryPath({
                            path_id: slugify(body.title),
                            owner_user_id: (_d = (_c = state.currentUser) === null || _c === void 0 ? void 0 : _c.user_id) !== null && _d !== void 0 ? _d : exports.storybookUser.user_id,
                            title: body.title,
                            description: body.description,
                            color: body.color || '#3949AB',
                        });
                        state.paths.push(created);
                        state.entriesByPath[created.path_id] = [];
                        return [2 /*return*/, msw_1.HttpResponse.json(created, { status: 201 })];
                }
            });
        }); }),
        msw_1.http.put('*/v1/paths/:pathCode', function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var body, path;
            var params = _b.params, request = _b.request;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, request.json()];
                    case 1:
                        body = (_c.sent());
                        path = state.paths.find(function (item) { return item.path_id === params.pathCode; });
                        if (!path) {
                            return [2 /*return*/, msw_1.HttpResponse.json({ detail: 'Not found' }, { status: 404 })];
                        }
                        path.title = body.title;
                        path.description = body.description;
                        path.color = body.color;
                        path.updated_at = storyTimestampOffset(0);
                        return [2 /*return*/, msw_1.HttpResponse.json(path, { status: 200 })];
                }
            });
        }); }),
        msw_1.http.delete('*/v1/paths/:pathCode', function (_a) {
            var params = _a.params;
            state.paths = state.paths.filter(function (item) { return item.path_id !== params.pathCode; });
            delete state.entriesByPath[String(params.pathCode)];
            delete state.subscriptionsByPath[String(params.pathCode)];
            return new msw_1.HttpResponse(null, { status: 204 });
        }),
        msw_1.http.get('*/v1/paths/:pathCode/entries', function (_a) {
            var _b;
            var params = _a.params;
            var entries = (_b = state.entriesByPath[String(params.pathCode)]) !== null && _b !== void 0 ? _b : [];
            return msw_1.HttpResponse.json(entries.map(function (record) { return record.summary; }), { status: 200 });
        }),
        // ─── Get-or-create create draft ────────────────────────────────────────
        msw_1.http.get('*/v1/paths/:pathCode/entries/drafts', function (_a) {
            var _b;
            var params = _a.params, request = _a.request;
            var pathId = String(params.pathCode);
            var url = new URL(request.url);
            var day = (_b = url.searchParams.get('day')) !== null && _b !== void 0 ? _b : storyDateOffset(0);
            var key = "create:".concat(pathId, ":").concat(day);
            draftCounter += 1;
            var draft = getOrCreateDraft(key, function () { return ({
                id: "draft-create-".concat(draftCounter),
                mode: 'create',
                pathId: pathId,
                entryId: null,
                day: day,
                content: '',
                based_on_edit_id: null,
                images: [],
                state: 'open',
            }); });
            return msw_1.HttpResponse.json(makeDraftResponse(draft), { status: 200 });
        }),
        msw_1.http.get('*/v1/paths/:pathCode/entries/:entrySlug', function (_a) {
            var params = _a.params;
            var entry = findEntryRecord(state, String(params.entrySlug), String(params.pathCode));
            if (!entry) {
                return msw_1.HttpResponse.json({ detail: 'Not found' }, { status: 404 });
            }
            return msw_1.HttpResponse.json(toEntryContent(entry.record), { status: 200 });
        }),
        // ─── Get-or-create edit draft ───────────────────────────────────────────
        msw_1.http.get('*/v1/paths/:pathCode/entries/:entrySlug/draft', function (_a) {
            var _b;
            var params = _a.params, request = _a.request;
            var pathId = String(params.pathCode);
            var entrySlug = String(params.entrySlug);
            var url = new URL(request.url);
            var basedOnEditId = parseInt((_b = url.searchParams.get('based_on_edit_id')) !== null && _b !== void 0 ? _b : '0', 10);
            var entry = findEntryRecord(state, entrySlug, pathId);
            if (!entry) {
                return msw_1.HttpResponse.json({ detail: 'Not found' }, { status: 404 });
            }
            // Check for edit_id mismatch (simulate 409 if stale)
            if (basedOnEditId !== 0 &&
                basedOnEditId !== entry.record.summary.edit_id) {
                return msw_1.HttpResponse.json({ detail: 'Edit ID mismatch.' }, { status: 409 });
            }
            var key = "edit:".concat(pathId, ":").concat(entrySlug);
            draftCounter += 1;
            var draft = getOrCreateDraft(key, function () { return ({
                id: "draft-edit-".concat(draftCounter),
                mode: 'edit',
                pathId: pathId,
                entryId: entrySlug,
                day: entry.record.summary.day,
                content: entry.record.content,
                based_on_edit_id: entry.record.summary.edit_id,
                images: entry.record.images.map(function (img) {
                    return createDraftImageFromEntryImage(img);
                }),
                state: 'open',
            }); });
            return msw_1.HttpResponse.json(makeDraftResponse(draft), { status: 200 });
        }),
        msw_1.http.delete('*/v1/paths/:pathCode/entries/:entrySlug', function (_a) {
            var _b;
            var params = _a.params;
            var pathId = String(params.pathCode);
            state.entriesByPath[pathId] = ((_b = state.entriesByPath[pathId]) !== null && _b !== void 0 ? _b : []).filter(function (record) { return record.summary.id !== params.entrySlug; });
            return new msw_1.HttpResponse(null, { status: 204 });
        }),
        msw_1.http.get('*/v1/paths/:pathCode/entries/:entrySlug/images', function (_a) {
            var params = _a.params;
            var entry = findEntryRecord(state, String(params.entrySlug), String(params.pathCode));
            if (!entry) {
                return msw_1.HttpResponse.json([], { status: 200 });
            }
            return msw_1.HttpResponse.json(entry.record.images, { status: 200 });
        }),
        // ─── Get / patch / abandon draft ───────────────────────────────────────
        msw_1.http.get('*/v1/entry-drafts/:draftId', function (_a) {
            var params = _a.params;
            var draft = drafts.get(String(params.draftId));
            if (!draft) {
                return msw_1.HttpResponse.json({ detail: 'Not found' }, { status: 404 });
            }
            return msw_1.HttpResponse.json(makeDraftResponse(draft), { status: 200 });
        }),
        msw_1.http.patch('*/v1/entry-drafts/:draftId', function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var draft, body;
            var params = _b.params, request = _b.request;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        draft = drafts.get(String(params.draftId));
                        if (!draft) {
                            return [2 /*return*/, msw_1.HttpResponse.json({ detail: 'Not found' }, { status: 404 })];
                        }
                        return [4 /*yield*/, request.json()];
                    case 1:
                        body = (_c.sent());
                        if (body.day !== undefined)
                            draft.day = body.day;
                        if (body.content !== undefined)
                            draft.content = body.content;
                        return [2 /*return*/, msw_1.HttpResponse.json(makeDraftResponse(draft), { status: 200 })];
                }
            });
        }); }),
        msw_1.http.delete('*/v1/entry-drafts/:draftId', function (_a) {
            var params = _a.params;
            var draftId = String(params.draftId);
            var draft = drafts.get(draftId);
            if (draft) {
                // Remove from index so a fresh draft can be created next time
                var key = draft.mode === 'create'
                    ? "create:".concat(draft.pathId, ":").concat(draft.day)
                    : "edit:".concat(draft.pathId, ":").concat(draft.entryId);
                draftIndex.delete(key);
                drafts.delete(draftId);
            }
            return new msw_1.HttpResponse(null, { status: 204 });
        }),
        // ─── Draft image upload (3-step) ───────────────────────────────────────
        msw_1.http.post('*/v1/entry-drafts/:draftId/images', function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var draftId, draft, body, draftImageId, slot;
            var _c, _d, _e, _f, _g, _h;
            var params = _b.params, request = _b.request;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        draftId = String(params.draftId);
                        draft = drafts.get(draftId);
                        if (!draft) {
                            return [2 /*return*/, msw_1.HttpResponse.json({ detail: 'Not found' }, { status: 404 })];
                        }
                        return [4 /*yield*/, request.json()];
                    case 1:
                        body = (_j.sent());
                        draftImageCounter += 1;
                        draftImageId = "dimg-".concat(draftImageCounter);
                        pendingDraftUploads.set(draftImageId, {
                            draftId: draftId,
                            filename: body.filename,
                            contentType: (_c = body.content_type) !== null && _c !== void 0 ? _c : 'image/jpeg',
                            stripMetadata: (_d = body.strip_metadata) !== null && _d !== void 0 ? _d : false,
                            clientImageId: (_e = body.client_image_id) !== null && _e !== void 0 ? _e : null,
                        });
                        slot = {
                            id: draftImageId,
                            draft_id: draftId,
                            source: 'upload',
                            filename: body.filename,
                            status: 'pending',
                            content_type: (_f = body.content_type) !== null && _f !== void 0 ? _f : 'image/jpeg',
                            strip_metadata: (_g = body.strip_metadata) !== null && _g !== void 0 ? _g : false,
                            client_image_id: (_h = body.client_image_id) !== null && _h !== void 0 ? _h : null,
                            upload_url: "https://storybook.paths.local/uploads/".concat(draftImageId),
                            expires_in_seconds: 600,
                        };
                        return [2 /*return*/, msw_1.HttpResponse.json(slot, { status: 201 })];
                }
            });
        }); }),
        msw_1.http.put('https://storybook.paths.local/uploads/:imageId', function () {
            return new msw_1.HttpResponse(null, { status: 200 });
        }),
        msw_1.http.post('*/v1/entry-drafts/:draftId/images/:draftImageId/complete', function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var draftId, draftImageId, pending, draft, body, draftImage;
            var _c;
            var params = _b.params, request = _b.request;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        draftId = String(params.draftId);
                        draftImageId = String(params.draftImageId);
                        pending = pendingDraftUploads.get(draftImageId);
                        if (!pending) {
                            return [2 /*return*/, msw_1.HttpResponse.json({ detail: 'Not found' }, { status: 404 })];
                        }
                        draft = drafts.get(draftId);
                        if (!draft) {
                            return [2 /*return*/, msw_1.HttpResponse.json({ detail: 'Not found' }, { status: 404 })];
                        }
                        return [4 /*yield*/, request.json()];
                    case 1:
                        body = (_d.sent());
                        draftImage = {
                            id: draftImageId,
                            draft_id: draftId,
                            source: 'upload',
                            live_image_id: draftImageId,
                            filename: pending.filename,
                            status: 'ready',
                            content_type: pending.contentType,
                            strip_metadata: pending.stripMetadata,
                            byte_size: (_c = body.byte_size) !== null && _c !== void 0 ? _c : null,
                            client_image_id: pending.clientImageId,
                        };
                        draft.images = __spreadArray(__spreadArray([], draft.images.filter(function (img) { return img.id !== draftImageId; }), true), [
                            draftImage,
                        ], false);
                        pendingDraftUploads.delete(draftImageId);
                        return [2 /*return*/, msw_1.HttpResponse.json(draftImage, { status: 200 })];
                }
            });
        }); }),
        msw_1.http.post('*/v1/entry-drafts/:draftId/images/:draftImageId/retry-upload', function (_a) {
            var params = _a.params;
            var draftId = String(params.draftId);
            var draftImageId = String(params.draftImageId);
            var draft = drafts.get(draftId);
            var existing = draft === null || draft === void 0 ? void 0 : draft.images.find(function (img) { return img.id === draftImageId; });
            if (!existing) {
                return msw_1.HttpResponse.json({ detail: 'Not found' }, { status: 404 });
            }
            var slot = {
                id: draftImageId,
                draft_id: draftId,
                source: 'upload',
                filename: existing.filename,
                status: 'pending',
                content_type: existing.content_type,
                strip_metadata: existing.strip_metadata,
                client_image_id: existing.client_image_id,
                upload_url: "https://storybook.paths.local/uploads/".concat(draftImageId),
                expires_in_seconds: 600,
            };
            return msw_1.HttpResponse.json(slot, { status: 200 });
        }),
        msw_1.http.delete('*/v1/entry-drafts/:draftId/images/:draftImageId', function (_a) {
            var params = _a.params;
            var draftId = String(params.draftId);
            var draftImageId = String(params.draftImageId);
            var draft = drafts.get(draftId);
            if (!draft) {
                return msw_1.HttpResponse.json({ detail: 'Not found' }, { status: 404 });
            }
            var removed = draft.images.find(function (img) { return img.id === draftImageId; });
            if (!removed) {
                return msw_1.HttpResponse.json({ detail: 'Not found' }, { status: 404 });
            }
            draft.images = draft.images.filter(function (img) { return img.id !== draftImageId; });
            return msw_1.HttpResponse.json(removed, { status: 200 });
        }),
        // ─── Commit draft ───────────────────────────────────────────────────────
        msw_1.http.post('*/v1/entry-drafts/:draftId/commit', function (_a) {
            var _b, _c;
            var params = _a.params;
            var draftId = String(params.draftId);
            var draft = drafts.get(draftId);
            if (!draft) {
                return msw_1.HttpResponse.json({ detail: 'Not found' }, { status: 404 });
            }
            var pathId = draft.pathId;
            if (draft.mode === 'create') {
                // Create a new entry in state
                var existing = (_b = state.entriesByPath[pathId]) !== null && _b !== void 0 ? _b : [];
                var entryId_1 = "entry-".concat(pathId, "-").concat(existing.length + 1);
                var created = createStoryEntry({
                    id: entryId_1,
                    path_id: pathId,
                    day: draft.day,
                    edit_id: 1,
                    content: draft.content,
                    images: draft.images.map(function (dimg) {
                        return createImage({
                            id: dimg.id,
                            entry_id: entryId_1,
                            filename: dimg.filename,
                            content_type: dimg.content_type,
                            byte_size: dimg.byte_size,
                        });
                    }),
                });
                state.entriesByPath[pathId] = __spreadArray([created], existing, true);
                draft.state = 'committed';
                var key = "create:".concat(pathId, ":").concat(draft.day);
                draftIndex.delete(key);
                return msw_1.HttpResponse.json(toEntryContent(created), { status: 200 });
            }
            else {
                // Update existing entry
                var entryRecord_1 = findEntryRecord(state, (_c = draft.entryId) !== null && _c !== void 0 ? _c : '', pathId);
                if (!entryRecord_1) {
                    return msw_1.HttpResponse.json({ detail: 'Not found' }, { status: 404 });
                }
                entryRecord_1.record.content = draft.content;
                entryRecord_1.record.summary.edit_id += 1;
                entryRecord_1.record.images = draft.images.map(function (dimg) {
                    return createImage({
                        id: dimg.id,
                        entry_id: entryRecord_1.record.summary.id,
                        filename: dimg.filename,
                        content_type: dimg.content_type,
                        byte_size: dimg.byte_size,
                    });
                });
                draft.state = 'committed';
                var key = "edit:".concat(pathId, ":").concat(draft.entryId);
                draftIndex.delete(key);
                return msw_1.HttpResponse.json(toEntryContent(entryRecord_1.record), {
                    status: 200,
                });
            }
        }),
        msw_1.http.get('*/v1/images/:imageId/download-url', function (_a) {
            var params = _a.params;
            var imageId = String(params.imageId);
            if (imageId === 'missing-image') {
                return msw_1.HttpResponse.json({ detail: 'Not found' }, { status: 404 });
            }
            var download = createImageDownload(imageId);
            return msw_1.HttpResponse.json(download, { status: 200 });
        }),
        msw_1.http.get('*/storybook-images/:imageId/:variant', function (_a) {
            var params = _a.params;
            var imageId = String(params.imageId);
            var variant = String(params.variant);
            return createStoryImageAssetResponse(imageId, variant === 'thumbnail');
        }),
        msw_1.http.get('*/v1/paths/:pathCode/subscriptions', function (_a) {
            var _b;
            var params = _a.params;
            var subscribers = (_b = state.subscriptionsByPath[String(params.pathCode)]) !== null && _b !== void 0 ? _b : [];
            return msw_1.HttpResponse.json(subscribers, { status: 200 });
        }),
        msw_1.http.post('*/v1/paths/:pathCode/subscriptions', function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var body, subscribers;
            var _c;
            var params = _b.params, request = _b.request;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, request.json()];
                    case 1:
                        body = (_d.sent());
                        subscribers = (_c = state.subscriptionsByPath[String(params.pathCode)]) !== null && _c !== void 0 ? _c : [];
                        state.subscriptionsByPath[String(params.pathCode)] = subscribers;
                        return [2 /*return*/, msw_1.HttpResponse.json({
                                invitation_id: "invite-".concat(slugify(body.email)),
                                status: 'sent',
                            }, { status: 201 })];
                }
            });
        }); }),
        msw_1.http.delete('*/v1/paths/:pathCode/subscriptions/:targetUserId', function (_a) {
            var _b;
            var params = _a.params;
            var pathId = String(params.pathCode);
            state.subscriptionsByPath[pathId] = ((_b = state.subscriptionsByPath[pathId]) !== null && _b !== void 0 ? _b : []).filter(function (subscriber) { return subscriber.user_id !== params.targetUserId; });
            return new msw_1.HttpResponse(null, { status: 204 });
        }),
        msw_1.http.get('*/v1/invitations', function () {
            return msw_1.HttpResponse.json(state.invitations, { status: 200 });
        }),
        msw_1.http.post('*/v1/invitations/:invitationId/accept', function (_a) {
            var params = _a.params;
            var invitation = state.invitations.find(function (item) { return item.id === params.invitationId; });
            if (invitation) {
                invitation.status = 'accepted';
                invitation.updated_at = storyTimestampOffset(0);
            }
            return new msw_1.HttpResponse(null, { status: 204 });
        }),
        msw_1.http.post('*/v1/invitations/:invitationId/ignore', function (_a) {
            var params = _a.params;
            var invitation = state.invitations.find(function (item) { return item.id === params.invitationId; });
            if (invitation) {
                invitation.status = 'ignored';
                invitation.updated_at = storyTimestampOffset(0);
            }
            return new msw_1.HttpResponse(null, { status: 204 });
        }),
        msw_1.http.get('*/v1/invitations/blocklist', function () {
            return msw_1.HttpResponse.json(state.blocklist, { status: 200 });
        }),
        msw_1.http.post('*/v1/invitations/blocklist', function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var body;
            var request = _b.request;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, request.json()];
                    case 1:
                        body = (_c.sent());
                        state.blocklist.push({
                            id: "blocked-".concat(slugify(body.user_id)),
                            blocked_user_id: body.user_id,
                            created_at: storyTimestampOffset(0),
                        });
                        return [2 /*return*/, new msw_1.HttpResponse(null, { status: 204 })];
                }
            });
        }); }),
        msw_1.http.delete('*/v1/invitations/blocklist/:blockedUserId', function (_a) {
            var params = _a.params;
            state.blocklist = state.blocklist.filter(function (item) { return item.blocked_user_id !== params.blockedUserId; });
            return new msw_1.HttpResponse(null, { status: 204 });
        }),
        msw_1.http.get('*/v1/auth/login', function () {
            return msw_1.HttpResponse.json({ authorization_url: state.authLoginUrl }, { status: 200 });
        }),
        msw_1.http.post('*/v1/auth/callback', function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var body;
            var _c;
            var request = _b.request;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, request.json()];
                    case 1:
                        body = (_d.sent());
                        if (!body.code || !body.state) {
                            return [2 /*return*/, msw_1.HttpResponse.json({ detail: 'Missing code or state parameter.' }, { status: 422 })];
                        }
                        return [2 /*return*/, msw_1.HttpResponse.json((_c = state.currentUser) !== null && _c !== void 0 ? _c : exports.storybookUser, {
                                status: 200,
                            })];
                }
            });
        }); }),
        msw_1.http.get('*/v1/auth/callback', function (_a) {
            var _b;
            var request = _a.request;
            var url = new URL(request.url);
            if (!url.searchParams.get('code') || !url.searchParams.get('state')) {
                return msw_1.HttpResponse.json({ detail: 'Missing code or state parameter.' }, { status: 422 });
            }
            return msw_1.HttpResponse.json((_b = state.currentUser) !== null && _b !== void 0 ? _b : exports.storybookUser, {
                status: 200,
            });
        }),
        msw_1.http.post('*/v1/exports', function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var body, exportId;
            var request = _b.request;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, request.json()];
                    case 1:
                        body = (_c.sent());
                        exportId = "export-".concat(Object.keys(exportRequests).length + 1);
                        exportPolls[exportId] = 0;
                        exportRequests[exportId] = body.path_ids;
                        return [2 /*return*/, msw_1.HttpResponse.json(createExportJob(exportId, 'queued', body.path_ids), { status: 202 })];
                }
            });
        }); }),
        msw_1.http.get('*/v1/exports/:exportId', function (_a) {
            var _b, _c;
            var params = _a.params;
            var exportId = String(params.exportId);
            exportPolls[exportId] = ((_b = exportPolls[exportId]) !== null && _b !== void 0 ? _b : 0) + 1;
            var requestedPathIds = (_c = exportRequests[exportId]) !== null && _c !== void 0 ? _c : [];
            var stateName = exportPolls[exportId] > 1 ? 'ready' : 'running';
            return msw_1.HttpResponse.json(createExportJob(exportId, stateName, requestedPathIds), { status: 200 });
        }),
        msw_1.http.get('*/v1/exports/:exportId/download/json', function (_a) {
            var _b;
            var params = _a.params;
            var exportId = String(params.exportId);
            var requestedPathIds = (_b = exportRequests[exportId]) !== null && _b !== void 0 ? _b : [];
            var url = createJsonDataUrl(buildExportPayload(state, requestedPathIds));
            var response = {
                url: url,
                expires_in_seconds: 900,
            };
            return msw_1.HttpResponse.json(response, { status: 200 });
        }),
        msw_1.http.get('*/v1/exports/:exportId/download/images', function () {
            var response = {
                url: ZIP_DATA_URL,
                expires_in_seconds: 900,
            };
            return msw_1.HttpResponse.json(response, { status: 200 });
        }),
        msw_1.http.post('*/v1/account/deletion-requests', function () {
            var req = {
                id: 'del-req-1',
                state: 'requested',
                error_message: null,
                failure_code: null,
                attempt_count: 0,
                created_at: storyTimestampOffset(0),
                updated_at: storyTimestampOffset(0),
            };
            state.deletionRequest = req;
            return msw_1.HttpResponse.json(req, { status: 200 });
        }),
        msw_1.http.get('*/v1/account/deletion-requests/latest', function () {
            if (!state.deletionRequest) {
                return msw_1.HttpResponse.json({ detail: 'No deletion request found.' }, { status: 404 });
            }
            return msw_1.HttpResponse.json(__assign(__assign({ id: 'del-req-1' }, state.deletionRequest), { failure_code: null, attempt_count: 1, created_at: storyTimestampOffset(-1), updated_at: storyTimestampOffset(0) }), { status: 200 });
        }),
        msw_1.http.all('*/v1/*', function (_a) {
            var request = _a.request;
            var url = new URL(request.url);
            return msw_1.HttpResponse.json({
                detail: "No Storybook handler for ".concat(request.method, " ").concat(url.pathname),
            }, { status: 501 });
        }),
    ], false);
}
function createStoryPath(input) {
    return __assign(__assign({}, input), { uuid: "uuid-".concat(input.path_id), is_public: false, created_at: storyTimestampOffset(-30), updated_at: storyTimestampOffset(-1) });
}
function createStoryEntry(input) {
    var _a;
    return {
        summary: {
            id: input.id,
            path_id: input.path_id,
            day: input.day,
            edit_id: input.edit_id,
        },
        content: input.content,
        images: (_a = input.images) !== null && _a !== void 0 ? _a : [],
    };
}
function createImage(input) {
    return __assign(__assign({}, input), { status: 'ready', strip_metadata: true });
}
function createDraftImageFromEntryImage(image) {
    return {
        id: image.id,
        draft_id: '',
        source: 'live',
        live_image_id: image.id,
        filename: image.filename,
        status: 'ready',
        content_type: image.content_type,
        strip_metadata: image.strip_metadata,
        byte_size: image.byte_size,
        client_image_id: null,
    };
}
function createExportJob(exportId, state, requested_path_ids) {
    return {
        id: exportId,
        state: state,
        requested_path_ids: requested_path_ids,
        created_at: storyTimestampOffset(0),
        updated_at: storyTimestampOffset(0),
        expires_at: state === 'ready' ? storyTimestampOffset(1) : null,
        failure_code: null,
        attempt_count: state === 'ready' ? 2 : 1,
    };
}
function createImageDownload(imageId) {
    return {
        image_url: "/storybook-images/".concat(imageId, "/full"),
        thumbnail_url: "/storybook-images/".concat(imageId, "/thumbnail"),
        expires_in_seconds: 600,
    };
}
function createStoryImageAssetResponse(imageId, thumbnail) {
    if (thumbnail === void 0) { thumbnail = false; }
    var color = imageId.includes('sunrise')
        ? '#2B6CB0'
        : imageId.includes('whiteboard')
            ? '#D97706'
            : '#15803D';
    var label = imageId
        .replace(/^img-/, '')
        .replace(/^upload-/, 'upload')
        .replace(/-/g, ' ');
    return new msw_1.HttpResponse(svgMarkup(label, color, thumbnail ? 160 : 960, thumbnail ? 160 : 640), {
        status: 200,
        headers: { 'Content-Type': 'image/svg+xml' },
    });
}
function buildExportPayload(state, requestedPathIds) {
    var entries = requestedPathIds.flatMap(function (pathId) {
        var _a;
        return ((_a = state.entriesByPath[pathId]) !== null && _a !== void 0 ? _a : []).map(function (record) { return ({
            day: record.summary.day,
            entry_id: record.summary.id,
            edit_id: record.summary.edit_id,
            image_filenames: record.images.map(function (image) { return image.filename; }),
            content: record.content,
            path_id: pathId,
        }); });
    });
    return {
        exported_at: STORYBOOK_NOW_ISO,
        path_ids: requestedPathIds,
        entries: entries,
    };
}
function toEntryContent(record) {
    return __assign(__assign({}, record.summary), { content: record.content, image_filenames: record.images.map(function (image) { return image.filename; }) });
}
function findEntryRecord(state, entryId, pathId) {
    var _a;
    var pathIds = pathId ? [pathId] : Object.keys(state.entriesByPath);
    for (var _i = 0, pathIds_1 = pathIds; _i < pathIds_1.length; _i++) {
        var currentPathId = pathIds_1[_i];
        var record = ((_a = state.entriesByPath[currentPathId]) !== null && _a !== void 0 ? _a : []).find(function (item) { return item.summary.id === entryId; });
        if (record) {
            return { pathId: currentPathId, record: record };
        }
    }
    return null;
}
function clearSessionStorage() {
    localStorage.clear();
    sessionStorage.clear();
}
function clearStoryDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.all([
                            db_1.db.pathPreferences.clear(),
                            db_1.db.queryCache.clear(),
                            db_1.db.entryContent.clear(),
                            db_1.db.entryImages.clear(),
                        ])];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function seedStoryCache(state) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    seedQueryCacheFromState(state);
                    return [4 /*yield*/, seedDatabaseFromState(state)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function seedQueryCacheFromState(state) {
    var _a, _b;
    exports.storybookQueryClient.setQueryData((0, apiClient_1.getListPathsQueryKey)(), createQueryResponse(state.paths));
    exports.storybookQueryClient.setQueryData((0, apiClient_1.getListInvitationsQueryKey)(), createQueryResponse(state.invitations));
    exports.storybookQueryClient.setQueryData((0, apiClient_1.getListBlocklistQueryKey)(), createQueryResponse(state.blocklist));
    for (var _i = 0, _c = state.paths; _i < _c.length; _i++) {
        var path = _c[_i];
        var pathId = path.path_id;
        var entries = (_a = state.entriesByPath[pathId]) !== null && _a !== void 0 ? _a : [];
        exports.storybookQueryClient.setQueryData((0, apiClient_1.getListEntriesQueryKey)(pathId), createQueryResponse(entries.map(function (record) { return record.summary; })));
        exports.storybookQueryClient.setQueryData((0, apiClient_1.getListSubscriptionsQueryKey)(pathId), createQueryResponse((_b = state.subscriptionsByPath[pathId]) !== null && _b !== void 0 ? _b : []));
        for (var _d = 0, entries_1 = entries; _d < entries_1.length; _d++) {
            var record = entries_1[_d];
            exports.storybookQueryClient.setQueryData((0, apiClient_1.getGetEntryQueryKey)(pathId, record.summary.id), createQueryResponse(toEntryContent(record)));
            exports.storybookQueryClient.setQueryData((0, apiClient_1.getListEntryImagesQueryKey)(pathId, record.summary.id), createQueryResponse(record.images));
        }
    }
}
function seedDatabaseFromState(state) {
    return __awaiter(this, void 0, void 0, function () {
        var entryContentRows, entryImageRows;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    entryContentRows = Object.entries(state.entriesByPath).flatMap(function (_a) {
                        var pathId = _a[0], entries = _a[1];
                        return entries.map(function (record) { return ({
                            cache_key: "".concat(pathId, ":").concat(record.summary.id),
                            id: record.summary.id,
                            path_id: pathId,
                            day: record.summary.day,
                            edit_id: record.summary.edit_id,
                            content: record.content,
                            image_filenames: record.images.map(function (image) { return image.filename; }),
                        }); });
                    });
                    entryImageRows = Object.values(state.entriesByPath).flatMap(function (entries) {
                        return entries.flatMap(function (record) {
                            return record.images.map(function (image) { return ({
                                id: image.id,
                                entry_id: image.entry_id,
                                filename: image.filename,
                                status: image.status,
                                strip_metadata: image.strip_metadata,
                                content_type: image.content_type,
                                byte_size: image.byte_size,
                            }); });
                        });
                    });
                    if (!(entryContentRows.length > 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, db_1.db.entryContent.bulkPut(entryContentRows)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (!(entryImageRows.length > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, db_1.db.entryImages.bulkPut(entryImageRows)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function createQueryResponse(data) {
    return {
        data: data,
        status: 200,
        headers: new Headers(),
    };
}
function createOverrideHandlers(requestOverrides) {
    return requestOverrides.map(function (override) {
        var _a;
        var method = (_a = override.method) !== null && _a !== void 0 ? _a : 'ALL';
        var resolver = function () {
            var _a, _b;
            if (override.networkError) {
                return msw_1.HttpResponse.error();
            }
            return msw_1.HttpResponse.json((_a = override.body) !== null && _a !== void 0 ? _a : { detail: 'Storybook forced response' }, { status: (_b = override.status) !== null && _b !== void 0 ? _b : 500 });
        };
        if (method === 'GET')
            return msw_1.http.get(override.path, resolver);
        if (method === 'POST')
            return msw_1.http.post(override.path, resolver);
        if (method === 'PUT')
            return msw_1.http.put(override.path, resolver);
        if (method === 'DELETE')
            return msw_1.http.delete(override.path, resolver);
        if (method === 'PATCH')
            return msw_1.http.patch(override.path, resolver);
        return msw_1.http.all(override.path, resolver);
    });
}
function cloneEntriesByPath(entriesByPath) {
    return Object.fromEntries(Object.entries(entriesByPath).map(function (_a) {
        var pathId = _a[0], entries = _a[1];
        return [
            pathId,
            clone(entries),
        ];
    }));
}
function clone(value) {
    return JSON.parse(JSON.stringify(value));
}
function installDeterministicDate() {
    var globalScope = globalThis;
    if (globalScope.__PATHS_STORYBOOK_DATE__) {
        return;
    }
    var RealDate = Date;
    var fixedTime = STORYBOOK_NOW.getTime();
    var MockDate = /** @class */ (function (_super) {
        __extends(MockDate, _super);
        function MockDate() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var _this = this;
            if (args.length < 1) {
                _this = _super.call(this, fixedTime) || this;
            }
            else {
                _this = _super.apply(this, args) || this;
            }
            return _this;
        }
        MockDate.now = function () {
            return fixedTime;
        };
        MockDate.parse = function (value) {
            return RealDate.parse(value);
        };
        MockDate.UTC = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return RealDate.UTC.apply(RealDate, args);
        };
        return MockDate;
    }(RealDate));
    globalThis.Date = MockDate;
    globalScope.__PATHS_STORYBOOK_DATE__ = true;
}
function installMatchMediaStub() {
    if (typeof window === 'undefined' ||
        typeof window.matchMedia === 'function') {
        return;
    }
    window.matchMedia = function (query) {
        return ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: function () { },
            removeEventListener: function () { },
            addListener: function () { },
            removeListener: function () { },
            dispatchEvent: function () {
                return false;
            },
        });
    };
}
function installNavigatorOnlineStub() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return;
    }
    var globalScope = window;
    if (globalScope.__PATHS_STORYBOOK_ONLINE_STUB__) {
        return;
    }
    globalScope.__PATHS_STORYBOOK_NETWORK_MODE__ = 'online';
    try {
        Object.defineProperty(window.navigator, 'onLine', {
            configurable: true,
            get: function () {
                return globalScope.__PATHS_STORYBOOK_NETWORK_MODE__ !== 'offline';
            },
        });
        globalScope.__PATHS_STORYBOOK_ONLINE_STUB__ = true;
    }
    catch (_a) {
        // Some environments may not permit redefining navigator.onLine.
    }
}
function ensureStorybookChromeStyles() {
    if (typeof document === 'undefined') {
        return;
    }
    if (document.getElementById('paths-storybook-chrome')) {
        return;
    }
    var style = document.createElement('style');
    style.id = 'paths-storybook-chrome';
    style.textContent = "\n    html,\n    body,\n    #storybook-root {\n      min-height: 100%;\n    }\n\n    .sb-story-root {\n      min-height: 100vh;\n      display: block;\n    }\n\n    .sb-phone-stage {\n      min-height: 100vh;\n      padding: 28px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      background:\n        radial-gradient(circle at top, rgba(57, 73, 171, 0.16), transparent 34%),\n        linear-gradient(180deg, #f6f1e6 0%, #ece4d6 48%, #e8e1d4 100%);\n      box-sizing: border-box;\n    }\n\n    .sb-phone-frame {\n      width: min(100%, 428px);\n      min-height: 872px;\n      padding: 18px 12px 16px;\n      border-radius: 46px;\n      position: relative;\n      background:\n        linear-gradient(180deg, #3e434d 0%, #1d1f24 18%, #090a0d 100%);\n      border: 1px solid rgba(255, 255, 255, 0.12);\n      box-shadow:\n        0 36px 80px rgba(28, 24, 16, 0.28),\n        inset 0 0 0 1px rgba(255, 255, 255, 0.08),\n        inset 0 -10px 30px rgba(255, 255, 255, 0.04);\n      box-sizing: border-box;\n    }\n\n    .sb-phone-frame::before,\n    .sb-phone-frame::after {\n      content: '';\n      position: absolute;\n      right: -3px;\n      width: 3px;\n      border-radius: 999px;\n      background: rgba(16, 18, 22, 0.9);\n    }\n\n    .sb-phone-frame::before {\n      top: 170px;\n      height: 70px;\n    }\n\n    .sb-phone-frame::after {\n      top: 262px;\n      height: 108px;\n    }\n\n    .sb-phone-speaker {\n      width: 112px;\n      height: 28px;\n      margin: 0 auto 10px;\n      border-radius: 999px;\n      background:\n        radial-gradient(circle at center, rgba(255, 255, 255, 0.12), transparent 56%),\n        rgba(8, 10, 13, 0.96);\n      box-shadow:\n        inset 0 1px 0 rgba(255, 255, 255, 0.12),\n        0 1px 0 rgba(255, 255, 255, 0.04);\n    }\n\n    .sb-phone-screen {\n      width: 100%;\n      min-height: 824px;\n      overflow: hidden;\n      position: relative;\n      border-radius: 34px;\n      background: var(--ion-background-color, #ffffff);\n      box-shadow:\n        inset 0 0 0 1px rgba(15, 23, 42, 0.08),\n        0 0 0 1px rgba(255, 255, 255, 0.06);\n    }\n\n    .sb-phone-screen > *,\n    .sb-phone-screen .ion-page {\n      height: 100%;\n      min-height: 100%;\n    }\n\n    .sb-phone-screen ion-content {\n      --padding-bottom: 28px;\n    }\n\n    .sb-story-root[data-color-mode=\"dark\"] .sb-phone-stage {\n      background:\n        radial-gradient(circle at top, rgba(121, 134, 203, 0.28), transparent 32%),\n        linear-gradient(180deg, #171923 0%, #12141c 52%, #0c0e15 100%);\n    }\n\n    .sb-story-root[data-color-mode=\"dark\"] .sb-phone-frame {\n      background:\n        linear-gradient(180deg, #59606b 0%, #23272d 18%, #07080b 100%);\n    }\n\n    @media (max-width: 640px) {\n      .sb-phone-stage {\n        padding: 12px;\n      }\n\n      .sb-phone-frame {\n        width: min(100%, 402px);\n        min-height: 824px;\n        padding: 14px 10px 12px;\n        border-radius: 38px;\n      }\n\n      .sb-phone-speaker {\n        margin-bottom: 8px;\n      }\n\n      .sb-phone-screen {\n        min-height: 780px;\n        border-radius: 28px;\n      }\n    }\n  ";
    document.head.appendChild(style);
}
function applyStorybookNetworkMode(mode) {
    if (typeof window === 'undefined') {
        return;
    }
    var globalScope = window;
    globalScope.__PATHS_STORYBOOK_NETWORK_MODE__ = mode;
    window.dispatchEvent(new Event(mode === 'offline' ? 'offline' : 'online'));
}
function normalizeStoryColorMode(value) {
    return value === 'dark' || value === 'system' ? value : 'light';
}
function createStoryApiError(path, status, method, body) {
    if (status === void 0) { status = 500; }
    if (method === void 0) { method = 'ALL'; }
    return {
        path: path,
        method: method,
        status: status,
        body: body,
    };
}
function createStoryNetworkError(path, method) {
    if (method === void 0) { method = 'ALL'; }
    return {
        path: path,
        method: method,
        networkError: true,
    };
}
function applyStorybookColorMode(mode) {
    var _a, _b;
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
    }
    if (mode === 'system') {
        localStorage.removeItem(STORYBOOK_DARK_MODE_KEY);
        document.documentElement.classList.toggle('ion-palette-dark', (_b = (_a = window.matchMedia) === null || _a === void 0 ? void 0 : _a.call(window, '(prefers-color-scheme: dark)').matches) !== null && _b !== void 0 ? _b : false);
        return;
    }
    localStorage.setItem(STORYBOOK_DARK_MODE_KEY, mode);
    document.documentElement.classList.toggle('ion-palette-dark', mode === 'dark');
}
function storyDateOffset(dayOffset) {
    var date = new Date(STORYBOOK_NOW);
    date.setUTCDate(date.getUTCDate() + dayOffset);
    return date.toISOString().slice(0, 10);
}
function storyDateYearsAgo(yearsAgo) {
    var date = new Date(STORYBOOK_NOW);
    date.setUTCFullYear(date.getUTCFullYear() - yearsAgo);
    return date.toISOString().slice(0, 10);
}
function storyTimestampOffset(dayOffset) {
    var date = new Date(STORYBOOK_NOW);
    date.setUTCDate(date.getUTCDate() + dayOffset);
    return date.toISOString();
}
function slugify(value) {
    return (value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'untitled');
}
function createJsonDataUrl(value) {
    return "data:application/json;charset=utf-8,".concat(encodeURIComponent(JSON.stringify(value, null, 2)));
}
function svgMarkup(label, color, width, height) {
    if (width === void 0) { width = 960; }
    if (height === void 0) { height = 640; }
    var safeLabel = escapeXml(label);
    return "\n    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"".concat(width, "\" height=\"").concat(height, "\" viewBox=\"0 0 ").concat(width, " ").concat(height, "\">\n      <rect width=\"").concat(width, "\" height=\"").concat(height, "\" fill=\"").concat(color, "\" />\n      <rect x=\"32\" y=\"32\" width=\"").concat(width - 64, "\" height=\"").concat(height - 64, "\" rx=\"28\" fill=\"rgba(255,255,255,0.16)\" />\n      <text x=\"50%\" y=\"50%\" text-anchor=\"middle\" dominant-baseline=\"middle\" fill=\"white\" font-family=\"Georgia, serif\" font-size=\"").concat(Math.max(24, Math.round(width / 16)), "\">").concat(safeLabel, "</text>\n    </svg>\n  ");
}
function escapeXml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');
}
