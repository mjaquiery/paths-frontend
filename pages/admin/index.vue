<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Admin Dashboard</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" color="medium" @click="logout">
            Log out
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding admin-content">
      <!-- ── Path Creation Approval ── -->
      <section class="admin-section">
        <h2 class="admin-section__heading">Path Creation Approval</h2>
        <p class="admin-section__desc">
          Grant or revoke a user's permission to create new Paths.
        </p>

        <AppErrorBanner v-if="approvalError" :message="approvalError" />

        <div
          v-if="approvalResult"
          class="admin-success-banner"
          role="status"
          aria-live="polite"
        >
          Updated: user
          <strong>{{ approvalResult.user_id }}</strong> is
          <strong>{{
            approvalResult.allowed ? 'allowed' : 'not allowed'
          }}</strong>
          to create paths.
        </div>

        <ion-list lines="full" class="admin-approval-list">
          <ion-item>
            <ion-label position="stacked">User ID</ion-label>
            <ion-input
              v-model="approvalUserId"
              type="text"
              placeholder="Enter user UUID"
              :disabled="approvalPending"
            />
          </ion-item>
        </ion-list>

        <div class="admin-approval-actions">
          <ion-button
            color="success"
            :disabled="approvalPending || !approvalUserId.trim()"
            @click="setApproval(true)"
          >
            {{
              approvalPending && approvalIntent === true ? 'Saving…' : 'Allow'
            }}
          </ion-button>
          <ion-button
            color="danger"
            fill="outline"
            :disabled="approvalPending || !approvalUserId.trim()"
            @click="setApproval(false)"
          >
            {{
              approvalPending && approvalIntent === false ? 'Saving…' : 'Deny'
            }}
          </ion-button>
        </div>
      </section>
    </ion-content>
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
  IonButtons,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
} from '@ionic/vue';
import { ref } from 'vue';
import AppErrorBanner from '~/src/components/AppErrorBanner.vue';
import { setPathCreationApproval } from '~/src/generated/apiClient';
import { useAdminAuth } from '~/src/composables/useAdminAuth';
import type { PathCreationApprovalResponse } from '~/src/generated/types';

const { isAdminLoggedIn, clearToken, getAdminAuthHeaders } = useAdminAuth();

if (!isAdminLoggedIn.value) {
  await navigateTo('/admin/login', { replace: true });
}

// ── Path creation approval ────────────────────────────────────────────────────
const approvalUserId = ref('');
const approvalPending = ref(false);
const approvalIntent = ref<boolean | null>(null);
const approvalError = ref('');
const approvalResult = ref<PathCreationApprovalResponse | null>(null);

async function setApproval(allowed: boolean) {
  const uid = approvalUserId.value.trim();
  if (!uid || approvalPending.value) return;

  approvalPending.value = true;
  approvalIntent.value = allowed;
  approvalError.value = '';
  approvalResult.value = null;

  try {
    const response = await setPathCreationApproval(
      uid,
      { allowed },
      { headers: getAdminAuthHeaders() },
    );

    if (response.status === 200) {
      approvalResult.value = response.data;
    } else {
      approvalError.value = 'Request failed. Please try again.';
    }
  } catch {
    approvalError.value =
      'Request failed. Please check the user ID and try again.';
  } finally {
    approvalPending.value = false;
    approvalIntent.value = null;
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────
async function logout() {
  clearToken();
  await navigateTo('/admin/login', { replace: true });
}
</script>

<style scoped>
.admin-content {
  --background: var(--ion-background-color);
}

.admin-section {
  max-width: 560px;
  margin: 0 auto 32px;
}

.admin-section__heading {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--ion-text-color);
}

.admin-section__desc {
  font-size: 0.9rem;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.admin-success-banner {
  background: var(--ion-color-success-tint);
  color: var(--ion-color-success-shade);
  border-radius: var(--paths-border-radius, 8px);
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.admin-approval-list {
  margin-bottom: 16px;
}

.admin-approval-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
