# Stage 3 — Design F Full Implementation

## Description

Implement Design F ("Zen Minimalist") in its entirety across all pages, replacing
the current ad-hoc Ionic styling with a coherent, brochure-compliant design system.
The brochure (`design/screenshots/design-f-brochure.md`) defines six screen sets;
each screen set offers four layout variants (a–d). This stage selects and implements
the canonical variants and creates the token/component layer that all pages use.

---

## Design system tokens

Create `assets/design-f.css` (imported globally via `nuxt.config.ts`):

```css
:root {
  /* Typography */
  --font-serif: 'Lora', 'Georgia', serif;
  --font-sans:  system-ui, sans-serif;

  /* Palette */
  --color-paper:    #fdfcf7;   /* warm paper-white background */
  --color-ink:      #1a1a18;   /* near-black body text */
  --color-ink-muted: #6b6b65;  /* secondary text */
  --color-rule:     #e0ded8;   /* horizontal rules, dividers */

  /* Path identity bars are set inline via --path-color CSS variable */

  /* Spacing */
  --page-margin: 0.75rem;      /* left/right gutter on all pages */
  --section-gap: 1.5rem;

  /* Elevation — none; no card chrome in Design F */
}
```

Create `assets/transitions.css` for Nuxt page transitions (ion-forward, ion-back).

---

## Components to create / rewrite

All new components live in `components/` using the Nuxt auto-import convention.

### Design tokens / primitives
| Component | Purpose |
|-----------|---------|
| `AppPage.vue` | Wraps `<ion-page>` + `<ion-content>`, applies `--page-margin`, sets `background: var(--color-paper)` |
| `AppHeader.vue` | Thin serif title bar; optional back button; optional hamburger menu slot |
| `PathColorBar.vue` | 2 px left border element coloured by `--path-color`; used in entry rows |
| `AppEmptyState.vue` | Centred empty-state slot with optional CTA button |
| `AppErrorBanner.vue` | Full-width top banner for API/network errors; dismissible |
| `AppSpinner.vue` | Consistent loading indicator (replaces `ion-spinner` direct usage) |

### Screen Set 1 — Home / Onboarding

Implement **variant a** (Centred minimal) as the default logged-out view:
- Logo centred, three feature bullets, Google sign-in pill.

Implement **variant b** (Editorial headline) as an alt via a feature flag or A/B slot.

File: `pages/index.vue`

Key changes from current `HomeView.vue`:
- Year-tab navigation bar at top (links to `/date/YYYY-MM-DD` for current day in
  the selected year).
- Week mini-bar with path colour dots per day.
- Entry list replaces card-heavy layout.
- Horizontal path pills (max 3 visible + "MORE" button) replaces vertical stacking.
- Invitations shown as a horizontal full-width slot below path pills.
- Hamburger menu in top bar: "New Path", "Export data", "Delete account", theme toggle, logout.
- Newest-to-oldest vertical day ordering.
- Login error shown only in the welcome card, not in the toolbar.

### Screen Set 2 — Main paths / calendar view

Implement **variant a** (Zen day list) as the canonical home page layout (the
current `HomeView` represents this screen set):
- Year tabs across the top.
- Week mini-bar with path colour dots.
- Entry list below, newest first.

Implement **variant b** (Mini calendar + day panel) as `pages/calendar.vue` (new page,
adds `/calendar` route).

File: `pages/index.vue` (screen set 2a is the primary HomeView layout)

### Screen Set 3 — View entry

Implement **variant a** (Text dominant) as the default:
- Full-width serif body.
- Small photo strip below text.
- Year comparison section at bottom ("On this day, other years").

File: `pages/entry/[pathId]/[entryId]/index.vue`

Key changes from current `EntryView.vue`:
- Entry date displayed via `toLocaleDateString`, never raw ISO.
- `deleteError` inside `ion-content`.
- Edit/Delete buttons only for path owners.
- Subscribed variant: no edit controls.

### Screen Set 4 — Create / Edit entry

Implement **variant a** (Clean editor) as primary:
- Path chip + date picker.
- Compact markdown toolbar.
- Photo strip at bottom (upload, caption, reorder).

Implement **variant c** (Write/Preview toggle) as a secondary mode toggled by a
segment control on the same page.

Files:
- `pages/entry/[pathId]/new.vue`
- `pages/entry/new.vue` (path selection dropdown shown at top)
- `pages/entry/[pathId]/[entryId]/edit.vue`

