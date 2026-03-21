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
