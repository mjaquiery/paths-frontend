# Storybook Issues — Implementation Plan

Derived from `design/storybook-issues.md`. Each phase is committed separately.
Status is updated as work progresses.

Legend: ⬜ pending · 🔄 in progress · ✅ done

---

## Phase 0 — Shared infrastructure

### 0.1 `useCurrentUser()` composable ✅

**New file:** `src/composables/useCurrentUser.ts`

- Reactively wraps `localStorage['user']`, returns a reactive `currentUser` ref and
  derived `currentUserId` string.
- Replace module-scope `localStorage.getItem('user')` in:
  - `PathView.vue` (L98–106)
  - `DateView.vue` (L146–154)
  - `EntryCreateView.vue` (L119–127)
  - `EntryView.vue` (L111, once-called `getStoredUserId()`)
  - `EntryEditView.vue`

### 0.2 `RefreshStatus` redesigned as `<details>` bottom bar ✅

Redesign `RefreshStatus.vue`:

- Replace `<button>` + popover with HTML `<details>`/`<summary>` pattern.
- `<summary>` — full-width bar: status dot + text (ok / fetching / offline / error).
- Expanded `<details>` panel contains:
  - "Last checked: …" / status message.
  - **Refresh button** — calls `queryClient.invalidateQueries({ queryKey: ['v1'] })`.
  - **Delete cache button** — confirmation before clearing:
    - `db.queryCache`, `db.entryContent`, `db.entryImages` (server-derived)
    - `db.pathPreferences`, `localStorage['pathOrder']` (user prefs)
    - Does **not** clear `localStorage['user']` or `session_token` (auth).
    - Confirmation text: _"This will remove all locally stored data. Since this app
      has no offline write queue, no unsynced changes will be lost."_
- Fix `:focus-visible { outline: none }` regression — restore visible focus ring on
  `<summary>`.
- Add `RefreshStatus` to: **DateView**, **EntryView**, **EntryCreateView**,
  **EntryEditView**, **ExportView** (already in HomeView).

### 0.3 Unified error banner ✅

- Confirm/establish shared `.view-error-banner` CSS (full-width, top of `ion-content`)
  used consistently across all views.

### 0.4 Global horizontal margin ✅

- Add `0.5em` horizontal padding to `ion-content` in all views.
- Audit `WeekView` inner padding to avoid doubling up.

---

## Phase 1 — New views and routes

### 1.1 `PathCreateView` + `/paths/new` route ✅

**New files:**

- `src/views/PathCreateView.vue`
- `src/views/PathCreateView.stories.ts`

- Form: title, description, colour (same fields as inline create form in
  `PathsSelectorBar`).
- Calls `POST /v1/paths`.
- Accepts `?redirect=<url>` query param; navigates there after successful creation
  (or `/` if absent).
- Register route `/paths/new` in `src/router.ts`.
- Stories: `Default`, `Saving`, `SaveError`, `WithRedirect`.

---

## Phase 2 — HomeView redesign

### 2.1 Hamburger menu (`ion-popover`) ⬜

- Add `☰` button to header toolbar (`slot="end"`).
- Popover contains: **+ New Path** (→ `/paths/new`), **Manage invitations**
  (→ `/invitations`), **Export data** (→ `/export`), **Delete data** (→ `/delete`),
  **Logout** / **Login**, **Dark mode toggle**.
- Remove footer links and move Logout/Login/dark-mode from `ion-buttons` to popover.

### 2.2 HomeView header + toolbar cleanup ⬜

- Remove duplicate `loginError` from toolbar `ion-buttons` (L28–30); keep only
  welcome-card copy (L102).
- Remove `+ Create Entry` block CTA (L65–69).
- Remove entire `ion-footer` (contents moved to hamburger).

### 2.3 WeekView newest-first + scroll fix ⬜

- `WeekView.vue`: reverse day rendering to newest-first (today at top).
- `HomeView.vue`: remove vestigial `scrollToBottom` `onMounted` call (L244–246).
- When `canCreateAny` is false, disable per-day `+` chips and show a full-width
  "Create a Path" button at the bottom of `ion-content`.

### 2.4 `PathsSelectorBar` horizontal-pill redesign ⬜

- Pills: fixed max-width (`calc(25% - 8px)`) so exactly 4 fit; `text-overflow:
ellipsis; overflow: hidden; white-space: nowrap`.
- `+N` chip when more paths exist than display slots.
- **Manage** button opens dedicated manage-paths modal:
  - All paths with show/hide toggles, reorder, edit (`PathEditModal`), delete
    (`PathDeleteModal`).
- Remove inline create form from `PathsSelectorBar` (creation → `/paths/new`).

### 2.5 Invitations notification row ⬜

- Pending invitation count/notification in its own full-width row below the path
  pills bar, above `WeekView`.

