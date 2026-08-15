import { kebabCase } from './text';

type DownloadableImage = {
  filename: string;
  caption: string | null;
  content_type: string | null;
};

function extensionFromFilename(filename: string): string | null {
  const match = /\.([a-zA-Z0-9]+)$/.exec(filename);
  return match?.[1] ? match[1].toLowerCase() : null;
}

function extensionFromContentType(contentType: string | null): string | null {
  const subtype = contentType?.split('/')[1];
  if (!subtype) return null;
  return subtype.toLowerCase() === 'jpeg' ? 'jpg' : subtype.toLowerCase();
}

/**
 * Builds a download filename for a full-resolution image: the entry's date
 * plus a kebab-cased slug of the caption (when there is one), keeping the
 * image's original extension.
 */
export function buildImageDownloadFilename(
  day: string,
  image: DownloadableImage,
): string {
  const ext =
    extensionFromFilename(image.filename) ??
    extensionFromContentType(image.content_type) ??
    'jpg';
  const slug = image.caption ? kebabCase(image.caption) : '';
  const base =
    [day, slug].filter(Boolean).join('-') ||
    image.filename.replace(/\.[^./]+$/, '') ||
    'image';
  return `${base}.${ext}`;
}
