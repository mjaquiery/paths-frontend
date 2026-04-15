import {
  QueryClient,
  VueQueryPlugin,
  type VueQueryPluginOptions,
} from '@tanstack/vue-query';
import { persistQueryClient } from '@tanstack/query-persist-client-core';
import { dexiePersister } from '~/src/lib/queryPersister';

export default defineNuxtPlugin((nuxtApp) => {
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

  const options: VueQueryPluginOptions = { queryClient };
  nuxtApp.vueApp.use(VueQueryPlugin, options);
});
