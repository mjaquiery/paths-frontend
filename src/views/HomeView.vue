<template>
  <ion-page>
    <!-- ── Header ── -->
    <ion-header>
      <ion-toolbar>
        <!-- Logo -->
        <ion-thumbnail slot="start" class="header-logo">
          <img src="/favicon.svg" alt="Paths logo" />
        </ion-thumbnail>
        <ion-title>Paths</ion-title>
        <ion-buttons slot="end">
          <ion-button
            :title="darkModeLabel"
            :aria-label="darkModeLabel"
            @click="toggleDarkMode"
          >
            {{ darkPreference === 'system' ? '🖥️' : isDark ? '☀️' : '🌙' }}
          </ion-button>
          <template v-if="currentUser">
            <ion-label class="ion-padding-end">{{
              currentUser.display_name || currentUser.user_id
            }}</ion-label>
            <ion-button @click="logout">Logout</ion-button>
          </template>
          <ion-button v-else :disabled="loggingIn" @click="loginWithGoogle">
            {{ loggingIn ? 'Redirecting…' : 'Login with Google' }}
          </ion-button>
          <ion-text v-if="loginError" color="danger" class="ion-padding-start">
            {{ loginError }}
          </ion-text>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <!-- ── Paths selector bar (logged-in only) ── -->
    <PathsSelectorBar
      v-if="currentUser"
      :current-user="currentUser"
      @paths-changed="visiblePaths = $event"
    />

    <!-- ── Main content ── -->
    <ion-content ref="contentRef" class="ion-padding-horizontal">
      <!-- Previously on this day -->
      <OnThisDaySpotlight
        v-if="visiblePaths.length > 0"
        :visible-paths="visiblePaths"
        :path-entries="multiPathEntries"
      />

      <!-- Primary week view -->
      <WeekView
        :visible-paths="visiblePaths"
        :path-entries="multiPathEntries"
        :can-create="canCreateAny"
        :current-user-id="currentUser ? currentUser.user_id : ''"
        @entry-created="onEntryCreated"
      />

      <!-- Generic create-entry button -->
      <div v-if="canCreateAny" class="create-entry-cta">
        <ion-button expand="block" @click="createNewEntry()">
          + Create Entry
        </ion-button>
      </div>

      <!-- Fallback: not logged in -->
      <div v-if="!currentUser" class="home-welcome">
        <div class="welcome-logo-wrap">
          <img src="/favicon.svg" alt="Paths logo" class="welcome-logo" />
          <h1 class="welcome-app-name">Paths</h1>
          <p class="welcome-tagline">
            A private journal across multiple streams of life.
          </p>
        </div>
        <ion-card class="welcome-card">
          <ion-card-content>
            <ul class="welcome-features">
              <li>
                Write daily entries across separate paths — Daily Life,
                Projects, Travel, anything.
              </li>
              <li>
                Revisit past years. The same date, one year ago, five years ago.
              </li>
              <li>
                Share one path with someone special, keep the rest private.
              </li>
            </ul>
            <ion-button
              expand="block"
              :disabled="loggingIn"
              class="welcome-login-btn"
              @click="loginWithGoogle"
            >
              {{ loggingIn ? 'Redirecting…' : 'Continue with Google' }}
            </ion-button>
            <p v-if="loginError" class="welcome-error">{{ loginError }}</p>
            <p class="welcome-note">
              Your data stays yours. Export or delete any time.
            </p>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>

    <!-- ── Footer ── -->
    <ion-footer>
      <ion-toolbar>
        <div class="footer-links">
          <ion-button
            fill="clear"
            size="small"
            router-link="/invitations"
            router-direction="forward"
          >
            Manage invitations
          </ion-button>
          <ion-button
            fill="clear"
            size="small"
            router-link="/export"
            router-direction="forward"
          >
            Export data
          </ion-button>
          <ion-button
            fill="clear"
            size="small"
            router-link="/delete"
            router-direction="forward"
          >
            Delete data
          </ion-button>
        </div>
        <RefreshStatus
          slot="end"
          :status-type="refreshStatusType"
          :status-text="refreshStatusText"
          :last-checked-at="refreshLastCheckedAt"
        />
      </ion-toolbar>
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
  IonButton,
  IonButtons,
  IonLabel,
  IonText,
  IonThumbnail,
  IonFooter,
  IonCard,
  IonCardContent,
} from '@ionic/vue';
import { ref, computed, onMounted, nextTick } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';

