import { describe, expect, it } from 'vitest';

import {
  appendMissingImageMarkdown,
  createServerImageDraft,
  syncDraftCaptionsFromContent,
} from '../utils/entryImageDrafts';
import { removeImageMarkdownReferences } from '../utils/markdown';

describe('entry image draft helpers', () => {
  it('appends markdown for attached images that are not yet referenced', () => {
    const drafts = [
      createServerImageDraft(
        {
          id: 'img-1',
          entry_id: 'entry-1',
          filename: 'river.jpg',
          status: 'ready',
          strip_metadata: true,
          content_type: 'image/jpeg',
          byte_size: 123,
        },
        'River mist',
      ),
    ];

    expect(appendMissingImageMarkdown('Morning notes', drafts)).toBe(
      'Morning notes\n\n![River mist](river.jpg)',
    );
  });

  it('syncs caption drafts from existing markdown and removes image references', () => {
    const drafts = syncDraftCaptionsFromContent(
      [
        createServerImageDraft({
          id: 'img-1',
          entry_id: 'entry-1',
          filename: 'river.jpg',
          status: 'ready',
          strip_metadata: true,
          content_type: 'image/jpeg',
          byte_size: 123,
        }),
      ],
      'Before\n\n![River mist](river.jpg)\n\nAfter',
    );

    expect(drafts[0]?.captionDraft).toBe('River mist');
    expect(
      removeImageMarkdownReferences(
        'Before\n\n![River mist](river.jpg)\n\nAfter',
        'river.jpg',
      ),
    ).toBe('Before\n\nAfter');
  });
});
