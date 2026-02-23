<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Entries</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <p v-if="!pathId">Choose a Path to list entry metadata.</p>
      <template v-else>
        <ion-button
          v-if="canCreateEntries"
          size="small"
          @click="showCreateForm = !showCreateForm"
          >New Entry</ion-button
        >
        <ion-card v-if="showCreateForm">
          <ion-card-content>
            <ion-item>
              <ion-label position="stacked">Day *</ion-label>
              <ion-input v-model="newEntry.day" type="date" />
            </ion-item>
            <ion-item>
              <ion-label position="stacked">Content *</ion-label>
              <ion-textarea
                v-model="newEntry.content"
                placeholder="Entry content"
                :rows="4"
              />
            </ion-item>
            <ion-button
              size="small"
              :disabled="!newEntry.day || !newEntry.content || creating"
              @click="createEntry"
              >{{ creating ? 'Creating...' : 'Create' }}</ion-button
            >
            <ion-button size="small" fill="outline" @click="cancelCreate"
              >Cancel</ion-button
            >
            <p v-if="createError" style="color: red">{{ createError }}</p>
          </ion-card-content>
        </ion-card>
        <ion-list>
          <ion-item v-for="entry in entries" :key="entry.id">
            <ion-label>
              <h3>{{ entry.day }}</h3>
              <p>{{ entry.edit_id }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </template>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTextarea,
} from '@ionic/vue';
import { computed, ref } from 'vue';

import { useCreateEntry } from '../generated/apiClient';
import { useEntries } from '../composables/useEntries';

const props = withDefaults(
  defineProps<{
    pathId: string;
    canCreateEntries?: boolean;
  }>(),
  { canCreateEntries: false },
);

const { data: entries, refetch } = useEntries(computed(() => props.pathId));
const { mutateAsync: createEntryMutation, isPending: creating } = useCreateEntry();

const showCreateForm = ref(false);
const createError = ref('');
const newEntry = ref({ day: '', content: '' });

async function createEntry() {
  if (!newEntry.value.day || !newEntry.value.content) return;
  createError.value = '';
  try {
    await createEntryMutation({
      pathCode: props.pathId,
      data: {
        day: newEntry.value.day,
        content: newEntry.value.content,
      },
    });
    cancelCreate();
    await refetch();
  } catch {
    createError.value = 'Failed to create entry. Please try again.';
  }
}

function cancelCreate() {
  showCreateForm.value = false;
  newEntry.value = { day: '', content: '' };
  createError.value = '';
}
</script>
