import { createRouter, createWebHistory } from '@ionic/vue-router';

import HomeView from './views/HomeView.vue';
import OAuthCallback from './views/OAuthCallback.vue';
import ExportView from './views/ExportView.vue';
import DeleteView from './views/DeleteView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView },
    { path: '/auth/callback', component: OAuthCallback },
    { path: '/export', component: ExportView },
    { path: '/delete', component: DeleteView },
  ],
});

export default router;
