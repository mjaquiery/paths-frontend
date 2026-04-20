"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionError = exports.ApiError = exports.Offline = exports.Crowded = exports.Empty = exports.Default = void 0;
var invitations_vue_1 = require("./invitations.vue");
var storySupport_1 = require("~/src/storybook/storySupport");
var populatedState = (0, storySupport_1.createPopulatedState)();
var emptyState = (0, storySupport_1.createPopulatedState)({
    invitations: [],
    blocklist: [],
});
var crowdedState = (0, storySupport_1.createPopulatedState)({
    invitations: __spreadArray(__spreadArray([], Array.from({ length: 7 }, function (_, index) { return ({
        id: "active-".concat(index + 1),
        path_id: "inv-path-".concat(index + 1),
        path_code: "deep-archive-".concat(index + 1),
        path_title: "Shared Path ".concat(index + 1, " with an intentionally long descriptive title"),
        inviter_user_id: "inviter-".concat(index + 1),
        inviter_email: "person.with.a.very.long.email.address.".concat(index + 1, "@example-storybook.test"),
        invited_email: 'alex@example.com',
        invited_user_id: null,
        status: 'invited',
        created_at: (0, storySupport_1.storyTimestampOffset)(-(index + 1)),
        updated_at: (0, storySupport_1.storyTimestampOffset)(-(index + 1)),
    }); }), true), Array.from({ length: 4 }, function (_, index) { return ({
        id: "ignored-".concat(index + 1),
        path_id: "ignored-path-".concat(index + 1),
        path_code: "ignored-archive-".concat(index + 1),
        path_title: "Ignored share request ".concat(index + 1),
        inviter_user_id: "ignored-inviter-".concat(index + 1),
        inviter_email: "ignored.sender.".concat(index + 1, "@example-storybook.test"),
        invited_email: 'alex@example.com',
        invited_user_id: null,
        status: 'ignored',
        created_at: (0, storySupport_1.storyTimestampOffset)(-(index + 10)),
        updated_at: (0, storySupport_1.storyTimestampOffset)(-(index + 2)),
    }); }), true),
    blocklist: Array.from({ length: 5 }, function (_, index) { return ({
        id: "blocked-".concat(index + 1),
        blocked_user_id: "blocked-user-with-a-long-id-".concat(index + 1),
        created_at: (0, storySupport_1.storyTimestampOffset)(-(index + 20)),
    }); }),
});
var meta = {
    title: 'Views/InvitationsView',
    component: invitations_vue_1.default,
};
exports.default = meta;
exports.Default = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/invitations',
    }),
};
exports.Empty = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: emptyState,
        route: '/invitations',
    }),
};
exports.Crowded = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: crowdedState,
        route: '/invitations',
    }),
};
exports.Offline = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: crowdedState,
        route: '/invitations',
        networkMode: 'offline',
        seedCacheFromState: true,
        requestOverrides: [(0, storySupport_1.createStoryNetworkError)('*/v1/*')],
    }),
};
exports.ApiError = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/invitations',
        requestOverrides: [
            (0, storySupport_1.createStoryApiError)('*/v1/invitations', 503, 'GET', {
                detail: 'Storybook forced invitations outage.',
            }),
            (0, storySupport_1.createStoryApiError)('*/v1/invitations/blocklist', 503, 'GET', {
                detail: 'Storybook forced blocklist outage.',
            }),
        ],
    }),
};
/**
 * An action mutation (accept / ignore / block / unblock) fails with a server
 * error — the per-card error message should appear next to the affected card.
 */
exports.ActionError = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/invitations',
        requestOverrides: [
            (0, storySupport_1.createStoryApiError)('*/v1/invitations/*/accept', 503, 'POST', {
                detail: 'Storybook forced accept outage.',
            }),
            (0, storySupport_1.createStoryApiError)('*/v1/invitations/*/ignore', 503, 'POST', {
                detail: 'Storybook forced ignore outage.',
            }),
            (0, storySupport_1.createStoryApiError)('*/v1/invitations/blocklist', 503, 'POST', {
                detail: 'Storybook forced block outage.',
            }),
            (0, storySupport_1.createStoryApiError)('*/v1/invitations/blocklist/*', 503, 'DELETE', {
                detail: 'Storybook forced unblock outage.',
            }),
        ],
    }),
};
