<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="settings-content">
      <AppErrorBanner v-if="loadError" :message="loadError" />

      <!-- ── Paths section ── -->
      <section class="settings-section">
        <h2 class="settings-section__heading">Paths</h2>

        <div v-if="!paths || paths.length === 0" class="settings-empty">
          <p class="settings-empty__text">No paths yet.</p>
          <ion-button
            fill="outline"
            size="small"
            router-link="/paths/new"
            router-direction="forward"
          >
            Create a Path
          </ion-button>
        </div>

        <ul v-else class="settings-path-list">
          <li
            v-for="path in paths"
            :key="path.path_id"
            class="settings-path-row"
            :style="{ '--path-color': path.color }"
          >
            <span class="settings-path-bar"></span>
            <span class="settings-path-name">{{ path.title }}</span>
            <div class="settings-path-actions">
              <ion-button
                fill="clear"
                size="small"
                :aria-label="`Edit path ${path.title}`"
                :router-link="`/path/${path.path_id}/edit`"
                router-direction="forward"
              >
                Edit
              </ion-button>
              <ion-button
                fill="clear"
                size="small"
                :aria-label="`Share path ${path.title}`"
                @click="openShare(path)"
              >
                Share
              </ion-button>
            </div>
          </li>
        </ul>

        <ion-button
          fill="outline"
          size="small"
          class="settings-add-path-btn"
          router-link="/paths/new"
          router-direction="forward"
        >
          + New Path
        </ion-button>
      </section>

      <div class="settings-rule"></div>

      <!-- ── Invitations section ── -->
      <section class="settings-section">
        <h2 class="settings-section__heading">Invitations</h2>

        <AppErrorBanner
          v-if="invitationsError"
          :message="invitationsErrorMsg"
        />

        <div
          v-if="
            activeInvitations.length === 0 &&
            ignoredInvitations.length === 0 &&
            blocklist.length === 0
          "
          class="settings-empty"
        >
          <p class="settings-empty__text">No pending invitations.</p>
        </div>

        <template v-if="activeInvitations.length > 0">
          <h3 class="settings-subsection__heading">Active</h3>
          <ul class="settings-inv-list">
            <li
              v-for="inv in activeInvitations"
              :key="inv.id"
              class="settings-inv-row"
            >
              <div class="settings-inv-info">
                <span class="settings-inv-title">{{ inv.path_title }}</span>
                <span v-if="inv.inviter_email" class="settings-inv-meta">
                  From {{ inv.inviter_email }}
                </span>
                <span class="settings-inv-meta">
                  Invited {{ formatDate(inv.created_at) }}
                </span>
              </div>
              <div class="settings-inv-actions">
                <ion-button
                  size="small"
                  color="success"
                  :disabled="invBusy[inv.id]"
                  @click="acceptInv(inv.id)"
                >
                  {{ invBusy[inv.id] ? 'Accepting…' : 'Accept' }}
                </ion-button>
                <ion-button
                  size="small"
                  fill="outline"
                  :disabled="invBusy[inv.id]"
                  @click="ignoreInv(inv.id)"
                >
                  {{ invBusy[inv.id] ? 'Ignoring…' : 'Ignore' }}
                </ion-button>
                <ion-button
                  size="small"
                  color="danger"
                  fill="outline"
                  :disabled="blockBusy[inv.id]"
                  @click="blockInv(inv.id, inv.inviter_user_id)"
                >
                  {{ blockBusy[inv.id] ? 'Blocking…' : 'Block' }}
                </ion-button>
              </div>
            </li>
          </ul>
        </template>

        <template v-if="ignoredInvitations.length > 0">
          <h3 class="settings-subsection__heading">Ignored</h3>
          <ul class="settings-inv-list">
            <li
              v-for="inv in ignoredInvitations"
              :key="inv.id"
              class="settings-inv-row"
            >
              <div class="settings-inv-info">
                <span class="settings-inv-title">{{ inv.path_title }}</span>
                <span class="settings-inv-meta">
                  Ignored {{ formatDate(inv.updated_at) }}
                </span>
              </div>
              <div class="settings-inv-actions">
                <ion-button
                  size="small"
                  color="success"
                  :disabled="invBusy[inv.id]"
                  @click="acceptInv(inv.id)"
                >
                  {{ invBusy[inv.id] ? 'Accepting…' : 'Accept' }}
                </ion-button>
                <ion-button
                  size="small"
                  color="danger"
                  fill="outline"
                  :disabled="blockBusy[inv.id]"
                  @click="blockInv(inv.id, inv.inviter_user_id)"
                >
                  {{ blockBusy[inv.id] ? 'Blocking…' : 'Block' }}
                </ion-button>
              </div>
            </li>
          </ul>
        </template>

        <template v-if="blocklist.length > 0">
          <h3 class="settings-subsection__heading">Blocked users</h3>
          <ul class="settings-inv-list">
            <li
              v-for="entry in blocklist"
              :key="entry.id"
              class="settings-inv-row"
            >
              <div class="settings-inv-info">
                <span class="settings-inv-title">{{
                  entry.blocked_user_id
                }}</span>
                <span class="settings-inv-meta">
                  Blocked {{ formatDate(entry.created_at) }}
                </span>
              </div>
              <div class="settings-inv-actions">
                <ion-button
                  size="small"
                  color="danger"
                  fill="outline"
                  :disabled="unblockBusy[entry.blocked_user_id]"
                  @click="unblock(entry.blocked_user_id)"
                >
                  {{
                    unblockBusy[entry.blocked_user_id]
                      ? 'Unblocking…'
                      : 'Unblock'
                  }}
                </ion-button>
              </div>
            </li>
          </ul>
        </template>
      </section>

      <div class="settings-rule"></div>

      <!-- ── Data section ── -->
      <section class="settings-section">
        <h2 class="settings-section__heading">Data</h2>

        <!-- Export subsection -->
        <h3 class="settings-subsection__heading">Export</h3>
        <AppErrorBanner v-if="pathsError" :message="pathsErrorMsg" />
        <p
          v-if="paths !== undefined && paths.length === 0"
          class="settings-empty__text"
        >
          You don't have any paths to export yet.
        </p>
        <Suspense v-else>
          <template #default>
            <ExportCard v-if="(paths ?? []).length > 0" :paths="paths ?? []" />
          </template>
          <template #fallback>
            <AppSpinner label="Loading export…" size="small" />
          </template>
        </Suspense>

        <div class="settings-rule settings-rule--light"></div>

        <!-- Delete account subsection -->
        <h3 class="settings-subsection__heading">Delete account</h3>

        <div v-if="existingRequest" class="settings-deletion-status">
          <p class="settings-deletion-status__text">
            A deletion request was submitted on
            {{ formatDate(existingRequest.created_at) }}. Status:
            <strong>{{ existingRequest.state }}</strong
            >.
          </p>
          <p
            v-if="existingRequest.error_message"
            class="settings-deletion-status__error"
          >
            Error: {{ existingRequest.error_message }}
          </p>
          <p v-if="existingRequest.state === 'failed'" class="settings-hint">
            If this keeps failing, please contact support.
          </p>
        </div>

        <div class="settings-delete-notice">
          <p class="settings-delete-notice__text">
            <strong>Before you delete, export your data.</strong> Once deleted,
            your data cannot be recovered.
          </p>
          <ul class="settings-delete-notice__list">
            <li>Your account and login access</li>
            <li>All Paths you own</li>
            <li>All entries and edits within those Paths</li>
            <li>All images attached to your entries</li>
            <li>Your invitations and blocklist</li>
          </ul>
          <p class="settings-hint">
            Paths shared with you (where someone else is the owner) will not be
            deleted — only your subscription to them.
          </p>
        </div>

        <div
          v-if="!existingRequest || existingRequest.state === 'failed'"
          class="settings-delete-confirm"
        >
          <p class="settings-delete-confirm__instructions">
            Type your <strong>{{ confirmHint }}</strong> to confirm deletion.
          </p>
          <ion-item class="settings-confirm-field">
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
            :disabled="!confirmMatches || submitting"
            @click="submitDeletion"
          >
            {{
              submitting ? 'Requesting deletion…' : 'Request account deletion'
            }}
          </ion-button>
        </div>
      </section>
    </ion-content>

    <ion-footer>
      <RefreshStatus
        :status-type="refreshStatusType"
        :status-text="refreshStatusText"
        :last-checked-at="refreshLastCheckedAt"
      />
    </ion-footer>

    <!-- Path share modal -->
    <PathShareModal
      v-if="sharingPath"
      :is-open="!!sharingPath"
      :path="sharingPath"
      @did-dismiss="sharingPath = null"
    />
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
  IonFooter,
  IonButtons,
  IonBackButton,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
} from '@ionic/vue';
import { ref, computed } from 'vue';

