import { ref } from 'vue';
import { clearEtags } from './etagStore';

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
