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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
var _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Offline = exports.SaveError = exports.ConflictResolution = exports.DraftInitError = exports.DraftResumed = exports.WithManyImages = exports.WithImageUpload = exports.Loading = exports.Default = void 0;
var edit_vue_1 = require("./edit.vue");
var storySupport_1 = require("~/src/storybook/storySupport");
var populatedState = (0, storySupport_1.createPopulatedState)();
var manyImagesState = (0, storySupport_1.createPopulatedState)({
    entriesByPath: __assign(__assign({}, (0, storySupport_1.createPopulatedState)().entriesByPath), (_a = {}, _a[storySupport_1.storybookPaths.daily.path_id] = __spreadArray([
        (0, storySupport_1.createStoryEntry)({
            id: 'entry-daily-today',
            path_id: storySupport_1.storybookPaths.daily.path_id,
            day: '2025-03-15',
            edit_id: 41,
            content: [
                'Swam before sunrise and wrote until the kettle hissed.',
                '',
                '![Mooring rope at dawn](sunrise-river.jpg)',
                '',
                'The rest of the photos are waiting below for captions.',
            ].join('\n'),
            images: [
                'sunrise-river.jpg',
                'lantern-window.jpg',
                'kitchen-notes.jpg',
                'market-pears.jpg',
                'bridge-fog.jpg',
                'river-map.jpg',
                'tea-cup.jpg',
                'wet-boots.jpg',
                'boat-shed.jpg',
            ].map(function (filename, index) { return ({
                id: "img-many-".concat(index + 1),
                entry_id: 'entry-daily-today',
                filename: filename,
                status: 'ready',
                strip_metadata: true,
                content_type: 'image/jpeg',
                byte_size: 200000 + index,
            }); }),
        })
    ], ((_b = (0, storySupport_1.createPopulatedState)().entriesByPath[storySupport_1.storybookPaths.daily.path_id]) !== null && _b !== void 0 ? _b : []).filter(function (record) { return record.summary.id !== 'entry-daily-today'; }), true), _a)),
});
var meta = {
    title: 'Views/EntryEditView',
    component: edit_vue_1.default,
};
exports.default = meta;
exports.Default = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/entry/daily-river/entry-daily-today/edit',
        seedCacheFromState: true,
    }),
};
exports.Loading = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/entry/daily-river/missing-entry/edit',
    }),
};
/**
 * Editing an entry that already has an image — the edit draft is seeded with
 * the existing image so the chip shows in the footer tray. A new image can be
 * added on top.
 */
exports.WithImageUpload = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/entry/daily-river/entry-daily-today/edit',
        seedCacheFromState: true,
        draftSeeds: [
            {
                key: 'edit:daily-river:entry-daily-today',
                content: [
                    'Swam before sunrise and the river was glassy quiet.',
                    '',
                    '![Sunrise over the river](sunrise-river.jpg)',
                    '',
                    'Picked up oranges on the walk back and cooked lentil soup for dinner.',
                ].join('\n'),
                images: [
                    {
                        id: 'img-sunrise-river',
                        draft_id: 'draft-seed-1',
                        source: 'live',
                        live_image_id: 'img-sunrise-river',
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
exports.WithManyImages = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: manyImagesState,
        route: '/entry/daily-river/entry-daily-today/edit',
        seedCacheFromState: true,
    }),
};
/**
 * An existing open draft is resumed — the editor is pre-populated with
 * content that was in progress from a previous session, different from the
 * stored entry content.
 */
exports.DraftResumed = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/entry/daily-river/entry-daily-today/edit',
        seedCacheFromState: true,
        draftSeeds: [
            {
                key: 'edit:daily-river:entry-daily-today',
                content: [
                    'Swam before sunrise and the river was glassy quiet.',
                    '',
                    '![Sunrise over the river](sunrise-river.jpg)',
                    '',
                    'Still working on the lentil soup paragraph — came back to finish it.',
                    '',
                    'The colour of the water changed around 6am, shifted from grey to a deep blue.',
                ].join('\n'),
                images: [
                    {
                        id: 'img-sunrise-river',
                        draft_id: 'draft-seed-1',
                        source: 'live',
                        live_image_id: 'img-sunrise-river',
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
 * Draft init fails with a server error — the editor opens immediately with
 * the existing cached entry content and shows an inline retry note. Once
 * connectivity returns and the retry succeeds, autosave resumes normally.
 */
exports.DraftInitError = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/entry/daily-river/entry-daily-today/edit',
        seedCacheFromState: true,
        requestOverrides: [
            (0, storySupport_1.createStoryApiError)('*/v1/paths/*/entries/*/draft', 503, 'GET', {
                detail: 'Storybook forced draft outage.',
            }),
        ],
    }),
};
/**
 * The conflict resolution modal opens immediately on load — the view detects
 * that the local draft content differs from the current remote version and
 * shows both side-by-side so the user can choose which to keep.
 * A pre-seeded draft is used so the modal opens without requiring user
 * interaction.
 */
exports.ConflictResolution = {
    args: {
        _openConflictOnMount: true,
    },
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/entry/daily-river/entry-daily-today/edit',
        seedCacheFromState: true,
        draftSeeds: [
            {
                key: 'edit:daily-river:entry-daily-today',
                content: 'My local edit that conflicts with the remote version from another device.',
            },
        ],
    }),
};
/**
 * Commit returns a 503 — a save error message is shown below the editor.
 * A pre-seeded draft is used so the Save button is enabled.
 */
exports.SaveError = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/entry/daily-river/entry-daily-today/edit',
        seedCacheFromState: true,
        draftSeeds: [
            {
                key: 'edit:daily-river:entry-daily-today',
                content: 'Swam before sunrise and the river was glassy quiet. Added a new paragraph.',
            },
        ],
        requestOverrides: [
            (0, storySupport_1.createStoryApiError)('*/v1/entry-drafts/*/commit', 503, 'POST', {
                detail: 'Storybook forced save outage.',
            }),
        ],
    }),
};
/**
 * Offline mode — the editor opens with cached content and shows an offline
 * note. Draft init retries in the background when connectivity returns.
 */
exports.Offline = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/entry/daily-river/entry-daily-today/edit',
        networkMode: 'offline',
        seedCacheFromState: true,
        requestOverrides: [(0, storySupport_1.createStoryNetworkError)('*/v1/*')],
    }),
};
