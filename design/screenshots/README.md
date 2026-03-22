# UI Design Exploration – Screenshots

Six candidate redesigns for the Paths mobile interface, generated with Playwright from HTML mockups. Each design has a dedicated **brochure** (see the `*-brochure.md` files in this directory) that walks through every screenshot, explains the functionality available, and describes how the screens relate to each other.

The scenario shown in all designs: user Alex with three paths:

- **Daily Life** (purple) – their own path, almost daily entries, most with photos
- **Projects & Ideas** (teal) – their own path, sparse entries
- **Sam's Travel** (amber) – shared from another user, almost daily entries, photos

All screenshots are rendered at a 430×884 logical-pixel mobile viewport (2× device scale factor), producing 860×1768 px PNG files — a close approximation of a large-phone portrait screen.

---

## Design A – Enhanced Week View

> Closest to the current design, but visually polished.
>
> 📖 **[Read the full brochure →](./design-a-brochure.md)**

**Screens:**

- `design-a-logged-out.png` – Login / welcome screen: feature highlights and Google OAuth button
- `design-a-home.png` – Main home: paths selector bar, "Previously on this day" spotlight card, vertical week list with day boxes, footer links
- `design-a-paths-management.png` – Expanded paths bar: visibility toggles, pending invitation, export & delete data buttons, logout
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
>
> 📖 **[Read the full brochure →](./design-b-brochure.md)**

**Screens:**

- `design-b-timeline.png` – Day view: large date header, horizontal day-strip with entry-count dots, path filter pills, "On this day in past years" accordion, timeline entries with photo strips
- `design-b-paths-management.png` – Paths management: visibility toggles, edit/share/delete per path, pending invitation, export & delete data
- `design-b-entry-create.png` – Entry creation: bottom-sheet modal with warm parchment styling, path selector, date navigation, markdown editor

**Key ideas:**

