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
var vitest_1 = require("vitest");
// jsdom does not provide URL.createObjectURL / revokeObjectURL
(0, vitest_1.beforeAll)(function () {
    if (typeof URL.createObjectURL === 'undefined') {
        URL.createObjectURL = function () { return 'blob:http://localhost/stub'; };
        URL.revokeObjectURL = function () { };
    }
});
var entryImageDrafts_1 = require("../utils/entryImageDrafts");
var markdown_1 = require("../utils/markdown");
// ─── Fixtures ────────────────────────────────────────────────────────────────
function makeImageResponse(overrides) {
    var _a, _b, _c;
    if (overrides === void 0) { overrides = {}; }
    return {
        id: (_a = overrides.id) !== null && _a !== void 0 ? _a : 'img-1',
        entry_id: (_b = overrides.entry_id) !== null && _b !== void 0 ? _b : 'entry-1',
        filename: (_c = overrides.filename) !== null && _c !== void 0 ? _c : 'river.jpg',
        status: 'ready',
        strip_metadata: true,
        content_type: 'image/jpeg',
        byte_size: 123,
    };
}
function makeDraftImageResponse(overrides) {
    var _a, _b, _c, _d;
    if (overrides === void 0) { overrides = {}; }
    return {
        id: (_a = overrides.id) !== null && _a !== void 0 ? _a : 'dimg-1',
        draft_id: 'draft-1',
        source: 'upload',
        live_image_id: (_b = overrides.live_image_id) !== null && _b !== void 0 ? _b : null,
        filename: (_c = overrides.filename) !== null && _c !== void 0 ? _c : 'photo.jpg',
        status: (_d = overrides.status) !== null && _d !== void 0 ? _d : 'ready',
        content_type: 'image/jpeg',
        strip_metadata: true,
        byte_size: 456,
        client_image_id: null,
    };
}
// ─── appendMissingImageMarkdown ───────────────────────────────────────────────
(0, vitest_1.describe)('appendMissingImageMarkdown', function () {
    (0, vitest_1.it)('appends markdown for attached images not yet referenced', function () {
        var drafts = [
            (0, entryImageDrafts_1.createServerImageDraft)(makeImageResponse({ filename: 'river.jpg' }), 'River mist'),
        ];
        (0, vitest_1.expect)((0, entryImageDrafts_1.appendMissingImageMarkdown)('Morning notes', drafts)).toBe('Morning notes\n\n![River mist](river.jpg)');
    });
    (0, vitest_1.it)('does not duplicate markdown when image is already referenced', function () {
        var drafts = [
            (0, entryImageDrafts_1.createServerImageDraft)(makeImageResponse({ filename: 'river.jpg' })),
        ];
        var content = 'Morning notes\n\n![River](river.jpg)';
        (0, vitest_1.expect)((0, entryImageDrafts_1.appendMissingImageMarkdown)(content, drafts)).toBe(content);
    });
    (0, vitest_1.it)('skips drafts with removed=true', function () {
        var draft = __assign(__assign({}, (0, entryImageDrafts_1.createServerImageDraft)(makeImageResponse())), { removed: true });
        (0, vitest_1.expect)((0, entryImageDrafts_1.appendMissingImageMarkdown)('Morning notes', [draft])).toBe('Morning notes');
    });
    (0, vitest_1.it)('appends multiple missing images in order', function () {
        var drafts = [
            (0, entryImageDrafts_1.createServerImageDraft)(makeImageResponse({ filename: 'a.jpg' }), 'A'),
            (0, entryImageDrafts_1.createServerImageDraft)(makeImageResponse({ filename: 'b.jpg' }), 'B'),
        ];
        var result = (0, entryImageDrafts_1.appendMissingImageMarkdown)('Notes', drafts);
        (0, vitest_1.expect)(result).toBe('Notes\n\n![A](a.jpg)\n\n![B](b.jpg)');
    });
    (0, vitest_1.it)('uses filename as alt text when captionDraft is empty', function () {
        var drafts = [
            (0, entryImageDrafts_1.createServerImageDraft)(makeImageResponse({ filename: 'river.jpg' })),
        ];
        (0, vitest_1.expect)((0, entryImageDrafts_1.appendMissingImageMarkdown)('Notes', drafts)).toBe('Notes\n\n![river.jpg](river.jpg)');
    });
    (0, vitest_1.it)('handles empty content string', function () {
        var drafts = [
            (0, entryImageDrafts_1.createServerImageDraft)(makeImageResponse({ filename: 'river.jpg' }), 'River'),
        ];
        (0, vitest_1.expect)((0, entryImageDrafts_1.appendMissingImageMarkdown)('', drafts)).toBe('![River](river.jpg)');
    });
});
// ─── syncDraftCaptionsFromContent / removeImageMarkdownReferences ─────────────
(0, vitest_1.describe)('syncDraftCaptionsFromContent', function () {
    (0, vitest_1.it)('syncs caption drafts from existing markdown references', function () {
        var _a;
        var drafts = (0, entryImageDrafts_1.syncDraftCaptionsFromContent)([(0, entryImageDrafts_1.createServerImageDraft)(makeImageResponse({ filename: 'river.jpg' }))], 'Before\n\n![River mist](river.jpg)\n\nAfter');
        (0, vitest_1.expect)((_a = drafts[0]) === null || _a === void 0 ? void 0 : _a.captionDraft).toBe('River mist');
    });
    (0, vitest_1.it)('syncs captions from encoded markdown filenames', function () {
        var _a;
        var drafts = (0, entryImageDrafts_1.syncDraftCaptionsFromContent)([
            (0, entryImageDrafts_1.createServerImageDraft)(makeImageResponse({
                filename: 'ChatGPT Image Apr 29, 2025, 07_47_54 AM.png',
            })),
        ], '![Caption](ChatGPT%20Image%20Apr%2029%2C%202025%2C%2007_47_54%20AM.png)');
        (0, vitest_1.expect)((_a = drafts[0]) === null || _a === void 0 ? void 0 : _a.captionDraft).toBe('Caption');
    });
    (0, vitest_1.it)('preserves existing captionDraft when filename is not referenced in content', function () {
        var draft = (0, entryImageDrafts_1.createServerImageDraft)(makeImageResponse({ filename: 'river.jpg' }), 'My caption');
        var updated = (0, entryImageDrafts_1.syncDraftCaptionsFromContent)([draft], 'No image here')[0];
        (0, vitest_1.expect)(updated === null || updated === void 0 ? void 0 : updated.captionDraft).toBe('My caption');
    });
    (0, vitest_1.it)('does not affect drafts with different filenames', function () {
        var draft = (0, entryImageDrafts_1.createServerImageDraft)(makeImageResponse({ filename: 'other.jpg' }), 'Other');
        var updated = (0, entryImageDrafts_1.syncDraftCaptionsFromContent)([draft], '![River](river.jpg)')[0];
        (0, vitest_1.expect)(updated === null || updated === void 0 ? void 0 : updated.captionDraft).toBe('Other');
    });
});
(0, vitest_1.describe)('removeImageMarkdownReferences', function () {
    (0, vitest_1.it)('removes an image markdown reference from content', function () {
        (0, vitest_1.expect)((0, markdown_1.removeImageMarkdownReferences)('Before\n\n![River mist](river.jpg)\n\nAfter', 'river.jpg')).toBe('Before\n\nAfter');
    });
    (0, vitest_1.it)('returns content unchanged when filename is not referenced', function () {
        var content = 'No images here.';
        (0, vitest_1.expect)((0, markdown_1.removeImageMarkdownReferences)(content, 'river.jpg')).toBe(content);
    });
    (0, vitest_1.it)('removes an image markdown reference that uses an encoded filename', function () {
        (0, vitest_1.expect)((0, markdown_1.removeImageMarkdownReferences)('Before\n\n![Caption](ChatGPT%20Image%20Apr%2029%2C%202025%2C%2007_47_54%20AM.png)\n\nAfter', 'ChatGPT Image Apr 29, 2025, 07_47_54 AM.png')).toBe('Before\n\nAfter');
    });
});
// ─── getAttachedImageResponses ────────────────────────────────────────────────
(0, vitest_1.describe)('getAttachedImageResponses', function () {
    (0, vitest_1.it)('returns ImageResponse objects for non-removed server drafts', function () {
        var _a;
        var image = makeImageResponse({ filename: 'river.jpg' });
        var draft = (0, entryImageDrafts_1.createServerImageDraft)(image);
        var result = (0, entryImageDrafts_1.getAttachedImageResponses)([draft]);
        (0, vitest_1.expect)(result).toHaveLength(1);
        (0, vitest_1.expect)((_a = result[0]) === null || _a === void 0 ? void 0 : _a.filename).toBe('river.jpg');
    });
    (0, vitest_1.it)('excludes drafts with removed=true', function () {
        var image = makeImageResponse();
        var draft = __assign(__assign({}, (0, entryImageDrafts_1.createServerImageDraft)(image)), { removed: true });
        (0, vitest_1.expect)((0, entryImageDrafts_1.getAttachedImageResponses)([draft])).toHaveLength(0);
    });
    (0, vitest_1.it)('excludes drafts with no image (local uploads)', function () {
        var file = new File([''], 'photo.jpg', { type: 'image/jpeg' });
        var draft = (0, entryImageDrafts_1.createLocalImageDraft)(file);
        (0, vitest_1.expect)((0, entryImageDrafts_1.getAttachedImageResponses)([draft])).toHaveLength(0);
    });
    (0, vitest_1.it)('returns a live image response for ready draft images', function () {
        var draft = (0, entryImageDrafts_1.createDraftServerImageDraft)(makeDraftImageResponse({
            filename: 'river.jpg',
            status: 'ready',
            live_image_id: 'img-live-1',
        }));
        (0, vitest_1.expect)((0, entryImageDrafts_1.getAttachedImageResponses)([draft])).toEqual([
            vitest_1.expect.objectContaining({
                id: 'img-live-1',
                filename: 'river.jpg',
            }),
        ]);
    });
    (0, vitest_1.it)('returns responses from multiple non-removed drafts', function () {
        var a = (0, entryImageDrafts_1.createServerImageDraft)(makeImageResponse({ id: 'img-a', filename: 'a.jpg' }));
        var b = (0, entryImageDrafts_1.createServerImageDraft)(makeImageResponse({ id: 'img-b', filename: 'b.jpg' }));
        var removed = __assign(__assign({}, (0, entryImageDrafts_1.createServerImageDraft)(makeImageResponse({ id: 'img-c', filename: 'c.jpg' }))), { removed: true });
        var result = (0, entryImageDrafts_1.getAttachedImageResponses)([a, b, removed]);
        (0, vitest_1.expect)(result).toHaveLength(2);
        (0, vitest_1.expect)(result.map(function (r) { return r.filename; })).toEqual(['a.jpg', 'b.jpg']);
    });
});
// ─── getAttachedImageFilenames ────────────────────────────────────────────────
(0, vitest_1.describe)('getAttachedImageFilenames', function () {
    (0, vitest_1.it)('returns filenames for non-removed drafts', function () {
        var a = (0, entryImageDrafts_1.createServerImageDraft)(makeImageResponse({ filename: 'a.jpg' }));
        var b = (0, entryImageDrafts_1.createDraftServerImageDraft)(makeDraftImageResponse({ filename: 'b.jpg' }));
        (0, vitest_1.expect)((0, entryImageDrafts_1.getAttachedImageFilenames)([a, b])).toEqual(['a.jpg', 'b.jpg']);
    });
    (0, vitest_1.it)('excludes removed drafts', function () {
        var a = (0, entryImageDrafts_1.createServerImageDraft)(makeImageResponse({ filename: 'a.jpg' }));
        var removed = __assign(__assign({}, (0, entryImageDrafts_1.createServerImageDraft)(makeImageResponse({ filename: 'b.jpg' }))), { removed: true });
        (0, vitest_1.expect)((0, entryImageDrafts_1.getAttachedImageFilenames)([a, removed])).toEqual(['a.jpg']);
    });
    (0, vitest_1.it)('returns empty array when all drafts are removed', function () {
        var draft = __assign(__assign({}, (0, entryImageDrafts_1.createServerImageDraft)(makeImageResponse())), { removed: true });
        (0, vitest_1.expect)((0, entryImageDrafts_1.getAttachedImageFilenames)([draft])).toEqual([]);
    });
});
// ─── getAttachedDraftImageIds ─────────────────────────────────────────────────
(0, vitest_1.describe)('getAttachedDraftImageIds', function () {
    (0, vitest_1.it)('returns draftImageIds for non-removed drafts that have one', function () {
        var draft = (0, entryImageDrafts_1.createDraftServerImageDraft)(makeDraftImageResponse({ id: 'dimg-42', filename: 'photo.jpg' }));
        (0, vitest_1.expect)((0, entryImageDrafts_1.getAttachedDraftImageIds)([draft])).toEqual(['dimg-42']);
    });
    (0, vitest_1.it)('excludes drafts with removed=true', function () {
        var draft = __assign(__assign({}, (0, entryImageDrafts_1.createDraftServerImageDraft)(makeDraftImageResponse({ id: 'dimg-1' }))), { removed: true });
        (0, vitest_1.expect)((0, entryImageDrafts_1.getAttachedDraftImageIds)([draft])).toEqual([]);
    });
    (0, vitest_1.it)('excludes drafts with no draftImageId (server/live images)', function () {
        var draft = (0, entryImageDrafts_1.createServerImageDraft)(makeImageResponse());
        // server image from entry — no draftImageId
        (0, vitest_1.expect)((0, entryImageDrafts_1.getAttachedDraftImageIds)([draft])).toEqual([]);
    });
    (0, vitest_1.it)('returns ids from multiple non-removed draft images', function () {
        var a = (0, entryImageDrafts_1.createDraftServerImageDraft)(makeDraftImageResponse({ id: 'dimg-1' }));
        var b = (0, entryImageDrafts_1.createDraftServerImageDraft)(makeDraftImageResponse({ id: 'dimg-2' }));
        var removed = __assign(__assign({}, (0, entryImageDrafts_1.createDraftServerImageDraft)(makeDraftImageResponse({ id: 'dimg-3' }))), { removed: true });
        (0, vitest_1.expect)((0, entryImageDrafts_1.getAttachedDraftImageIds)([a, b, removed])).toEqual([
            'dimg-1',
            'dimg-2',
        ]);
    });
});
// ─── createDraftServerImageDraft ─────────────────────────────────────────────
(0, vitest_1.describe)('createDraftServerImageDraft', function () {
    (0, vitest_1.it)('creates a draft-ready draft when status is ready', function () {
        var draft = (0, entryImageDrafts_1.createDraftServerImageDraft)(makeDraftImageResponse({ id: 'dimg-10', status: 'ready' }));
        (0, vitest_1.expect)(draft.status).toBe('draft-ready');
        (0, vitest_1.expect)(draft.draftImageId).toBe('dimg-10');
        (0, vitest_1.expect)(draft.removed).toBe(false);
        (0, vitest_1.expect)(draft.source).toBe('server');
        (0, vitest_1.expect)(draft.image).toBeNull();
    });
    (0, vitest_1.it)('creates a draft-uploading draft when status is pending', function () {
        var draft = (0, entryImageDrafts_1.createDraftServerImageDraft)(makeDraftImageResponse({ status: 'pending' }));
        (0, vitest_1.expect)(draft.status).toBe('draft-uploading');
    });
    (0, vitest_1.it)('creates a failed draft when status is failed', function () {
        var draft = (0, entryImageDrafts_1.createDraftServerImageDraft)(makeDraftImageResponse({ status: 'failed' }));
        (0, vitest_1.expect)(draft.status).toBe('failed');
        (0, vitest_1.expect)(draft.error).toBe('Processing failed.');
    });
    (0, vitest_1.it)('uses the provided captionDraft', function () {
        var draft = (0, entryImageDrafts_1.createDraftServerImageDraft)(makeDraftImageResponse({ filename: 'photo.jpg' }), 'A lovely photo');
        (0, vitest_1.expect)(draft.captionDraft).toBe('A lovely photo');
    });
    (0, vitest_1.it)('defaults captionDraft to empty string', function () {
        var draft = (0, entryImageDrafts_1.createDraftServerImageDraft)(makeDraftImageResponse());
        (0, vitest_1.expect)(draft.captionDraft).toBe('');
    });
});
// ─── buildLocalImageUrlMap ────────────────────────────────────────────────────
(0, vitest_1.describe)('buildLocalImageUrlMap', function () {
    (0, vitest_1.it)('maps filename to previewUrl for local drafts with a URL', function () {
        // We can't call createLocalImageDraft in tests easily (requires File),
        // so we construct a draft with a known previewUrl directly.
        var file = new File([''], 'photo.jpg', { type: 'image/jpeg' });
        var draft = (0, entryImageDrafts_1.createLocalImageDraft)(file);
        // Override previewUrl since URL.createObjectURL is a no-op in jsdom
        var draftWithUrl = __assign(__assign({}, draft), { previewUrl: 'blob:http://localhost/abc' });
        var map = (0, entryImageDrafts_1.buildLocalImageUrlMap)([draftWithUrl]);
        (0, vitest_1.expect)(map['photo.jpg']).toBe('blob:http://localhost/abc');
    });
    (0, vitest_1.it)('excludes drafts with removed=true', function () {
        var file = new File([''], 'photo.jpg', { type: 'image/jpeg' });
        var draft = __assign(__assign({}, (0, entryImageDrafts_1.createLocalImageDraft)(file)), { previewUrl: 'blob:http://localhost/abc', removed: true });
        var map = (0, entryImageDrafts_1.buildLocalImageUrlMap)([draft]);
        (0, vitest_1.expect)(map['photo.jpg']).toBeUndefined();
    });
    (0, vitest_1.it)('excludes drafts with no previewUrl', function () {
        var draft = (0, entryImageDrafts_1.createServerImageDraft)(makeImageResponse({ filename: 'server.jpg' }));
        // server drafts have no previewUrl
        var map = (0, entryImageDrafts_1.buildLocalImageUrlMap)([draft]);
        (0, vitest_1.expect)(map['server.jpg']).toBeUndefined();
    });
    (0, vitest_1.it)('returns empty map when drafts array is empty', function () {
        (0, vitest_1.expect)((0, entryImageDrafts_1.buildLocalImageUrlMap)([])).toEqual({});
    });
    (0, vitest_1.it)('maps multiple local drafts', function () {
        var file1 = new File([''], 'a.jpg', { type: 'image/jpeg' });
        var file2 = new File([''], 'b.jpg', { type: 'image/jpeg' });
        var draft1 = __assign(__assign({}, (0, entryImageDrafts_1.createLocalImageDraft)(file1)), { previewUrl: 'blob://a' });
        var draft2 = __assign(__assign({}, (0, entryImageDrafts_1.createLocalImageDraft)(file2)), { previewUrl: 'blob://b' });
        var map = (0, entryImageDrafts_1.buildLocalImageUrlMap)([draft1, draft2]);
        (0, vitest_1.expect)(map['a.jpg']).toBe('blob://a');
        (0, vitest_1.expect)(map['b.jpg']).toBe('blob://b');
    });
});
