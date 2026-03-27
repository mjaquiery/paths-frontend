<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>{{ formattedDate }}</ion-title>
        <ion-buttons slot="end">
          <ion-button
            :router-link="`/date/${prevDate}`"
            router-direction="back"
            aria-label="Previous day"
            >◄</ion-button
          >
          <ion-button
            :router-link="`/date/${nextDate}`"
            router-direction="forward"
            aria-label="Next day"
            >►</ion-button
          >
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-text v-if="pathsError" color="danger" class="view-error-banner">
        {{ pathsErrorMessage }}
      </ion-text>
      <div v-if="dayEntries.length === 0" class="date-empty">
        <p>No entries for this day.</p>
        <ion-button
          v-for="path in ownedPaths"
          :key="path.path_id"
          :router-link="`/entry/${path.path_id}/new?date=${dateStr}`"
          router-direction="forward"
          expand="block"
          class="date-write-btn"
        >
          + Write in {{ path.title }}
        </ion-button>
      </div>
      <div v-else>
        <div
          v-for="item in dayEntries"
          :key="item.entryId"
          class="date-entry-card"
          :style="{ borderLeftColor: item.color }"
          role="button"
          tabindex="0"
          @click="router.push(`/entry/${item.pathId}/${item.entryId}`)"
          @keydown.enter="router.push(`/entry/${item.pathId}/${item.entryId}`)"
        >
          <div class="date-entry-header">
            <span
              class="date-entry-dot"
              :style="{ backgroundColor: item.color }"
            ></span>
            <span class="date-entry-path">{{ item.pathTitle }}</span>
          </div>
          <p class="date-entry-preview">{{ item.preview || '(no text)' }}</p>
        </div>
        <ion-button
          v-for="path in ownedPaths"
          :key="path.path_id"
          :router-link="`/entry/${path.path_id}/new?date=${dateStr}`"
          router-direction="forward"
          expand="block"
          class="date-write-btn"
        >
          + Write in {{ path.title }}
        </ion-button>
      </div>

      <!-- Previously on this day -->
      <div v-if="previousYears.length > 0" class="date-previously">
        <h3>✨ Previously on this day</h3>
        <div
          v-for="ye in previousYears"
          :key="`${ye.pathId}-${ye.year}`"
          class="date-prev-chip"
          role="button"
          tabindex="0"
          @click="router.push(`/date/${ye.year}-${todayMonthDay}`)"
          @keydown.enter="router.push(`/date/${ye.year}-${todayMonthDay}`)"
          @keydown.space.prevent="
            router.push(`/date/${ye.year}-${todayMonthDay}`)
          "
        >
          <span class="date-prev-year">{{ ye.year }}</span>
          <span class="date-prev-preview">{{ ye.preview || '(no text)' }}</span>
        </div>
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
  IonText,
} from '@ionic/vue';
import RefreshStatus from '../components/RefreshStatus.vue';
import { useRefreshStatus } from '../composables/useRefreshStatus';
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';
import { useMultiPathEntries } from '../composables/useMultiPathEntries';
import { usePaths } from '../composables/usePaths';
import { useCurrentUser } from '../composables/useCurrentUser';
import { extractErrorMessage } from '../lib/errors';

const route = useRoute();
const router = useRouter();

const dateStr = computed(() => String(route.params.date));

const formattedDate = computed(() => {
  const d = new Date(dateStr.value + 'T00:00:00');
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

function offsetDate(base: string, days: number): string {
  const d = new Date(base + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
const prevDate = computed(() => offsetDate(dateStr.value, -1));
const nextDate = computed(() => offsetDate(dateStr.value, 1));

const { data: paths, error: pathsError } = usePaths();
const allPaths = computed(() => paths.value ?? []);
const pathsErrorMessage = computed(
  () => extractErrorMessage(pathsError.value) ?? 'Unable to load paths.',
);
const pathIds = computed(() => allPaths.value.map((p) => p.path_id));
const multiPathEntries = useMultiPathEntries(pathIds);

const { currentUserId } = useCurrentUser();

const {
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

const ownedPaths = computed(() =>
  allPaths.value.filter((p) => p.owner_user_id === currentUserId.value),
);

const dayEntries = computed(() => {
  const result: Array<{
    entryId: string;
    pathId: string;
    pathTitle: string;
    color: string;
    preview: string | undefined;
  }> = [];
  for (const { pathId, entries } of multiPathEntries.value) {
    const path = allPaths.value.find((p) => p.path_id === pathId);
    if (!path) continue;
    for (const entry of entries) {
      if (entry.day === dateStr.value) {
        result.push({
          entryId: entry.id,
          pathId,
          pathTitle: path.title,
          color: path.color,
          preview: entry.content,
        });
      }
    }
  }
  return result;
});

const thisYear = computed(() => new Date().getFullYear());
const todayMonthDay = computed(() => dateStr.value.slice(5));

const previousYears = computed(() => {
  const result: Array<{
    pathId: string;
    year: number;
    preview: string | undefined;
  }> = [];
  for (const { pathId, entries } of multiPathEntries.value) {
    for (const entry of entries) {
      if (
        entry.day.slice(5) === todayMonthDay.value &&
        Number(entry.day.slice(0, 4)) < thisYear.value
      ) {
        result.push({
          pathId,
          year: Number(entry.day.slice(0, 4)),
          preview: entry.content,
        });
      }
    }
  }
  return result.sort((a, b) => b.year - a.year);
});
</script>

<style scoped>
.date-entry-card {
  background: var(--ion-card-background);
  border-left: 4px solid transparent;
  border-radius: var(--paths-border-radius);
  padding: 12px 16px;
  margin-bottom: 10px;
  cursor: pointer;
}
.date-entry-card:hover {
  background: var(--paths-card-hover);
}
.date-entry-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.date-entry-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.date-entry-path {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ion-color-medium);
}
.date-entry-preview {
  font-size: 0.9rem;
  color: var(--ion-text-color);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  margin: 0;
}
.date-empty {
  padding: 24px 0;
  text-align: center;
  color: var(--ion-color-medium);
}
.date-write-btn {
  margin-top: 12px;
}
.date-previously {
  margin-top: 24px;
}
.date-previously h3 {
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--ion-color-medium);
}
.date-prev-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: var(--ion-card-background);
  border-radius: var(--paths-border-radius);
  margin-bottom: 6px;
  cursor: pointer;
}
.date-prev-chip:hover {
  background: var(--paths-card-hover);
}
.date-prev-year {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--ion-color-primary);
  min-width: 40px;
}
.date-prev-preview {
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.view-error-banner {
  display: block;
  margin-bottom: 16px;
  font-size: 0.9rem;
}
</style>
