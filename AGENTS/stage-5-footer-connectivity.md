# Stage 5 — Persistent Footer: Connectivity and Sync Status

## Description

Add a persistent footer component to every page (`layouts/default.vue`) that
communicates the current connectivity state, the number of queued (unsynced)
operations, last-sync timestamp, and any background-sync errors. The footer must be
unobtrusive when everything is working and escalate visually only when user
attention is required.

---

## Target files

| File | Action |
|------|--------|
| `components/AppFooter.vue` | **Create** — the footer component |
| `layouts/default.vue` | **Update** — mount `<AppFooter />` inside `<ion-app>` |
| `composables/useRefreshStatus.ts` | **Update** — provide all data the footer needs |
| `assets/design-f.css` | **Update** — add footer design tokens |

---

## Footer states

| State | Visual | Description |
|-------|--------|-------------|
| **Online, synced** | Subtle one-line bar, muted text | "Up to date" or hidden entirely |
| **Online, syncing** | Spinner + count | "Syncing 3 changes…" |
| **Online, sync error** | Amber/orange | "Failed to sync 2 changes. Tap to retry." |
| **Conflict error** | Amber/orange | "Edit conflict — tap to resolve." |
| **Offline** | Solid indicator | "Offline — changes will sync when reconnected." |
| **Offline + queued** | Solid + count | "Offline — 5 changes queued." |

The footer collapses to a hairline / minimal presence in the "Online, synced" state
to avoid stealing screen real estate. It expands on any non-idle state.

---

## Component API

```vue
<!-- components/AppFooter.vue -->
<template>
  <footer
    class="app-footer"
    :class="footerClass"
    role="status"
    aria-live="polite"
    aria-label="Connectivity status"
  >
    <div class="app-footer__content">
      <ion-icon :icon="statusIcon" aria-hidden="true" />
      <span class="app-footer__message">{{ statusMessage }}</span>
      <span v-if="pendingOpsCount > 0" class="app-footer__count" aria-label="`${pendingOpsCount} changes queued`">
        {{ pendingOpsCount }}
      </span>
      <ion-button v-if="canRetry" fill="clear" size="small" @click="retrySync" aria-label="Retry sync">
        Retry
      </ion-button>
      <ion-button v-if="hasConflict" fill="clear" size="small" @click="resolveConflict" aria-label="Resolve conflict">
        Resolve
      </ion-button>
    </div>
  </footer>
</template>
```

### Props / reactive data source
The footer consumes `useRefreshStatus()` — no props:

```ts
const {
  isOnline,
  isSyncing,
  pendingOpsCount,
  lastSyncAt,
  lastError,
  hasConflict,
  retrySync,
} = useRefreshStatus()
```

---

## `useRefreshStatus` required interface

```ts
interface RefreshStatus {
  isOnline: Readonly<Ref<boolean>>
  isSyncing: Readonly<Ref<boolean>>
  pendingOpsCount: Readonly<Ref<number>>
  lastSyncAt: Readonly<Ref<Date | null>>
  lastError: Readonly<Ref<string | null>>
  hasConflict: Readonly<Ref<boolean>>
  retrySync: () => void
  clearError: () => void
}
```

`retrySync()` triggers a manual flush of the operation queue.
`clearError()` resets `lastError` and `hasConflict` (called when user navigates
to the conflicted entry to resolve it).

---

## Design tokens (add to `assets/design-f.css`)

```css
:root {
  --footer-height-idle:   2rem;    /* hairline state */
  --footer-height-active: 3rem;    /* expanded state */
  --footer-bg-idle:       transparent;
  --footer-bg-active:     var(--color-paper);
  --footer-bg-offline:    #3d2b00;
  --footer-bg-error:      #3d1f00;
  --footer-text-idle:     var(--color-ink-muted);
  --footer-text-active:   var(--color-ink);
  --footer-text-offline:  #f5c842;
  --footer-text-error:    #f5a623;
  --footer-border:        1px solid var(--color-rule);
}
```

Dark-mode overrides follow the existing `[data-theme="dark"]` pattern.

---

## Accessibility requirements

- `role="status"` + `aria-live="polite"` so screen-readers announce state changes
  without interrupting the user.
- All icon-only elements have `aria-hidden="true"`.
- All icon+text buttons have `aria-label` that is the full descriptive action.
- The queued-ops count has an `aria-label` that spells out the number and unit
  (e.g., "3 changes queued") — not just the digit.
- Footer must not trap keyboard focus.

---

## Placement in `layouts/default.vue`

```html
<template>
  <ion-app>
    <NuxtPage />
    <AppFooter />
    <!-- install-prompt toast is sibling, not child -->
    <ion-toast ... />
  </ion-app>
</template>
```

The footer is rendered outside `<NuxtPage />` so it persists across page transitions
and is never re-mounted. This also means it is always positioned relative to the
viewport, not to any individual page's scroll container.

---

## CSS positioning

```css
.app-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--ion-z-index-overlay, 999);
  /* account for iOS safe area */
  padding-bottom: env(safe-area-inset-bottom);
}
```

Ionic page content must have `padding-bottom` equal to `--footer-height-active`
(set on `ion-content` via `AppPage.vue`) to prevent the footer overlapping content.

---

## Stories required (for Stage 6 Storybook suite)

| Story name | State |
|---|---|
| `Idle` | Online, synced, collapsed |
| `Syncing` | Online, 3 ops in flight |
| `SyncError` | Online, 2 ops failed, Retry button |
| `Conflict` | Entry conflict, Resolve button |
| `Offline` | Network offline, 0 queued |
| `OfflineQueued` | Network offline, 5 queued |

---

## Success criteria

1. Footer is visible on every page.
2. Footer shows correct state for all six states listed above.
3. `aria-live="polite"` fires on state change (verify with screen-reader test or
   axe-core in Storybook a11y addon).
4. Footer does not obscure scrollable page content.
5. iOS safe-area inset respected.
6. Prettier check passes.
7. Vitest tests for `useRefreshStatus` composable pass.

---

## Definition of done

- [ ] `components/AppFooter.vue` exists and covers all six states.
- [ ] `layouts/default.vue` mounts `<AppFooter />`.
- [ ] `useRefreshStatus` exposes the full interface above.
- [ ] Footer design tokens added to `assets/design-f.css`.
- [ ] Footer does not overlap page content (padding-bottom applied via `AppPage.vue`).
- [ ] All six Storybook stories created (enforced in Stage 6).
- [ ] `aria-live` and all `aria-label` attributes present.
- [ ] Vitest unit tests for `useRefreshStatus` pass.
