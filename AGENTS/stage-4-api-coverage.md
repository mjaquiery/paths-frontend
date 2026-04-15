# Stage 4 — Full API Coverage

## Description

Implement complete coverage of every endpoint exposed by the backend API
(`schema/openapi.json`), wire the draft-based entry/image flow described in
`design/entry-api.md`, and ensure offline-first operation via Dexie + an operation
queue with conflict detection.

---

## API surface to implement

The following endpoint groups must all have corresponding composables, generated
types (via orval), and Storybook stories:

| Group | Endpoints |
|-------|-----------|
| Auth | `GET /v1/auth/me`, OAuth redirect initiation, `GET /auth/callback` |
| Paths | `GET /v1/paths`, `POST /v1/paths`, `GET /v1/paths/{path_code}`, `PATCH /v1/paths/{path_code}`, `DELETE /v1/paths/{path_code}` |
| Subscriptions | `GET /v1/paths/{path_code}/subscription`, `POST /v1/paths/{path_code}/subscribe`, `DELETE /v1/paths/{path_code}/subscription`, `PATCH /v1/paths/{path_code}/subscription` |
| Entries | `GET /v1/paths/{path_code}/entries`, `GET /v1/paths/{path_code}/entries/{entry_slug}` |
| Entry Drafts | Full draft lifecycle: create, read/resume, patch, commit, abandon |
| Draft Images | Create slot, complete upload, retry, remove |
| Invitations | `GET /v1/invitations`, `POST /v1/paths/{path_code}/invitations`, `POST /v1/invitations/{token}/accept`, `POST /v1/invitations/{token}/ignore`, `POST /v1/invitations/{token}/block`, `DELETE /v1/invitations/{id}` |
| Exports | `POST /v1/exports`, `GET /v1/exports/{export_id}`, `GET /v1/exports/{export_id}/download/json`, `GET /v1/exports/{export_id}/download/images` |
| Account | `DELETE /v1/me` |

---

## Composables to create / update

All composables live in `composables/` (Nuxt auto-imports them).

### `useCurrentUser.ts`
- Reactive `currentUser` ref (not `localStorage` at module scope).
- `isLoggedIn` computed.
- `logout()` function.
- Must be the single source of truth for auth state across all pages.
- **Replaces** the current `localStorage` reads scattered across PathView,
  DateView, EntryCreateView.

### `usePaths.ts`
- `paths` — all visible paths (owned + subscribed).
- `ownedPaths` — subset where `owner_id === currentUser.id`.
- `hiddenPathIds` — stored in IndexedDB (local only, not server state).
- `togglePathVisibility(pathId)` — flips local hidden state.
- `createPath(data)` — `POST /v1/paths`.
- `updatePath(pathCode, data)` — `PATCH /v1/paths/{path_code}`.
- `deletePath(pathCode)` — `DELETE /v1/paths/{path_code}`.

### `useEntries.ts`
- `entriesForPath(pathCode)` — paginated, TanStack Query.
- `entriesForDate(date)` — cross-path, filters all paths' entries by day.
- `entryBySlug(pathCode, entrySlug)` — single entry.

### `useEntryDraft.ts`  *(new)*
Implements the full draft lifecycle from `design/entry-api.md`:

```ts
const {
  draft,           // reactive draft state
  saveDraft,       // PATCH draft content (debounced auto-save)
  addImage,        // POST draft image slot → direct upload → complete
  removeImage,     // DELETE draft image
  retryImage,      // retry-upload
  commitDraft,     // POST commit — returns live entry
  abandonDraft,    // DELETE draft
  isDirty,         // unsaved local changes
  isSaving,        // in-flight save
  isCommitting,    // in-flight commit
  conflictError,   // 409 payload
} = useEntryDraft(pathCode, entrySlug?)   // entrySlug absent = create mode
```

- Auto-saves draft content every 3 seconds if dirty.
- Persists `draftId` in Dexie so work survives a tab close.
- On mount: resumes an existing open draft if one exists for this path+entry.
- On commit: calls `POST /v1/entry-drafts/{draft_id}/commit`; on 409 shows
  conflict UI.

### `useDraftImageUpload.ts`
- Replaces the current `useDraftImageUpload.ts` / `useImageUpload.ts` pair.
- Uses the draft image slot API.
- Tracks per-image progress: `awaiting_upload → uploading → ready | failed`.
- `retryImage(draftImageId)` calls retry-upload endpoint.

