import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
  framework: '@storybook/vue3-vite',
  stories: ['../src/**/*.stories.ts'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    'msw-storybook-addon',
    'storybook/viewport',
  ],
  // Storybook's vite builder auto-merges the app's root vite.config.ts, which pulls in
  // vite-plugin-pwa. Service-worker/precache generation has no meaning for the Storybook
  // build and fails it outright once iframe.js crosses the default 2 MiB precache limit —
  // drop the plugin here instead of raising that limit.
  async viteFinal(viteConfig) {
    // VitePWA() returns an array of plugins nested inside the top-level plugins array
    // (not a single Plugin), so this has to recurse rather than filter one level.
    const dropPwaPlugins = (plugins) =>
      plugins
        ?.map((plugin) =>
          Array.isArray(plugin) ? dropPwaPlugins(plugin) : plugin,
        )
        .filter((plugin) => {
          const name =
            plugin && !Array.isArray(plugin) && 'name' in plugin
              ? plugin.name
              : '';
          return !name?.startsWith('vite-plugin-pwa');
        });
    viteConfig.plugins = dropPwaPlugins(viteConfig.plugins);
    // useServiceWorkerUpdate.ts statically imports 'virtual:pwa-register', which only
    // resolves via the plugin just dropped above. Stub it — Storybook never calls
    // registerServiceWorkerUpdates(), it just needs the module to bundle.
    viteConfig.plugins.push({
      name: 'stub-pwa-register',
      resolveId: (id) => (id === 'virtual:pwa-register' ? id : undefined),
      load: (id) =>
        id === 'virtual:pwa-register'
          ? 'export function registerSW() { return () => Promise.resolve(); }'
          : undefined,
    });
    return viteConfig;
  },
};

export default config;
