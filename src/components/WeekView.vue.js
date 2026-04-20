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
Object.defineProperty(exports, "__esModule", { value: true });
var vue_1 = require("@ionic/vue");
var vue_2 = require("vue");
var vue_router_1 = require("vue-router");
var props = defineProps();
var router = (0, vue_router_1.useRouter)();
var weekOffset = (0, vue_2.ref)(0);
function isoDate(offsetDays) {
    var d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
}
function dayLabel(dateStr, isToday) {
    if (isToday)
        return 'Today';
    var d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
}
var weekDays = (0, vue_2.computed)(function () {
    var _a, _b;
    var todayStr = isoDate(0);
    var days = [];
    var baseOffset = weekOffset.value * 7;
    var _loop_2 = function (i) {
        var offsetFromToday = baseOffset - 5 + i;
        var dateStr = isoDate(offsetFromToday);
        var isToday = dateStr === todayStr;
        var pathEntries = [];
        var _loop_3 = function (pathId, entries) {
            var path = props.visiblePaths.find(function (p) { return p.path_id === pathId; });
            if (!path)
                return "continue";
            for (var _e = 0, _f = entries.filter(function (e) { return e.day === dateStr; }); _e < _f.length; _e++) {
                var entry = _f[_e];
                pathEntries.push({
                    entryId: entry.id,
                    pathId: pathId,
                    pathTitle: path.title,
                    color: path.color,
                    preview: entry.content,
                    hasImages: ((_b = (_a = entry.image_filenames) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0,
                    images: entry.images,
                    edit_id: entry.edit_id,
                    canEdit: !!props.currentUserId && path.owner_user_id === props.currentUserId,
                });
            }
        };
        for (var _i = 0, _c = props.pathEntries; _i < _c.length; _i++) {
            var _d = _c[_i], pathId = _d.pathId, entries = _d.entries;
            _loop_3(pathId, entries);
        }
        days.push({
            dateStr: dateStr,
            label: dayLabel(dateStr, isToday),
            isToday: isToday,
            pathEntries: pathEntries,
        });
    };
    // Display 7 days in chronological order (oldest → newest).
    // At weekOffset=0: positions 1–5 are 5 days ago → yesterday,
    // position 6 is today, position 7 is tomorrow.
    for (var i = 0; i <= 6; i++) {
        _loop_2(i);
    }
    return days;
});
var weekRangeLabel = (0, vue_2.computed)(function () {
    var oldest = weekDays.value[0];
    var newest = weekDays.value[weekDays.value.length - 1];
    if (!newest || !oldest)
        return '';
    var fmt = function (ds) {
        return new Date(ds + 'T00:00:00').toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
        });
    };
    var year = new Date(newest.dateStr + 'T00:00:00').getFullYear();
    return "Week of ".concat(fmt(oldest.dateStr), " \u2013 ").concat(fmt(newest.dateStr), ", ").concat(year);
});
var firstOwnedPath = (0, vue_2.computed)(function () {
    var _a;
    return (_a = props.visiblePaths.find(function (p) { return p.owner_user_id === props.currentUserId; })) !== null && _a !== void 0 ? _a : null;
});
function openDetail(pe) {
    void router.push("/entry/".concat(pe.pathId, "/").concat(pe.entryId));
}
function openCreate(dateStr) {
    if (!firstOwnedPath.value)
        return;
    void router.push("/entry/".concat(firstOwnedPath.value.path_id, "/new?date=").concat(dateStr));
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['day-box--today']} */ ;
/** @type {__VLS_StyleScopedClasses['day-header']} */ ;
/** @type {__VLS_StyleScopedClasses['day-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['day-entry']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "week-view" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "week-nav-header" }));
var __VLS_0 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0(__assign({ 'onClick': {} }, { fill: "clear", size: "small", 'aria-label': "Previous week" })));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { fill: "clear", size: "small", 'aria-label': "Previous week" })], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_4;
var __VLS_5;
var __VLS_6;
var __VLS_7 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.weekOffset--;
    }
};
__VLS_3.slots.default;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "week-range-label" }));
(__VLS_ctx.weekRangeLabel);
var __VLS_8 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8(__assign({ 'onClick': {} }, { fill: "clear", size: "small", disabled: (__VLS_ctx.weekOffset >= 0), 'aria-label': "Next week" })));
var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { fill: "clear", size: "small", disabled: (__VLS_ctx.weekOffset >= 0), 'aria-label': "Next week" })], __VLS_functionalComponentArgsRest(__VLS_9), false));
var __VLS_12;
var __VLS_13;
var __VLS_14;
var __VLS_15 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.weekOffset++;
    }
};
__VLS_11.slots.default;
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "week-days" }));
var _loop_1 = function (dayInfo) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign(__assign({ key: (dayInfo.dateStr) }, { class: "day-box" }), { class: ({ 'day-box--today': dayInfo.isToday }) }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "day-header" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "day-label" }));
    (dayInfo.label);
    if (__VLS_ctx.canCreate && __VLS_ctx.firstOwnedPath) {
        var __VLS_16 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16(__assign(__assign(__assign({ 'onClick': {} }, { size: "small", fill: "clear" }), { class: "day-create-btn" }), { 'aria-label': ("Create entry for ".concat(dayInfo.dateStr)) })));
        var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onClick': {} }, { size: "small", fill: "clear" }), { class: "day-create-btn" }), { 'aria-label': ("Create entry for ".concat(dayInfo.dateStr)) })], __VLS_functionalComponentArgsRest(__VLS_17), false));
        var __VLS_20 = void 0;
        var __VLS_21 = void 0;
        var __VLS_22 = void 0;
        var __VLS_23 = {
            onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.canCreate && __VLS_ctx.firstOwnedPath))
                    return;
                __VLS_ctx.openCreate(dayInfo.dateStr);
            }
        };
        __VLS_19.slots.default;
    }
    if (dayInfo.pathEntries.length > 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "day-entries" }, { class: ("day-entries--count-".concat(dayInfo.pathEntries.length)) }));
        var _loop_4 = function (pe) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign(__assign(__assign(__assign(__assign(__assign({ onClick: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(dayInfo.pathEntries.length > 0))
                        return;
                    __VLS_ctx.openDetail(pe);
                } }, { onKeydown: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(dayInfo.pathEntries.length > 0))
                        return;
                    __VLS_ctx.openDetail(pe);
                } }), { onKeydown: function () {
                    var _a = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        _a[_i] = arguments[_i];
                    }
                    var $event = _a[0];
                    if (!(dayInfo.pathEntries.length > 0))
                        return;
                    __VLS_ctx.openDetail(pe);
                } }), { key: (pe.pathId + '-' + pe.entryId) }), { class: "day-entry" }), { style: ({ borderLeftColor: pe.color }) }), { role: "button", tabindex: "0", 'aria-label': ("View entry from ".concat(pe.pathTitle)) }));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign(__assign({ class: "day-entry-path-dot" }, { style: ({ backgroundColor: pe.color }) }), { title: (pe.pathTitle) }));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "day-entry-preview" }));
            (pe.preview === undefined
                ? 'Fetching...'
                : pe.preview || '(no text)');
            if (pe.hasImages) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "day-entry-image-indicator" }, { title: "Has images", 'aria-label': "Has images" }));
            }
        };
        for (var _b = 0, _c = __VLS_getVForSourceType((dayInfo.pathEntries)); _b < _c.length; _b++) {
            var pe = _c[_b][0];
            _loop_4(pe);
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "day-empty" }));
    }
};
var __VLS_19;
for (var _i = 0, _a = __VLS_getVForSourceType((__VLS_ctx.weekDays)); _i < _a.length; _i++) {
    var dayInfo = _a[_i][0];
    _loop_1(dayInfo);
}
/** @type {__VLS_StyleScopedClasses['week-view']} */ ;
/** @type {__VLS_StyleScopedClasses['week-nav-header']} */ ;
/** @type {__VLS_StyleScopedClasses['week-range-label']} */ ;
/** @type {__VLS_StyleScopedClasses['week-days']} */ ;
/** @type {__VLS_StyleScopedClasses['day-box']} */ ;
/** @type {__VLS_StyleScopedClasses['day-header']} */ ;
/** @type {__VLS_StyleScopedClasses['day-label']} */ ;
/** @type {__VLS_StyleScopedClasses['day-create-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['day-entries']} */ ;
/** @type {__VLS_StyleScopedClasses['day-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['day-entry-path-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['day-entry-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['day-entry-image-indicator']} */ ;
/** @type {__VLS_StyleScopedClasses['day-empty']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            IonButton: vue_1.IonButton,
            weekOffset: weekOffset,
            weekDays: weekDays,
            weekRangeLabel: weekRangeLabel,
            firstOwnedPath: firstOwnedPath,
            openDetail: openDetail,
            openCreate: openCreate,
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
