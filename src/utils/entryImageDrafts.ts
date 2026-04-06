import type { DraftImageResponse, ImageResponse } from '../generated/types';
import { referencedImageCaptions, referencedImageFilenames } from './markdown';

export type EntryImageDraftSource = 'local' | 'server';
// 'draft-uploading' means bytes sent to storage, background task processing
// 'draft-ready' means server confirmed the draft image is ready
export type EntryImageDraftStatus =
  | 'local'
  | 'uploading'
  | 'draft-uploading'
  | 'draft-ready'
  | 'ready'
  | 'failed';

export interface EntryImageDraft {
  localId: string;
  source: EntryImageDraftSource;
  status: EntryImageDraftStatus;
  image: ImageResponse | null;
  /** Server-side draft image id (from DraftImageResponse), if this image has been uploaded to a draft */
  draftImageId: string | null;
  file: File | null;
  filename: string;
  previewUrl: string | null;
  captionDraft: string;
  removed: boolean;
  error: string;
}

function imageResponseFromDraftImage(
  draftImage: DraftImageResponse,
): ImageResponse | null {
  if (!draftImage.live_image_id) return null;

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
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createLocalImageDraft(file: File): EntryImageDraft {
  return {
    localId: nextDraftId(),
    source: 'local',
    status: 'local',
    image: null,
    draftImageId: null,
    file,
    filename: file.name,
    previewUrl: URL.createObjectURL(file),
    captionDraft: '',
    removed: false,
    error: '',
  };
}

export function createServerImageDraft(
  image: ImageResponse,
  captionDraft = '',
): EntryImageDraft {
  return {
    localId: nextDraftId(),
    source: 'server',
    status: 'ready',
    image,
    draftImageId: null,
    file: null,
    filename: image.filename,
    previewUrl: null,
    captionDraft,
    removed: false,
    error: '',
  };
}

/**
 * Create a draft entry from a DraftImageResponse (for images already in a server draft).
 * Used when re-opening or resuming a draft.
 */
export function createDraftServerImageDraft(
  draftImage: DraftImageResponse,
  captionDraft = '',
): EntryImageDraft {
  const isDraftReady = draftImage.status === 'ready';
  const isDraftFailed = draftImage.status === 'failed';
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
    captionDraft,
    removed: false,
    error: isDraftFailed ? 'Processing failed.' : '',
  };
}

export function mergeDraftImageFromServer(
  draft: EntryImageDraft,
  draftImage: DraftImageResponse,
): EntryImageDraft {
  const isDraftReady = draftImage.status === 'ready';
  const isDraftFailed = draftImage.status === 'failed';
  return {
    ...draft,
    image: imageResponseFromDraftImage(draftImage),
    draftImageId: String(draftImage.id),
    filename: draftImage.filename,
    status: isDraftReady
      ? 'draft-ready'
      : isDraftFailed
        ? 'failed'
        : 'draft-uploading',
    error: isDraftFailed ? draft.error || 'Processing failed.' : '',
  };
}

export function buildLocalImageUrlMap(drafts: EntryImageDraft[]) {
  const map: Record<string, string> = {};
  for (const draft of drafts) {
    if (!draft.removed && draft.previewUrl) {
      map[draft.filename] = draft.previewUrl;
    }
  }
  return map;
}

export function syncDraftCaptionsFromContent(
  drafts: EntryImageDraft[],
  content: string,
) {
  const captionMap = referencedImageCaptions(content);
  return drafts.map((draft) => ({
    ...draft,
    captionDraft: captionMap.get(draft.filename) ?? draft.captionDraft,
  }));
}

export function getAttachedImageResponses(drafts: EntryImageDraft[]) {
  return drafts
    .filter((draft) => !draft.removed && draft.image)
    .map((draft) => draft.image as ImageResponse);
}

export function getAttachedImageFilenames(drafts: EntryImageDraft[]) {
  return drafts
    .filter((draft) => !draft.removed)
    .map((draft) => draft.filename);
}

/**
 * Returns the draft image IDs for all non-removed server-draft images.
 * Used to track which draft images to include in commits.
 */
export function getAttachedDraftImageIds(drafts: EntryImageDraft[]) {
  return drafts
    .filter((draft) => !draft.removed && draft.draftImageId)
    .map((draft) => draft.draftImageId as string);
}

export function appendMissingImageMarkdown(
  content: string,
  drafts: EntryImageDraft[],
) {
  const refs = referencedImageFilenames(content);
  let nextContent = content;

  for (const draft of drafts) {
    if (draft.removed || refs.has(draft.filename)) continue;
    const snippet = `![${draft.captionDraft.trim() || draft.filename}](${draft.filename})`;
    nextContent = nextContent
      ? `${nextContent.trimEnd()}\n\n${snippet}`
      : snippet;
    refs.add(draft.filename);
  }

  return nextContent;
}

export function revokeDraftPreviewUrl(draft: EntryImageDraft) {
  if (draft.source === 'local' && draft.previewUrl) {
    URL.revokeObjectURL(draft.previewUrl);
  }
}
