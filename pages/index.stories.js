"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loading = exports.EmptyPaths = exports.PathsApiError = exports.Offline = exports.Crowded = exports.LoggedOut = exports.Default = void 0;
var index_vue_1 = require("./index.vue");
var storySupport_1 = require("~/src/storybook/storySupport");
var populatedState = (0, storySupport_1.createPopulatedState)();
var crowdedState = (0, storySupport_1.createPopulatedState)();
for (var index = 0; index < 6; index += 1) {
    var pathId = "home-extra-".concat(index + 1);
    crowdedState.paths.push((0, storySupport_1.createStoryPath)({
        path_id: pathId,
        owner_user_id: storySupport_1.storybookUser.user_id,
        title: "Focus ".concat(index + 1),
        description: "A busy home view lane ".concat(index + 1),
        color: ['#0F766E', '#B45309', '#1D4ED8', '#A21CAF', '#15803D', '#BE123C'][index],
    }));
    crowdedState.entriesByPath[pathId] = [
        (0, storySupport_1.createStoryEntry)({
            id: "".concat(pathId, "-today"),
            path_id: pathId,
            day: (0, storySupport_1.storyDateOffset)(0),
            edit_id: 1,
            content: "Today is busy in ".concat(pathId, "."),
        }),
        (0, storySupport_1.createStoryEntry)({
            id: "".concat(pathId, "-yesterday"),
            path_id: pathId,
            day: (0, storySupport_1.storyDateOffset)(-1),
            edit_id: 1,
            content: "Yesterday in ".concat(pathId, "."),
        }),
    ];
}
var meta = {
    title: 'Views/HomeView',
    component: index_vue_1.default,
};
exports.default = meta;
exports.Default = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/',
        seedCacheFromState: true,
    }),
};
exports.LoggedOut = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/',
        sessionUser: null,
        seedCacheFromState: true,
    }),
};
exports.Crowded = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: crowdedState,
        route: '/',
        seedCacheFromState: true,
    }),
};
exports.Offline = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/',
        networkMode: 'offline',
        seedCacheFromState: true,
        requestOverrides: [(0, storySupport_1.createStoryNetworkError)('*/v1/*')],
    }),
};
exports.PathsApiError = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/',
        seedCacheFromState: true,
        requestOverrides: [
            (0, storySupport_1.createStoryApiError)('*/v1/paths', 503, 'GET', {
                detail: 'Storybook forced paths outage.',
            }),
        ],
    }),
};
/**
 * No paths at all — only owned paths allow entry creation, so WeekView should
 * show a "Create a Path" CTA rather than per-day "+" chips.
 */
exports.EmptyPaths = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: (0, storySupport_1.createEmptyState)({ paths: [] }),
        route: '/',
        seedCacheFromState: true,
    }),
};
/**
 * Paths are loading (no cache, no state seeded) — the selector bar and week
 * view should show loading skeletons / spinners.
 */
exports.Loading = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/',
        seedCacheFromState: false,
    }),
};
