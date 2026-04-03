import { beforeAll, describe, expect, it } from 'vitest';

// jsdom does not provide URL.createObjectURL / revokeObjectURL
beforeAll(() => {
  if (typeof URL.createObjectURL === 'undefined') {
    URL.createObjectURL = () => 'blob:http://localhost/stub';
    URL.revokeObjectURL = () => {};
  }
});

import {
  appendMissingImageMarkdown,
  buildLocalImageUrlMap,
  createDraftServerImageDraft,
  createLocalImageDraft,
  createServerImageDraft,
  getAttachedDraftImageIds,
  getAttachedImageFilenames,
  getAttachedImageResponses,
  syncDraftCaptionsFromContent,
} from '../utils/entryImageDrafts';
import { removeImageMarkdownReferences } from '../utils/markdown';

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeImageResponse(
  overrides: Partial<{
    id: string;
    entry_id: string;
    filename: string;
  }> = {},
) {
  return {
    id: overrides.id ?? 'img-1',
    entry_id: overrides.entry_id ?? 'entry-1',
    filename: overrides.filename ?? 'river.jpg',
    status: 'ready' as const,
    strip_metadata: true,
    content_type: 'image/jpeg',
    byte_size: 123,
  };
}

function makeDraftImageResponse(
  overrides: Partial<{
    id: string;
    filename: string;
    status: 'ready' | 'pending' | 'failed';
    live_image_id: string | null;
  }> = {},
) {
  return {
    id: overrides.id ?? 'dimg-1',
    draft_id: 'draft-1',
    source: 'upload' as const,
    live_image_id: overrides.live_image_id ?? null,
    filename: overrides.filename ?? 'photo.jpg',
    status: overrides.status ?? 'ready',
    content_type: 'image/jpeg',
    strip_metadata: true,
    byte_size: 456,
    client_image_id: null,
  };
}

// ─── appendMissingImageMarkdown ───────────────────────────────────────────────

describe('appendMissingImageMarkdown', () => {
  it('appends markdown for attached images not yet referenced', () => {
    const drafts = [
      createServerImageDraft(
        makeImageResponse({ filename: 'river.jpg' }),
        'River mist',
      ),
    ];
    expect(appendMissingImageMarkdown('Morning notes', drafts)).toBe(
      'Morning notes\n\n![River mist](river.jpg)',
    );
  });

  it('does not duplicate markdown when image is already referenced', () => {
    const drafts = [
      createServerImageDraft(makeImageResponse({ filename: 'river.jpg' })),
    ];
    const content = 'Morning notes\n\n![River](river.jpg)';
    expect(appendMissingImageMarkdown(content, drafts)).toBe(content);
  });

  it('skips drafts with removed=true', () => {
    const draft = {
      ...createServerImageDraft(makeImageResponse()),
      removed: true,
    };
    expect(appendMissingImageMarkdown('Morning notes', [draft])).toBe(
      'Morning notes',
    );
  });

  it('appends multiple missing images in order', () => {
    const drafts = [
      createServerImageDraft(makeImageResponse({ filename: 'a.jpg' }), 'A'),
      createServerImageDraft(makeImageResponse({ filename: 'b.jpg' }), 'B'),
    ];
    const result = appendMissingImageMarkdown('Notes', drafts);
    expect(result).toBe('Notes\n\n![A](a.jpg)\n\n![B](b.jpg)');
  });

  it('uses filename as alt text when captionDraft is empty', () => {
    const drafts = [
      createServerImageDraft(makeImageResponse({ filename: 'river.jpg' })),
    ];
    expect(appendMissingImageMarkdown('Notes', drafts)).toBe(
      'Notes\n\n![river.jpg](river.jpg)',
    );
  });

  it('handles empty content string', () => {
    const drafts = [
      createServerImageDraft(
        makeImageResponse({ filename: 'river.jpg' }),
        'River',
      ),
    ];
    expect(appendMissingImageMarkdown('', drafts)).toBe('![River](river.jpg)');
  });
});

// ─── syncDraftCaptionsFromContent / removeImageMarkdownReferences ─────────────

