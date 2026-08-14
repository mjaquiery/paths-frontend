<template>
  <ion-page>
    <ion-content class="df-ui">
      <div class="settings-page">
        <div class="settings-header">
          <h1 class="settings-title">Settings</h1>
          <div class="settings-header-right">
            <span v-if="currentUser" class="settings-username">{{
              currentUser.display_name || currentUser.user_id
            }}</span>
            <button class="text-link" @click="logout">Logout</button>
          </div>
        </div>

        <!-- Paths -->
        <section class="settings-section">
          <p class="settings-section-title">Paths</p>
          <div
            v-for="(path, index) in orderedPaths"
            :key="path.path_id"
            class="path-row"
          >
            <span
              class="path-row-bar"
              :style="{ backgroundColor: path.color }"
            />
            <div class="path-row-reorder">
              <button
                class="icon-btn"
                :disabled="index === 0"
                aria-label="Move path up"
                @click="moveUp(index)"
              >
                ▲
              </button>
              <button
                class="icon-btn"
                :disabled="index === orderedPaths.length - 1"
                aria-label="Move path down"
                @click="moveDown(index)"
              >
                ▼
              </button>
            </div>
            <div class="path-row-main">
              <p class="path-row-title">
                {{ path.title }}
                <span
                  v-if="path.is_public && !isOwned(path)"
                  class="path-row-badge"
                  >shared</span
                >
              </p>
              <p class="path-row-sub">
                {{
                  path.description || (isOwned(path) ? 'My path' : 'Read-only')
                }}
              </p>
            </div>
            <div class="path-row-actions">
              <template v-if="isOwned(path)">
                <button
                  class="icon-btn"
                  aria-label="Edit path"
                  @click="openEdit(path)"
                >
                  ✎
                </button>
                <button
                  class="icon-btn"
                  aria-label="Share path"
                  @click="openShare(path)"
                >
                  🔗
                </button>
                <button
                  class="icon-btn icon-btn--danger"
                  aria-label="Delete path"
                  @click="openDelete(path)"
                >
                  🗑
                </button>
              </template>
              <button
                v-else
                class="text-link text-link--danger"
                :disabled="unsubscribing[path.path_id]"
                @click="unsubscribe(path.path_id)"
              >
                {{ unsubscribing[path.path_id] ? 'Leaving…' : 'Unsubscribe' }}
              </button>
              <button
                class="pill-toggle"
                :class="{ 'pill-toggle--on': !hiddenByPath[path.path_id] }"
                @click="toggleVisibility(path.path_id)"
              >
                {{ hiddenByPath[path.path_id] ? 'Hidden' : 'Visible' }}
              </button>
            </div>
          </div>
          <button class="settings-add-link" @click="openCreate">
            + Create new path
          </button>
        </section>

        <!-- Pending invitations -->
        <section class="settings-section">
          <p class="settings-section-title">Pending invitations</p>
          <p v-if="activeInvitations.length === 0" class="settings-empty">
            No pending invitations.
          </p>
          <div
            v-for="inv in activeInvitations"
            :key="inv.id"
            class="invite-card"
          >
            <p v-if="inv.inviter_email" class="invite-from">
              From {{ inv.inviter_email }}
            </p>
            <p class="invite-title">{{ inv.path_title }}</p>
            <div class="invite-actions">
              <button
                class="pill-btn pill-btn--accept"
                :disabled="invBusy[inv.id]"
                @click="acceptInv(inv.id)"
              >
                {{ invBusy[inv.id] ? 'Accepting…' : '✓ Accept' }}
              </button>
              <button
                class="pill-btn"
                :disabled="invBusy[inv.id]"
                @click="ignoreInv(inv.id)"
              >
                Ignore
              </button>
              <button
                class="text-link text-link--danger"
                :disabled="invBusy[inv.id]"
                @click="blockInv(inv.id, inv.inviter_user_id)"
              >
                Block sender
              </button>
            </div>
          </div>
        </section>

        <!-- Ignored invitations + blocked users: secondary, compact -->
        <details
          v-if="ignoredInvitations.length > 0"
          class="settings-section settings-section--muted"
        >
          <summary class="settings-section-title">
            Ignored invitations ({{ ignoredInvitations.length }})
          </summary>
          <div
            v-for="inv in ignoredInvitations"
            :key="inv.id"
            class="muted-row"
          >
            <span
              >{{ inv.path_title
              }}<template v-if="inv.inviter_email">
                — {{ inv.inviter_email }}</template
              ></span
            >
            <button
              class="text-link"
              :disabled="invBusy[inv.id]"
              @click="acceptInv(inv.id)"
            >
              {{ invBusy[inv.id] ? 'Accepting…' : 'Accept' }}
            </button>
          </div>
        </details>

        <section
          v-if="blocklist.length > 0"
          class="settings-section settings-section--muted"
        >
          <p class="settings-section-title">Blocked users</p>
          <div v-for="entry in blocklist" :key="entry.id" class="muted-row">
            <span>{{ entry.blocked_user_id }}</span>
            <button
              class="text-link"
              :disabled="unblockBusy[entry.blocked_user_id]"
              @click="unblock(entry.blocked_user_id)"
            >
              {{
                unblockBusy[entry.blocked_user_id] ? 'Unblocking…' : 'Unblock'
              }}
            </button>
          </div>
        </section>

        <!-- Data & Account -->
        <section class="settings-section">
          <p class="settings-section-title">Data &amp; Account</p>
          <button class="data-row" @click="exportOpen = !exportOpen">
            <span>📤 Export all data</span>
            <span class="chevron">{{ exportOpen ? '⌄' : '›' }}</span>
          </button>
          <ExportCard v-if="exportOpen" :paths="paths ?? []" />

          <button
            class="data-row data-row--danger"
            @click="deleteOpen = !deleteOpen"
          >
            <span>🗑️ Delete account &amp; all data</span>
            <span class="chevron">{{ deleteOpen ? '⌄' : '›' }}</span>
          </button>
          <p v-if="deleteOpen" class="data-row-detail">
            To request deletion of your account and all associated data, please
            contact support. Full self-service deletion is coming in a future
            release.
          </p>
        </section>
      </div>
    </ion-content>

    <PathFormModal
      :is-open="showFormModal"
      :path="editingPath"
      @dismiss="showFormModal = false"
      @saved="onPathSaved"
    />
    <PathDeleteModal
      v-if="deletingPath"
      :is-open="showDeleteModal"
      :path="deletingPath"
      @dismiss="showDeleteModal = false"
      @deleted="onPathDeleted"
    />
    <PathShareModal
      v-if="sharingPath"
      :is-open="showShareModal"
      :path="sharingPath"
      @dismiss="showShareModal = false"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';

