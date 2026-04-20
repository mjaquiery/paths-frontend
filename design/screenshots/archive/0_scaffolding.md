# Phase 0 (Frontend) — Scaffolding Plan

## Objective

Stand up the `paths-frontend` repository with Ionic + Vue + Vite + TypeScript, configured to integrate with backend environments via env vars and support contract-driven development using API mocks.

## Deliverables

1. **Repository baseline** (`paths-frontend`)
   - Ionic + Vue + Vite + TypeScript skeleton.
   - `Dockerfile` for production build/runtime.
   - `fly.toml` template without fixed app names.

2. **Contract-driven frontend development**
   - Environment-based API base URL (`VITE_API_BASE_URL`).
   - MSW setup capable of consuming backend OpenAPI-derived mocks for local development and tests.
   - Frontend development should not require running the real backend by default.

3. **CORS-aware integration setup**
   - Documentation for expected backend CORS env vars per environment.
   - Explicit configuration guidance for staging/prod hostnames.

4. **CI baseline**
   - prettier + unit tests (Vitest) + lint checks (TypeScript-focused; no ruff in this frontend repo).

## Repository Layout

```text
paths-frontend/
  src/
  public/
  Dockerfile
  fly.toml
  package.json
  vite.config.ts
  ionic.config.json
  README.md
```

## Detailed Plan

### 1. Repository bootstrap

1. Initialize Ionic + Vue + Vite + TypeScript project.
2. Add app shell and API client module configured via `VITE_API_BASE_URL`.
3. Add initial tests for app load and API client configuration.

### 2. MSW and API mocking workflow

1. Add MSW configuration for browser/test runtime.
2. Use `msw-auto-mock` as the default tool to generate mock handlers/fixtures from backend OpenAPI schema.
   - The OpenAPI schema will be provided in this repository when available and before any implementation steps that depend on it.
   - If `msw-auto-mock` blocks required use cases (e.g., unsupported schema shapes), document the limitation and evaluate alternatives (`orval`, custom generator) in a follow-up decision record.
3. Include realistic sample mock responses aligned with backend examples.

### 3. Containerization and Fly deployment

1. Add frontend Dockerfile (multi-stage build).
2. Add `fly.toml` template with variable-driven app naming and env config.
   - `fly.toml` is treated as a committed template.
   - CI/deploy commands may patch template values or inject values via `flyctl` command-line arguments.

### 4. Integration configuration

1. Document required build-time arguments (provided as env vars to `docker build` or Vite):
   - `VITE_API_BASE_URL`
   - optional feature flags for mock/live API switching
2. Document expected CORS coordination with backend allowed origins.

### 5. Local and CI command expectations

1. `npm run dev` starts local development.
2. `npm run test` runs the frontend test suite.
3. Docker build must run successfully and invoke `npm run build` as part of 2-stage image creation.

## Fly app naming convention

Use parameterized names, not fixed literals:

- `<org>-paths-frontend-<env>`

Examples:

- `acme-paths-frontend-staging`
- `acme-paths-frontend-prod`

## Acceptance Criteria

Phase 0 frontend is complete when:

- `paths-frontend` is runnable locally.
  - Verified with `npm run dev`.
- Frontend can run in mock mode without a live backend.
- Frontend can target different backend environments by rebuilding with different build-time arguments (e.g., `VITE_API_BASE_URL`).
- `fly.toml` avoids fixed app names and supports env-specific deployment.
  - Verified by template patch/injection flow used by `flyctl` during deploy.
- Test and build workflow are executable via:
  - `npm run test`
  - Docker build that executes `npm run build`.
