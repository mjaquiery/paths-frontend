<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>{{ entryDay || 'Entry' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button
            v-if="canEdit"
            color="primary"
            aria-label="Edit entry"
            @click="goEdit"
          >
            Edit
          </ion-button>
          <ion-button
            v-if="canEdit"
            color="danger"
            aria-label="Delete entry"
            @click="confirmDelete"
          >
            Delete
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p class="entry-meta">
        <span
          class="entry-path-dot"
          :style="{ backgroundColor: path?.color }"
          aria-hidden="true"
        />
        {{ path?.title }} &mdash; {{ entryDay }}
      </p>
      <p v-if="deleteError" class="entry-error">{{ deleteError }}</p>
      <p v-if="content === undefined" class="entry-content">Fetching…</p>
      <p v-else-if="!content" class="entry-content">(no text)</p>
      <MarkdownContent v-else :content="content" :images="images" />
      <div v-if="unreferencedImages.length > 0" class="entry-images">
        <EntryImage
          v-for="img in unreferencedImages"
          :key="img.id"
          :image-id="img.id"
          :alt="img.filename"
        />
      </div>
    </ion-content>

    <ion-alert
      :is-open="showDeleteAlert"
      header="Delete Entry"
      :message="`Delete the entry for ${entryDay}? This action cannot be undone.`"
      :buttons="deleteAlertButtons"
      @didDismiss="showDeleteAlert = false"
    />
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonContent,
  IonAlert,
} from '@ionic/vue';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';

import {
  useGetEntry,
  useListEntryImages,
  useDeleteEntry,
} from '../generated/apiClient';
import { usePaths } from '../composables/usePaths';
import { extractErrorMessage } from '../lib/errors';
import MarkdownContent from '../components/MarkdownContent.vue';
import EntryImage from '../components/EntryImage.vue';
import { referencedImageFilenames } from '../utils/markdown';
import type {
  EntryContentResponse,
  ImageResponse,
  OAuthCallbackResponse,
} from '../generated/types';

const route = useRoute<'/entry.[pathId].[entryId]'>();
const router = useRouter();
const queryClient = useQueryClient();

const pathId = computed(() => route.params.pathId);
const entryId = computed(() => route.params.entryId);

const currentUser = ref<OAuthCallbackResponse | null>(null);
onMounted(() => {
  const stored = localStorage.getItem('user');
  if (stored) {
    try {
      currentUser.value = JSON.parse(stored) as OAuthCallbackResponse;
    } catch {
      currentUser.value = null;
    }
  }
});

const { data: allPaths } = usePaths();
const path = computed(() =>
  allPaths.value?.find((p) => p.path_id === pathId.value),
);
const canEdit = computed(
  () =>
    !!currentUser.value &&
    path.value?.owner_user_id === currentUser.value.user_id,
);

const { data: entryData } = useGetEntry(pathId, entryId, {
  query: { select: (r) => r.data as EntryContentResponse },
});
const { data: imagesData } = useListEntryImages(pathId, entryId, {
  query: { select: (r) => r.data as ImageResponse[] },
});

const content = computed(() => entryData.value?.content);
const images = computed(() => imagesData.value ?? []);
const entryDay = computed(() => entryData.value?.day ?? '');

const referencedFilenames = computed<Set<string>>(() =>
  content.value ? referencedImageFilenames(content.value) : new Set(),
);
const unreferencedImages = computed(() =>
  images.value.filter((img) => !referencedFilenames.value.has(img.filename)),
);

function goEdit() {
  router.push(`/entry/${pathId.value}/${entryId.value}/edit`);
}

const showDeleteAlert = ref(false);
const deleteError = ref('');
const { mutateAsync: doDeleteEntry } = useDeleteEntry();

function confirmDelete() {
  showDeleteAlert.value = true;
}

const deleteAlertButtons = computed(() => [
  { text: 'Cancel', role: 'cancel' },
  {
    text: 'Delete',
    role: 'destructive',
    handler: () => void performDelete(),
  },
]);

async function performDelete() {
  deleteError.value = '';
  try {
    await doDeleteEntry({ pathCode: pathId.value, entrySlug: entryId.value });
    await queryClient.invalidateQueries({
      queryKey: ['v1', 'paths', pathId.value, 'entries'],
    });
    router.back();
  } catch (err: unknown) {
    deleteError.value = extractErrorMessage(err) ?? 'Failed to delete entry.';
  }
}
</script>

<style scoped>
.entry-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--ion-color-medium, #888);
  margin-bottom: 12px;
}

.entry-path-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.entry-error {
  color: var(--ion-color-danger, red);
  font-size: 0.85rem;
}

.entry-content {
  white-space: pre-wrap;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--ion-color-dark, #333);
  padding: 0 4px;
}

.entry-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding: 0 4px;
}
</style>
