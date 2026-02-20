<template>
  <ion-app>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title>Paths</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <Suspense>
          <template #default>
            <PathBrowserCard
              @path-selected="selectedPathId = $event"
              @paths-updated="paths = $event"
            />
          </template>
          <template #fallback><p>Loading Paths...</p></template>
        </Suspense>

        <Suspense>
          <template #default>
            <EntriesCard :path-id="selectedPathId" />
          </template>
          <template #fallback><p>Loading entries...</p></template>
        </Suspense>

        <Suspense>
          <template #default>
            <ExportCard :paths="paths" />
          </template>
          <template #fallback><p>Loading export panel...</p></template>
        </Suspense>
      </ion-content>
    </ion-page>
  </ion-app>
</template>

<script setup lang="ts">
import {
  IonApp,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { ref } from 'vue';

import PathBrowserCard from './components/PathBrowserCard.vue';
import EntriesCard from './components/EntriesCard.vue';
import ExportCard from './components/ExportCard.vue';
import type { PathResponse } from './generated/types';

const selectedPathId = ref('');
const paths = ref<PathResponse[]>([]);
</script>
