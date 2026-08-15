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
    // Known upstream Vite/Storybook dep-optimizer race under CI's resource
    // constraints (vitest-dev/vitest#9509, #5477, #5680): the optimizer
    // discovers a new dependency mid-run and invalidates in-flight dynamic
    // import fetches from the "storybook" project's browser tests. The
    // stories involved still pass their assertions — only the async
    // rejection is spurious — so don't fail the whole run over it.
    onUnhandledError: (error) => {
      if (
        /Failed to fetch dynamically imported module/.test(
          (error as Error)?.message ?? '',
        )
      ) {
        return false;
      }
    },
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
          // GitHub's standard runners (4 vCPU/16GB, further shared with the
          // playwright container) can't handle full browser-mode file
          // parallelism across 30+ story files — concurrent dynamic imports
          // against the shared Vite server race and intermittently fail
          // ("Failed to fetch dynamically imported module"). Serialize file
          // execution in CI only; local runs keep full parallelism.
          fileParallelism: !process.env.CI,
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
