import type { Preview } from '@storybook/vue3-vite';
import { initialize, mswLoader } from 'msw-storybook-addon';

import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/palettes/dark.class.css';
import '../src/assets/theme.css';

import {
  prepareStoryEnvironment,
  withStorybookChrome,
} from '../src/storybook/storySupport';

initialize({
  onUnhandledRequest(request, print) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/v1/')) {
      print.warning();
    }
    // Silently bypass all other requests (Vite module fetches, static assets, etc.)
  },
});

const preview: Preview = {
  globalTypes: {
    colorMode: {
      name: 'Color mode',
      description: 'Global color mode for the previewed app',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'system', title: 'System' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    colorMode: 'light',
  },
  decorators: [withStorybookChrome],
  loaders: [mswLoader, prepareStoryEnvironment],
  parameters: {
    layout: 'fullscreen',
    controls: {
      expanded: true,
    },
    msw: {
      handlers: [],
    },
  },
};

export default preview;
