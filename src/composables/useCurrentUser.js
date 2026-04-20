"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCurrentUser = useCurrentUser;
var vue_1 = require("vue");
/**
 * Reactive wrapper around the `user` key in localStorage.
 *
 * Returns a reactive `currentUser` ref and a derived `currentUserId` string.
 * The ref is populated once at setup time; call `refresh()` to re-read
 * (e.g. after login / logout side-effects in another component).
 *
 * Note: full cross-tab reactivity would require a StorageEvent listener,
 * which can be added here if needed in future.
 */
function readStoredUser() {
    try {
        if (typeof localStorage === 'undefined' ||
            typeof localStorage.getItem !== 'function') {
            return null;
        }
        var raw = localStorage.getItem('user');
        if (!raw)
            return null;
        return JSON.parse(raw);
    }
    catch (_a) {
        return null;
    }
}
function useCurrentUser() {
    var currentUser = (0, vue_1.ref)(readStoredUser());
    var currentUserId = (0, vue_1.computed)(function () { var _a, _b; return (_b = (_a = currentUser.value) === null || _a === void 0 ? void 0 : _a.user_id) !== null && _b !== void 0 ? _b : ''; });
    function refresh() {
        currentUser.value = readStoredUser();
    }
    return { currentUser: currentUser, currentUserId: currentUserId, refresh: refresh };
}
