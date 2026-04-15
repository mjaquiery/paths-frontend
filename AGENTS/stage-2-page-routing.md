# Stage 2 — File-Based Routing and Page Migration

## Description

Migrate all views from `src/views/` into Nuxt's `pages/` directory, replacing the
manually-maintained `src/router.ts` with Nuxt's convention-based file routing.
Ionic page transitions are preserved via Nuxt page metadata. All existing routes
must resolve to the same URL paths.

---

## Target files

### Pages created (from `src/views/`)

| Current file | New Nuxt page | URL |
|---|---|---|
| `HomeView.vue` | `pages/index.vue` | `/` |
| `OAuthCallback.vue` | `pages/auth/callback.vue` | `/auth/callback` |
| `ExportView.vue` | `pages/export.vue` | `/export` |
| `DeleteView.vue` | `pages/delete.vue` | `/delete` |
| `InvitationsView.vue` | `pages/invitations.vue` | `/invitations` |
| `DateView.vue` | `pages/date/[date].vue` | `/date/:date` |
| `PathView.vue` | `pages/path/[pathId].vue` | `/path/:pathId` |
| `PathCreateView.vue` | `pages/paths/new.vue` | `/paths/new` |
| `EntryCreateView.vue` | `pages/entry/new.vue` + `pages/entry/[pathId]/new.vue` | `/entry/new`, `/entry/:pathId/new` |
| `EntryView.vue` | `pages/entry/[pathId]/[entryId]/index.vue` | `/entry/:pathId/:entryId` |
| `EntryEditView.vue` | `pages/entry/[pathId]/[entryId]/edit.vue` | `/entry/:pathId/:entryId/edit` |

### Deleted
- `src/views/` directory (all files migrated)
- `src/router.ts`
- `src/App.vue` (replaced by `app.vue` in Stage 1)

### Updated
- `layouts/default.vue` — ensure `<NuxtPage />` replaces `<ion-router-outlet />`

---

## Migration rules

### Composable use of `useRoute` / `useRouter`
Replace any direct import of `vue-router`'s `useRoute` / `useRouter` with Nuxt's
auto-imported equivalents. They behave identically but are provided by Nuxt.

```ts
// Before
import { useRoute } from 'vue-router'
// After — no import needed, Nuxt auto-imports
const route = useRoute()
```

### Ionic navigation calls
Replace `useIonRouter()` and `IonRouterOutlet` usage:

```ts
// Before
import { useIonRouter } from '@ionic/vue'
const router = useIonRouter()
router.push('/some-path')

// After
const router = useRouter()   // Nuxt auto-import
router.push('/some-path')
```

### Page params
Route params accessed via `route.params.pathId` etc. remain unchanged. Nuxt's
`useRoute()` returns the same shape.

### Ionic page transitions
Add `definePageMeta` at the top of each migrated page:

```ts
definePageMeta({
  pageTransition: {
    name: 'ion-forward',
    mode: 'out-in',
  },
})
```

For pages that are "back" targets (home, path list), use `ion-back`:

```ts
definePageMeta({
  pageTransition: { name: 'ion-back', mode: 'out-in' },
})
```

CSS for `ion-forward` and `ion-back` transitions must be defined in
`assets/transitions.css` and imported in `nuxt.config.ts`.

### `<ion-page>` wrapper
Each migrated `pages/*.vue` file must be wrapped with `<ion-page>` as before.
The outer layout (`layouts/default.vue`) uses `<NuxtPage />` inside
`<ion-app>`.

---

## Stories migration

Each `*.stories.ts` file in `src/views/` must be moved alongside its new page file
or into `.storybook/stories/pages/`. Story imports must be updated to reflect the
new paths. Stories are the primary targets for Stage 6's MSW enhancement.

---

## `layouts/default.vue` structure

```html
<template>
  <ion-app>
    <NuxtPage />
    <!-- install-prompt toast lives here, moved from old App.vue -->
    <ion-toast ... />
    <!-- connectivity footer from Stage 5 will be placed here -->
  </ion-app>
</template>
```

---

## `app.vue` structure

```html
<template>
  <NuxtLayout />
</template>
```

---

## Navigation links in components

Any hardcoded `<router-link>` or `<ion-back-button>` `defaultHref` strings must be
verified to match the new Nuxt file-based route names. Use `<NuxtLink>` instead of
`<router-link>` in Nuxt pages and components going forward.

---

## Success criteria

1. All routes from `src/router.ts` resolve correctly in the Nuxt app.
2. Back-navigation (browser back button, `ion-back-button`) works on all pages.
3. No references to `src/router.ts` remain anywhere in the codebase.
4. No references to `@ionic/vue-router` remain (only `@ionic/vue` is used).
5. `npm run generate` produces correct HTML entry points for all pages.
6. All previously-passing Vitest tests still pass.
7. Prettier check passes.

---

## Definition of done

- [ ] `pages/` directory contains all migrated page files.
- [ ] `src/views/` directory is deleted.
- [ ] `src/router.ts` is deleted.
- [ ] `@ionic/vue-router` removed from `package.json` dependencies.
- [ ] `app.vue` uses `<NuxtLayout />`.
- [ ] `layouts/default.vue` uses `<NuxtPage />` inside `<ion-app>`.
- [ ] All `*.stories.ts` files updated to new import paths.
- [ ] TypeScript compiler reports no errors.
- [ ] Vitest suite passes.
