# Shared Journal PWA — Project Outline

## Overview

A mobile-first Progressive Web Application that lets users create personal **Paths** (single-user, ownable streams of entries), create entries (text and/or images) tied to a day, and share read-only access to Paths with other users or by email. Users may subscribe to any number of Paths, and the UI presents all owned and subscribed Paths together, with simple toggles to hide or show individual Paths.

The system must support **full user-controlled data export** in JSON format, with all associated images exportable as an archive whose filenames match the JSON metadata. Those filenames should be human-readable, e.g. isodate[_nn][_short-caption-slug-if-applicable].ext where nn is the nth image for that day padded to preserve ordering.

Backend services are deployed on **fly.io** using Docker images. Object storage is provided by S3-compatible storage. Relational data is stored in Postgres. Frontend uses Ionic + Vue + Vite + TypeScript. Backend uses FastAPI + Pydantic v2 + SQLAlchemy. The app is local-first with opportunistic syncing and signed-URL-based object access. Row-wise access control is enforced on all backend endpoints, and export artifacts are encrypted at rest with strict access controls. Admins have no access to user data except for audit logs and the ability to suspend accounts or lock Paths.

---

## Repository & API ownership

* The project uses a **two-repository design**:

  * `paths`: API specification ownership, FastAPI implementation, schema evolution policy, and contract publication.
  * `paths-frontend`: Ionic/Vue client implementation consuming backend contracts.
* The backend repository is the source of truth for API contracts and OpenAPI output.
* API compatibility policy:

  * For API major versions `>= 1`, backend changes must maintain backwards compatibility within the same major version.
  * Breaking changes require a major-version bump and migration notes.

---

## Key Concepts & Terminology

### Core concepts

* **Path**

  * A single-user, ownable stream of entries.
  * Represents a topic, perspective, or ongoing thread.
  * The *only* unit that can be shared, subscribed to, or made public.
* **Entry**

  * A submission for a given day, containing text and/or images.
  * Identified by `entry_id`.
* **Edit**

  * An immutable revision to an Entry.
  * Each edit has a unique `edit_id`.
  * Entries point to exactly one “live” edit.
* **Subscription**

  * Read-only access to a Path owned by another user.
* **Export**

  * A user-initiated operation that produces a complete, portable snapshot of their data in JSON plus image files.

### Explicit non-concepts

* There is no diary, journey, collection, or aggregation entity.
* There is no persisted grouping or saved viewset in the MVP.

---

## Non-functional constraints / targets

* Scale (MVP): < 50 users, < 100 entries/day.
* Code should scale to 100k+ users with infrastructure changes only.
* Privacy: GDPR required (including right of access and data portability).
* Security: HTTPS everywhere, encryption at rest, signed object URLs.
* Offline: installable PWA, background sync, thumbnails cached locally.
* Images: up to ~4K resolution, modern compressed formats, thumbnails mandatory.
* Backups: daily Postgres backups; S3 lifecycle rules for exported data.

---

## High-level architecture

### Components

#### 1. Frontend (Ionic + Vue + Vite + TypeScript)

* PWA with service worker, background sync, push notifications (opt-in).
* IndexedDB (Dexie) for local-first storage:

  * Paths metadata
  * Entries metadata
  * Thumbnails
  * Operation queue
* UI renders all owned and subscribed Paths.
* Preference is given to user's own Paths in the UI and IndexedDB.
* Users can hide/show Paths via local UI toggles. These settings are stored locally and do not affect other users or the backend.
* Frontend build must be configurable via build-time arguments (e.g., `VITE_API_BASE_URL`, feature flags) provided to the Dockerfile. Each backend environment requires a separate container build, which is acceptable since all services are containerized and deployed independently.
* **Export UI**:

  * User can request data export.
  * Export status shown (preparing / ready / expired).
  * Downloads JSON and image archive when ready.

#### 2. Backend (FastAPI + Pydantic v2 + SQLAlchemy)

