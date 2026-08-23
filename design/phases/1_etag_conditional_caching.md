# Phase 1 — ETag-Aware Fetch Layer + Version-Diff Polling

## Objective

Make `customFetch.ts` conditional-GET aware — store an ETag + last body per
URL, send `If-None-Match`, transparently resolve a `304` into the cached
body — and replace `useMultiPathEntries`'s per-path 25s full-list poll with
a single cheap bulk version-map poll that only triggers real refetches for
entries whose version actually changed.

## Why this exists

- Backend Phase 5 (`paths` repo, `design/phases/5_etag_conditional_caching.md`)
  adds ETag/304 support and a bulk versions endpoint; this phase consumes it.
- The actual responsiveness/bandwidth cost today is in
  `useMultiPathEntries.ts:56-68` — it refetches the full entry list for
  every subscribed path every 25s regardless of whether anything changed.
- Keeping the change inside the fetch layer makes it transparent to the
  orval-generated hooks and existing composables: no changes needed to
  `src/generated/apiClient.ts` (do-not-edit) or to individual `useX` call
  sites outside `useMultiPathEntries`.

## Scope

### In scope

1. `src/lib/etagStore.ts` (new): a small Dexie table (`{url, etag, body}`)
   alongside the existing query-cache persister, with get/set/clear.
2. `customFetch.ts` changes (`src/lib/customFetch.ts`):
   - Before a GET request: look up the stored etag for the request URL,
     attach `If-None-Match`.
   - After the response: on `304`, return the stored body (still shaped as
     `{data, status, headers}` per the existing contract, `status`
     normalized to `200` for callers); on `200`, store the new etag + body,
     return normally.
   - Clear the etag cache on logout (existing 401 handler at
     `customFetch.ts:112-116`, which calls `clearSession()`) to prevent
     cross-account leakage in a shared browser. **Finding from this repo's
     current code:** `clearSession()` (`src/lib/authSession.ts:11-15`)
     clears `localStorage` only — it does not currently clear the Dexie
     query-cache persister either, so this is a pre-existing gap, not just
     a new risk this feature introduces. Wire etag-cache clearing into
     `clearSession()` and flag the query-cache gap for a follow-up.
   - XHR upload path (`customFetch.ts:121-157`) untouched — mutations, not
     cacheable GETs.
3. New composable `useEntryVersions` (or extend `useMultiPathEntries`):
   polls the bulk versions endpoint (`GET /v1/entries/versions?path_ids=...`)
   on the existing 25s interval; diffs the returned
   `{path_id: {entry_id: edit_id}}` map against a locally held last-known
   map; for entries whose `edit_id` changed, calls
   `queryClient.invalidateQueries` on just those entry keys instead of the
   whole list.
4. Dexie schema version bump (new `etagCache` table) alongside the existing
   `queryCache` table used by `queryPersister.ts`.

### Out of scope (this phase)

- Native `fetch()` browser HTTP caching. Explicit decision to keep this
  app-level/explicit: Bearer-token auth on every request makes relying on
  the browser's own HTTP cache behavior unreliable to depend on without
  separate verification.
- Changing `staleTime: Infinity` on `edit_id`-keyed content queries
  (`useMultiPathEntries.ts:157-158`) — that pattern is already effectively
  "immutable per version," and is complementary to (not replaced by) ETag
  caching.
- Applying etag handling to endpoints beyond the backend's pilot set (paths,
  entries) until backend Phase 5 extends coverage.

## Proposed implementation

### `etagStore.ts`

```ts
interface EtagRecord {
  url: string;
  etag: string;
  body: unknown;
}
// Dexie table `etagCache`, keyed by url
export async function getEtag(url: string): Promise<EtagRecord | undefined>;
export async function setEtag(
  url: string,
  etag: string,
  body: unknown,
): Promise<void>;
export async function clearEtags(): Promise<void>; // called from clearSession()
```

### `customFetch.ts` (sketch, GET path only)

```ts
if (method === 'GET') {
  const cached = await getEtag(url);
  if (cached) headers['If-None-Match'] = cached.etag;
}
const response = await fetch(url, { ...opts, headers });
if (response.status === 304 && cached) {
  return { data: cached.body, status: 200, headers: response.headers };
}
const data = await response.json();
const etag = response.headers.get('ETag');
if (method === 'GET' && etag) await setEtag(url, etag, data);
return { data, status: response.status, headers: response.headers };
```

### Version-diff polling

Replace the per-path `queryFn: () => listEntries(pathId)` fan-out in
`useMultiPathEntries.ts` with:

1. One `useQuery` polling `getEntryVersions(pathIds)` every 25s (cheap,
   small response).
2. A diff step comparing the new map to the previous one (component-local
   ref, not persisted — cold start after a page load always does a real
   comparison against a fresh versions response).
3. On diff, `queryClient.invalidateQueries({ queryKey: ['v1', 'entries', entryId] })`
   for changed entries only — existing per-entry queries/composables pick up
   the invalidation and refetch individually; no new fetch logic needed at
   that layer.

## Data model / storage impact

New Dexie table `etagCache`. Requires a Dexie version bump in the schema
used by `queryPersister.ts` — additive, no migration of existing data
needed (the new table starts empty).

## Testing plan

Per this repo's convention: small test that fails on the bug, then confirms
the fix — not manual screenshot loops.

- Unit test for `customFetch`: mock `fetch` to return `304` with no body on
  the second call for the same URL; assert the mutator returns the same
  `data` as the first (`200`) call.
- Unit test for `etagStore`: set/get/clear round-trip.
- Unit test for the version-diff logic: given two version maps differing in
  one entry, assert exactly that entry's query key is invalidated (and no
  others).
- Composable test for `useEntryVersions` against the backend's versions
  endpoint contract (via the existing MSW mocking setup).

## Acceptance criteria

1. A second GET to an unchanged resource results in a `304` network
   response and no response body, while the caller still receives the
   correct data.
2. Multi-path polling issues one versions request per tick instead of N
   list requests, and only fetches full data for entries that actually
   changed.
3. Logging out and back in as a different user never surfaces the previous
   user's cached body.
4. No changes required to orval-generated code, or to `useX` call sites
   outside `useMultiPathEntries`.

## Risk notes

1. Cache poisoning across accounts if `clearEtags()` isn't wired into every
   logout path — same rigor needed as the (currently missing) query-cache
   clear-on-logout; worth fixing both together.
2. The stored-body cache can grow unbounded over a long session — reuse
   whatever eviction/size policy (if any) governs `queryCache`, or cap
   `etagCache` similarly.
3. Cold start (browser restart) has no local version map for the diff step
   — the first poll after load is always a real comparison against a fresh
   versions response, which is correct but not optimized; test this path
   explicitly so a bug there can't silently skip real changes.
