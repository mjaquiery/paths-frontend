# Stage 6 — MSW-Backed Storybook Suite

## Description

Build a comprehensive Storybook suite that covers every page and key component
in three network contexts: **online (happy path)**, **offline**, and
**intermittent/error** scenarios. All stories that exercise user interactions must
carry embedded `play()` tests using `@storybook/test` with accessibility-friendly
selectors only (`getByRole`, `getByLabelText`, `getByText`). The suite must be
runnable as a CI check via `storybook test` (Storybook test runner).

---

## Stack

| Tool | Purpose |
|------|---------|
| `storybook` + `@storybook/vue3-vite` | Story authoring and dev server |
| `msw` + `msw-storybook-addon` | Network simulation per story |
| `@storybook/test` | `play()` interaction tests |
| `@storybook/addon-a11y` | Per-story axe-core accessibility scan |
| `@storybook/addon-essentials` | Controls, Actions, Docs |
| Storybook test runner (`@storybook/test-runner`) | CI execution of `play()` tests |

---

## `.storybook/` configuration

### `main.ts`
```ts
export default {
  stories: ['../pages/**/*.stories.ts', '../components/**/*.stories.ts'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    'msw-storybook-addon',
  ],
  framework: { name: '@storybook/vue3-vite', options: {} },
}
```

### `preview.ts`
```ts
import { initialize, mswLoader } from 'msw-storybook-addon'
import { handlers } from '../src/mocks/handlers'

initialize({ onUnhandledRequest: 'bypass' })

export default {
  loaders: [mswLoader],
  parameters: {
    msw: { handlers },          // default: online happy-path handlers
    a11y: { config: {} },
  },
}
```

### `manager.ts`
Unchanged from current, or updated for theme consistency.

---

## MSW handlers organisation

```
src/mocks/
  handlers/
    auth.ts          — GET /v1/auth/me
    paths.ts         — GET/POST/PATCH/DELETE /v1/paths/*
    entries.ts       — GET /v1/paths/{code}/entries/*
    drafts.ts        — full draft lifecycle
    draftImages.ts   — draft image slot endpoints
    invitations.ts   — GET/POST/accept/ignore/block
    exports.ts       — POST/GET /v1/exports/*
    account.ts       — DELETE /v1/me
  scenarios/
    offline.ts       — network-error handlers for all endpoints
    errors.ts        — 4xx/5xx error handlers for all endpoints
    intermittent.ts  — 50% success, 50% error (uses passthrough + delay)
  index.ts           — re-exports default `handlers` array (all happy-path)
  factories.ts       — faker-based data factories for all response shapes
```

All handler responses must use realistic data from `factories.ts` (which uses
`@faker-js/faker`). The factories must produce data that matches the OpenAPI schema
exactly — validate with orval-generated types.

---

## Required stories per page

### `pages/index.vue` — Home

| Story | MSW scenario | play() test |
|-------|-------------|-------------|
| `Default` | Online, paths + entries loaded | Sees year tabs, week bar, entry list |
| `Loading` | Paths request delayed 2 s | Shows spinner, no entries |
| `EmptyPaths` | Online, paths = [] | Shows empty state + "Create a path" CTA |
| `LoggedOut` | `/v1/auth/me` → 401 | Sees sign-in screen, not entry list |
| `Offline` | All requests → network error | Footer shows offline state |
| `PathsApiError` | Paths → 500 | Full-width error banner at top |
| `Crowded` | 10 paths | Path pills truncate at 3 + MORE button visible |

### `pages/date/[date].vue` — Date view

| Story | MSW scenario | play() test |
|-------|-------------|-------------|
| `Default` | Day has entries | Shows entry list |
| `EmptyDay` | Day has no entries, paths exist | Shows "Write in…" CTA |
| `PreviousYears` | Same MM-DD has entries in earlier years | Shows "Previously on this day" section |
| `ApiError` | Entries → 500 | Error banner |
| `Offline` | Network error | Offline footer + cached entries or empty |

### `pages/path/[pathId]/index.vue` — Path view

| Story | MSW scenario | play() test |
|-------|-------------|-------------|
| `Default` | Path with entries | Shows entry list |
| `Empty` | Path with no entries | Empty state + add entry CTA |
| `Subscribed` | `isOwned = false` | No edit/delete controls |
| `PathNotFound` | Path → 404 | Friendly not-found state |
| `Offline` | Network error | Offline footer |

### `pages/entry/[pathId]/[entryId]/index.vue` — Entry view

| Story | MSW scenario | play() test |
|-------|-------------|-------------|
| `Default` | Entry with text | Renders serif body |
| `WithImages` | Entry with 2 images | Shows photo strip |
| `EmptyEntry` | Entry content = "" | Empty state |
| `PreviousYears` | Same day entries in other years | Shows "On this day" section |
| `Loading` | Entry not cached | Shows spinner |
| `Subscribed` | Not owner | No Edit/Delete buttons |
| `Offline` | Network error | Offline footer |

### `pages/entry/[pathId]/new.vue` + `pages/entry/[pathId]/[entryId]/edit.vue` — Entry editor

