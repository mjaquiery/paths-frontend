# Paths Frontend — Implementation Plan

This document breaks the full specification (see [`AGENTS.md`](../AGENTS.md)) into
large but manageable implementation chunks. Each chunk is largely independent and
can be completed in a focused session.

---

## Current state (baseline)

The following are already implemented and tested:

- **All primary views**: HomeView, PathView, EntryView, EntryCreateView,
  EntryEditView, ExportView, InvitationsView, DeleteView, PathCreateView,
  DateView, OAuthCallback.
- **Components**: WeekView, PathsSelectorBar, ExportCard, PathEditModal,
  PathDeleteModal, PathShareModal, PathSubscriptionManager, EntryEditorPanel,
  EntryDetailModal, EntryImage, EntryImageDraftPreview, ImageUploadButton,
  OnThisDaySpotlight, RefreshStatus, MarkdownContent.
- **Composables**: useApi (write queue), usePaths, useMultiPathEntries,
  useCurrentUser, useDarkMode, useRefreshStatus, useDraftImageUpload,
  useImageUpload, useMarkdownEditor, useModalBackNavigation, usePendingSaves.
- **Lib**: Dexie DB schema (v6), custom fetch wrapper, query persister, error
  utilities.
- **Utils**: export utilities (remote + local fallback), entry image draft
  helpers, markdown renderer.
- **Generated API client**: orval-generated client from `schema/openapi.json`.
- **PWA**: vite-plugin-pwa configured with workbox NetworkFirst for API and
  CacheFirst for images; service-worker auto-update.
- **CI**: test.yml (unit tests on every push), prettier.yml (auto-format on PR),
  fly-deploy.yml (deploy to fly.io on merge to main), openapi-codegen.yml.
- **Unit tests**: coverage for export utils, API queue, views, composables, DB
  graceful-degradation, query persister.
- **Storybook**: stories for every view and most components.

---

## Chunk 1 — Account settings & profile management

**Goal**: Give users a way to manage their display name and notification
preferences directly in the app.

### Scope

1. **AccountSettingsView** (`src/views/AccountSettingsView.vue`)
   - Display current `display_name` and `user_id` (read from stored user or
     `GET /v1/account/profile`).
   - Form field to update display name — calls `PATCH /v1/account/display-name`,
     routes through `useApi` write queue.
   - Form fields for any user settings exposed by `PATCH /v1/account/settings`
     (e.g., email notification preferences if available in the OpenAPI schema).
   - Error and success feedback.

2. **Route & nav entry**
   - Add `/account` route in `router.ts`.
   - Add "Account settings" item to the hamburger menu in HomeView.

3. **Tests**
   - Unit test: AccountSettingsView renders current display name, submit calls
     mutation, optimistic name update shown.
   - Story: AccountSettingsView.stories.ts with default and loading states.

### Files changed
`src/views/AccountSettingsView.vue`, `src/views/AccountSettingsView.stories.ts`,
`src/router.ts`, `src/views/HomeView.vue`,
`src/__tests__/AccountSettingsView.test.ts`

---

## Chunk 2 — Draft entry system (full implementation)

**Goal**: Implement the multi-step draft workflow so entries can be created or
edited with an image-first approach matching the backend's draft API.

The backend exposes:
- `GET  /v1/paths/{path_code}/entries/drafts` — list active drafts
- `GET  /v1/paths/{path_code}/entries/{entry_slug}/draft` — get edit draft
- `GET  /v1/entry-drafts/{draft_id}` — fetch draft
- `PATCH /v1/entry-drafts/{draft_id}` — update draft content
- `DELETE /v1/entry-drafts/{draft_id}` — discard draft
- `POST /v1/entry-drafts/{draft_id}/images` — add image slot
- `POST /v1/entry-drafts/{draft_id}/images/{id}/complete` — confirm upload
- `POST /v1/entry-drafts/{draft_id}/images/{id}/retry-upload` — retry upload
- `DELETE /v1/entry-drafts/{draft_id}/images/{id}` — remove image
- `POST /v1/entry-drafts/{draft_id}/commit` — commit draft as entry

### Scope

1. **`useDraft` composable** (`src/composables/useDraft.ts`)
   - Load draft by id, expose reactive draft state.
   - `patchDraft(content)` — debounced autosave via write queue.
   - `commitDraft()` — commits draft, navigates to entry view.
   - `discardDraft()` — deletes draft.
   - `addImage()` / `removeImage(id)` / `retryUpload(id)`.

