import { IonicVue } from '@ionic/vue';
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import { createApp } from 'vue';

import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

import App from './App.vue';
import router from './router';
import { dexiePersister } from './lib/queryPersister';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

persistQueryClient({
  queryClient,
  persister: dexiePersister,
});

const app = createApp(App);

app
  .use(IonicVue)
  .use(VueQueryPlugin, { queryClient })
  .use(router);

router.isReady().then(() => {
  app.mount('#app');
});
