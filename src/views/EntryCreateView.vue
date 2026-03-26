<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>New Entry</ion-title>
        <ion-buttons slot="end">
          <ion-button :disabled="saving || !canSave" @click="save">
            {{ saving ? 'Saving…' : 'Save' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <!-- Path selection -->
      <ion-item>
        <ion-label position="stacked">Path *</ion-label>
        <ion-select
          v-model="selectedPathId"
          placeholder="Select a path"
          interface="action-sheet"
        >
          <ion-select-option
            v-for="p in ownedPaths"
            :key="p.path_id"
            :value="p.path_id"
            >{{ p.title }}</ion-select-option
          >
        </ion-select>
      </ion-item>

      <!-- Day -->
      <ion-item>
        <ion-label position="stacked">Day *</ion-label>
        <ion-input v-model="day" type="date" />
      </ion-item>

      <!-- Content with write/preview tabs -->
      <ion-item>
        <ion-label position="stacked">Content *</ion-label>
        <div class="content-tabs">
          <button
            class="content-tab"
            :class="{ active: contentTab === 'write' }"
            type="button"
            @click="contentTab = 'write'"
          >
            Write
          </button>
          <button
            class="content-tab"
            :class="{ active: contentTab === 'preview' }"
            type="button"
            @click="contentTab = 'preview'"
          >
            Preview
          </button>
        </div>
        <ion-textarea
          v-if="contentTab === 'write'"
          v-model="content"
          placeholder="Write your entry… (markdown supported)"
          :rows="8"
          auto-grow
          autocapitalize="sentences"
          autocorrect="on"
          spellcheck="true"
        />
        <div v-else class="content-preview">
          <MarkdownContent v-if="content" :content="content" />
          <p v-else class="content-preview-empty">(nothing to preview)</p>
        </div>
      </ion-item>

      <p v-if="saveError" class="save-error">{{ saveError }}</p>
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
  IonSelect,
  IonSelectOption,
  IonInput,
  IonTextarea,
} from '@ionic/vue';
import { useRoute, useRouter } from '@ionic/vue-router';
import { computed, ref } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { usePaths } from '../composables/usePaths';
import { useCreateEntry } from '../generated/apiClient';
import MarkdownContent from '../components/MarkdownContent.vue';

const route = useRoute();
const router = useRouter();

const { data: paths } = usePaths();
const storedUser = localStorage.getItem('user');
const currentUserId = storedUser
  ? (JSON.parse(storedUser) as { user_id: string }).user_id
  : '';
const ownedPaths = computed(() =>
  (paths.value ?? []).filter((p) => p.owner_user_id === currentUserId),
);

const selectedPathId = ref(String(route.params.pathId ?? ''));
const day = ref(
  String(route.query.date ?? new Date().toISOString().slice(0, 10)),
);
const content = ref('');
const contentTab = ref<'write' | 'preview'>('write');
const saving = ref(false);
const saveError = ref('');

const canSave = computed(
  () => !!selectedPathId.value && !!day.value && !!content.value.trim(),
);

const queryClient = useQueryClient();
const { mutateAsync: createEntry } = useCreateEntry();

async function save() {
  if (!canSave.value) return;
  saving.value = true;
  saveError.value = '';
  try {
    await createEntry({
      pathCode: selectedPathId.value,
      data: { day: day.value, content: content.value },
    });
    void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
    router.back();
  } catch {
    saveError.value = 'Failed to save. Please try again.';
    saving.value = false;
  }
}
</script>

<style scoped>
.content-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
  width: 100%;
}
.content-tab {
  flex: 1;
  padding: 4px 12px;
  border: 1px solid var(--ion-border-color);
  border-radius: 4px;
  background: transparent;
  color: var(--ion-text-color);
  cursor: pointer;
  font-size: 0.85rem;
}
.content-tab.active {
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  border-color: var(--ion-color-primary);
}
.content-preview {
  min-height: 120px;
  padding: 8px;
  width: 100%;
}
.content-preview-empty {
  color: var(--ion-color-medium);
  font-style: italic;
}
.save-error {
  color: var(--ion-color-danger);
  font-size: 0.85rem;
  margin-top: 8px;
}
</style>
