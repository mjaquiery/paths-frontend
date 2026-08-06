import { http, HttpResponse } from 'msw';

import {
  entryResponseFixture,
  pathResponseFixture,
} from '../generated/fixtures';

// TEMPORARY: ExportJobResponse is on scripts/build-fixtures.mjs's skip list (its backend
// example is missing `failure_code` pending PR #60), so it isn't in fixtures.ts yet. Inline
// literal here for now; switch to `exportJobResponseFixture` once that fix is deployed and
// synced.
const exportJobResponse = {
  id: 'e5f6a7b8-c9d0-1234-ef01-345678901234',
  state: 'ready',
  requested_path_ids: ['AB3X7K'],
  created_at: '2024-03-15T09:00:00Z',
  updated_at: '2024-03-15T09:05:00Z',
  expires_at: '2024-03-22T09:05:00Z',
  failure_code: null,
  attempt_count: 1,
};

// Hand-written, backed by fixtures.ts (itself generated from backend-declared openapi.json
// examples) rather than orval's faker-based mock: true output. Covers only the endpoints the
// current stories/tests exercise — extend as new stories are added, not ahead of them.
export const handlers = [
  http.get('*/v1/paths', () => HttpResponse.json([pathResponseFixture])),
  http.post('*/v1/paths', () =>
    HttpResponse.json(pathResponseFixture, { status: 201 }),
  ),
  http.get('*/v1/paths/:pathCode/entries', () =>
    HttpResponse.json([entryResponseFixture]),
  ),
  http.post('*/v1/paths/:pathCode/entries', () =>
    HttpResponse.json(entryResponseFixture, { status: 201 }),
  ),
  http.post('*/v1/exports', () =>
    HttpResponse.json(exportJobResponse, { status: 202 }),
  ),
];