| Story | MSW scenario | play() test |
|-------|-------------|-------------|
| `Default` | Empty draft, paths loaded | Editor renders with path chip + date |
| `FilledIn` | Draft with text | Preview tab shows rendered markdown |
| `WithImages` | Draft with 2 images | Photo strip visible |
| `ImageUploading` | Draft image `awaiting_upload` | Progress indicator |
| `ImageUploadFailed` | Draft image `failed` | Retry/remove buttons |
| `NoOwnedPaths` | `ownedPaths = []` | Disabled submit + "Create a path" message |
| `SaveError` | Draft PATCH → 500 | Error banner, draft not lost |
| `ConflictError` | Commit → 409 | Conflict message with reload option |
| `Offline` | All requests → network error | Offline footer, draft auto-saved locally |

### `pages/paths/new.vue` + `pages/path/[pathId]/edit.vue` — Path editor

| Story | MSW scenario | play() test |
|-------|-------------|-------------|
| `Default` | Empty form | Form renders with name + colour + toggle |
| `EditExisting` | Path loaded | Form pre-filled |
| `SaveError` | POST/PATCH → 500 | Error banner |
| `LivePreview` | Typing name | Preview card updates reactively |

### `pages/settings.vue` — Settings (invitations / export / delete)

| Story | MSW scenario | play() test |
|-------|-------------|-------------|
| `Default` | Paths + pending invitations | All three sections visible |
| `PendingInvitations` | 2 pending invitations | Accept/Ignore/Block buttons |
| `ActionError` | Accept mutation → 500 | Per-card error shown (not silent) |
| `ExportReady` | Export status = `ready` | Download buttons enabled |
| `ExportPending` | Export status = `pending` | Spinner, polling |
| `ExportExpired` | Export status = `expired` | Re-export button |
| `ExportNoData` | `paths = []` | "Nothing to export" message |
| `ExportOffline` | Network error | Offline warning |
| `NoPaths` | `paths = []` | Empty paths section |

### `components/AppFooter.vue` — Connectivity footer

See Stage 5 for the six required states:
`Idle`, `Syncing`, `SyncError`, `Conflict`, `Offline`, `OfflineQueued`

---

## `play()` test conventions

All `play()` functions must:

1. Use only a11y-friendly selectors:
   - `canvas.getByRole('button', { name: /save/i })`
   - `canvas.getByLabelText('Entry text')`
   - `canvas.getByText('Retry')`
   - Never: `canvas.querySelector('.some-class')`, `canvas.getByTestId('x')`

2. Follow arrange-act-assert structure:
   ```ts
   play: async ({ canvasElement }) => {
     const canvas = within(canvasElement)
     // Arrange — story initial state set by MSW
     // Act
     await userEvent.type(canvas.getByLabelText('Path name'), 'My Path')
     await userEvent.click(canvas.getByRole('button', { name: /save/i }))
     // Assert
     await expect(canvas.getByText('My Path')).toBeInTheDocument()
   }
   ```

3. For async operations, use `waitFor` from `@storybook/test`:
   ```ts
   await waitFor(() =>
     expect(canvas.getByRole('status')).toHaveTextContent('Offline')
   )
   ```

4. Test the a11y addon implicitly — the addon runs axe-core on every story
   automatically; no manual invocation needed.

---

## CI integration

Add a new GitHub Actions workflow `.github/workflows/storybook.yml`:

```yaml
name: Storybook Tests
on:
  push:
jobs:
  storybook:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build-storybook
      - run: npx concurrently -k -s first -n "SB,TEST" -c "magenta,blue"
          "npx http-server storybook-static --port 6006 --silent"
          "npx wait-on tcp:6006 && npm run test-storybook"
```

Add `"test-storybook": "test-storybook"` to `package.json` scripts.

---

## Naming conventions for story files

- Page stories: `pages/path/to/page.stories.ts`
- Component stories: `components/ComponentName.stories.ts`
- Each file exports one `meta` (default export with `title`, `component`,
  `parameters.msw`) and one named export per story.

---

## Success criteria

1. `npm run storybook` starts without errors and all stories load.
2. `npm run build-storybook` produces a static Storybook.
3. `npm run test-storybook` runs all `play()` tests and all pass.
4. Zero a11y violations reported by the a11y addon on any story.
5. Every story uses only a11y-friendly selectors in `play()`.
6. All three network scenarios (online, offline, error) covered for every page.
7. CI `storybook.yml` workflow passes.

---

## Definition of done

- [ ] `src/mocks/handlers/` contains handlers for all endpoint groups.
- [ ] `src/mocks/scenarios/` contains offline, error, and intermittent scenarios.
- [ ] `src/mocks/factories.ts` provides faker-based factories for all response types.
- [ ] Every page listed above has a corresponding `*.stories.ts` with all required stories.
- [ ] `components/AppFooter.vue` has all six state stories.
- [ ] All `play()` tests use a11y selectors only.
- [ ] `.github/workflows/storybook.yml` added and passing.
- [ ] `npm run test-storybook` exits 0.
- [ ] `@storybook/addon-a11y` installed and active; no violations on any story.
- [ ] Prettier check passes.
