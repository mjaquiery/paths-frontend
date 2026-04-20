# Storybook issues

Issues found by reviewing the Storybook stories and the View components they exercise.
Organised by view, with a cross-cutting summary at the end.

---

## HomeView

### Stories gaps

- No `EmptyPaths` story — logged-in user with zero paths. The empty post-signup
  state is never exercised.
- No `Loading` story — the brief window between mount and the first data
  resolution / error. Add one without `seedCacheFromState` and without a request
  override.

### View issues

- `loginError` is shown in two places: inside `ion-buttons` in the toolbar
  (line 28–30) **and** inside the welcome card (line 102). The toolbar placement
  is awkward. Remove the toolbar copy; the welcome card is the right surface.
- `createNewEntry()` navigates to `/entry/:pathId/new` without a `?date=…` param,
  so the date field defaults to today via `new Date()`. The WeekView "+" chips do
  pass a date. Make the CTA consistent: `/entry/${ownedPath.path_id}/new?date=${today}`.
- The `onMounted` `scrollToBottom` call (line 245) has no visible effect in any
  story — WeekView is not bottom-anchored. Vestigial, remove.
- `Logged Out` isn't. It shows the same information as `Default`.
- The checking/online/offline widget would be better as a full-width bar across the bottom.
- The manage invitations/data export type stuff would be better as an accessible hamburger menu in the top bar. The theme switcher and Logout could also live there to save space.
- The vertical days should be in the opposite order - newest to oldest.
- `Paths Api Error` should be a full-width banner, probably at the top of the screen below the banner.
- `Crowded` view shows that vertical stacking the paths pills takes up too much space. Horizontal-stack with truncated names; have + if there are more than e.g. 3. Have 'MORE' button for managing stuff.
- Move invitations to a separate horizontal full-width slot below Paths pills.
- Move + New Path to the hamburger menu. If the user has no paths to create an entry in, the + on each day is disabled but there's a full-width button at the bottom saying 'create a path'.
- All views should have a generic margin of 0.5em left and right to prevent them pushing up against the screen frame.

---

## PathView

### Stories gaps

- No `Empty` story — path exists but has zero entries. The empty-state CTA
  branch (`groupedEntries.length === 0`) is never exercised in Storybook.
- No `Subscribed` story — a path the current user can read but does not own
  (`isOwned` false, no `+ Entry` button visible).
- No `PathNotFound` story — `path` resolves to `null` and the page politely shows the reader that the path isn't there.
- Offline mode story required.

### View issues

- `currentUserId` is read from `localStorage` at module scope (lines 98–106), not
  reactively. Log in/out without a full reload will leave `isOwned` stale. Same
  pattern in DateView and EntryCreateView — extract a shared `useCurrentUser()`
  composable.
- Entry rows use `role="button"` + `tabindex="0"` and handle `keydown.enter` /
  `keydown.space`, but have no visible `:focus` style. Add a focus ring matching
  `.path-entry-row:hover`.

---

## DateView

### Stories gaps

- No `EmptyDay` story where the date has no entries but owned paths exist,
  exercising the "Write in [Path]" buttons in the empty branch.
- No `PreviousYears` story where prior-year entries share the same MM-DD,
  exercising the `✨ Previously on this day` section.
- No `ApiError` story (compare HomeView which has `PathsApiError`).

### View issues

- `thisYear` is set at module-evaluation time (line 185). If the tab stays open
  across New Year midnight the previous-year filter will silently be wrong.
- Prev/next navigation uses unicode `◄`/`►` (lines 14, 19). Consider
  `ion-icon` (`chevron-back` / `chevron-forward`) for visual consistency with the
  rest of the app.
- The "Write in [Path]" buttons are duplicated between the empty branch
  (lines 31–40) and the non-empty branch (lines 62–71). Extract to a shared
  fragment below the conditional.
- "Write in [Path]" should just be a generic 'create entry' button. The path can be selected when creating the entry.
- `Offline` view has no offline indicator. The checking/last updated/offline banner should be small, at the bottom, and visible on all pages.

---

## EntryView

### Stories gaps

- No `EmptyEntry` story — entry exists but content is an empty string.
- No `EntryWithImages` story — exercises the `MarkdownContent` `images` prop.
- No `PreviousYears` story — the "On this day (other years)" section is never
  visible in Storybook.
- No `LoadingEntry` story — entry not yet in cache; shows "Loading…"
  (`entry?.content === undefined` branch).
- No `Subscribed` story — path is subscribed, not owned; no Edit/Delete buttons.

### View issues

- `deleteError` `<p>` (lines 66–68) is placed **outside** `ion-content`, after
  `ion-alert`. On mobile it will render outside the scrollable area and may be
  clipped or invisible. Move it inside `ion-content`.
