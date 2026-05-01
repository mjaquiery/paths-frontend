/**
 * E2E test: User creates a Path and an Entry.
 *
 * Scenario (per AGENTS/plan.md Chunk 6):
 *   - Log in via mocked localStorage (simulating a completed OAuth callback).
 *   - Navigate to /paths/new, fill in a title, submit — verify redirect to /.
 *   - Navigate to /entry/{pathId}/new, fill in content, publish — verify
 *     navigation to the new entry view.
 *
 * All backend API calls are intercepted by page.route() so no real server
 * is required.
 */

import { test, expect } from 'playwright/test';
import {
  MOCK_USER,
  MOCK_TOKEN,
  MOCK_PATH,
  MOCK_DRAFT,
  MOCK_ENTRY,
} from '../fixtures/index.ts';

const API_BASE = 'http://localhost:8080';

/**
 * Inject a mock authenticated session into localStorage before the page
 * loads.  This simulates a completed OAuth callback without requiring a
 * real OAuth provider.
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

test.describe('create path and entry', () => {
  test.beforeEach(async ({ page }) => {
    await injectMockSession(page);
  });

  test('user creates a new path', async ({ page }) => {
    // Track whether the paths list has been fetched yet so we can return the
    // created path on subsequent GETs.
    let pathsCreated = false;

    await page.route(`${API_BASE}/v1/paths`, (route, request) => {
      if (request.method() === 'POST') {
        pathsCreated = true;
        return route.fulfill({ status: 201, json: MOCK_PATH });
      }
      // GET: empty until the path is created, then return it
      return route.fulfill({ json: pathsCreated ? [MOCK_PATH] : [] });
    });

    // Absorb any other API requests so they don't cause network errors
    await page.route(`${API_BASE}/**`, (route) =>
      route.fulfill({ status: 204 }),
    );

    await page.goto('/paths/new');

    // Fill in the path title — ion-input wraps a native <input> in shadow DOM;
    // Playwright's getByPlaceholder pierces shadow roots automatically.
    await page.getByPlaceholder('Path title').fill('E2E Test Path');

    // Submit the form
    await page.getByRole('button', { name: 'Create Path' }).click();

    // The new.vue handler calls router.replace('/') on success
    await page.waitForURL('/');
    await expect(page).toHaveURL('/');
  });

  test('user creates a new entry for an existing path', async ({ page }) => {
    const pathId = MOCK_PATH.path_id;
    const draftId = MOCK_DRAFT.id;
    const entryId = MOCK_ENTRY.id;

    // Paths: return the pre-existing mock path so the editor can load
    await page.route(`${API_BASE}/v1/paths`, (route, request) => {
      if (request.method() === 'GET') {
        return route.fulfill({ json: [MOCK_PATH] });
      }
      return route.continue();
    });

    // Draft creation: GET /v1/paths/{pathId}/entries/drafts?day=…
    // Use a glob pattern (** matches query string) instead of a regex to
    // avoid CodeQL's incomplete-sanitization warning for string-built regexes.
    await page.route(
      `${API_BASE}/v1/paths/${pathId}/entries/drafts**`,
      (route) => route.fulfill({ json: MOCK_DRAFT }),
    );

    // Draft patch (autosave / content flush before commit)
    await page.route(
      `${API_BASE}/v1/entry-drafts/${draftId}`,
      (route, request) => {
        if (request.method() === 'PATCH') {
          return route.fulfill({
            json: { ...MOCK_DRAFT, content: 'Hello E2E world' },
          });
        }
        if (request.method() === 'DELETE') {
          return route.fulfill({ status: 204 });
        }
        return route.continue();
      },
    );

    // Draft commit: POST /v1/entry-drafts/{draftId}/commit
    await page.route(`${API_BASE}/v1/entry-drafts/${draftId}/commit`, (route) =>
      route.fulfill({ json: MOCK_ENTRY }),
    );

    // Entries list returned after cache invalidation on the entry view
    await page.route(`${API_BASE}/v1/paths/${pathId}/entries**`, (route) =>
      route.fulfill({ json: [MOCK_ENTRY] }),
    );

    // Absorb remaining API calls
    await page.route(`${API_BASE}/**`, (route) =>
      route.fulfill({ status: 204 }),
    );

    // Navigate directly to the entry-creation view for the given path.
    // The route param pre-populates selectedPathId, which triggers ensureDraft()
    // immediately on mount (no need to interact with the ion-select).
    await page.goto(`/entry/${pathId}/new`);

    const editor = page.getByPlaceholder('Write your entry... (markdown supported)');
    await editor.waitFor({ state: 'visible', timeout: 10_000 });
    await editor.fill('Hello E2E world');

    // Publish the entry
    await page.getByRole('button', { name: 'Publish' }).click();

    // After a successful commit the app navigates to /entry/{pathId}/{entryId}
    await page.waitForURL(new RegExp(`/entry/${pathId}/${entryId}`), {
      timeout: 15_000,
    });
    await expect(page).toHaveURL(new RegExp(`/entry/${pathId}/${entryId}`));
  });
});
