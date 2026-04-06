<template>
  <div v-if="currentUser" class="paths-selector-bar">
    <!-- ── Compact pill row ── -->
    <div class="paths-bar-row">
      <!-- Visible path pills (up to MAX_PILLS) -->
      <div class="paths-chip-list">
        <button
          v-for="path in visiblePills"
          :key="path.path_id"
          class="path-chip"
          :class="{ 'path-chip--hidden': hiddenByPath[path.path_id] }"
          :style="{
            '--chip-color': path.color,
            borderColor: path.color,
            backgroundColor: hiddenByPath[path.path_id]
              ? 'transparent'
              : hexToRgba(path.color, 0.15),
          }"
          :title="path.title"
          @click="toggleVisibility(path.path_id)"
        >
          <span
            class="path-chip-dot"
            :style="{ backgroundColor: path.color }"
          ></span>
          <span class="path-chip-label">{{ path.title }}</span>
        </button>

        <!-- +N overflow chip -->
        <button
          v-if="overflowCount > 0"
          class="path-chip path-chip--overflow"
          :title="`${overflowCount} more path${overflowCount === 1 ? '' : 's'} — open Manage to see all`"
          @click="showManageModal = true"
        >
          +{{ overflowCount }}
        </button>
      </div>

      <div class="paths-bar-actions">
        <ion-button size="small" fill="clear" @click="openNewPath">
          + New Path
        </ion-button>
        <ion-button size="small" fill="clear" @click="showManageModal = true">
          Manage
        </ion-button>
      </div>
    </div>

    <!-- ── Invitations notification row ── -->
    <div v-if="pendingInvitations.length > 0" class="invitations-row">
      <span class="invitations-row-text">
        {{ pendingInvitations.length }} pending invitation{{
          pendingInvitations.length === 1 ? '' : 's'
        }}
      </span>
      <div class="invitation-cards">
        <div
          v-for="inv in pendingInvitations"
          :key="inv.id"
          class="invitation-card"
        >
          <span class="invitation-path"
            ><strong>{{ inv.path_title ?? inv.path_code }}</strong> from
            {{ inv.inviter_email }}</span
          >
          <div class="invitation-actions">
            <ion-button
              size="small"
              color="success"
              :disabled="invitationBusy[inv.id]"
              @click="acceptInv(inv.id)"
              >Accept</ion-button
            >
            <ion-button
              size="small"
              color="medium"
              fill="outline"
              :disabled="invitationBusy[inv.id]"
              @click="ignoreInv(inv.id)"
              >Ignore</ion-button
            >
            <ion-button
              size="small"
              color="danger"
              fill="outline"
              :disabled="invitationBusy[inv.id]"
              @click="blockInv(inv.id, inv.inviter_user_id)"
              >Block sender</ion-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Manage paths modal ── -->
  <ion-modal :is-open="showManageModal" @did-dismiss="showManageModal = false">
    <ion-header>
      <ion-toolbar>
        <ion-title>Manage Paths</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showManageModal = false">Done</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <!-- New path button -->
      <ion-button expand="block" fill="outline" @click="openNewPath">
        + New Path
      </ion-button>

      <!-- Path list with reorder controls -->
      <ion-list class="paths-list">
        <ion-item v-for="(path, index) in orderedPaths" :key="path.path_id">
          <!-- Reorder arrows -->
          <div class="paths-reorder-arrows" slot="start">
            <ion-button
              size="small"
              fill="clear"
              :disabled="index === 0"
              aria-label="Move path up"
              @click="moveUp(index)"
              >▲</ion-button
            >
            <ion-button
              size="small"
              fill="clear"
              :disabled="index === orderedPaths.length - 1"
              aria-label="Move path down"
              @click="moveDown(index)"
              >▼</ion-button
            >
          </div>

          <!-- Color swatch -->
          <span
            class="path-swatch"
            :style="{ backgroundColor: path.color }"
            slot="start"
          ></span>

          <ion-label>
            <h2>{{ path.title }}</h2>
            <p v-if="path.description">{{ path.description }}</p>
          </ion-label>

          <!-- Visibility toggle -->
          <ion-toggle
            slot="end"
            :checked="!hiddenByPath[path.path_id]"
            @ionChange="onToggleChange(path.path_id, $event)"
          />

          <!-- Public/private chip -->
          <ion-chip
            slot="end"
            :color="path.is_public ? 'success' : 'medium'"
            class="paths-public-chip"
          >
            {{ path.is_public ? 'Public' : 'Private' }}
          </ion-chip>

          <!-- Unsubscribe (for non-owned paths) -->
          <ion-button
            v-if="path.owner_user_id !== currentUser?.user_id"
            slot="end"
            size="small"
            fill="outline"
            color="danger"
            :disabled="unsubscribing[path.path_id]"
            @click="unsubscribe(path.path_id)"
          >
            {{ unsubscribing[path.path_id] ? 'Leaving…' : 'Unsubscribe' }}
          </ion-button>

          <!-- Edit / Delete (owned paths only) -->
          <template v-if="path.owner_user_id === currentUser?.user_id">
            <ion-button
              slot="end"
              size="small"
              fill="outline"
              color="primary"
              @click="openShare(path)"
            >
              🔗 Share
            </ion-button>
            <ion-button
              slot="end"
              size="small"
              fill="outline"
              @click="openEdit(path)"
            >
              ✏️ Edit
            </ion-button>
            <ion-button
              slot="end"
              size="small"
              fill="outline"
              color="danger"
              @click="openDelete(path)"
            >
              🗑️ Delete
            </ion-button>
          </template>
        </ion-item>
      </ion-list>

      <!-- Subscription management (owned paths only) -->
      <PathSubscriptionManager
        v-for="path in ownedPaths"
        :key="'sub-' + path.path_id"
        :path-code="path.path_id"
        :path-title="path.title"
      />
    </ion-content>
  </ion-modal>

  <!-- Path edit modal -->
  <PathEditModal
    v-if="editingPath"
    :is-open="showEditModal"
    :path="editingPath"
    @dismiss="showEditModal = false"
    @updated="onPathUpdated"
  />

  <!-- Path delete modal -->
  <PathDeleteModal
    v-if="deletingPath"
    :is-open="showDeleteModal"
    :path="deletingPath"
    @dismiss="showDeleteModal = false"
    @deleted="onPathDeleted"
  />

  <!-- Path share modal -->
  <PathShareModal
    v-if="sharingPath"
    :is-open="showShareModal"
    :path="sharingPath"
    @dismiss="showShareModal = false"
  />
