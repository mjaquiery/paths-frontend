<template>
  <ion-page>
    <!-- ── Logged out: centred welcome ── -->
    <ion-content v-if="!currentUser" class="df-ui logged-out-content">
      <div class="logged-out">
        <span class="logo-emoji" aria-hidden="true">📖</span>
        <h1 class="logo-title">Paths</h1>
        <p class="logo-subtitle">
          A private journal across multiple streams of life.
        </p>
        <hr class="logo-divider" />

        <ul class="feature-list">
          <li>
            <span class="feature-mark" aria-hidden="true">✦</span>
            Write daily entries across separate paths — Daily Life, Projects,
            Travel, anything.
          </li>
          <li>
            <span class="feature-mark" aria-hidden="true">✦</span>
            Revisit past years. The same date, one year ago, five years ago.
          </li>
          <li>
            <span class="feature-mark" aria-hidden="true">✦</span>
            Share one path with someone special, keep the rest private.
          </li>
        </ul>

        <button
          class="google-btn"
          :disabled="loggingIn"
          @click="loginWithGoogle"
        >
          {{ loggingIn ? 'Redirecting…' : 'Continue with Google' }}
        </button>
        <p v-if="loginError" class="login-error">{{ loginError }}</p>
        <p class="logo-footnote">
          Your data stays yours. Export or delete any time.
        </p>
      </div>
    </ion-content>

    <!-- ── Logged in: day browser ── -->
    <template v-else>
      <ion-content ref="contentRef">
        <DayBrowser
          ref="dayBrowserRef"
          :visible-paths="visiblePaths"
          :path-entries="multiPathEntries"
          :current-user-id="currentUser.user_id"
          :ensure-day-loaded="ensureDayLoaded"
        />
      </ion-content>

      <BottomBar
        alt-icon="🗂️"
        alt-label="Browse paths"
        alt-to="/paths"
        :can-create="canCreateAny"
        :write-entry-query="{ day: currentDay }"
      />
    </template>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { computed, onMounted, ref } from 'vue';

import DayBrowser from '../components/DayBrowser.vue';
import BottomBar from '../components/BottomBar.vue';
import type { OAuthCallbackResponse } from '../generated/types';
import { usePaths } from '../composables/usePaths';
import { usePathVisibility } from '../composables/usePathVisibility';
import { useMultiPathEntries } from '../composables/useMultiPathEntries';
import { useGoogleLogin } from '../composables/useGoogleLogin';
import { toLocalISODate } from '../utils/date';

const { loggingIn, loginError, loginWithGoogle } = useGoogleLogin();
const currentUser = ref<OAuthCallbackResponse | null>(null);

const { data: allPaths } = usePaths();
const { visiblePaths } = usePathVisibility(allPaths);

const visiblePathIds = computed(() => visiblePaths.value.map((p) => p.path_id));
const { pathEntries: multiPathEntries, ensureDayLoaded } =
  useMultiPathEntries(visiblePathIds);

const contentRef = ref(null);
const dayBrowserRef = ref<InstanceType<typeof DayBrowser> | null>(null);
const currentDay = computed(
  () => dayBrowserRef.value?.selectedDate ?? toLocalISODate(new Date()),
);

const canCreateAny = computed(
  () =>
    !!currentUser.value &&
    visiblePaths.value.some(
      (p) => p.owner_user_id === currentUser.value!.user_id,
    ),
);

onMounted(() => {
  const stored = localStorage.getItem('user');
  if (stored) {
    try {
      currentUser.value = JSON.parse(stored) as OAuthCallbackResponse;
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('session_token');
    }
  }
});
</script>

<style scoped>
.logged-out-content {
  --background: var(--color-paper);
}

ion-content {
  --padding-bottom: calc(var(--app-footer-clearance, 3rem) + 3.5rem) !important;
}

.logged-out {
  max-width: 26rem;
  margin: 0 auto;
  padding: 15vh 2rem 2rem;
  text-align: center;
}

.logo-emoji {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.75rem;
}

.logo-title {
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: 2.5rem;
  margin: 0;
  color: var(--color-ink);
}

.logo-subtitle {
  color: var(--color-ink-muted);
  margin: 0.75rem 0 1.5rem;
  font-size: 1rem;
}

.logo-divider {
  width: 3rem;
  border: none;
  border-top: 1px solid var(--color-rule);
  margin: 0 auto 2rem;
}

.feature-list {
  list-style: none;
  margin: 0 0 2.5rem;
  padding: 0;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.feature-list li {
  display: flex;
  gap: 0.75rem;
  color: var(--color-ink);
  line-height: 1.5;
}

.feature-mark {
  color: var(--color-ink);
  flex-shrink: 0;
}

.google-btn {
  width: 100%;
  background: var(--color-ink);
  color: var(--color-paper);
  border: none;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.9rem;
  cursor: pointer;
}

.google-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.login-error {
  color: var(--ion-color-danger);
  font-size: 0.85rem;
  margin-top: 0.75rem;
}

.logo-footnote {
  color: var(--color-ink-muted);
  font-size: 0.8rem;
  margin-top: 1.25rem;
}
</style>