describe('syncDraftCaptionsFromContent', () => {
  it('syncs caption drafts from existing markdown references', () => {
    const drafts = syncDraftCaptionsFromContent(
      [createServerImageDraft(makeImageResponse({ filename: 'river.jpg' }))],
      'Before\n\n![River mist](river.jpg)\n\nAfter',
    );
    expect(drafts[0]?.captionDraft).toBe('River mist');
  });

  it('preserves existing captionDraft when filename is not referenced in content', () => {
    const draft = createServerImageDraft(
      makeImageResponse({ filename: 'river.jpg' }),
      'My caption',
    );
    const [updated] = syncDraftCaptionsFromContent([draft], 'No image here');
    expect(updated?.captionDraft).toBe('My caption');
  });

  it('does not affect drafts with different filenames', () => {
    const draft = createServerImageDraft(
      makeImageResponse({ filename: 'other.jpg' }),
      'Other',
    );
    const [updated] = syncDraftCaptionsFromContent(
      [draft],
      '![River](river.jpg)',
    );
    expect(updated?.captionDraft).toBe('Other');
  });
});

describe('removeImageMarkdownReferences', () => {
  it('removes an image markdown reference from content', () => {
    expect(
      removeImageMarkdownReferences(
        'Before\n\n![River mist](river.jpg)\n\nAfter',
        'river.jpg',
      ),
    ).toBe('Before\n\nAfter');
  });

  it('returns content unchanged when filename is not referenced', () => {
    const content = 'No images here.';
    expect(removeImageMarkdownReferences(content, 'river.jpg')).toBe(content);
  });
});

// ─── getAttachedImageResponses ────────────────────────────────────────────────

describe('getAttachedImageResponses', () => {
  it('returns ImageResponse objects for non-removed server drafts', () => {
    const image = makeImageResponse({ filename: 'river.jpg' });
    const draft = createServerImageDraft(image);
    const result = getAttachedImageResponses([draft]);
    expect(result).toHaveLength(1);
    expect(result[0]?.filename).toBe('river.jpg');
  });

  it('excludes drafts with removed=true', () => {
    const image = makeImageResponse();
    const draft = { ...createServerImageDraft(image), removed: true };
    expect(getAttachedImageResponses([draft])).toHaveLength(0);
  });

  it('excludes drafts with no image (local uploads)', () => {
    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' });
    const draft = createLocalImageDraft(file);
    expect(getAttachedImageResponses([draft])).toHaveLength(0);
  });

  it('returns responses from multiple non-removed drafts', () => {
    const a = createServerImageDraft(
      makeImageResponse({ id: 'img-a', filename: 'a.jpg' }),
    );
    const b = createServerImageDraft(
      makeImageResponse({ id: 'img-b', filename: 'b.jpg' }),
    );
    const removed = {
      ...createServerImageDraft(
        makeImageResponse({ id: 'img-c', filename: 'c.jpg' }),
      ),
      removed: true,
    };
    const result = getAttachedImageResponses([a, b, removed]);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.filename)).toEqual(['a.jpg', 'b.jpg']);
  });
});

// ─── getAttachedImageFilenames ────────────────────────────────────────────────

describe('getAttachedImageFilenames', () => {
  it('returns filenames for non-removed drafts', () => {
    const a = createServerImageDraft(makeImageResponse({ filename: 'a.jpg' }));
    const b = createDraftServerImageDraft(
      makeDraftImageResponse({ filename: 'b.jpg' }),
    );
    expect(getAttachedImageFilenames([a, b])).toEqual(['a.jpg', 'b.jpg']);
  });

  it('excludes removed drafts', () => {
    const a = createServerImageDraft(makeImageResponse({ filename: 'a.jpg' }));
    const removed = {
      ...createServerImageDraft(makeImageResponse({ filename: 'b.jpg' })),
      removed: true,
    };
    expect(getAttachedImageFilenames([a, removed])).toEqual(['a.jpg']);
  });

  it('returns empty array when all drafts are removed', () => {
    const draft = {
      ...createServerImageDraft(makeImageResponse()),
      removed: true,
    };
    expect(getAttachedImageFilenames([draft])).toEqual([]);
  });
});

// ─── getAttachedDraftImageIds ─────────────────────────────────────────────────

