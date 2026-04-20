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
exports.completeDraftImageUpload = exports.getCompleteDraftImageUploadUrl = exports.useCreateDraftImageSlot = exports.getCreateDraftImageSlotMutationOptions = exports.createDraftImageSlot = exports.getCreateDraftImageSlotUrl = exports.useAbandonEntryDraft = exports.getAbandonEntryDraftMutationOptions = exports.abandonEntryDraft = exports.getAbandonEntryDraftUrl = exports.usePatchEntryDraft = exports.getPatchEntryDraftMutationOptions = exports.patchEntryDraft = exports.getPatchEntryDraftUrl = exports.getGetEntryDraftQueryOptions = exports.getGetEntryDraftQueryKey = exports.getEntryDraft = exports.getGetEntryDraftUrl = exports.getStartEditEntryDraftQueryOptions = exports.getStartEditEntryDraftQueryKey = exports.startEditEntryDraft = exports.getStartEditEntryDraftUrl = exports.getStartCreateEntryDraftQueryOptions = exports.getStartCreateEntryDraftQueryKey = exports.startCreateEntryDraft = exports.getStartCreateEntryDraftUrl = exports.useUpdatePathVisibility = exports.getUpdatePathVisibilityMutationOptions = exports.updatePathVisibility = exports.getUpdatePathVisibilityUrl = exports.useDeletePath = exports.getDeletePathMutationOptions = exports.deletePath = exports.getDeletePathUrl = exports.useUpdatePath = exports.getUpdatePathMutationOptions = exports.updatePath = exports.getUpdatePathUrl = exports.useCreatePath = exports.getCreatePathMutationOptions = exports.createPath = exports.getCreatePathUrl = exports.getListPathsQueryOptions = exports.getListPathsQueryKey = exports.listPaths = exports.getListPathsUrl = exports.getHealthQueryOptions = exports.getHealthQueryKey = exports.health = exports.getHealthUrl = void 0;
exports.useInviteSubscriber = exports.getInviteSubscriberMutationOptions = exports.inviteSubscriber = exports.getInviteSubscriberUrl = exports.getListSubscriptionsQueryOptions = exports.getListSubscriptionsQueryKey = exports.listSubscriptions = exports.getListSubscriptionsUrl = exports.getListEntryImagesQueryOptions = exports.getListEntryImagesQueryKey = exports.listEntryImages = exports.getListEntryImagesUrl = exports.useCreateImageUploadUrl = exports.getCreateImageUploadUrlMutationOptions = exports.createImageUploadUrl = exports.getCreateImageUploadUrlUrl = exports.useDeleteEntry = exports.getDeleteEntryMutationOptions = exports.deleteEntry = exports.getDeleteEntryUrl = exports.useUpdateEntry = exports.getUpdateEntryMutationOptions = exports.updateEntry = exports.getUpdateEntryUrl = exports.getGetEntryQueryOptions = exports.getGetEntryQueryKey = exports.getEntry = exports.getGetEntryUrl = exports.useCreateEntry = exports.getCreateEntryMutationOptions = exports.createEntry = exports.getCreateEntryUrl = exports.getListEntriesQueryOptions = exports.getListEntriesQueryKey = exports.listEntries = exports.getListEntriesUrl = exports.useCommitEntryDraft = exports.getCommitEntryDraftMutationOptions = exports.commitEntryDraft = exports.getCommitEntryDraftUrl = exports.useRemoveDraftImage = exports.getRemoveDraftImageMutationOptions = exports.removeDraftImage = exports.getRemoveDraftImageUrl = exports.useRetryDraftImageUpload = exports.getRetryDraftImageUploadMutationOptions = exports.retryDraftImageUpload = exports.getRetryDraftImageUploadUrl = exports.useCompleteDraftImageUpload = exports.getCompleteDraftImageUploadMutationOptions = void 0;
exports.downloadExportJson = exports.getDownloadExportJsonUrl = exports.getGetExportQueryOptions = exports.getGetExportQueryKey = exports.getExport = exports.getGetExportUrl = exports.useCreateExport = exports.getCreateExportMutationOptions = exports.createExport = exports.getCreateExportUrl = exports.getGetImageDownloadUrlQueryOptions = exports.getGetImageDownloadUrlQueryKey = exports.getImageDownloadUrl = exports.getGetImageDownloadUrlUrl = exports.useCompleteImageUpload = exports.getCompleteImageUploadMutationOptions = exports.completeImageUpload = exports.getCompleteImageUploadUrl = exports.getGetLatestDeletionRequestQueryOptions = exports.getGetLatestDeletionRequestQueryKey = exports.getLatestDeletionRequest = exports.getGetLatestDeletionRequestUrl = exports.useCreateDeletionRequest = exports.getCreateDeletionRequestMutationOptions = exports.createDeletionRequest = exports.getCreateDeletionRequestUrl = exports.useUpdateSettings = exports.getUpdateSettingsMutationOptions = exports.updateSettings = exports.getUpdateSettingsUrl = exports.useUpdateDisplayName = exports.getUpdateDisplayNameMutationOptions = exports.updateDisplayName = exports.getUpdateDisplayNameUrl = exports.getGetProfileQueryOptions = exports.getGetProfileQueryKey = exports.getProfile = exports.getGetProfileUrl = exports.useSetPathCreationApproval = exports.getSetPathCreationApprovalMutationOptions = exports.setPathCreationApproval = exports.getSetPathCreationApprovalUrl = exports.useAdminLogin = exports.getAdminLoginMutationOptions = exports.adminLogin = exports.getAdminLoginUrl = exports.useDeleteSubscription = exports.getDeleteSubscriptionMutationOptions = exports.deleteSubscription = exports.getDeleteSubscriptionUrl = void 0;
exports.getUpdatePathResponseMock = exports.getCreatePathResponseMock = exports.getListPathsResponseMock = exports.getHealthResponseMock = exports.getRootQueryOptions = exports.getRootQueryKey = exports.root = exports.getRootUrl = exports.useUnblockUser = exports.getUnblockUserMutationOptions = exports.unblockUser = exports.getUnblockUserUrl = exports.useBlockInviter = exports.getBlockInviterMutationOptions = exports.blockInviter = exports.getBlockInviterUrl = exports.getListBlocklistQueryOptions = exports.getListBlocklistQueryKey = exports.listBlocklist = exports.getListBlocklistUrl = exports.useIgnoreInvitation = exports.getIgnoreInvitationMutationOptions = exports.ignoreInvitation = exports.getIgnoreInvitationUrl = exports.useAcceptInvitation = exports.getAcceptInvitationMutationOptions = exports.acceptInvitation = exports.getAcceptInvitationUrl = exports.getListInvitationsQueryOptions = exports.getListInvitationsQueryKey = exports.listInvitations = exports.getListInvitationsUrl = exports.getAuthCallbackRedirectQueryOptions = exports.getAuthCallbackRedirectQueryKey = exports.authCallbackRedirect = exports.getAuthCallbackRedirectUrl = exports.useAuthCallback = exports.getAuthCallbackMutationOptions = exports.authCallback = exports.getAuthCallbackUrl = exports.getAuthLoginQueryOptions = exports.getAuthLoginQueryKey = exports.authLogin = exports.getAuthLoginUrl = exports.getDownloadExportImagesQueryOptions = exports.getDownloadExportImagesQueryKey = exports.downloadExportImages = exports.getDownloadExportImagesUrl = exports.getDownloadExportJsonQueryOptions = exports.getDownloadExportJsonQueryKey = void 0;
exports.getRetryDraftImageUploadMockHandler = exports.getCompleteDraftImageUploadMockHandler = exports.getCreateDraftImageSlotMockHandler = exports.getAbandonEntryDraftMockHandler = exports.getPatchEntryDraftMockHandler = exports.getGetEntryDraftMockHandler = exports.getStartEditEntryDraftMockHandler = exports.getStartCreateEntryDraftMockHandler = exports.getUpdatePathVisibilityMockHandler = exports.getDeletePathMockHandler = exports.getUpdatePathMockHandler = exports.getCreatePathMockHandler = exports.getListPathsMockHandler = exports.getHealthMockHandler = exports.getListBlocklistResponseMock = exports.getListInvitationsResponseMock = exports.getAuthCallbackRedirectResponseMock = exports.getAuthCallbackResponseMock = exports.getAuthLoginResponseMock = exports.getDownloadExportImagesResponseMock = exports.getDownloadExportJsonResponseMock = exports.getGetExportResponseMock = exports.getCreateExportResponseMock = exports.getGetImageDownloadUrlResponseMock = exports.getCompleteImageUploadResponseMock = exports.getGetLatestDeletionRequestResponseMock = exports.getCreateDeletionRequestResponseMock = exports.getUpdateSettingsResponseMock = exports.getUpdateDisplayNameResponseMock = exports.getGetProfileResponseMock = exports.getSetPathCreationApprovalResponseMock = exports.getAdminLoginResponseMock = exports.getInviteSubscriberResponseMock = exports.getListSubscriptionsResponseMock = exports.getListEntryImagesResponseMock = exports.getCreateImageUploadUrlResponseMock = exports.getUpdateEntryResponseMock = exports.getGetEntryResponseMock = exports.getCreateEntryResponseMock = exports.getListEntriesResponseMock = exports.getCommitEntryDraftResponseMock = exports.getRemoveDraftImageResponseMock = exports.getRetryDraftImageUploadResponseMock = exports.getCompleteDraftImageUploadResponseMock = exports.getCreateDraftImageSlotResponseMock = exports.getPatchEntryDraftResponseMock = exports.getGetEntryDraftResponseMock = exports.getStartEditEntryDraftResponseMock = exports.getStartCreateEntryDraftResponseMock = exports.getUpdatePathVisibilityResponseMock = void 0;
exports.getPathsBackendAPIMock = exports.getRootMockHandler = exports.getUnblockUserMockHandler = exports.getBlockInviterMockHandler = exports.getListBlocklistMockHandler = exports.getIgnoreInvitationMockHandler = exports.getAcceptInvitationMockHandler = exports.getListInvitationsMockHandler = exports.getAuthCallbackRedirectMockHandler = exports.getAuthCallbackMockHandler = exports.getAuthLoginMockHandler = exports.getDownloadExportImagesMockHandler = exports.getDownloadExportJsonMockHandler = exports.getGetExportMockHandler = exports.getCreateExportMockHandler = exports.getGetImageDownloadUrlMockHandler = exports.getCompleteImageUploadMockHandler = exports.getGetLatestDeletionRequestMockHandler = exports.getCreateDeletionRequestMockHandler = exports.getUpdateSettingsMockHandler = exports.getUpdateDisplayNameMockHandler = exports.getGetProfileMockHandler = exports.getSetPathCreationApprovalMockHandler = exports.getAdminLoginMockHandler = exports.getDeleteSubscriptionMockHandler = exports.getInviteSubscriberMockHandler = exports.getListSubscriptionsMockHandler = exports.getListEntryImagesMockHandler = exports.getCreateImageUploadUrlMockHandler = exports.getDeleteEntryMockHandler = exports.getUpdateEntryMockHandler = exports.getGetEntryMockHandler = exports.getCreateEntryMockHandler = exports.getListEntriesMockHandler = exports.getCommitEntryDraftMockHandler = exports.getRemoveDraftImageMockHandler = void 0;
exports.useHealth = useHealth;
exports.useListPaths = useListPaths;
exports.useStartCreateEntryDraft = useStartCreateEntryDraft;
exports.useStartEditEntryDraft = useStartEditEntryDraft;
exports.useGetEntryDraft = useGetEntryDraft;
exports.useListEntries = useListEntries;
exports.useGetEntry = useGetEntry;
exports.useListEntryImages = useListEntryImages;
exports.useListSubscriptions = useListSubscriptions;
exports.useGetProfile = useGetProfile;
exports.useGetLatestDeletionRequest = useGetLatestDeletionRequest;
exports.useGetImageDownloadUrl = useGetImageDownloadUrl;
exports.useGetExport = useGetExport;
exports.useDownloadExportJson = useDownloadExportJson;
exports.useDownloadExportImages = useDownloadExportImages;
exports.useAuthLogin = useAuthLogin;
exports.useAuthCallbackRedirect = useAuthCallbackRedirect;
exports.useListInvitations = useListInvitations;
exports.useListBlocklist = useListBlocklist;
exports.useRoot = useRoot;
/**
 * Generated by orval v8.4.1 🍺
 * Do not edit manually.
 * paths backend API
 * OpenAPI spec version: 0.3.4
 */
var vue_query_1 = require("@tanstack/vue-query");
var vue_1 = require("vue");
var faker_1 = require("@faker-js/faker");
var msw_1 = require("msw");
var customFetch_1 = require("../lib/customFetch");
var getHealthUrl = function () {
    return "/health";
};
exports.getHealthUrl = getHealthUrl;
var health = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getHealthUrl)(), __assign(__assign({}, options), { method: 'GET' }))];
    });
}); };
exports.health = health;
var getHealthQueryKey = function () {
    return ['health'];
};
exports.getHealthQueryKey = getHealthQueryKey;
var getHealthQueryOptions = function (options) {
    var _a = options !== null && options !== void 0 ? options : {}, queryOptions = _a.query, requestOptions = _a.request;
    var queryKey = (0, exports.getHealthQueryKey)();
    var queryFn = function (_a) {
        var signal = _a.signal;
        return (0, exports.health)(__assign({ signal: signal }, requestOptions));
    };
    return __assign({ queryKey: queryKey, queryFn: queryFn }, queryOptions);
};
exports.getHealthQueryOptions = getHealthQueryOptions;
/**
 * @summary Health
 */