Key changes from current views:
- Show path name and date in the edit header for context.
- 409 conflict: detect explicitly and show "Someone else edited this — reload to
  see the latest version." (not a generic error).
- Image upload embedded: upload button, caption input, drag-to-reorder strip.
- Draft-based entry API (entry-api.md) wired to the editor:
  - Auto-saves draft content on a debounced interval.
  - Image uploads happen against draft image slots.
  - "Save" commits the draft atomically.

### Screen Set 5 — Create / Edit path

Implement **variant a** (Simple form) as primary:
- Large serif name input.
- Colour swatches (12 preset path identity colours).
- Description textarea.
- Shareable toggle.

Implement **variant b** (Live preview card) as an optional preview panel.

Files:
- `pages/paths/new.vue`
- `pages/path/[pathId]/edit.vue` (new page)

### Screen Set 6 — Paths management, invitations, export data, delete data

Implement **variant a** (Scrollable settings page) as the settings page:
- Three sections (Paths / Invitations / Data) in one scroll.
- Visible/Hidden pill toggles per Path.
- Edit, share, delete icons per Path.
- Invitations section: pending / accepted / ignored / blocked grouping.
- Data section: Export (trigger + status + download) and Delete account.

File: `pages/settings.vue` (new page, `/settings`)

The hamburger menu in `AppHeader.vue` links to `/settings`.

Current `InvitationsView.vue`, `ExportView.vue`, `DeleteView.vue` are replaced by
sections within `/settings`. Their old routes (`/invitations`, `/export`, `/delete`)
redirect to `/settings` for backward compatibility (use `pages/invitations.vue` etc.
as thin redirect shims: `navigateTo('/settings', { redirectCode: 301 })`).

---

## Typography and layout rules

- All body text: `font-family: var(--font-serif)`.
- All UI chrome (buttons, labels, headers): `font-family: var(--font-sans)`.
- Page background: `var(--color-paper)`.
- No card chrome (no `ion-card` with shadow) except where a raised surface is
  semantically meaningful (e.g., modal dialogs).
- Path identity: `2px solid var(--path-color)` left border on entry rows, dots on
  calendar cells, colour swatches on path chips.
- All pages: `padding: 0 var(--page-margin)` on the main scrollable area.
- Errors: `AppErrorBanner` at top of page.
- Status: footer from Stage 5 at bottom of every page.

---

## Dark mode

Provide a dark variant of the design tokens in `@media (prefers-color-scheme: dark)`
and honour the existing `useDarkMode` composable's manual toggle:

```css
[data-theme="dark"] {
  --color-paper:     #1e1c16;
  --color-ink:       #f0ede4;
  --color-ink-muted: #9b9890;
  --color-rule:      #38362e;
}
```

---

## Assets

New image/icon assets for Design F go in `public/design-f/`. The design brochure
screenshots in `design/screenshots/` remain as reference only; no screenshot files
are committed to `public/`.

---

## Success criteria

1. All six screen sets render visually consistent with Design F brochure descriptions.
2. No `ion-card` with shadow in entry list or date list views.
3. Serif font applied to body text on all pages.
4. Path colour bars visible on all entry row components.
5. Page gutter (`--page-margin`) applied; no content touches screen edge.
6. Newest-to-oldest ordering on home/date views.
7. Hamburger menu contains: New Path, Settings, Theme toggle, Logout.
8. No duplicate button/UI elements (e.g., delete-account only in Settings).
9. Dark mode works via media query and manual toggle.
10. Prettier check passes.
11. All Vitest tests pass.

---

## Definition of done

- [ ] `assets/design-f.css` defines all tokens.
- [ ] `components/AppPage.vue`, `AppHeader.vue`, `PathColorBar.vue`,
      `AppEmptyState.vue`, `AppErrorBanner.vue`, `AppSpinner.vue` exist.
- [ ] All six screen sets implemented in their respective page files.
- [ ] `pages/settings.vue` consolidates invitations + export + delete account.
- [ ] Old `/invitations`, `/export`, `/delete` routes redirect to `/settings`.
- [ ] `pages/path/[pathId]/edit.vue` exists for path editing.
- [ ] `pages/calendar.vue` exists.
- [ ] No TypeScript errors.
- [ ] Vitest suite passes.
- [ ] Manual visual check against `design/screenshots/design-f-brochure.md`.
