import { createRouter, createWebHistory } from '@ionic/vue-router';

import HomeView from './views/HomeView.vue';
import OAuthCallback from './views/OAuthCallback.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView },
    { path: '/auth/callback', component: OAuthCallback },
  ],
});

export default router;
