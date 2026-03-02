<template>
  <ion-modal :is-open="isOpen" @didDismiss="onDismiss">
    <ion-header>
      <ion-toolbar>
        <ion-title>Delete Path</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="onDismiss">Cancel</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="delete-warning">
        <p class="delete-warning-title">⚠️ This action cannot be undone</p>
        <p>
          Deleting <strong>{{ path.title }}</strong> will permanently and
          irrecoverably destroy
          <strong>all associated entries and images</strong>.
        </p>
        <p>To confirm, type the full path name below:</p>
      </div>
      <ion-item>
        <ion-label position="stacked">Path name</ion-label>
        <ion-input
          v-model="confirmation"
          :placeholder="path.title"
          autocomplete="off"
        />
      </ion-item>
      <p v-if="errorMessage" class="delete-error">{{ errorMessage }}</p>
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <div class="delete-actions">
          <ion-button
            expand="block"
            color="danger"
            :disabled="confirmation !== path.title || deleting"
            @click="confirmDelete"
          >
            {{ deleting ? 'Deleting…' : 'Delete Path' }}
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
import { useQueryClient } from '@tanstack/vue-query';

import type { PathResponse } from '../generated/types';
import { useDeletePath } from '../generated/apiClient';

const props = defineProps<{
  isOpen: boolean;
  path: PathResponse;
}>();

const emit = defineEmits<{
  dismiss: [];
  deleted: [];
}>();

const queryClient = useQueryClient();
const { mutateAsync: doDeletePath } = useDeletePath();

const confirmation = ref('');
const deleting = ref(false);
const errorMessage = ref('');

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      confirmation.value = '';
      errorMessage.value = '';
    }
  },
);

async function confirmDelete() {
  if (confirmation.value !== props.path.title) return;
  deleting.value = true;
  errorMessage.value = '';
  try {
    await doDeletePath({ pathCode: props.path.path_id });
    void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
    emit('deleted');
    emit('dismiss');
  } catch {
    errorMessage.value = 'Failed to delete path. Please try again.';
  } finally {
    deleting.value = false;
  }
}

function onDismiss() {
  emit('dismiss');
}
</script>

<style scoped>
.delete-warning {
  background: var(--ion-color-danger-tint, #ffe0e0);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.delete-warning-title {
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--ion-color-danger-shade, #c41a1a);
}

.delete-error {
  color: var(--ion-color-danger, red);
  font-size: 0.875rem;
  margin-top: 8px;
}

.delete-actions {
  padding: 8px;
}
</style>