* REST API with OpenAPI JSON generated from Pydantic v2 models.
* Pydantic model definitions must include rich API metadata (`description`, field constraints, and realistic `examples`) sufficient to auto-generate high-fidelity MSW mocks for frontend development.
* Auth via OAuth (Google, Apple) and verified email.
* Signed object URLs issued by backend after access checks.
* Background work (image processing, exports) handled by:

  * fly.io Machines / worker processes, or
  * async background tasks with bounded execution time.
* Stateless app instances; all state in Postgres or object storage.
* CORS policy must be environment-driven (allowed origins configured via env vars), not hardcoded.

#### 3. Storage

* S3-compatible object storage for:

  * Original images
  * Processed images and thumbnails
  * Export JSON files and image archives
* Separate prefixes or buckets for:

  * User uploads
  * Derived assets
  * Export artifacts (with lifecycle expiry)

#### 4. Database

* Postgres (managed or self-hosted, depending on environment).
* Encrypted at rest.
* Schema migrations via Alembic.

#### 5. Email

* Abstracted email layer.
* SMTP-compatible wrapper configured via environment variables.
* Used for verification, password-resetting, invitations, and optional export notifications.

#### 6. CI/CD

* GitHub Actions:

  * Formatting (ruff, prettier) [on PR, with auto-commit of fixes]
  * Unit tests + coverage
  * Integration tests
  * Docker image build
  * fly.io deploy to staging and production
    * Governed by branch and generated from a template `fly.toml` with environment-specific overrides.

#### 7. Logging & Auditing

* Append-only audit log table.
* Tracks:

  * User actions on Paths and Entries
  * Sharing and access changes
  * Export requests and downloads (metadata only)
* MUST NOT INCLUDE sensitive data or export contents.

---

## Fly.io naming and environment strategy

* Do not use fixed app names in committed configs.
* Use a consistent naming convention per service and environment, for example:

  * `<org>-paths-<env>`
  * `<org>-paths-frontend-<env>`
* `fly.toml` templates should be parameterized at deploy time (CI/CD variables or generated config).
* Frontend-to-backend wiring must use environment variables (e.g. `VITE_API_BASE_URL`) so CORS and hostnames can change per environment.

---

## Data model (core tables)

### admin_users

* id (uuid, PK)
* email (unique)
* oauth_provider, oauth_id
* display_name
* created_at, updated_at

### admin_permissions
* id (uuid, PK)
* admin_user_id (FK admin_users.id)
* permission (enum: suspend_users, manage_paths, view_audit_logs, etc.)
* created_at, updated_at

### users

* id (uuid, PK)
* email (unique, verified)
* display_name
* oauth_provider, oauth_id
* is_suspended
* created_at, updated_at

### paths

* id (uuid, PK)
* owner_user_id (FK users.id)
* title, description
* color (calendar ticks)
* is_public (bool)
* public_locked (bool)
* created_at, updated_at

### entries

* id (uuid, PK)
* path_id (FK paths.id)
* day (date, user-local)
* live_edit_id (uuid)
* created_by_user_id
* created_at, updated_at

### edits

* id (uuid, PK)
* entry_id (FK entries.id)
* text (nullable, md or plaintext; md can reference images by filename; client must ensure these match actual images attached to the entry; images not referenced in the latest edit are removed from the entry and deleted from storage)
* created_at
* metadata (jsonb)

### images (stored in object storage, one entry can reference multiple images)
* id (uuid, PK)
* entry_id (FK entries.id)
* filename
* caption (optional, user-provided)
* mime_type
* width
* height
* s3_key
* created_at, deleted_at (hard delete if orphaned after edit changes)
* metadata (jsonb)
* Note: images are immutable once created; edits reference them by filename in the JSON export.

### subscriptions

* id (uuid)
* user_id
* path_id
* color (user-customizable calendar tick color)
* created_at
* unread_count

### invitations

* id
* inviter_user_id (FK users.id)
* email (nullable; invited user may or may not have an account yet)
* user_id (nullable FK to users.id, if the invited email has registered)
* path_id
* token
* status
* created_at, expires_at

