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
          <!-- Welcome name (logged-in only) -->
          <ion-label
            v-if="currentUser"
            class="ion-padding-end header-user-name"
          >
            {{ currentUser.display_name || currentUser.user_id }}
          </ion-label>

          <!-- Hamburger menu button -->
          <ion-button
            id="hamburger-trigger"
            :aria-label="'Open menu'"
            @click="menuOpen = true"
          >
            ☰
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <!-- ── Hamburger popover ── -->
    <ion-popover
      :is-open="menuOpen"
      trigger="hamburger-trigger"
      trigger-action="click"
      :dismiss-on-select="true"
      @did-dismiss="menuOpen = false"
    >
      <ion-list lines="none">
        <ion-item
          button
          :detail="false"
          router-link="/paths/new"
          router-direction="forward"
          @click="menuOpen = false"
        >
          + New Path
        </ion-item>
        <ion-item
          button
          :detail="false"
          router-link="/invitations"
          router-direction="forward"
          @click="menuOpen = false"
        >
          Manage invitations
        </ion-item>
        <ion-item
          button
          :detail="false"
          router-link="/export"
          router-direction="forward"
          @click="menuOpen = false"
        >
          Export data
        </ion-item>
        <ion-item
          button
          :detail="false"
          router-link="/delete"
          router-direction="forward"
          @click="menuOpen = false"
        >
          Delete data
        </ion-item>
        <ion-item-divider />
        <ion-item
          button
          :detail="false"
          @click="
            toggleDarkMode();
            menuOpen = false;
          "
        >
          {{ darkPreference === 'system' ? '🖥️' : isDark ? '☀️' : '🌙' }}
          {{ darkModeLabel }}
        </ion-item>
        <ion-item
          v-if="currentUser"
          button
          :detail="false"
          @click="
            logout();
            menuOpen = false;
          "
        >
          Logout
        </ion-item>
        <ion-item
          v-else
          button
          :detail="false"
          :disabled="loggingIn"
          @click="
            loginWithGoogle();
            menuOpen = false;
          "
        >
          {{ loggingIn ? 'Redirecting…' : 'Login with Google' }}
        </ion-item>
      </ion-list>
    </ion-popover>

    <!-- ── Paths selector bar (logged-in only) ── -->
    <PathsSelectorBar
      v-if="currentUser"
      :current-user="currentUser"
      @paths-changed="onPathsChanged"
    />

    <!-- ── Main content ── -->
    <ion-content class="ion-padding-horizontal">
      <ion-text v-if="pathsError" color="danger" class="view-error-banner">
        {{ pathsErrorMessage }}
      </ion-text>

      <!-- Login error (shown only when not logged in) -->
      <ion-text
        v-if="loginError && !currentUser"
        color="danger"
        class="view-error-banner"
      >
        {{ loginError }}
      </ion-text>

      <!-- Previously on this day -->
      <OnThisDaySpotlight
        v-if="effectiveVisiblePaths.length > 0"
        :visible-paths="effectiveVisiblePaths"
        :path-entries="multiPathEntries"
      />

      <!-- Primary week view -->
      <WeekView
        :visible-paths="effectiveVisiblePaths"
        :path-entries="multiPathEntries"
        :can-create="canCreateAny"
        :current-user-id="currentUser ? currentUser.user_id : ''"
        @entry-created="onEntryCreated"
      />

      <!-- No paths: prompt to create one -->
      <div v-if="currentUser && !canCreateAny" class="no-paths-cta">
        <p class="no-paths-hint">You have no paths yet.</p>
        <ion-button
          expand="block"
          router-link="/paths/new"
          router-direction="forward"
        >
          + Create a Path
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
  pageTransition: { name: 'ion-back', mode: 'out-in' },
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
  IonLabel,
  IonText,
  IonThumbnail,
  IonCard,
  IonCardContent,
  IonPopover,
  IonList,
  IonItem,
  IonItemDivider,
} from '@ionic/vue';
import { ref, computed } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';

import PathsSelectorBar from '~/src/components/PathsSelectorBar.vue';
import OnThisDaySpotlight from '~/src/components/OnThisDaySpotlight.vue';
import WeekView from '~/src/components/WeekView.vue';
import RefreshStatus from '~/src/components/RefreshStatus.vue';
import type {
  PathResponse,
  OAuthCallbackResponse,
  OAuthLoginResponse,
} from '~/src/generated/types';
import { authLogin } from '~/src/generated/apiClient';
import { useMultiPathEntries } from '~/src/composables/useMultiPathEntries';
import { usePaths } from '~/src/composables/usePaths';
import { useDarkMode } from '~/src/composables/useDarkMode';
import { useRefreshStatus } from '~/src/composables/useRefreshStatus';
import { extractErrorMessage } from '~/src/lib/errors';

const {
  isDark,
  preference: darkPreference,
  toggle: toggleDarkMode,
} = useDarkMode();

const {
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

const darkModeLabel = computed(() => {
  if (darkPreference.value === 'light') return 'Light mode – switch to dark';
  if (darkPreference.value === 'dark') return 'Dark mode – switch to system';
  return 'System mode – switch to light';
});

const loggingIn = ref(false);
const loginError = ref('');
const menuOpen = ref(false);
const currentUser = ref<OAuthCallbackResponse | null>(getStoredUser());
const queryClient = useQueryClient();

/** Ordered, visible paths managed by PathsSelectorBar */
const visiblePaths = ref<PathResponse[]>([]);
const { data: allPaths, error: pathsError } = usePaths();
const hasReceivedPathSelection = ref(false);
const pathsErrorMessage = computed(
  () =>
    extractErrorMessage(pathsError.value) ?? 'Unable to load paths right now.',
);

const effectiveVisiblePaths = computed(() => {
  if (!currentUser.value) return [];
  if (!hasReceivedPathSelection.value) {
    return allPaths.value ?? [];
  }
  return visiblePaths.value;
});

const visiblePathIds = computed(() =>
  effectiveVisiblePaths.value.map((p) => p.path_id),
);
const multiPathEntries = useMultiPathEntries(visiblePathIds);

const canCreateAny = computed(
  () =>
    !!currentUser.value &&
    effectiveVisiblePaths.value.some(
      (p) => p.owner_user_id === currentUser.value!.user_id,
    ),
);

function getStoredUser(): OAuthCallbackResponse | null {
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try {
    return JSON.parse(stored) as OAuthCallbackResponse;
  } catch {
    localStorage.removeItem('user');
    localStorage.removeItem('session_token');
    return null;
  }
}

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
  hasReceivedPathSelection.value = false;
}

function onEntryCreated() {
  // Invalidate all path-entry queries so the week view refreshes immediately
  void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
}

function onPathsChanged(paths: PathResponse[]) {
  visiblePaths.value = paths;
  hasReceivedPathSelection.value = true;
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

.header-user-name {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.view-error-banner {
  display: block;
  margin: 16px 0;
  font-size: 0.9rem;
}

.no-paths-cta {
  margin: 24px 0 8px;
  text-align: center;
}

.no-paths-hint {
  color: var(--ion-color-medium);
  font-size: 0.9rem;
  margin: 0 0 12px;
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
</style>
