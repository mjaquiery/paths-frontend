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
      <ion-item>
        <ion-label position="stacked">Title *</ion-label>
        <ion-input
          v-model="form.title"
          placeholder="Path title"
          :maxlength="120"
        />
      </ion-item>
      <ion-item>
        <ion-label position="stacked">Description</ion-label>
        <ion-input
          v-model="form.description"
          placeholder="Optional description"
          :maxlength="1024"
        />
      </ion-item>
      <ion-item>
        <ion-label for="edit-path-colour-picker" position="stacked"
          >Colour</ion-label
        >
        <div class="colour-picker-row">
          <input
            id="edit-path-colour-picker"
            type="color"
            v-model="form.color"
            class="colour-picker-input"
          />
          <span class="colour-picker-hex">{{ form.color }}</span>
        </div>
      </ion-item>
      <p v-if="errorMessage" class="path-edit-error">{{ errorMessage }}</p>
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
  IonItem,
  IonLabel,
  IonInput,
} from '@ionic/vue';
import { ref, watch } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';

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
.colour-picker-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.colour-picker-input {
  width: 44px;
  height: 36px;
  border: 1px solid var(--ion-color-light-shade, #ccc);
  border-radius: 4px;
  cursor: pointer;
  padding: 2px;
  background: none;
}

.colour-picker-hex {
  font-size: 0.875rem;
  color: var(--ion-color-dark, #333);
  font-family: monospace;
}

.path-edit-error {
  color: var(--ion-color-danger, red);
  font-size: 0.875rem;
  margin-top: 8px;
}

.path-edit-actions {
  padding: 8px;
}
</style>
