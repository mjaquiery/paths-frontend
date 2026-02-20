import type { Preview } from '@storybook/vue3-vite';
import { initialize, mswLoader } from 'msw-storybook-addon';

import { getPathsBackendAPIMock } from '../src/generated/apiClient';

initialize();

const preview: Preview = {
  loaders: [mswLoader],
  parameters: {
    msw: {
      handlers: getPathsBackendAPIMock(),
    },
  },
};

export default preview;
