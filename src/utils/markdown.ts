export function encodeMarkdownImageFilename(filename: string): string {
  return encodeURIComponent(filename).replace(/%2F/g, '/');
}

export function decodeMarkdownImageFilename(filename: string): string {
  try {
    return decodeURIComponent(filename);
  } catch {
    return filename;
  }
}

function extractImageDestination(markdownTarget: string): string {
  const trimmed = markdownTarget.trim();
  const titleMatch = trimmed.match(/^(.*?)(\s+"[^"]*")$/);
  if (titleMatch?.[1]) return titleMatch[1].trim();
  return trimmed;
}

function normalizeImageTarget(markdownTarget: string): string {
  const trimmed = markdownTarget.trim();
  const titleMatch = trimmed.match(/^(.*?)(\s+"[^"]*")$/);
  const destination = titleMatch?.[1] ?? trimmed;
  const suffix = titleMatch?.[2] ?? '';

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(destination)) {
    return `${destination}${suffix}`;
  }

  return `${encodeMarkdownImageFilename(decodeMarkdownImageFilename(destination))}${suffix}`;
}

export function normalizeMarkdownImageFilenames(content: string): string {
  return content.replace(
    /!\[([^\]]*)\]\(([^)\n]+)\)/g,
    (_match, alt, target) => {
      return `![${alt}](${normalizeImageTarget(target)})`;
    },
  );
}

/**
 * Returns the set of image filenames referenced inside markdown content via
 * `![alt](filename)` or `![alt](filename "title")` syntax.
 */
export function referencedImageFilenames(content: string): Set<string> {
  const refs = new Set<string>();
  const pattern = /!\[[^\]]*\]\(([^)\n]+)\)/g;
  let match: RegExpExecArray | null;
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
export function referencedImageCaptions(content: string): Map<string, string> {
  const refs = new Map<string, string>();
  const pattern = /!\[([^\]]*)\]\(([^)\n]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    if (match[2]) {
      refs.set(
        decodeMarkdownImageFilename(extractImageDestination(match[2])),
        match[1] ?? '',
      );
    }
  }
  return refs;
}

/**
 * Removes markdown image references for a given filename and collapses any
 * oversized blank-line runs left behind.
 */
export function removeImageMarkdownReferences(
  content: string,
  filename: string,
): string {
  const escapeRegex = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedFilename = escapeRegex(filename);
  const escapedEncodedFilename = escapeRegex(
    encodeMarkdownImageFilename(filename),
  );
  const pattern = new RegExp(
    String.raw`!\[[^\]]*\]\((?:${escapedFilename}|${escapedEncodedFilename})(?:\s+"[^"]*")?\)`,
    'g',
  );
  return content
    .replace(pattern, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
