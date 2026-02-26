# Coding Agent Instructions — Shared Journal PWA (fly.io, Path-only)

This file defines strict guidance for LLM-based coding agents (Codex) contributing to this repository.

This repository is the **frontend**.

You **must never change `schemas/openapi.json`**. If changes are necessary in this file, stop what you are doing and DO NOT CONTINUE until the file is in a proper state for continuation.

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

## General rules

1. Produce deterministic, reproducible code.
2. Respect formatting:
   - Python: ruff
   - Vue/TypeScript: prettier
   - **Before opening or updating a PR, run `npm run format` (or `prettier --write .`) on all files to avoid large formatting-only diffs.**

3. Generate tests alongside features.
4. Keep OpenAPI and backend models in sync.
5. All services must be containerised (Dockerfile-based).

---

## Backend rules

### Stack

- FastAPI
- Pydantic v2 (OpenAPI documentation, examples, etc. via model config)
- SQLAlchemy (modern ORM, i.e. session.execute(select(...)) not legacy Query API)
- Alembic
- boto3 or S3-compatible SDK

### Optimistic locking

- All entry updates require `expected_edit_id` of current latest edit.
- Mismatches return HTTP 409 with structured error payload.

### Export implementation

- POST /exports creates an async export job.
- Export job:
  - Selects all Paths requested.
  - Errors if any requested Path is not owned or subscribed.
  - Rate-limits to 1 current export per pathset per user.
  - Rate-limits to 3 concurrent exports per user.
  - Serialises entries using latest edits only.
  - Writes JSON export to object storage.
  - Packages all referenced images into a single archive.

- JSON must include:
  - day
  - entry_id
  - edit_id
  - image filenames

- Image archive filenames must match JSON exactly.

### Security

- Enforce ownership checks on all export and upload endpoints.
- Admins are explicitly blocked from exporting user data.
- Signed URLs must be short-lived.

---

## Frontend rules

- Ionic + Vue + Vite + TypeScript.
- IndexedDB via Dexie.
- Render all owned and subscribed Paths by default.
- Hide/show Paths locally only.
- Can check updates via latest_edit_id without fetching full data.
- Export UI:
  - Trigger export
  - Poll status
  - Download JSON and images
  - Handle expiry gracefully

---

## Testing requirements

- Unit tests:
  - Export JSON schema correctness
  - Filename matching

- Integration tests:
  - Export lifecycle
  - Permission enforcement

- E2E tests:
  - User creates Path and Entry
  - User exports data
  - User downloads JSON and image archive

---

## CI / CD rules

- On PR:
  - Run ruff + prettier
  - Auto-commit formatting fixes unless last commit was by the action
  - Run unit and integration tests

- On merge to main:
  - Build Docker image
  - Deploy to fly.io staging
  - Run smoke and E2E tests

- On release:
  - Deploy to fly.io production

---

## Infrastructure expectations

- Stateless app containers.
- All configuration via environment variables.
- No local filesystem persistence beyond ephemeral temp files.
- Background work must tolerate restarts and retries.

---

## Final guardrails

- Path is the only conceptual container.
- Exported data must be portable and self-contained.
- No hidden server-only metadata in exports.
- Prefer simple, explicit designs over clever abstractions.
- Use FastAPI and Pydantic return_types for all endpoints to ensure correctness at the API boundary.