function useHealth(options, queryClient) {
    var queryOptions = (0, exports.getHealthQueryOptions)(options);
    var query = (0, vue_query_1.useQuery)(queryOptions, queryClient);
    query.queryKey = (0, vue_1.unref)(queryOptions).queryKey;
    return query;
}
var getListPathsUrl = function () {
    return "/v1/paths";
};
exports.getListPathsUrl = getListPathsUrl;
var listPaths = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getListPathsUrl)(), __assign(__assign({}, options), { method: 'GET' }))];
    });
}); };
exports.listPaths = listPaths;
var getListPathsQueryKey = function () {
    return ['v1', 'paths'];
};
exports.getListPathsQueryKey = getListPathsQueryKey;
var getListPathsQueryOptions = function (options) {
    var _a = options !== null && options !== void 0 ? options : {}, queryOptions = _a.query, requestOptions = _a.request;
    var queryKey = (0, exports.getListPathsQueryKey)();
    var queryFn = function (_a) {
        var signal = _a.signal;
        return (0, exports.listPaths)(__assign({ signal: signal }, requestOptions));
    };
    return __assign({ queryKey: queryKey, queryFn: queryFn }, queryOptions);
};
exports.getListPathsQueryOptions = getListPathsQueryOptions;
/**
 * @summary List Paths
 */
function useListPaths(options, queryClient) {
    var queryOptions = (0, exports.getListPathsQueryOptions)(options);
    var query = (0, vue_query_1.useQuery)(queryOptions, queryClient);
    query.queryKey = (0, vue_1.unref)(queryOptions).queryKey;
    return query;
}
var getCreatePathUrl = function () {
    return "/v1/paths";
};
exports.getCreatePathUrl = getCreatePathUrl;
var createPath = function (pathCreateRequest, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getCreatePathUrl)(), __assign(__assign({}, options), { method: 'POST', headers: __assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers), body: JSON.stringify(pathCreateRequest) }))];
    });
}); };
exports.createPath = createPath;
var getCreatePathMutationOptions = function (options) {
    var mutationKey = ['createPath'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var data = (props !== null && props !== void 0 ? props : {}).data;
        return (0, exports.createPath)(data, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getCreatePathMutationOptions = getCreatePathMutationOptions;
/**
 * @summary Create Path
 */
var useCreatePath = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getCreatePathMutationOptions)(options), queryClient);
};
exports.useCreatePath = useCreatePath;
var getUpdatePathUrl = function (pathCode) {
    return "/v1/paths/".concat(pathCode);
};
exports.getUpdatePathUrl = getUpdatePathUrl;
var updatePath = function (pathCode, pathUpdateRequest, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getUpdatePathUrl)(pathCode), __assign(__assign({}, options), { method: 'PATCH', headers: __assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers), body: JSON.stringify(pathUpdateRequest) }))];
    });
}); };
exports.updatePath = updatePath;
var getUpdatePathMutationOptions = function (options) {
    var mutationKey = ['updatePath'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var _a = props !== null && props !== void 0 ? props : {}, pathCode = _a.pathCode, data = _a.data;
        return (0, exports.updatePath)(pathCode, data, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getUpdatePathMutationOptions = getUpdatePathMutationOptions;
/**
 * @summary Update Path
 */
var useUpdatePath = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getUpdatePathMutationOptions)(options), queryClient);
};
exports.useUpdatePath = useUpdatePath;
var getDeletePathUrl = function (pathCode) {
    return "/v1/paths/".concat(pathCode);
};
exports.getDeletePathUrl = getDeletePathUrl;
var deletePath = function (pathCode, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getDeletePathUrl)(pathCode), __assign(__assign({}, options), { method: 'DELETE' }))];
    });
}); };
exports.deletePath = deletePath;
var getDeletePathMutationOptions = function (options) {
    var mutationKey = ['deletePath'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var pathCode = (props !== null && props !== void 0 ? props : {}).pathCode;
        return (0, exports.deletePath)(pathCode, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getDeletePathMutationOptions = getDeletePathMutationOptions;
/**
 * @summary Delete Path
 */
var useDeletePath = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getDeletePathMutationOptions)(options), queryClient);
};
exports.useDeletePath = useDeletePath;
var getUpdatePathVisibilityUrl = function (pathCode) {
    return "/v1/paths/".concat(pathCode, "/visibility");
};
exports.getUpdatePathVisibilityUrl = getUpdatePathVisibilityUrl;
var updatePathVisibility = function (pathCode, pathVisibilityUpdateRequest, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getUpdatePathVisibilityUrl)(pathCode), __assign(__assign({}, options), { method: 'PATCH', headers: __assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers), body: JSON.stringify(pathVisibilityUpdateRequest) }))];
    });
}); };
exports.updatePathVisibility = updatePathVisibility;
var getUpdatePathVisibilityMutationOptions = function (options) {
    var mutationKey = ['updatePathVisibility'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var _a = props !== null && props !== void 0 ? props : {}, pathCode = _a.pathCode, data = _a.data;
        return (0, exports.updatePathVisibility)(pathCode, data, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getUpdatePathVisibilityMutationOptions = getUpdatePathVisibilityMutationOptions;
/**
 * @summary Update Path Visibility
 */
var useUpdatePathVisibility = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getUpdatePathVisibilityMutationOptions)(options), queryClient);
};
exports.useUpdatePathVisibility = useUpdatePathVisibility;
var getStartCreateEntryDraftUrl = function (pathCode, params) {
    var normalizedParams = new URLSearchParams();
    Object.entries(params || {}).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        if (value !== undefined) {
            normalizedParams.append(key, value === null ? 'null' : value.toString());
        }
    });
    var stringifiedParams = normalizedParams.toString();
    return stringifiedParams.length > 0
        ? "/v1/paths/".concat(pathCode, "/entries/drafts?").concat(stringifiedParams)
        : "/v1/paths/".concat(pathCode, "/entries/drafts");
};
exports.getStartCreateEntryDraftUrl = getStartCreateEntryDraftUrl;
var startCreateEntryDraft = function (pathCode, params, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getStartCreateEntryDraftUrl)(pathCode, params), __assign(__assign({}, options), { method: 'GET' }))];
    });
}); };
exports.startCreateEntryDraft = startCreateEntryDraft;
var getStartCreateEntryDraftQueryKey = function (pathCode, params) {
    return __spreadArray([
        'v1',
        'paths',
        pathCode,
        'entries',
        'drafts'
    ], (params ? [params] : []), true);
};
exports.getStartCreateEntryDraftQueryKey = getStartCreateEntryDraftQueryKey;
var getStartCreateEntryDraftQueryOptions = function (pathCode, params, options) {
    var _a = options !== null && options !== void 0 ? options : {}, queryOptions = _a.query, requestOptions = _a.request;
    var queryKey = (0, exports.getStartCreateEntryDraftQueryKey)(pathCode, params);
    var queryFn = function (_a) {
        var signal = _a.signal;
        return (0, exports.startCreateEntryDraft)((0, vue_1.unref)(pathCode), (0, vue_1.unref)(params), __assign({ signal: signal }, requestOptions));
    };
    return __assign({ queryKey: queryKey, queryFn: queryFn, enabled: (0, vue_1.computed)(function () { return !!(0, vue_1.unref)(pathCode); }) }, queryOptions);
};
exports.getStartCreateEntryDraftQueryOptions = getStartCreateEntryDraftQueryOptions;
/**
 * @summary Start Create Entry Draft
 */
function useStartCreateEntryDraft(pathCode, params, options, queryClient) {
    var queryOptions = (0, exports.getStartCreateEntryDraftQueryOptions)(pathCode, params, options);
    var query = (0, vue_query_1.useQuery)(queryOptions, queryClient);
    query.queryKey = (0, vue_1.unref)(queryOptions).queryKey;
    return query;
}
var getStartEditEntryDraftUrl = function (pathCode, entrySlug, params) {
    var normalizedParams = new URLSearchParams();
    Object.entries(params || {}).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        if (value !== undefined) {
            normalizedParams.append(key, value === null ? 'null' : value.toString());
        }
    });
    var stringifiedParams = normalizedParams.toString();
    return stringifiedParams.length > 0
        ? "/v1/paths/".concat(pathCode, "/entries/").concat(entrySlug, "/draft?").concat(stringifiedParams)
        : "/v1/paths/".concat(pathCode, "/entries/").concat(entrySlug, "/draft");
};
exports.getStartEditEntryDraftUrl = getStartEditEntryDraftUrl;
var startEditEntryDraft = function (pathCode, entrySlug, params, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getStartEditEntryDraftUrl)(pathCode, entrySlug, params), __assign(__assign({}, options), { method: 'GET' }))];
    });
}); };
exports.startEditEntryDraft = startEditEntryDraft;
var getStartEditEntryDraftQueryKey = function (pathCode, entrySlug, params) {
    return __spreadArray([
        'v1',
        'paths',
        pathCode,
        'entries',
        entrySlug,
        'draft'
    ], (params ? [params] : []), true);
};
exports.getStartEditEntryDraftQueryKey = getStartEditEntryDraftQueryKey;
var getStartEditEntryDraftQueryOptions = function (pathCode, entrySlug, params, options) {
    var _a = options !== null && options !== void 0 ? options : {}, queryOptions = _a.query, requestOptions = _a.request;
    var queryKey = (0, exports.getStartEditEntryDraftQueryKey)(pathCode, entrySlug, params);
    var queryFn = function (_a) {
        var signal = _a.signal;
        return (0, exports.startEditEntryDraft)((0, vue_1.unref)(pathCode), (0, vue_1.unref)(entrySlug), (0, vue_1.unref)(params), __assign({ signal: signal }, requestOptions));
    };
    return __assign({ queryKey: queryKey, queryFn: queryFn, enabled: (0, vue_1.computed)(function () { return !!((0, vue_1.unref)(pathCode) && (0, vue_1.unref)(entrySlug)); }) }, queryOptions);
};
exports.getStartEditEntryDraftQueryOptions = getStartEditEntryDraftQueryOptions;
/**
 * @summary Start Edit Entry Draft
 */
function useStartEditEntryDraft(pathCode, entrySlug, params, options, queryClient) {
    var queryOptions = (0, exports.getStartEditEntryDraftQueryOptions)(pathCode, entrySlug, params, options);
    var query = (0, vue_query_1.useQuery)(queryOptions, queryClient);
    query.queryKey = (0, vue_1.unref)(queryOptions).queryKey;
    return query;
}
var getGetEntryDraftUrl = function (draftId) {
    return "/v1/entry-drafts/".concat(draftId);
};
exports.getGetEntryDraftUrl = getGetEntryDraftUrl;
var getEntryDraft = function (draftId, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getGetEntryDraftUrl)(draftId), __assign(__assign({}, options), { method: 'GET' }))];
    });
}); };
exports.getEntryDraft = getEntryDraft;
var getGetEntryDraftQueryKey = function (draftId) {
    return ['v1', 'entry-drafts', draftId];
};
exports.getGetEntryDraftQueryKey = getGetEntryDraftQueryKey;
var getGetEntryDraftQueryOptions = function (draftId, options) {
    var _a = options !== null && options !== void 0 ? options : {}, queryOptions = _a.query, requestOptions = _a.request;
    var queryKey = (0, exports.getGetEntryDraftQueryKey)(draftId);
    var queryFn = function (_a) {
        var signal = _a.signal;
        return (0, exports.getEntryDraft)((0, vue_1.unref)(draftId), __assign({ signal: signal }, requestOptions));
    };
    return __assign({ queryKey: queryKey, queryFn: queryFn, enabled: (0, vue_1.computed)(function () { return !!(0, vue_1.unref)(draftId); }) }, queryOptions);
};
exports.getGetEntryDraftQueryOptions = getGetEntryDraftQueryOptions;
/**
 * @summary Get Entry Draft
 */
