<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Admin Login</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding admin-login-content">
      <div class="admin-login-form">
        <h2 class="admin-login-heading">Admin Access</h2>

        <AppErrorBanner v-if="errorMessage" :message="errorMessage" />

        <ion-list lines="full">
          <ion-item>
            <ion-label position="stacked">Username</ion-label>
            <ion-input
              v-model="username"
              type="text"
              autocomplete="username"
              placeholder="Enter admin username"
              :disabled="isPending"
              @keydown.enter="submit"
            />
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Password</ion-label>
            <ion-input
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="Enter admin password"
              :disabled="isPending"
              @keydown.enter="submit"
            />
          </ion-item>
        </ion-list>

        <ion-button
          expand="block"
          class="admin-login-btn"
          :disabled="isPending || !username || !password"
          @click="submit"
        >
          {{ isPending ? 'Logging in…' : 'Log in' }}
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
definePageMeta({
  pageTransition: { name: 'ion-forward', mode: 'out-in' },
});

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
} from '@ionic/vue';
import { ref } from 'vue';
import AppErrorBanner from '~/src/components/AppErrorBanner.vue';
import { adminLogin } from '~/src/generated/apiClient';
import { useAdminAuth } from '~/src/composables/useAdminAuth';

const router = useRouter();
const { storeToken, isAdminLoggedIn } = useAdminAuth();

if (isAdminLoggedIn.value) {
  await navigateTo('/admin', { replace: true });
}

const username = ref('');
const password = ref('');
const isPending = ref(false);
const errorMessage = ref('');

async function submit() {
  if (!username.value || !password.value || isPending.value) return;

  isPending.value = true;
  errorMessage.value = '';

  try {
    const response = await adminLogin({
      username: username.value,
      password: password.value,
    });

    if (response.status === 200) {
      storeToken(response.data.token);
      await navigateTo('/admin', { replace: true });
    } else {
      errorMessage.value = 'Login failed. Please check your credentials.';
    }
  } catch {
    errorMessage.value = 'Login failed. Please check your credentials.';
  } finally {
    isPending.value = false;
  }
}
</script>

<style scoped>
.admin-login-content {
  --background: var(--ion-background-color);
}

.admin-login-form {
  max-width: 400px;
  margin: 40px auto 0;
}

.admin-login-heading {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--ion-text-color);
}

.admin-login-btn {
  margin-top: 20px;
}
</style>