import PathsSelectorBar from '../components/PathsSelectorBar.vue';
import OnThisDaySpotlight from '../components/OnThisDaySpotlight.vue';
import WeekView from '../components/WeekView.vue';
import RefreshStatus from '../components/RefreshStatus.vue';
import type {
  PathResponse,
  OAuthCallbackResponse,
  OAuthLoginResponse,
} from '../generated/types';
import { authLogin } from '../generated/apiClient';
import { useMultiPathEntries } from '../composables/useMultiPathEntries';
import { useRefreshStatus } from '../composables/useRefreshStatus';
import { useDarkMode } from '../composables/useDarkMode';

const {
  isDark,
  preference: darkPreference,
  toggle: toggleDarkMode,
} = useDarkMode();

const router = useRouter();

const darkModeLabel = computed(() => {
  if (darkPreference.value === 'light') return 'Light mode – switch to dark';
  if (darkPreference.value === 'dark') return 'Dark mode – switch to system';
  return 'System mode – switch to light';
});

const loggingIn = ref(false);
const loginError = ref('');
const currentUser = ref<OAuthCallbackResponse | null>(null);
const queryClient = useQueryClient();

/** Ordered, visible paths managed by PathsSelectorBar */
const visiblePaths = ref<PathResponse[]>([]);

const visiblePathIds = computed(() => visiblePaths.value.map((p) => p.path_id));
const multiPathEntries = useMultiPathEntries(visiblePathIds);

const {
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

const contentRef = ref<InstanceType<typeof IonContent> | null>(null);

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
  void nextTick(() => contentRef.value?.$el?.scrollToBottom(0));
});

async function loginWithGoogle() {
  loggingIn.value = true;
  loginError.value = '';
  try {
    const callbackUri = `${window.location.origin}/auth/callback`;
    const result = await authLogin({ callback_uri: callbackUri });
    const loginData = result.data as OAuthLoginResponse;
    if (loginData?.authorization_url) {
      window.location.href = loginData.authorization_url;
    } else {
      loginError.value = 'Could not start login. Please try again.';
      loggingIn.value = false;
    }
  } catch {
    loginError.value = 'Could not start login. Please try again.';
    loggingIn.value = false;
  }
}

function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('session_token');
  currentUser.value = null;
  visiblePaths.value = [];
}

function onEntryCreated() {
  // Invalidate all path-entry queries so the week view refreshes immediately
  void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
}

function createNewEntry() {
  const ownedPath = visiblePaths.value.find(
    (p) => p.owner_user_id === currentUser.value?.user_id,
  );
  if (ownedPath) {
    void router.push(`/entry/${ownedPath.path_id}/new`);
  }
}
</script>

<style scoped>
.header-logo {
  --size: 36px;
  margin: 0 4px 0 8px;
}

.header-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.create-entry-cta {
  margin: 16px 0 8px;
}

.home-welcome {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.welcome-logo-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.welcome-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 12px;
}

.welcome-app-name {
  font-size: 2rem;
  font-weight: 700;
  color: var(--ion-color-primary);
  margin: 0 0 6px;
  letter-spacing: -0.5px;
}

.welcome-tagline {
  font-size: 0.95rem;
  color: var(--ion-color-medium);
  text-align: center;
  max-width: 280px;
  line-height: 1.5;
  margin: 0;
}

.welcome-card {
  width: 100%;
  max-width: 420px;
}

.welcome-features {
  margin: 0 0 20px 16px;
  padding: 0;
  color: var(--ion-color-dark);
  font-size: 0.9rem;
  line-height: 1.6;
}

.welcome-features li {
  margin-bottom: 8px;
}

.welcome-login-btn {
  margin-bottom: 8px;
}

.welcome-error {
  color: var(--ion-color-danger);
  font-size: 0.85rem;
  text-align: center;
}

.welcome-note {
  font-size: 0.78rem;
  color: var(--ion-color-medium);
  text-align: center;
  margin: 8px 0 0;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 8px;
}
</style>