2. **EntryCreateView & EntryEditView** — wire to `useDraft` where the API
   exposes a draft flow (backend creates a draft before `POST /entries`).
   Detect existing draft on mount via `GET .../entries/drafts`.

3. **DraftImageManager component** (`src/components/DraftImageManager.vue`)
   - Show in-progress uploads with status indicators.
   - Complete / retry / delete controls per slot.

4. **Tests**
   - Unit: `useDraft` patchDraft debounce, commitDraft navigates, error states.
   - Unit: DraftImageManager renders slots and status correctly.
   - Integration: full create-draft → add image → commit flow using MSW mocks.

### Files changed
`src/composables/useDraft.ts`, `src/components/DraftImageManager.vue`,
`src/views/EntryCreateView.vue`, `src/views/EntryEditView.vue`,
`src/__tests__/useDraft.test.ts`,
`src/__tests__/DraftImageManager.integration.test.ts`

---

## Chunk 3 — Image viewing & management

**Goal**: Allow users to view full-size images attached to entries, and manage
(delete/re-order) images post-commit.

The backend exposes:
- `GET /v1/paths/{path_code}/entries/{entry_slug}/images` — list images
- `GET /v1/images/{image_id}/download-url` — get signed download URL
- `POST /v1/images/{image_id}/complete` — mark upload complete (legacy path)
- `POST /v1/paths/{path_code}/entries/{entry_slug}/images/upload-url` — get
  upload URL

### Scope

1. **`useEntryImages` composable** (`src/composables/useEntryImages.ts`)
   - Fetch image list for an entry, map to download URLs (lazily).
   - Cache download URLs in IndexedDB `entryImages` table (already has schema).
   - Expire cached URLs after configurable TTL (align with signed-URL lifetime).

2. **ImageGallery component** (`src/components/ImageGallery.vue`)
   - Grid of thumbnails; tap to open full-size in ion-modal.
   - Delete button per image (owner only).
   - Uses cached signed URLs; re-fetches if expired.

3. **Wire into EntryView** — render ImageGallery below entry content.

4. **Tests**
   - Unit: `useEntryImages` caches URL, detects expiry, refetches.
   - Unit: ImageGallery renders thumbnails, open modal, delete button shown only
     for owner.
   - Story: ImageGallery.stories.ts.

### Files changed
`src/composables/useEntryImages.ts`, `src/components/ImageGallery.vue`,
`src/views/EntryView.vue`, `src/__tests__/useEntryImages.test.ts`,
`src/components/ImageGallery.stories.ts`

---

## Chunk 4 — Path subscription management (full invite UX)

**Goal**: Owners can invite subscribers, view current subscribers, and revoke
access — all in a dedicated modal/panel.

The backend exposes:
- `GET  /v1/paths/{path_code}/subscriptions` — list subscribers
- `POST /v1/paths/{path_code}/subscriptions` — invite a user by email
- `DELETE /v1/paths/{path_code}/subscriptions/{target_user_id}` — revoke

### Scope

1. **`usePathSubscriptions` composable** (`src/composables/usePathSubscriptions.ts`)
   - Fetch subscriber list for a path.
   - `invite(email)` — POST invite via write queue.
   - `revoke(userId)` — DELETE via write queue, optimistic removal.

2. **PathSubscriptionManager component** — currently a stub; implement fully:
   - List current subscribers with revoke button.
   - Email input + invite button.
   - Pending/success/error feedback.

3. **PathShareModal** — wire to `usePathSubscriptions`.

4. **Tests**
   - Unit: invite success and error flows.
   - Unit: revoke removes subscriber optimistically.
   - Integration: PathSubscriptionManager renders subscriber list, invite form.
   - Story: PathSubscriptionManager.stories.ts.

### Files changed
`src/composables/usePathSubscriptions.ts`,
`src/components/PathSubscriptionManager.vue`,
`src/components/PathShareModal.vue`,
`src/__tests__/PathSubscriptionManager.integration.test.ts`

---

## Chunk 5 — Export UX improvements & robustness

**Goal**: Polish the existing export flow, add auto-polling, expiry handling,
and multi-job awareness.

### Scope

