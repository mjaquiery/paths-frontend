# Coding Agent Instructions — Shared Journal PWA (fly.io, Path-only)

This file defines strict guidance for GitHub Copilot contributing to this repository.

This repository is the **frontend**.

You **must never change `schema/openapi.json`**. If changes are necessary in this file, stop what you are doing and DO NOT CONTINUE until the file is in a proper state for continuation.

This file comes from the backend and represents the backend's ground truth; changing it will result in desynching the front and back ends.

---

## Core terminology (non-negotiable)

- **Path** is the only content container.
- Entries, Images, and Edits belong to exactly one Path.
- There is no diary, journey, or aggregation entity.
- UI filtering does not affect server state.
- User may only export data they have read access to (read-write access okay).

If code introduces alternative container concepts, it is incorrect.

---

## Stack

- Ionic + Vue + Vite + TypeScript
- IndexedDB via Dexie
- API client generated from OpenAPI schema via Orval

---

## General rules

1. Produce deterministic, reproducible code.
2. Respect formatting: Vue/TypeScript via prettier (run `npm run format`).
3. Generate tests alongside features using Vitest.
4. Keep the generated API client (`src/generated/`) in sync with `schema/openapi.json` by running `npm run codegen:openapi`.
5. All services must be containerised (Dockerfile-based).

---

## Frontend rules

- Render all owned and subscribed Paths by default.
- Hide/show Paths locally only — never mutate server state for display filtering.
- Can check updates via `latest_edit_id` without fetching full entry data.
- Export UI must:
  - Trigger export
  - Poll status
  - Download JSON and images
  - Handle expiry gracefully

---

## Testing requirements

- Unit tests with Vitest (`npm test`).
- Tests live alongside source files or in `src/__tests__/`.

---

## CI / CD rules

- On PR:
  - Run prettier
  - Auto-commit formatting fixes unless last commit was by the action
  - Run unit tests

- On merge to main:
  - Build Docker image
  - Deploy to fly.io staging

- On release:
  - Deploy to fly.io production

---

## Infrastructure expectations

- Stateless app containers.
- All configuration via environment variables.
- No local filesystem persistence beyond ephemeral temp files.

---

## Final guardrails

- Path is the only conceptual container.
- Exported data must be portable and self-contained.
- Prefer simple, explicit designs over clever abstractions.
- Do not modify `schema/openapi.json` or any file under `src/generated/` directly — regenerate them using `npm run codegen:openapi`.
