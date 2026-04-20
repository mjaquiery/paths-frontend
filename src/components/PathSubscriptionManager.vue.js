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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var vue_query_1 = require("@tanstack/vue-query");
var apiClient_1 = require("../generated/apiClient");
var errors_1 = require("../lib/errors");
var props = defineProps();
var queryClient = (0, vue_query_1.useQueryClient)();
var subsData = (0, apiClient_1.useListSubscriptions)(props.pathCode).data;
var subscribers = (0, vue_2.computed)(function () {
    var res = subsData.value;
    if (!res || res.status !== 200)
        return [];
    return res.data;
});
var doInvite = (0, apiClient_1.useInviteSubscriber)().mutateAsync;
var doKick = (0, apiClient_1.useDeleteSubscription)().mutateAsync;
var inviteEmail = (0, vue_2.ref)('');
var inviting = (0, vue_2.ref)(false);
var inviteError = (0, vue_2.ref)('');
var inviteSuccess = (0, vue_2.ref)('');
var kicking = (0, vue_2.ref)({});
function invite() {
    return __awaiter(this, void 0, void 0, function () {
        var err_1, detail;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!inviteEmail.value)
                        return [2 /*return*/];
                    inviting.value = true;
                    inviteError.value = '';
                    inviteSuccess.value = '';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, doInvite({
                            pathCode: props.pathCode,
                            data: { email: inviteEmail.value },
                        })];
                case 2:
                    _a.sent();
                    inviteSuccess.value = 'Invitation sent successfully.';
                    inviteEmail.value = '';
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    detail = (0, errors_1.extractErrorMessage)(err_1);
                    inviteError.value = detail
                        ? "Failed to invite: ".concat(detail)
                        : 'Failed to send invitation. Please try again.';
                    return [3 /*break*/, 5];
                case 4:
                    inviting.value = false;
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function kickSubscriber(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    kicking.value[userId] = true;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, doKick({ pathCode: props.pathCode, targetUserId: userId })];
                case 2:
                    _b.sent();
                    void queryClient.invalidateQueries({
                        queryKey: (0, apiClient_1.getListSubscriptionsQueryKey)(props.pathCode),
                    });
                    return [3 /*break*/, 5];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    kicking.value[userId] = false;
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function onEmailInput(value) {
    inviteEmail.value = value;
    inviteSuccess.value = '';
    inviteError.value = '';
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "sub-manager" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "sub-manager-title" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.pathTitle);
if (__VLS_ctx.subscribers.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "sub-list" }));
    var _loop_1 = function (sub) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ key: (sub.user_id) }, { class: "sub-item" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "sub-name" }));
        (sub.display_name || sub.email || sub.user_id);
        var __VLS_0 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0(__assign({ 'onClick': {} }, { size: "small", fill: "outline", color: "danger", disabled: (__VLS_ctx.kicking[sub.user_id]) })));
        var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "small", fill: "outline", color: "danger", disabled: (__VLS_ctx.kicking[sub.user_id]) })], __VLS_functionalComponentArgsRest(__VLS_1), false));
        var __VLS_4 = void 0;
        var __VLS_5 = void 0;
        var __VLS_6 = void 0;
        var __VLS_7 = {
            onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.subscribers.length > 0))
                    return;
                __VLS_ctx.kickSubscriber(sub.user_id);
            }
        };
        __VLS_3.slots.default;
        (__VLS_ctx.kicking[sub.user_id] ? 'Removing…' : 'Remove');
    };
    var __VLS_3;
    for (var _i = 0, _a = __VLS_getVForSourceType((__VLS_ctx.subscribers)); _i < _a.length; _i++) {
        var sub = _a[_i][0];
        _loop_1(sub);
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "sub-empty" }));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "sub-invite-row" }));
var __VLS_8 = {}.IonInput;
/** @type {[typeof __VLS_components.IonInput, typeof __VLS_components.ionInput, ]} */ ;
// @ts-ignore
var __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8(__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.inviteEmail), type: "email", placeholder: "Email address to invite" }), { class: "sub-invite-input" })));
var __VLS_10 = __VLS_9.apply(void 0, __spreadArray([__assign(__assign({ 'onUpdate:modelValue': {} }, { modelValue: (__VLS_ctx.inviteEmail), type: "email", placeholder: "Email address to invite" }), { class: "sub-invite-input" })], __VLS_functionalComponentArgsRest(__VLS_9), false));
var __VLS_12;
var __VLS_13;
var __VLS_14;
var __VLS_15 = {
    'onUpdate:modelValue': function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.onEmailInput($event);
    }
};
var __VLS_11;
var __VLS_16 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16(__assign({ 'onClick': {} }, { size: "small", disabled: (!__VLS_ctx.inviteEmail || __VLS_ctx.inviting) })));
var __VLS_18 = __VLS_17.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "small", disabled: (!__VLS_ctx.inviteEmail || __VLS_ctx.inviting) })], __VLS_functionalComponentArgsRest(__VLS_17), false));
var __VLS_20;
var __VLS_21;
var __VLS_22;
var __VLS_23 = {
    onClick: (__VLS_ctx.invite)
};
__VLS_19.slots.default;
(__VLS_ctx.inviting ? 'Inviting…' : 'Invite');
var __VLS_19;
if (__VLS_ctx.inviteError) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "sub-error" }));
    (__VLS_ctx.inviteError);
}
if (__VLS_ctx.inviteSuccess) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "sub-success" }));
    (__VLS_ctx.inviteSuccess);
}
/** @type {__VLS_StyleScopedClasses['sub-manager']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-manager-title']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-list']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-item']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-name']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-invite-row']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-invite-input']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-error']} */ ;
/** @type {__VLS_StyleScopedClasses['sub-success']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            IonButton: vue_1.IonButton,
            IonInput: vue_1.IonInput,
            subscribers: subscribers,
            inviteEmail: inviteEmail,
            inviting: inviting,
            inviteError: inviteError,
            inviteSuccess: inviteSuccess,
            kicking: kicking,
            invite: invite,
            kickSubscriber: kickSubscriber,
            onEmailInput: onEmailInput,
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
