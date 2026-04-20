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
exports.usePendingSaves = usePendingSaves;
exports.resetPendingSaves = resetPendingSaves;
var vue_1 = require("vue");
// ─── Module-level singleton state ──────────────────────────────────────────
// Using module-level refs so all component instances share the same state,
// enabling RefreshStatus (mounted in a footer) to read saves registered by
// editor views without prop-drilling.
var _pendingSaves = (0, vue_1.ref)([]);
var _savedNotification = (0, vue_1.ref)(null);
/** Keys of views currently autosaving content */
var _contentSavingKeys = (0, vue_1.ref)(new Set());
/** Map of draft-init errors keyed by a view key */
var _draftInitErrors = (0, vue_1.ref)(new Map());
/**
 * Composable that tracks background commit-retry attempts and shows a
 * "saved" notification when a retry eventually succeeds.
 *
 * The state is module-level (singleton) so the editor views and the
 * RefreshStatus footer widget share the same data without prop-drilling.
 */
function usePendingSaves() {
    var pendingSaves = (0, vue_1.computed)(function () { return _pendingSaves.value; });
    var pendingSavesCount = (0, vue_1.computed)(function () { return _pendingSaves.value.length; });
    var savedNotification = (0, vue_1.computed)(function () { return _savedNotification.value; });
    /** True when any view is currently autosaving */
    var isContentSaving = (0, vue_1.computed)(function () { return _contentSavingKeys.value.size > 0; });
    /** All current draft-init error messages (values of the map) */
    var draftInitErrors = (0, vue_1.computed)(function () {
        return Array.from(_draftInitErrors.value.values());
    });
    /**
     * Register a pending save retry. If an entry with this key already exists
     * it is replaced (label may have changed).
     */
    function registerPendingSave(key, label) {
        var idx = _pendingSaves.value.findIndex(function (e) { return e.key === key; });
        if (idx >= 0) {
            _pendingSaves.value = _pendingSaves.value.map(function (e, i) {
                return i === idx ? { key: key, label: label } : e;
            });
        }
        else {
            _pendingSaves.value = __spreadArray(__spreadArray([], _pendingSaves.value, true), [{ key: key, label: label }], false);
        }
    }
    /**
     * Remove a pending save by key (e.g. after a retry succeeds or the view
     * unmounts without a successful save).
     *
     * @param succeeded - when true a "Saved" notification is stored so the
     *   RefreshStatus widget can surface it until the user navigates away.
     */
    function removePendingSave(key, succeeded) {
        _pendingSaves.value = _pendingSaves.value.filter(function (e) { return e.key !== key; });
        if (succeeded) {
            _savedNotification.value = 'Entry saved successfully.';
        }
    }
    /** Clear the saved notification (called on navigation). */
    function clearSavedNotification() {
        _savedNotification.value = null;
    }
    /** Mark a view key as currently autosaving content. */
    function setContentSaving(key, saving) {
        var next = new Set(_contentSavingKeys.value);
        if (saving) {
            next.add(key);
        }
        else {
            next.delete(key);
        }
        _contentSavingKeys.value = next;
    }
    /** Register or update a draft-init error for a given view key. */
    function registerDraftInitError(key, message) {
        var next = new Map(_draftInitErrors.value);
        next.set(key, message);
        _draftInitErrors.value = next;
    }
    /** Clear the draft-init error for a given view key. */
    function clearDraftInitError(key) {
        if (!_draftInitErrors.value.has(key))
            return;
        var next = new Map(_draftInitErrors.value);
        next.delete(key);
        _draftInitErrors.value = next;
    }
    return {
        pendingSaves: pendingSaves,
        pendingSavesCount: pendingSavesCount,
        savedNotification: savedNotification,
        isContentSaving: isContentSaving,
        draftInitErrors: draftInitErrors,
        registerPendingSave: registerPendingSave,
        removePendingSave: removePendingSave,
        clearSavedNotification: clearSavedNotification,
        setContentSaving: setContentSaving,
        registerDraftInitError: registerDraftInitError,
        clearDraftInitError: clearDraftInitError,
    };
}
/**
 * Reset all singleton state back to empty.
 * Call this in Storybook's `prepareStoryEnvironment` so each story starts
 * with a clean slate.
 */
function resetPendingSaves() {
    _pendingSaves.value = [];
    _savedNotification.value = null;
    _contentSavingKeys.value = new Set();
    _draftInitErrors.value = new Map();
}
