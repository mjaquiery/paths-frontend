import type { Preview } from '@storybook/vue3-vite';
import { initialize, mswLoader } from 'msw-storybook-addon';

import { generatedHandlers } from '../src/generated/mswHandlers';

initialize();

const preview: Preview = {
  loaders: [mswLoader],
  parameters: {
    msw: {
      handlers: generatedHandlers
    }
  }
};

export default preview;
