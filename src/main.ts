import { IonicVue } from '@ionic/vue';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import { createApp } from 'vue';

import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/palettes/dark.class.css';
import './assets/theme.css';
import './assets/design-f.css';

import App from './App.vue';
import router from './router';
import { dexiePersister } from './lib/queryPersister';
import { ApiError } from './lib/customFetch';
import { useDarkMode } from './composables/useDarkMode';
import { registerServiceWorkerUpdates } from './composables/useServiceWorkerUpdate';

// Boot the service worker immediately. registerType: 'prompt' means updates download in the
// background but wait for the user to confirm (surfaced via AppFooter) before activating.
registerServiceWorkerUpdates();

// Initialise dark mode before mounting to prevent flash of wrong theme
useDarkMode();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
      // An expired/invalid session isn't going to fix itself on retry — fail fast so
      // the 401 handling (clearSession + redirect) surfaces immediately instead of
      // after 3 retries with backoff.
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status === 401) &&
        failureCount < 3,
    },
  },
});

persistQueryClient({
  queryClient,
  persister: dexiePersister,
});

const app = createApp(App);

app.use(IonicVue).use(VueQueryPlugin, { queryClient }).use(router);

router.isReady().then(() => {
  app.mount('#app');
});
