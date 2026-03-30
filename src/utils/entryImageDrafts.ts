import type { ImageResponse } from '../generated/types';
import { referencedImageCaptions, referencedImageFilenames } from './markdown';

export type EntryImageDraftSource = 'local' | 'server';
export type EntryImageDraftStatus = 'local' | 'uploading' | 'ready' | 'failed';

export interface EntryImageDraft {
  localId: string;
  source: EntryImageDraftSource;
  status: EntryImageDraftStatus;
  image: ImageResponse | null;
  file: File | null;
  filename: string;
  previewUrl: string | null;
  captionDraft: string;
  removed: boolean;
  error: string;
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
    file: null,
    filename: image.filename,
    previewUrl: null,
    captionDraft,
    removed: false,
    error: '',
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
