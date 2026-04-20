import { defineConfig, devices } from 'playwright/test';

/**
 * Playwright configuration for end-to-end tests.
 *
 * Tests run against the Nuxt dev server (port 3000).  Backend API calls to
 * http://localhost:8080 are intercepted by page.route() in each test file —
 * no real backend is required.
 *
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './playwright-test/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    /** Reuse a running dev server in local development; always start fresh on CI */
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
