"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Saving = exports.WithRedirect = exports.SaveError = exports.Default = void 0;
var new_vue_1 = require("./new.vue");
var storySupport_1 = require("~/src/storybook/storySupport");
var populatedState = (0, storySupport_1.createPopulatedState)();
var meta = {
    title: 'Views/PathCreateView',
    component: new_vue_1.default,
};
exports.default = meta;
/** Empty form, ready to fill in. */
exports.Default = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/paths/new',
    }),
};
/** POST /v1/paths returns a server error — the form shows an inline error message. */
exports.SaveError = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/paths/new',
        requestOverrides: [
            (0, storySupport_1.createStoryApiError)('*/v1/paths', 503, 'POST', {
                detail: 'Storybook forced create-path outage.',
            }),
        ],
    }),
};
/**
 * Navigated to with a ?redirect= param (e.g. from EntryCreateView when there
 * are no owned paths).  After successful creation the user will be sent to the
 * redirect URL instead of home.
 */
exports.WithRedirect = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/paths/new?redirect=/entry/new?date=2025-03-15',
    }),
};
/**
 * Simulate the saving state: the form has been filled in and submitted but the
 * POST is not yet resolved.  The Create button shows "Creating…" and is
 * disabled.  Trigger by filling in the title field and tapping Create.
 */
exports.Saving = {
    parameters: (0, storySupport_1.createStoryParameters)({
        state: populatedState,
        route: '/paths/new',
        requestOverrides: [
            // Return a very slow response to keep the view in the saving state.
            // In practice, interact: fill the title and tap Create to observe.
            (0, storySupport_1.createStoryApiError)('*/v1/paths', 202, 'POST', {
                detail: 'Storybook slow response placeholder.',
            }),
        ],
    }),
};
