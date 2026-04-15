# Nuxt Migration — Master Plan Overview

## Summary

Reimplement `paths-frontend` as a Nuxt 3 application, retaining the Ionic component
library, PWA capabilities, and fly.io deployment model while gaining Nuxt's
file-based routing, server-side plugin system, and first-class TypeScript DX.

The migration is split into seven stages that can be executed sequentially. Each
stage has its own plan file in this directory.

---

## Stages

| # | File | Scope |
|---|------|-------|
| 1 | [stage-1-nuxt-scaffolding.md](stage-1-nuxt-scaffolding.md) | Nuxt project bootstrap, PWA, Ionic plugin wiring, Dockerfile + CI update |
| 2 | [stage-2-page-routing.md](stage-2-page-routing.md) | File-based `pages/` routing replacing Ionic SPA router |
| 3 | [stage-3-design-f.md](stage-3-design-f.md) | Full Design F implementation across all screen sets |
| 4 | [stage-4-api-coverage.md](stage-4-api-coverage.md) | Complete API surface, draft entries, offline sync, Dexie |
| 5 | [stage-5-footer-connectivity.md](stage-5-footer-connectivity.md) | Persistent footer: connectivity, queued ops, last sync |
| 6 | [stage-6-storybook-msw.md](stage-6-storybook-msw.md) | MSW-backed Storybook suite with embedded a11y tests |
| 7 | [stage-7-cleanup.md](stage-7-cleanup.md) | Remove redundant source and archive stale design files |

---

## Non-negotiable constraints (apply to all stages)

1. **`schema/openapi.json` must never be modified.** It is owned by the backend.
2. **Path is the only content container.** No diary, journey, or aggregation entity.
3. **UI filtering (hide/show Paths) is local-only.** No server state changes.
4. **PWA** — service worker, offline-capable, installable on mobile.
5. **Static client-side only** — `ssr: false`, `nuxt generate` producing a static
   dist that can be served from nginx unchanged.
6. **Ionic components** are the UI primitive layer.
7. **Prettier** must be run before every PR or commit.
8. **fly.toml / fly.prod.toml** must be kept and kept working.
9. **GitHub Actions** workflows must be kept and updated for the new build commands.

---

## Technology mapping

| Current | Replacement / retention |
|---------|------------------------|
| Vite + `vite.config.ts` | Nuxt 3 + `nuxt.config.ts` |
| `vite-plugin-pwa` | `@vite-pwa/nuxt` |
| `src/router.ts` (manual) | Nuxt `pages/` file-based routing |
| `src/App.vue` | `app.vue` + `layouts/default.vue` |
| `src/views/*.vue` | `pages/*.vue` (same routes) |
| `src/main.ts` plugin setup | `plugins/*.ts` Nuxt plugins |
| `src/storybook/` | `.storybook/` (Nuxt-aware) |
| `@ionic/vue-router` | `@ionic/vue` + Nuxt routing adapter |
| Vitest (unit) | Vitest (unit, unchanged) |
| orval + TanStack Query | orval + `@tanstack/vue-query` (Nuxt plugin) |
| Dexie (IndexedDB) | Dexie (unchanged, client-only plugin) |
| MSW | MSW (service worker in `public/`) |

---

## Key design decisions

### Nuxt mode
`ssr: false` in `nuxt.config.ts`. `nuxt generate` produces a fully static dist
folder served by the existing nginx container. No SSR runtime is needed.

### Ionic + Nuxt routing
Ionic's navigation stack assumes `ion-router-outlet` and `@ionic/vue-router`.
In Nuxt mode we use `@ionic/vue` but replace `ion-router-outlet` with Nuxt's
`<NuxtPage />` in the default layout. Ionic page transitions are applied via
`definePageMeta({ transition: ... })` or a custom transition wrapper.

### Storybook
Use `@storybook/vue3-vite` (already in devDependencies). Nuxt-specific auto-imports
and composables that rely on Nuxt context (e.g. `useRoute`) are mocked inside
Storybook's preview layer; no `@nuxtjs/storybook` dependency is needed.

### Testing strategy
- **Unit / integration**: Vitest (unchanged runner). Tests live in
  `src/__tests__/` or co-located `*.test.ts` files.
- **Storybook stories as integration tests**: `@storybook/test` (vitest-compatible
  test runner) — stories carry `play()` functions that act as interaction tests.
- **E2E**: Playwright (unchanged).
- **Selectors**: All tests use accessible labels (`getByRole`, `getByLabelText`,
  `getByText`) — never CSS class or data-testid selectors.