</template>

<script setup lang="ts">
import {
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonTitle,
  IonToggle,
  IonToolbar,
  type ToggleCustomEvent,
} from '@ionic/vue';
import { computed, ref, watch } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';

import type { OAuthCallbackResponse, PathResponse } from '../generated/types';
import {
  isPathHidden,
  setPathHidden,
  getPathOrder,
  setPathOrder,
} from '../lib/db';
import {
  useListInvitations,
  useAcceptInvitation,
  useIgnoreInvitation,
  useBlockInviter,
  useDeleteSubscription,
} from '../generated/apiClient';
import { usePaths } from '../composables/usePaths';
import PathSubscriptionManager from './PathSubscriptionManager.vue';
import PathEditModal from './PathEditModal.vue';
import PathDeleteModal from './PathDeleteModal.vue';
import PathShareModal from './PathShareModal.vue';

/** Maximum number of pills shown in the compact bar before the +N overflow chip. */
const MAX_PILLS = 4;

const props = defineProps<{
  currentUser: OAuthCallbackResponse | null;
}>();

const emit = defineEmits<{
  pathsChanged: [paths: PathResponse[]];
}>();

const router = useRouter();
const queryClient = useQueryClient();

const { data: allPaths, refetch } = usePaths();

// Invitations
const { data: invitationsData, refetch: refetchInvitations } =
  useListInvitations();
