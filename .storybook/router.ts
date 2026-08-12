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
    { path: '/paths', component: stub },
    { path: '/entry/new', component: stub },
    { path: '/entry/:pathId/:entryId', component: stub },
    { path: '/entry/:pathId/:entryId/edit', component: stub },
    { path: '/settings', component: stub },
  ],
});

// The router is a module-level singleton shared across every story, so its
// route leaks from whichever story ran last. Storybook switching stories
// then looks like a navigation too. resetRouteLoader() (registered as a
// project-level loader in preview.ts) flags that one nav to skip the alert.
//
// This must be a loader, not a `beforeEach` — Storybook's runtime always
// finishes applyLoaders() (project loaders, then component, then story
// loaders, each group awaited before the next starts) before it calls
// applyBeforeEach(). A project-level `beforeEach` reset would run *after* a
// story's own `routeLoader(path)` (a story-level loader) and clobber the
// route it just set, right before the component mounts.
let resetting = false;

export function resetStoryRoute(path = '/') {
  resetting = true;
  return router.replace(path);
}

export function resetRouteLoader() {
  return async () => {
    setNavAlertSuppressed(true);
    await resetStoryRoute();
    return {};
  };
}

// addon-interactions auto-runs play() on every story view (any browser, not
// just headless test-runner), and a play() can navigate either directly or
// by simulating a click/keypress that a component handles itself. None of
// that is a human browsing, so preview.ts's beforeEach/afterEach hooks bracket
// the whole render+play window with this flag to mute the alert throughout.
let suppressed = false;

export function setNavAlertSuppressed(value: boolean) {
  suppressed = value;
}

// Stories can't actually land anywhere real (routes above are stubs), so a
// nav-triggering click just silently swaps in a blank div. Surface where it
// would have gone instead of leaving the click looking like a no-op.
router.beforeEach((to, from) => {
  if (resetting) {
    resetting = false;
    return;
  }
  if (suppressed) return;
  if (to.fullPath !== from.fullPath) {
    console.debug(`Would navigate to: ${to.fullPath}`);
  }
});
