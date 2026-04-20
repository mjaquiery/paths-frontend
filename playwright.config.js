"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var test_1 = require("playwright/test");
/**
 * Playwright configuration for end-to-end tests.
 *
 * Tests run against the Nuxt dev server (port 3000).  Backend API calls to
 * http://localhost:8080 are intercepted by page.route() in each test file —
 * no real backend is required.
 *
 * See https://playwright.dev/docs/test-configuration.
 */
exports.default = (0, test_1.defineConfig)({
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
            use: __assign({}, test_1.devices['Desktop Chrome']),
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        /** Reuse a running dev server in local development; always start fresh on CI */
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },
});
