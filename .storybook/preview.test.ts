/**
 * Regression test for the GitHub Pages deploy: msw-storybook-addon's
 * initialize() defaults to an absolute service-worker URL
 * ('/mockServiceWorker.js'), which 404s once Storybook is served from a
 * subpath (e.g. https://mjaquiery.github.io/paths-frontend/). That 404 makes
 * MSW fail to register, which crashes every story render.
 */
import { describe, it, expect, vi } from 'vitest';

const initialize = vi.fn();

vi.mock('msw-storybook-addon', () => ({
  initialize,
  mswLoader: vi.fn(),
}));

describe('.storybook/preview', () => {
  it('initializes MSW with a relative service-worker URL', async () => {
    await import('./preview');

    expect(initialize).toHaveBeenCalledTimes(1);
    const [options] = initialize.mock.calls[0] as [
      { serviceWorker?: { url?: string } },
    ];
    expect(options.serviceWorker?.url).toMatch(/^\.\//);
  });
});
