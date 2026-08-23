import { IonApp } from '@ionic/vue';

import { router } from './router';
import { db } from '../src/lib/db';
import { setCurrentUser, logout } from '../src/lib/authSession';
import AppFooter from '../src/components/AppFooter.vue';

interface StoryUser {
  token: string;
  user_id: string;
  display_name: string;
}

const DEFAULT_USER: StoryUser = {
  token: 'tok',
  user_id: 'user-1',
  display_name: 'Alex M.',
};

/**
 * Decorator: seeds localStorage as if `user` had already logged in. Goes
 * through setCurrentUser() rather than writing localStorage directly — pages
 * read the shared `currentUser` ref from lib/authSession.ts (populated once
 * at module load), not localStorage on every render, so a later story
 * reaching around it would never be seen.
 */
export function withLoggedInUser(user: StoryUser = DEFAULT_USER) {
  return (story: () => unknown) => ({
    components: { story },
    setup() {
      setCurrentUser(user);
    },
    template: '<story />',
  });
}

/**
 * Decorator: wraps a page story in the same <ion-app> + <AppFooter> shell
 * that App.vue renders around every route, so a Pages/* story looks like the
 * real app (persistent footer, safe-area/Ionic sizing) instead of a bare
 * page floating in the canvas. Mirrors App.vue's #ion-view-container-root
 * wrapper too, so overlay-driven aria-hiding of AppFooter behaves the same
 * in Storybook as it does in production (see App.vue for why that's needed).
 */
export function withAppShell() {
  return (story: () => unknown) => ({
    components: { story, IonApp, AppFooter },
    template:
      '<ion-app><div id="ion-view-container-root" style="display: contents"><story /><AppFooter /></div></ion-app>',
  });
}

/** Decorator: clears any logged-in user, mirroring the real logout(). */
export function withLoggedOut() {
  return (story: () => unknown) => ({
    components: { story },
    setup() {
      logout();
    },
    template: '<story />',
  });
}

/**
 * Loader: navigates the shared story router to `path` before the story
 * renders, so page components calling useRoute() see real params. The router
 * is a singleton (registered once in preview.ts), so this must run in every
 * page story that depends on route params — last write wins between stories.
 */
export function routeLoader(path: string) {
  return async () => {
    await router.push(path);
    return {};
  };
}

/**
 * Loader: wipes useLocalDraft's autosave table before the story renders.
 * It persists to real IndexedDB in a browser test run, so a story that types
 * into an entry editor would otherwise leak its draft into any later story
 * reusing the same pathId/entryId.
 */
export function clearLocalDraftsLoader() {
  return async () => {
    await db.localDrafts.clear();
    return {};
  };
}
