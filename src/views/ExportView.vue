<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>Export data</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <Suspense>
        <template #default>
          <ExportCard :paths="paths ?? []" />
        </template>
        <template #fallback><p>Loading…</p></template>
      </Suspense>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
} from '@ionic/vue';

import ExportCard from '../components/ExportCard.vue';
import { usePaths } from '../composables/usePaths';

const { data: paths } = usePaths();
</script>