function useGetEntryDraft(draftId, options, queryClient) {
    var queryOptions = (0, exports.getGetEntryDraftQueryOptions)(draftId, options);
    var query = (0, vue_query_1.useQuery)(queryOptions, queryClient);
    query.queryKey = (0, vue_1.unref)(queryOptions).queryKey;
    return query;
}
var getPatchEntryDraftUrl = function (draftId) {
    return "/v1/entry-drafts/".concat(draftId);
};
exports.getPatchEntryDraftUrl = getPatchEntryDraftUrl;
var patchEntryDraft = function (draftId, patchDraftRequest, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getPatchEntryDraftUrl)(draftId), __assign(__assign({}, options), { method: 'PATCH', headers: __assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers), body: JSON.stringify(patchDraftRequest) }))];
    });
}); };
exports.patchEntryDraft = patchEntryDraft;
var getPatchEntryDraftMutationOptions = function (options) {
    var mutationKey = ['patchEntryDraft'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var _a = props !== null && props !== void 0 ? props : {}, draftId = _a.draftId, data = _a.data;
        return (0, exports.patchEntryDraft)(draftId, data, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getPatchEntryDraftMutationOptions = getPatchEntryDraftMutationOptions;
/**
 * @summary Patch Entry Draft
 */
var usePatchEntryDraft = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getPatchEntryDraftMutationOptions)(options), queryClient);
};
exports.usePatchEntryDraft = usePatchEntryDraft;
var getAbandonEntryDraftUrl = function (draftId) {
    return "/v1/entry-drafts/".concat(draftId);
};
exports.getAbandonEntryDraftUrl = getAbandonEntryDraftUrl;
var abandonEntryDraft = function (draftId, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getAbandonEntryDraftUrl)(draftId), __assign(__assign({}, options), { method: 'DELETE' }))];
    });
}); };
exports.abandonEntryDraft = abandonEntryDraft;
var getAbandonEntryDraftMutationOptions = function (options) {
    var mutationKey = ['abandonEntryDraft'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var draftId = (props !== null && props !== void 0 ? props : {}).draftId;
        return (0, exports.abandonEntryDraft)(draftId, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getAbandonEntryDraftMutationOptions = getAbandonEntryDraftMutationOptions;
/**
 * @summary Abandon Entry Draft
 */
var useAbandonEntryDraft = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getAbandonEntryDraftMutationOptions)(options), queryClient);
};
exports.useAbandonEntryDraft = useAbandonEntryDraft;
var getCreateDraftImageSlotUrl = function (draftId) {
    return "/v1/entry-drafts/".concat(draftId, "/images");
};
exports.getCreateDraftImageSlotUrl = getCreateDraftImageSlotUrl;
var createDraftImageSlot = function (draftId, createDraftImageRequest, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getCreateDraftImageSlotUrl)(draftId), __assign(__assign({}, options), { method: 'POST', headers: __assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers), body: JSON.stringify(createDraftImageRequest) }))];
    });
}); };
exports.createDraftImageSlot = createDraftImageSlot;
var getCreateDraftImageSlotMutationOptions = function (options) {
    var mutationKey = ['createDraftImageSlot'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var _a = props !== null && props !== void 0 ? props : {}, draftId = _a.draftId, data = _a.data;
        return (0, exports.createDraftImageSlot)(draftId, data, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getCreateDraftImageSlotMutationOptions = getCreateDraftImageSlotMutationOptions;
/**
 * @summary Create Draft Image Slot
 */
var useCreateDraftImageSlot = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getCreateDraftImageSlotMutationOptions)(options), queryClient);
};
exports.useCreateDraftImageSlot = useCreateDraftImageSlot;
var getCompleteDraftImageUploadUrl = function (draftId, draftImageId) {
    return "/v1/entry-drafts/".concat(draftId, "/images/").concat(draftImageId, "/complete");
};
exports.getCompleteDraftImageUploadUrl = getCompleteDraftImageUploadUrl;
var completeDraftImageUpload = function (draftId, draftImageId, completeDraftImageRequest, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getCompleteDraftImageUploadUrl)(draftId, draftImageId), __assign(__assign({}, options), { method: 'POST', headers: __assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers), body: JSON.stringify(completeDraftImageRequest) }))];
    });
}); };
exports.completeDraftImageUpload = completeDraftImageUpload;
var getCompleteDraftImageUploadMutationOptions = function (options) {
    var mutationKey = ['completeDraftImageUpload'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var _a = props !== null && props !== void 0 ? props : {}, draftId = _a.draftId, draftImageId = _a.draftImageId, data = _a.data;
        return (0, exports.completeDraftImageUpload)(draftId, draftImageId, data, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getCompleteDraftImageUploadMutationOptions = getCompleteDraftImageUploadMutationOptions;
/**
 * @summary Complete Draft Image Upload
 */
var useCompleteDraftImageUpload = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getCompleteDraftImageUploadMutationOptions)(options), queryClient);
};
exports.useCompleteDraftImageUpload = useCompleteDraftImageUpload;
var getRetryDraftImageUploadUrl = function (draftId, draftImageId) {
    return "/v1/entry-drafts/".concat(draftId, "/images/").concat(draftImageId, "/retry-upload");
};
exports.getRetryDraftImageUploadUrl = getRetryDraftImageUploadUrl;
var retryDraftImageUpload = function (draftId, draftImageId, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getRetryDraftImageUploadUrl)(draftId, draftImageId), __assign(__assign({}, options), { method: 'POST' }))];
    });
}); };
exports.retryDraftImageUpload = retryDraftImageUpload;
var getRetryDraftImageUploadMutationOptions = function (options) {
    var mutationKey = ['retryDraftImageUpload'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var _a = props !== null && props !== void 0 ? props : {}, draftId = _a.draftId, draftImageId = _a.draftImageId;
        return (0, exports.retryDraftImageUpload)(draftId, draftImageId, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getRetryDraftImageUploadMutationOptions = getRetryDraftImageUploadMutationOptions;
/**
 * @summary Retry Draft Image Upload
 */
var useRetryDraftImageUpload = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getRetryDraftImageUploadMutationOptions)(options), queryClient);
};
exports.useRetryDraftImageUpload = useRetryDraftImageUpload;
var getRemoveDraftImageUrl = function (draftId, draftImageId) {
    return "/v1/entry-drafts/".concat(draftId, "/images/").concat(draftImageId);
};
exports.getRemoveDraftImageUrl = getRemoveDraftImageUrl;
var removeDraftImage = function (draftId, draftImageId, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getRemoveDraftImageUrl)(draftId, draftImageId), __assign(__assign({}, options), { method: 'DELETE' }))];
    });
}); };
exports.removeDraftImage = removeDraftImage;
var getRemoveDraftImageMutationOptions = function (options) {
    var mutationKey = ['removeDraftImage'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var _a = props !== null && props !== void 0 ? props : {}, draftId = _a.draftId, draftImageId = _a.draftImageId;
        return (0, exports.removeDraftImage)(draftId, draftImageId, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getRemoveDraftImageMutationOptions = getRemoveDraftImageMutationOptions;
/**
 * @summary Remove Draft Image
 */
var useRemoveDraftImage = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getRemoveDraftImageMutationOptions)(options), queryClient);
};
exports.useRemoveDraftImage = useRemoveDraftImage;
var getCommitEntryDraftUrl = function (draftId) {
    return "/v1/entry-drafts/".concat(draftId, "/commit");
};
exports.getCommitEntryDraftUrl = getCommitEntryDraftUrl;
var commitEntryDraft = function (draftId, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getCommitEntryDraftUrl)(draftId), __assign(__assign({}, options), { method: 'POST' }))];
    });
}); };
exports.commitEntryDraft = commitEntryDraft;
var getCommitEntryDraftMutationOptions = function (options) {
    var mutationKey = ['commitEntryDraft'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var draftId = (props !== null && props !== void 0 ? props : {}).draftId;
        return (0, exports.commitEntryDraft)(draftId, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getCommitEntryDraftMutationOptions = getCommitEntryDraftMutationOptions;
/**
 * @summary Commit Entry Draft
 */
var useCommitEntryDraft = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getCommitEntryDraftMutationOptions)(options), queryClient);
};
exports.useCommitEntryDraft = useCommitEntryDraft;
var getListEntriesUrl = function (pathCode) {
    return "/v1/paths/".concat(pathCode, "/entries");
};
exports.getListEntriesUrl = getListEntriesUrl;
var listEntries = function (pathCode, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getListEntriesUrl)(pathCode), __assign(__assign({}, options), { method: 'GET' }))];
    });
}); };
exports.listEntries = listEntries;
var getListEntriesQueryKey = function (pathCode) {
    return ['v1', 'paths', pathCode, 'entries'];
};
exports.getListEntriesQueryKey = getListEntriesQueryKey;
var getListEntriesQueryOptions = function (pathCode, options) {
    var _a = options !== null && options !== void 0 ? options : {}, queryOptions = _a.query, requestOptions = _a.request;
    var queryKey = (0, exports.getListEntriesQueryKey)(pathCode);
    var queryFn = function (_a) {
        var signal = _a.signal;
        return (0, exports.listEntries)((0, vue_1.unref)(pathCode), __assign({ signal: signal }, requestOptions));
    };
    return __assign({ queryKey: queryKey, queryFn: queryFn, enabled: (0, vue_1.computed)(function () { return !!(0, vue_1.unref)(pathCode); }) }, queryOptions);
};
exports.getListEntriesQueryOptions = getListEntriesQueryOptions;
/**
 * @summary List Entries
 */
function useListEntries(pathCode, options, queryClient) {
    var queryOptions = (0, exports.getListEntriesQueryOptions)(pathCode, options);
    var query = (0, vue_query_1.useQuery)(queryOptions, queryClient);
    query.queryKey = (0, vue_1.unref)(queryOptions).queryKey;
    return query;
}
var getCreateEntryUrl = function (pathCode) {
    return "/v1/paths/".concat(pathCode, "/entries");
};
exports.getCreateEntryUrl = getCreateEntryUrl;
var createEntry = function (pathCode, entryCreateRequest, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getCreateEntryUrl)(pathCode), __assign(__assign({}, options), { method: 'POST', headers: __assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers), body: JSON.stringify(entryCreateRequest) }))];
    });
}); };
exports.createEntry = createEntry;
var getCreateEntryMutationOptions = function (options) {
    var mutationKey = ['createEntry'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var _a = props !== null && props !== void 0 ? props : {}, pathCode = _a.pathCode, data = _a.data;
        return (0, exports.createEntry)(pathCode, data, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getCreateEntryMutationOptions = getCreateEntryMutationOptions;
/**
 * @summary Create Entry
 */
var useCreateEntry = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getCreateEntryMutationOptions)(options), queryClient);
};
exports.useCreateEntry = useCreateEntry;
var getGetEntryUrl = function (pathCode, entrySlug) {
    return "/v1/paths/".concat(pathCode, "/entries/").concat(entrySlug);
};
exports.getGetEntryUrl = getGetEntryUrl;
var getEntry = function (pathCode, entrySlug, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getGetEntryUrl)(pathCode, entrySlug), __assign(__assign({}, options), { method: 'GET' }))];
    });
}); };
exports.getEntry = getEntry;
var getGetEntryQueryKey = function (pathCode, entrySlug) {
    return ['v1', 'paths', pathCode, 'entries', entrySlug];
};
exports.getGetEntryQueryKey = getGetEntryQueryKey;
var getGetEntryQueryOptions = function (pathCode, entrySlug, options) {
    var _a = options !== null && options !== void 0 ? options : {}, queryOptions = _a.query, requestOptions = _a.request;
    var queryKey = (0, exports.getGetEntryQueryKey)(pathCode, entrySlug);
    var queryFn = function (_a) {
        var signal = _a.signal;
        return (0, exports.getEntry)((0, vue_1.unref)(pathCode), (0, vue_1.unref)(entrySlug), __assign({ signal: signal }, requestOptions));
    };
    return __assign({ queryKey: queryKey, queryFn: queryFn, enabled: (0, vue_1.computed)(function () { return !!((0, vue_1.unref)(pathCode) && (0, vue_1.unref)(entrySlug)); }) }, queryOptions);
};
exports.getGetEntryQueryOptions = getGetEntryQueryOptions;
/**
 * @summary Get Entry
 */
function useGetEntry(pathCode, entrySlug, options, queryClient) {
    var queryOptions = (0, exports.getGetEntryQueryOptions)(pathCode, entrySlug, options);
    var query = (0, vue_query_1.useQuery)(queryOptions, queryClient);
    query.queryKey = (0, vue_1.unref)(queryOptions).queryKey;
    return query;
}
var getUpdateEntryUrl = function (pathCode, entrySlug) {
    return "/v1/paths/".concat(pathCode, "/entries/").concat(entrySlug);
};
exports.getUpdateEntryUrl = getUpdateEntryUrl;
var updateEntry = function (pathCode, entrySlug, entryUpdateRequest, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getUpdateEntryUrl)(pathCode, entrySlug), __assign(__assign({}, options), { method: 'PUT', headers: __assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers), body: JSON.stringify(entryUpdateRequest) }))];
    });
}); };
exports.updateEntry = updateEntry;
var getUpdateEntryMutationOptions = function (options) {
    var mutationKey = ['updateEntry'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var _a = props !== null && props !== void 0 ? props : {}, pathCode = _a.pathCode, entrySlug = _a.entrySlug, data = _a.data;
        return (0, exports.updateEntry)(pathCode, entrySlug, data, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getUpdateEntryMutationOptions = getUpdateEntryMutationOptions;
/**
 * @summary Update Entry
 */
var useUpdateEntry = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getUpdateEntryMutationOptions)(options), queryClient);
};
exports.useUpdateEntry = useUpdateEntry;
var getDeleteEntryUrl = function (pathCode, entrySlug) {
    return "/v1/paths/".concat(pathCode, "/entries/").concat(entrySlug);
};
exports.getDeleteEntryUrl = getDeleteEntryUrl;
var deleteEntry = function (pathCode, entrySlug, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getDeleteEntryUrl)(pathCode, entrySlug), __assign(__assign({}, options), { method: 'DELETE' }))];
    });
}); };
exports.deleteEntry = deleteEntry;
var getDeleteEntryMutationOptions = function (options) {
    var mutationKey = ['deleteEntry'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var _a = props !== null && props !== void 0 ? props : {}, pathCode = _a.pathCode, entrySlug = _a.entrySlug;
        return (0, exports.deleteEntry)(pathCode, entrySlug, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getDeleteEntryMutationOptions = getDeleteEntryMutationOptions;
/**
 * @summary Delete Entry
 */
var useDeleteEntry = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getDeleteEntryMutationOptions)(options), queryClient);
};
exports.useDeleteEntry = useDeleteEntry;
var getCreateImageUploadUrlUrl = function (pathCode, entrySlug) {
    return "/v1/paths/".concat(pathCode, "/entries/").concat(entrySlug, "/images/upload-url");
};
exports.getCreateImageUploadUrlUrl = getCreateImageUploadUrlUrl;
var createImageUploadUrl = function (pathCode, entrySlug, imageUploadRequest, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getCreateImageUploadUrlUrl)(pathCode, entrySlug), __assign(__assign({}, options), { method: 'POST', headers: __assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers), body: JSON.stringify(imageUploadRequest) }))];
    });
}); };
exports.createImageUploadUrl = createImageUploadUrl;
var getCreateImageUploadUrlMutationOptions = function (options) {
    var mutationKey = ['createImageUploadUrl'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var _a = props !== null && props !== void 0 ? props : {}, pathCode = _a.pathCode, entrySlug = _a.entrySlug, data = _a.data;
        return (0, exports.createImageUploadUrl)(pathCode, entrySlug, data, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getCreateImageUploadUrlMutationOptions = getCreateImageUploadUrlMutationOptions;
/**
 * @summary Create Image Upload Url
 */
var useCreateImageUploadUrl = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getCreateImageUploadUrlMutationOptions)(options), queryClient);
};
exports.useCreateImageUploadUrl = useCreateImageUploadUrl;
var getListEntryImagesUrl = function (pathCode, entrySlug) {
    return "/v1/paths/".concat(pathCode, "/entries/").concat(entrySlug, "/images");
};
exports.getListEntryImagesUrl = getListEntryImagesUrl;
var listEntryImages = function (pathCode, entrySlug, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getListEntryImagesUrl)(pathCode, entrySlug), __assign(__assign({}, options), { method: 'GET' }))];
    });
}); };
exports.listEntryImages = listEntryImages;
var getListEntryImagesQueryKey = function (pathCode, entrySlug) {
    return ['v1', 'paths', pathCode, 'entries', entrySlug, 'images'];
};
exports.getListEntryImagesQueryKey = getListEntryImagesQueryKey;
var getListEntryImagesQueryOptions = function (pathCode, entrySlug, options) {
    var _a = options !== null && options !== void 0 ? options : {}, queryOptions = _a.query, requestOptions = _a.request;
    var queryKey = (0, exports.getListEntryImagesQueryKey)(pathCode, entrySlug);
    var queryFn = function (_a) {
        var signal = _a.signal;
        return (0, exports.listEntryImages)((0, vue_1.unref)(pathCode), (0, vue_1.unref)(entrySlug), __assign({ signal: signal }, requestOptions));
    };
    return __assign({ queryKey: queryKey, queryFn: queryFn, enabled: (0, vue_1.computed)(function () { return !!((0, vue_1.unref)(pathCode) && (0, vue_1.unref)(entrySlug)); }) }, queryOptions);
};
exports.getListEntryImagesQueryOptions = getListEntryImagesQueryOptions;
/**
 * @summary List Entry Images
 */
