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
var vitest_1 = require("vitest");
var vue_1 = require("vue");
var useMarkdownEditor_1 = require("../composables/useMarkdownEditor");
function createTextareaRef(textarea) {
    return (0, vue_1.ref)(textarea
        ? {
            $el: {
                querySelector: function () { return textarea; },
            },
        }
        : null);
}
(0, vitest_1.describe)('useMarkdownEditor', function () {
    (0, vitest_1.it)('inserts image markdown at the current selection', function () { return __awaiter(void 0, void 0, void 0, function () {
        var content, contentTab, textarea, textareaRef, insertImageMarkdown;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    content = (0, vue_1.ref)('Morning notes');
                    contentTab = (0, vue_1.ref)('write');
                    textarea = document.createElement('textarea');
                    textarea.value = content.value;
                    textarea.selectionStart = 7;
                    textarea.selectionEnd = 7;
                    textareaRef = createTextareaRef(textarea);
                    insertImageMarkdown = (0, useMarkdownEditor_1.useMarkdownEditor)(content, textareaRef, contentTab).insertImageMarkdown;
                    return [4 /*yield*/, insertImageMarkdown('photo.jpg', 'Sunrise')];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(content.value).toBe('Morning\n![Sunrise](photo.jpg)\n notes');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('uses the last remembered caret when the textarea loses focus', function () { return __awaiter(void 0, void 0, void 0, function () {
        var content, contentTab, textarea, textareaRef, _a, rememberSelection, insertImageMarkdown;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    content = (0, vue_1.ref)('Alpha Beta');
                    contentTab = (0, vue_1.ref)('preview');
                    textarea = document.createElement('textarea');
                    textarea.value = content.value;
                    textarea.selectionStart = 5;
                    textarea.selectionEnd = 5;
                    textareaRef = createTextareaRef(textarea);
                    _a = (0, useMarkdownEditor_1.useMarkdownEditor)(content, textareaRef, contentTab), rememberSelection = _a.rememberSelection, insertImageMarkdown = _a.insertImageMarkdown;
                    rememberSelection();
                    textareaRef.value = null;
                    return [4 /*yield*/, insertImageMarkdown('river.jpg', 'River walk')];
                case 1:
                    _b.sent();
                    (0, vitest_1.expect)(content.value).toBe('Alpha\n![River walk](river.jpg)\n Beta');
                    (0, vitest_1.expect)(contentTab.value).toBe('write');
                    return [2 /*return*/];
            }
        });
    }); });
    (0, vitest_1.it)('URL-encodes filenames with spaces when inserting image markdown', function () { return __awaiter(void 0, void 0, void 0, function () {
        var content, contentTab, textarea, textareaRef, insertImageMarkdown;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    content = (0, vue_1.ref)('Notes');
                    contentTab = (0, vue_1.ref)('write');
                    textarea = document.createElement('textarea');
                    textarea.value = content.value;
                    textarea.selectionStart = content.value.length;
                    textarea.selectionEnd = content.value.length;
                    textareaRef = createTextareaRef(textarea);
                    insertImageMarkdown = (0, useMarkdownEditor_1.useMarkdownEditor)(content, textareaRef, contentTab).insertImageMarkdown;
                    return [4 /*yield*/, insertImageMarkdown('ChatGPT Image Apr 29, 2025, 07_47_54 AM.png')];
                case 1:
                    _a.sent();
                    (0, vitest_1.expect)(content.value).toContain('![caption](ChatGPT%20Image%20Apr%2029%2C%202025%2C%2007_47_54%20AM.png)');
                    return [2 /*return*/];
            }
        });
    }); });
});
