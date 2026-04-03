Implement a resilient draft-based entry/image API that guarantees live entries are always self-consistent.

Core goals:

- Never leave a live entry referencing an image that is missing or unfinished.
- Never permanently delete a live image during editing before the edit is successfully committed.
- Never lose the user's written work because an image upload fails or the connection drops.
- Allow users to resume interrupted create/edit work without catastrophic loss.
- Keep images irrevocably bound to entries at commit time.
- Prefer direct-to-storage uploads over multipart entry create/edit uploads.

Required model:

- Introduce a server-side `EntryDraft` resource for both create and edit flows.
- All create/edit work happens against a draft.
- Live entry state changes only on explicit draft commit.
- Drafts persist content and staged image state across connection loss and browser/tab aborts.
- Drafts may expire, but expiry must be long enough to support recovery and must not affect live entries.

Invariants:

- A live entry must only reference images that are fully uploaded and ready.
- A live entry must never lose an existing image unless the enclosing draft commit succeeds.
- A failed upload must only fail the draft image, never the whole live entry.
- Abandoned drafts may leave temporary staged blobs, but never inconsistent live entry state.
- Filename must be unique within an entry (enforce at the database level using stable entry identity, e.g. `UNIQUE(entry_id, normalized_filename)`).

Do not do this:

- Do not replace the signed/direct upload flow with multipart create/edit entry endpoints.
- Do not delete live images immediately when a user removes them during editing.
- Do not mutate the live entry content before all required draft images are ready.
- Do not rely on `image_filenames` in live entry create/update as the primary source of truth if draft image membership exists.

Recommended API surface:

1. Start create draft

- `POST /v1/paths/{path_code}/entry-drafts`
- Request body:
  - `mode: "create"`
  - `day`
- Response includes:
  - `draft_id`
  - initial `day`
  - initial `content`
  - `images`
  - `state`
  - `expires_at`

2. Start edit draft

- `POST /v1/paths/{path_code}/entries/{entry_slug}/draft`
- Request body:
  - `based_on_edit_id`
- Response includes:
  - `draft_id`
  - `entry_id`
  - `day`
  - `content`
  - `based_on_edit_id`
  - all existing images represented as draft images
  - `state`
  - `expires_at`

3. Read/resume draft

- `GET /v1/entry-drafts/{draft_id}`
- Optionally also:
  - `GET /v1/paths/{path_code}/entries/{entry_slug}/draft`
  - `GET /v1/paths/{path_code}/entry-drafts/latest?...`

4. Save draft content/metadata

- `PATCH /v1/entry-drafts/{draft_id}`
- Supports updating:
  - `day`
  - `content`
  - image ordering / metadata-only draft state as needed
- This endpoint must be safe for autosave.

5. Create staged draft image slot

- `POST /v1/entry-drafts/{draft_id}/images`
- Request body includes:
  - `client_image_id`
  - `filename`
  - `content_type`
  - `strip_metadata`
  - optional `replace_draft_image_id`
- Response includes:
  - `draft_image_id`
  - `client_image_id`
  - `filename`
  - `status: "awaiting_upload"`
  - `upload_url`
  - `expires_in_seconds`

6. Upload bytes directly to storage

- `PUT {upload_url}`

7. Complete draft image upload

- `POST /v1/entry-drafts/{draft_id}/images/{draft_image_id}/complete`
- Request body:
  - `byte_size`
- Response includes canonical draft image state:
  - `draft_image_id`
  - `filename`
  - `status: "ready"`
  - optional image metadata needed by client

8. Retry failed/expired upload

- `POST /v1/entry-drafts/{draft_id}/images/{draft_image_id}/retry-upload`
- Returns a fresh upload URL and updated draft image state.

9. Remove image from draft

- `DELETE /v1/entry-drafts/{draft_id}/images/{draft_image_id}`
- Behavior:
  - if image came from the live entry, mark it removed in the draft only
  - if image is a newly staged upload, remove it from the draft and schedule staged blob cleanup
- This must not affect the live entry before commit.

10. Commit draft atomically

- `POST /v1/entry-drafts/{draft_id}/commit`
- Server must reject commit if:
  - markdown references filenames not present in non-removed ready draft images
  - any referenced draft image is not `ready`
  - filename uniqueness is violated
  - edit draft `based_on_edit_id` is stale
- On success, atomically publish:
  - final content
  - final image set
  - replacements
  - removals
  - new `edit_id`
- Return canonical live entry response.

11. Abandon draft

- `DELETE /v1/entry-drafts/{draft_id}`
- Optional but useful.
- Must not affect live entry state.
- Temporary staged objects should be cleaned up asynchronously.

Draft image behavior:

- Existing live images loaded into an edit draft are represented as draft images.
- New uploads are draft images until commit.
- Replacement must be modeled explicitly, not as delete-then-upload.
- Support metadata-only edits where the image binary is unchanged.
- Support replacing an image with another while keeping the same filename.
- Same-filename replacement must not create a window where the live entry points to nothing.

State model:

- Draft states:
  - `open`
  - `committing`
  - `committed`
  - `abandoned`
  - `expired`
- Draft image states:
  - `awaiting_upload`
  - `uploading`
  - `ready`
  - `failed`
  - `removed`

Failure-handling requirements:

- Connection loss during upload:
  - draft remains resumable
  - content remains saved in draft
  - live entry unchanged
- User closes tab/browser:
  - draft remains resumable
  - live entry unchanged
- Upload failure:
  - failed image marked failed in draft
  - other draft data preserved
  - user can retry or remove failed image
- Save/commit failure:
  - draft remains available for retry
  - live entry unchanged
- Storage delete failure after successful commit:
  - live entry may still be correct
  - backend must retry cleanup asynchronously until complete

Storage model:

- Staged uploads should go to draft-scoped temporary storage.
- Only commit binds staged uploads into live entry state.
- Abandoned/expired drafts must be garbage-collected.
- Deleted/replaced live images should be removed after successful commit with retry-safe cleanup.

Validation rules:

- Filenames must be unique within an entry.
- Define filename normalization explicitly.
- Reject dangerous filenames (e.g. path separators).
- Commit must validate markdown image references against the draft's ready image set.

Frontend implications this API should support well:

- User can type first and not lose text.
- User can attach images locally, upload them through draft image slots, and resume if interrupted.
- User sees progress without fearing that a failed image upload will destroy entry text.
- Remove during edit is reversible until commit.
- Caption/markdown insertion can remain a frontend concern using filenames, but backend must guarantee final filename uniqueness and readiness.

If retaining `image_filenames` anywhere:

- Keep it only as derived/response data or draft-level helper state.
- Do not require live entry create/update to be the authoritative image membership mechanism once draft image membership exists.

Success criteria:

- No live entry can ever be published with missing referenced images.
- No live image is removed from a live entry unless the overall edit commit succeeds.
- Interrupted work is recoverable.
- Uploads remain direct-to-storage, not multipart through the app server.
