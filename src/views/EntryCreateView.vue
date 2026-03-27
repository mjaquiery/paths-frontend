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
    <ion-content class="entry-editor-content">
      <div class="entry-form">
        <ion-text v-if="pathsError" color="danger" class="view-error-banner">
          {{ pathsErrorMessage }}
        </ion-text>
        <ion-item class="entry-field">
          <ion-label position="stacked">Path *</ion-label>
          <ion-select
            v-model="selectedPathId"
            placeholder="Select a path"
            interface="action-sheet"
          >
            <ion-select-option v-if="ownedPaths.length === 0" disabled value=""
              >You don't own any paths yet.</ion-select-option
            >
            <ion-select-option
              v-for="p in ownedPaths"
              :key="p.path_id"
              :value="p.path_id"
              >{{ p.title }}</ion-select-option
            >
          </ion-select>
        </ion-item>

        <ion-item class="entry-field">
          <ion-label position="stacked">Day *</ion-label>
          <ion-note slot="helper">The date this entry is for</ion-note>
          <ion-input v-model="day" type="date" />
        </ion-item>

        <section class="editor-section">
          <div class="editor-header">
            <label class="editor-label">Content *</label>
            <div class="editor-header-controls">
              <template v-if="savedEntryId">
                <ImageUploadButton
                  :path-code="selectedPathId"
                  :entry-slug="savedEntryId"
                  @insert="insertImageMarkdown"
                />
              </template>
              <ion-button
                v-else
                size="small"
                fill="outline"
                :disabled="!canSave || saving"
                @click="saveForImageUpload"
              >
                {{ saving ? 'Saving…' : '+ Image' }}
              </ion-button>
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
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonTextarea,
  IonText,
  IonNote,
} from '@ionic/vue';
import RefreshStatus from '../components/RefreshStatus.vue';
import { useRefreshStatus } from '../composables/useRefreshStatus';
import { useRoute, useRouter } from 'vue-router';
import { computed, ref, watch, onMounted } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { usePaths } from '../composables/usePaths';
import { useCurrentUser } from '../composables/useCurrentUser';
import { useCreateEntry } from '../generated/apiClient';
import { extractErrorMessage } from '../lib/errors';
import { isPathHidden, getPathOrder } from '../lib/db';
import MarkdownContent from '../components/MarkdownContent.vue';
import ImageUploadButton from '../components/ImageUploadButton.vue';

const route = useRoute();
const router = useRouter();

const { data: paths, error: pathsError } = usePaths();
const { currentUserId } = useCurrentUser();
const ownedPaths = computed(() =>
  (paths.value ?? []).filter((p) => p.owner_user_id === currentUserId.value),
);
const pathsErrorMessage = computed(
  () => extractErrorMessage(pathsError.value) ?? 'Unable to load paths.',
);

const {
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

const day = ref(
  String(route.query.date ?? new Date().toISOString().slice(0, 10)),
);

// Auto-select: prefer path from route param, else highest-ranked visible owned
// path, else highest-ranked hidden owned path, else redirect to /paths/new.
const selectedPathId = ref(String(route.params.pathId ?? ''));

async function pickDefaultPath() {
  if (ownedPaths.value.length === 0) {
    // No owned paths — redirect to create one first
    const redirect = encodeURIComponent(`/entry/new?date=${day.value}`);
    await router.replace(`/paths/new?redirect=${redirect}`);
    return;
  }

  if (selectedPathId.value) return; // already set (from route param)

  const order = getPathOrder();
  const sorted = [...ownedPaths.value].sort((a, b) => {
    const ia = order.indexOf(a.path_id);
    const ib = order.indexOf(b.path_id);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  // First visible owned path
  for (const p of sorted) {
    if (!(await isPathHidden(p.path_id))) {
      selectedPathId.value = p.path_id;
      return;
    }
  }
  // Fall back to first hidden owned path
  selectedPathId.value = sorted[0].path_id;
}

onMounted(() => {
  if (ownedPaths.value.length > 0 || paths.value !== undefined) {
    void pickDefaultPath();
  }
});

watch(ownedPaths, (newVal, oldVal) => {
  // Run once paths data arrives from the server
  if (oldVal?.length === 0 && newVal.length > 0 && !selectedPathId.value) {
    void pickDefaultPath();
  } else if (newVal.length === 0 && paths.value !== undefined) {
    void pickDefaultPath();
  }
});
const content = ref('');
const contentTab = ref<'write' | 'preview'>('write');
const saving = ref(false);
const saveError = ref('');
// Set once the entry has been saved (we need it to upload images)
const savedEntryId = ref('');

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
    const result = await createEntry({
      pathCode: selectedPathId.value,
      data: { day: day.value, content: content.value },
    });
    void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
    savedEntryId.value = result.data.id;
    router.back();
  } catch (err: unknown) {
    saveError.value =
      extractErrorMessage(err) ?? 'Failed to save. Please try again.';
    saving.value = false;
  }
}

// Save the entry first (to get an ID), then surface it for image upload.
async function saveForImageUpload() {
  if (!canSave.value || saving.value || savedEntryId.value) return;
  saving.value = true;
  saveError.value = '';
  try {
    const result = await createEntry({
      pathCode: selectedPathId.value,
      data: { day: day.value, content: content.value },
    });
    void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
    savedEntryId.value = result.data.id;
  } catch (err: unknown) {
    saveError.value =
      extractErrorMessage(err) ?? 'Failed to save. Please try again.';
  } finally {
    saving.value = false;
  }
}

function insertImageMarkdown(markdown: string) {
  content.value = content.value ? content.value + '\n\n' + markdown : markdown;
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

.entry-field {
  --border-radius: 18px;
  --padding-start: 14px;
  --inner-padding-end: 14px;
  --min-height: 72px;
  border: 1px solid var(--ion-border-color);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.view-error-banner {
  display: block;
  margin: 0 4px;
  font-size: 0.9rem;
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.editor-header-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
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
