# paths-frontend

Ionic + Vue + Vite frontend for the Path-centric backend.

## Development

```bash
npm install
npm run codegen:openapi
npm run dev
```

## Build

```bash
npm run build
```

Required env:

- `VITE_API_BASE_URL` (e.g. `https://api.example.com`)

## OpenAPI code generation

`schema/openapi.json` is the source for generated frontend artifacts:

- `src/generated/types.ts`
- `src/generated/apiClient.ts`
- `src/generated/fixtures.ts`
- `src/generated/mswHandlers.ts`

Regenerate with:

```bash
npm run codegen:openapi
```

A PR CI job re-runs generation when `schema/openapi.json` changes and auto-commits any generated diffs.

## Storybook

```bash
npm run storybook
```

## Testing

```bash
npm run test
```

## Deploys

Deploys run via `.github/workflows/fly-deploy.yml` (Fly.io).

- **Staging**: deploys automatically on every push to `main`, and on every pull request targeting `main` (so reviewers can check a PR's build before merge).
- **Production**: deploys automatically after `create-release.yml` finishes successfully (`workflow_run` trigger), using `fly.prod.toml`. Can also be triggered manually via the workflow's `workflow_dispatch` input (`environment: production`).

### Creating a release (deploys to production)

1. Tag the commit on `main` you want to release: `git tag vX.Y.Z && git push origin vX.Y.Z`.
2. `.github/workflows/create-release.yml` verifies the tag is on `main`, then creates a GitHub release from it.
3. On that workflow's success, `fly-deploy.yml` runs via `workflow_run` and deploys that same commit to production.

Note: `create-release.yml`'s release step uses the default `GITHUB_TOKEN`, whose events don't trigger other workflows — that's why production deploy chains off `workflow_run` (create-release finishing) rather than the release's own `created`/`published` event.
