<template>
  <ion-page>
    <ion-content>
      <div class="entry-page df-ui">
        <div class="entry-header">
          <button class="text-btn" @click="router.back()">← Back</button>
          <div ref="menuWrapperRef" class="entry-header-actions">
            <router-link
              v-if="canEdit"
              class="text-btn"
              :to="`/entry/${pathId}/${entryId}/edit`"
            >
              ✎ Edit
            </router-link>
            <button
              v-if="canEdit"
              class="text-btn"
              aria-label="More actions"
              @click="showMenu = !showMenu"
            >
              ⋯
            </button>
            <div v-if="showMenu" class="entry-menu">
              <button
                class="entry-menu-item entry-menu-item--danger"
                @click="confirmDelete"
              >
                Delete entry
              </button>
            </div>
          </div>
        </div>

        <p class="entry-path-label">{{ path?.title }}</p>
        <h1 class="entry-date">{{ formattedDate || 'Loading…' }}</h1>

        <p v-if="deleteError" class="entry-error">{{ deleteError }}</p>
        <p v-if="content === undefined" class="entry-body-placeholder">
          Fetching…
        </p>
        <p v-else-if="!content" class="entry-body-placeholder">(no text)</p>
        <MarkdownContent
          v-else
          class="entry-body"
          :content="content"
          :images="images"
        />

        <template v-if="unreferencedImages.length > 0">
          <p class="entry-section-label">
            {{ unreferencedImages.length }}
            {{ unreferencedImages.length === 1 ? 'PHOTO' : 'PHOTOS' }}
          </p>
          <div class="entry-images">
            <EntryImage
              v-for="img in unreferencedImages"
              :key="img.id"
              :image-id="img.id"
              :alt="img.filename"
            />
          </div>
        </template>

        <template v-if="onThisDay.length > 0">
          <hr class="entry-rule" />
          <p class="entry-section-label">On this day</p>
          <router-link
            v-for="item in onThisDay"
            :key="item.pathId + '-' + item.entryId"
            class="on-this-day-row"
            :to="`/entry/${item.pathId}/${item.entryId}`"
          >
            <span class="on-this-day-year">{{ item.year }}</span>
            <span class="on-this-day-preview">{{
              item.content || '(no text)'
            }}</span>
          </router-link>
        </template>
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
import { IonPage, IonContent, IonAlert } from '@ionic/vue';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';

import {
  useGetEntry,
  useListEntryImages,
  useDeleteEntry,
} from '../generated/apiClient';
import { usePaths } from '../composables/usePaths';
import { usePathVisibility } from '../composables/usePathVisibility';
import { useMultiPathEntries } from '../composables/useMultiPathEntries';
import { useOnThisDay } from '../composables/useOnThisDay';
import { describeError } from '../lib/errors';
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
const { visiblePaths } = usePathVisibility(allPaths);
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

const formattedDate = computed(() => {
  if (!entryDay.value) return '';
  const d = new Date(entryDay.value + 'T00:00:00');
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
});

const referencedFilenames = computed<Set<string>>(() =>
  content.value ? referencedImageFilenames(content.value) : new Set(),
);
const unreferencedImages = computed(() =>
  images.value.filter((img) => !referencedFilenames.value.has(img.filename)),
);

// "On this day" across every visible path, for *this entry's* date.
const visiblePathIds = computed(() => visiblePaths.value.map((p) => p.path_id));
const { pathEntries: multiPathEntries, ensureDayLoaded } =
  useMultiPathEntries(visiblePathIds);
const onThisDay = useOnThisDay(entryDay, visiblePaths, multiPathEntries);

watch(entryDay, (day) => day && ensureDayLoaded(day), { immediate: true });
watch(
  () => onThisDay.value.map((entry) => entry.year),
  (years) => {
    if (!entryDay.value) return;
    const monthDay = entryDay.value.slice(5);
    for (const year of years) ensureDayLoaded(`${year}-${monthDay}`);
  },
  { immediate: true },
);

const showMenu = ref(false);
const menuWrapperRef = ref<HTMLElement | null>(null);

function closeMenuIfOutside(e: MouseEvent) {
  if (showMenu.value && !menuWrapperRef.value?.contains(e.target as Node)) {
    showMenu.value = false;
  }
}
onMounted(() => document.addEventListener('click', closeMenuIfOutside));
onBeforeUnmount(() =>
  document.removeEventListener('click', closeMenuIfOutside),
);

const showDeleteAlert = ref(false);
const deleteError = ref('');
const { mutateAsync: doDeleteEntry } = useDeleteEntry();

function confirmDelete() {
  showMenu.value = false;
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
    deleteError.value = describeError('delete entry', err);
  }
}
</script>

<style scoped>
.entry-page {
  max-width: 40rem;
  margin: 0 auto;
  padding: 1rem var(--page-margin, 0.75rem) 2rem;
}

.entry-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-rule);
  margin-bottom: 1.25rem;
  position: relative;
}

.entry-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}

.text-btn {
  display: inline-block;
  background: none;
  border: none;
  text-decoration: none;
  color: var(--color-ink-muted);
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0.2rem;
}

.entry-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--color-paper);
  border: 1px solid var(--color-rule);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  z-index: 10;
  overflow: hidden;
}

.entry-menu-item {
  display: block;
  width: 100%;
  background: none;
  border: none;
  padding: 0.6rem 1rem;
  text-align: left;
  font-size: 0.9rem;
  cursor: pointer;
  color: var(--color-ink);
  white-space: nowrap;
}

.entry-menu-item--danger {
  color: var(--ion-color-danger);
}

.entry-path-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
  margin: 0;
}

.entry-date {
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: 1.7rem;
  margin: 0.2rem 0 1.25rem;
  color: var(--color-ink);
}

.entry-error {
  color: var(--ion-color-danger);
  font-size: 0.85rem;
}

.entry-body-placeholder {
  color: var(--color-ink-muted);
  font-family: var(--font-serif);
  font-size: 1.1rem;
}

.entry-section-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
  margin: 1.5rem 0 0.75rem;
}

.entry-images {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.entry-rule {
  border: none;
  border-top: 1px solid var(--color-rule);
  margin: 1.75rem 0 0;
}

.on-this-day-row {
  display: flex;
  gap: 1rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--color-rule);
  text-decoration: none;
}

.on-this-day-row:last-child {
  border-bottom: none;
}

.on-this-day-year {
  flex-shrink: 0;
  width: 3rem;
  font-weight: 700;
  color: var(--color-ink);
}

.on-this-day-preview {
  color: var(--color-ink-muted);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
