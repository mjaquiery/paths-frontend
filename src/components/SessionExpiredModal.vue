<template>
  <ion-modal
    :is-open="isOpen"
    :backdrop-dismiss="false"
    aria-label="Session expired"
    @didDismiss="onDismiss"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Session expired</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p>
        Your session has expired. Log back in and you'll be brought right back
        to where you were.
      </p>
      <p v-if="loginError" class="login-error">{{ loginError }}</p>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <div class="actions">
          <button
            class="google-btn"
            :disabled="loggingIn"
            @click="loginWithGoogle"
          >
            {{ loggingIn ? 'Redirecting…' : 'Continue with Google' }}
          </button>
          <ion-button fill="clear" @click="onDismiss">Not now</ion-button>
        </div>
      </ion-toolbar>
    </ion-footer>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
  IonButton,
} from '@ionic/vue';

import { useGoogleLogin } from '../composables/useGoogleLogin';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  dismiss: [];
}>();

const { loggingIn, loginError, loginWithGoogle } = useGoogleLogin();

function onDismiss() {
  emit('dismiss');
}
</script>

<style scoped>
.actions {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.google-btn {
  width: 100%;
  background: var(--color-ink);
  color: var(--color-paper);
  border: none;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.9rem;
  cursor: pointer;
}

.google-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.login-error {
  color: var(--ion-color-danger);
  font-size: 0.85rem;
}
</style>
