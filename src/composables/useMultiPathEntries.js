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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMultiPathEntries = useMultiPathEntries;
var vue_1 = require("vue");
var vue_query_1 = require("@tanstack/vue-query");
var apiClient_1 = require("../generated/apiClient");
var db_1 = require("../lib/db");
function useMultiPathEntries(pathIds) {
    var _this = this;
    var contentCache = (0, vue_1.ref)({});
    /**
     * Stable map from pathId → raw entry list, updated synchronously
     * inside the `watch(results, …)` callback.  Using a keyed map (rather
     * than positional index into `results`) means that a path-priority
     * reorder — which changes `pathIds.value` order but not the underlying
     * data — never causes one path to accidentally read another path's
     * entries while TanStack Query's internal result array catches up.
     */
    var rawEntriesMap = (0, vue_1.ref)({});
    var results = (0, vue_query_1.useQueries)({
        queries: (0, vue_1.computed)(function () {
            return pathIds.value.map(function (pathId) { return ({
                queryKey: ['v1', 'paths', pathId, 'entries'],
                queryFn: function () { return (0, apiClient_1.listEntries)(pathId); },
                enabled: !!pathId,
                refetchInterval: 25000,
                refetchIntervalInBackground: false,
                refetchOnWindowFocus: true,
            }); });
        }),
    });
    // When entry lists change, populate content from Dexie or fetch from API.
    (0, vue_1.watch)(results, function (queryResults) { return __awaiter(_this, void 0, void 0, function () {
        var newMap, i, pathId, i, pathId, entries, _i, entries_1, entry, cacheKey, cached, cachedImages, _a, _b, entryResult, imagesResult, content, images, image_filenames, _c;
        var _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        return __generator(this, function (_t) {
            switch (_t.label) {
                case 0:
                    newMap = {};
                    for (i = 0; i < pathIds.value.length; i++) {
                        pathId = pathIds.value[i];
                        if (!pathId)
                            continue;
                        newMap[pathId] =
                            (_f = (_e = (_d = queryResults[i]) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.data) !== null && _f !== void 0 ? _f : [];
                    }
                    rawEntriesMap.value = newMap;
                    i = 0;
                    _t.label = 1;
                case 1:
                    if (!(i < pathIds.value.length)) return [3 /*break*/, 19];
                    pathId = pathIds.value[i];
                    if (!pathId)
                        return [3 /*break*/, 18];
                    entries = (_j = (_h = (_g = queryResults[i]) === null || _g === void 0 ? void 0 : _g.data) === null || _h === void 0 ? void 0 : _h.data) !== null && _j !== void 0 ? _j : [];
                    _i = 0, entries_1 = entries;
                    _t.label = 2;
                case 2:
                    if (!(_i < entries_1.length)) return [3 /*break*/, 18];
                    entry = entries_1[_i];
                    cacheKey = "".concat(pathId, ":").concat(entry.id);
                    // Skip if we already have up-to-date content for this edit_id.
                    if (((_k = contentCache.value[cacheKey]) === null || _k === void 0 ? void 0 : _k.editId) === entry.edit_id)
                        return [3 /*break*/, 17];
                    _t.label = 3;
                case 3:
                    _t.trys.push([3, 7, , 8]);
                    return [4 /*yield*/, db_1.db.entryContent.get(cacheKey)];
                case 4:
                    cached = _t.sent();
                    if (!(cached && cached.edit_id === entry.edit_id)) return [3 /*break*/, 6];
                    return [4 /*yield*/, db_1.db.entryImages
                            .where('entry_id')
                            .equals(entry.id)
                            .toArray()];
                case 5:
                    cachedImages = _t.sent();
                    contentCache.value[cacheKey] = {
                        editId: entry.edit_id,
                        content: cached.content,
                        image_filenames: cached.image_filenames,
                        images: cachedImages,
                    };
                    return [3 /*break*/, 17];
                case 6: return [3 /*break*/, 8];
                case 7:
                    _a = _t.sent();
                    return [3 /*break*/, 8];
                case 8: return [4 /*yield*/, Promise.allSettled([
                        (0, apiClient_1.getEntry)(pathId, entry.id),
                        (0, apiClient_1.listEntryImages)(pathId, entry.id),
                    ])];
                case 9:
                    _b = _t.sent(), entryResult = _b[0], imagesResult = _b[1];
                    content = entryResult.status === 'fulfilled'
                        ? ((_m = (_l = entryResult.value.data) === null || _l === void 0 ? void 0 : _l.content) !== null && _m !== void 0 ? _m : '')
                        : ((_p = (_o = contentCache.value[cacheKey]) === null || _o === void 0 ? void 0 : _o.content) !== null && _p !== void 0 ? _p : '');
                    images = imagesResult.status === 'fulfilled'
                        ? ((_q = imagesResult.value.data) !== null && _q !== void 0 ? _q : [])
                        : ((_s = (_r = contentCache.value[cacheKey]) === null || _r === void 0 ? void 0 : _r.images) !== null && _s !== void 0 ? _s : []);
                    image_filenames = images.map(function (img) { return img.filename; });
                    _t.label = 10;
                case 10:
                    _t.trys.push([10, 15, , 16]);
                    return [4 /*yield*/, db_1.db.entryContent.put({
                            cache_key: cacheKey,
                            id: entry.id,
                            path_id: entry.path_id,
                            day: entry.day,
                            edit_id: entry.edit_id,
                            content: content,
                            image_filenames: image_filenames,
                        })];
                case 11:
                    _t.sent();
                    if (!(imagesResult.status === 'fulfilled')) return [3 /*break*/, 14];
                    return [4 /*yield*/, db_1.db.entryImages.where('entry_id').equals(entry.id).delete()];
                case 12:
                    _t.sent();
                    if (!(images.length > 0)) return [3 /*break*/, 14];
                    return [4 /*yield*/, db_1.db.entryImages.bulkPut(images.map(function (img) { return ({
                            id: img.id,
                            entry_id: img.entry_id,
                            filename: img.filename,
                            status: img.status,
                            strip_metadata: img.strip_metadata,
                            content_type: img.content_type,
                            byte_size: img.byte_size,
                        }); }))];
                case 13:
                    _t.sent();
                    _t.label = 14;
                case 14: return [3 /*break*/, 16];
                case 15:
                    _c = _t.sent();
                    return [3 /*break*/, 16];
                case 16:
                    contentCache.value[cacheKey] = {
                        editId: entry.edit_id,
                        content: content,
                        image_filenames: image_filenames,
                        images: images,
                    };
                    _t.label = 17;
                case 17:
                    _i++;
                    return [3 /*break*/, 2];
                case 18:
                    i++;
                    return [3 /*break*/, 1];
                case 19: return [2 /*return*/];
            }
        });
    }); }, 
    // Storybook and offline restores can mount with query data already warm.
    // Run once immediately so the initial render reflects cached entries.
    { deep: true, immediate: true });
    return (0, vue_1.computed)(function () {
        return pathIds.value.map(function (pathId) {
            var _a;
            return ({
                pathId: pathId,
                entries: ((_a = rawEntriesMap.value[pathId]) !== null && _a !== void 0 ? _a : []).map(function (entry) {
                    var _a, _b, _c;
                    var cacheKey = "".concat(pathId, ":").concat(entry.id);
                    return __assign(__assign({}, entry), { content: (_a = contentCache.value[cacheKey]) === null || _a === void 0 ? void 0 : _a.content, image_filenames: (_b = contentCache.value[cacheKey]) === null || _b === void 0 ? void 0 : _b.image_filenames, images: (_c = contentCache.value[cacheKey]) === null || _c === void 0 ? void 0 : _c.images });
                }),
            });
        });
    });
}
