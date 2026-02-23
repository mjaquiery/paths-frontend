<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Logging in...</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p v-if="error" color="danger">{{ error }}</p>
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
} from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { oauthCallbackV1AuthCallbackPost } from '../generated/apiClient';

const router = useRouter();
const route = useRoute();
const error = ref('');

onMounted(async () => {
  const code = route.query.code as string;
  const state = route.query.state as string;

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
      localStorage.setItem('user', JSON.stringify(result.data));
    }
  } catch {
    error.value = 'Login failed. Please try again.';
  } finally {
    router.push('/');
  }
});
</script>
