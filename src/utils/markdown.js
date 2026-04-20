"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeMarkdownImageFilename = encodeMarkdownImageFilename;
exports.decodeMarkdownImageFilename = decodeMarkdownImageFilename;
exports.normalizeMarkdownImageFilenames = normalizeMarkdownImageFilenames;
exports.referencedImageFilenames = referencedImageFilenames;
exports.referencedImageCaptions = referencedImageCaptions;
exports.removeImageMarkdownReferences = removeImageMarkdownReferences;
function encodeMarkdownImageFilename(filename) {
    return encodeURIComponent(filename).replace(/%2F/g, '/');
}
function decodeMarkdownImageFilename(filename) {
    try {
        return decodeURIComponent(filename);
    }
    catch (_a) {
        return filename;
    }
}
function extractImageDestination(markdownTarget) {
    var trimmed = markdownTarget.trim();
    var titleMatch = trimmed.match(/^(.*?)(\s+"[^"]*")$/);
    if (titleMatch === null || titleMatch === void 0 ? void 0 : titleMatch[1])
        return titleMatch[1].trim();
    return trimmed;
}
function normalizeImageTarget(markdownTarget) {
    var _a, _b;
    var trimmed = markdownTarget.trim();
    var titleMatch = trimmed.match(/^(.*?)(\s+"[^"]*")$/);
    var destination = (_a = titleMatch === null || titleMatch === void 0 ? void 0 : titleMatch[1]) !== null && _a !== void 0 ? _a : trimmed;
    var suffix = (_b = titleMatch === null || titleMatch === void 0 ? void 0 : titleMatch[2]) !== null && _b !== void 0 ? _b : '';
    if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(destination)) {
        return "".concat(destination).concat(suffix);
    }
    return "".concat(encodeMarkdownImageFilename(decodeMarkdownImageFilename(destination))).concat(suffix);
}
function normalizeMarkdownImageFilenames(content) {
    return content.replace(/!\[([^\]]*)\]\(([^)\n]+)\)/g, function (_match, alt, target) {
        return "![".concat(alt, "](").concat(normalizeImageTarget(target), ")");
    });
}
/**
 * Returns the set of image filenames referenced inside markdown content via
 * `![alt](filename)` or `![alt](filename "title")` syntax.
 */
function referencedImageFilenames(content) {
    var refs = new Set();
    var pattern = /!\[[^\]]*\]\(([^)\n]+)\)/g;
    var match;
    while ((match = pattern.exec(content)) !== null) {
        if (match[1]) {
            refs.add(decodeMarkdownImageFilename(extractImageDestination(match[1])));
        }
    }
    return refs;
}
/**
 * Returns a map of `filename -> alt text` for markdown image references.
 */
function referencedImageCaptions(content) {
    var _a;
    var refs = new Map();
    var pattern = /!\[([^\]]*)\]\(([^)\n]+)\)/g;
    var match;
    while ((match = pattern.exec(content)) !== null) {
        if (match[2]) {
            refs.set(decodeMarkdownImageFilename(extractImageDestination(match[2])), (_a = match[1]) !== null && _a !== void 0 ? _a : '');
        }
    }
    return refs;
}
/**
 * Removes markdown image references for a given filename and collapses any
 * oversized blank-line runs left behind.
 */
function removeImageMarkdownReferences(content, filename) {
    var escapeRegex = function (value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };
    var escapedFilename = escapeRegex(filename);
    var escapedEncodedFilename = escapeRegex(encodeMarkdownImageFilename(filename));
    var pattern = new RegExp(String.raw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["![[^]]*]((?:", "|", ")(?:s+\"[^\"]*\")?)"], ["!\\[[^\\]]*\\]\\((?:", "|", ")(?:\\s+\"[^\"]*\")?\\)"])), escapedFilename, escapedEncodedFilename), 'g');
    return content
        .replace(pattern, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}
var templateObject_1;