### `useInvitations.ts`
- `pendingInvitations`, `acceptedInvitations`, `ignoredInvitations`, `blockedUsers`.
- `acceptInvitation(token)`, `ignoreInvitation(token)`, `blockInvitation(token)`.
- `unblockUser(userId)`.
- All mutations must surface errors — no silent failures.

### `useExport.ts`
- `exports` — list of the user's export records.
- `requestExport(pathCodes[])` — `POST /v1/exports`.
- `pollExport(exportId)` — polls `GET /v1/exports/{export_id}` until ready/failed.
- `downloadJson(exportId)` — redirects to signed URL.
- `downloadImages(exportId)` — redirects to signed URL.
- Handles expiry state gracefully.

### `useRefreshStatus.ts` (update)
- Must expose: `isOnline`, `isSyncing`, `pendingOpsCount`, `lastSyncAt`, `lastError`.
- Used by the footer (Stage 5) and by `AppErrorBanner`.

### `usePendingSaves.ts` (update)
- Operation queue must integrate with `useEntryDraft` for draft-based saves.
- Queue items: `{ type, pathCode, payload, retries, createdAt }`.
- Retry on reconnect.
- On 409 conflict: move item to `conflicted` state; surface to user via
  `useRefreshStatus.lastError`.

---

## Dexie schema updates

File: `lib/db.ts`

Add / update the following Dexie tables:

```ts
// New tables
entryDrafts: '++id, draftId, pathCode, entrySlug, updatedAt'
draftImages: '++id, draftId, draftImageId, status, filename'

// Existing tables (no breaking changes)
paths: 'path_id, owner_id, updatedAt'
entries: 'entry_id, path_id, day, latest_edit_id'
operationQueue: '++id, type, status, createdAt'
hiddenPaths: 'path_id'
```

Always add columns; never drop or rename existing columns without a migration.

---

## Error handling standards

- **API errors** must be caught by the composable and exposed as reactive refs.
- **409 optimistic-lock conflict**: detect `response.status === 409` and set a
  typed `conflictError` ref; pages display a user-friendly conflict message.
- **Offline**: when `isOnline === false`, mutations are queued; UI shows offline
  indicator (Stage 5).
- **Image upload failure**: failed image marked; user can retry or remove.
- **Export expiry**: show expiry date; "Re-export" button.
- **Silent failures are not acceptable** — all mutation errors must reach the user.

---

## `useCurrentUser.ts` reactive auth pattern

```ts
// composables/useCurrentUser.ts
export function useCurrentUser() {
  const user = useState<User | null>('currentUser', () => null)
  // populated by useFetch('/v1/auth/me') on app init
  const isLoggedIn = computed(() => user.value !== null)
  const isOwnerOf = (path: Path) => path.owner_id === user.value?.id
  return { user, isLoggedIn, isOwnerOf }
}
```

---

## `customFetch.ts` updates

- Must attach the auth token from `useCurrentUser` (or cookie) on every request.
- Must detect network errors and set `useRefreshStatus.isOnline = false`.
- Must detect 401 and redirect to login.

---

## orval regeneration

After any backend schema update, run `npm run codegen:openapi`. The generated
`src/generated/apiClient.ts` and `src/generated/types/` must not be manually edited.

---

## Success criteria

1. Every endpoint listed above has a composable wrapping it.
2. `useCurrentUser` is the sole source of auth state — no `localStorage` reads in
   page/component code.
3. Draft-based entry create and edit flow works end-to-end:
   - Draft persists across tab close/reopen.
   - Image upload progress visible.
   - 409 conflict shows user-friendly message.
4. Invitations: all mutation errors are surfaced to the user.
5. Export: full lifecycle works (request → poll → download → expiry).
6. All existing Vitest tests pass.
7. New composable tests cover: happy path, offline queue, 409 handling,
   export lifecycle, invitation error surfacing.

---

## Definition of done

- [ ] `composables/useCurrentUser.ts` — reactive, no `localStorage` at module scope.
- [ ] `composables/useEntryDraft.ts` — full draft lifecycle.
- [ ] `composables/useDraftImageUpload.ts` — draft image slots.
- [ ] `composables/useInvitations.ts` — error-surfacing mutations.
- [ ] `composables/useExport.ts` — request/poll/download/expiry.
- [ ] `composables/useRefreshStatus.ts` — exposes `pendingOpsCount`, `lastSyncAt`.
- [ ] `lib/db.ts` — updated Dexie schema with draft tables.
- [ ] All API endpoint groups have unit tests.
- [ ] No silent mutation failures anywhere.
- [ ] TypeScript strict mode passes.
- [ ] Vitest suite passes.
