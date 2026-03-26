<template>
  <ion-card class="export-card">
    <ion-card-header>
      <ion-card-title>Export</ion-card-title>
    </ion-card-header>
    <ion-card-content class="export-card__content">
      <div class="export-card__body">
        <div class="export-paths">
          <p class="export-hint">
            Choose the paths to include. Selected: {{ selectedForExport.size }}
          </p>
          <ion-list class="export-list">
            <ion-item v-for="path in paths" :key="`export-${path.path_id}`">
              <ion-checkbox
                slot="start"
                :checked="selectedForExport.has(path.path_id)"
                @ionChange="setExportPath(path.path_id, $event)"
              ></ion-checkbox>
              <ion-label>{{ path.title }}</ion-label>
            </ion-item>
          </ion-list>
        </div>

        <div class="export-actions">
          <div class="export-actions-row">
            <ion-button
              expand="block"
              @click="triggerExport"
              :disabled="selectedForExport.size === 0"
            >
              Trigger export
            </ion-button>
            <ion-button
              expand="block"
              fill="outline"
              @click="pollExport"
              :disabled="!exportJob"
            >
              Poll status
            </ion-button>
          </div>
          <p v-if="exportJob" class="export-status">
            Status: <strong>{{ exportJob.state }}</strong>
          </p>
          <p
            v-if="exportJob?.state === 'expired'"
            class="export-status export-status--warning"
          >
            Export has expired. Trigger a new one.
          </p>
          <p v-if="downloadError" class="export-status export-status--error">
            Download failed: {{ downloadError }}
          </p>
          <div
            v-if="jsonDownloadUrl || imagesDownloadUrl"
            class="export-actions-row export-actions-row--downloads"
          >
            <ion-button
              v-if="jsonDownloadUrl"
              expand="block"
              @click="handleDownload(jsonDownloadUrl, 'json')"
            >
              Download JSON
            </ion-button>
            <ion-button
              v-if="imagesDownloadUrl"
              expand="block"
              @click="handleDownload(imagesDownloadUrl, 'zip')"
            >
              Download images
            </ion-button>
          </div>
        </div>
      </div>
    </ion-card-content>
  </ion-card>

  <!-- Alert shown when remote export fails, offering to export local cache -->
  <ion-alert
    :is-open="showLocalExportAlert"
    header="Export unavailable"
    :message="localExportAlertMessage"
    :buttons="localExportAlertButtons"
    @didDismiss="showLocalExportAlert = false"
  />
</template>

<script setup lang="ts">
import {
  IonAlert,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCheckbox,
  IonItem,
  IonLabel,
  IonList,
  type CheckboxCustomEvent,
} from '@ionic/vue';
import { ref } from 'vue';

import type {
  ExportJobResponse,
  PathResponse,
  DownloadURLResponse,
} from '../generated/types';
import {
  useCreateExport,
  getExport,
  downloadExportJson,
  downloadExportImages,
} from '../generated/apiClient';
import {
  isExportReady,
  isExportTerminal,
  downloadFileFromUrl,
  exportLocalData,
} from '../utils/export';

defineProps<{ paths: PathResponse[] }>();

const selectedForExport = ref(new Set<string>());
const exportJob = ref<ExportJobResponse | null>(null);
const jsonDownloadUrl = ref('');
const imagesDownloadUrl = ref('');
const downloadError = ref('');
const showLocalExportAlert = ref(false);
const localExportAlertMessage = ref('');
const { mutateAsync: createExportMutation } = useCreateExport();

function todayYYYYMMDD(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

async function handleDownload(url: string, extension: string) {
  downloadError.value = '';
  try {
    await downloadFileFromUrl(
      url,
      `paths_backup_${todayYYYYMMDD()}.${extension}`,
    );
  } catch (e) {
    downloadError.value = e instanceof Error ? e.message : String(e);
  }
}

function setExportPath(pathId: string, event: CheckboxCustomEvent) {
  if (event.detail.checked) selectedForExport.value.add(pathId);
  else selectedForExport.value.delete(pathId);
}

async function triggerExport() {
  jsonDownloadUrl.value = '';
  imagesDownloadUrl.value = '';
  try {
    exportJob.value = (
      await createExportMutation({
        data: { path_ids: [...selectedForExport.value] },
      })
    ).data as ExportJobResponse;
    await pollExport();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    localExportAlertMessage.value = `Remote export failed: ${msg}. Would you like to export your locally cached data instead?`;
    showLocalExportAlert.value = true;
  }
}

async function pollExport() {
  if (!exportJob.value) return;
  const latest = (await getExport(exportJob.value.id))
    .data as ExportJobResponse;
  exportJob.value = latest;
  if (isExportReady(latest)) {
    const [jsonUrl, imagesUrl] = await Promise.all([
      downloadExportJson(latest.id),
      downloadExportImages(latest.id),
    ]);
    jsonDownloadUrl.value = (jsonUrl.data as DownloadURLResponse).url;
    imagesDownloadUrl.value = (imagesUrl.data as DownloadURLResponse).url;
  } else if (!isExportTerminal(latest)) {
    window.setTimeout(pollExport, 2000);
  }
}

async function handleLocalExport() {
  downloadError.value = '';
  try {
    await exportLocalData([...selectedForExport.value]);
  } catch (e) {
    downloadError.value = e instanceof Error ? e.message : String(e);
  }
}

const localExportAlertButtons = [
  { text: 'Export local data', handler: handleLocalExport },
  { text: 'Cancel', role: 'cancel' },
];
</script>

<style scoped>
.export-card {
  margin: 0;
  border-radius: 24px;
}

.export-card__content {
  padding-top: 0;
}

.export-card__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.export-paths {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.export-hint {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--ion-color-medium);
}

.export-list {
  max-height: min(48vh, 420px);
  overflow: auto;
  border: 1px solid var(--ion-border-color);
  border-radius: 18px;
  background: var(--ion-item-background);
  padding: 4px 0;
}

.export-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid var(--ion-border-color);
  background: var(--ion-card-background);
}

.export-actions-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.export-status {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--ion-text-color);
}

.export-status--warning {
  color: var(--ion-color-warning);
}

.export-status--error {
  color: var(--ion-color-danger);
}

@media (min-width: 540px) {
  .export-actions-row {
    flex-direction: row;
  }

  .export-actions-row ion-button {
    flex: 1 1 0;
  }
}
</style>
