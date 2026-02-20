<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Export</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <ion-list>
        <ion-item v-for="path in paths" :key="`export-${path.path_id}`">
          <ion-checkbox slot="start" :checked="selectedForExport.has(path.path_id)" @ionChange="setExportPath(path.path_id, $event)"></ion-checkbox>
          <ion-label>{{ path.title }}</ion-label>
        </ion-item>
      </ion-list>
      <ion-button @click="triggerExport" :disabled="selectedForExport.size === 0">Trigger export</ion-button>
      <ion-button fill="outline" @click="pollExport" :disabled="!exportJob">Poll status</ion-button>
      <p v-if="exportJob">Status: <strong>{{ exportJob.state }}</strong></p>
      <p v-if="exportJob?.state === 'expired'">Export has expired. Trigger a new one.</p>
      <div v-if="jsonDownloadUrl || imagesDownloadUrl">
        <ion-button v-if="jsonDownloadUrl" :href="jsonDownloadUrl" target="_blank">Download JSON</ion-button>
        <ion-button v-if="imagesDownloadUrl" :href="imagesDownloadUrl" target="_blank">Download images</ion-button>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCheckbox, IonItem, IonLabel, IonList, type CheckboxCustomEvent } from '@ionic/vue';
import { ref } from 'vue';

import type { ExportJobResponse, PathResponse } from '../generated/types';
import { api } from '../lib/api';
import { isExportReady, isExportTerminal } from '../utils/export';

defineProps<{ paths: PathResponse[] }>();

const selectedForExport = ref(new Set<string>());
const exportJob = ref<ExportJobResponse | null>(null);
const jsonDownloadUrl = ref('');
const imagesDownloadUrl = ref('');

function setExportPath(pathId: string, event: CheckboxCustomEvent) {
  if (event.detail.checked) selectedForExport.value.add(pathId);
  else selectedForExport.value.delete(pathId);
}

async function triggerExport() {
  jsonDownloadUrl.value = '';
  imagesDownloadUrl.value = '';
  exportJob.value = await api.create_export_v1_exports_post({ path_ids: [...selectedForExport.value] });
  await pollExport();
}

async function pollExport() {
  if (!exportJob.value) return;
  const latest = await api.get_export_v1_exports__export_id__get({ export_id: exportJob.value.id });
  exportJob.value = latest;
  if (isExportReady(latest)) {
    const [jsonUrl, imagesUrl] = await Promise.all([
      api.download_json_v1_exports__export_id__download_json_get({ export_id: latest.id }),
      api.download_images_v1_exports__export_id__download_images_get({ export_id: latest.id })
    ]);
    jsonDownloadUrl.value = jsonUrl.url;
    imagesDownloadUrl.value = imagesUrl.url;
  } else if (!isExportTerminal(latest)) {
    window.setTimeout(pollExport, 2000);
  }
}
</script>
