<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Paths</ion-title>
        <ion-buttons slot="end">
          <template v-if="currentUser">
            <ion-label class="ion-padding-end">{{
              currentUser.display_name || currentUser.user_id
            }}</ion-label>
            <ion-button @click="logout">Logout</ion-button>
          </template>
          <ion-button v-else :disabled="loggingIn" @click="loginWithGoogle">
            {{ loggingIn ? 'Redirecting...' : 'Login with Google' }}
          </ion-button>
          <ion-text
            v-if="loginError"
            color="danger"
            class="ion-padding-start"
            >{{ loginError }}</ion-text
          >
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <Suspense>
        <template #default>
          <PathBrowserCard
            :can-create-paths="!!currentUser"
            @path-selected="selectedPathId = $event"
            @paths-updated="paths = $event"
          />
        </template>
        <template #fallback><p>Loading Paths...</p></template>
      </Suspense>

      <Suspense>
        <template #default>
          <EntriesCard
            :path-id="selectedPathId"
            :can-create-entries="canCreateEntries"
          />
        </template>
        <template #fallback><p>Loading entries...</p></template>
      </Suspense>

      <Suspense>
        <template #default>
          <ExportCard :paths="paths" />
        </template>
        <template #fallback><p>Loading export panel...</p></template>
      </Suspense>
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
  IonButton,
  IonButtons,
  IonLabel,
  IonText,
} from '@ionic/vue';
import { ref, computed, onMounted } from 'vue';

import PathBrowserCard from '../components/PathBrowserCard.vue';
import EntriesCard from '../components/EntriesCard.vue';
import ExportCard from '../components/ExportCard.vue';
import type { PathResponse, OAuthCallbackResponse, OAuthLoginResponse } from '../generated/types';
import { authLogin } from '../generated/apiClient';

const selectedPathId = ref('');
const paths = ref<PathResponse[]>([]);
const loggingIn = ref(false);
const loginError = ref('');
const currentUser = ref<OAuthCallbackResponse | null>(null);

const selectedPath = computed(() =>
  paths.value.find((p) => p.path_id === selectedPathId.value),
);

const canCreateEntries = computed(
  () =>
    !!currentUser.value &&
    !!selectedPath.value &&
    selectedPath.value.owner_user_id === currentUser.value.user_id,
);

onMounted(() => {
  const stored = localStorage.getItem('user');
  if (stored) {
    try {
      currentUser.value = JSON.parse(stored) as OAuthCallbackResponse;
    } catch {
      localStorage.removeItem('user');
    }
  }
});

async function loginWithGoogle() {
  loggingIn.value = true;
  loginError.value = '';
  try {
    const callbackUri = `${window.location.origin}/auth/callback`;
    const result = await authLogin({
      callback_uri: callbackUri,
    });
    const loginData = result.data as OAuthLoginResponse;
    if (loginData?.authorization_url) {
      window.location.href = loginData.authorization_url;
    } else {
      loginError.value = 'Could not start login. Please try again.';
      loggingIn.value = false;
    }
  } catch {
    loginError.value = 'Could not start login. Please try again.';
    loggingIn.value = false;
  }
}

function logout() {
  localStorage.removeItem('user');
  currentUser.value = null;
}
</script>
