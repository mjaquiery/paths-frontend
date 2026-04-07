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
import { useApi } from '../composables/useApi';

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
const { enqueue } = useApi();

const form = ref({ title: '', description: '', color: '' });
const saving = ref(false);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      form.value = {
        title: props.path.title,
        description: props.path.description ?? '',
        color: props.path.color,
      };
    }
  },
);

async function save() {
  if (!form.value.title.trim()) return;
  saving.value = true;

  const title = form.value.title.trim();
  const description = form.value.description.trim() || null;
  const color = form.value.color;
  const pathCode = props.path.path_id;

  enqueue({
    id: `update-path:${pathCode}`,
    label: `Update path "${title}"`,
    execute: async () => {
      const result = await doUpdatePath({
        pathCode,
        data: { title, description, color },
      });
      void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
      if (result.status === 200) {
        emit('updated', result.data as PathResponse);
      }
      emit('dismiss');
    },
  });

  // Close modal optimistically — queue shows progress / errors.
  saving.value = false;
  emit('dismiss');
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
