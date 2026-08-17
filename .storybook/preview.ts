import type { Preview } from '@storybook/vue3-vite';
import { setup } from '@storybook/vue3';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import { IonicVue } from '@ionic/vue';
import { MINIMAL_VIEWPORTS } from 'storybook/viewport';

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

// Default worker URL is absolute ('/mockServiceWorker.js'), which 404s once
// Storybook is served from a subpath (e.g. the GitHub Pages deploy at
// /paths-frontend/). A relative URL resolves against iframe.html's own
// directory instead, so it works both at the root and under a subpath.
initialize({ serviceWorker: { url: './mockServiceWorker.js' } });

// Mirrors useDarkMode's logic: toggles the same class/attribute the real app uses.
function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.classList.toggle(
    'ion-palette-dark',
    theme === 'dark',
  );
  document.documentElement.setAttribute('data-theme', theme);
}

setup((app) => {
  // Ionic overlays (modal/toast/alert/...) animate their enter/exit transition via
  // rAF, and Chromium throttles rAF heavily on backgrounded/non-focused tabs — which
  // is exactly what test-storybook's headless pages are. That let a real transition
  // take several real-world seconds to finish, so a11y scans kept catching text at a
  // partway (blended, low-contrast) opacity no matter how long postVisit waited.
  // Disabling animation is Ionic's own supported switch for this, not a workaround.
  app.use(IonicVue, { animated: false });
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
      options: MINIMAL_VIEWPORTS,
    },
    // Default is 'todo' (report-only) — the custom axe scan in test-runner.ts
    // already fails CI on violations, but that scan runs post-play against the
    // whole document; this addon's own per-story check runs its own pass too,
    // and was silently non-blocking. Promote it to a real gate.
    a11y: {
      test: 'error',
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
    // VITE_TEST_STORYBOOK_THEME lets the test-runner CI matrix boot Storybook
    // straight into dark mode, so axe scans dark-mode contrast/color rules too —
    // the toolbar toggle only flips theme after a story's already mounted in light.
    theme:
      import.meta.env.VITE_TEST_STORYBOOK_THEME === 'dark' ? 'dark' : 'light',
    viewport: { value: 'mobile1' },
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