import {
  useListInvitations,
  useAcceptInvitation,
  useIgnoreInvitation,
  useBlockInviter,
  useListBlocklist,
  useUnblockUser,
  useDeleteSubscription,
} from '../generated/apiClient';
import { usePaths } from '../composables/usePaths';
import { usePathVisibility } from '../composables/usePathVisibility';
import ExportCard from '../components/ExportCard.vue';
import PathFormModal from '../components/PathFormModal.vue';
import PathDeleteModal from '../components/PathDeleteModal.vue';
import PathShareModal from '../components/PathShareModal.vue';
import type { OAuthCallbackResponse, PathResponse } from '../generated/types';

const router = useRouter();
const queryClient = useQueryClient();

const currentUser = ref<OAuthCallbackResponse | null>(null);
onMounted(() => {
  const stored = localStorage.getItem('user');
  if (stored) {
    try {
      currentUser.value = JSON.parse(stored) as OAuthCallbackResponse;
    } catch {
      currentUser.value = null;
    }
  }
});

function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('session_token');
  router.replace('/');
}

function isOwned(path: PathResponse): boolean {
  return path.owner_user_id === currentUser.value?.user_id;
}

const { data: paths, refetch } = usePaths();
const { orderedPaths, hiddenByPath, toggleVisibility, moveUp, moveDown } =
  usePathVisibility(paths);

// Invitations
const { data: invitationsData, refetch: refetchInvitations } =
  useListInvitations();
const { mutateAsync: doAccept } = useAcceptInvitation();
const { mutateAsync: doIgnore } = useIgnoreInvitation();
const { mutateAsync: doBlock } = useBlockInviter();

const activeInvitations = computed(
  () =>
    invitationsData.value?.data?.filter((i) => i.status === 'invited') ?? [],
);
const ignoredInvitations = computed(
  () =>
    invitationsData.value?.data?.filter((i) => i.status === 'ignored') ?? [],
);

const invBusy = ref<Record<string, boolean>>({});

