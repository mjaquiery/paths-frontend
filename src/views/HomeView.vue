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
    <ion-content class="ion-padding-horizontal">
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
        <ion-button expand="block" @click="showCreateModal = true">
          + Create Entry
        </ion-button>
      </div>

      <!-- Fallback: not logged in -->
      <div v-if="!currentUser" class="home-welcome">
        <ion-card>
          <ion-card-content>
            <p>Log in to start writing your paths.</p>
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
      </ion-toolbar>
    </ion-footer>

    <!-- Global entry creation modal -->
    <EntryCreateModal
      :is-open="showCreateModal"
      :paths="visiblePaths"
      :current-user-id="currentUser ? currentUser.user_id : ''"
      @dismiss="showCreateModal = false"
      @created="onEntryCreated"
    />
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
import { ref, computed, onMounted } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';

import PathsSelectorBar from '../components/PathsSelectorBar.vue';
import OnThisDaySpotlight from '../components/OnThisDaySpotlight.vue';
import WeekView from '../components/WeekView.vue';
import EntryCreateModal from '../components/EntryCreateModal.vue';
import type {
  PathResponse,
  OAuthCallbackResponse,
  OAuthLoginResponse,
} from '../generated/types';
import { authLogin } from '../generated/apiClient';
import { useMultiPathEntries } from '../composables/useMultiPathEntries';

const loggingIn = ref(false);
const loginError = ref('');
const currentUser = ref<OAuthCallbackResponse | null>(null);
const queryClient = useQueryClient();

/** Ordered, visible paths managed by PathsSelectorBar */
const visiblePaths = ref<PathResponse[]>([]);

const visiblePathIds = computed(() => visiblePaths.value.map((p) => p.path_id));
const multiPathEntries = useMultiPathEntries(visiblePathIds);

const showCreateModal = ref(false);

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
    }
  }
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
  currentUser.value = null;
  visiblePaths.value = [];
}

function onEntryCreated() {
  // Invalidate all path-entry queries so the week view refreshes immediately
  void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
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
  margin-top: 32px;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 8px;
}
</style>
