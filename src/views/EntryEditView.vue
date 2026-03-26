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
    <ion-content class="entry-editor-content">
      <div class="entry-form">
        <div v-if="!entry" class="edit-loading">Loading entry…</div>
        <template v-else>
          <section class="editor-section">
            <div class="editor-header">
              <label class="editor-label">Content *</label>
              <div class="content-tabs" role="tablist" aria-label="Editor mode">
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
            </div>
            <div class="editor-surface">
              <ion-textarea
                v-if="contentTab === 'write'"
                v-model="content"
                class="editor-textarea"
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
            </div>
          </section>
          <p v-if="saveError" class="save-error">{{ saveError }}</p>
        </template>
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
  IonTextarea,
} from '@ionic/vue';
import { useRoute, useRouter } from 'vue-router';
import { computed, ref, watch } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { useMultiPathEntries } from '../composables/useMultiPathEntries';
import { useUpdateEntry } from '../generated/apiClient';
import { extractErrorMessage } from '../lib/errors';
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
  } catch (err: unknown) {
    saveError.value =
      extractErrorMessage(err) ?? 'Failed to save. Please try again.';
    saving.value = false;
  }
}
</script>

<style scoped>
.entry-editor-content {
  --padding-top: 18px;
  --padding-bottom: 28px;
  --padding-start: 16px;
  --padding-end: 16px;
}

.entry-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 640px;
  margin: 0 auto;
}

.edit-loading {
  padding: 32px 20px;
  text-align: center;
  color: var(--ion-color-medium);
  border: 1px dashed var(--ion-border-color);
  border-radius: 18px;
}

.editor-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--ion-border-color);
  border-radius: 18px;
  background: var(--ion-item-background);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}

.editor-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.editor-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ion-text-color);
}

.content-tabs {
  display: flex;
  gap: 8px;
  width: auto;
}

.content-tab {
  min-width: 88px;
  padding: 8px 14px;
  border: 1px solid var(--ion-border-color);
  border-radius: 999px;
  background: var(--ion-background-color);
  color: var(--ion-text-color);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
}

.content-tab.active {
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  border-color: var(--ion-color-primary);
}

.editor-surface {
  border: 1px solid var(--ion-border-color);
  border-radius: 14px;
  overflow: hidden;
  background: var(--ion-background-color);
}

.editor-textarea {
  --padding-top: 14px;
  --padding-bottom: 14px;
  --padding-start: 14px;
  --padding-end: 14px;
  min-height: 250px;
}

.content-preview {
  min-height: 250px;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
}

.content-preview-empty {
  color: var(--ion-color-medium);
  font-style: italic;
  margin: 0;
}

.save-error {
  color: var(--ion-color-danger);
  font-size: 0.85rem;
  margin: 0 4px;
}
</style>
