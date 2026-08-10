import { http, HttpResponse } from 'msw';

import {
  blocklistEntryResponseFixture,
  entryContentResponseFixture,
  entryResponseFixture,
  exportJobResponseFixture,
  imageDownloadResponseFixture,
  imageResponseFixture,
  invitationResponseFixture,
  inviteResponseFixture,
  pathResponseFixture,
  subscriberResponseFixture,
} from '../generated/fixtures';

// Hand-written, backed by fixtures.ts (itself generated from backend-declared openapi.json
// examples) rather than orval's faker-based mock: true output. Covers only the endpoints the
// current stories/tests exercise — extend as new stories are added, not ahead of them.
export const handlers = [
  http.get('*/v1/paths', () => HttpResponse.json([pathResponseFixture])),
  http.post('*/v1/paths', () =>
    HttpResponse.json(pathResponseFixture, { status: 201 }),
  ),
  http.patch('*/v1/paths/:pathCode/visibility', () =>
    HttpResponse.json(pathResponseFixture),
  ),
  http.patch('*/v1/paths/:pathCode', () => HttpResponse.json(pathResponseFixture)),
  http.delete('*/v1/paths/:pathCode', () => new HttpResponse(null, { status: 204 })),
  http.get('*/v1/paths/:pathCode/entries', () =>
    HttpResponse.json([entryResponseFixture]),
  ),
  http.post('*/v1/paths/:pathCode/entries', () =>
    HttpResponse.json(entryResponseFixture, { status: 201 }),
  ),
  http.get('*/v1/paths/:pathCode/entries/:entrySlug', () =>
    HttpResponse.json(entryContentResponseFixture),
  ),
  http.get('*/v1/paths/:pathCode/entries/:entrySlug/images', () =>
    HttpResponse.json([imageResponseFixture]),
  ),
  http.get('*/v1/paths/:pathCode/subscriptions', () =>
    HttpResponse.json([subscriberResponseFixture]),
  ),
  http.post('*/v1/paths/:pathCode/subscriptions', () =>
    HttpResponse.json(inviteResponseFixture, { status: 201 }),
  ),
  http.delete(
    '*/v1/paths/:pathCode/subscriptions/:targetUserId',
    () => new HttpResponse(null, { status: 204 }),
  ),
  http.get('*/v1/images/:imageId/download-url', () =>
    HttpResponse.json(imageDownloadResponseFixture),
  ),
  http.get('*/v1/invitations', () => HttpResponse.json([invitationResponseFixture])),
  http.post('*/v1/invitations/:invitationId/accept', () =>
    HttpResponse.json({}),
  ),
  http.post('*/v1/invitations/:invitationId/ignore', () =>
    HttpResponse.json({}),
  ),
  http.get('*/v1/invitations/blocklist', () =>
    HttpResponse.json([blocklistEntryResponseFixture]),
  ),
  http.post('*/v1/invitations/blocklist', () =>
    HttpResponse.json(blocklistEntryResponseFixture, { status: 201 }),
  ),
  http.delete(
    '*/v1/invitations/blocklist/:blockedUserId',
    () => new HttpResponse(null, { status: 204 }),
  ),
  http.post('*/v1/exports', () =>
    HttpResponse.json(exportJobResponseFixture, { status: 202 }),
  ),
];
