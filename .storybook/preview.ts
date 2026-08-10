import type { Preview } from '@storybook/vue3-vite';
import { setup } from '@storybook/vue3';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';

import { handlers } from '../src/mocks/handlers';
import { router } from './router';

initialize();

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
  },
};

export default preview;
