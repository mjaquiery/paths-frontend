import type { Preview } from '@storybook/vue3-vite';
import { setup } from '@storybook/vue3';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import { IonicVue } from '@ionic/vue';

import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/palettes/dark.class.css';
import '../src/assets/theme.css';
import '../src/assets/design-f.css';

import { handlers } from '../src/mocks/handlers';
import { router, resetRouteLoader, setNavAlertSuppressed } from './router';

initialize();

// Mirrors useDarkMode's logic: toggles the same class/attribute the real app uses.
function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.classList.toggle('ion-palette-dark', theme === 'dark');
  document.documentElement.setAttribute('data-theme', theme);
}

setup((app) => {
  app.use(IonicVue);
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
  // resetRouteLoader() must run before mswLoader/any story-level loader —
  // applyLoaders() awaits project loaders, then component, then story
  // loaders, each group fully before the next, so putting the reset here
  // (rather than in beforeEach, which runs after all loaders) guarantees a
  // story's own routeLoader(path) wins instead of getting clobbered.
  loaders: [resetRouteLoader(), mswLoader],
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
  // Nav-alert mute is switched on by resetRouteLoader() above (before mount);
  // switch it off after play finishes, so a human clicking around after play
  // has ended still gets the alert.
  experimental_afterEach: async () => {
    setNavAlertSuppressed(false);
  },
  decorators: [
    (story, context) => {
      applyTheme(context.globals.theme === 'dark' ? 'dark' : 'light');
      return story();
    },
  ],
};

export default preview;
