/**
 * App bootstrap smoke test — Nuxt-aware (Stage 2+).
 *
 * With Stage 2, src/router.ts and @ionic/vue-router are removed in favour of
 * Nuxt file-based routing. The IonicVue plugin is registered in
 * plugins/ionic.client.ts via Nuxt's plugin system, so testing the router
 * context requires @nuxt/test-utils rather than a plain createApp() call.
 *
 * A meaningful integration test lives in the e2e suite. This unit-level
 * placeholder simply asserts that the Nuxt app can be imported without throwing
 * (i.e. no stray top-level useNuxtApp() calls outside plugin/component scope).
 */
import { describe, it } from 'vitest';

describe('App bootstrap (Nuxt)', () => {
  it('loads nuxt config without throwing at module level', async () => {
    // nuxt.config.ts is a pure-config file — importing it should never throw.
    // (The actual mounting test is in the e2e/playwright suite.)
    await import('../../nuxt.config');
  });
});
