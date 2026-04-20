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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLocalImageDraft = createLocalImageDraft;
exports.createServerImageDraft = createServerImageDraft;
exports.createDraftServerImageDraft = createDraftServerImageDraft;
exports.mergeDraftImageFromServer = mergeDraftImageFromServer;
exports.buildLocalImageUrlMap = buildLocalImageUrlMap;
exports.syncDraftCaptionsFromContent = syncDraftCaptionsFromContent;
exports.getAttachedImageResponses = getAttachedImageResponses;
exports.getAttachedImageFilenames = getAttachedImageFilenames;
exports.getAttachedDraftImageIds = getAttachedDraftImageIds;
exports.appendMissingImageMarkdown = appendMissingImageMarkdown;
exports.revokeDraftPreviewUrl = revokeDraftPreviewUrl;
var markdown_1 = require("./markdown");
function imageResponseFromDraftImage(draftImage) {
    if (!draftImage.live_image_id)
        return null;
    return {
        id: draftImage.live_image_id,
        entry_id: '',
        filename: draftImage.filename,
        status: draftImage.status,
        strip_metadata: draftImage.strip_metadata,
        content_type: draftImage.content_type,
        byte_size: draftImage.byte_size,
    };
}
function nextDraftId() {
    return "draft-".concat(Date.now(), "-").concat(Math.random().toString(36).slice(2, 8));
}
function createLocalImageDraft(file) {
    return {
        localId: nextDraftId(),
        source: 'local',
        status: 'local',
        image: null,
        draftImageId: null,
        file: file,
        filename: file.name,
        previewUrl: URL.createObjectURL(file),
        captionDraft: '',
        removed: false,
        error: '',
    };
}
function createServerImageDraft(image, captionDraft) {
    if (captionDraft === void 0) { captionDraft = ''; }
    return {
        localId: nextDraftId(),
        source: 'server',
        status: 'ready',
        image: image,
        draftImageId: null,
        file: null,
        filename: image.filename,
        previewUrl: null,
        captionDraft: captionDraft,
        removed: false,
        error: '',
    };
}
/**
 * Create a draft entry from a DraftImageResponse (for images already in a server draft).
 * Used when re-opening or resuming a draft.
 */
function createDraftServerImageDraft(draftImage, captionDraft) {
    if (captionDraft === void 0) { captionDraft = ''; }
    var isDraftReady = draftImage.status === 'ready';
    var isDraftFailed = draftImage.status === 'failed';
    return {
        localId: nextDraftId(),
        source: 'server',
        status: isDraftReady
            ? 'draft-ready'
            : isDraftFailed
                ? 'failed'
                : 'draft-uploading',
        image: imageResponseFromDraftImage(draftImage),
        draftImageId: String(draftImage.id),
        file: null,
        filename: draftImage.filename,
        previewUrl: null,
        captionDraft: captionDraft,
        removed: false,
        error: isDraftFailed ? 'Processing failed.' : '',
    };
}
function mergeDraftImageFromServer(draft, draftImage) {
    var isDraftReady = draftImage.status === 'ready';
    var isDraftFailed = draftImage.status === 'failed';
    return __assign(__assign({}, draft), { image: imageResponseFromDraftImage(draftImage), draftImageId: String(draftImage.id), filename: draftImage.filename, status: isDraftReady
            ? 'draft-ready'
            : isDraftFailed
                ? 'failed'
                : 'draft-uploading', error: isDraftFailed ? draft.error || 'Processing failed.' : '' });
}
function buildLocalImageUrlMap(drafts) {
    var map = {};
    for (var _i = 0, drafts_1 = drafts; _i < drafts_1.length; _i++) {
        var draft = drafts_1[_i];
        if (!draft.removed && draft.previewUrl) {
            map[draft.filename] = draft.previewUrl;
        }
    }
    return map;
}
function syncDraftCaptionsFromContent(drafts, content) {
    var captionMap = (0, markdown_1.referencedImageCaptions)(content);
    return drafts.map(function (draft) {
        var _a;
        return (__assign(__assign({}, draft), { captionDraft: (_a = captionMap.get(draft.filename)) !== null && _a !== void 0 ? _a : draft.captionDraft }));
    });
}
function getAttachedImageResponses(drafts) {
    return drafts
        .filter(function (draft) { return !draft.removed && draft.image; })
        .map(function (draft) { return draft.image; });
}
function getAttachedImageFilenames(drafts) {
    return drafts
        .filter(function (draft) { return !draft.removed; })
        .map(function (draft) { return draft.filename; });
}
/**
 * Returns the draft image IDs for all non-removed server-draft images.
 * Used to track which draft images to include in commits.
 */
function getAttachedDraftImageIds(drafts) {
    return drafts
        .filter(function (draft) { return !draft.removed && draft.draftImageId; })
        .map(function (draft) { return draft.draftImageId; });
}
function appendMissingImageMarkdown(content, drafts) {
    var refs = (0, markdown_1.referencedImageFilenames)(content);
    var nextContent = content;
    for (var _i = 0, drafts_2 = drafts; _i < drafts_2.length; _i++) {
        var draft = drafts_2[_i];
        if (draft.removed || refs.has(draft.filename))
            continue;
        var snippet = "![".concat(draft.captionDraft.trim() || draft.filename, "](").concat(draft.filename, ")");
        nextContent = nextContent
            ? "".concat(nextContent.trimEnd(), "\n\n").concat(snippet)
            : snippet;
        refs.add(draft.filename);
    }
    return nextContent;
}
function revokeDraftPreviewUrl(draft) {
    if (draft.source === 'local' && draft.previewUrl) {
        URL.revokeObjectURL(draft.previewUrl);
    }
}