import AppErrorBanner from '~/src/components/AppErrorBanner.vue';
import AppSpinner from '~/src/components/AppSpinner.vue';
import ExportCard from '~/src/components/ExportCard.vue';
import RefreshStatus from '~/src/components/RefreshStatus.vue';
import PathShareModal from '~/src/components/PathShareModal.vue';

import { usePaths } from '~/src/composables/usePaths';
import { useCurrentUser } from '~/src/composables/useCurrentUser';
import { useRefreshStatus } from '~/src/composables/useRefreshStatus';
import { useApi } from '~/src/composables/useApi';
import { extractErrorMessage } from '~/src/lib/errors';

import {
  useListInvitations,
  useAcceptInvitation,
  useIgnoreInvitation,
  useBlockInviter,
  useListBlocklist,
  useUnblockUser,
  useGetLatestDeletionRequest,
  useCreateDeletionRequest,
} from '~/src/generated/apiClient';
import type { PathResponse } from '~/src/generated/types';

// ── Paths ──────────────────────────────────────────────────────────────────
const { data: paths, error: pathsError } = usePaths();
const pathsErrorMsg = computed(
  () => extractErrorMessage(pathsError.value) ?? 'Unable to load paths.',
);

const sharingPath = ref<PathResponse | null>(null);
function openShare(path: PathResponse) {
  sharingPath.value = path;
}

