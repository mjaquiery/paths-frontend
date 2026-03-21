# UI Design Exploration – Screenshots

Six candidate redesigns for the Paths mobile interface, generated with Playwright from HTML mockups. Each design shows the primary mobile experience for a user with:

- **Daily Life** (purple) – their own path, almost daily entries, most with photos
- **Projects & Ideas** (teal) – their own path, sparse entries
- **Sam's Travel** (amber) – shared from another user, almost daily entries, photos

All screenshots are rendered at a 430×884 logical-pixel mobile viewport (2× device scale factor), producing 860×1768 px PNG files — a close approximation of a large-phone portrait screen.

---

## Design A – Enhanced Week View

> Closest to the current design, but visually polished.

**Screens:**

- `design-a-home.png` – Main home: paths selector bar, "Previously on this day" spotlight card, vertical week list with day boxes, footer links
- `design-a-entry-modal.png` – Entry creation: bottom-sheet modal with path selector, date picker, markdown editor with toolbar, image upload

**Key ideas:**

- Path chips in the selector bar are colour-coded with dot + name
- "Previously on this day" shows year badges, text preview, and thumbnail
- Each day box has a coloured left-border indicator per path
- Photo thumbnails visible inline in the day list
- Prev/Next week navigation in section header

---

## Design B – Timeline Journal View

> Left-aligned date timeline with rich entry cards for the focused day.

**Screens:**

- `design-b-timeline.png` – Day view: large date header (day number, day name), horizontal day-strip with entry-count dots, path filter pills, "On this day in past years" accordion at top, timeline entries with inline photo strips

**Key ideas:**

- Day strip shows all 7 days of the week with coloured dots for each path that has an entry
- Year comparison is always visible at the top of the day's content
- Entry cards show full photo strips (80×80 px thumbnails)
- Timeline dot on the left is path-colour coded
- Warm cream background (#fffef6) for a journal-like feel

---

## Design C – Month Calendar + Day Panel

> Compact month calendar at top; selected day's entries shown below.

**Screens:**

- `design-c-calendar.png` – Calendar view: month grid with coloured dots per day, selected day highlighted in blue, day panel below with entry cards and "Memories" section
- `design-c-paths-management.png` – Paths & settings tab: manage own paths (show/hide toggle, edit, share, delete), subscribed paths, pending invitations with accept/ignore/block, data export/delete links

**Key ideas:**

- Calendar dots let users spot at a glance which days have entries and from which paths
- Day panel shows entries with left-border colour coding and shared-path badge
- Year memories appear at the bottom of the day panel
- Bottom tab navigation: Calendar / Journal / Paths / More
- Paths management is a dedicated tab, not a footer link

---

## Design D – Full-Screen Day Cards with Bottom Nav

> Immersive full-bleed coloured card per day; swipe or tap to navigate.

**Screens:**

- `design-d-fullscreen.png` – Today view: gradient header card with large date display, swipe-day pills (◀ Mar 20 · ● Mar 21 · Mar 22 ▶), horizontal year-context chips (2025 ✨, 2024, 2023), white bottom sheet with entries and photo strips, FAB
- `design-d-edit-modal.png` – Entry edit: full-screen modal with cancel/save, path badge + date badge, markdown toolbar (B/I/Preview/H1/H2/List/Link), free-text editor, photo grid with remove buttons

**Key ideas:**

- The date occupies the entire hero area in large bold type
- Previous/next day peek from the side gives spatial context
- Year comparison chips are always visible above the entries — tap to jump to that year's entry
- "No Projects entry today" ghost row keeps paths visible even when empty
- Edit modal is full-screen (not a bottom sheet) for comfortable writing

---

## Design E – Chronological Entry Stream

> A social-feed-style scrollable stream of entries across all paths.

**Screens:**

- `design-e-stream.png` – Feed: top path filter chips, date group headers (sticky, with "✨ 2 years ago" badge), entry cards with hero photo, entry text, and action buttons (Edit / Delete)

**Key ideas:**

- Entries flow newest-first in a continuous scroll
- Date group headers are sticky and show "X years ago" for year-comparison awareness
- Photos appear as large hero images (full-width), with photo count badge
- Shared entries show a "👁 Sam's" badge but no edit buttons
- FAB for creating a new entry; bottom nav for Feed / Calendar / Paths / Settings

---

## Design F – Zen Minimalist

> Typography-first, editorial aesthetic. Serif font, paper-white background.

**Screens:**

- `design-f-zen.png` – Journal view: serif date header (day name + "21 March 2026"), year navigation tabs (2023 / 2024 / 2025 / **2026**), week mini-bar with coloured dots, entries as left-bordered text blocks with subtle actions, "Previously on this day" memories at bottom, minimal footer with "+ Write Entry" pill

**Key ideas:**

- No phone chrome or app-like UI elements — feels like reading a physical journal
- Year navigation tabs let users instantly compare the same date across years
- Week mini-bar shows coloured dots for quick week overview without taking up space
- Entries use a 2 px left border (path colour) rather than cards or backgrounds
- Memories section uses grey year labels and muted body text
- Footer is minimal: one compose button, three icon buttons for paths/export/settings

---

## File Reference

| File                            | Design                    | State                |
| ------------------------------- | ------------------------- | -------------------- |
| `design-a-home.png`             | A – Enhanced Week         | Home / main view     |
| `design-a-entry-modal.png`      | A – Enhanced Week         | Entry creation modal |
| `design-b-timeline.png`         | B – Timeline Journal      | Day view             |
| `design-c-calendar.png`         | C – Month Calendar        | Calendar + day panel |
| `design-c-paths-management.png` | C – Month Calendar        | Paths & settings     |
| `design-d-fullscreen.png`       | D – Full-screen Day Cards | Today view           |
| `design-d-edit-modal.png`       | D – Full-screen Day Cards | Entry edit modal     |
| `design-e-stream.png`           | E – Entry Stream          | Feed view            |
| `design-f-zen.png`              | F – Zen Minimalist        | Journal view         |
