"use strict";
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
exports.useMarkdownEditor = useMarkdownEditor;
var vue_1 = require("vue");
var markdown_1 = require("../utils/markdown");
/**
 * Returns helper functions for inserting image markdown into an Ionic
 * ion-textarea and scrolling the cursor into view as the textarea grows.
 *
 * @param content - reactive ref for the textarea's string value
 * @param textareaRef - ref to the IonTextarea component instance
 * @param contentTab - reactive ref for the active content tab ('write'|'preview')
 */
function useMarkdownEditor(content, textareaRef, contentTab) {
    var lastSelectionStart = 0;
    var lastSelectionEnd = 0;
    var hasRememberedSelection = false;
    function getNativeTextarea() {
        var _a, _b, _c;
        return ((_c = (_b = (_a = textareaRef.value) === null || _a === void 0 ? void 0 : _a.$el) === null || _b === void 0 ? void 0 : _b.querySelector('textarea')) !== null && _c !== void 0 ? _c : null);
    }
    function rememberSelection() {
        var _a, _b;
        var nativeTextarea = getNativeTextarea();
        if (!nativeTextarea) {
            var fallbackPosition = content.value.length;
            lastSelectionStart = fallbackPosition;
            lastSelectionEnd = fallbackPosition;
            hasRememberedSelection = true;
            return;
        }
        lastSelectionStart = (_a = nativeTextarea.selectionStart) !== null && _a !== void 0 ? _a : content.value.length;
        lastSelectionEnd = (_b = nativeTextarea.selectionEnd) !== null && _b !== void 0 ? _b : lastSelectionStart;
        hasRememberedSelection = true;
    }
    /** Scroll the textarea host into view so the cursor stays visible as text grows. */
    function onTextareaInput(event) {
        return __awaiter(this, void 0, void 0, function () {
            var el;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, vue_1.nextTick)()];
                    case 1:
                        _a.sent();
                        rememberSelection();
                        el = event.target;
                        el === null || el === void 0 ? void 0 : el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                        return [2 /*return*/];
                }
            });
        });
    }
    /**
     * Insert `![caption](filename)` at the current cursor position. Falls back
     * to appending at the end when cursor info is unavailable, and switches to
     * the write tab so the user can see the result.
     */
    function insertImageMarkdown(filename_1) {
        return __awaiter(this, arguments, void 0, function (filename, altText) {
            var snippet, nativeTextarea, start, end, before, after, needsBefore, needsAfter, updatedTextarea;
            var _a, _b;
            if (altText === void 0) { altText = 'caption'; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        snippet = "![".concat(altText || 'caption', "](").concat((0, markdown_1.encodeMarkdownImageFilename)(filename), ")");
                        nativeTextarea = getNativeTextarea();
                        start = nativeTextarea
                            ? ((_a = nativeTextarea.selectionStart) !== null && _a !== void 0 ? _a : content.value.length)
                            : hasRememberedSelection
                                ? lastSelectionStart
                                : content.value.length;
                        end = nativeTextarea
                            ? ((_b = nativeTextarea.selectionEnd) !== null && _b !== void 0 ? _b : content.value.length)
                            : hasRememberedSelection
                                ? lastSelectionEnd
                                : content.value.length;
                        if (!(nativeTextarea ||
                            content.value.length === 0 ||
                            start <= content.value.length)) return [3 /*break*/, 2];
                        before = content.value.slice(0, start);
                        after = content.value.slice(end);
                        needsBefore = before.length > 0 && !before.endsWith('\n') ? '\n' : '';
                        needsAfter = after.length > 0 && !after.startsWith('\n') ? '\n' : '';
                        content.value = "".concat(before).concat(needsBefore).concat(snippet).concat(needsAfter).concat(after);
                        lastSelectionStart = start + needsBefore.length + snippet.length;
                        lastSelectionEnd = lastSelectionStart;
                        return [4 /*yield*/, (0, vue_1.nextTick)()];
                    case 1:
                        _c.sent();
                        updatedTextarea = getNativeTextarea();
                        if (updatedTextarea) {
                            updatedTextarea.selectionStart = lastSelectionStart;
                            updatedTextarea.selectionEnd = lastSelectionEnd;
                            updatedTextarea.focus();
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        content.value = content.value ? "".concat(content.value, "\n").concat(snippet) : snippet;
                        lastSelectionStart = content.value.length;
                        lastSelectionEnd = content.value.length;
                        _c.label = 3;
                    case 3:
                        contentTab.value = 'write';
                        return [2 /*return*/];
                }
            });
        });
    }
    return { onTextareaInput: onTextareaInput, insertImageMarkdown: insertImageMarkdown, rememberSelection: rememberSelection };
}
