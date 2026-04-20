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
var vue_1 = require("vue");
var marked_1 = require("marked");
var dompurify_1 = require("dompurify");
var apiClient_1 = require("../generated/apiClient");
var markdown_1 = require("../utils/markdown");
var props = defineProps();
function bytesToBase64(bytes) {
    var _a, _b, _c;
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var output = '';
    for (var i = 0; i < bytes.length; i += 3) {
        var a = (_a = bytes[i]) !== null && _a !== void 0 ? _a : 0;
        var b = (_b = bytes[i + 1]) !== null && _b !== void 0 ? _b : 0;
        var c = (_c = bytes[i + 2]) !== null && _c !== void 0 ? _c : 0;
        var chunk = (a << 16) | (b << 8) | c;
        output += alphabet[(chunk >> 18) & 63];
        output += alphabet[(chunk >> 12) & 63];
        output += i + 1 < bytes.length ? alphabet[(chunk >> 6) & 63] : '=';
        output += i + 2 < bytes.length ? alphabet[chunk & 63] : '=';
    }
    return output;
}
function blobToDataUrl(blob) {
    return __awaiter(this, void 0, void 0, function () {
        var bytes, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(typeof blob.arrayBuffer === 'function')) return [3 /*break*/, 2];
                    _a = Uint8Array.bind;
                    return [4 /*yield*/, blob.arrayBuffer()];
                case 1:
                    bytes = new (_a.apply(Uint8Array, [void 0, _b.sent()]))();
                    return [2 /*return*/, "data:".concat(blob.type || 'application/octet-stream', ";base64,").concat(bytesToBase64(bytes))];
                case 2: return [2 /*return*/, new Promise(function (resolve, reject) {
                        var reader = new FileReader();
                        reader.onload = function () {
                            if (typeof reader.result === 'string') {
                                resolve(reader.result);
                                return;
                            }
                            reject(new Error('Failed to read image data.'));
                        };
                        reader.onerror = function () {
                            var _a;
                            reject((_a = reader.error) !== null && _a !== void 0 ? _a : new Error('Failed to read image data.'));
                        };
                        reader.readAsDataURL(blob);
                    })];
            }
        });
    });
}
var downloadedImageUrls = (0, vue_1.ref)({});
var localDataImageUrls = (0, vue_1.ref)({});
(0, vue_1.watch)(function () { var _a; return (_a = props.images) !== null && _a !== void 0 ? _a : []; }, function (images, _previousImages, onCleanup) { return __awaiter(void 0, void 0, void 0, function () {
    var cancelled, nextEntries;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cancelled = false;
                onCleanup(function () {
                    cancelled = true;
                });
                return [4 /*yield*/, Promise.all(images.map(function (img) { return __awaiter(void 0, void 0, void 0, function () {
                        var response, data, src, imageResponse, _a, _b, _c;
                        var _d;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    if (!img.id)
                                        return [2 /*return*/, null];
                                    _e.label = 1;
                                case 1:
                                    _e.trys.push([1, 6, , 7]);
                                    return [4 /*yield*/, (0, apiClient_1.getImageDownloadUrl)(img.id)];
                                case 2:
                                    response = _e.sent();
                                    data = response.data;
                                    src = (_d = data === null || data === void 0 ? void 0 : data.image_url) !== null && _d !== void 0 ? _d : data === null || data === void 0 ? void 0 : data.thumbnail_url;
                                    if (!src)
                                        return [2 /*return*/, null];
                                    return [4 /*yield*/, fetch(src)];
                                case 3:
                                    imageResponse = _e.sent();
                                    if (!imageResponse.ok) {
                                        throw new Error("Image request failed: ".concat(imageResponse.status));
                                    }
                                    _a = [img.filename];
                                    _b = blobToDataUrl;
                                    return [4 /*yield*/, imageResponse.blob()];
                                case 4: return [4 /*yield*/, _b.apply(void 0, [_e.sent()])];
                                case 5: return [2 /*return*/, _a.concat([
                                        _e.sent()
                                    ])];
                                case 6:
                                    _c = _e.sent();
                                    return [2 /*return*/, null];
                                case 7: return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 1:
                nextEntries = _a.sent();
                if (cancelled)
                    return [2 /*return*/];
                downloadedImageUrls.value = Object.fromEntries(nextEntries.filter(function (entry) { return entry !== null; }));
                return [2 /*return*/];
        }
    });
}); }, { deep: true, immediate: true });
(0, vue_1.watch)(function () { var _a; return (_a = props.localImageUrls) !== null && _a !== void 0 ? _a : {}; }, function (localImageUrls, _previousUrls, onCleanup) { return __awaiter(void 0, void 0, void 0, function () {
    var cancelled, nextEntries;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cancelled = false;
                onCleanup(function () {
                    cancelled = true;
                });
                return [4 /*yield*/, Promise.all(Object.entries(localImageUrls).map(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                        var imageResponse, _c, _d, _e;
                        var filename = _b[0], src = _b[1];
                        return __generator(this, function (_f) {
                            switch (_f.label) {
                                case 0:
                                    if (!src)
                                        return [2 /*return*/, null];
                                    if (src.startsWith('data:')) {
                                        return [2 /*return*/, [filename, src]];
                                    }
                                    _f.label = 1;
                                case 1:
                                    _f.trys.push([1, 5, , 6]);
                                    return [4 /*yield*/, fetch(src)];
                                case 2:
                                    imageResponse = _f.sent();
                                    if (!imageResponse.ok) {
                                        throw new Error("Image request failed: ".concat(imageResponse.status));
                                    }
                                    _c = [filename];
                                    _d = blobToDataUrl;
                                    return [4 /*yield*/, imageResponse.blob()];
                                case 3: return [4 /*yield*/, _d.apply(void 0, [_f.sent()])];
                                case 4: return [2 /*return*/, _c.concat([
                                        _f.sent()
                                    ])];
                                case 5:
                                    _e = _f.sent();
                                    return [2 /*return*/, [filename, src]];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 1:
                nextEntries = _a.sent();
                if (cancelled)
                    return [2 /*return*/];
                localDataImageUrls.value = Object.fromEntries(nextEntries.filter(function (entry) { return entry !== null; }));
                return [2 /*return*/];
        }
    });
}); }, { deep: true, immediate: true });
var imageUrlMap = (0, vue_1.computed)(function () { return new Map(Object.entries(downloadedImageUrls.value)); });
function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
var renderedHtml = (0, vue_1.computed)(function () {
    var urlMap = imageUrlMap.value;
    var localImageUrls = localDataImageUrls.value;
    var renderer = new marked_1.Renderer();
    renderer.image = function (_a) {
        var _b, _c, _d, _e;
        var href = _a.href, title = _a.title, text = _a.text;
        var decodedHref = (0, markdown_1.decodeMarkdownImageFilename)(href);
        var resolvedSrc = (_e = (_d = (_c = (_b = localImageUrls[decodedHref]) !== null && _b !== void 0 ? _b : localImageUrls[href]) !== null && _c !== void 0 ? _c : urlMap.get(decodedHref)) !== null && _d !== void 0 ? _d : urlMap.get(href)) !== null && _e !== void 0 ? _e : href;
        var escapedSrc = resolvedSrc.replace(/"/g, '&quot;');
        var escapedAlt = escapeHtml(text !== null && text !== void 0 ? text : '');
        var titleAttr = title ? " title=\"".concat(title.replace(/"/g, '&quot;'), "\"") : '';
        var figureCaption = (text === null || text === void 0 ? void 0 : text.trim())
            ? "<figcaption class=\"markdown-image-caption\">".concat(escapeHtml(text), "</figcaption>")
            : '';
        return "<figure class=\"markdown-image-figure\"><img src=\"".concat(escapedSrc, "\" alt=\"").concat(escapedAlt, "\"").concat(titleAttr, " loading=\"lazy\" class=\"markdown-inline-image\" />").concat(figureCaption, "</figure>");
    };
    var raw = marked_1.marked.parse((0, markdown_1.normalizeMarkdownImageFilenames)(props.content), {
        renderer: renderer,
    });
    return dompurify_1.default.sanitize(raw, { ADD_ATTR: ['loading'] });
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "markdown-content" }));
__VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.renderedHtml) }), null, null);
/** @type {__VLS_StyleScopedClasses['markdown-content']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            renderedHtml: renderedHtml,
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
