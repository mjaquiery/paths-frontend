"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatRelativeTime = formatRelativeTime;
exports.resetRefreshStatusState = resetRefreshStatusState;
exports.useRefreshStatus = useRefreshStatus;
var vue_1 = require("vue");
var vue_query_1 = require("@tanstack/vue-query");
var useApi_1 = require("./useApi");
/** Format a Date as a human-readable relative time string. */
function formatRelativeTime(date) {
    var seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 10)
        return 'just now';
    if (seconds < 60)
        return "".concat(seconds, "s ago");
    var minutes = Math.floor(seconds / 60);
    if (minutes < 60)
        return "".concat(minutes, "m ago");
    var hours = Math.floor(minutes / 60);
    return "".concat(hours, "h ago");
}
// ─── Module-level error state ─────────────────────────────────────────────────
// Kept module-level so multiple useRefreshStatus instances (one per view) share
// the same error flag without prop-drilling.
var _hasError = (0, vue_1.ref)(false);
/**
 * Reset all module-level singleton state.  Call between tests (or in
 * Storybook `prepareStoryEnvironment`) so each scenario starts clean.
 */
function resetRefreshStatusState() {
    _hasError.value = false;
}
/**
 * Composable that tracks the refresh status of the path-entry queries.
 *
 * - `lastCheckedAt`: when the most recent successful entry-list fetch completed
 *   (derived from `useApi().lastRead`).
 * - `isOnline`: whether the browser reports network connectivity (delegated to
 *   the `useApi` singleton — a single source of truth with no duplicate
 *   window listeners).
 * - `hasError`: whether the most recent entry-list fetch failed.
 * - `isFetching`: whether any TanStack Query queries are currently in-flight.
 * - `statusType`: summary classification used for colour-coding the indicator.
 * - `statusText`: short human-readable label for the indicator.
 */
function useRefreshStatus() {
    // Delegate online/offline tracking to the useApi singleton — it already wires
    // window listeners at module load, so we avoid a second independent set.
    var _a = (0, useApi_1.useApi)(), isOnline = _a.isOnline, trackRead = _a.trackRead, lastRead = _a.lastRead;
    var hasError = (0, vue_1.computed)(function () { return _hasError.value; });
    var fetchingCount = (0, vue_query_1.useIsFetching)();
    var isFetching = (0, vue_1.computed)(function () { return fetchingCount.value > 0; });
    var queryClient = (0, vue_query_1.useQueryClient)();
    var unsubscribeCache = null;
    (0, vue_1.onMounted)(function () {
        // Seed lastRead from any already-successful entry-list queries that were
        // loaded (e.g. restored from persisted cache) before this composable mounted.
        var cache = queryClient.getQueryCache();
        var existing = cache.findAll({
            predicate: function (q) {
                var key = q.queryKey;
                return (Array.isArray(key) &&
                    key[0] === 'v1' &&
                    key[1] === 'paths' &&
                    key[3] === 'entries' &&
                    q.state.status === 'success' &&
                    q.state.dataUpdatedAt > 0);
            },
        });
        if (existing.length > 0) {
            // Only seed if useApi doesn't already have a more recent lastRead.
            var latestMs = Math.max.apply(Math, existing.map(function (q) { return q.state.dataUpdatedAt; }));
            if (!lastRead.value || lastRead.value.at < latestMs) {
                trackRead('entries');
            }
        }
        // Subscribe to subsequent cache events to keep status up-to-date.
        unsubscribeCache = cache.subscribe(function (event) {
            if (event.type !== 'updated')
                return;
            var key = event.query.queryKey;
            if (!Array.isArray(key) ||
                key[0] !== 'v1' ||
                key[1] !== 'paths' ||
                key[3] !== 'entries')
                return;
            if (event.action.type === 'success') {
                _hasError.value = false;
                trackRead('entries');
            }
            else if (event.action.type === 'error' ||
                event.query.state.status === 'error') {
                _hasError.value = true;
            }
        });
    });
    (0, vue_1.onUnmounted)(function () {
        unsubscribeCache === null || unsubscribeCache === void 0 ? void 0 : unsubscribeCache();
    });
    var statusType = (0, vue_1.computed)(function () {
        if (!isOnline.value)
            return 'offline';
        if (hasError.value)
            return 'error';
        if (isFetching.value)
            return 'fetching';
        return 'ok';
    });
    var statusText = (0, vue_1.computed)(function () {
        if (!isOnline.value)
            return 'Offline';
        if (hasError.value)
            return 'Unable to connect';
        if (isFetching.value)
            return 'Checking\u2026';
        if (!lastRead.value)
            return '';
        return "Updated ".concat(formatRelativeTime(new Date(lastRead.value.at)));
    });
    // lastCheckedAt kept for backward compat — RefreshStatus uses it for the
    // detail text in the expanded panel.
    var lastCheckedAt = (0, vue_1.computed)(function () {
        return lastRead.value ? new Date(lastRead.value.at) : null;
    });
    return {
        lastCheckedAt: lastCheckedAt,
        isOnline: isOnline,
        hasError: hasError,
        isFetching: isFetching,
        statusType: statusType,
        statusText: statusText,
    };
}
