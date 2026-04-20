"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Offline = exports.WithImageUpload = exports.DraftResumed = exports.SaveError = exports.DraftInitError = exports.PathsApiError = exports.NoOwnedPaths = exports.FilledIn = exports.Default = void 0;
var new_vue_1 = require("./new.vue");
var storySupport_1 = require("~/src/storybook/storySupport");
var populatedState = (0, storySupport_1.createPopulatedState)();
var noOwnedPathsState = (0, storySupport_1.createPopulatedState)({
    paths: [storySupport_1.storybookPaths.shared],
});
var meta = {
    title: 'Views/EntryCreateView',
    component: new_vue_1.default,
};
exports.default = meta;
exports.Default = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/entry/daily-river/new?date=2025-03-15',
    }),
};
/**
 * Form opened via /entry/studio-notes/new (explicit path param) — pre-selects
 * studio-notes, visually distinct from Default which uses daily-river.
 */
exports.FilledIn = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/entry/studio-notes/new?date=2025-03-15',
        seedCacheFromState: true,
    }),
};
/**
 * No owned paths — shows an inline message with a "Create a path" button and
 * a "Go back" button instead of redirecting.
 * Only a subscribed (not owned) path is present.
 */
exports.NoOwnedPaths = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: noOwnedPathsState,
        route: '/entry/new?date=2025-03-15',
    }),
};
/**
 * Paths API fails — a full-state error is shown with a Go back button.
 */
exports.PathsApiError = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/entry/daily-river/new?date=2025-03-15',
        requestOverrides: [
            (0, storySupport_1.createStoryApiError)('*/v1/paths', 503, 'GET', {
                detail: 'Storybook forced paths outage.',
            }),
        ],
    }),
};
/**
 * Draft init fails — the GET draft endpoint returns a server error. The form
 * still opens and shows a small inline error note while retrying in the
 * background.
 */
exports.DraftInitError = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/entry/daily-river/new?date=2025-03-15',
        requestOverrides: [
            (0, storySupport_1.createStoryApiError)("*/v1/paths/*/entries/drafts", 503, 'GET', {
                detail: 'Storybook forced draft outage.',
            }),
        ],
    }),
};
/**
 * The user has typed content and clicks Save — the commit endpoint returns a
 * server error so the save-error message is shown below the editor.
 * A pre-seeded draft is supplied so the Save button is enabled.
 */
exports.SaveError = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: "/entry/daily-river/new?date=".concat((0, storySupport_1.storyDateOffset)(0)),
        seedCacheFromState: true,
        draftSeeds: [
            {
                key: "create:daily-river:".concat((0, storySupport_1.storyDateOffset)(0)),
                content: 'Started writing a new entry for today.',
            },
        ],
        requestOverrides: [
            (0, storySupport_1.createStoryApiError)("*/v1/entry-drafts/*/commit", 503, 'POST', {
                detail: 'Storybook forced save outage.',
            }),
        ],
    }),
};
/**
 * An existing open draft is resumed — the editor is pre-populated with
 * content that was saved in a previous session.
 */
exports.DraftResumed = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: "/entry/daily-river/new?date=".concat((0, storySupport_1.storyDateOffset)(0)),
        seedCacheFromState: true,
        draftSeeds: [
            {
                key: "create:daily-river:".concat((0, storySupport_1.storyDateOffset)(0)),
                content: [
                    'Started early — walked along the canal before it got hot.',
                    '',
                    'Want to come back to the part about the heron standing perfectly still.',
                ].join('\n'),
            },
        ],
    }),
};
/**
 * A draft with an image already attached — the image chip shows in the
 * footer tray and the draft content already contains the markdown reference.
 */
exports.WithImageUpload = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: "/entry/daily-river/new?date=".concat((0, storySupport_1.storyDateOffset)(0)),
        seedCacheFromState: true,
        draftSeeds: [
            {
                key: "create:daily-river:".concat((0, storySupport_1.storyDateOffset)(0)),
                content: 'Morning walk with a camera.\n\n![Sunrise over the river](sunrise-river.jpg)',
                images: [
                    {
                        id: 'dimg-seeded-1',
                        draft_id: 'draft-seed-1',
                        source: 'upload',
                        live_image_id: 'dimg-seeded-1',
                        filename: 'sunrise-river.jpg',
                        status: 'ready',
                        content_type: 'image/jpeg',
                        strip_metadata: true,
                        byte_size: 310442,
                        client_image_id: null,
                    },
                ],
            },
        ],
    }),
};
/**
 * Offline mode — MSW intercepts all API calls with a network error and
 * navigator.onLine is set to false. The editor is still usable and shows an
 * offline note at the bottom.
 */
exports.Offline = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/entry/daily-river/new?date=2025-03-15',
        networkMode: 'offline',
        seedCacheFromState: true,
        draftSeeds: [
            {
                key: 'create:daily-river:2025-03-15',
                content: 'Writing this offline. Will sync when I reconnect.',
            },
        ],
        requestOverrides: [(0, storySupport_1.createStoryNetworkError)('*/v1/*')],
    }),
};
