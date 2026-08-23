<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Logging in...</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-text v-if="error" color="danger">{{ error }}</ion-text>
      <p v-else>Completing login, please wait...</p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
} from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { useAuthCallback } from '../generated/apiClient';
import type { OAuthCallbackResponse } from '../generated/types';
import { describeError } from '../lib/errors';
import { consumeReturnPath, setCurrentUser } from '../lib/authSession';

const router = useRouter();
const route = useRoute();
const error = ref('');
const { mutateAsync: doAuthCallback } = useAuthCallback();

onMounted(async () => {
  const rawCode = route.query.code;
  const rawState = route.query.state;

  const code = Array.isArray(rawCode) ? rawCode[0] : rawCode;
  const state = Array.isArray(rawState) ? rawState[0] : rawState;

  if (!code || !state) {
    error.value = 'Unable to complete login: missing code or state parameter';
    return;
  }

  const callbackUri = `${window.location.origin}/auth/callback`;

  try {
    const result = await doAuthCallback({
      data: { code, state, callback_uri: callbackUri },
    });
    if (result.data) {
      const { token, ...safeData } = result.data as OAuthCallbackResponse;
      localStorage.setItem('session_token', token);
      setCurrentUser(safeData as OAuthCallbackResponse);
    }
  } catch (err: unknown) {
    error.value = describeError('complete login', err);
  } finally {
    // replace, not push: this callback page's own history entry shouldn't
    // linger — the destination page should sit where the pre-login page
    // would have, not stack a redundant entry the user has to back past.
    router.replace(consumeReturnPath());
  }
});
</script>
