import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  test: {
    environment: 'jsdom',
    exclude: ['**/node_modules/**', 'playwright-test/**'],
  },
});
