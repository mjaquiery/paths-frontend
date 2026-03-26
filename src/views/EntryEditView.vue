<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/entry/${pathId}/${entryId}`" />
        </ion-buttons>
        <ion-title>Edit Entry</ion-title>
        <ion-buttons slot="end">
          <ion-button :disabled="saving || !canSave" @click="save">
            {{ saving ? 'Saving…' : 'Save' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="!entry" class="edit-loading">Loading entry…</div>
      <template v-else>
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
      </template>
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
  IonTextarea,
} from '@ionic/vue';
import { useRoute, useRouter } from '@ionic/vue-router';
import { computed, ref, watch } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { useMultiPathEntries } from '../composables/useMultiPathEntries';
import { useUpdateEntry } from '../generated/apiClient';
import MarkdownContent from '../components/MarkdownContent.vue';

const route = useRoute();
const router = useRouter();
const pathId = computed(() => String(route.params.pathId));
const entryId = computed(() => String(route.params.entryId));

const pathIdArr = computed(() => [pathId.value]);
const multiPathEntries = useMultiPathEntries(pathIdArr);
const entry = computed(() => {
  const pe = multiPathEntries.value.find((x) => x.pathId === pathId.value);
  return pe?.entries.find((e) => e.id === entryId.value) ?? null;
});

const content = ref('');
const contentTab = ref<'write' | 'preview'>('write');
const saving = ref(false);
const saveError = ref('');

watch(
  entry,
  (e) => {
    if (e && !content.value) content.value = e.content ?? '';
  },
  { immediate: true },
);

const canSave = computed(() => !!content.value.trim());

const queryClient = useQueryClient();
const { mutateAsync: updateEntry } = useUpdateEntry();

async function save() {
  if (!canSave.value || !entry.value) return;
  saving.value = true;
  saveError.value = '';
  try {
    await updateEntry({
      pathCode: pathId.value,
      entrySlug: entryId.value,
      data: {
        content: content.value,
        expected_edit_id: entry.value.edit_id ?? 0,
      },
    });
    void queryClient.invalidateQueries({
      queryKey: ['v1', 'paths', pathId.value, 'entries'],
    });
    router.back();
  } catch {
    saveError.value = 'Failed to save. Please try again.';
    saving.value = false;
  }
}
</script>

<style scoped>
.edit-loading {
  padding: 24px;
  text-align: center;
  color: var(--ion-color-medium);
}
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
