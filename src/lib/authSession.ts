import { ref } from 'vue';

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
}