describe('getAttachedDraftImageIds', () => {
  it('returns draftImageIds for non-removed drafts that have one', () => {
    const draft = createDraftServerImageDraft(
      makeDraftImageResponse({ id: 'dimg-42', filename: 'photo.jpg' }),
    );
    expect(getAttachedDraftImageIds([draft])).toEqual(['dimg-42']);
  });

  it('excludes drafts with removed=true', () => {
    const draft = {
      ...createDraftServerImageDraft(makeDraftImageResponse({ id: 'dimg-1' })),
      removed: true,
    };
    expect(getAttachedDraftImageIds([draft])).toEqual([]);
  });

  it('excludes drafts with no draftImageId (server/live images)', () => {
    const draft = createServerImageDraft(makeImageResponse());
    // server image from entry — no draftImageId
    expect(getAttachedDraftImageIds([draft])).toEqual([]);
  });

  it('returns ids from multiple non-removed draft images', () => {
    const a = createDraftServerImageDraft(
      makeDraftImageResponse({ id: 'dimg-1' }),
    );
    const b = createDraftServerImageDraft(
      makeDraftImageResponse({ id: 'dimg-2' }),
    );
    const removed = {
      ...createDraftServerImageDraft(makeDraftImageResponse({ id: 'dimg-3' })),
      removed: true,
    };
    expect(getAttachedDraftImageIds([a, b, removed])).toEqual([
      'dimg-1',
      'dimg-2',
    ]);
  });
});

// ─── createDraftServerImageDraft ─────────────────────────────────────────────

describe('createDraftServerImageDraft', () => {
  it('creates a draft-ready draft when status is ready', () => {
    const draft = createDraftServerImageDraft(
      makeDraftImageResponse({ id: 'dimg-10', status: 'ready' }),
    );
    expect(draft.status).toBe('draft-ready');
    expect(draft.draftImageId).toBe('dimg-10');
    expect(draft.removed).toBe(false);
    expect(draft.source).toBe('server');
    expect(draft.image).toBeNull();
  });

  it('creates a draft-uploading draft when status is not ready', () => {
    const draft = createDraftServerImageDraft(
      makeDraftImageResponse({ status: 'pending' }),
    );
    expect(draft.status).toBe('draft-uploading');
  });

  it('uses the provided captionDraft', () => {
    const draft = createDraftServerImageDraft(
      makeDraftImageResponse({ filename: 'photo.jpg' }),
      'A lovely photo',
    );
    expect(draft.captionDraft).toBe('A lovely photo');
  });

  it('defaults captionDraft to empty string', () => {
    const draft = createDraftServerImageDraft(makeDraftImageResponse());
    expect(draft.captionDraft).toBe('');
  });
});

// ─── buildLocalImageUrlMap ────────────────────────────────────────────────────

describe('buildLocalImageUrlMap', () => {
  it('maps filename to previewUrl for local drafts with a URL', () => {
    // We can't call createLocalImageDraft in tests easily (requires File),
    // so we construct a draft with a known previewUrl directly.
    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' });
    const draft = createLocalImageDraft(file);
    // Override previewUrl since URL.createObjectURL is a no-op in jsdom
    const draftWithUrl = { ...draft, previewUrl: 'blob:http://localhost/abc' };

    const map = buildLocalImageUrlMap([draftWithUrl]);
    expect(map['photo.jpg']).toBe('blob:http://localhost/abc');
  });

  it('excludes drafts with removed=true', () => {
    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' });
    const draft = {
      ...createLocalImageDraft(file),
      previewUrl: 'blob:http://localhost/abc',
      removed: true,
    };
    const map = buildLocalImageUrlMap([draft]);
    expect(map['photo.jpg']).toBeUndefined();
  });

  it('excludes drafts with no previewUrl', () => {
    const draft = createServerImageDraft(
      makeImageResponse({ filename: 'server.jpg' }),
    );
    // server drafts have no previewUrl
    const map = buildLocalImageUrlMap([draft]);
    expect(map['server.jpg']).toBeUndefined();
  });

  it('returns empty map when drafts array is empty', () => {
    expect(buildLocalImageUrlMap([])).toEqual({});
  });

  it('maps multiple local drafts', () => {
    const file1 = new File([''], 'a.jpg', { type: 'image/jpeg' });
    const file2 = new File([''], 'b.jpg', { type: 'image/jpeg' });
    const draft1 = { ...createLocalImageDraft(file1), previewUrl: 'blob://a' };
    const draft2 = { ...createLocalImageDraft(file2), previewUrl: 'blob://b' };
    const map = buildLocalImageUrlMap([draft1, draft2]);
    expect(map['a.jpg']).toBe('blob://a');
    expect(map['b.jpg']).toBe('blob://b');
  });
});
