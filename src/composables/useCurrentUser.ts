import { ref, computed } from 'vue';
import type { OAuthCallbackResponse } from '../generated/types';

/**
 * Reactive wrapper around the `user` key in localStorage.
 *
 * Returns a reactive `currentUser` ref and a derived `currentUserId` string.
 * The ref is populated once at setup time; call `refresh()` to re-read
 * (e.g. after login / logout side-effects in another component).
 *
 * Note: full cross-tab reactivity would require a StorageEvent listener,
 * which can be added here if needed in future.
 */
function readStoredUser(): OAuthCallbackResponse | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw) as OAuthCallbackResponse;
  } catch {
    return null;
  }
}

export function useCurrentUser() {
  const currentUser = ref<OAuthCallbackResponse | null>(readStoredUser());

  const currentUserId = computed(() => currentUser.value?.user_id ?? '');

  function refresh() {
    currentUser.value = readStoredUser();
  }

  return { currentUser, currentUserId, refresh };
}