const { mutateAsync: doAccept } = useAcceptInvitation();
const { mutateAsync: doIgnore } = useIgnoreInvitation();
const { mutateAsync: doBlock } = useBlockInviter();

const pendingInvitations = computed(
  () =>
    invitationsData.value?.data?.filter((i) => i.status === 'invited') ?? [],
);

// Unsubscribe
const { mutateAsync: doDeleteSubscription } = useDeleteSubscription();
const unsubscribing = ref<Record<string, boolean>>({});

// Edit / delete path
const showEditModal = ref(false);
const editingPath = ref<PathResponse | null>(null);
const showDeleteModal = ref(false);
const deletingPath = ref<PathResponse | null>(null);

// Share path
const showShareModal = ref(false);
const sharingPath = ref<PathResponse | null>(null);

// Manage modal
const showManageModal = ref(false);

const hiddenByPath = ref<Record<string, boolean>>({});
const pathOrder = ref<string[]>([]);

// Invitation action busy state
const invitationBusy = ref<Record<string, boolean>>({});

// Build ordered + hidden state when paths load
watch(
  allPaths,
  async (paths) => {
    if (!paths) return;
    const hidden = await Promise.all(
      paths.map(
        async (p: PathResponse) =>
          [p.path_id, await isPathHidden(p.path_id)] as const,
      ),
    );
    hiddenByPath.value = Object.fromEntries(hidden);

    // Merge stored order with current paths
    const stored = getPathOrder();
    const ids = paths.map((p: PathResponse) => p.path_id);
    const ordered = [
      ...stored.filter((id) => ids.includes(id)),
      ...ids.filter((id) => !stored.includes(id)),
    ];
    pathOrder.value = ordered;
  },
  { immediate: true },
);

const orderedPaths = computed<PathResponse[]>(() => {
  if (!allPaths.value) return [];
  return pathOrder.value
    .map((id) => allPaths.value!.find((p: PathResponse) => p.path_id === id))
    .filter((p): p is PathResponse => !!p);
});

const ownedPaths = computed<PathResponse[]>(() =>
  orderedPaths.value.filter(
    (p) => p.owner_user_id === props.currentUser?.user_id,
  ),
);

/** Pills shown in the compact bar (at most MAX_PILLS). */
const visiblePills = computed(() => orderedPaths.value.slice(0, MAX_PILLS));

/** Number of paths hidden behind the +N chip. */
const overflowCount = computed(() =>
  Math.max(0, orderedPaths.value.length - MAX_PILLS),
);

// Emit visible ordered paths whenever they change
watch(
  [orderedPaths, hiddenByPath],
  () => {
    const visible = orderedPaths.value.filter(
      (p) => !hiddenByPath.value[p.path_id],
    );
    emit('pathsChanged', visible);
  },
  { deep: true, immediate: true },
);

async function toggleVisibility(pathId: string) {
  const nowHidden = !hiddenByPath.value[pathId];
  hiddenByPath.value[pathId] = nowHidden;
  await setPathHidden(pathId, nowHidden);
}

async function onToggleChange(pathId: string, event: ToggleCustomEvent) {
  const visible = Boolean(event.detail.checked);
  hiddenByPath.value[pathId] = !visible;
  await setPathHidden(pathId, !visible);
}

function moveUp(index: number) {
  if (index === 0) return;
  const ids = [...pathOrder.value];
  const tmp = ids[index - 1]!;
  ids[index - 1] = ids[index]!;
  ids[index] = tmp;
  pathOrder.value = ids;
  setPathOrder(ids);
}

function moveDown(index: number) {
  if (index >= pathOrder.value.length - 1) return;
  const ids = [...pathOrder.value];
  const tmp = ids[index]!;
  ids[index] = ids[index + 1]!;
  ids[index + 1] = tmp;
  pathOrder.value = ids;
  setPathOrder(ids);
}

function openNewPath() {
  showManageModal.value = false;
  void router.push('/paths/new');
}

