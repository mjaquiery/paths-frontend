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
var _a, _b;
var _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviousYears = exports.Subscribed = exports.LoadingEntry = exports.EmptyEntry = exports.EntryWithImages = exports.Default = void 0;
var index_vue_1 = require("./index.vue");
var storySupport_1 = require("~/src/storybook/storySupport");
var populatedState = (0, storySupport_1.createPopulatedState)();
// EmptyEntry: entry exists but content is an empty string.
var emptyEntryState = (0, storySupport_1.createPopulatedState)({
    entriesByPath: __assign(__assign({}, (0, storySupport_1.createPopulatedState)().entriesByPath), (_a = {}, _a[storySupport_1.storybookPaths.daily.path_id] = [
        (0, storySupport_1.createStoryEntry)({
            id: 'entry-daily-empty',
            path_id: storySupport_1.storybookPaths.daily.path_id,
            day: '2025-03-15',
            edit_id: 1,
            content: '',
        }),
    ], _a)),
});
// Subscribed: the entry belongs to a path owned by another user.
var subscribedState = (0, storySupport_1.createPopulatedState)({
    paths: [storySupport_1.storybookPaths.shared],
    entriesByPath: (_b = {},
        _b[storySupport_1.storybookPaths.shared.path_id] = (_c = (0, storySupport_1.createPopulatedState)().entriesByPath[storySupport_1.storybookPaths.shared.path_id]) !== null && _c !== void 0 ? _c : [],
        _b),
});
var meta = {
    title: 'Views/EntryView',
    component: index_vue_1.default,
};
exports.default = meta;
exports.Default = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/entry/daily-river/entry-daily-today',
    }),
};
/** Entry with an attached image — exercises the MarkdownContent images prop. */
exports.EntryWithImages = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/entry/daily-river/entry-daily-today',
        seedCacheFromState: true,
    }),
};
/**
 * Entry exists but its content is an empty string — shows the "(no text)"
 * placeholder branch.
 */
exports.EmptyEntry = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: emptyEntryState,
        route: '/entry/daily-river/entry-daily-empty',
        seedCacheFromState: true,
    }),
};
/**
 * The entry data has not yet loaded — the API response is pending and nothing
 * has been seeded into the cache, so the view shows "Loading…".
 */
exports.LoadingEntry = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/entry/daily-river/missing-entry',
    }),
};
/**
 * Entry for a path owned by another user — the current user is a subscriber.
 * Edit and Delete buttons should not be visible.
 */
exports.Subscribed = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: subscribedState,
        route: '/entry/family-trip/entry-shared-yesterday',
        seedCacheFromState: true,
    }),
};
/**
 * Entries for the same MM-DD in prior years exist on the path — exercises the
 * "✨ On this day (other years)" section.
 */
exports.PreviousYears = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/entry/daily-river/entry-daily-today',
        seedCacheFromState: true,
    }),
};