function useListEntryImages(pathCode, entrySlug, options, queryClient) {
    var queryOptions = (0, exports.getListEntryImagesQueryOptions)(pathCode, entrySlug, options);
    var query = (0, vue_query_1.useQuery)(queryOptions, queryClient);
    query.queryKey = (0, vue_1.unref)(queryOptions).queryKey;
    return query;
}
var getListSubscriptionsUrl = function (pathCode) {
    return "/v1/paths/".concat(pathCode, "/subscriptions");
};
exports.getListSubscriptionsUrl = getListSubscriptionsUrl;
var listSubscriptions = function (pathCode, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getListSubscriptionsUrl)(pathCode), __assign(__assign({}, options), { method: 'GET' }))];
    });
}); };
exports.listSubscriptions = listSubscriptions;
var getListSubscriptionsQueryKey = function (pathCode) {
    return ['v1', 'paths', pathCode, 'subscriptions'];
};
exports.getListSubscriptionsQueryKey = getListSubscriptionsQueryKey;
var getListSubscriptionsQueryOptions = function (pathCode, options) {
    var _a = options !== null && options !== void 0 ? options : {}, queryOptions = _a.query, requestOptions = _a.request;
    var queryKey = (0, exports.getListSubscriptionsQueryKey)(pathCode);
    var queryFn = function (_a) {
        var signal = _a.signal;
        return (0, exports.listSubscriptions)((0, vue_1.unref)(pathCode), __assign({ signal: signal }, requestOptions));
    };
    return __assign({ queryKey: queryKey, queryFn: queryFn, enabled: (0, vue_1.computed)(function () { return !!(0, vue_1.unref)(pathCode); }) }, queryOptions);
};
exports.getListSubscriptionsQueryOptions = getListSubscriptionsQueryOptions;
/**
 * @summary List Subscriptions
 */
function useListSubscriptions(pathCode, options, queryClient) {
    var queryOptions = (0, exports.getListSubscriptionsQueryOptions)(pathCode, options);
    var query = (0, vue_query_1.useQuery)(queryOptions, queryClient);
    query.queryKey = (0, vue_1.unref)(queryOptions).queryKey;
    return query;
}
var getInviteSubscriberUrl = function (pathCode) {
    return "/v1/paths/".concat(pathCode, "/subscriptions");
};
exports.getInviteSubscriberUrl = getInviteSubscriberUrl;
var inviteSubscriber = function (pathCode, subscriptionInviteRequest, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getInviteSubscriberUrl)(pathCode), __assign(__assign({}, options), { method: 'POST', headers: __assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers), body: JSON.stringify(subscriptionInviteRequest) }))];
    });
}); };
exports.inviteSubscriber = inviteSubscriber;
var getInviteSubscriberMutationOptions = function (options) {
    var mutationKey = ['inviteSubscriber'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var _a = props !== null && props !== void 0 ? props : {}, pathCode = _a.pathCode, data = _a.data;
        return (0, exports.inviteSubscriber)(pathCode, data, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getInviteSubscriberMutationOptions = getInviteSubscriberMutationOptions;
/**
 * @summary Invite Subscriber
 */
var useInviteSubscriber = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getInviteSubscriberMutationOptions)(options), queryClient);
};
exports.useInviteSubscriber = useInviteSubscriber;
var getDeleteSubscriptionUrl = function (pathCode, targetUserId) {
    return "/v1/paths/".concat(pathCode, "/subscriptions/").concat(targetUserId);
};
exports.getDeleteSubscriptionUrl = getDeleteSubscriptionUrl;
var deleteSubscription = function (pathCode, targetUserId, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getDeleteSubscriptionUrl)(pathCode, targetUserId), __assign(__assign({}, options), { method: 'DELETE' }))];
    });
}); };
exports.deleteSubscription = deleteSubscription;
var getDeleteSubscriptionMutationOptions = function (options) {
    var mutationKey = ['deleteSubscription'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var _a = props !== null && props !== void 0 ? props : {}, pathCode = _a.pathCode, targetUserId = _a.targetUserId;
        return (0, exports.deleteSubscription)(pathCode, targetUserId, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getDeleteSubscriptionMutationOptions = getDeleteSubscriptionMutationOptions;
/**
 * @summary Delete Subscription
 */
var useDeleteSubscription = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getDeleteSubscriptionMutationOptions)(options), queryClient);
};
exports.useDeleteSubscription = useDeleteSubscription;
var getAdminLoginUrl = function () {
    return "/v1/admin/login";
};
exports.getAdminLoginUrl = getAdminLoginUrl;
var adminLogin = function (adminLoginRequest, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getAdminLoginUrl)(), __assign(__assign({}, options), { method: 'POST', headers: __assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers), body: JSON.stringify(adminLoginRequest) }))];
    });
}); };
exports.adminLogin = adminLogin;
var getAdminLoginMutationOptions = function (options) {
    var mutationKey = ['adminLogin'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var data = (props !== null && props !== void 0 ? props : {}).data;
        return (0, exports.adminLogin)(data, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getAdminLoginMutationOptions = getAdminLoginMutationOptions;
/**
 * @summary Admin Login
 */
var useAdminLogin = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getAdminLoginMutationOptions)(options), queryClient);
};
exports.useAdminLogin = useAdminLogin;
var getSetPathCreationApprovalUrl = function (userId) {
    return "/v1/admin/users/".concat(userId, "/path-creation-approval");
};
exports.getSetPathCreationApprovalUrl = getSetPathCreationApprovalUrl;
var setPathCreationApproval = function (userId, pathCreationApprovalRequest, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getSetPathCreationApprovalUrl)(userId), __assign(__assign({}, options), { method: 'PUT', headers: __assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers), body: JSON.stringify(pathCreationApprovalRequest) }))];
    });
}); };
exports.setPathCreationApproval = setPathCreationApproval;
var getSetPathCreationApprovalMutationOptions = function (options) {
    var mutationKey = ['setPathCreationApproval'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var _a = props !== null && props !== void 0 ? props : {}, userId = _a.userId, data = _a.data;
        return (0, exports.setPathCreationApproval)(userId, data, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getSetPathCreationApprovalMutationOptions = getSetPathCreationApprovalMutationOptions;
/**
 * @summary Set Path Creation Approval
 */
var useSetPathCreationApproval = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getSetPathCreationApprovalMutationOptions)(options), queryClient);
};
exports.useSetPathCreationApproval = useSetPathCreationApproval;
var getGetProfileUrl = function () {
    return "/v1/account/profile";
};
exports.getGetProfileUrl = getGetProfileUrl;
var getProfile = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getGetProfileUrl)(), __assign(__assign({}, options), { method: 'GET' }))];
    });
}); };
exports.getProfile = getProfile;
var getGetProfileQueryKey = function () {
    return ['v1', 'account', 'profile'];
};
exports.getGetProfileQueryKey = getGetProfileQueryKey;
var getGetProfileQueryOptions = function (options) {
    var _a = options !== null && options !== void 0 ? options : {}, queryOptions = _a.query, requestOptions = _a.request;
    var queryKey = (0, exports.getGetProfileQueryKey)();
    var queryFn = function (_a) {
        var signal = _a.signal;
        return (0, exports.getProfile)(__assign({ signal: signal }, requestOptions));
    };
    return __assign({ queryKey: queryKey, queryFn: queryFn }, queryOptions);
};
exports.getGetProfileQueryOptions = getGetProfileQueryOptions;
/**
 * @summary Get Profile
 */
function useGetProfile(options, queryClient) {
    var queryOptions = (0, exports.getGetProfileQueryOptions)(options);
    var query = (0, vue_query_1.useQuery)(queryOptions, queryClient);
    query.queryKey = (0, vue_1.unref)(queryOptions).queryKey;
    return query;
}
var getUpdateDisplayNameUrl = function () {
    return "/v1/account/display-name";
};
exports.getUpdateDisplayNameUrl = getUpdateDisplayNameUrl;
var updateDisplayName = function (userDisplayNameUpdateRequest, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getUpdateDisplayNameUrl)(), __assign(__assign({}, options), { method: 'PATCH', headers: __assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers), body: JSON.stringify(userDisplayNameUpdateRequest) }))];
    });
}); };
exports.updateDisplayName = updateDisplayName;
var getUpdateDisplayNameMutationOptions = function (options) {
    var mutationKey = ['updateDisplayName'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var data = (props !== null && props !== void 0 ? props : {}).data;
        return (0, exports.updateDisplayName)(data, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getUpdateDisplayNameMutationOptions = getUpdateDisplayNameMutationOptions;
/**
 * @summary Update Display Name
 */
var useUpdateDisplayName = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getUpdateDisplayNameMutationOptions)(options), queryClient);
};
exports.useUpdateDisplayName = useUpdateDisplayName;
var getUpdateSettingsUrl = function () {
    return "/v1/account/settings";
};
exports.getUpdateSettingsUrl = getUpdateSettingsUrl;
var updateSettings = function (userSettingsUpdateRequest, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getUpdateSettingsUrl)(), __assign(__assign({}, options), { method: 'PATCH', headers: __assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers), body: JSON.stringify(userSettingsUpdateRequest) }))];
    });
}); };
exports.updateSettings = updateSettings;
var getUpdateSettingsMutationOptions = function (options) {
    var mutationKey = ['updateSettings'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var data = (props !== null && props !== void 0 ? props : {}).data;
        return (0, exports.updateSettings)(data, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getUpdateSettingsMutationOptions = getUpdateSettingsMutationOptions;
/**
 * @summary Update Settings
 */
var useUpdateSettings = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getUpdateSettingsMutationOptions)(options), queryClient);
};
exports.useUpdateSettings = useUpdateSettings;
var getCreateDeletionRequestUrl = function () {
    return "/v1/account/deletion-requests";
};
exports.getCreateDeletionRequestUrl = getCreateDeletionRequestUrl;
var createDeletionRequest = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getCreateDeletionRequestUrl)(), __assign(__assign({}, options), { method: 'POST' }))];
    });
}); };
exports.createDeletionRequest = createDeletionRequest;
var getCreateDeletionRequestMutationOptions = function (options) {
    var mutationKey = ['createDeletionRequest'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function () {
        return (0, exports.createDeletionRequest)(requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getCreateDeletionRequestMutationOptions = getCreateDeletionRequestMutationOptions;
/**
 * @summary Create Deletion Request
 */
var useCreateDeletionRequest = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getCreateDeletionRequestMutationOptions)(options), queryClient);
};
exports.useCreateDeletionRequest = useCreateDeletionRequest;
var getGetLatestDeletionRequestUrl = function () {
    return "/v1/account/deletion-requests/latest";
};
exports.getGetLatestDeletionRequestUrl = getGetLatestDeletionRequestUrl;
var getLatestDeletionRequest = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getGetLatestDeletionRequestUrl)(), __assign(__assign({}, options), { method: 'GET' }))];
    });
}); };
exports.getLatestDeletionRequest = getLatestDeletionRequest;
var getGetLatestDeletionRequestQueryKey = function () {
    return ['v1', 'account', 'deletion-requests', 'latest'];
};
exports.getGetLatestDeletionRequestQueryKey = getGetLatestDeletionRequestQueryKey;
var getGetLatestDeletionRequestQueryOptions = function (options) {
    var _a = options !== null && options !== void 0 ? options : {}, queryOptions = _a.query, requestOptions = _a.request;
    var queryKey = (0, exports.getGetLatestDeletionRequestQueryKey)();
    var queryFn = function (_a) {
        var signal = _a.signal;
        return (0, exports.getLatestDeletionRequest)(__assign({ signal: signal }, requestOptions));
    };
    return __assign({ queryKey: queryKey, queryFn: queryFn }, queryOptions);
};
exports.getGetLatestDeletionRequestQueryOptions = getGetLatestDeletionRequestQueryOptions;
/**
 * @summary Latest Deletion Request
 */
