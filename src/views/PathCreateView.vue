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
        <ion-item class="form-field">
          <ion-label position="stacked">Title *</ion-label>
          <ion-input
            v-model="form.title"
            placeholder="Give your path a name"
            maxlength="120"
            autocapitalize="words"
          />
        </ion-item>

        <ion-item class="form-field">
          <ion-label position="stacked">Description</ion-label>
          <ion-input
            v-model="form.description"
            placeholder="Optional — what is this path for?"
            maxlength="1024"
          />
        </ion-item>

        <ion-item class="form-field">
          <ion-label for="path-colour-picker" position="stacked"
            >Colour</ion-label
          >
          <div class="colour-row">
            <input
              id="path-colour-picker"
              v-model="form.color"
              type="color"
              class="colour-input"
            />
            <span class="colour-hex">{{ form.color }}</span>
          </div>
        </ion-item>

        <p v-if="createError" class="create-error">{{ createError }}</p>

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
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonInput,
} from '@ionic/vue';
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';
import { useCreatePath } from '../generated/apiClient';
import { extractErrorMessage } from '../lib/errors';

const router = useRouter();
const route = useRoute();
const queryClient = useQueryClient();

const { mutateAsync: doCreatePath } = useCreatePath();

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

.form-field {
  --border-radius: 14px;
  --padding-start: 14px;
  --inner-padding-end: 14px;
  --min-height: 68px;
  border: 1px solid var(--ion-border-color);
  border-radius: 14px;
  overflow: hidden;
}

.colour-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.colour-input {
  width: 40px;
  height: 32px;
  border: 1px solid var(--ion-border-color);
  border-radius: 6px;
  padding: 2px;
  cursor: pointer;
  background: none;
}

.colour-hex {
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  font-family: monospace;
}

.create-error {
  color: var(--ion-color-danger);
  font-size: 0.85rem;
  margin: 0;
}

.create-btn {
  margin-top: 4px;
}
</style>
