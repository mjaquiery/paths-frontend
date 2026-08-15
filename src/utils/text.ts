/**
 * Aggressively converts arbitrary text into a kebab-case slug: lowercased,
 * ASCII alphanumerics only, hyphen-separated, truncated to a sensible length
 * without cutting a word in half.
 */
export function kebabCase(input: string, maxLength = 60): string {
  const full = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (full.length <= maxLength) return full;

  const truncated = full.slice(0, maxLength);
  const lastHyphen = truncated.lastIndexOf('-');
  const trimmed = lastHyphen > 0 ? truncated.slice(0, lastHyphen) : truncated;
  return trimmed.replace(/-+$/, '');
}
