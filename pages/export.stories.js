"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.Offline = exports.NoPaths = exports.ManyPaths = exports.Default = void 0;
var export_vue_1 = require("./export.vue");
var storySupport_1 = require("~/src/storybook/storySupport");
var populatedState = (0, storySupport_1.createPopulatedState)();
var manyPathsState = (0, storySupport_1.createPopulatedState)();
var noPathsState = (0, storySupport_1.createPopulatedState)({
    paths: [],
    entriesByPath: {},
});
for (var index = 0; index < 9; index += 1) {
    manyPathsState.paths.push((0, storySupport_1.createStoryPath)({
        path_id: "export-path-".concat(index + 1),
        owner_user_id: storySupport_1.storybookUser.user_id,
        title: "Archive ".concat(index + 1),
        description: "Export scenario path ".concat(index + 1),
        color: [
            '#0F766E',
            '#B45309',
            '#7C2D12',
            '#1D4ED8',
            '#9D174D',
            '#166534',
            '#4338CA',
            '#0891B2',
            '#A16207',
        ][index],
    }));
}
var meta = {
    title: 'Views/ExportView',
    component: export_vue_1.default,
};
exports.default = meta;
exports.Default = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/export',
    }),
};
exports.ManyPaths = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: manyPathsState,
        route: '/export',
    }),
};
exports.NoPaths = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: noPathsState,
        route: '/export',
    }),
};
exports.Offline = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: manyPathsState,
        route: '/export',
        networkMode: 'offline',
        seedCacheFromState: true,
        requestOverrides: [(0, storySupport_1.createStoryNetworkError)('*/v1/*')],
    }),
};
/**
 * The paths API fails — the view should display an error banner while still
 * showing the rest of the export UI.
 */
exports.ApiError = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/export',
        seedCacheFromState: true,
        requestOverrides: [
            (0, storySupport_1.createStoryApiError)('*/v1/paths', 503, 'GET', {
                detail: 'Storybook forced paths outage.',
            }),
        ],
    }),
};
