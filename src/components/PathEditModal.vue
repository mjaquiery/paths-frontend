<template>
  <ion-modal :is-open="isOpen" @didDismiss="onDismiss">
    <ion-header>
      <ion-toolbar>
        <ion-title>Edit Path</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="onDismiss">Cancel</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <PathFormFields
        :title="form.title"
        :description="form.description"
        :color="form.color"
        color-input-id="edit-path-colour-picker"
        :error-message="errorMessage"
        @update:title="form.title = $event"
        @update:description="form.description = $event"
        @update:color="form.color = $event"
      />
    </ion-content>
    <ion-footer>
      <ion-toolbar>
        <div class="path-edit-actions">
          <ion-button
            expand="block"
            :disabled="!form.title.trim() || saving"
            @click="save"
          >
            {{ saving ? 'Saving…' : 'Save' }}
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
} from '@ionic/vue';
import { ref, watch } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';

import PathFormFields from './PathFormFields.vue';
import type { PathResponse } from '../generated/types';
import { useUpdatePath } from '../generated/apiClient';

const props = defineProps<{
  isOpen: boolean;
  path: PathResponse;
}>();

const emit = defineEmits<{
  dismiss: [];
  updated: [path: PathResponse];
}>();

const queryClient = useQueryClient();
const { mutateAsync: doUpdatePath } = useUpdatePath();

const form = ref({ title: '', description: '', color: '' });
const saving = ref(false);
const errorMessage = ref('');

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      form.value = {
        title: props.path.title,
        description: props.path.description ?? '',
        color: props.path.color,
      };
      errorMessage.value = '';
    }
  },
);

async function save() {
  if (!form.value.title.trim()) return;
  saving.value = true;
  errorMessage.value = '';
  try {
    const result = await doUpdatePath({
      pathCode: props.path.path_id,
      data: {
        title: form.value.title.trim(),
        description: form.value.description.trim() || null,
        color: form.value.color,
      },
    });
    void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
    if (result.status === 200) {
      emit('updated', result.data as PathResponse);
    }
    emit('dismiss');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Request failed: 409')) {
      errorMessage.value =
        'A path with that name already exists. Please choose a different title.';
    } else {
      errorMessage.value = 'Failed to update path. Please try again.';
    }
  } finally {
    saving.value = false;
  }
}

function onDismiss() {
  emit('dismiss');
}
</script>

<style scoped>
.path-edit-actions {
  padding: 8px;
}
</style>
