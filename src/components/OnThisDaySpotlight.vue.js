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
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("@ionic/vue");
var vue_2 = require("vue");
var props = defineProps();
var today = new Date();
var todayMonthDay = "".concat(String(today.getMonth() + 1).padStart(2, '0'), "-").concat(String(today.getDate()).padStart(2, '0'));
var todayYear = today.getFullYear();
var formattedToday = today.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
});
/**
 * Returns the month-day string (MM-DD) for a date offset by the given number
 * of days from today. Uses the Date constructor's overflow semantics to
 * handle month/year rollovers correctly without mutating `today`.
 */
function offsetMonthDay(offsetDays) {
    var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offsetDays);
    return "".concat(String(d.getMonth() + 1).padStart(2, '0'), "-").concat(String(d.getDate()).padStart(2, '0'));
}
/**
 * Priority tiers for the spotlight algorithm (lower = higher priority):
 *  1 – first path  + exact day,   previous years
 *  2 – other paths + exact day,   previous years
 *  3 – first path  + adjacent days, not this year
 *  4 – other paths + adjacent days, not this year
 *  5 – first path  + adjacent days, this year (not today)
 *  6 – other paths + adjacent days, this year (not today)
 */
var ADJACENT_OFFSETS = [-2, -1, 1, 2];
var spotlightYears = (0, vue_2.computed)(function () {
    var _a;
    var firstPathId = (_a = props.visiblePaths[0]) === null || _a === void 0 ? void 0 : _a.path_id;
    var exactMonthDay = todayMonthDay;
    var adjacentMonthDays = new Set(ADJACENT_OFFSETS.map(function (o) { return offsetMonthDay(o); }));
    var results = [];
    for (var _i = 0, _b = props.pathEntries; _i < _b.length; _i++) {
        var _c = _b[_i], pathId = _c.pathId, entries = _c.entries;
        var isFirstPath = pathId === firstPathId;
        for (var _d = 0, entries_1 = entries; _d < entries_1.length; _d++) {
            var entry = entries_1[_d];
            var entryYear = Number(entry.day.slice(0, 4));
            var entryMonthDay = entry.day.slice(5);
            var isThisYear = entryYear === todayYear;
            // Never include today itself
            if (entry.day === today.toISOString().slice(0, 10))
                continue;
            if (entryMonthDay === exactMonthDay && entryYear < todayYear) {
                // Priority 1 or 2: exact day, previous years
                results.push({
                    year: entryYear,
                    entryId: entry.id,
                    pathId: pathId,
                    content: entry.content,
                    priority: isFirstPath ? 1 : 2,
                });
            }
            else if (adjacentMonthDays.has(entryMonthDay) && !isThisYear) {
                // Priority 3 or 4: adjacent day, not this year
                results.push({
                    year: entryYear,
                    entryId: entry.id,
                    pathId: pathId,
                    content: entry.content,
                    priority: isFirstPath ? 3 : 4,
                });
            }
            else if (adjacentMonthDays.has(entryMonthDay) && isThisYear) {
                // Priority 5 or 6: adjacent day, this year
                results.push({
                    year: entryYear,
                    entryId: entry.id,
                    pathId: pathId,
                    content: entry.content,
                    priority: isFirstPath ? 5 : 6,
                });
            }
        }
    }
    // Sort by priority asc, then by year desc (most recent first within tier)
    return results.sort(function (a, b) {
        return a.priority !== b.priority ? a.priority - b.priority : b.year - a.year;
    });
});
var primaryEntry = (0, vue_2.computed)(function () {
    var _a;
    // The first entry in spotlightYears is already the highest-priority one.
    return (_a = spotlightYears.value[0]) !== null && _a !== void 0 ? _a : null;
});
var primaryPath = (0, vue_2.computed)(function () {
    return props.visiblePaths.find(function (p) { var _a; return p.path_id === ((_a = primaryEntry.value) === null || _a === void 0 ? void 0 : _a.pathId); });
});
var visiblePathById = (0, vue_2.computed)(function () { return new Map(props.visiblePaths.map(function (p) { return [p.path_id, p]; })); });
var otherIndicators = (0, vue_2.computed)(function () {
    var pathMap = visiblePathById.value;
    return spotlightYears.value
        .filter(function (e) {
        var _a, _b;
        return e.entryId !== ((_a = primaryEntry.value) === null || _a === void 0 ? void 0 : _a.entryId) ||
            e.pathId !== ((_b = primaryEntry.value) === null || _b === void 0 ? void 0 : _b.pathId);
    })
        .slice(0, 12)
        .map(function (e) {
        var _a, _b;
        var path = pathMap.get(e.pathId);
        return {
            key: "".concat(e.pathId, "-").concat(e.year),
            year: e.year,
            color: (_a = path === null || path === void 0 ? void 0 : path.color) !== null && _a !== void 0 ? _a : '#aaa',
            pathTitle: (_b = path === null || path === void 0 ? void 0 : path.title) !== null && _b !== void 0 ? _b : '',
        };
    });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.spotlightYears.length > 0) {
    var __VLS_0 = {}.IonCard;
    /** @type {[typeof __VLS_components.IonCard, typeof __VLS_components.ionCard, typeof __VLS_components.IonCard, typeof __VLS_components.ionCard, ]} */ ;
    // @ts-ignore
    var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0(__assign({ class: "on-this-day-card" })));
    var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ class: "on-this-day-card" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
    var __VLS_4 = {};
    __VLS_3.slots.default;
    var __VLS_5 = {}.IonCardHeader;
    /** @type {[typeof __VLS_components.IonCardHeader, typeof __VLS_components.ionCardHeader, typeof __VLS_components.IonCardHeader, typeof __VLS_components.ionCardHeader, ]} */ ;
    // @ts-ignore
    var __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({}));
    var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_6), false));
    __VLS_8.slots.default;
    var __VLS_9 = {}.IonCardSubtitle;
    /** @type {[typeof __VLS_components.IonCardSubtitle, typeof __VLS_components.ionCardSubtitle, typeof __VLS_components.IonCardSubtitle, typeof __VLS_components.ionCardSubtitle, ]} */ ;
    // @ts-ignore
    var __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({}));
    var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_10), false));
    __VLS_12.slots.default;
    var __VLS_12;
    var __VLS_13 = {}.IonCardTitle;
    /** @type {[typeof __VLS_components.IonCardTitle, typeof __VLS_components.ionCardTitle, typeof __VLS_components.IonCardTitle, typeof __VLS_components.ionCardTitle, ]} */ ;
    // @ts-ignore
    var __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({}));
    var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_14), false));
    __VLS_16.slots.default;
    (__VLS_ctx.formattedToday);
    var __VLS_16;
    var __VLS_8;
    var __VLS_17 = {}.IonCardContent;
    /** @type {[typeof __VLS_components.IonCardContent, typeof __VLS_components.ionCardContent, typeof __VLS_components.IonCardContent, typeof __VLS_components.ionCardContent, ]} */ ;
    // @ts-ignore
    var __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({}));
    var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_18), false));
    __VLS_20.slots.default;
    if (__VLS_ctx.primaryEntry) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "spotlight-primary" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "spotlight-path-dot" }, { style: ({ backgroundColor: (_a = __VLS_ctx.primaryPath) === null || _a === void 0 ? void 0 : _a.color }) }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "spotlight-text" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "spotlight-year" }));
        (__VLS_ctx.primaryEntry.year);
        if (__VLS_ctx.primaryEntry.content) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "spotlight-preview" }));
            (__VLS_ctx.primaryEntry.content);
        }
        else if (__VLS_ctx.primaryEntry.content === undefined) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "spotlight-preview spotlight-preview--empty" }));
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "spotlight-preview spotlight-preview--empty" }));
        }
    }
    if (__VLS_ctx.otherIndicators.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "spotlight-indicators" }));
        for (var _i = 0, _b = __VLS_getVForSourceType((__VLS_ctx.otherIndicators)); _i < _b.length; _i++) {
            var ind = _b[_i][0];
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign(__assign(__assign({ key: (ind.key) }, { class: "spotlight-indicator" }), { style: ({ backgroundColor: ind.color }) }), { title: ("".concat(ind.year, " \u2014 ").concat(ind.pathTitle)) }));
        }
    }
    var __VLS_20;
    var __VLS_3;
}
/** @type {__VLS_StyleScopedClasses['on-this-day-card']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-path-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-text']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-year']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-preview--empty']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-preview--empty']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-indicators']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-indicator']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            IonCard: vue_1.IonCard,
            IonCardContent: vue_1.IonCardContent,
            IonCardHeader: vue_1.IonCardHeader,
            IonCardSubtitle: vue_1.IonCardSubtitle,
            IonCardTitle: vue_1.IonCardTitle,
            formattedToday: formattedToday,
            spotlightYears: spotlightYears,
            primaryEntry: primaryEntry,
            primaryPath: primaryPath,
            otherIndicators: otherIndicators,
        };
    },
    __typeProps: {},
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