- Day strip shows all 7 days of the week with coloured dots for each path that has an entry
- Year comparison is always visible at the top of the day's content
- Entry cards show full photo strips (80×80 px thumbnails)
- Timeline dot on the left is path-colour coded
- Warm cream background (#fffef6) for a journal-like feel

---

## Design C – Month Calendar + Day Panel

> Compact month calendar at top; selected day's entries shown below.
>
> 📖 **[Read the full brochure →](./design-c-brochure.md)**

**Screens:**

- `design-c-calendar.png` – Calendar view: month grid with coloured dots per day, selected day highlighted, day panel with entry cards and "Memories" section
- `design-c-paths-management.png` – Paths tab: show/hide toggles, edit/share/delete, subscribed paths, pending invitations, export & delete data
- `design-c-entry-create.png` – Entry creation: bottom-sheet modal over blurred calendar, path selector, date navigation, markdown editor, image upload

**Key ideas:**

- Calendar dots let users spot at a glance which days have entries and from which paths
- Day panel shows entries with left-border colour coding and shared-path badge
- Year memories appear at the bottom of the day panel
- Bottom tab navigation: Calendar / Journal / Paths / More
- Paths management is a dedicated tab, not a footer link

---

## Design D – Full-Screen Day Cards with Bottom Nav

> Immersive full-bleed coloured card per day; swipe or tap to navigate.
>
> 📖 **[Read the full brochure →](./design-d-brochure.md)**

**Screens:**

- `design-d-fullscreen.png` – Today view: gradient hero card with large date, swipe-day pills, year-context chips (2025 ✨ / 2024 / 2023), white bottom-sheet entries with photo strips, FAB
- `design-d-paths-tab.png` – Paths tab: path cards with visibility toggles, edit/share/delete/unsubscribe, create new path, pending invitation, export & delete data
- `design-d-edit-modal.png` – Entry edit: full-screen modal with cancel/save, path badge, date badge, markdown toolbar, photo grid

**Key ideas:**

- The date occupies the entire hero area in large bold type
- Previous/next day peek from the side gives spatial context
- Year comparison chips are always visible above the entries — tap to jump to that year's entry
- "No Projects entry today" ghost row keeps paths visible even when empty
- Edit modal is full-screen (not a bottom sheet) for comfortable writing

---

## Design E – Chronological Entry Stream

> A social-feed-style scrollable stream of entries across all paths.
>
> 📖 **[Read the full brochure →](./design-e-brochure.md)**

**Screens:**

- `design-e-stream.png` – Feed: path filter chips, sticky date-group headers with "✨ N years ago" badge, entry cards with hero photo and action buttons
- `design-e-settings.png` – Settings tab: path visibility toggles, edit/share/delete, pending invitation, export / appearance / delete account
- `design-e-entry-create.png` – Entry creation: full-screen modal with path badge, date badge, markdown toolbar, photo footer

**Key ideas:**

- Entries flow newest-first in a continuous scroll
- Date group headers are sticky and show "X years ago" for year-comparison awareness
- Photos appear as large hero images (full-width), with photo count badge
- Shared entries show a "👁 Sam's" badge but no edit buttons
- FAB for creating a new entry; bottom nav for Feed / Calendar / Paths / Settings

---

## Design F – Zen Minimalist

> Typography-first, editorial aesthetic. Serif font, paper-white background.
>
> 📖 **[Read the full brochure →](./design-f-brochure.md)**

**Screens:**

- `design-f-zen.png` – Journal view: serif date header, year navigation tabs, week mini-bar with coloured dots, left-bordered entry text blocks, "Previously on this day" memories, minimal footer with "+ Write Entry"
- `design-f-settings.png` – Settings panel: path visibility as editorial list, pending invitation, export / appearance / delete account
- `design-f-entry-create.png` – Entry compose: full-screen view with zen toolbar, free-text writing area, word count, photos footer

**Key ideas:**

- No phone chrome or app-like UI elements — feels like reading a physical journal
- Year navigation tabs let users instantly compare the same date across years
- Week mini-bar shows coloured dots for quick week overview without taking up space
- Entries use a 2 px left border (path colour) rather than cards or backgrounds
- Memories section uses grey year labels and muted body text
- Footer is minimal: one compose button, three icon buttons for paths/export/settings

---

## File Reference

| File                            | Design                    | State                  |
| ------------------------------- | ------------------------- | ---------------------- |
| `design-a-logged-out.png`       | A – Enhanced Week         | Login / welcome screen |
| `design-a-home.png`             | A – Enhanced Week         | Home / main view       |
| `design-a-paths-management.png` | A – Enhanced Week         | Paths management panel |
| `design-a-entry-modal.png`      | A – Enhanced Week         | Entry creation modal   |
| `design-b-timeline.png`         | B – Timeline Journal      | Day view               |
| `design-b-paths-management.png` | B – Timeline Journal      | Paths management       |
| `design-b-entry-create.png`     | B – Timeline Journal      | Entry creation         |
| `design-c-calendar.png`         | C – Month Calendar        | Calendar + day panel   |
| `design-c-paths-management.png` | C – Month Calendar        | Paths & settings       |
| `design-c-entry-create.png`     | C – Month Calendar        | Entry creation modal   |
| `design-d-fullscreen.png`       | D – Full-screen Day Cards | Today view             |
| `design-d-paths-tab.png`        | D – Full-screen Day Cards | Paths management tab   |
| `design-d-edit-modal.png`       | D – Full-screen Day Cards | Entry edit modal       |
| `design-e-stream.png`           | E – Entry Stream          | Feed view              |
| `design-e-settings.png`         | E – Entry Stream          | Settings tab           |
| `design-e-entry-create.png`     | E – Entry Stream          | Entry creation         |
| `design-f-zen.png`              | F – Zen Minimalist        | Journal view           |
| `design-f-settings.png`         | F – Zen Minimalist        | Settings panel         |
| `design-f-entry-create.png`     | F – Zen Minimalist        | Entry compose view     |