function useGetLatestDeletionRequest(options, queryClient) {
    var queryOptions = (0, exports.getGetLatestDeletionRequestQueryOptions)(options);
    var query = (0, vue_query_1.useQuery)(queryOptions, queryClient);
    query.queryKey = (0, vue_1.unref)(queryOptions).queryKey;
    return query;
}
var getCompleteImageUploadUrl = function (imageId) {
    return "/v1/images/".concat(imageId, "/complete");
};
exports.getCompleteImageUploadUrl = getCompleteImageUploadUrl;
var completeImageUpload = function (imageId, imageCompleteRequest, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getCompleteImageUploadUrl)(imageId), __assign(__assign({}, options), { method: 'POST', headers: __assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers), body: JSON.stringify(imageCompleteRequest) }))];
    });
}); };
exports.completeImageUpload = completeImageUpload;
var getCompleteImageUploadMutationOptions = function (options) {
    var mutationKey = ['completeImageUpload'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var _a = props !== null && props !== void 0 ? props : {}, imageId = _a.imageId, data = _a.data;
        return (0, exports.completeImageUpload)(imageId, data, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getCompleteImageUploadMutationOptions = getCompleteImageUploadMutationOptions;
/**
 * @summary Complete Image Upload
 */
var useCompleteImageUpload = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getCompleteImageUploadMutationOptions)(options), queryClient);
};
exports.useCompleteImageUpload = useCompleteImageUpload;
var getGetImageDownloadUrlUrl = function (imageId) {
    return "/v1/images/".concat(imageId, "/download-url");
};
exports.getGetImageDownloadUrlUrl = getGetImageDownloadUrlUrl;
var getImageDownloadUrl = function (imageId, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getGetImageDownloadUrlUrl)(imageId), __assign(__assign({}, options), { method: 'GET' }))];
    });
}); };
exports.getImageDownloadUrl = getImageDownloadUrl;
var getGetImageDownloadUrlQueryKey = function (imageId) {
    return ['v1', 'images', imageId, 'download-url'];
};
exports.getGetImageDownloadUrlQueryKey = getGetImageDownloadUrlQueryKey;
var getGetImageDownloadUrlQueryOptions = function (imageId, options) {
    var _a = options !== null && options !== void 0 ? options : {}, queryOptions = _a.query, requestOptions = _a.request;
    var queryKey = (0, exports.getGetImageDownloadUrlQueryKey)(imageId);
    var queryFn = function (_a) {
        var signal = _a.signal;
        return (0, exports.getImageDownloadUrl)((0, vue_1.unref)(imageId), __assign({ signal: signal }, requestOptions));
    };
    return __assign({ queryKey: queryKey, queryFn: queryFn, enabled: (0, vue_1.computed)(function () { return !!(0, vue_1.unref)(imageId); }) }, queryOptions);
};
exports.getGetImageDownloadUrlQueryOptions = getGetImageDownloadUrlQueryOptions;
/**
 * @summary Get Image Download Url
 */
function useGetImageDownloadUrl(imageId, options, queryClient) {
    var queryOptions = (0, exports.getGetImageDownloadUrlQueryOptions)(imageId, options);
    var query = (0, vue_query_1.useQuery)(queryOptions, queryClient);
    query.queryKey = (0, vue_1.unref)(queryOptions).queryKey;
    return query;
}
var getCreateExportUrl = function () {
    return "/v1/exports";
};
exports.getCreateExportUrl = getCreateExportUrl;
var createExport = function (exportCreateRequest, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getCreateExportUrl)(), __assign(__assign({}, options), { method: 'POST', headers: __assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers), body: JSON.stringify(exportCreateRequest) }))];
    });
}); };
exports.createExport = createExport;
var getCreateExportMutationOptions = function (options) {
    var mutationKey = ['createExport'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var data = (props !== null && props !== void 0 ? props : {}).data;
        return (0, exports.createExport)(data, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getCreateExportMutationOptions = getCreateExportMutationOptions;
/**
 * @summary Create Export
 */
var useCreateExport = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getCreateExportMutationOptions)(options), queryClient);
};
exports.useCreateExport = useCreateExport;
var getGetExportUrl = function (exportId) {
    return "/v1/exports/".concat(exportId);
};
exports.getGetExportUrl = getGetExportUrl;
var getExport = function (exportId, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getGetExportUrl)(exportId), __assign(__assign({}, options), { method: 'GET' }))];
    });
}); };
exports.getExport = getExport;
var getGetExportQueryKey = function (exportId) {
    return ['v1', 'exports', exportId];
};
exports.getGetExportQueryKey = getGetExportQueryKey;
var getGetExportQueryOptions = function (exportId, options) {
    var _a = options !== null && options !== void 0 ? options : {}, queryOptions = _a.query, requestOptions = _a.request;
    var queryKey = (0, exports.getGetExportQueryKey)(exportId);
    var queryFn = function (_a) {
        var signal = _a.signal;
        return (0, exports.getExport)((0, vue_1.unref)(exportId), __assign({ signal: signal }, requestOptions));
    };
    return __assign({ queryKey: queryKey, queryFn: queryFn, enabled: (0, vue_1.computed)(function () { return !!(0, vue_1.unref)(exportId); }) }, queryOptions);
};
exports.getGetExportQueryOptions = getGetExportQueryOptions;
/**
 * @summary Get Export
 */
function useGetExport(exportId, options, queryClient) {
    var queryOptions = (0, exports.getGetExportQueryOptions)(exportId, options);
    var query = (0, vue_query_1.useQuery)(queryOptions, queryClient);
    query.queryKey = (0, vue_1.unref)(queryOptions).queryKey;
    return query;
}
var getDownloadExportJsonUrl = function (exportId) {
    return "/v1/exports/".concat(exportId, "/download/json");
};
exports.getDownloadExportJsonUrl = getDownloadExportJsonUrl;
var downloadExportJson = function (exportId, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getDownloadExportJsonUrl)(exportId), __assign(__assign({}, options), { method: 'GET' }))];
    });
}); };
exports.downloadExportJson = downloadExportJson;
var getDownloadExportJsonQueryKey = function (exportId) {
    return ['v1', 'exports', exportId, 'download', 'json'];
};
exports.getDownloadExportJsonQueryKey = getDownloadExportJsonQueryKey;
var getDownloadExportJsonQueryOptions = function (exportId, options) {
    var _a = options !== null && options !== void 0 ? options : {}, queryOptions = _a.query, requestOptions = _a.request;
    var queryKey = (0, exports.getDownloadExportJsonQueryKey)(exportId);
    var queryFn = function (_a) {
        var signal = _a.signal;
        return (0, exports.downloadExportJson)((0, vue_1.unref)(exportId), __assign({ signal: signal }, requestOptions));
    };
    return __assign({ queryKey: queryKey, queryFn: queryFn, enabled: (0, vue_1.computed)(function () { return !!(0, vue_1.unref)(exportId); }) }, queryOptions);
};
exports.getDownloadExportJsonQueryOptions = getDownloadExportJsonQueryOptions;
/**
 * @summary Download Json
 */
function useDownloadExportJson(exportId, options, queryClient) {
    var queryOptions = (0, exports.getDownloadExportJsonQueryOptions)(exportId, options);
    var query = (0, vue_query_1.useQuery)(queryOptions, queryClient);
    query.queryKey = (0, vue_1.unref)(queryOptions).queryKey;
    return query;
}
var getDownloadExportImagesUrl = function (exportId) {
    return "/v1/exports/".concat(exportId, "/download/images");
};
exports.getDownloadExportImagesUrl = getDownloadExportImagesUrl;
var downloadExportImages = function (exportId, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getDownloadExportImagesUrl)(exportId), __assign(__assign({}, options), { method: 'GET' }))];
    });
}); };
exports.downloadExportImages = downloadExportImages;
var getDownloadExportImagesQueryKey = function (exportId) {
    return ['v1', 'exports', exportId, 'download', 'images'];
};
exports.getDownloadExportImagesQueryKey = getDownloadExportImagesQueryKey;
var getDownloadExportImagesQueryOptions = function (exportId, options) {
    var _a = options !== null && options !== void 0 ? options : {}, queryOptions = _a.query, requestOptions = _a.request;
    var queryKey = (0, exports.getDownloadExportImagesQueryKey)(exportId);
    var queryFn = function (_a) {
        var signal = _a.signal;
        return (0, exports.downloadExportImages)((0, vue_1.unref)(exportId), __assign({ signal: signal }, requestOptions));
    };
    return __assign({ queryKey: queryKey, queryFn: queryFn, enabled: (0, vue_1.computed)(function () { return !!(0, vue_1.unref)(exportId); }) }, queryOptions);
};
exports.getDownloadExportImagesQueryOptions = getDownloadExportImagesQueryOptions;
/**
 * @summary Download Images
 */
function useDownloadExportImages(exportId, options, queryClient) {
    var queryOptions = (0, exports.getDownloadExportImagesQueryOptions)(exportId, options);
    var query = (0, vue_query_1.useQuery)(queryOptions, queryClient);
    query.queryKey = (0, vue_1.unref)(queryOptions).queryKey;
    return query;
}
var getAuthLoginUrl = function (params) {
    var normalizedParams = new URLSearchParams();
    Object.entries(params || {}).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        if (value !== undefined) {
            normalizedParams.append(key, value === null ? 'null' : value.toString());
        }
    });
    var stringifiedParams = normalizedParams.toString();
    return stringifiedParams.length > 0
        ? "/v1/auth/login?".concat(stringifiedParams)
        : "/v1/auth/login";
};
exports.getAuthLoginUrl = getAuthLoginUrl;
var authLogin = function (params, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getAuthLoginUrl)(params), __assign(__assign({}, options), { method: 'GET' }))];
    });
}); };
exports.authLogin = authLogin;
var getAuthLoginQueryKey = function (params) {
    return __spreadArray(['v1', 'auth', 'login'], (params ? [params] : []), true);
};
exports.getAuthLoginQueryKey = getAuthLoginQueryKey;
var getAuthLoginQueryOptions = function (params, options) {
    var _a = options !== null && options !== void 0 ? options : {}, queryOptions = _a.query, requestOptions = _a.request;
    var queryKey = (0, exports.getAuthLoginQueryKey)(params);
    var queryFn = function (_a) {
        var signal = _a.signal;
        return (0, exports.authLogin)((0, vue_1.unref)(params), __assign({ signal: signal }, requestOptions));
    };
    return __assign({ queryKey: queryKey, queryFn: queryFn }, queryOptions);
};
exports.getAuthLoginQueryOptions = getAuthLoginQueryOptions;
/**
 * @summary Oauth Login
 */
function useAuthLogin(params, options, queryClient) {
    var queryOptions = (0, exports.getAuthLoginQueryOptions)(params, options);
    var query = (0, vue_query_1.useQuery)(queryOptions, queryClient);
    query.queryKey = (0, vue_1.unref)(queryOptions).queryKey;
    return query;
}
var getAuthCallbackUrl = function () {
    return "/v1/auth/callback";
};
exports.getAuthCallbackUrl = getAuthCallbackUrl;
var authCallback = function (oAuthCallbackRequest, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getAuthCallbackUrl)(), __assign(__assign({}, options), { method: 'POST', headers: __assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers), body: JSON.stringify(oAuthCallbackRequest) }))];
    });
}); };
exports.authCallback = authCallback;
var getAuthCallbackMutationOptions = function (options) {
    var mutationKey = ['authCallback'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var data = (props !== null && props !== void 0 ? props : {}).data;
        return (0, exports.authCallback)(data, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getAuthCallbackMutationOptions = getAuthCallbackMutationOptions;
/**
 * @summary Oauth Callback
 */
var useAuthCallback = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getAuthCallbackMutationOptions)(options), queryClient);
};
exports.useAuthCallback = useAuthCallback;
var getAuthCallbackRedirectUrl = function (params) {
    var normalizedParams = new URLSearchParams();
    Object.entries(params || {}).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        if (value !== undefined) {
            normalizedParams.append(key, value === null ? 'null' : value.toString());
        }
    });
    var stringifiedParams = normalizedParams.toString();
    return stringifiedParams.length > 0
        ? "/v1/auth/callback?".concat(stringifiedParams)
        : "/v1/auth/callback";
};
exports.getAuthCallbackRedirectUrl = getAuthCallbackRedirectUrl;
var authCallbackRedirect = function (params, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getAuthCallbackRedirectUrl)(params), __assign(__assign({}, options), { method: 'GET' }))];
    });
}); };
exports.authCallbackRedirect = authCallbackRedirect;
var getAuthCallbackRedirectQueryKey = function (params) {
    return __spreadArray(['v1', 'auth', 'callback'], (params ? [params] : []), true);
};
exports.getAuthCallbackRedirectQueryKey = getAuthCallbackRedirectQueryKey;
var getAuthCallbackRedirectQueryOptions = function (params, options) {
    var _a = options !== null && options !== void 0 ? options : {}, queryOptions = _a.query, requestOptions = _a.request;
    var queryKey = (0, exports.getAuthCallbackRedirectQueryKey)(params);
    var queryFn = function (_a) {
        var signal = _a.signal;
        return (0, exports.authCallbackRedirect)((0, vue_1.unref)(params), __assign({ signal: signal }, requestOptions));
    };
    return __assign({ queryKey: queryKey, queryFn: queryFn }, queryOptions);
};
exports.getAuthCallbackRedirectQueryOptions = getAuthCallbackRedirectQueryOptions;
/**
 * @summary Oauth Callback Get
 */
function useAuthCallbackRedirect(params, options, queryClient) {
    var queryOptions = (0, exports.getAuthCallbackRedirectQueryOptions)(params, options);
    var query = (0, vue_query_1.useQuery)(queryOptions, queryClient);
    query.queryKey = (0, vue_1.unref)(queryOptions).queryKey;
    return query;
}
var getListInvitationsUrl = function () {
    return "/v1/invitations";
};
exports.getListInvitationsUrl = getListInvitationsUrl;
var listInvitations = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getListInvitationsUrl)(), __assign(__assign({}, options), { method: 'GET' }))];
    });
}); };
exports.listInvitations = listInvitations;
var getListInvitationsQueryKey = function () {
    return ['v1', 'invitations'];
};
exports.getListInvitationsQueryKey = getListInvitationsQueryKey;
var getListInvitationsQueryOptions = function (options) {
    var _a = options !== null && options !== void 0 ? options : {}, queryOptions = _a.query, requestOptions = _a.request;
    var queryKey = (0, exports.getListInvitationsQueryKey)();
    var queryFn = function (_a) {
        var signal = _a.signal;
        return (0, exports.listInvitations)(__assign({ signal: signal }, requestOptions));
    };
    return __assign({ queryKey: queryKey, queryFn: queryFn }, queryOptions);
};
exports.getListInvitationsQueryOptions = getListInvitationsQueryOptions;
/**
 * @summary List Invitations
 */
