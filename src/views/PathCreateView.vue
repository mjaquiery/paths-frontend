<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>New Path</ion-title>
        <ion-buttons slot="end">
          <ion-button
            :disabled="!form.title.trim() || creating"
            @click="create"
          >
            {{ creating ? 'Creating…' : 'Create' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="path-create-content">
      <div class="path-create-form">
        <PathFormFields
          :title="form.title"
          :description="form.description"
          :color="form.color"
          color-input-id="path-colour-picker"
          :error-message="createError"
          @update:title="form.title = $event"
          @update:description="form.description = $event"
          @update:color="form.color = $event"
        />

        <ion-button
          expand="block"
          class="create-btn"
          :disabled="!form.title.trim() || creating"
          @click="create"
        >
          {{ creating ? 'Creating…' : 'Create Path' }}
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
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';
import PathFormFields from '../components/PathFormFields.vue';
import RefreshStatus from '../components/RefreshStatus.vue';
import { useCreatePath } from '../generated/apiClient';
import { useRefreshStatus } from '../composables/useRefreshStatus';
import { extractErrorMessage } from '../lib/errors';

const router = useRouter();
const route = useRoute();
const queryClient = useQueryClient();

const { mutateAsync: doCreatePath } = useCreatePath();

const {
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

const form = ref({
  title: '',
  description: '',
  color: '#3949ab',
});

const creating = ref(false);
const createError = ref('');

async function create() {
  if (!form.value.title.trim() || creating.value) return;
  creating.value = true;
  createError.value = '';
  try {
    await doCreatePath({
      data: {
        title: form.value.title.trim(),
        description: form.value.description.trim() || undefined,
        color: form.value.color,
      },
    });
    void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });

    // If a redirect URL was passed (e.g. from EntryCreateView), go there.
    // Otherwise return home.
    const redirect = route.query.redirect;
    if (redirect && typeof redirect === 'string') {
      void router.replace(redirect);
    } else {
      void router.replace('/');
    }
  } catch (err: unknown) {
    createError.value =
      extractErrorMessage(err) ?? 'Failed to create path. Please try again.';
    creating.value = false;
  }
}
</script>

<style scoped>
.path-create-content {
  --padding-top: 20px;
  --padding-bottom: 32px;
  --padding-start: 16px;
  --padding-end: 16px;
}

.path-create-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 560px;
  margin: 0 auto;
}

.create-btn {
  margin-top: 4px;
}
</style>
