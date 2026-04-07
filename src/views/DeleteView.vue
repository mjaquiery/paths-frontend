<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>Delete data</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="delete-content">
      <div class="delete-shell">
        <!-- Existing deletion request status -->
        <ion-card v-if="existingRequest" class="status-card">
          <ion-card-header>
            <ion-card-title>Deletion already requested</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p>
              A deletion request was submitted on
              {{ formatDate(existingRequest.created_at) }}. Current status:
              <strong>{{ existingRequest.state }}</strong
              >.
            </p>
            <p v-if="existingRequest.error_message" class="error-msg">
              Error: {{ existingRequest.error_message }}
            </p>
            <p v-if="existingRequest.state === 'failed'" class="contact-msg">
              If this keeps failing, please contact Matt.
            </p>
          </ion-card-content>
        </ion-card>

        <!-- Export prompt -->
        <ion-card class="export-prompt-card">
          <ion-card-content>
            <p class="export-prompt">
              <strong>Before you delete, export your data.</strong>
              Once deleted, your data cannot be recovered.
            </p>
            <ion-button
              expand="block"
              fill="outline"
              router-link="/export"
              class="export-btn"
            >
              Export your data first
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- What gets deleted -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>What will be deleted</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ul class="deletion-list">
              <li>Your account and login access</li>
              <li>All Paths you own</li>
              <li>All entries and edits within those Paths</li>
              <li>All images attached to your entries</li>
              <li>Your invitations and blocklist</li>
            </ul>
            <p class="deletion-note">
              Paths shared with you (where someone else is the owner) will not
              be deleted — only your subscription to them.
            </p>
          </ion-card-content>
        </ion-card>

        <!-- Confirmation + submit -->
        <ion-card v-if="!existingRequest || existingRequest.state === 'failed'">
          <ion-card-header>
            <ion-card-title>Confirm deletion</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p class="confirm-instructions">
              Type your
              <strong>{{ confirmHint }}</strong> below to confirm.
            </p>
            <ion-item class="confirm-field">
              <ion-label position="stacked">Confirmation</ion-label>
              <ion-input
                v-model="confirmText"
                :placeholder="confirmHint"
                autocomplete="off"
                autocorrect="off"
                :spellcheck="false"
              />
            </ion-item>
            <ion-button
              expand="block"
              color="danger"
              class="delete-btn"
              :disabled="!confirmMatches || submitting"
              @click="submitDeletion"
            >
              {{
                submitting ? 'Requesting deletion…' : 'Request account deletion'
              }}
            </ion-button>
            <p class="contact-msg">Need help? Contact Matt.</p>
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
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
} from '@ionic/vue';
import { ref, computed } from 'vue';
import {
  useGetLatestDeletionRequest,
  useCreateDeletionRequest,
} from '../generated/apiClient';
import { useCurrentUser } from '../composables/useCurrentUser';
import { useRefreshStatus } from '../composables/useRefreshStatus';
import { useApi } from '../composables/useApi';
import RefreshStatus from '../components/RefreshStatus.vue';

const { currentUser } = useCurrentUser();

const { enqueue } = useApi();

const {
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

const { data: latestData } = useGetLatestDeletionRequest();
const existingRequest = computed(() => latestData.value?.data ?? null);

const { mutateAsync: doCreateDeletion } = useCreateDeletionRequest();

// The user must type their display name (if set) or user ID to confirm.
const confirmTarget = computed(() => {
  const dn = currentUser.value?.display_name;
  return (dn ?? currentUser.value?.user_id ?? '').trim();
});

const confirmHint = computed(() => {
  const dn = currentUser.value?.display_name;
  return dn ? 'display name' : 'user ID';
});

const confirmText = ref('');
const confirmMatches = computed(
  () =>
    confirmTarget.value.length > 0 &&
    confirmText.value.trim().toLowerCase() ===
      confirmTarget.value.toLowerCase(),
);

const submitting = ref(false);

function submitDeletion() {
  if (!confirmMatches.value || submitting.value) return;
  submitting.value = true;
  enqueue({
    id: 'delete-account',
    label: 'Request account deletion',
    execute: async () => {
      try {
        await doCreateDeletion();
      } finally {
        submitting.value = false;
      }
    },
  });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
</script>

<style scoped>
.delete-content {
  --padding-top: 18px;
  --padding-bottom: 28px;
  --padding-start: 16px;
  --padding-end: 16px;
}

.delete-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 640px;
  margin: 0 auto;
}

.export-prompt {
  margin: 0 0 12px;
  font-size: 0.95rem;
}

.export-btn {
  margin-top: 4px;
}

.deletion-list {
  margin: 0 0 12px;
  padding-left: 1.4em;
  font-size: 0.95rem;
  line-height: 1.6;
}

.deletion-note {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
  margin: 0;
}

.confirm-instructions {
  margin: 0 0 12px;
  font-size: 0.95rem;
}

.confirm-field {
  --border-radius: 14px;
  --padding-start: 14px;
  --inner-padding-end: 14px;
  border: 1px solid var(--ion-border-color);
  border-radius: 14px;
  margin-bottom: 16px;
}

.delete-btn {
  margin-bottom: 12px;
}

.error-msg {
  color: var(--ion-color-danger);
  font-size: 0.875rem;
  margin: 0 0 12px;
}

.contact-msg {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
  margin: 0;
  text-align: center;
}

.status-card {
  border-left: 4px solid var(--ion-color-warning);
}
</style>
