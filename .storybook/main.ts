import path from 'node:path';

import type { StorybookConfig } from '@storybook/vue3-vite';
import vue from '@vitejs/plugin-vue';

const config: StorybookConfig = {
  framework: {
    name: '@storybook/vue3-vite',
    options: {
      docgen: false,
    },
  },
  stories: [
    '../src/**/*.stories.ts',
    '../pages/index.stories.ts',
    '../pages/paths/**/*.stories.ts',
    '../pages/path/**/*.stories.ts',
    '../pages/date/**/*.stories.ts',
    '../pages/entry/**/*.stories.ts',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    'msw-storybook-addon',
  ],
  viteFinal: async (config) => {
    config.plugins = [...(config.plugins ?? []), vue()];
    config.resolve ??= {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '~': path.resolve(__dirname, '..'),
      '@': path.resolve(__dirname, '..'),
    };

    return config;
  },
};

export default config;
