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
  IonButton,
  IonButtons,
  IonBackButton,
} from '@ionic/vue';
import { ref } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import PathFormFields from '~/src/components/PathFormFields.vue';
import { useCreatePath } from '~/src/generated/apiClient';
import { useApi } from '~/src/composables/useApi';

const router = useRouter();
const route = useRoute();
const queryClient = useQueryClient();

const { mutateAsync: doCreatePath } = useCreatePath();
const { enqueue } = useApi();

const {

const form = ref({
  title: '',
  description: '',
  color: '#3949ab',
});

const creating = ref(false);

async function create() {
  if (!form.value.title.trim() || creating.value) return;
  creating.value = true;

  const title = form.value.title.trim();
  const description = form.value.description.trim() || undefined;
  const color = form.value.color;

  enqueue({
    id: `create-path:${title}`,
    label: `Create path "${title}"`,
    execute: async () => {
      await doCreatePath({ data: { title, description, color } });
      void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });

      const redirect = route.query.redirect;
      if (redirect && typeof redirect === 'string') {
        void router.replace(redirect);
      } else {
        void router.replace('/');
      }
    },
  });

  // Unblock the button optimistically — the queue shows progress.
  creating.value = false;
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
