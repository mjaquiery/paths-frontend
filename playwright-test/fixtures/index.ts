/**
 * Shared fixture data for Playwright E2E tests.
 *
 * All fixture objects correspond to the generated TypeScript types in
 * src/generated/types/ and represent a minimal but self-consistent state
 * with a single user, one path, one entry, and one export job.
 */

export const MOCK_USER = {
  user_id: 'user-e2e-00000000',
  display_name: 'E2E Tester',
};

export const MOCK_TOKEN = 'mock-session-token-e2e';

/** A path owned by MOCK_USER */
export const MOCK_PATH = {
  path_id: 'path-e2e-00000000',
  uuid: 'aaaaaaaa-0000-0000-0000-000000000000',
  owner_user_id: 'user-e2e-00000000',
  title: 'E2E Test Path',
  description: null,
  color: '#3949ab',
  is_public: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

/** Today's date in YYYY-MM-DD format */
export const TODAY = new Date().toISOString().slice(0, 10);

/** A server-side entry draft */
export const MOCK_DRAFT = {
  id: 'draft-e2e-00000000',
  mode: 'create',
  state: 'open',
  path_id: 'path-e2e-00000000',
  entry_id: null,
  day: TODAY,
  content: '',
  based_on_edit_id: null,
  images: [],
  expires_at: '2026-01-02T00:00:00Z',
};

/** A committed entry returned after commitEntryDraft */
export const MOCK_ENTRY = {
  id: 'entry-e2e-00000000',
  path_id: 'path-e2e-00000000',
  day: TODAY,
  edit_id: 1,
  content: 'Hello E2E world',
  image_filenames: [],
};

/** An export job in the queued/running state */
export const MOCK_EXPORT_JOB_QUEUED = {
  id: 'export-e2e-00000000',
  state: 'queued',
  requested_path_ids: ['path-e2e-00000000'],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  expires_at: null,
  failure_code: null,
  attempt_count: 0,
};

/** An export job in the ready state */
export const MOCK_EXPORT_JOB_READY = {
  ...MOCK_EXPORT_JOB_QUEUED,
  state: 'ready',
  updated_at: '2026-01-01T00:01:00Z',
  expires_at: '2026-01-02T00:00:00Z',
  attempt_count: 1,
};

/** Mock signed download URL for the JSON export artifact */
export const MOCK_DOWNLOAD_URL_JSON = {
  url: 'http://localhost:8080/mock-download/paths_export.json',
  expires_in_seconds: 3600,
};

/** Mock signed download URL for the images archive */
export const MOCK_DOWNLOAD_URL_IMAGES = {
  url: 'http://localhost:8080/mock-download/paths_export.zip',
  expires_in_seconds: 3600,
};
