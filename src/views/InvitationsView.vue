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
    <ion-content class="ion-padding">
      <!-- Ignored invitations -->
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
              <ion-label>
                <h3>Path: {{ inv.path_code }}</h3>
                <p>Ignored on {{ formatDate(inv.updated_at) }}</p>
              </ion-label>
              <ion-button
                slot="end"
                size="small"
                color="success"
                :disabled="invBusy[inv.id]"
                @click="acceptInv(inv.id)"
              >
                {{ invBusy[inv.id] ? 'Accepting…' : 'Accept' }}
              </ion-button>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <!-- Blocklist -->
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
              <ion-label>
                <h3>User ID: {{ entry.blocked_user_id }}</h3>
                <p>Blocked on {{ formatDate(entry.created_at) }}</p>
              </ion-label>
              <ion-button
                slot="end"
                size="small"
                color="danger"
                fill="outline"
                :disabled="unblockBusy[entry.blocked_user_id]"
                @click="unblock(entry.blocked_user_id)"
              >
                {{
                  unblockBusy[entry.blocked_user_id] ? 'Unblocking…' : 'Unblock'
                }}
              </ion-button>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
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
} from '@ionic/vue';
import { ref, computed } from 'vue';
import {
  useListInvitations,
  useAcceptInvitation,
  useListBlocklist,
  useUnblockUser,
} from '../generated/apiClient';

const { data: invitationsData, refetch: refetchInvitations } =
  useListInvitations();
const { mutateAsync: doAccept } = useAcceptInvitation();

const { data: blocklistData, refetch: refetchBlocklist } = useListBlocklist();
const { mutateAsync: doUnblock } = useUnblockUser();

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
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr;
  }
}
</script>

<style scoped>
.empty-msg {
  color: var(--ion-color-medium, #666);
  font-size: 0.9rem;
}

.inv-item,
.block-item {
  --padding-start: 0;
}
</style>
