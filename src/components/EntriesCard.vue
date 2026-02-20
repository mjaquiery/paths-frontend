<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Entries</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <p v-if="!pathId">Choose a Path to list entry metadata.</p>
      <ion-list v-else>
        <ion-item v-for="entry in entries" :key="entry.id">
          <ion-label>
            <h3>{{ entry.day }}</h3>
            <p>{{ entry.edit_id }}</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonList } from '@ionic/vue';
import { computed } from 'vue';

import { useEntries } from '../composables/useEntries';

const props = defineProps<{ pathId: string }>();

const { data: entries } = useEntries(computed(() => props.pathId));
</script>
