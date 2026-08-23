import { ref } from 'vue';
import { clearEtags } from './etagStore';
import type { OAuthCallbackResponse } from '../generated/types';

function loadStoredUser(): OAuthCallbackResponse | null {
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try {
    return JSON.parse(stored) as OAuthCallbackResponse;
  } catch {
    return null;
  }
}

/**
 * The signed-in user, shared by every page instead of each one doing its own
 * one-shot localStorage read in onMounted. That per-page read only ever ran
 * once: Ionic's ion-router-outlet keeps previously-visited pages mounted
 * (not destroyed) when navigating away, so a page revisited after logout
 * kept showing its stale logged-in read. A single reactive ref updates every
 * consumer immediately, regardless of which pages Ionic happens to be
 * keeping alive.
 */
export const currentUser = ref<OAuthCallbackResponse | null>(loadStoredUser());

export function setCurrentUser(user: OAuthCallbackResponse): void {
  localStorage.setItem('user', JSON.stringify(user));
  currentUser.value = user;
}

/**
 * Flips true when a request comes back 401 — the session is invalid or expired.
 * App.vue watches this to show a toast and send the user back to the logged-out
 * view, then resets it. A plain module-level ref rather than a composable: customFetch
 * is a standalone function with no component/setup context to call a composable from.
 */
export const sessionExpired = ref(false);

export function clearSession(): void {
  localStorage.removeItem('user');
  localStorage.removeItem('session_token');
  sessionExpired.value = true;
  // Fire-and-forget: a cached response body must never survive to the next
  // account that signs in on this browser.
  void clearEtags();
}

/**
 * A deliberate, user-initiated logout (the Settings "Logout" button) — unlike
 * clearSession() above, this fully clears currentUser so every page reflects
 * the logged-out state immediately, since the user explicitly asked to leave
 * their account rather than having their session merely expire mid-task.
 */
export function logout(): void {
  localStorage.removeItem('user');
  localStorage.removeItem('session_token');
  currentUser.value = null;
  void clearEtags();
}

const RETURN_PATH_KEY = 'post_login_redirect';

/**
 * Stash the route to come back to once login finishes. Login is a full-page
 * redirect out to Google and back (see auth.callback.vue), so this can't
 * live in memory — sessionStorage survives that round trip while staying
 * scoped to this tab.
 */
export function setReturnPath(path: string): void {
  sessionStorage.setItem(RETURN_PATH_KEY, path);
}

/** Read and clear the stashed return path, defaulting to home if none was set. */
export function consumeReturnPath(): string {
  const path = sessionStorage.getItem(RETURN_PATH_KEY);
  sessionStorage.removeItem(RETURN_PATH_KEY);
  return path || '/';
}