// ── Invitations ────────────────────────────────────────────────────────────
const {
  data: invitationsData,
  error: invitationsError,
  refetch: refetchInvitations,
} = useListInvitations();
const { mutateAsync: doAccept } = useAcceptInvitation();
const { mutateAsync: doIgnore } = useIgnoreInvitation();
const { mutateAsync: doBlock } = useBlockInviter();

const {
  data: blocklistData,
  error: blocklistError,
  refetch: refetchBlocklist,
} = useListBlocklist();
const { mutateAsync: doUnblock } = useUnblockUser();

const { enqueue } = useApi();

const invitationsErrorMsg = computed(() => {
  if (invitationsError.value) {
    return (
      extractErrorMessage(invitationsError.value) ??
      'Unable to load invitations.'
    );
  }
  if (blocklistError.value) {
    return (
      extractErrorMessage(blocklistError.value) ?? 'Unable to load blocklist.'
    );
  }
  return undefined;
});

const loadError = computed(() => invitationsErrorMsg.value);

const activeInvitations = computed(
  () =>
    invitationsData.value?.data?.filter((i) => i.status === 'invited') ?? [],
);
const ignoredInvitations = computed(
  () =>
    invitationsData.value?.data?.filter((i) => i.status === 'ignored') ?? [],
);
const blocklist = computed(() => blocklistData.value?.data ?? []);

const invBusy = ref<Record<string, boolean>>({});
const blockBusy = ref<Record<string, boolean>>({});
const unblockBusy = ref<Record<string, boolean>>({});

function acceptInv(invitationId: string) {
  invBusy.value[invitationId] = true;
  enqueue({
    id: `accept-invitation:${invitationId}`,
    label: 'Accept invitation',
    execute: async () => {
      await doAccept({ invitationId });
      await refetchInvitations();
      invBusy.value[invitationId] = false;
    },
  });
}

function ignoreInv(invitationId: string) {
  invBusy.value[invitationId] = true;
  enqueue({
    id: `ignore-invitation:${invitationId}`,
    label: 'Ignore invitation',
    execute: async () => {
      await doIgnore({ invitationId });
      await refetchInvitations();
      invBusy.value[invitationId] = false;
    },
  });
}

