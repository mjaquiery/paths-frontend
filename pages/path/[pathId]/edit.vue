<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/path/${pathId}`" />
        </ion-buttons>
        <ion-title>Edit Path</ion-title>
        <ion-buttons slot="end">
          <ion-button :disabled="!form.title.trim() || saving" @click="save">
            {{ saving ? 'Saving…' : 'Save' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="path-edit-content">
      <AppErrorBanner v-if="errorMessage" :message="errorMessage" />

      <div v-if="!path && !pathsError" class="path-edit-loading">
        <AppSpinner label="Loading path…" />
      </div>

      <div v-else-if="pathsError" class="path-edit-error">
        <AppErrorBanner :message="pathsErrorMsg" />
      </div>

      <div v-else-if="path" class="path-edit-form">
        <PathFormFields
          :title="form.title"
          :description="form.description"
          :color="form.color"
          color-input-id="path-edit-colour-picker"
          :error-message="errorMessage"
          @update:title="form.title = $event"
          @update:description="form.description = $event"
          @update:color="form.color = $event"
        />

        <ion-button
          expand="block"
          class="save-btn"
          :disabled="!form.title.trim() || saving"
          @click="save"
        >
          {{ saving ? 'Saving…' : 'Save changes' }}
        </ion-button>
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
  IonButton,
  IonButtons,
  IonBackButton,
} from '@ionic/vue';
import { ref, computed, watch } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';

import AppErrorBanner from '~/src/components/AppErrorBanner.vue';
import AppSpinner from '~/src/components/AppSpinner.vue';
import PathFormFields from '~/src/components/PathFormFields.vue';
import RefreshStatus from '~/src/components/RefreshStatus.vue';

import { usePaths } from '~/src/composables/usePaths';
import { useRefreshStatus } from '~/src/composables/useRefreshStatus';
import { useApi } from '~/src/composables/useApi';
import { extractErrorMessage } from '~/src/lib/errors';
import { useUpdatePath } from '~/src/generated/apiClient';

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();

const pathId = computed(() => String(route.params.pathId));

const { data: paths, error: pathsError } = usePaths();
const path = computed(
  () => (paths.value ?? []).find((p) => p.path_id === pathId.value) ?? null,
);
const pathsErrorMsg = computed(
  () => extractErrorMessage(pathsError.value) ?? 'Unable to load this path.',
);

const {
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

const { mutateAsync: doUpdatePath } = useUpdatePath();
const { enqueue } = useApi();

const form = ref({
  title: '',
  description: '',
  color: '#3949ab',
});

const errorMessage = ref('');
const saving = ref(false);

// Populate form when path data arrives
watch(
  path,
  (p) => {
    if (p) {
      form.value.title = p.title ?? '';
      form.value.description = p.description ?? '';
      form.value.color = p.color ?? '#3949ab';
    }
  },
  { immediate: true },
);

function save() {
  if (!form.value.title.trim() || saving.value) return;
  errorMessage.value = '';
  saving.value = true;

  const title = form.value.title.trim();
  const description = form.value.description.trim() || null;
  const color = form.value.color;

  enqueue({
    id: `update-path:${pathId.value}`,
    label: `Update path "${title}"`,
    execute: async () => {
      try {
        await doUpdatePath({
          pathCode: pathId.value,
          data: { title, description, color },
        });
        void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
        void router.replace(`/path/${pathId.value}`);
      } catch (e) {
        errorMessage.value =
          extractErrorMessage(e) ?? 'Failed to save changes.';
      } finally {
        saving.value = false;
      }
    },
  });

  // Unblock optimistically
  saving.value = false;
}
</script>

<style scoped>
.path-edit-content {
  --background: var(--color-paper);
  --padding-top: 20px;
  --padding-bottom: 32px;
  --padding-start: var(--page-margin);
  --padding-end: var(--page-margin);
}

.path-edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 560px;
  margin: 0 auto;
}

.path-edit-loading,
.path-edit-error {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}

.save-btn {
  margin-top: 4px;
}
</style>
