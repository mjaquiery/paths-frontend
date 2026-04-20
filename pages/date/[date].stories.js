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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Offline = exports.ApiError = exports.PreviousYears = exports.EmptyDay = exports.CrowdedDay = exports.Default = void 0;
var _date__vue_1 = require("./[date].vue");
var storySupport_1 = require("~/src/storybook/storySupport");
var populatedState = (0, storySupport_1.createPopulatedState)();
var crowdedState = (0, storySupport_1.createPopulatedState)();
for (var index = 0; index < 7; index += 1) {
    var pathId = "crowded-path-".concat(index + 1);
    crowdedState.paths.push((0, storySupport_1.createStoryPath)({
        path_id: pathId,
        owner_user_id: storySupport_1.storybookUser.user_id,
        title: "Project ".concat(index + 1),
        description: "Extra path ".concat(index + 1, " for dense date coverage."),
        color: [
            '#0F766E',
            '#C2410C',
            '#7C3AED',
            '#BE123C',
            '#2563EB',
            '#4D7C0F',
            '#9333EA',
        ][index],
    }));
    crowdedState.entriesByPath[pathId] = [
        (0, storySupport_1.createStoryEntry)({
            id: "entry-".concat(pathId, "-today"),
            path_id: pathId,
            day: (0, storySupport_1.storyDateOffset)(0),
            edit_id: index + 1,
            content: "Dense calendar coverage for ".concat(pathId, "."),
        }),
    ];
}
// PreviousYears: add entries for the same MM-DD in prior years to exercise the
// "On this day (other years)" section in DateView.
var previousYearsState = (0, storySupport_1.createPopulatedState)({
    entriesByPath: __assign(__assign({}, (0, storySupport_1.createPopulatedState)().entriesByPath), (_a = {}, _a[storySupport_1.storybookPaths.daily.path_id] = [
        (0, storySupport_1.createStoryEntry)({
            id: 'entry-daily-today',
            path_id: storySupport_1.storybookPaths.daily.path_id,
            day: (0, storySupport_1.storyDateOffset)(0),
            edit_id: 41,
            content: 'Swam before sunrise. The river was glassy quiet.',
        }),
        (0, storySupport_1.createStoryEntry)({
            id: 'entry-daily-last-year',
            path_id: storySupport_1.storybookPaths.daily.path_id,
            day: (0, storySupport_1.storyDateYearsAgo)(1),
            edit_id: 32,
            content: 'Same date, different weather. First daffodils opened.',
        }),
        (0, storySupport_1.createStoryEntry)({
            id: 'entry-daily-two-years',
            path_id: storySupport_1.storybookPaths.daily.path_id,
            day: (0, storySupport_1.storyDateYearsAgo)(2),
            edit_id: 19,
            content: 'Cleaned the kitchen radio and played Nina Simone all evening.',
        }),
    ], _a)),
});
// EmptyDay: current user owns paths but has no entry on this specific date.
var emptyDayState = (0, storySupport_1.createEmptyState)();
var meta = {
    title: 'Views/DateView',
    component: _date__vue_1.default,
};
exports.default = meta;
exports.Default = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/date/2025-03-15',
    }),
};
exports.CrowdedDay = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: crowdedState,
        route: '/date/2025-03-15',
    }),
};
/**
 * No entries for this date, but owned paths exist.
 * Exercises the "Write in [Path]" / "+ Create entry" empty-state branch.
 */
exports.EmptyDay = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: emptyDayState,
        route: '/date/2025-03-15',
        seedCacheFromState: true,
    }),
};
/**
 * Entries exist for the same MM-DD in prior years — exercises the
 * "✨ Previously on this day" section below the current-day entries.
 */
exports.PreviousYears = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: previousYearsState,
        route: '/date/2025-03-15',
        seedCacheFromState: true,
    }),
};
/** Paths API returns an error — banner should appear at the top of the view. */
exports.ApiError = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/date/2025-03-15',
        seedCacheFromState: true,
        requestOverrides: [
            (0, storySupport_1.createStoryApiError)('*/v1/paths', 503, 'GET', {
                detail: 'Storybook forced paths outage.',
            }),
        ],
    }),
};
exports.Offline = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/date/2025-03-15',
        networkMode: 'offline',
        seedCacheFromState: true,
        requestOverrides: [(0, storySupport_1.createStoryNetworkError)('*/v1/*')],
    }),
};