async function acceptInv(invitationId: string) {
  invitationBusy.value[invitationId] = true;
  try {
    await doAccept({ invitationId });
    await Promise.all([refetchInvitations(), refetch()]);
    void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
  } catch {
    // silently fail
  } finally {
    invitationBusy.value[invitationId] = false;
  }
}

async function ignoreInv(invitationId: string) {
  invitationBusy.value[invitationId] = true;
  try {
    await doIgnore({ invitationId });
    await refetchInvitations();
  } catch {
    // silently fail
  } finally {
    invitationBusy.value[invitationId] = false;
  }
}

async function blockInv(invitationId: string, inviterUserId: string) {
  invitationBusy.value[invitationId] = true;
  try {
    await doBlock({ data: { user_id: inviterUserId } });
    await refetchInvitations();
  } catch {
    // silently fail
  } finally {
    invitationBusy.value[invitationId] = false;
  }
}

async function unsubscribe(pathId: string) {
  if (!props.currentUser) return;
  unsubscribing.value[pathId] = true;
  try {
    await doDeleteSubscription({
      pathCode: pathId,
      targetUserId: props.currentUser.user_id,
    });
    await refetch();
    void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
  } catch {
    // silently fail
  } finally {
    unsubscribing.value[pathId] = false;
  }
}

function openEdit(path: PathResponse) {
  editingPath.value = path;
  showEditModal.value = true;
}

function openShare(path: PathResponse) {
  sharingPath.value = path;
  showShareModal.value = true;
}

function onPathUpdated(_updated: PathResponse) {
  editingPath.value = null;
  void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
  void refetch();
}

function openDelete(path: PathResponse) {
  deletingPath.value = path;
  showDeleteModal.value = true;
}

function onPathDeleted() {
  deletingPath.value = null;
  void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
  void refetch();
}

function hexToRgba(hex: string, alpha: number): string {
  if (typeof hex !== 'string') return `rgba(0,0,0,${alpha})`;
  let normalized = hex.trim();
  if (!normalized.startsWith('#')) normalized = `#${normalized}`;
  // Expand 3-digit shorthand (#rgb → #rrggbb)
  if (/^#[0-9a-fA-F]{3}$/.test(normalized)) {
    normalized = `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(normalized)) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
</script>

<style scoped>
.paths-selector-bar {
  border-bottom: 1px solid var(--ion-color-light-shade, #e0e0e0);
  background: var(--ion-background-color, #fff);
  padding: 4px 8px;
}

/* ── Compact pill row ── */
.paths-bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.paths-chip-list {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.path-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px 3px 6px;
  border-radius: 999px;
  border: 2px solid;
  color: var(--ion-text-color, inherit);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 0.15s,
    opacity 0.15s;
  background: none;
  /* Fixed width so exactly 4 fit in the bar */
  max-width: calc(25% - 8px);
  min-width: 0;
  flex-shrink: 0;
}

.path-chip--hidden {
  opacity: 0.45;
}

.path-chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.path-chip-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.path-chip--overflow {
  border-color: var(--ion-color-medium, #999);
  color: var(--ion-color-medium, #999);
  flex-shrink: 0;
  max-width: none;
  min-width: auto;
}

.paths-bar-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: auto;
  flex-shrink: 0;
}

/* ── Invitations row ── */
.invitations-row {
  padding: 6px 0 4px;
  border-top: 1px solid var(--ion-color-light-shade, #e0e0e0);
  margin-top: 4px;
}

.invitations-row-text {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ion-color-warning-shade, #b45309);
  margin-bottom: 4px;
}

.invitation-cards {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.invitation-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px 0;
  border-bottom: 1px solid var(--ion-color-light, #f4f4f4);
}

.invitation-path {
  font-size: 0.85rem;
  color: var(--ion-text-color, #333);
}

.invitation-actions {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

/* ── Manage modal internals ── */
.paths-list {
  padding: 0;
  margin-top: 16px;
}

.path-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 6px;
  flex-shrink: 0;
}

.paths-reorder-arrows {
  display: flex;
  flex-direction: column;
}

.paths-public-chip {
  font-size: 0.75rem;
}
</style>
