"use strict";
var _a;
var _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Offline = exports.PathNotFound = exports.Subscribed = exports.Empty = exports.LongArchive = exports.Default = void 0;
var _pathId__vue_1 = require("./[pathId].vue");
var storySupport_1 = require("~/src/storybook/storySupport");
var populatedState = (0, storySupport_1.createPopulatedState)();
var longArchiveState = (0, storySupport_1.createPopulatedState)();
longArchiveState.entriesByPath['daily-river'] = Array.from({ length: 14 }, function (_, index) {
    return (0, storySupport_1.createStoryEntry)({
        id: "daily-archive-".concat(index + 1),
        path_id: 'daily-river',
        day: (0, storySupport_1.storyDateOffset)(-index * 6),
        edit_id: index + 1,
        content: "Archive entry ".concat(index + 1, " with enough text to show truncation in the path list."),
    });
});
// Empty path — no entries yet.
var emptyPathState = (0, storySupport_1.createEmptyState)();
// Subscribed path — owned by user-bravo; current user (user-alpha) is a subscriber.
var subscribedState = (0, storySupport_1.createPopulatedState)({
    paths: [storySupport_1.storybookPaths.shared],
    entriesByPath: (_a = {},
        _a[storySupport_1.storybookPaths.shared.path_id] = (_b = populatedState.entriesByPath[storySupport_1.storybookPaths.shared.path_id]) !== null && _b !== void 0 ? _b : [],
        _a),
});
var meta = {
    title: 'Views/PathView',
    component: _pathId__vue_1.default,
};
exports.default = meta;
exports.Default = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/path/daily-river',
    }),
};
exports.LongArchive = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: longArchiveState,
        route: '/path/daily-river',
    }),
};
/** Path exists but has no entries — exercises the empty-state CTA branch. */
exports.Empty = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: emptyPathState,
        route: '/path/daily-river',
        seedCacheFromState: true,
    }),
};
/**
 * Path owned by another user — the current user is a subscriber.
 * No "+ Entry" button or edit actions should be visible.
 */
exports.Subscribed = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: subscribedState,
        route: '/path/family-trip',
        seedCacheFromState: true,
    }),
};
/**
 * The path code does not match any known path — the API returns 404 and the
 * view should show an appropriate not-found message.
 */
exports.PathNotFound = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/path/no-such-path',
        requestOverrides: [(0, storySupport_1.createStoryApiError)('*/v1/paths', 200, 'GET', [])],
    }),
};
exports.Offline = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: longArchiveState,
        route: '/path/daily-river',
        networkMode: 'offline',
        seedCacheFromState: true,
        requestOverrides: [(0, storySupport_1.createStoryNetworkError)('*/v1/*')],
    }),
};
