import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  // VitePWA is needed so `virtual:pwa-register` (used by useServiceWorkerUpdate,
  // pulled in via AppFooter) resolves when Storybook stories render App.vue.
  plugins: [vue(), VitePWA({ injectRegister: null })],
  test: {
    environment: 'jsdom',
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          exclude: ['**/node_modules/**', '**/*.stories.*'],
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: '.storybook' })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
