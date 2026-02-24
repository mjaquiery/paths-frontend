<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('dismiss')">
    <ion-header>
      <ion-toolbar>
        <ion-title>New Entry</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('dismiss')">Cancel</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <!-- Path selection -->
      <ion-item>
        <ion-label position="stacked">Path *</ion-label>
        <ion-select
          v-model="selectedPathId"
          placeholder="Select a path"
          interface="action-sheet"
        >
          <ion-select-option
            v-for="path in ownedPaths"
            :key="path.path_id"
            :value="path.path_id"
          >
            {{ path.title }}
          </ion-select-option>
        </ion-select>
      </ion-item>

      <!-- Day selection -->
      <ion-item>
        <ion-label position="stacked">Day *</ion-label>
        <ion-input v-model="day" type="date" />
      </ion-item>

      <!-- Text content -->
      <ion-item>
        <ion-label position="stacked">Content *</ion-label>
        <ion-textarea
          v-model="content"
          placeholder="Write your entry…"
          :rows="6"
          auto-grow
        />
      </ion-item>

      <p v-if="error" class="entry-error">{{ error }}</p>

      <div class="entry-modal-actions">
        <ion-button
          expand="block"
          :disabled="!selectedPathId || !day || !content || saving"
          @click="submit"
        >
          {{ saving ? 'Saving…' : 'Create Entry' }}
        </ion-button>
      </div>
    </ion-content>
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
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
} from '@ionic/vue';
import { computed, ref, watch } from 'vue';

import type { PathResponse } from '../generated/types';
import { useCreateEntry } from '../generated/apiClient';

const props = defineProps<{
  isOpen: boolean;
  /** All visible paths the user owns */
  paths: PathResponse[];
  currentUserId: string;
  /** Pre-select a specific day (YYYY-MM-DD) */
  initialDay?: string;
  /** Pre-select a specific path id */
  initialPathId?: string;
}>();

const emit = defineEmits<{
  dismiss: [];
  created: [];
}>();

const { mutateAsync: createEntry, isPending: saving } = useCreateEntry();

const selectedPathId = ref('');
const day = ref('');
const content = ref('');
const error = ref('');

const ownedPaths = computed(() =>
  props.paths.filter((p) => p.owner_user_id === props.currentUserId),
);

// Reset form when modal opens
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      selectedPathId.value =
        props.initialPathId ?? ownedPaths.value[0]?.path_id ?? '';
      day.value = props.initialDay ?? new Date().toISOString().slice(0, 10);
      content.value = '';
      error.value = '';
    }
  },
);

async function submit() {
  if (!selectedPathId.value || !day.value || !content.value) return;
  error.value = '';
  try {
    await createEntry({
      pathCode: selectedPathId.value,
      data: { day: day.value, content: content.value },
    });
    emit('created');
    emit('dismiss');
  } catch (err: unknown) {
    const fallback = 'Failed to create entry. Please try again.';
    if (err && typeof err === 'object') {
      const e = err as Record<string, unknown>;
      const msg =
        (e?.response as Record<string, unknown> | undefined)?.data &&
        typeof (e.response as Record<string, unknown>).data === 'object'
          ? (
              (e.response as Record<string, unknown>).data as Record<
                string,
                unknown
              >
            )?.message
          : (e?.message as string | undefined);
      error.value = msg ? `Failed to create entry: ${String(msg)}` : fallback;
    } else {
      error.value = fallback;
    }
  }
}
</script>

<style scoped>
.entry-error {
  color: var(--ion-color-danger, red);
  font-size: 0.85rem;
  margin: 8px 16px;
}

.entry-modal-actions {
  margin: 16px 0;
}
</style>