async function acceptInv(invitationId: string) {
  invBusy.value[invitationId] = true;
  try {
    await doAccept({ invitationId });
    await Promise.all([refetchInvitations(), refetch()]);
    void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
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

// Blocklist
const { data: blocklistData, refetch: refetchBlocklist } = useListBlocklist();
const { mutateAsync: doUnblock } = useUnblockUser();
const blocklist = computed(() => blocklistData.value?.data ?? []);
const unblockBusy = ref<Record<string, boolean>>({});

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

// Unsubscribe (non-owned paths)
const { mutateAsync: doDeleteSubscription } = useDeleteSubscription();
const unsubscribing = ref<Record<string, boolean>>({});

async function unsubscribe(pathId: string) {
  if (!currentUser.value) return;
  unsubscribing.value[pathId] = true;
  try {
    await doDeleteSubscription({
      pathCode: pathId,
      targetUserId: currentUser.value.user_id,
    });
    await refetch();
    void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
  } catch {
    // silently fail
  } finally {
    unsubscribing.value[pathId] = false;
  }
}

// Create / edit / delete / share path
const showFormModal = ref(false);
const editingPath = ref<PathResponse | null>(null);
const showDeleteModal = ref(false);
const deletingPath = ref<PathResponse | null>(null);
const showShareModal = ref(false);
const sharingPath = ref<PathResponse | null>(null);

function openCreate() {
  editingPath.value = null;
  showFormModal.value = true;
}

function openEdit(path: PathResponse) {
  editingPath.value = path;
  showFormModal.value = true;
}

function onPathSaved(_path: PathResponse) {
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

function openShare(path: PathResponse) {
  sharingPath.value = path;
  showShareModal.value = true;
}

// Data & account
const exportOpen = ref(false);
const deleteOpen = ref(false);
</script>

<style scoped>
.settings-page {
  max-width: 40rem;
  margin: 0 auto;
  padding: 1rem var(--page-margin, 0.75rem) 2rem;
}

.settings-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--color-ink);
  margin-bottom: 1.25rem;
}

.settings-title {
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: 1.9rem;
  margin: 0;
  color: var(--color-ink);
}

.settings-header-right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
  color: var(--color-ink);
}

.settings-username {
  font-weight: 600;
}

.text-link {
  background: none;
  border: none;
  color: var(--color-ink);
  text-decoration: underline;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
}

.text-link--danger {
  color: var(--ion-color-danger);
}

.text-link:disabled {
  opacity: 0.5;
  cursor: default;
}

.settings-section {
  margin-bottom: 2rem;
}

.settings-section-title {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
  margin: 0 0 0.75rem;
}

.settings-empty {
  font-size: 0.85rem;
  color: var(--color-ink-muted);
  margin: 0;
}

.path-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--color-rule);
}

.path-row-bar {
  width: 3px;
  align-self: stretch;
  border-radius: 2px;
  flex-shrink: 0;
}

.path-row-reorder {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.path-row-reorder .icon-btn {
  font-size: 0.6rem;
  padding: 0.1rem;
  line-height: 1;
}

.path-row-main {
  flex: 1;
  min-width: 0;
}

.path-row-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 1.05rem;
  color: var(--color-ink);
}

.path-row-badge {
  font-family: var(--font-sans);
  font-size: 0.65rem;
  text-transform: uppercase;
  color: var(--color-ink);
  background: var(--color-rule);
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
  margin-left: 0.4rem;
}

.path-row-sub {
  margin: 0.1rem 0 0;
  font-size: 0.8rem;
  color: var(--color-ink-muted);
}

.path-row-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--color-ink-muted);
  cursor: pointer;
  padding: 0.2rem;
}

.icon-btn--danger {
  color: var(--ion-color-danger);
}

.icon-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.pill-toggle {
  border: 1px solid var(--color-ink);
  background: none;
  color: var(--color-ink);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.7rem;
  cursor: pointer;
}

.pill-toggle:not(.pill-toggle--on) {
  border-color: var(--color-rule);
  color: var(--color-ink-muted);
}

.settings-add-link {
  background: none;
  border: none;
  color: var(--color-ink-muted);
  font-size: 0.9rem;
  text-decoration: underline;
  cursor: pointer;
  padding: 0.6rem 0 0;
}

.invite-card {
  background: color-mix(in srgb, #f5c842 18%, var(--color-paper));
  border-left: 3px solid #f5c842;
  padding: 0.75rem 0.9rem;
  border-radius: 4px;
  margin-bottom: 0.6rem;
}

.invite-from {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-ink);
}

.invite-title {
  margin: 0.15rem 0 0.6rem;
  font-family: var(--font-serif);
  font-size: 1.1rem;
  color: var(--color-ink);
}

.invite-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.pill-btn {
  border: none;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
  background: var(--color-rule);
  color: var(--color-ink);
}

.pill-btn--accept {
  background: var(--ion-color-success);
  color: var(--ion-color-success-contrast);
}

.pill-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.settings-section--muted {
  margin-bottom: 1.25rem;
}

.muted-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0;
  font-size: 0.85rem;
  color: var(--color-ink-muted);
  border-bottom: 1px solid var(--color-rule);
}

.data-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-rule);
  padding: 0.8rem 0;
  font-size: 1rem;
  color: var(--color-ink);
  cursor: pointer;
  text-align: left;
}

.data-row--danger {
  color: var(--ion-color-danger);
}

.chevron {
  color: var(--color-ink-muted);
}

.data-row-detail {
  font-size: 0.85rem;
  color: var(--color-ink-muted);
  padding: 0.6rem 0;
  margin: 0;
  border-bottom: 1px solid var(--color-rule);
}
</style>
