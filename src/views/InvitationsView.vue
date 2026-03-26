<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" />
        </ion-buttons>
        <ion-title>Manage invitations</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="invitations-content">
      <div class="invitations-stack">
        <ion-text
          v-if="loadErrorMessage"
          color="danger"
          class="view-error-banner"
        >
          {{ loadErrorMessage }}
        </ion-text>
        <ion-card>
          <ion-card-header>
            <ion-card-title>Active invitations</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p v-if="activeInvitations.length === 0" class="empty-msg">
              No pending invitations.
            </p>
            <ion-list v-else>
              <ion-item
                v-for="inv in activeInvitations"
                :key="inv.id"
                class="inv-item"
              >
                <div class="inv-card">
                  <ion-label class="inv-copy">
                    <h3 class="inv-title">{{ inv.path_title }}</h3>
                    <p v-if="inv.inviter_email" class="inv-meta">
                      From {{ inv.inviter_email }}
                    </p>
                    <p class="inv-meta">
                      Invited on {{ formatDate(inv.created_at) }}
                    </p>
                  </ion-label>
                  <div class="inv-actions">
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
                      color="medium"
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
                      :disabled="invBusy[inv.id]"
                      @click="blockInv(inv.id, inv.inviter_user_id)"
                    >
                      Block sender
                    </ion-button>
                  </div>
                </div>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Ignored invitations</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p v-if="ignoredInvitations.length === 0" class="empty-msg">
              No ignored invitations.
            </p>
            <ion-list v-else>
              <ion-item
                v-for="inv in ignoredInvitations"
                :key="inv.id"
                class="inv-item"
              >
                <div class="inv-card">
                  <ion-label class="inv-copy">
                    <h3 class="inv-title">{{ inv.path_title }}</h3>
                    <p v-if="inv.inviter_email" class="inv-meta">
                      From {{ inv.inviter_email }}
                    </p>
                    <p class="inv-meta">
                      Ignored on {{ formatDate(inv.updated_at) }}
                    </p>
                  </ion-label>
                  <div class="inv-actions">
                    <ion-button
                      size="small"
                      color="success"
                      :disabled="invBusy[inv.id]"
                      @click="acceptInv(inv.id)"
                    >
                      {{ invBusy[inv.id] ? 'Accepting…' : 'Accept' }}
                    </ion-button>
                  </div>
                </div>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Blocked users</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p v-if="blocklist.length === 0" class="empty-msg">
              No blocked users.
            </p>
            <ion-list v-else>
              <ion-item
                v-for="entry in blocklist"
                :key="entry.id"
                class="block-item"
              >
                <div class="inv-card">
                  <ion-label class="inv-copy">
                    <h3 class="inv-title">{{ entry.blocked_user_id }}</h3>
                    <p class="inv-meta">
                      Blocked on {{ formatDate(entry.created_at) }}
                    </p>
                  </ion-label>
                  <div class="inv-actions">
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
                </div>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonText,
} from '@ionic/vue';
import { ref, computed } from 'vue';
import {
  useListInvitations,
  useAcceptInvitation,
  useIgnoreInvitation,
  useBlockInviter,
  useListBlocklist,
  useUnblockUser,
} from '../generated/apiClient';
import { extractErrorMessage } from '../lib/errors';

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
const loadErrorMessage = computed(() => {
  if (invitationsError.value) {
    return (
      extractErrorMessage(invitationsError.value) ??
      'Unable to load invitations right now.'
    );
  }
  if (blocklistError.value) {
    return (
      extractErrorMessage(blocklistError.value) ??
      'Unable to load blocked users right now.'
    );
  }
  return '';
});

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
const unblockBusy = ref<Record<string, boolean>>({});

async function acceptInv(invitationId: string) {
  invBusy.value[invitationId] = true;
  try {
    await doAccept({ invitationId });
    await refetchInvitations();
  } catch {
    // silently fail
  } finally {
    invBusy.value[invitationId] = false;
  }
}

async function ignoreInv(invitationId: string) {
  invBusy.value[invitationId] = true;
  try {
    await doIgnore({ invitationId });
    await refetchInvitations();
  } catch {
    // silently fail
  } finally {
    invBusy.value[invitationId] = false;
  }
}

async function blockInv(invitationId: string, inviterUserId: string) {
  invBusy.value[invitationId] = true;
  try {
    await doBlock({ data: { user_id: inviterUserId } });
    await Promise.all([refetchInvitations(), refetchBlocklist()]);
  } catch {
    // silently fail
  } finally {
    invBusy.value[invitationId] = false;
  }
}

async function unblock(blockedUserId: string) {
  unblockBusy.value[blockedUserId] = true;
  try {
    await doUnblock({ blockedUserId });
    await refetchBlocklist();
  } catch {
    // silently fail
  } finally {
    unblockBusy.value[blockedUserId] = false;
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return dateStr;
  }
  return date.toLocaleDateString();
}
</script>

<style scoped>
.invitations-content {
  --padding-top: 18px;
  --padding-bottom: 28px;
  --padding-start: 16px;
  --padding-end: 16px;
}

.invitations-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 680px;
  margin: 0 auto;
}

.view-error-banner {
  display: block;
  font-size: 0.9rem;
}

.empty-msg {
  color: var(--ion-color-medium, #666);
  font-size: 0.9rem;
  margin: 0;
}

.inv-item,
.block-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}

.inv-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px 0;
}

.inv-copy {
  margin: 0;
}

.inv-title {
  margin: 0;
  font-size: 1rem;
  line-height: 1.3;
  white-space: normal;
}

.inv-meta {
  margin: 4px 0 0;
  font-size: 0.875rem;
  line-height: 1.4;
  white-space: normal;
  word-break: break-word;
}

.inv-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.inv-actions ion-button {
  margin: 0;
  flex: 1 1 140px;
}
</style>