1. **Auto-polling** — when a job is in `pending`/`processing` state, poll every
   2 s automatically without manual button press. Cancel poll on component
   unmount.

2. **Multiple concurrent export jobs** — rate-limit feedback (backend returns 429
   with structured error); show "You already have an export in progress" instead
   of a raw error.

3. **Expiry countdown** — when a job is `ready`, show a countdown timer
   indicating when the download URLs expire (derived from `expires_at`).

4. **ExportCard** — refactor polling into a `useExportJob` composable for
   testability.

5. **`useExportJob` composable** (`src/composables/useExportJob.ts`)
   - Accepts an initial `ExportJobResponse`.
   - Polls backend until terminal state; exposes reactive `job`, `isPolling`,
     `jsonUrl`, `imagesUrl`.
   - Cleans up timers on unmount.

6. **Tests**
   - Unit: `useExportJob` transitions through states, stops polling on terminal.
   - Unit: expiry countdown computed correctly.
   - Unit: rate-limit error shown as friendly message.

### Files changed
`src/composables/useExportJob.ts`, `src/components/ExportCard.vue`,
`src/__tests__/useExportJob.test.ts`, `src/__tests__/export.test.ts` (extend)

---

## Chunk 6 — End-to-end (E2E) tests

**Goal**: Implement the E2E test scenarios required by AGENTS.md using Playwright
against a mock backend (MSW service-worker in the test browser).

### Required E2E scenarios

1. **User creates a Path and an Entry**
   - Log in (mock OAuth callback), create a Path, navigate to it, create an
     Entry for today, verify it appears in the week view.

2. **User exports data**
   - Starting from a state with ≥ 1 path and ≥ 1 entry, navigate to Export,
     select the path, trigger export, wait for ready state, verify download
     buttons appear.

3. **User downloads JSON and image archive**
   - Extend scenario 2: click "Download JSON" and "Download images", verify file
     downloads are triggered (check anchor click via Playwright intercept).

### Implementation notes

- Use Playwright's `page.route()` to intercept API calls and return MSW-style
  fixture responses (or run the existing MSW worker inside the test browser via
  `playwright-msw`).
- Add a `playwright.config.ts` at the repo root targeting a `vite preview` dev
  server.
- Store fixtures under `playwright-test/fixtures/`.
- Add `test:e2e` script to `package.json`: `playwright test`.

### CI integration (Chunk 8 prerequisite)

- E2E tests will be wired into CI in Chunk 8.

### Files changed
`playwright.config.ts`, `playwright-test/e2e/create-path-and-entry.spec.ts`,
`playwright-test/e2e/export-data.spec.ts`,
`playwright-test/fixtures/`, `package.json`

---

## Chunk 7 — OpenAPI codegen CI workflow hardening

**Goal**: Ensure generated code is always in sync with the backend schema and
fails the PR if it drifts.

### Scope

1. **Review `openapi-codegen.yml`** — confirm it runs orval, stages generated
   files, and fails if any files changed after generation (i.e., ungenerated
   changes were pushed without regenerating).

2. **Drift detection step** — after `npm run codegen:openapi`, run
   `git diff --exit-code src/generated/` to fail CI when the generated client
   is stale.

3. **Auto-commit option** — as an alternative to failing, auto-commit the
   regenerated client (same pattern as prettier.yml) if the last commit was not
   already a codegen commit.

4. **Documentation** — update README with instructions for:
   - Running codegen locally: `npm run codegen:openapi`
   - When to regenerate: after any change to `schema/openapi.json`

### Files changed
`.github/workflows/openapi-codegen.yml`, `README.md`

---

## Chunk 8 — CI/CD pipeline completion

**Goal**: Implement all CI/CD rules from AGENTS.md that are not yet covered.

### Scope

1. **Smoke tests post-deploy** (merge to main)
   - Add a `smoke.yml` workflow triggered after `fly-deploy.yml` succeeds.
   - Smoke tests: `GET /health` returns 200, app HTML is served, PWA manifest
     is present.
   - Use `curl` or a minimal Playwright headless run.

2. **E2E tests on staging** (merge to main, after smoke)
   - Re-use the Playwright E2E suite from Chunk 6.
   - Run against the deployed staging URL (`FLY_STAGING_URL` secret).

3. **Release deploy workflow**
   - Add `release.yml` triggered on GitHub release publish.
   - Deploys to fly.io production (`FLY_API_TOKEN_PROD` secret).
   - Runs smoke tests against production URL post-deploy.

