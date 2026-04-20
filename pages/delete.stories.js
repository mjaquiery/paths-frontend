"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggedOut = exports.DeletionError = exports.DeletionPending = exports.Default = void 0;
var delete_vue_1 = require("./delete.vue");
var storySupport_1 = require("~/src/storybook/storySupport");
var meta = {
    title: 'Views/DeleteView',
    component: delete_vue_1.default,
};
exports.default = meta;
exports.Default = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: (0, storySupport_1.createPopulatedState)(),
        route: '/delete',
    }),
};
/**
 * A deletion request already exists and is in the 'requested' state — the view
 * should show the existing-request status card instead of the confirmation form.
 */
exports.DeletionPending = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: (0, storySupport_1.createPopulatedState)({
            deletionRequest: { state: 'requested' },
        }),
        route: '/delete',
    }),
};
/**
 * A previous deletion request failed — the view should show the error message
 * and allow the user to try again (confirmation form still visible).
 */
exports.DeletionError = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: (0, storySupport_1.createPopulatedState)({
            deletionRequest: {
                state: 'failed',
                error_message: 'Account deletion failed: downstream service timed out.',
            },
        }),
        route: '/delete',
    }),
};
/**
 * The user is not logged in — the confirmation target will be empty and the
 * button will be disabled.
 */
exports.LoggedOut = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: (0, storySupport_1.createPopulatedState)(),
        route: '/delete',
        sessionUser: null,
        requestOverrides: [
            (0, storySupport_1.createStoryApiError)('*/v1/account/deletion-requests/latest', 404, 'GET', {
                detail: 'No deletion request found.',
            }),
        ],
    }),
};
