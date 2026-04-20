/**
 * E2E tests: User exports data and downloads JSON / image archive.
 *
 * Scenarios (per AGENTS/plan.md Chunk 6):
 *
 *   Scenario 2 — User exports data:
 *     Starting from a state with ≥ 1 path and ≥ 1 entry, navigate to the
 *     Settings page, select the path checkbox, trigger an export, wait for the
 *     job to reach the "ready" state, and verify the Download JSON / Download
 *     images buttons appear.
 *
 *   Scenario 3 — User downloads JSON and image archive:
 *     Extends Scenario 2 by clicking each download button and asserting that
 *     the browser initiates a file download.
 *
 * All backend API calls are intercepted by page.route() — no real server
 * is required.
 */

import { test, expect } from 'playwright/test';
import {
  MOCK_USER,
  MOCK_TOKEN,
  MOCK_PATH,
  MOCK_EXPORT_JOB_QUEUED,
  MOCK_EXPORT_JOB_READY,
  MOCK_DOWNLOAD_URL_JSON,
  MOCK_DOWNLOAD_URL_IMAGES,
} from '../fixtures/index.js';

const API_BASE = 'http://localhost:8080';

/**
 * Inject a mock authenticated session into localStorage before the page
 * loads, simulating a completed OAuth callback.
 */
async function injectMockSession(
  page: import('playwright/test').Page,
): Promise<void> {
  await page.addInitScript(
    ({ user, token }: { user: typeof MOCK_USER; token: string }) => {
      localStorage.setItem('session_token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    { user: MOCK_USER, token: MOCK_TOKEN },
  );
}

/**
 * Register all API routes needed by the Settings / Export flow.
 *
 * @param page          The Playwright page.
 * @param exportReadyImmediately  When true, the export job is returned as
 *   "ready" from the very first GET /v1/exports/{id} call.  Otherwise, it
 *   transitions from "queued" to "ready" on the second poll.
 */
async function setupExportRoutes(
  page: import('playwright/test').Page,
  exportReadyImmediately = false,
): Promise<void> {
  const jobId = MOCK_EXPORT_JOB_QUEUED.id;

  // Paths list
  await page.route(`${API_BASE}/v1/paths`, (route, request) => {
    if (request.method() === 'GET') {
      return route.fulfill({ json: [MOCK_PATH] });
    }
    return route.continue();
  });

  // Create export job
  await page.route(`${API_BASE}/v1/exports`, (route, request) => {
    if (request.method() === 'POST') {
      return route.fulfill({ status: 202, json: MOCK_EXPORT_JOB_QUEUED });
    }
    return route.continue();
  });

  // Poll export job status
  let pollCount = 0;
  await page.route(`${API_BASE}/v1/exports/${jobId}`, (route) => {
    pollCount += 1;
    const ready = exportReadyImmediately || pollCount >= 2;
    return route.fulfill({
      json: ready ? MOCK_EXPORT_JOB_READY : MOCK_EXPORT_JOB_QUEUED,
    });
  });

  // Download URL endpoints
  await page.route(`${API_BASE}/v1/exports/${jobId}/download/json`, (route) =>
    route.fulfill({ json: MOCK_DOWNLOAD_URL_JSON }),
  );
  await page.route(`${API_BASE}/v1/exports/${jobId}/download/images`, (route) =>
    route.fulfill({ json: MOCK_DOWNLOAD_URL_IMAGES }),
  );

  // Mock the actual file download URLs so downloadFileFromUrl() can fetch them
  await page.route(`${API_BASE}/mock-download/paths_export.json`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ source: 'e2e_mock', entries: [] }),
    }),
  );
  await page.route(`${API_BASE}/mock-download/paths_export.zip`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/zip',
      body: Buffer.from('PK'),
    }),
  );

  // Absorb any remaining API requests
  await page.route(`${API_BASE}/**`, (route) => route.fulfill({ status: 204 }));
}

test.describe('export data', () => {
  test.beforeEach(async ({ page }) => {
    await injectMockSession(page);
  });

  test('user triggers an export and sees download buttons', async ({
    page,
  }) => {
    await setupExportRoutes(page);

    await page.goto('/settings');

    // Wait for the ExportCard to render (it is inside a <Suspense> block)
    await page.waitForSelector('ion-checkbox', { timeout: 10_000 });

    // Select the path checkbox in the export card
    await page.locator('ion-checkbox').first().click();

    // Trigger the export
    await page.getByRole('button', { name: 'Trigger export' }).click();

    // The export job polls until "ready" and then reveals download buttons.
    // Allow up to 20 s to account for the 2-second polling interval.
    await page.waitForSelector('ion-button:has-text("Download JSON")', {
      timeout: 20_000,
    });

    await expect(
      page.getByRole('button', { name: 'Download JSON' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Download images' }),
    ).toBeVisible();
  });

  test('user downloads JSON and image archive', async ({ page }) => {
    // Use immediately-ready export so the download buttons appear quickly
    await setupExportRoutes(page, true);

    await page.goto('/settings');

    await page.waitForSelector('ion-checkbox', { timeout: 10_000 });

    // Select the path for export
    await page.locator('ion-checkbox').first().click();

    // Trigger the export
    await page.getByRole('button', { name: 'Trigger export' }).click();

    // Wait for download buttons
    await page.waitForSelector('ion-button:has-text("Download JSON")', {
      timeout: 20_000,
    });

    // ── JSON download ──────────────────────────────────────────────────────
    // downloadFileFromUrl fetches the URL, creates a blob URL, and triggers
    // an anchor click with the `download` attribute set.  Playwright captures
    // this as a download event.
    const [jsonDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Download JSON' }).click(),
    ]);

    expect(jsonDownload.suggestedFilename()).toMatch(/\.json$/);

    // ── Image archive download ─────────────────────────────────────────────
    const [imagesDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Download images' }).click(),
    ]);

    expect(imagesDownload.suggestedFilename()).toMatch(/\.zip$/);
  });
});
