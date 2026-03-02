<template>
  <ion-modal :is-open="isOpen" @didDismiss="onDismiss">
    <ion-header>
      <ion-toolbar>
        <ion-title>Share "{{ path.title }}"</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="onDismiss">Close</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p class="share-description">
        Enter the Google Account email address of the person you want to share
        this path with. They will receive an invitation they can accept or
        ignore.
      </p>
      <ion-item>
        <ion-label position="stacked">Email address *</ion-label>
        <ion-input
          v-model="email"
          type="email"
          placeholder="example@gmail.com"
          autocomplete="email"
          @keyup.enter="invite"
        />
      </ion-item>
      <p v-if="errorMessage" class="share-error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="share-success">{{ successMessage }}</p>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <div class="share-actions">
          <ion-button
            expand="block"
            :disabled="!email.trim() || inviting"
            @click="invite"
          >
            {{ inviting ? 'Sending…' : 'Send Invitation' }}
          </ion-button>
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
  IonButtons,
  IonButton,
  IonContent,
  IonFooter,
  IonItem,
  IonLabel,
  IonInput,
} from '@ionic/vue';
import { ref, watch } from 'vue';

import type { PathResponse } from '../generated/types';
import { useInviteSubscriber } from '../generated/apiClient';
import { extractErrorMessage } from '../lib/errors';

const props = defineProps<{
  isOpen: boolean;
  path: PathResponse;
}>();

const emit = defineEmits<{
  dismiss: [];
}>();

const { mutateAsync: doInvite } = useInviteSubscriber();

const email = ref('');
const inviting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      email.value = '';
      errorMessage.value = '';
      successMessage.value = '';
    }
  },
);

async function invite() {
  if (!email.value.trim()) return;
  inviting.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    await doInvite({
      pathCode: props.path.path_id,
      data: { email: email.value.trim() },
    });
    successMessage.value = `Invitation sent to ${email.value.trim()}.`;
    email.value = '';
  } catch (err: unknown) {
    const detail = extractErrorMessage(err);
    errorMessage.value = detail
      ? `Failed to send invitation: ${detail}`
      : 'Failed to send invitation. Please try again.';
  } finally {
    inviting.value = false;
  }
}

function onDismiss() {
  emit('dismiss');
}
</script>

<style scoped>
.share-description {
  font-size: 0.9rem;
  color: var(--ion-color-medium, #666);
  margin-bottom: 16px;
}

.share-error {
  color: var(--ion-color-danger, red);
  font-size: 0.875rem;
  margin-top: 8px;
}

.share-success {
  color: var(--ion-color-success, green);
  font-size: 0.875rem;
  margin-top: 8px;
}

.share-actions {
  padding: 8px;
}
</style>
