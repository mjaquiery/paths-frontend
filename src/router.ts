import { createRouter, createWebHistory } from '@ionic/vue-router';

import HomeView from './views/HomeView.vue';
import OAuthCallback from './views/OAuthCallback.vue';
import ExportView from './views/ExportView.vue';
import DeleteView from './views/DeleteView.vue';
import InvitationsView from './views/InvitationsView.vue';
import DateView from './views/DateView.vue';
import PathView from './views/PathView.vue';
import PathCreateView from './views/PathCreateView.vue';
import EntryView from './views/EntryView.vue';
import EntryCreateView from './views/EntryCreateView.vue';
import EntryEditView from './views/EntryEditView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView },
    { path: '/auth/callback', component: OAuthCallback },
    { path: '/export', component: ExportView },
    { path: '/delete', component: DeleteView },
    { path: '/invitations', component: InvitationsView },
    { path: '/date/:date', component: DateView },
    { path: '/path/:pathId', component: PathView },
    { path: '/paths/new', component: PathCreateView },
    { path: '/entry/:pathId/new', component: EntryCreateView },
    { path: '/entry/:pathId/:entryId', component: EntryView },
    { path: '/entry/:pathId/:entryId/edit', component: EntryEditView },
  ],
});

export default router;
