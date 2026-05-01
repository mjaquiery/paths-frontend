# AGENTS.md — Frontend Coding Agent Guide

This document defines how coding agents should work in this repository.

Scope: **this is a frontend-only repo**.

---

## 1) Mission and Scope

- Build and maintain the frontend application.
- Prioritize correctness, clarity, maintainability, and predictable behavior.
- Do not implement backend-only behavior here unless explicitly requested.
- Treat backend API contracts as external source-of-truth inputs.

---

## 2) Runtime Model (Critical)

- The app must be delivered as a **statically compiled, client-only bundle**.
- Nuxt is used for **developer experience and frontend tooling**, not as an application backend.
- **Do not rely on Nuxt server capabilities** for production app behavior:
  - no SSR-dependent business logic,
  - no API proxying through Nuxt server routes,
  - no backend orchestration in Nuxt server code.
- The browser client should communicate **directly with the backend API**.
- Any exception requires explicit project-owner approval.

---

## 3) Non-Negotiables

- **Do not edit `schemas/openapi.json`.**
  - If a task appears to require changing it, stop and report that backend/schema alignment is required.
- Keep changes deterministic and reproducible.
- Follow existing project conventions before introducing new patterns.
- Prefer explicit code over clever abstractions.

---

## 4) Product Concepts (Current Domain Language)

- Use the current domain model as implemented by the app and API.
- Avoid reintroducing deprecated or speculative terminology.
- If naming looks inconsistent in code vs UX copy:
  - preserve API/data model correctness first,
  - then propose a follow-up cleanup if needed.

---

## 5) Frontend Architecture Expectations

- Stack: Nuxt + Vue + TypeScript (Ionic UI where applicable).
- Local persistence: IndexedDB via Dexie (where applicable).
- API integration:
  - Generate or consume typed API clients from current schema/tooling.
  - Keep request/response handling compatible with OpenAPI.
  - Surface API errors in user-meaningful ways.

- UI behavior:
  - Preserve existing design system/patterns unless task explicitly asks for redesign.
  - Prefer accessible, responsive, mobile-safe interactions.
  - Avoid hidden state mutations from purely visual filters/toggles unless intentionally persisted.

---

## 6) Change Workflow for Agents

When implementing a task:

1. Understand existing behavior before editing.
2. Make minimal, focused changes for the requested outcome.
3. Update/add tests alongside behavior changes.
4. Run verification steps (see below).
5. Report what changed, what was verified, and any residual risks.

For larger work, break changes into small logical commits (when asked to commit).

---

## 7) Verification Checklist (Frontend)

Use as many of these as relevant to the change:

- `npm run test` (or targeted test commands)
- `npm run build` (must succeed for static/client bundle output)
- `npx tsc --noEmit`
- Lint/format checks used by the repo (e.g., `npm run lint`, `npm run format`)
- Any API contract compatibility checks tied to `schemas/openapi.json`
- E2E/integration checks when UI flows or API wiring change

If a command fails:
- include the exact failing step,
- summarize likely cause,
- propose the smallest safe fix.

---

## 8) Testing Expectations

- New features: include/adjust tests at appropriate layers.
- Bug fixes: add a regression test when feasible.
- Refactors: preserve behavior; prove via existing tests and type checks.
- Prefer focused tests that validate behavior, not implementation details.

Suggested layers (as applicable):
- Unit tests for local logic/components
- Integration tests for API/UI interactions
- E2E tests for critical user flows

---

## 9) API and Schema Compatibility

- Treat OpenAPI as contract input, not editable frontend config.
- Keep API usage aligned with schema-defined paths, payloads, and response handling.
- If the frontend and API behavior diverge:
  - do not “paper over” contract mismatches silently,
  - document mismatch and propose coordinated backend/frontend follow-up.

---

## 10) Safety and Repo Hygiene

- Never commit secrets or credentials.
- Do not add unnecessary dependencies.
- Avoid broad unrelated refactors in feature/fix tasks.
- Keep diffs tight and reviewable.
- Respect existing git changes in the working tree; do not revert unrelated user changes.

---

## 11) PR/Delivery Guidance

When finishing work, provide:

- What changed (by area/file)
- Why it changed
- Verification performed (commands + result)
- Any follow-ups or known limitations

Keep explanations concise and actionable.

---

## 12) Decision Rules for Agents

When uncertain:

1. Choose the option that preserves current behavior and compatibility.
2. Prefer type-safe and test-backed solutions.
3. Ask for clarification only when ambiguity materially changes behavior or risk.
4. If blocked by external dependency (backend/schema/product decision), report blocker early with recommended next step.

---

## 13) Out of Scope Unless Requested

- Backend endpoint/model changes
- Infra/deployment redesign
- Broad visual redesign
- Cross-repo contract changes without coordination
- Introducing Nuxt server-side runtime dependencies for core app behavior