### 2.6 `PathsApiError` full-width top banner ⬜

- Confirm `.view-error-banner` renders full-width below the header; adjust if not.

### 2.7 `createNewEntry()` date param ⬜

- `HomeView.vue` L297: add `?date=${today}` to the `router.push` call.

---

## Phase 3 — Per-view functional fixes

### 3.1 PathView ⬜

- Add `:focus-visible` ring on `.path-entry-row` matching `:hover` style.
- Format `entry.day` with `toLocaleDateString()` (L53).

### 3.2 DateView ⬜

- Replace `◄`/`►` with `ion-icon` `chevron-back`/`chevron-forward` (L14, L19).
- Extract duplicated "Write in [Path]" markup into single unconditional fragment.
- Replace per-path buttons with single **"+ Create entry"** button →
  `/entry/new?date=<date>`.
- `thisYear` → `computed(() => new Date().getFullYear())` (L185).

### 3.3 EntryView ⬜

- Move `deleteError <p>` inside `ion-content` (currently after `</ion-content>`,
  L66–68).
- Format `entry?.day` with `toLocaleDateString()` (L32, L62 in delete alert).

### 3.4 EntryEditView ⬜

- Detect HTTP 409 specifically and show: _"This entry was edited on another device.
  Reload to see the latest version before editing."_
- Display path name and date in the view header (not just "Edit Entry").

### 3.5 EntryCreateView ⬜

- Path default: highest-ranked visible owned path → highest-ranked hidden owned
  path → redirect to `/paths/new?redirect=/entry/new?date=<date>`.
- Add empty-state message in selector when no owned paths exist.
- Add field-level hint to the Day field.

### 3.6 InvitationsView ⬜

- Replace all four `catch { // silently fail }` blocks (L245, L257, L269, L282)
  with per-card `invError` state or toast.
- Prefix raw `blocked_user_id` with "User ID:" (L134).
- Add **Block sender** action to Ignored section (L102–111).
- Separate `invBusy` key for Block vs. Accept/Ignore.

### 3.7 ExportView ⬜

- `pathsErrorMessage` → `computed(...)` (L44–45).
- Replace `<p>Loading…</p>` Suspense fallback with `ion-spinner` + skeleton card.
- Add "Nothing to export" empty-state when `paths` is empty.
- Show offline warning banner (via shared `RefreshStatus`).

### 3.8 DeleteView ⬜

- Full deletion-request flow via `POST /v1/account/deletion-requests`.
- Prominent **"Export your data first"** link to `/export` at the top.
- Enumerate what will be deleted (Paths, entries, images).
- Typed confirmation: user types their **display name or user ID** (case-insensitive).
- Check `GET /v1/account/deletion-requests/latest` on mount; show existing request
  status if found.
- Contact: **"Contact Matt"** (plain text, no mailto for now).

---

## Phase 4 — Image upload

### 4.1 Image upload in EntryCreateView + EntryEditView ⬜

- Upload button, caption input, inserts `![caption](url)` markdown into content.
- MSW mock handlers already in `storySupport.ts` (L663–683).
- Stories: `WithImageUpload` for both views.

---

## Phase 5 — Storybook stories

Add after all view changes are stable.

| View            | Stories to add / fix                                                           |
| --------------- | ------------------------------------------------------------------------------ |
| HomeView        | `EmptyPaths`, `Loading`, fix `LoggedOut`, fix `PathsApiError`                  |
| PathCreateView  | `Default`, `Saving`, `SaveError`, `WithRedirect`                               |
| PathView        | `Empty`, `Subscribed`, `PathNotFound`, `Offline`                               |
| DateView        | `EmptyDay`, `PreviousYears`, `ApiError`                                        |
| EntryView       | `EmptyEntry`, `EntryWithImages`, `PreviousYears`, `LoadingEntry`, `Subscribed` |
| EntryCreateView | `NoOwnedPaths`, `Offline`, `SaveError`, `FilledIn`, `WithImageUpload`          |
| EntryEditView   | `SaveError` (409), `Offline`, `WithImageUpload`                                |
| InvitationsView | `ActionError`                                                                  |
| ExportView      | `ApiError` (with cache seed), verify ExportCard lifecycle                      |
| DeleteView      | updated `Default`, `DeletionPending`, `DeletionError`, `LoggedOut`             |

---

## Dependency graph

```
Phase 0 (composable, RefreshStatus, error banner, margin)
  │
  ├─> Phase 1 (PathCreateView — new route)
  │
  ├─> Phase 2 (HomeView redesign — uses Phase 0 + Phase 1 route)
  │
  ├─> Phase 3 (per-view fixes — uses Phase 0; 3.5 needs Phase 1)
  │
  └─> Phase 4 (image upload — structurally independent)

Phases 0–4 complete
  └─> Phase 5 (stories — after all views stable)
```
