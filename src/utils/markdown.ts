/**
 * Returns the set of image filenames referenced inside markdown content via
 * `![alt](filename)` or `![alt](filename "title")` syntax.
 */
export function referencedImageFilenames(content: string): Set<string> {
  const refs = new Set<string>();
  const pattern = /!\[[^\]]*\]\(([^)\s"]+)[^)]*\)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    if (match[1]) refs.add(match[1]);
  }
  return refs;
}

/**
 * Returns a map of `filename -> alt text` for markdown image references.
 */
export function referencedImageCaptions(content: string): Map<string, string> {
  const refs = new Map<string, string>();
  const pattern = /!\[([^\]]*)\]\(([^)\s"]+)[^)]*\)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    if (match[2]) refs.set(match[2], match[1] ?? '');
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
  const escapedFilename = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    String.raw`!\[[^\]]*\]\(${escapedFilename}(?:\s+"[^"]*")?\)`,
    'g',
  );
  return content
    .replace(pattern, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