4. **Ruff check in CI** (if a backend component is added to this repo in
   future) — placeholder step that no-ops if no Python files exist, so the
   workflow is already in place.

5. **Branch protection rule documentation** — add a `CONTRIBUTING.md` noting
   required checks before merge.

### Files changed
`.github/workflows/smoke.yml`, `.github/workflows/release.yml`,
`.github/workflows/test.yml` (add E2E job),
`CONTRIBUTING.md`

---

## Chunk 9 — PWA hardening & offline UX

**Goal**: Ensure the app works gracefully offline and users are informed of
sync state.

### Scope

1. **Service-worker update prompt** — when a new SW is waiting, show a toast/
   banner ("Update available — reload to apply") with a "Reload" action. Use
   the `useRegisterSW` hook from `virtual:pwa-register/vue`.

2. **Offline indicator** — `RefreshStatus` component already tracks `isOnline`
   via `useApi`. Ensure it shows a persistent "Offline — changes will sync when
   reconnected" banner when `isOnline` is false.

3. **Cache warming** — on login, pre-fetch and cache all Path and recent Entry
   data so the user can read offline immediately.

4. **IndexedDB graceful degradation** — already partially implemented; audit all
   DB writes and confirm every `try/catch` is present. Add a global toast for
   quota-exceeded errors.

5. **Tests**
   - Unit: SW update toast renders and triggers reload.
   - Unit: cache warming composable calls expected queries.
   - Extend `db.graceful.test.ts` with quota-exceeded simulation.

### Files changed
`src/composables/usePwaUpdate.ts`, `src/App.vue`,
`src/components/RefreshStatus.vue`, `src/composables/useCacheWarming.ts`,
`src/__tests__/usePwaUpdate.test.ts`, `src/__tests__/db.graceful.test.ts`

---

## Chunk 10 — Accessibility & internationalisation baseline

**Goal**: Make the app usable by screen-reader users and lay groundwork for i18n.

### Scope

1. **Accessibility audit** — run `axe-core` against each view (via Storybook
   a11y addon or vitest-axe) and fix all critical/serious issues:
   - Missing `aria-label` on icon-only buttons (hamburger, back).
   - Form fields need `<ion-label>` or `aria-label`.
   - Modal dialogs need `role="dialog"` and `aria-labelledby`.
   - Colour contrast in dark mode.

2. **ARIA roles and live regions**
   - Status bar: add `role="status"` and `aria-live="polite"`.
   - Sync queue notifications: `role="alert"` for failures.

3. **i18n scaffolding** (no translations yet, just infrastructure)
   - Install `vue-i18n` (or a lightweight alternative).
   - Extract all user-facing strings into `src/i18n/en.json`.
   - Wrap strings with `t()` calls throughout components.
   - Document how to add a new locale in README.

4. **Tests**
   - Add `vitest-axe` snapshot tests for HomeView, EntryView, ExportView.

### Files changed
`src/i18n/en.json`, `src/main.ts`,
multiple Vue components (aria labels, t() calls),
`src/__tests__/a11y.test.ts`

---

## Ordering recommendation

The chunks are largely independent but the following sequencing minimises
rework:

```
1 (Account settings)       — standalone, no dependencies
2 (Draft system)           — depends on existing EntryCreate/Edit views
3 (Image viewing)          — depends on EntryView (stable)
4 (Subscription UX)        — depends on PathShareModal (stable)
5 (Export UX)              — extends existing ExportCard
6 (E2E tests)              — best after 1-5 so scenarios cover full flows
7 (OpenAPI codegen CI)     — standalone, CI-only
8 (CI/CD completion)       — depends on 6 (E2E tests exist)
9 (PWA hardening)          — standalone, can run in parallel with 1-5
10 (Accessibility)         — last, as it touches all components
```

---

## Definition of done (per chunk)

A chunk is complete when:

- [ ] All described source files are created or modified.
- [ ] All new logic has corresponding unit tests passing (`npm test`).
- [ ] Integration/E2E tests pass where specified.
- [ ] Storybook stories exist for new visual components.
- [ ] `npm run format` (prettier) produces no changes.
- [ ] No TypeScript errors (`vue-tsc -b`).
- [ ] PR opened and CI (test + prettier) green.