function useListInvitations(options, queryClient) {
    var queryOptions = (0, exports.getListInvitationsQueryOptions)(options);
    var query = (0, vue_query_1.useQuery)(queryOptions, queryClient);
    query.queryKey = (0, vue_1.unref)(queryOptions).queryKey;
    return query;
}
var getAcceptInvitationUrl = function (invitationId) {
    return "/v1/invitations/".concat(invitationId, "/accept");
};
exports.getAcceptInvitationUrl = getAcceptInvitationUrl;
var acceptInvitation = function (invitationId, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getAcceptInvitationUrl)(invitationId), __assign(__assign({}, options), { method: 'POST' }))];
    });
}); };
exports.acceptInvitation = acceptInvitation;
var getAcceptInvitationMutationOptions = function (options) {
    var mutationKey = ['acceptInvitation'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var invitationId = (props !== null && props !== void 0 ? props : {}).invitationId;
        return (0, exports.acceptInvitation)(invitationId, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getAcceptInvitationMutationOptions = getAcceptInvitationMutationOptions;
/**
 * @summary Accept Invitation
 */
var useAcceptInvitation = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getAcceptInvitationMutationOptions)(options), queryClient);
};
exports.useAcceptInvitation = useAcceptInvitation;
var getIgnoreInvitationUrl = function (invitationId) {
    return "/v1/invitations/".concat(invitationId, "/ignore");
};
exports.getIgnoreInvitationUrl = getIgnoreInvitationUrl;
var ignoreInvitation = function (invitationId, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getIgnoreInvitationUrl)(invitationId), __assign(__assign({}, options), { method: 'POST' }))];
    });
}); };
exports.ignoreInvitation = ignoreInvitation;
var getIgnoreInvitationMutationOptions = function (options) {
    var mutationKey = ['ignoreInvitation'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var invitationId = (props !== null && props !== void 0 ? props : {}).invitationId;
        return (0, exports.ignoreInvitation)(invitationId, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getIgnoreInvitationMutationOptions = getIgnoreInvitationMutationOptions;
/**
 * @summary Ignore Invitation
 */
var useIgnoreInvitation = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getIgnoreInvitationMutationOptions)(options), queryClient);
};
exports.useIgnoreInvitation = useIgnoreInvitation;
var getListBlocklistUrl = function () {
    return "/v1/invitations/blocklist";
};
exports.getListBlocklistUrl = getListBlocklistUrl;
var listBlocklist = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getListBlocklistUrl)(), __assign(__assign({}, options), { method: 'GET' }))];
    });
}); };
exports.listBlocklist = listBlocklist;
var getListBlocklistQueryKey = function () {
    return ['v1', 'invitations', 'blocklist'];
};
exports.getListBlocklistQueryKey = getListBlocklistQueryKey;
var getListBlocklistQueryOptions = function (options) {
    var _a = options !== null && options !== void 0 ? options : {}, queryOptions = _a.query, requestOptions = _a.request;
    var queryKey = (0, exports.getListBlocklistQueryKey)();
    var queryFn = function (_a) {
        var signal = _a.signal;
        return (0, exports.listBlocklist)(__assign({ signal: signal }, requestOptions));
    };
    return __assign({ queryKey: queryKey, queryFn: queryFn }, queryOptions);
};
exports.getListBlocklistQueryOptions = getListBlocklistQueryOptions;
/**
 * @summary List Blocklist
 */
function useListBlocklist(options, queryClient) {
    var queryOptions = (0, exports.getListBlocklistQueryOptions)(options);
    var query = (0, vue_query_1.useQuery)(queryOptions, queryClient);
    query.queryKey = (0, vue_1.unref)(queryOptions).queryKey;
    return query;
}
var getBlockInviterUrl = function () {
    return "/v1/invitations/blocklist";
};
exports.getBlockInviterUrl = getBlockInviterUrl;
var blockInviter = function (blocklistAddRequest, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getBlockInviterUrl)(), __assign(__assign({}, options), { method: 'POST', headers: __assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers), body: JSON.stringify(blocklistAddRequest) }))];
    });
}); };
exports.blockInviter = blockInviter;
var getBlockInviterMutationOptions = function (options) {
    var mutationKey = ['blockInviter'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var data = (props !== null && props !== void 0 ? props : {}).data;
        return (0, exports.blockInviter)(data, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getBlockInviterMutationOptions = getBlockInviterMutationOptions;
/**
 * @summary Block Inviter
 */
var useBlockInviter = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getBlockInviterMutationOptions)(options), queryClient);
};
exports.useBlockInviter = useBlockInviter;
var getUnblockUserUrl = function (blockedUserId) {
    return "/v1/invitations/blocklist/".concat(blockedUserId);
};
exports.getUnblockUserUrl = getUnblockUserUrl;
var unblockUser = function (blockedUserId, options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getUnblockUserUrl)(blockedUserId), __assign(__assign({}, options), { method: 'DELETE' }))];
    });
}); };
exports.unblockUser = unblockUser;
var getUnblockUserMutationOptions = function (options) {
    var mutationKey = ['unblockUser'];
    var _a = options
        ? options.mutation &&
            'mutationKey' in options.mutation &&
            options.mutation.mutationKey
            ? options
            : __assign(__assign({}, options), { mutation: __assign(__assign({}, options.mutation), { mutationKey: mutationKey }) })
        : { mutation: { mutationKey: mutationKey }, request: undefined }, mutationOptions = _a.mutation, requestOptions = _a.request;
    var mutationFn = function (props) {
        var blockedUserId = (props !== null && props !== void 0 ? props : {}).blockedUserId;
        return (0, exports.unblockUser)(blockedUserId, requestOptions);
    };
    return __assign({ mutationFn: mutationFn }, mutationOptions);
};
exports.getUnblockUserMutationOptions = getUnblockUserMutationOptions;
/**
 * @summary Unblock User
 */
var useUnblockUser = function (options, queryClient) {
    return (0, vue_query_1.useMutation)((0, exports.getUnblockUserMutationOptions)(options), queryClient);
};
exports.useUnblockUser = useUnblockUser;
var getRootUrl = function () {
    return "/";
};
exports.getRootUrl = getRootUrl;
var root = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, customFetch_1.customFetch)((0, exports.getRootUrl)(), __assign(__assign({}, options), { method: 'GET' }))];
    });
}); };
exports.root = root;
var getRootQueryKey = function () {
    return [];
};
exports.getRootQueryKey = getRootQueryKey;
var getRootQueryOptions = function (options) {
    var _a = options !== null && options !== void 0 ? options : {}, queryOptions = _a.query, requestOptions = _a.request;
    var queryKey = (0, exports.getRootQueryKey)();
    var queryFn = function (_a) {
        var signal = _a.signal;
        return (0, exports.root)(__assign({ signal: signal }, requestOptions));
    };
    return __assign({ queryKey: queryKey, queryFn: queryFn }, queryOptions);
};
exports.getRootQueryOptions = getRootQueryOptions;
/**
 * @summary Root
 */
