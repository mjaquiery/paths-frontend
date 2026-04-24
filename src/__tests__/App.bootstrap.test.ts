import { describe, it, vi } from 'vitest';

describe('App bootstrap (Nuxt)', () => {
  it('loads nuxt config without throwing at module level', async () => {
    // nuxt.config.ts uses defineNuxtConfig which is auto-imported by Nuxt's
    // build system but is not available in the plain Vitest/jsdom environment.
    // Stub it as a transparent identity function so the import doesn't throw.
    vi.stubGlobal('defineNuxtConfig', (config: unknown) => config);
    try {
      await import('../../nuxt.config');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
