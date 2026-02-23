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

import { oauthCallbackV1AuthCallbackPost } from '../generated/apiClient';
import type { OAuthCallbackResponse } from '../generated/types';

const router = useRouter();
const route = useRoute();
const error = ref('');

onMounted(async () => {
  const rawCode = route.query.code;
  const rawState = route.query.state;

  const code = Array.isArray(rawCode) ? rawCode[0] : rawCode;
  const state = Array.isArray(rawState) ? rawState[0] : rawState;

  if (!code || !state) {
    error.value = 'Missing code or state parameter.';
    return;
  }

  const callbackUri = `${window.location.origin}/auth/callback`;

  try {
    const result = await oauthCallbackV1AuthCallbackPost({
      code,
      state,
      callback_uri: callbackUri,
    });
    if (result.data) {
      const { token: _token, ...safeData } =
        result.data as OAuthCallbackResponse;
      localStorage.setItem('user', JSON.stringify(safeData));
    }
  } catch {
    error.value = 'Login failed. Please try again.';
  } finally {
    router.push('/');
  }
});
</script>
