<template>
  <ion-page>
    <ion-content>
      <div class="entry-page df-ui">
        <div class="entry-header">
          <button class="text-btn" @click="goBack">← Back</button>
          <div ref="menuWrapperRef" class="entry-header-actions">
            <router-link
              v-if="canEdit"
              class="text-btn"
              :to="{
                path: `/entry/${pathId}/${entryId}/edit`,
                query: entryLinkQuery,
              }"
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

        <p class="entry-path-label">
          <router-link
            v-if="path && entryDay"
            :to="pathViewLink"
            class="entry-path-link"
            >{{ path.title }}</router-link
          >
          <template v-else-if="path">{{ path.title }}</template>
          <template v-else>Loading…</template>
        </p>
        <h1 class="entry-date">
          <router-link
            v-if="entryDay"
            :to="dateViewLink"
            class="entry-date-link"
            >{{ formattedDate }}</router-link
          >
          <template v-else>Loading…</template>
        </h1>

        <p v-if="deleteError" class="entry-error">{{ deleteError }}</p>
        <p v-if="entryNotFound" class="entry-body-placeholder">
          This entry couldn't be found. It may have been deleted.
        </p>
        <template v-else>
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
        </template>

        <template v-if="unreferencedImages.length > 0">
          <p class="entry-section-label">
            {{ unreferencedImages.length }}
            {{ unreferencedImages.length === 1 ? 'PHOTO' : 'PHOTOS' }}
          </p>
          <div class="entry-images">
            <EntryImage
              v-for="(img, idx) in unreferencedImages"
              :key="img.id"
              :image-id="img.id"
              :alt="img.filename"
              @open="openLightbox(idx)"
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
            :to="{
              path: `/entry/${item.pathId}/${item.entryId}`,
              query: entryLinkQuery,
            }"
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

    <ImageLightbox
      :is-open="lightboxIndex !== null"
      :images="unreferencedImages"
      :start-index="lightboxIndex ?? 0"
      :day="entryDay"
      @dismiss="lightboxIndex = null"
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
import { describeError, isApiErrorWithStatus } from '../lib/errors';
import MarkdownContent from '../components/MarkdownContent.vue';
import EntryImage from '../components/EntryImage.vue';
import ImageLightbox from '../components/ImageLightbox.vue';
import { referencedImageFilenames } from '../utils/markdown';
import { dateViewPath, pathViewPath } from '../utils/viewLinks';
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

// Entry view is only ever reached from the date view or the path view, so
// "where to go back to" only needs a one-bit hint, not a stored URL — date
// view is the default assumption, and a `from=paths` query flag is the one
// case that needs to override it. The actual destination (which path, which
// day) is reconstructed from data the entry already has (its own pathId
// route param, its own day), not carried in the URL.
const cameFromPaths = computed(() => route.query.from === 'paths');
// Forwarded onto edit/"on this day" links so hopping between entries never
// loses the original path/date view — you're always exactly one back-press
// away from it, no matter how many entries you've hopped through.
const entryLinkQuery = computed(() =>
  cameFromPaths.value ? { from: 'paths' } : {},
);

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

const { data: entryData, error: entryError } = useGetEntry(pathId, entryId, {
  query: { select: (r) => r.data as EntryContentResponse },
});
const { data: imagesData } = useListEntryImages(pathId, entryId, {
  query: { select: (r) => r.data as ImageResponse[] },
});

const entryNotFound = computed(() =>
  isApiErrorWithStatus(entryError.value, 404),
);

const content = computed(() => entryData.value?.content);
const images = computed(() => imagesData.value ?? []);
const entryDay = computed(() => entryData.value?.day ?? '');

// The path name jumps to the path view centred on this entry's date; the
// date jumps to that day in the date view — each one page away, matching
// how the user got here in the first place.
const pathViewLink = computed(() =>
  pathViewPath(pathId.value, entryDay.value || undefined),
);
const dateViewLink = computed(() => dateViewPath(entryDay.value));

// Not relied on via browser history so it survives a login round trip
// untouched (a full-page redirect out to Google and back inserts extra
// history entries router.back() would otherwise land on).
const backLink = computed(() =>
  cameFromPaths.value
    ? pathViewLink.value
    : dateViewPath(entryDay.value || undefined),
);

function goBack() {
  router.replace(backLink.value);
}

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

const lightboxIndex = ref<number | null>(null);
function openLightbox(index: number) {
  lightboxIndex.value = index;
}

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
    // Navigate away before invalidating: this entry's own detail query
    // shares the ['v1','paths',pathId,'entries',...] prefix, so an awaited
    // invalidation here would refetch (and 404 on) the entry we just left.
    goBack();
    void queryClient.invalidateQueries({
      queryKey: ['v1', 'paths', pathId.value, 'entries'],
    });
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

.entry-path-link {
  color: inherit;
  text-decoration: none;
}

.entry-path-link:hover {
  text-decoration: underline;
}

.entry-date {
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: 1.7rem;
  margin: 0.2rem 0 1.25rem;
  color: var(--color-ink);
}

.entry-date-link {
  color: inherit;
  text-decoration: none;
}

.entry-date-link:hover {
  text-decoration: underline;
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
