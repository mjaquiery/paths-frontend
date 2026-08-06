import { http, HttpResponse } from 'msw';

import {
  entryResponseFixture,
  exportJobResponseFixture,
  pathResponseFixture,
} from '../generated/fixtures';

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
    HttpResponse.json(exportJobResponseFixture, { status: 202 }),
  ),
];
