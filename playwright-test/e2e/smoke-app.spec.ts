import { test, expect } from 'playwright/test';

import { MOCK_PATH, MOCK_TOKEN, MOCK_USER } from '../fixtures/index.ts';

const API_BASE = 'http://localhost:8080';

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

test.describe('app smoke routes', () => {
  test('logged-out home page renders welcome copy', async ({ page }) => {
    await page.route(`${API_BASE}/**`, (route) =>
      route.fulfill({ status: 204 }),
    );

    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Paths' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Continue with Google' }),
    ).toBeVisible();
  });

  test('authenticated path-create page renders form controls', async ({
    page,
  }) => {
    await injectMockSession(page);
    await page.route(`${API_BASE}/**`, (route) =>
      route.fulfill({ status: 204 }),
    );

    await page.goto('/paths/new');

    await expect(page.getByText('New Path')).toBeVisible();
    await expect(page.getByPlaceholder('Path title')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Create Path' }),
    ).toBeVisible();
  });

  test('authenticated settings page renders export controls', async ({
    page,
  }) => {
    await injectMockSession(page);

    await page.route(`${API_BASE}/v1/paths`, (route, request) => {
      if (request.method() === 'GET') {
        return route.fulfill({ json: [MOCK_PATH] });
      }
      return route.fulfill({ status: 204 });
    });
    await page.route(`${API_BASE}/v1/invitations`, (route) =>
      route.fulfill({ json: [] }),
    );
    await page.route(`${API_BASE}/v1/invitations/blocklist`, (route) =>
      route.fulfill({ json: [] }),
    );
    await page.route(`${API_BASE}/**`, (route) =>
      route.fulfill({ status: 204 }),
    );

    await page.goto('/settings');

    await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible();
  });
});
