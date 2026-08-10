import type { Preview } from '@storybook/vue3-vite';
import { setup } from '@storybook/vue3';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';

import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/palettes/dark.class.css';
import '../src/assets/theme.css';
import '../src/assets/design-f.css';

import { handlers } from '../src/mocks/handlers';
import { router } from './router';

initialize();

// Mirrors useDarkMode's logic: toggles the same class/attribute the real app uses.
function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.classList.toggle('ion-palette-dark', theme === 'dark');
  document.documentElement.setAttribute('data-theme', theme);
}

setup((app) => {
  app.use(VueQueryPlugin, {
    queryClient: new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    }),
  });
  app.use(router);
});

const preview: Preview = {
  loaders: [mswLoader],
  parameters: {
    msw: {
      handlers,
    },
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  globalTypes: {
    theme: {
      description: 'Light/dark theme',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    (story, context) => {
      applyTheme(context.globals.theme === 'dark' ? 'dark' : 'light');
      return story();
    },
  ],
};

export default preview;
