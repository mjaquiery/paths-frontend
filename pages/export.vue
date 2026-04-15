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
        <p v-if="paths !== undefined && paths.length === 0" class="empty-msg">
          You don't have any paths to export yet.
        </p>
        <Suspense>
          <template #default>
            <ExportCard v-if="(paths ?? []).length > 0" :paths="paths ?? []" />
          </template>
          <template #fallback>
            <div class="loading-fallback">
              <ion-spinner name="crescent" />
            </div>
          </template>
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
definePageMeta({
  pageTransition: { name: 'ion-forward', mode: 'out-in' },
});
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
  IonSpinner,
} from '@ionic/vue';

import ExportCard from '~/src/components/ExportCard.vue';
import RefreshStatus from '~/src/components/RefreshStatus.vue';
import { usePaths } from '~/src/composables/usePaths';
import { useRefreshStatus } from '~/src/composables/useRefreshStatus';
import { extractErrorMessage } from '~/src/lib/errors';
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

.empty-msg {
  color: var(--ion-color-medium);
  font-size: 0.95rem;
  margin: 0 0 16px;
}

.loading-fallback {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}
</style>
