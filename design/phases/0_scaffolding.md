# Phase 0 (Frontend) — Scaffolding Plan

## Objective

Stand up the `paths-frontend` repository with Ionic + Vue + Vite + TypeScript, configured to integrate with backend environments via env vars and support contract-driven development using API mocks.

## Deliverables

1. **Repository baseline** (`paths-frontend`)
   * Ionic + Vue + Vite + TypeScript skeleton.
   * `Dockerfile` for production build/runtime.
   * `fly.toml` template without fixed app names.

2. **Contract-driven frontend development**
   * Environment-based API base URL (`VITE_API_BASE_URL`).
   * MSW setup capable of consuming backend OpenAPI-derived mocks for local development and tests.
   * Frontend development should not require running the real backend by default.

3. **CORS-aware integration setup**
   * Documentation for expected backend CORS env vars per environment.
   * Explicit configuration guidance for staging/prod hostnames.

4. **CI baseline**
   * prettier + unit tests (Vitest) + lint checks.

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
2. Document/implement generation path from backend OpenAPI schema to mock handlers/fixtures.
3. Include realistic sample mock responses aligned with backend examples.

### 3. Containerization and Fly deployment

1. Add frontend Dockerfile (multi-stage build).
2. Add `fly.toml` template with variable-driven app naming and env config.

### 4. Integration configuration

1. Document required build-time arguments (provided as env vars to `docker build` or Vite):
   * `VITE_API_BASE_URL`
   * optional feature flags for mock/live API switching
2. Document expected CORS coordination with backend allowed origins.

## Fly app naming convention

Use parameterized names, not fixed literals:

* `<org>-paths-frontend-<env>`

Examples:

* `acme-paths-frontend-staging`
* `acme-paths-frontend-prod`

## Acceptance Criteria

Phase 0 frontend is complete when:

* `paths-frontend` is runnable locally.
* Frontend can run in mock mode without a live backend.
* Frontend can target different backend environments by rebuilding with different build-time arguments (e.g., `VITE_API_BASE_URL`).
* `fly.toml` avoids fixed app names and supports env-specific deployment.