function useRoot(options, queryClient) {
    var queryOptions = (0, exports.getRootQueryOptions)(options);
    var query = (0, vue_query_1.useQuery)(queryOptions, queryClient);
    query.queryKey = (0, vue_1.unref)(queryOptions).queryKey;
    return query;
}
var getHealthResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ status: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), service: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), db: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), s3: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }) }, overrideResponse));
};
exports.getHealthResponseMock = getHealthResponseMock;
var getListPathsResponseMock = function () {
    return Array.from({ length: faker_1.faker.number.int({ min: 1, max: 10 }) }, function (_, i) { return i + 1; }).map(function () { return ({
        path_id: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
        uuid: faker_1.faker.string.uuid(),
        owner_user_id: faker_1.faker.string.uuid(),
        title: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
        description: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]),
        color: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
        is_public: faker_1.faker.datatype.boolean(),
        created_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z',
        updated_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z',
    }); });
};
exports.getListPathsResponseMock = getListPathsResponseMock;
var getCreatePathResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ path_id: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), uuid: faker_1.faker.string.uuid(), owner_user_id: faker_1.faker.string.uuid(), title: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), description: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]), color: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), is_public: faker_1.faker.datatype.boolean(), created_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z' }, overrideResponse));
};
exports.getCreatePathResponseMock = getCreatePathResponseMock;
var getUpdatePathResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ path_id: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), uuid: faker_1.faker.string.uuid(), owner_user_id: faker_1.faker.string.uuid(), title: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), description: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]), color: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), is_public: faker_1.faker.datatype.boolean(), created_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z' }, overrideResponse));
};
exports.getUpdatePathResponseMock = getUpdatePathResponseMock;
var getUpdatePathVisibilityResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ path_id: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), uuid: faker_1.faker.string.uuid(), owner_user_id: faker_1.faker.string.uuid(), title: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), description: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]), color: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), is_public: faker_1.faker.datatype.boolean(), created_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z' }, overrideResponse));
};
exports.getUpdatePathVisibilityResponseMock = getUpdatePathVisibilityResponseMock;
var getStartCreateEntryDraftResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ id: faker_1.faker.string.uuid(), mode: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), state: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), path_id: faker_1.faker.string.uuid(), entry_id: faker_1.faker.helpers.arrayElement([faker_1.faker.string.uuid(), null]), day: faker_1.faker.date.past().toISOString().slice(0, 10), content: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), based_on_edit_id: faker_1.faker.helpers.arrayElement([faker_1.faker.number.int(), null]), images: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 10 }) }, function (_, i) { return i + 1; }).map(function () { return ({
            id: faker_1.faker.string.uuid(),
            draft_id: faker_1.faker.string.uuid(),
            source: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            live_image_id: faker_1.faker.helpers.arrayElement([faker_1.faker.string.uuid(), null]),
            filename: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            status: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            content_type: faker_1.faker.helpers.arrayElement([
                faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
                null,
            ]),
            strip_metadata: faker_1.faker.datatype.boolean(),
            byte_size: faker_1.faker.helpers.arrayElement([faker_1.faker.number.int(), null]),
            client_image_id: faker_1.faker.helpers.arrayElement([
                faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
                null,
            ]),
        }); }), expires_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z' }, overrideResponse));
};
exports.getStartCreateEntryDraftResponseMock = getStartCreateEntryDraftResponseMock;
var getStartEditEntryDraftResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ id: faker_1.faker.string.uuid(), mode: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), state: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), path_id: faker_1.faker.string.uuid(), entry_id: faker_1.faker.helpers.arrayElement([faker_1.faker.string.uuid(), null]), day: faker_1.faker.date.past().toISOString().slice(0, 10), content: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), based_on_edit_id: faker_1.faker.helpers.arrayElement([faker_1.faker.number.int(), null]), images: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 10 }) }, function (_, i) { return i + 1; }).map(function () { return ({
            id: faker_1.faker.string.uuid(),
            draft_id: faker_1.faker.string.uuid(),
            source: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            live_image_id: faker_1.faker.helpers.arrayElement([faker_1.faker.string.uuid(), null]),
            filename: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            status: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            content_type: faker_1.faker.helpers.arrayElement([
                faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
                null,
            ]),
            strip_metadata: faker_1.faker.datatype.boolean(),
            byte_size: faker_1.faker.helpers.arrayElement([faker_1.faker.number.int(), null]),
            client_image_id: faker_1.faker.helpers.arrayElement([
                faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
                null,
            ]),
        }); }), expires_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z' }, overrideResponse));
};
exports.getStartEditEntryDraftResponseMock = getStartEditEntryDraftResponseMock;
var getGetEntryDraftResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ id: faker_1.faker.string.uuid(), mode: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), state: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), path_id: faker_1.faker.string.uuid(), entry_id: faker_1.faker.helpers.arrayElement([faker_1.faker.string.uuid(), null]), day: faker_1.faker.date.past().toISOString().slice(0, 10), content: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), based_on_edit_id: faker_1.faker.helpers.arrayElement([faker_1.faker.number.int(), null]), images: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 10 }) }, function (_, i) { return i + 1; }).map(function () { return ({
            id: faker_1.faker.string.uuid(),
            draft_id: faker_1.faker.string.uuid(),
            source: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            live_image_id: faker_1.faker.helpers.arrayElement([faker_1.faker.string.uuid(), null]),
            filename: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            status: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            content_type: faker_1.faker.helpers.arrayElement([
                faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
                null,
            ]),
            strip_metadata: faker_1.faker.datatype.boolean(),
            byte_size: faker_1.faker.helpers.arrayElement([faker_1.faker.number.int(), null]),
            client_image_id: faker_1.faker.helpers.arrayElement([
                faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
                null,
            ]),
        }); }), expires_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z' }, overrideResponse));
};
exports.getGetEntryDraftResponseMock = getGetEntryDraftResponseMock;
var getPatchEntryDraftResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ id: faker_1.faker.string.uuid(), mode: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), state: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), path_id: faker_1.faker.string.uuid(), entry_id: faker_1.faker.helpers.arrayElement([faker_1.faker.string.uuid(), null]), day: faker_1.faker.date.past().toISOString().slice(0, 10), content: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), based_on_edit_id: faker_1.faker.helpers.arrayElement([faker_1.faker.number.int(), null]), images: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 10 }) }, function (_, i) { return i + 1; }).map(function () { return ({
            id: faker_1.faker.string.uuid(),
            draft_id: faker_1.faker.string.uuid(),
            source: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            live_image_id: faker_1.faker.helpers.arrayElement([faker_1.faker.string.uuid(), null]),
            filename: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            status: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            content_type: faker_1.faker.helpers.arrayElement([
                faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
                null,
            ]),
            strip_metadata: faker_1.faker.datatype.boolean(),
            byte_size: faker_1.faker.helpers.arrayElement([faker_1.faker.number.int(), null]),
            client_image_id: faker_1.faker.helpers.arrayElement([
                faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
                null,
            ]),
        }); }), expires_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z' }, overrideResponse));
};
exports.getPatchEntryDraftResponseMock = getPatchEntryDraftResponseMock;
var getCreateDraftImageSlotResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ id: faker_1.faker.string.uuid(), draft_id: faker_1.faker.string.uuid(), source: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), filename: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), status: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), content_type: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]), strip_metadata: faker_1.faker.datatype.boolean(), client_image_id: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]), upload_url: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), expires_in_seconds: faker_1.faker.number.int() }, overrideResponse));
};
exports.getCreateDraftImageSlotResponseMock = getCreateDraftImageSlotResponseMock;
var getCompleteDraftImageUploadResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ id: faker_1.faker.string.uuid(), draft_id: faker_1.faker.string.uuid(), source: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), live_image_id: faker_1.faker.helpers.arrayElement([faker_1.faker.string.uuid(), null]), filename: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), status: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), content_type: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]), strip_metadata: faker_1.faker.datatype.boolean(), byte_size: faker_1.faker.helpers.arrayElement([faker_1.faker.number.int(), null]), client_image_id: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]) }, overrideResponse));
};
exports.getCompleteDraftImageUploadResponseMock = getCompleteDraftImageUploadResponseMock;
var getRetryDraftImageUploadResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ id: faker_1.faker.string.uuid(), draft_id: faker_1.faker.string.uuid(), source: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), filename: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), status: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), content_type: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]), strip_metadata: faker_1.faker.datatype.boolean(), client_image_id: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]), upload_url: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), expires_in_seconds: faker_1.faker.number.int() }, overrideResponse));
};
exports.getRetryDraftImageUploadResponseMock = getRetryDraftImageUploadResponseMock;
var getRemoveDraftImageResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ id: faker_1.faker.string.uuid(), draft_id: faker_1.faker.string.uuid(), source: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), live_image_id: faker_1.faker.helpers.arrayElement([faker_1.faker.string.uuid(), null]), filename: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), status: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), content_type: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]), strip_metadata: faker_1.faker.datatype.boolean(), byte_size: faker_1.faker.helpers.arrayElement([faker_1.faker.number.int(), null]), client_image_id: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]) }, overrideResponse));
};
exports.getRemoveDraftImageResponseMock = getRemoveDraftImageResponseMock;
var getCommitEntryDraftResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ id: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), path_id: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), day: faker_1.faker.date.past().toISOString().slice(0, 10), edit_id: faker_1.faker.number.int(), content: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), image_filenames: faker_1.faker.helpers.arrayElement([
            Array.from({ length: faker_1.faker.number.int({ min: 1, max: 10 }) }, function (_, i) { return i + 1; }).map(function () { return faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }); }),
            undefined,
        ]) }, overrideResponse));
};
exports.getCommitEntryDraftResponseMock = getCommitEntryDraftResponseMock;
var getListEntriesResponseMock = function () {
    return Array.from({ length: faker_1.faker.number.int({ min: 1, max: 10 }) }, function (_, i) { return i + 1; }).map(function () { return ({
        id: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
        path_id: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
        day: faker_1.faker.date.past().toISOString().slice(0, 10),
        edit_id: faker_1.faker.number.int(),
    }); });
};
exports.getListEntriesResponseMock = getListEntriesResponseMock;
var getCreateEntryResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ id: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), path_id: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), day: faker_1.faker.date.past().toISOString().slice(0, 10), edit_id: faker_1.faker.number.int() }, overrideResponse));
};
exports.getCreateEntryResponseMock = getCreateEntryResponseMock;
var getGetEntryResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ id: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), path_id: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), day: faker_1.faker.date.past().toISOString().slice(0, 10), edit_id: faker_1.faker.number.int(), content: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), image_filenames: faker_1.faker.helpers.arrayElement([
            Array.from({ length: faker_1.faker.number.int({ min: 1, max: 10 }) }, function (_, i) { return i + 1; }).map(function () { return faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }); }),
            undefined,
        ]) }, overrideResponse));
};
exports.getGetEntryResponseMock = getGetEntryResponseMock;
var getUpdateEntryResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ id: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), path_id: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), day: faker_1.faker.date.past().toISOString().slice(0, 10), edit_id: faker_1.faker.number.int() }, overrideResponse));
};
exports.getUpdateEntryResponseMock = getUpdateEntryResponseMock;
var getCreateImageUploadUrlResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ image_id: faker_1.faker.string.uuid(), upload_url: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), expires_in_seconds: faker_1.faker.number.int() }, overrideResponse));
};
exports.getCreateImageUploadUrlResponseMock = getCreateImageUploadUrlResponseMock;
var getListEntryImagesResponseMock = function () {
    return Array.from({ length: faker_1.faker.number.int({ min: 1, max: 10 }) }, function (_, i) { return i + 1; }).map(function () { return ({
        id: faker_1.faker.string.uuid(),
        entry_id: faker_1.faker.string.uuid(),
        filename: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
        status: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
        strip_metadata: faker_1.faker.datatype.boolean(),
        content_type: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]),
        byte_size: faker_1.faker.helpers.arrayElement([faker_1.faker.number.int(), null]),
    }); });
};
exports.getListEntryImagesResponseMock = getListEntryImagesResponseMock;
var getListSubscriptionsResponseMock = function () {
    return Array.from({ length: faker_1.faker.number.int({ min: 1, max: 10 }) }, function (_, i) { return i + 1; }).map(function () { return ({
        user_id: faker_1.faker.string.uuid(),
        email: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]),
        display_name: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]),
    }); });
};
exports.getListSubscriptionsResponseMock = getListSubscriptionsResponseMock;
var getInviteSubscriberResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ invitation_id: faker_1.faker.string.uuid(), status: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }) }, overrideResponse));
};
exports.getInviteSubscriberResponseMock = getInviteSubscriberResponseMock;
var getAdminLoginResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ token: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }) }, overrideResponse));
};
exports.getAdminLoginResponseMock = getAdminLoginResponseMock;
var getSetPathCreationApprovalResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ user_id: faker_1.faker.string.uuid(), allowed: faker_1.faker.datatype.boolean() }, overrideResponse));
};
exports.getSetPathCreationApprovalResponseMock = getSetPathCreationApprovalResponseMock;
var getGetProfileResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ user_id: faker_1.faker.string.uuid(), display_name: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]), settings_json: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]) }, overrideResponse));
};
exports.getGetProfileResponseMock = getGetProfileResponseMock;
var getUpdateDisplayNameResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ user_id: faker_1.faker.string.uuid(), display_name: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]), settings_json: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]) }, overrideResponse));
};
exports.getUpdateDisplayNameResponseMock = getUpdateDisplayNameResponseMock;
var getUpdateSettingsResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ user_id: faker_1.faker.string.uuid(), display_name: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]), settings_json: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]) }, overrideResponse));
};
exports.getUpdateSettingsResponseMock = getUpdateSettingsResponseMock;
var getCreateDeletionRequestResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ id: faker_1.faker.string.uuid(), state: faker_1.faker.helpers.arrayElement([
            'requested',
            'running',
            'complete',
            'failed',
        ]), error_message: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]), failure_code: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]), attempt_count: faker_1.faker.number.int(), created_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z' }, overrideResponse));
};
exports.getCreateDeletionRequestResponseMock = getCreateDeletionRequestResponseMock;
var getGetLatestDeletionRequestResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ id: faker_1.faker.string.uuid(), state: faker_1.faker.helpers.arrayElement([
            'requested',
            'running',
            'complete',
            'failed',
        ]), error_message: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]), failure_code: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]), attempt_count: faker_1.faker.number.int(), created_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z' }, overrideResponse));
};
exports.getGetLatestDeletionRequestResponseMock = getGetLatestDeletionRequestResponseMock;
var getCompleteImageUploadResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ id: faker_1.faker.string.uuid(), entry_id: faker_1.faker.string.uuid(), filename: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), status: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), strip_metadata: faker_1.faker.datatype.boolean(), content_type: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]), byte_size: faker_1.faker.helpers.arrayElement([faker_1.faker.number.int(), null]) }, overrideResponse));
};
exports.getCompleteImageUploadResponseMock = getCompleteImageUploadResponseMock;
var getGetImageDownloadUrlResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ image_url: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), thumbnail_url: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]), expires_in_seconds: faker_1.faker.number.int() }, overrideResponse));
};
exports.getGetImageDownloadUrlResponseMock = getGetImageDownloadUrlResponseMock;
var getCreateExportResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ id: faker_1.faker.string.uuid(), state: faker_1.faker.helpers.arrayElement([
            'queued',
            'running',
            'ready',
            'failed',
            'expired',
            'cleaned',
        ]), requested_path_ids: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 10 }) }, function (_, i) { return i + 1; }).map(function () { return faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }); }), created_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z', expires_at: faker_1.faker.helpers.arrayElement([
            faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z',
            null,
        ]), failure_code: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]), attempt_count: faker_1.faker.number.int() }, overrideResponse));
};
exports.getCreateExportResponseMock = getCreateExportResponseMock;
var getGetExportResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ id: faker_1.faker.string.uuid(), state: faker_1.faker.helpers.arrayElement([
            'queued',
            'running',
            'ready',
            'failed',
            'expired',
            'cleaned',
        ]), requested_path_ids: Array.from({ length: faker_1.faker.number.int({ min: 1, max: 10 }) }, function (_, i) { return i + 1; }).map(function () { return faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }); }), created_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z', updated_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z', expires_at: faker_1.faker.helpers.arrayElement([
            faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z',
            null,
        ]), failure_code: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]), attempt_count: faker_1.faker.number.int() }, overrideResponse));
};
exports.getGetExportResponseMock = getGetExportResponseMock;
var getDownloadExportJsonResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ url: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), expires_in_seconds: faker_1.faker.number.int() }, overrideResponse));
};
exports.getDownloadExportJsonResponseMock = getDownloadExportJsonResponseMock;
var getDownloadExportImagesResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ url: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), expires_in_seconds: faker_1.faker.number.int() }, overrideResponse));
};
exports.getDownloadExportImagesResponseMock = getDownloadExportImagesResponseMock;
var getAuthLoginResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ authorization_url: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }) }, overrideResponse));
};
exports.getAuthLoginResponseMock = getAuthLoginResponseMock;
var getAuthCallbackResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ token: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), user_id: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), display_name: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]) }, overrideResponse));
};
exports.getAuthCallbackResponseMock = getAuthCallbackResponseMock;
var getAuthCallbackRedirectResponseMock = function (overrideResponse) {
    if (overrideResponse === void 0) { overrideResponse = {}; }
    return (__assign({ token: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), user_id: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }), display_name: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]) }, overrideResponse));
};
exports.getAuthCallbackRedirectResponseMock = getAuthCallbackRedirectResponseMock;
var getListInvitationsResponseMock = function () {
    return Array.from({ length: faker_1.faker.number.int({ min: 1, max: 10 }) }, function (_, i) { return i + 1; }).map(function () { return ({
        id: faker_1.faker.string.uuid(),
        path_id: faker_1.faker.string.uuid(),
        path_code: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
        path_title: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
        inviter_user_id: faker_1.faker.string.uuid(),
        inviter_email: faker_1.faker.helpers.arrayElement([
            faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
            null,
        ]),
        invited_email: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
        invited_user_id: faker_1.faker.helpers.arrayElement([faker_1.faker.string.uuid(), null]),
        status: faker_1.faker.string.alpha({ length: { min: 10, max: 20 } }),
        created_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z',
        updated_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z',
    }); });
};
exports.getListInvitationsResponseMock = getListInvitationsResponseMock;
var getListBlocklistResponseMock = function () {
    return Array.from({ length: faker_1.faker.number.int({ min: 1, max: 10 }) }, function (_, i) { return i + 1; }).map(function () { return ({
        id: faker_1.faker.string.uuid(),
        blocked_user_id: faker_1.faker.string.uuid(),
        created_at: faker_1.faker.date.past().toISOString().slice(0, 19) + 'Z',
    }); });
};
exports.getListBlocklistResponseMock = getListBlocklistResponseMock;
var getHealthMockHandler = function (overrideResponse, options) {
    return msw_1.http.get('*/health', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getHealthResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getHealthMockHandler = getHealthMockHandler;
var getListPathsMockHandler = function (overrideResponse, options) {
    return msw_1.http.get('*/v1/paths', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getListPathsResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getListPathsMockHandler = getListPathsMockHandler;
var getCreatePathMockHandler = function (overrideResponse, options) {
    return msw_1.http.post('*/v1/paths', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getCreatePathResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 201 }])];
            }
        });
    }); }, options);
};
exports.getCreatePathMockHandler = getCreatePathMockHandler;
var getUpdatePathMockHandler = function (overrideResponse, options) {
    return msw_1.http.patch('*/v1/paths/:pathCode', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getUpdatePathResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getUpdatePathMockHandler = getUpdatePathMockHandler;
var getDeletePathMockHandler = function (overrideResponse, options) {
    return msw_1.http.delete('*/v1/paths/:pathCode', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, new msw_1.HttpResponse(null, { status: 204 })];
            }
        });
    }); }, options);
};
exports.getDeletePathMockHandler = getDeletePathMockHandler;
var getUpdatePathVisibilityMockHandler = function (overrideResponse, options) {
    return msw_1.http.patch('*/v1/paths/:pathCode/visibility', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getUpdatePathVisibilityResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getUpdatePathVisibilityMockHandler = getUpdatePathVisibilityMockHandler;
var getStartCreateEntryDraftMockHandler = function (overrideResponse, options) {
    return msw_1.http.get('*/v1/paths/:pathCode/entries/drafts', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getStartCreateEntryDraftResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getStartCreateEntryDraftMockHandler = getStartCreateEntryDraftMockHandler;
var getStartEditEntryDraftMockHandler = function (overrideResponse, options) {
    return msw_1.http.get('*/v1/paths/:pathCode/entries/:entrySlug/draft', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getStartEditEntryDraftResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getStartEditEntryDraftMockHandler = getStartEditEntryDraftMockHandler;
var getGetEntryDraftMockHandler = function (overrideResponse, options) {
    return msw_1.http.get('*/v1/entry-drafts/:draftId', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getGetEntryDraftResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getGetEntryDraftMockHandler = getGetEntryDraftMockHandler;
var getPatchEntryDraftMockHandler = function (overrideResponse, options) {
    return msw_1.http.patch('*/v1/entry-drafts/:draftId', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getPatchEntryDraftResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getPatchEntryDraftMockHandler = getPatchEntryDraftMockHandler;
var getAbandonEntryDraftMockHandler = function (overrideResponse, options) {
    return msw_1.http.delete('*/v1/entry-drafts/:draftId', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, new msw_1.HttpResponse(null, { status: 204 })];
            }
        });
    }); }, options);
};
exports.getAbandonEntryDraftMockHandler = getAbandonEntryDraftMockHandler;
var getCreateDraftImageSlotMockHandler = function (overrideResponse, options) {
    return msw_1.http.post('*/v1/entry-drafts/:draftId/images', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getCreateDraftImageSlotResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 201 }])];
            }
        });
    }); }, options);
};
exports.getCreateDraftImageSlotMockHandler = getCreateDraftImageSlotMockHandler;
var getCompleteDraftImageUploadMockHandler = function (overrideResponse, options) {
    return msw_1.http.post('*/v1/entry-drafts/:draftId/images/:draftImageId/complete', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getCompleteDraftImageUploadResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getCompleteDraftImageUploadMockHandler = getCompleteDraftImageUploadMockHandler;
var getRetryDraftImageUploadMockHandler = function (overrideResponse, options) {
    return msw_1.http.post('*/v1/entry-drafts/:draftId/images/:draftImageId/retry-upload', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getRetryDraftImageUploadResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getRetryDraftImageUploadMockHandler = getRetryDraftImageUploadMockHandler;
var getRemoveDraftImageMockHandler = function (overrideResponse, options) {
    return msw_1.http.delete('*/v1/entry-drafts/:draftId/images/:draftImageId', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getRemoveDraftImageResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getRemoveDraftImageMockHandler = getRemoveDraftImageMockHandler;
var getCommitEntryDraftMockHandler = function (overrideResponse, options) {
    return msw_1.http.post('*/v1/entry-drafts/:draftId/commit', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getCommitEntryDraftResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getCommitEntryDraftMockHandler = getCommitEntryDraftMockHandler;
var getListEntriesMockHandler = function (overrideResponse, options) {
    return msw_1.http.get('*/v1/paths/:pathCode/entries', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getListEntriesResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getListEntriesMockHandler = getListEntriesMockHandler;
var getCreateEntryMockHandler = function (overrideResponse, options) {
    return msw_1.http.post('*/v1/paths/:pathCode/entries', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getCreateEntryResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 201 }])];
            }
        });
    }); }, options);
};
exports.getCreateEntryMockHandler = getCreateEntryMockHandler;
var getGetEntryMockHandler = function (overrideResponse, options) {
    return msw_1.http.get('*/v1/paths/:pathCode/entries/:entrySlug', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getGetEntryResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getGetEntryMockHandler = getGetEntryMockHandler;
var getUpdateEntryMockHandler = function (overrideResponse, options) {
    return msw_1.http.put('*/v1/paths/:pathCode/entries/:entrySlug', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getUpdateEntryResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getUpdateEntryMockHandler = getUpdateEntryMockHandler;
var getDeleteEntryMockHandler = function (overrideResponse, options) {
    return msw_1.http.delete('*/v1/paths/:pathCode/entries/:entrySlug', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, new msw_1.HttpResponse(null, { status: 204 })];
            }
        });
    }); }, options);
};
exports.getDeleteEntryMockHandler = getDeleteEntryMockHandler;
var getCreateImageUploadUrlMockHandler = function (overrideResponse, options) {
    return msw_1.http.post('*/v1/paths/:pathCode/entries/:entrySlug/images/upload-url', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getCreateImageUploadUrlResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getCreateImageUploadUrlMockHandler = getCreateImageUploadUrlMockHandler;
var getListEntryImagesMockHandler = function (overrideResponse, options) {
    return msw_1.http.get('*/v1/paths/:pathCode/entries/:entrySlug/images', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getListEntryImagesResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getListEntryImagesMockHandler = getListEntryImagesMockHandler;
var getListSubscriptionsMockHandler = function (overrideResponse, options) {
    return msw_1.http.get('*/v1/paths/:pathCode/subscriptions', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getListSubscriptionsResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getListSubscriptionsMockHandler = getListSubscriptionsMockHandler;
var getInviteSubscriberMockHandler = function (overrideResponse, options) {
    return msw_1.http.post('*/v1/paths/:pathCode/subscriptions', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getInviteSubscriberResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 201 }])];
            }
        });
    }); }, options);
};
exports.getInviteSubscriberMockHandler = getInviteSubscriberMockHandler;
var getDeleteSubscriptionMockHandler = function (overrideResponse, options) {
    return msw_1.http.delete('*/v1/paths/:pathCode/subscriptions/:targetUserId', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, new msw_1.HttpResponse(null, { status: 204 })];
            }
        });
    }); }, options);
};
exports.getDeleteSubscriptionMockHandler = getDeleteSubscriptionMockHandler;
var getAdminLoginMockHandler = function (overrideResponse, options) {
    return msw_1.http.post('*/v1/admin/login', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getAdminLoginResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getAdminLoginMockHandler = getAdminLoginMockHandler;
var getSetPathCreationApprovalMockHandler = function (overrideResponse, options) {
    return msw_1.http.put('*/v1/admin/users/:userId/path-creation-approval', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getSetPathCreationApprovalResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getSetPathCreationApprovalMockHandler = getSetPathCreationApprovalMockHandler;
var getGetProfileMockHandler = function (overrideResponse, options) {
    return msw_1.http.get('*/v1/account/profile', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getGetProfileResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getGetProfileMockHandler = getGetProfileMockHandler;
var getUpdateDisplayNameMockHandler = function (overrideResponse, options) {
    return msw_1.http.patch('*/v1/account/display-name', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getUpdateDisplayNameResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getUpdateDisplayNameMockHandler = getUpdateDisplayNameMockHandler;
var getUpdateSettingsMockHandler = function (overrideResponse, options) {
    return msw_1.http.patch('*/v1/account/settings', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getUpdateSettingsResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getUpdateSettingsMockHandler = getUpdateSettingsMockHandler;
var getCreateDeletionRequestMockHandler = function (overrideResponse, options) {
    return msw_1.http.post('*/v1/account/deletion-requests', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getCreateDeletionRequestResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getCreateDeletionRequestMockHandler = getCreateDeletionRequestMockHandler;
var getGetLatestDeletionRequestMockHandler = function (overrideResponse, options) {
    return msw_1.http.get('*/v1/account/deletion-requests/latest', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getGetLatestDeletionRequestResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getGetLatestDeletionRequestMockHandler = getGetLatestDeletionRequestMockHandler;
var getCompleteImageUploadMockHandler = function (overrideResponse, options) {
    return msw_1.http.post('*/v1/images/:imageId/complete', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getCompleteImageUploadResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getCompleteImageUploadMockHandler = getCompleteImageUploadMockHandler;
var getGetImageDownloadUrlMockHandler = function (overrideResponse, options) {
    return msw_1.http.get('*/v1/images/:imageId/download-url', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getGetImageDownloadUrlResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getGetImageDownloadUrlMockHandler = getGetImageDownloadUrlMockHandler;
var getCreateExportMockHandler = function (overrideResponse, options) {
    return msw_1.http.post('*/v1/exports', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getCreateExportResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 202 }])];
            }
        });
    }); }, options);
};
exports.getCreateExportMockHandler = getCreateExportMockHandler;
var getGetExportMockHandler = function (overrideResponse, options) {
    return msw_1.http.get('*/v1/exports/:exportId', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getGetExportResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getGetExportMockHandler = getGetExportMockHandler;
var getDownloadExportJsonMockHandler = function (overrideResponse, options) {
    return msw_1.http.get('*/v1/exports/:exportId/download/json', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getDownloadExportJsonResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getDownloadExportJsonMockHandler = getDownloadExportJsonMockHandler;
var getDownloadExportImagesMockHandler = function (overrideResponse, options) {
    return msw_1.http.get('*/v1/exports/:exportId/download/images', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getDownloadExportImagesResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getDownloadExportImagesMockHandler = getDownloadExportImagesMockHandler;
var getAuthLoginMockHandler = function (overrideResponse, options) {
    return msw_1.http.get('*/v1/auth/login', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getAuthLoginResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getAuthLoginMockHandler = getAuthLoginMockHandler;
var getAuthCallbackMockHandler = function (overrideResponse, options) {
    return msw_1.http.post('*/v1/auth/callback', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getAuthCallbackResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getAuthCallbackMockHandler = getAuthCallbackMockHandler;
var getAuthCallbackRedirectMockHandler = function (overrideResponse, options) {
    return msw_1.http.get('*/v1/auth/callback', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getAuthCallbackRedirectResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getAuthCallbackRedirectMockHandler = getAuthCallbackRedirectMockHandler;
var getListInvitationsMockHandler = function (overrideResponse, options) {
    return msw_1.http.get('*/v1/invitations', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getListInvitationsResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getListInvitationsMockHandler = getListInvitationsMockHandler;
var getAcceptInvitationMockHandler = function (overrideResponse, options) {
    return msw_1.http.post('*/v1/invitations/:invitationId/accept', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, new msw_1.HttpResponse(null, { status: 204 })];
            }
        });
    }); }, options);
};
exports.getAcceptInvitationMockHandler = getAcceptInvitationMockHandler;
var getIgnoreInvitationMockHandler = function (overrideResponse, options) {
    return msw_1.http.post('*/v1/invitations/:invitationId/ignore', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, new msw_1.HttpResponse(null, { status: 204 })];
            }
        });
    }); }, options);
};
exports.getIgnoreInvitationMockHandler = getIgnoreInvitationMockHandler;
var getListBlocklistMockHandler = function (overrideResponse, options) {
    return msw_1.http.get('*/v1/invitations/blocklist', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _b = (_a = msw_1.HttpResponse).json;
                    if (!(overrideResponse !== undefined)) return [3 /*break*/, 4];
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _d = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _d = overrideResponse;
                    _e.label = 3;
                case 3:
                    _c = _d;
                    return [3 /*break*/, 5];
                case 4:
                    _c = (0, exports.getListBlocklistResponseMock)();
                    _e.label = 5;
                case 5: return [2 /*return*/, _b.apply(_a, [_c, { status: 200 }])];
            }
        });
    }); }, options);
};
exports.getListBlocklistMockHandler = getListBlocklistMockHandler;
var getBlockInviterMockHandler = function (overrideResponse, options) {
    return msw_1.http.post('*/v1/invitations/blocklist', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, new msw_1.HttpResponse(null, { status: 204 })];
            }
        });
    }); }, options);
};
exports.getBlockInviterMockHandler = getBlockInviterMockHandler;
var getUnblockUserMockHandler = function (overrideResponse, options) {
    return msw_1.http.delete('*/v1/invitations/blocklist/:blockedUserId', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, new msw_1.HttpResponse(null, { status: 204 })];
            }
        });
    }); }, options);
};
exports.getUnblockUserMockHandler = getUnblockUserMockHandler;
var getRootMockHandler = function (overrideResponse, options) {
    return msw_1.http.get('*/', function (info) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(typeof overrideResponse === 'function')) return [3 /*break*/, 2];
                    return [4 /*yield*/, overrideResponse(info)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, new msw_1.HttpResponse(null, { status: 200 })];
            }
        });
    }); }, options);
};
exports.getRootMockHandler = getRootMockHandler;
var getPathsBackendAPIMock = function () { return [
    (0, exports.getHealthMockHandler)(),
    (0, exports.getListPathsMockHandler)(),
    (0, exports.getCreatePathMockHandler)(),
    (0, exports.getUpdatePathMockHandler)(),
    (0, exports.getDeletePathMockHandler)(),
    (0, exports.getUpdatePathVisibilityMockHandler)(),
    (0, exports.getStartCreateEntryDraftMockHandler)(),
    (0, exports.getStartEditEntryDraftMockHandler)(),
    (0, exports.getGetEntryDraftMockHandler)(),
    (0, exports.getPatchEntryDraftMockHandler)(),
    (0, exports.getAbandonEntryDraftMockHandler)(),
    (0, exports.getCreateDraftImageSlotMockHandler)(),
    (0, exports.getCompleteDraftImageUploadMockHandler)(),
    (0, exports.getRetryDraftImageUploadMockHandler)(),
    (0, exports.getRemoveDraftImageMockHandler)(),
    (0, exports.getCommitEntryDraftMockHandler)(),
    (0, exports.getListEntriesMockHandler)(),
    (0, exports.getCreateEntryMockHandler)(),
    (0, exports.getGetEntryMockHandler)(),
    (0, exports.getUpdateEntryMockHandler)(),
    (0, exports.getDeleteEntryMockHandler)(),
    (0, exports.getCreateImageUploadUrlMockHandler)(),
    (0, exports.getListEntryImagesMockHandler)(),
    (0, exports.getListSubscriptionsMockHandler)(),
    (0, exports.getInviteSubscriberMockHandler)(),
    (0, exports.getDeleteSubscriptionMockHandler)(),
    (0, exports.getAdminLoginMockHandler)(),
    (0, exports.getSetPathCreationApprovalMockHandler)(),
    (0, exports.getGetProfileMockHandler)(),
    (0, exports.getUpdateDisplayNameMockHandler)(),
    (0, exports.getUpdateSettingsMockHandler)(),
    (0, exports.getCreateDeletionRequestMockHandler)(),
    (0, exports.getGetLatestDeletionRequestMockHandler)(),
    (0, exports.getCompleteImageUploadMockHandler)(),
    (0, exports.getGetImageDownloadUrlMockHandler)(),
    (0, exports.getCreateExportMockHandler)(),
    (0, exports.getGetExportMockHandler)(),
    (0, exports.getDownloadExportJsonMockHandler)(),
    (0, exports.getDownloadExportImagesMockHandler)(),
    (0, exports.getAuthLoginMockHandler)(),
    (0, exports.getAuthCallbackMockHandler)(),
    (0, exports.getAuthCallbackRedirectMockHandler)(),
    (0, exports.getListInvitationsMockHandler)(),
    (0, exports.getAcceptInvitationMockHandler)(),
    (0, exports.getIgnoreInvitationMockHandler)(),
    (0, exports.getListBlocklistMockHandler)(),
    (0, exports.getBlockInviterMockHandler)(),
    (0, exports.getUnblockUserMockHandler)(),
    (0, exports.getRootMockHandler)(),
]; };
exports.getPathsBackendAPIMock = getPathsBackendAPIMock;
