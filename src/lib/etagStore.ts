import { db } from './db';

/**
 * Per-URL conditional-GET cache backing lib/customFetch.ts. Kept as a plain
 * URL->{etag, body} table rather than piggybacking on TanStack Query's own
 * persisted cache (lib/queryPersister.ts), since customFetch has no notion
 * of a query key — only the request URL it was given.
 */

export async function getEtag(
  url: string,
): Promise<{ etag: string; body: unknown } | undefined> {
  try {
    const entry = await db.etagCache.get(url);
    if (!entry) return undefined;
    return { etag: entry.etag, body: entry.body };
  } catch {
    // IndexedDB may be unavailable; behave as if nothing were cached.
    return undefined;
  }
}

export async function setEtag(
  url: string,
  etag: string,
  body: unknown,
): Promise<void> {
  try {
    await db.etagCache.put({ url, etag, body });
  } catch {
    // IndexedDB may be unavailable; the next request just won't send If-None-Match.
  }
}

/** Clear all cached etags — must run on logout so a shared browser never serves
 *  one account's cached response body to the next account that signs in. */
export async function clearEtags(): Promise<void> {
  try {
    await db.etagCache.clear();
  } catch {
    // IndexedDB may be unavailable; nothing to clear.
  }
}
