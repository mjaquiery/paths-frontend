<template>
  <ion-page>
    <!-- ── Logged out: centred welcome (f-1a) ── -->
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

    <!-- ── Logged in: day browser (f-2a) ── -->
    <template v-else>
      <ion-content ref="contentRef">
        <DayBrowser
          :visible-paths="visiblePaths"
          :path-entries="multiPathEntries"
          :can-create="canCreateAny"
          :current-user-id="currentUser.user_id"
          @toggle-paths="router.push('/settings')"
        />
      </ion-content>

      <div class="bottom-bar df-ui">
        <button
          class="bottom-bar-icon"
          aria-label="Browse paths"
          @click="router.push('/settings')"
        >
          🗂️
        </button>
        <button
          v-if="canCreateAny"
          class="bottom-bar-cta"
          @click="router.push('/entry/new')"
        >
          + Write Entry
        </button>
        <button
          class="bottom-bar-icon"
          aria-label="Settings"
          @click="router.push('/settings')"
        >
          ⚙️
        </button>
      </div>
    </template>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import DayBrowser from '../components/DayBrowser.vue';
import type {
  OAuthCallbackResponse,
  OAuthLoginResponse,
} from '../generated/types';
import { authLogin } from '../generated/apiClient';
import { usePaths } from '../composables/usePaths';
import { usePathVisibility } from '../composables/usePathVisibility';
import { useMultiPathEntries } from '../composables/useMultiPathEntries';

const router = useRouter();

const loggingIn = ref(false);
const loginError = ref('');
const currentUser = ref<OAuthCallbackResponse | null>(null);

const { data: allPaths } = usePaths();
const { visiblePaths } = usePathVisibility(allPaths);

const visiblePathIds = computed(() => visiblePaths.value.map((p) => p.path_id));
const multiPathEntries = useMultiPathEntries(visiblePathIds);

const contentRef = ref(null);

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
</script>

<style scoped>
.logged-out-content {
  --background: var(--color-paper);
}

ion-content {
  --padding-bottom: calc(var(--app-footer-clearance, 3rem) + 3.5rem);
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
  color: #d33;
  font-size: 0.85rem;
  margin-top: 0.75rem;
}

.logo-footnote {
  color: var(--color-ink-muted);
  font-size: 0.8rem;
  margin-top: 1.25rem;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: var(--app-footer-clearance, 3rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem var(--page-margin, 0.75rem);
  background: var(--color-paper);
  border-top: 1px solid var(--color-rule);
  z-index: var(--ion-z-index-overlay, 999);
}

.bottom-bar-icon {
  background: none;
  border: none;
  font-size: 1.3rem;
  padding: 0.3rem;
  cursor: pointer;
}

.bottom-bar-cta {
  background: var(--color-ink);
  color: var(--color-paper);
  border: none;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.65rem 1.5rem;
  cursor: pointer;
}
</style>
