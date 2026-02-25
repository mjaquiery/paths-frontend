<template>
  <div class="sub-manager">
    <p class="sub-manager-title">
      Subscribers for <strong>{{ pathTitle }}</strong>
    </p>

    <!-- Active subscribers list -->
    <div v-if="subscribers.length > 0" class="sub-list">
      <div v-for="sub in subscribers" :key="sub.user_id" class="sub-item">
        <span class="sub-name">{{
          sub.display_name || sub.email || sub.user_id
        }}</span>
        <ion-button
          size="small"
          fill="outline"
          color="danger"
          :disabled="kicking[sub.user_id]"
          @click="kickSubscriber(sub.user_id)"
        >
          {{ kicking[sub.user_id] ? 'Removing…' : 'Remove' }}
        </ion-button>
      </div>
    </div>
    <p v-else class="sub-empty">No active subscribers.</p>

    <!-- Invite by email -->
    <div class="sub-invite-row">
      <ion-input
        :model-value="inviteEmail"
        type="email"
        placeholder="Email address to invite"
        class="sub-invite-input"
        @update:model-value="onEmailInput($event as string)"
      />
      <ion-button
        size="small"
        :disabled="!inviteEmail || inviting"
        @click="invite"
      >
        {{ inviting ? 'Inviting…' : 'Invite' }}
      </ion-button>
    </div>
    <p v-if="inviteError" class="sub-error">{{ inviteError }}</p>
    <p v-if="inviteSuccess" class="sub-success">{{ inviteSuccess }}</p>
  </div>
</template>

<script setup lang="ts">
import { IonButton, IonInput } from '@ionic/vue';
import { ref, computed } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import {
  useListSubscriptions,
  useInviteSubscriber,
  useDeleteSubscription,
  getListSubscriptionsQueryKey,
} from '../generated/apiClient';
import type { SubscriberResponse } from '../generated/types';
import { extractErrorMessage } from '../lib/errors';

const props = defineProps<{
  pathCode: string;
  pathTitle: string;
}>();

const queryClient = useQueryClient();

const { data: subsData } = useListSubscriptions(props.pathCode);
const subscribers = computed<SubscriberResponse[]>(() => {
  const res = subsData.value;
  if (!res || res.status !== 200) return [];
  return res.data;
});

const { mutateAsync: doInvite } = useInviteSubscriber();
const { mutateAsync: doKick } = useDeleteSubscription();

const inviteEmail = ref('');
const inviting = ref(false);
const inviteError = ref('');
const inviteSuccess = ref('');
const kicking = ref<Record<string, boolean>>({});

async function invite() {
  if (!inviteEmail.value) return;
  inviting.value = true;
  inviteError.value = '';
  inviteSuccess.value = '';
  try {
    await doInvite({
      pathCode: props.pathCode,
      data: { email: inviteEmail.value },
    });
    inviteSuccess.value = 'Invitation sent successfully.';
    inviteEmail.value = '';
  } catch (err: unknown) {
    const detail = extractErrorMessage(err);
    inviteError.value = detail
      ? `Failed to invite: ${detail}`
      : 'Failed to send invitation. Please try again.';
  } finally {
    inviting.value = false;
  }
}

async function kickSubscriber(userId: string) {
  kicking.value[userId] = true;
  try {
    await doKick({ pathCode: props.pathCode, targetUserId: userId });
    void queryClient.invalidateQueries({
      queryKey: getListSubscriptionsQueryKey(props.pathCode),
    });
  } catch {
    // ignore — subscriber list will refresh on next load
  } finally {
    kicking.value[userId] = false;
  }
}

function onEmailInput(value: string) {
  inviteEmail.value = value;
  inviteSuccess.value = '';
  inviteError.value = '';
}
</script>

<style scoped>
.sub-manager {
  padding: 8px 0;
  border-top: 1px solid var(--ion-color-light-shade, #e0e0e0);
  margin-top: 4px;
}

.sub-manager-title {
  font-size: 0.85rem;
  margin: 0 0 8px;
  color: var(--ion-color-dark, #333);
}

.sub-list {
  margin-bottom: 8px;
}

.sub-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid var(--ion-color-light, #f4f4f4);
}

.sub-name {
  font-size: 0.85rem;
  color: var(--ion-color-dark, #333);
}

.sub-empty {
  font-size: 0.8rem;
  color: var(--ion-color-medium, #666);
  margin: 4px 0 8px;
}

.sub-invite-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 4px;
}

.sub-invite-input {
  flex: 1;
}

.sub-error {
  color: var(--ion-color-danger, red);
  font-size: 0.85rem;
  margin-top: 4px;
}

.sub-success {
  color: var(--ion-color-success, green);
  font-size: 0.85rem;
  margin-top: 4px;
}
</style>
