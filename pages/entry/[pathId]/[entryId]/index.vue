<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button :default-href="`/path/${pathId}`" />
        </ion-buttons>
        <ion-title>
          <span v-if="path">
            <span
              class="entry-path-dot"
              :style="{ backgroundColor: path.color }"
            ></span>
            {{ path.title }}
          </span>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button
            v-if="canEdit"
            color="primary"
            :router-link="`/entry/${pathId}/${entryId}/edit`"
            router-direction="forward"
            >Edit</ion-button
          >
          <ion-button v-if="canEdit" color="danger" @click="confirmDelete"
            >Delete</ion-button
          >
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p v-if="deleteError" class="delete-error">{{ deleteError }}</p>
      <p class="entry-meta">
        {{
          entry?.day
            ? new Date(entry.day + 'T00:00:00').toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : ''
        }}
      </p>
      <div v-if="entry?.content === undefined" class="entry-loading">
        Loading…
      </div>
      <div v-else-if="!entry.content" class="entry-empty">(no text)</div>
      <MarkdownContent v-else :content="entry.content" :images="entry.images" />

      <!-- On this day from other years -->
      <div v-if="previousYears.length > 0" class="entry-on-this-day">
        <h3>✨ On this day (other years)</h3>
        <div
          v-for="ye in previousYears"
          :key="`${ye.entryId}-${ye.year}`"
          class="entry-prev-chip"
          role="button"
          tabindex="0"
          @click="router.push(`/entry/${pathId}/${ye.entryId}`)"
          @keydown.enter="router.push(`/entry/${pathId}/${ye.entryId}`)"
        >
          <span class="entry-prev-year">{{ ye.year }}</span>
          <span class="entry-prev-preview">{{
            ye.preview || '(no text)'
          }}</span>
        </div>
      </div>
    </ion-content>

    <ion-alert
      :is-open="showDeleteAlert"
      header="Delete Entry"
      :message="`Delete the entry for ${entry?.day ? new Date(entry.day + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}? This action cannot be undone.`"
      :buttons="deleteAlertButtons"
      @didDismiss="showDeleteAlert = false"
    />
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
  IonAlert,
} from '@ionic/vue';
import RefreshStatus from '../components/RefreshStatus.vue';
import { useRefreshStatus } from '../composables/useRefreshStatus';
import { computed, ref } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { usePaths } from '../composables/usePaths';
import { useMultiPathEntries } from '../composables/useMultiPathEntries';
import { useDeleteEntry } from '../generated/apiClient';
import { useCurrentUser } from '../composables/useCurrentUser';
import { db } from '../lib/db';
import MarkdownContent from '../components/MarkdownContent.vue';

const route = useRoute();
const router = useRouter();
const pathId = computed(() => String(route.params.pathId));
const entryId = computed(() => String(route.params.entryId));

const { data: paths } = usePaths();
const path = computed(
  () => (paths.value ?? []).find((p) => p.path_id === pathId.value) ?? null,
);

const { currentUserId } = useCurrentUser();
const canEdit = computed(
  () =>
    !!currentUserId.value && path.value?.owner_user_id === currentUserId.value,
);

const {
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

const pathIdArr = computed(() => (pathId.value ? [pathId.value] : []));
const multiPathEntries = useMultiPathEntries(pathIdArr);

const entry = computed(() => {
  const pe = multiPathEntries.value.find((x) => x.pathId === pathId.value);
  return pe?.entries.find((e) => e.id === entryId.value) ?? null;
});

const thisYear = computed(() => new Date().getFullYear());
const previousYears = computed(() => {
  if (!entry.value) return [];
  const monthDay = entry.value.day.slice(5);
  const pe = multiPathEntries.value.find((x) => x.pathId === pathId.value);
  return (pe?.entries ?? [])
    .filter(
      (e) =>
        e.day.slice(5) === monthDay &&
        Number(e.day.slice(0, 4)) < thisYear.value &&
        e.id !== entryId.value,
    )
    .map((e) => ({
      entryId: e.id,
      year: Number(e.day.slice(0, 4)),
      preview: e.content,
    }))
    .sort((a, b) => b.year - a.year);
});

const queryClient = useQueryClient();
const { mutateAsync: doDeleteEntry } = useDeleteEntry();
const showDeleteAlert = ref(false);
const deleteError = ref('');

const deleteAlertButtons = computed(() => [
  { text: 'Cancel', role: 'cancel' },
  {
    text: 'Delete',
    role: 'destructive',
    handler: () => {
      void performDelete();
    },
  },
]);

function confirmDelete() {
  showDeleteAlert.value = true;
}

async function performDelete() {
  if (!entry.value) return;
  deleteError.value = '';
  try {
    await doDeleteEntry({
      pathCode: pathId.value,
      entrySlug: entryId.value,
    });
    void queryClient.invalidateQueries({
      queryKey: ['v1', 'paths', pathId.value, 'entries'],
    });
    try {
      await db.entryContent.delete(`${pathId.value}:${entryId.value}`);
      await db.entryImages.where('entry_id').equals(entryId.value).delete();
    } catch {
      /* IndexedDB may be unavailable */
    }
    router.back();
  } catch (err: unknown) {
    deleteError.value =
      (err instanceof Error ? err.message : null) ?? 'Failed to delete entry.';
  }
}
</script>

<style scoped>
.entry-path-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}
.entry-meta {
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}
.entry-loading,
.entry-empty {
  color: var(--ion-color-medium);
  font-style: italic;
}
.entry-on-this-day {
  margin-top: 32px;
  border-top: 1px solid var(--ion-border-color);
  padding-top: 16px;
}
.entry-on-this-day h3 {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ion-color-medium);
  margin-bottom: 12px;
}
.entry-prev-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--ion-card-background);
  border-radius: var(--paths-border-radius);
  margin-bottom: 6px;
  cursor: pointer;
}
.entry-prev-chip:hover {
  background: var(--paths-card-hover);
}
.entry-prev-year {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--ion-color-primary);
  min-width: 40px;
}
.entry-prev-preview {
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.delete-error {
  color: var(--ion-color-danger);
  font-size: 0.85rem;
  margin-top: 8px;
}
</style>