function blockInv(invitationId: string, inviterUserId: string) {
  blockBusy.value[invitationId] = true;
  enqueue({
    id: `block-user:${inviterUserId}`,
    label: 'Block sender',
    execute: async () => {
      await doBlock({ data: { user_id: inviterUserId } });
      await Promise.all([refetchInvitations(), refetchBlocklist()]);
      blockBusy.value[invitationId] = false;
    },
  });
}

function unblock(blockedUserId: string) {
  unblockBusy.value[blockedUserId] = true;
  enqueue({
    id: `unblock-user:${blockedUserId}`,
    label: 'Unblock user',
    execute: async () => {
      await doUnblock({ blockedUserId });
      await refetchBlocklist();
      unblockBusy.value[blockedUserId] = false;
    },
  });
}

// ── Deletion ───────────────────────────────────────────────────────────────
const { data: latestDeletionData } = useGetLatestDeletionRequest();
const existingRequest = computed(() => latestDeletionData.value?.data ?? null);
const { mutateAsync: doCreateDeletion } = useCreateDeletionRequest();
const { currentUser } = useCurrentUser();

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

// ── Shared ─────────────────────────────────────────────────────────────────
const {
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

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
.settings-content {
  --padding-top: 0;
  --padding-bottom: 32px;
  --padding-start: var(--page-margin);
  --padding-end: var(--page-margin);
  --background: var(--color-paper);
}

.settings-section {
  padding: var(--section-gap) 0 0;
  max-width: 680px;
  margin: 0 auto;
}

.settings-section__heading {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-ink-muted);
  margin: 0 0 12px;
}

.settings-subsection__heading {
  font-family: var(--font-sans);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-ink-muted);
  margin: 16px 0 8px;
}

.settings-rule {
  height: 1px;
  background: var(--color-rule);
  margin: var(--section-gap) auto 0;
  max-width: 680px;
}

.settings-rule--light {
  margin-top: 12px;
  opacity: 0.5;
}

.settings-empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

.settings-empty__text {
  color: var(--color-ink-muted);
  font-family: var(--font-sans);
  font-size: 0.9rem;
  margin: 0;
}

/* ── Paths list ── */

.settings-path-list {
  list-style: none;
  margin: 0 0 12px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settings-path-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-rule);
}

.settings-path-bar {
  width: 2px;
  height: 1.2em;
  background: var(--path-color, var(--ion-color-primary));
  flex-shrink: 0;
}

.settings-path-name {
  font-family: var(--font-sans);
  font-size: 0.95rem;
  color: var(--color-ink);
  flex: 1;
}

.settings-path-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.settings-add-path-btn {
  margin-top: 8px;
}

/* ── Invitations list ── */

.settings-inv-list {
  list-style: none;
  margin: 0 0 8px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-inv-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-rule);
}

.settings-inv-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.settings-inv-title {
  font-family: var(--font-sans);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-ink);
}

.settings-inv-meta {
  font-family: var(--font-sans);
  font-size: 0.8rem;
  color: var(--color-ink-muted);
}

.settings-inv-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* ── Deletion ── */

.settings-deletion-status {
  padding: 12px;
  background: rgba(245, 124, 0, 0.08);
  border-left: 3px solid var(--ion-color-warning, #f57c00);
  margin-bottom: 12px;
}

.settings-deletion-status__text {
  font-family: var(--font-sans);
  font-size: 0.9rem;
  margin: 0 0 4px;
}

.settings-deletion-status__error {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: var(--ion-color-danger, #c62828);
  margin: 4px 0 0;
}

.settings-delete-notice {
  margin-bottom: 16px;
}

.settings-delete-notice__text {
  font-family: var(--font-sans);
  font-size: 0.9rem;
  margin: 0 0 8px;
}

.settings-delete-notice__list {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0 0 8px;
  padding-left: 1.4em;
}

.settings-hint {
  font-family: var(--font-sans);
  font-size: 0.8rem;
  color: var(--color-ink-muted);
  margin: 0 0 8px;
}

.settings-delete-confirm {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-delete-confirm__instructions {
  font-family: var(--font-sans);
  font-size: 0.9rem;
  margin: 0;
}

.settings-confirm-field {
  --border-radius: 14px;
  --padding-start: 14px;
  --inner-padding-end: 14px;
  border: 1px solid var(--color-rule);
  border-radius: 14px;
}
</style>
