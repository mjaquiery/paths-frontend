// @ionic/vue-router (not plain vue-router) to match src/router.ts: App.vue's
// <ion-router-outlet> expects the Ionic-flavoured router (it calls methods
// like getCurrentRouteInfo() that a bare vue-router instance doesn't have).
import { createRouter, createMemoryHistory } from '@ionic/vue-router';

// Page stories mount the route component directly rather than through
// <router-view>, so these routes only need to exist so useRoute()/useRouter()
// resolve real params — their `component` is never actually rendered.
const stub = { template: '<div />' };

export const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: stub },
    { path: '/entry/new', component: stub },
    { path: '/entry/:pathId/:entryId', component: stub },
    { path: '/entry/:pathId/:entryId/edit', component: stub },
    { path: '/settings', component: stub },
  ],
});
