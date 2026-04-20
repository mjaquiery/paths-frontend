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
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var vue_1 = require("vue");
/**
 * Unit tests for the canCreateEntries authorization logic used in HomeView.
 * The logic is: currentUser must be set AND the selected path's owner_user_id
 * must match the current user's user_id.
 */
function makeCanCreateEntries(currentUser, paths, selectedPathId) {
    var selectedPath = (0, vue_1.computed)(function () {
        return paths.value.find(function (p) { return p.path_id === selectedPathId.value; });
    });
    return (0, vue_1.computed)(function () {
        return !!currentUser.value &&
            !!selectedPath.value &&
            selectedPath.value.owner_user_id === currentUser.value.user_id;
    });
}
var basePath = {
    path_id: 'p1',
    uuid: 'uuid-p1',
    owner_user_id: 'u1',
    title: 'My Path',
    description: null,
    color: '#3880ff',
    is_public: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
};
var ownerUser = {
    token: 'tok',
    user_id: 'u1',
    display_name: 'Owner',
};
var otherUser = {
    token: 'tok2',
    user_id: 'u2',
    display_name: 'Other',
};
(0, vitest_1.describe)('canCreateEntries (HomeView authorization logic)', function () {
    (0, vitest_1.it)('is false when no user is logged in', function () {
        var currentUser = (0, vue_1.ref)(null);
        var paths = (0, vue_1.ref)([basePath]);
        var selectedPathId = (0, vue_1.ref)('p1');
        var canCreateEntries = makeCanCreateEntries(currentUser, paths, selectedPathId);
        (0, vitest_1.expect)(canCreateEntries.value).toBe(false);
    });
    (0, vitest_1.it)('is false when no path is selected', function () {
        var currentUser = (0, vue_1.ref)(ownerUser);
        var paths = (0, vue_1.ref)([basePath]);
        var selectedPathId = (0, vue_1.ref)('');
        var canCreateEntries = makeCanCreateEntries(currentUser, paths, selectedPathId);
        (0, vitest_1.expect)(canCreateEntries.value).toBe(false);
    });
    (0, vitest_1.it)('is false when the logged-in user does not own the selected path', function () {
        var currentUser = (0, vue_1.ref)(otherUser);
        var paths = (0, vue_1.ref)([basePath]);
        var selectedPathId = (0, vue_1.ref)('p1');
        var canCreateEntries = makeCanCreateEntries(currentUser, paths, selectedPathId);
        (0, vitest_1.expect)(canCreateEntries.value).toBe(false);
    });
    (0, vitest_1.it)('is true when the logged-in user owns the selected path', function () {
        var currentUser = (0, vue_1.ref)(ownerUser);
        var paths = (0, vue_1.ref)([basePath]);
        var selectedPathId = (0, vue_1.ref)('p1');
        var canCreateEntries = makeCanCreateEntries(currentUser, paths, selectedPathId);
        (0, vitest_1.expect)(canCreateEntries.value).toBe(true);
    });
    (0, vitest_1.it)('updates reactively when the selected path changes', function () {
        var ownedPath = __assign(__assign({}, basePath), { path_id: 'p1' });
        var otherPath = __assign(__assign({}, basePath), { path_id: 'p2', owner_user_id: 'u2' });
        var currentUser = (0, vue_1.ref)(ownerUser);
        var paths = (0, vue_1.ref)([ownedPath, otherPath]);
        var selectedPathId = (0, vue_1.ref)('p1');
        var canCreateEntries = makeCanCreateEntries(currentUser, paths, selectedPathId);
        (0, vitest_1.expect)(canCreateEntries.value).toBe(true);
        selectedPathId.value = 'p2';
        (0, vitest_1.expect)(canCreateEntries.value).toBe(false);
    });
    (0, vitest_1.it)('updates reactively when the user logs out', function () {
        var currentUser = (0, vue_1.ref)(ownerUser);
        var paths = (0, vue_1.ref)([basePath]);
        var selectedPathId = (0, vue_1.ref)('p1');
        var canCreateEntries = makeCanCreateEntries(currentUser, paths, selectedPathId);
        (0, vitest_1.expect)(canCreateEntries.value).toBe(true);
        currentUser.value = null;
        (0, vitest_1.expect)(canCreateEntries.value).toBe(false);
    });
});