- `entry?.day` is displayed as a raw ISO string (line 32). Use
  `toLocaleDateString` for consistency with DateView and PathView.
- `canEdit` is true only for path owners. If subscribers are intended to be able
  to delete their own entries this will need revisiting; at minimum add a
  `Subscribed` story to make the current behaviour visible.

---

## EntryCreateView

### Stories gaps

- No `NoOwnedPaths` story — `ownedPaths` is empty, path selector has no options,
  form cannot be submitted, and no feedback is shown to the user.
- No `Offline` story — network unavailable when the user hits Save.
- No `SaveError` story — simulates a failed POST.
- No `FilledIn` story — form with content typed in, exercises the preview tab and
  the enabled `Save` button.

### View issues

- `currentUserId` read from `localStorage` at module scope (same issue as
  PathView / DateView).
- When `ownedPaths` is empty there is no empty-state message explaining why the
  selector has no options.
- The `Save` toolbar button is disabled when `!canSave` but there is no
  field-level hint explaining what is required.
- There must be support for uploading and inserting images (with captions) properly. And stories to demonstrate this.

---

## EntryEditView

### Stories gaps

- No `SaveError` story — a 409 conflict (`expected_edit_id` mismatch) is the
  most important error for this view and deserves its own story.
- No `Offline` story.

### View issues

- The 409 optimistic-lock error produces a generic API error string. Detect the
  409 specifically and show a user-friendly message, e.g. "Someone else edited
  this entry — reload to see the latest version."
- No entry metadata (path name, date) is shown. The user has no context for which
  entry they are editing.
- Also needs to use the image upload/embed/caption capabilities.

---

## InvitationsView

### Stories gaps

- No `ActionError` story — an accept / ignore / block / unblock mutation fails.
  Currently failures are completely invisible to the user (`// silently fail`).

### View issues

- All four mutation functions (`acceptInv`, `ignoreInv`, `blockInv`, `unblock`)
  silently swallow errors. Add per-card error state or a toast.
- The Blocked users section shows raw `blocked_user_id` values (line 134).
  These are opaque internal IDs. Add a "User ID:" label prefix at minimum.
- `invBusy` is shared across Accept, Ignore, and Block for the same invitation.
  The Block button never shows a busy label even when the flag is set.
- Ignored invitations should allow 'Block sender' as an action.

---

## ExportView

### Stories gaps

- No `ApiError` story (paths endpoint fails — handled in the view but not
  exercised in Storybook).
- Export lifecycle states (in-progress, complete, expired) likely belong to
  `ExportCard` stories; verify `ExportCard` covers them.

### View issues

- `pathsErrorMessage` is evaluated eagerly at script setup time (line 44–45),
  not inside a `computed()`. If the error clears on retry the displayed message
  won't update. Change to `computed(() => extractErrorMessage(pathsError.value) ?? '...')`.
- The `<Suspense>` fallback is an unstyled `<p>Loading…</p>`. Use `ion-spinner`
  or a skeleton card to match the surrounding UI.
- `No Paths` should not let you export anything and give a friendly message saying there's nothing to export.
- When offline, there should be a warning that you'll only save local cached data.

---

## DeleteView

### Stories gaps

- Only `Default`. A `LoggedOut` story would verify the back-button behaviour
  without a session (low priority given the view is static).

### View issues

- No contact method is provided. "Contact support" with no email or link leaves
  the user with nowhere to go. Add a `mailto:` link or support URL.
- The scope of deletion ("your account and all associated data") is vague.
  Briefly enumerate what is deleted (Paths, entries, images) to reduce anxiety.
- The view should use the same functionality as the (to be removed) delete data button in `HomeView`

---

## Cross-cutting summary

| Issue                                                                      | Affected views                             |
| -------------------------------------------------------------------------- | ------------------------------------------ |
| `currentUserId` read from `localStorage` at module scope — not reactive    | PathView, DateView, EntryCreateView        |
| Silent mutation failure (`// silently fail`) — errors invisible to user    | InvitationsView                            |
| No `EmptyState` story                                                      | PathView, DateView, EntryCreateView        |
| No `ApiError` / `SaveError` story                                          | EntryCreateView, EntryEditView, ExportView |
| `deleteError` rendered outside `ion-content`                               | EntryView                                  |
| Entry date displayed as raw ISO string instead of localised format         | EntryView                                  |
| `pathsErrorMessage` not inside a `computed()` — won't react to retries     | ExportView                                 |
| "Write in [Path]" button markup duplicated across two conditional branches | DateView                                   |

- Need to unify and make consistent: 1. error displays, 2. last updated/updating/offline indicator. They can be full-width small banners; errors at the top and status at the bottom.
- Left/right margin as mentioned.
