# Stage 7 — Cleanup: Remove Redundant Files and Archive Design Artefacts

## Description

Remove all source files made redundant by the Nuxt migration and tidy the design
directory. This stage must only be executed after Stages 1–6 are complete and the
test suite is passing. All deletions are permanent; design reference files are
moved to their archive subdirectory, not deleted.

---

## Source code deletions

The following files and directories have been superseded and must be deleted:

### Replaced by Nuxt equivalents
| Path | Reason |
|------|--------|
| `src/App.vue` | Replaced by `app.vue` + `layouts/default.vue` |
| `src/main.ts` | Replaced by Nuxt plugins + `app.vue` bootstrap |
| `src/router.ts` | Replaced by Nuxt file-based routing |
| `vite.config.ts` | Replaced by `nuxt.config.ts` |
| `tsconfig.app.json` | Replaced by Nuxt-generated tsconfig |
| `tsconfig.node.json` | Replaced by Nuxt-generated tsconfig |
| `index.html` | Managed by Nuxt |

### Views directory
| Path | Reason |
|------|--------|
| `src/views/` (entire directory) | All files migrated to `pages/` in Stage 2 |

### Components superseded by Stage 3 Design F components
Review each component in `src/components/` against the Stage 3 implementation.
Delete any component that has been fully replaced. Before deleting, confirm:
1. No story or test imports it.
2. No page or component references it.
3. Its functionality is covered by the replacement.

Likely candidates (verify before deleting):
| Component | Replaced by |
|-----------|------------|
| `RefreshStatus.vue` | `AppFooter.vue` (Stage 5) |
| `PathsSelectorBar.vue` | Inline path pills in home page (Stage 3) |
| (others TBD at migration time) | — |

### Composables superseded by Stage 4 composables
| File | Reason |
|------|--------|
| `src/composables/useImageUpload.ts` | Replaced by `useDraftImageUpload.ts` |
| `src/composables/useModalBackNavigation.ts` | No modals remain in Nuxt layout |
| (others TBD) | Verify no remaining imports before deleting |

**Rule**: Before deleting any composable, run `grep -r "filename" src/` to confirm
zero remaining imports. If any imports remain, the composable must not be deleted
until those imports are resolved.

---

## Storybook file migration

Any `*.stories.ts` files that remain under `src/views/` (if that directory was not
fully deleted) must have been migrated to `pages/` in Stage 2. Verify:

```bash
find src/views -name "*.stories.ts" 2>/dev/null
```

Expected output: none.

---

## Design directory cleanup

The `design/` directory contains archived and active design documents. Apply the
following:

### Move to `design/screenshots/archive/`
| File / directory | Reason |
|------------------|--------|
| `design/storybook-issues.md` | Issues resolved by Stage 6 |
| `design/storybook-issues-plan.md` | Superseded by Stage 6 plan |
| `design/phases/0_scaffolding.md` | Phase 0 is complete |

Do **not** delete these files — they are historical records. Move them.

### Retain in place
| File | Reason |
|------|--------|
| `design/0_project-overview.md` | Active reference |
| `design/entry-api.md` | Active API specification |
| `design/screenshots/design-f-brochure.md` | Active design reference |
| `design/screenshots/*.png` | Active design reference images |
| `design/screenshots/archive/` | Archived designs — keep as-is |

### Create `design/screenshots/archive/README.md` update
Add a line to the existing `design/screenshots/README.md` (or create it if absent)
noting which designs are active and which are archived.

---

## AGENTS directory

The `AGENTS/` directory and its plan files are permanent records. Do not delete
them. Future plan files for subsequent features should be added here.

---

## `app-screens/` directory

Review `app-screens/`. If it contains screenshots from pre-Design-F design
iterations, move them to `design/screenshots/archive/app-screens/`. If it contains
active assets used in the running app, keep it.

---

## Verification checklist before executing deletions

Run the following checks before any file is deleted:

1. **No TypeScript errors**: `npx nuxt typecheck` exits 0.
2. **All tests pass**: `npm test` exits 0.
3. **Storybook builds**: `npm run build-storybook` exits 0.
4. **No dangling imports**: `grep -r "from '.*views/"` returns no results.
5. **No dangling imports to deleted composables**: grep for each deleted composable filename.
6. **Docker build succeeds**: `docker build --build-arg VITE_API_BASE_URL=http://localhost .` succeeds.

---

## Success criteria

1. `src/views/` does not exist.
2. `src/router.ts` does not exist.
3. `vite.config.ts` does not exist.
4. `src/main.ts` does not exist.
5. `src/App.vue` does not exist.
6. All remaining source files are referenced by at least one import or entry point.
7. `design/storybook-issues.md` and `design/storybook-issues-plan.md` are in `archive/`.
8. `design/phases/0_scaffolding.md` is in `archive/`.
9. All verification checks above pass.

---

## Definition of done

- [ ] All files listed under "Source code deletions" are removed.
- [ ] `grep -r "from '.*views/"` returns no results.
- [ ] `design/storybook-issues.md` moved to `design/screenshots/archive/`.
- [ ] `design/storybook-issues-plan.md` moved to `design/screenshots/archive/`.
- [ ] `design/phases/0_scaffolding.md` moved to `design/screenshots/archive/`.
- [ ] `npx nuxt typecheck` exits 0.
- [ ] `npm test` exits 0.
- [ ] `npm run build-storybook` exits 0.
- [ ] Docker build succeeds.
- [ ] Prettier check passes.