### audit_logs

* id
* actor_user_id (nullable; for user actions)
* admin_actor_user_id (nullable; for admin actions)
* action_type
* target_type
* target_id
* details (jsonb)
* created_at

### exports

* id (uuid)
* user_id
* status (pending | ready | expired | failed)
* json_s3_key
* images_archive_s3_key
* created_at
* expires_at

---

## Data Export specification

### Scope

* Users can export **all Paths they can read**, including:

  * All Entries
  * Latest Edit per Entry
  * Image metadata

This applies equally to their own Paths and Subscribed (read-only) Paths.

### JSON export contents

* Export metadata (user_id, export timestamp, version)
* paths[]:

  * path_id
  * title
  * description
  * entries[]:

    * day (YYYY-MM-DD)
    * entry_id
    * latest_edit_id
    * text (nullable)
    * images[]:
      * filename
      * caption (optional)
      * mime_type
      * width
      * height

### Images

* All images bundled into a single archive (zip or tar.gz).
* Filenames are deterministic and stable.
* Filenames in the archive **must exactly match** those referenced in JSON.
* No URLs embedded in export data except where they are part of the paths.entries.text content (can be markdown/plaintext).

### Delivery

* Export is asynchronous.
* Backend provides signed download URLs when ready.
* URLs are short-lived.
* Export artifacts are deleted automatically after expiry.

---

## API surface (examples)

* POST /paths
* GET /paths
* POST /paths/{id}/entries
* PUT /paths/{id}/entries/{entry_id}
* POST /exports
* GET /exports/{export_id}
* GET /exports/{export_id}/download/json
* GET /exports/{export_id}/download/images

---

## Sync & Offline design

* Local IndexedDB mirrors server metadata.
* Operation queue records create/edit/delete actions.
* Writes include `expected_edit_id`.
* On mismatch, server returns 409; client prompts user to rebase or discard.
* Export always uses canonical server state.

---

## Image processing pipeline

* Client uploads directly to object storage via signed PUT URL.
* Backend validates ownership and metadata.
* Worker:

  * Converts to WebP/AVIF
  * Generates thumbnails
  * Optionally strips EXIF
* Export uses stored canonical images, not thumbnails.

---

## Security & Privacy

### Baseline protections

* HTTPS transport
* Encrypted storage
* Signed object URLs
* Strict access checks before URL issuance

### Export-specific

* Export artifacts encrypted at rest.
* Access restricted to exporting user.
* Export creation and downloads are audit-logged.
* Admins cannot export user data.

---

## Moderation & Admin features

* Admin dashboard:

  * Suspend users
  * Enable/disable Path creation
  * Lock Path public visibility
  * Manage subscriptions
  * View audit logs
* No admin editing of user content except removal where legally required.

---

## CI / CD / Testing

* Backend: pytest, coverage.
* Frontend: Vitest.
* E2E: Playwright.
* GitHub Actions:

  * Auto-format and commit fixes
  * Build Docker image
  * Deploy to fly.io (staging / production)
  * Run smoke and E2E tests

---

## Milestones & Implementation plan

### Phase 0 — Scaffolding (split by repository)

Initial repository and CI setup, detailed in ./phases/0_scaffolding.md.

### Phase 1 — Core data & auth

* Paths, Entries, Edits
* OAuth + email verification
* Admin gating for Path creation

### Phase 2 — Attachments & images

* Signed uploads
* Processing worker
* Thumbnails

### Phase 2.5 — Data export

* Export schema
* Background export job
* Lifecycle rules
* Export UI

### Phase 3 — Sharing & subscriptions

* Invitations
* Public Paths
* Calendar view across Paths

### Phase 4 — Offline & sync

* IndexedDB
* Operation queue
* Conflict handling

### Phase 5 — Admin & audit

* Admin UI
* Audit logs

### Phase 6 — QA & release

* E2E tests
* Production deploy
