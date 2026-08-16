import { ref } from 'vue';
import { useRoute } from 'vue-router';

import type { OAuthLoginResponse } from '../generated/types';
import { authLogin } from '../generated/apiClient';
import { describeError } from '../lib/errors';
import { setReturnPath } from '../lib/authSession';

/**
 * Kicks off the Google OAuth redirect, stashing the current route first so
 * auth.callback.vue can send the user back to it once login completes —
 * shared by the logged-out home page and the session-expired modal, since
 * both can trigger this same full-page redirect from wherever the user was.
 */
export function useGoogleLogin() {
  const loggingIn = ref(false);
  const loginError = ref('');
  const route = useRoute();

  async function loginWithGoogle() {
    loggingIn.value = true;
    loginError.value = '';
    try {
      setReturnPath(route.fullPath);
      const callbackUri = `${window.location.origin}/auth/callback`;
      const result = await authLogin({ callback_uri: callbackUri });
      const loginData = result.data as OAuthLoginResponse;
      if (loginData?.authorization_url) {
        window.location.href = loginData.authorization_url;
      } else {
        loginError.value = 'Unable to sign in: no authorization URL returned';
        loggingIn.value = false;
      }
    } catch (err: unknown) {
      loginError.value = describeError('sign in', err);
      loggingIn.value = false;
    }
  }

  return { loggingIn, loginError, loginWithGoogle };
}
