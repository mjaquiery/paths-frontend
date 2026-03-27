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
    <ion-content class="export-content">
      <div class="view-shell">
        <ion-text v-if="pathsError" color="danger" class="view-error-banner">
          {{ pathsErrorMessage }}
        </ion-text>
        <Suspense>
          <template #default>
            <ExportCard :paths="paths ?? []" />
          </template>
          <template #fallback><p>Loading…</p></template>
        </Suspense>
      </div>
    </ion-content>
    <ion-footer>
      <RefreshStatus
        :status-type="refreshStatusType"
        :status-text="refreshStatusText"
        :last-checked-at="refreshLastCheckedAt"
      />
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
  IonButtons,
  IonBackButton,
  IonText,
} from '@ionic/vue';

import ExportCard from '../components/ExportCard.vue';
import RefreshStatus from '../components/RefreshStatus.vue';
import { usePaths } from '../composables/usePaths';
import { useRefreshStatus } from '../composables/useRefreshStatus';
import { extractErrorMessage } from '../lib/errors';
import { computed } from 'vue';

const { data: paths, error: pathsError } = usePaths();
const pathsErrorMessage = computed(
  () =>
    extractErrorMessage(pathsError.value) ?? 'Unable to load paths right now.',
);

const {
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();
</script>

<style scoped>
.export-content {
  --padding-top: 18px;
  --padding-bottom: 28px;
  --padding-start: 16px;
  --padding-end: 16px;
}

.view-shell {
  max-width: 640px;
  margin: 0 auto;
}

.view-error-banner {
  display: block;
  margin-bottom: 16px;
  font-size: 0.9rem;
}
</style>
