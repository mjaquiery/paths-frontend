import { defineVitestConfig } from '@nuxt/test-utils/config';

export default defineVitestConfig({
  test: {
    environment: 'jsdom',
    exclude: [
      '**/node_modules/**',
      'playwright-test/**',
      // TODO(stage-2): Deferred — imports router.ts → HomeView.vue → Nuxt virtual
      // modules (virtual:public/paths.mjs) which call useNuxtApp() at module
      // evaluation time.  The @ionic/vue-router dependency and src/router.ts are
      // removed in Stage 2 in favour of Nuxt file-based routing, at which point
      // this test should be replaced with a Nuxt-aware routing test.
      'src/__tests__/App.bootstrap.test.ts',
    ],
  },
});
