"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
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
/// <reference types="../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />

definePageMeta({
    pageTransition: { name: 'ion-forward', mode: 'out-in' },
});
var vue_1 = require("@ionic/vue");
var vue_2 = require("vue");
var AppErrorBanner_vue_1 = require("~/src/components/AppErrorBanner.vue");
var AppSpinner_vue_1 = require("~/src/components/AppSpinner.vue");
var ExportCard_vue_1 = require("~/src/components/ExportCard.vue");
var RefreshStatus_vue_1 = require("~/src/components/RefreshStatus.vue");
var PathShareModal_vue_1 = require("~/src/components/PathShareModal.vue");
var usePaths_1 = require("~/src/composables/usePaths");
var useCurrentUser_1 = require("~/src/composables/useCurrentUser");
var useRefreshStatus_1 = require("~/src/composables/useRefreshStatus");
var useApi_1 = require("~/src/composables/useApi");
var errors_1 = require("~/src/lib/errors");
var apiClient_1 = require("~/src/generated/apiClient");
// ── Paths ──────────────────────────────────────────────────────────────────
var _d = (0, usePaths_1.usePaths)(), paths = _d.data, pathsError = _d.error;
var pathsErrorMsg = (0, vue_2.computed)(function () { var _a; return (_a = (0, errors_1.extractErrorMessage)(pathsError.value)) !== null && _a !== void 0 ? _a : 'Unable to load paths.'; });
var sharingPath = (0, vue_2.ref)(null);
function openShare(path) {
    sharingPath.value = path;
}
// ── Invitations ────────────────────────────────────────────────────────────
var _e = (0, apiClient_1.useListInvitations)(), invitationsData = _e.data, invitationsError = _e.error, refetchInvitations = _e.refetch;
var doAccept = (0, apiClient_1.useAcceptInvitation)().mutateAsync;
var doIgnore = (0, apiClient_1.useIgnoreInvitation)().mutateAsync;
var doBlock = (0, apiClient_1.useBlockInviter)().mutateAsync;
var _f = (0, apiClient_1.useListBlocklist)(), blocklistData = _f.data, blocklistError = _f.error, refetchBlocklist = _f.refetch;
var doUnblock = (0, apiClient_1.useUnblockUser)().mutateAsync;
var enqueue = (0, useApi_1.useApi)().enqueue;
var invitationsErrorMsg = (0, vue_2.computed)(function () {
    var _a, _b;
    if (invitationsError.value) {
        return ((_a = (0, errors_1.extractErrorMessage)(invitationsError.value)) !== null && _a !== void 0 ? _a : 'Unable to load invitations.');
    }
    if (blocklistError.value) {
        return ((_b = (0, errors_1.extractErrorMessage)(blocklistError.value)) !== null && _b !== void 0 ? _b : 'Unable to load blocklist.');
    }
    return undefined;
});
var loadError = (0, vue_2.computed)(function () { return invitationsErrorMsg.value; });
var activeInvitations = (0, vue_2.computed)(function () { var _a, _b, _c; return (_c = (_b = (_a = invitationsData.value) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.filter(function (i) { return i.status === 'invited'; })) !== null && _c !== void 0 ? _c : []; });
var ignoredInvitations = (0, vue_2.computed)(function () { var _a, _b, _c; return (_c = (_b = (_a = invitationsData.value) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.filter(function (i) { return i.status === 'ignored'; })) !== null && _c !== void 0 ? _c : []; });
var blocklist = (0, vue_2.computed)(function () { var _a, _b; return (_b = (_a = blocklistData.value) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : []; });
var invBusy = (0, vue_2.ref)({});
var blockBusy = (0, vue_2.ref)({});
var unblockBusy = (0, vue_2.ref)({});
function acceptInv(invitationId) {
    var _this = this;
    invBusy.value[invitationId] = true;
    enqueue({
        id: "accept-invitation:".concat(invitationId),
        label: 'Accept invitation',
        execute: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, doAccept({ invitationId: invitationId })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, refetchInvitations()];
                    case 2:
                        _a.sent();
                        invBusy.value[invitationId] = false;
                        return [2 /*return*/];
                }
            });
        }); },
    });
}
function ignoreInv(invitationId) {
    var _this = this;
    invBusy.value[invitationId] = true;
    enqueue({
        id: "ignore-invitation:".concat(invitationId),
        label: 'Ignore invitation',
        execute: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, doIgnore({ invitationId: invitationId })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, refetchInvitations()];
                    case 2:
                        _a.sent();
                        invBusy.value[invitationId] = false;
                        return [2 /*return*/];
                }
            });
        }); },
    });
}
function blockInv(invitationId, inviterUserId) {
    var _this = this;
    blockBusy.value[invitationId] = true;
    enqueue({
        id: "block-user:".concat(inviterUserId),
        label: 'Block sender',
        execute: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, doBlock({ data: { user_id: inviterUserId } })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, Promise.all([refetchInvitations(), refetchBlocklist()])];
                    case 2:
                        _a.sent();
                        blockBusy.value[invitationId] = false;
                        return [2 /*return*/];
                }
            });
        }); },
    });
}
function unblock(blockedUserId) {
    var _this = this;
    unblockBusy.value[blockedUserId] = true;
    enqueue({
        id: "unblock-user:".concat(blockedUserId),
        label: 'Unblock user',
        execute: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, doUnblock({ blockedUserId: blockedUserId })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, refetchBlocklist()];
                    case 2:
                        _a.sent();
                        unblockBusy.value[blockedUserId] = false;
                        return [2 /*return*/];
                }
            });
        }); },
    });
}
// ── Deletion ───────────────────────────────────────────────────────────────
var latestDeletionData = (0, apiClient_1.useGetLatestDeletionRequest)().data;
var existingRequest = (0, vue_2.computed)(function () { var _a, _b; return (_b = (_a = latestDeletionData.value) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : null; });
var doCreateDeletion = (0, apiClient_1.useCreateDeletionRequest)().mutateAsync;
var currentUser = (0, useCurrentUser_1.useCurrentUser)().currentUser;
var confirmTarget = (0, vue_2.computed)(function () {
    var _a, _b, _c;
    var dn = (_a = currentUser.value) === null || _a === void 0 ? void 0 : _a.display_name;
    return ((_c = dn !== null && dn !== void 0 ? dn : (_b = currentUser.value) === null || _b === void 0 ? void 0 : _b.user_id) !== null && _c !== void 0 ? _c : '').trim();
});
var confirmHint = (0, vue_2.computed)(function () {
    var _a;
    var dn = (_a = currentUser.value) === null || _a === void 0 ? void 0 : _a.display_name;
    return dn ? 'display name' : 'user ID';
});
var confirmText = (0, vue_2.ref)('');
var confirmMatches = (0, vue_2.computed)(function () {
    return confirmTarget.value.length > 0 &&
        confirmText.value.trim().toLowerCase() ===
            confirmTarget.value.toLowerCase();
});
var submitting = (0, vue_2.ref)(false);
function submitDeletion() {
    var _this = this;
    if (!confirmMatches.value || submitting.value)
        return;
    submitting.value = true;
    enqueue({
        id: 'delete-account',
        label: 'Request account deletion',
        execute: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, , 2, 3]);
                        return [4 /*yield*/, doCreateDeletion()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        submitting.value = false;
                        return [7 /*endfinally*/];
                    case 3: return [2 /*return*/];
                }
            });
        }); },
    });
}
// ── Shared ─────────────────────────────────────────────────────────────────
var _g = (0, useRefreshStatus_1.useRefreshStatus)(), refreshStatusType = _g.statusType, refreshStatusText = _g.statusText, refreshLastCheckedAt = _g.lastCheckedAt;
function formatDate(dateStr) {
    var d = new Date(dateStr);
    if (isNaN(d.getTime()))
        return dateStr;
    return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
var __VLS_0 = {}.IonPage;
/** @type {[typeof __VLS_components.IonPage, typeof __VLS_components.ionPage, typeof __VLS_components.IonPage, typeof __VLS_components.ionPage, ]} */ ;
// @ts-ignore
var __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
var __VLS_2 = __VLS_1.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_1), false));
var __VLS_4 = {};
__VLS_3.slots.default;
var __VLS_5 = {}.IonHeader;
/** @type {[typeof __VLS_components.IonHeader, typeof __VLS_components.ionHeader, typeof __VLS_components.IonHeader, typeof __VLS_components.ionHeader, ]} */ ;
// @ts-ignore
var __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({}));
var __VLS_7 = __VLS_6.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_6), false));
__VLS_8.slots.default;
var __VLS_9 = {}.IonToolbar;
/** @type {[typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, typeof __VLS_components.IonToolbar, typeof __VLS_components.ionToolbar, ]} */ ;
// @ts-ignore
var __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({}));
var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_10), false));
__VLS_12.slots.default;
var __VLS_13 = {}.IonButtons;
/** @type {[typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, ]} */ ;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
    slot: "start",
}));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([{
        slot: "start",
    }], __VLS_functionalComponentArgsRest(__VLS_14), false));
__VLS_16.slots.default;
var __VLS_17 = {}.IonBackButton;
/** @type {[typeof __VLS_components.IonBackButton, typeof __VLS_components.ionBackButton, ]} */ ;
// @ts-ignore
var __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({
    defaultHref: "/",
}));
var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([{
        defaultHref: "/",
    }], __VLS_functionalComponentArgsRest(__VLS_18), false));
var __VLS_16;
var __VLS_21 = {}.IonTitle;
/** @type {[typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, ]} */ ;
// @ts-ignore
var __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({}));
var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_22), false));
__VLS_24.slots.default;
var __VLS_24;
var __VLS_12;
var __VLS_8;
var __VLS_25 = {}.IonContent;
/** @type {[typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, ]} */ ;
// @ts-ignore
var __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25(__assign({ class: "settings-content" })));
var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ class: "settings-content" })], __VLS_functionalComponentArgsRest(__VLS_26), false));
__VLS_28.slots.default;
if (__VLS_ctx.loadError) {
    /** @type {[typeof AppErrorBanner, ]} */ ;
    // @ts-ignore
    var __VLS_29 = __VLS_asFunctionalComponent(AppErrorBanner_vue_1.default, new AppErrorBanner_vue_1.default({
        message: (__VLS_ctx.loadError),
    }));
    var __VLS_30 = __VLS_29.apply(void 0, __spreadArray([{
            message: (__VLS_ctx.loadError),
        }], __VLS_functionalComponentArgsRest(__VLS_29), false));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)(__assign({ class: "settings-section" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)(__assign({ class: "settings-section__heading" }));
if (!__VLS_ctx.paths || __VLS_ctx.paths.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "settings-empty" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "settings-empty__text" }));
    var __VLS_32 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        fill: "outline",
        size: "small",
        routerLink: "/paths/new",
        routerDirection: "forward",
    }));
    var __VLS_34 = __VLS_33.apply(void 0, __spreadArray([{
            fill: "outline",
            size: "small",
            routerLink: "/paths/new",
            routerDirection: "forward",
        }], __VLS_functionalComponentArgsRest(__VLS_33), false));
    __VLS_35.slots.default;
    var __VLS_35;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)(__assign({ class: "settings-path-list" }));
    var _loop_1 = function (path) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)(__assign(__assign({ key: (path.path_id) }, { class: "settings-path-row" }), { style: ({ '--path-color': path.color }) }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "settings-path-bar" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "settings-path-name" }));
        (path.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "settings-path-actions" }));
        var __VLS_36 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            fill: "clear",
            size: "small",
            'aria-label': ("Edit path ".concat(path.title)),
            routerLink: ("/path/".concat(path.path_id, "/edit")),
            routerDirection: "forward",
        }));
        var __VLS_38 = __VLS_37.apply(void 0, __spreadArray([{
                fill: "clear",
                size: "small",
                'aria-label': ("Edit path ".concat(path.title)),
                routerLink: ("/path/".concat(path.path_id, "/edit")),
                routerDirection: "forward",
            }], __VLS_functionalComponentArgsRest(__VLS_37), false));
        __VLS_39.slots.default;
        var __VLS_40 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40(__assign({ 'onClick': {} }, { fill: "clear", size: "small", 'aria-label': ("Share path ".concat(path.title)) })));
        var __VLS_42 = __VLS_41.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { fill: "clear", size: "small", 'aria-label': ("Share path ".concat(path.title)) })], __VLS_functionalComponentArgsRest(__VLS_41), false));
        var __VLS_44 = void 0;
        var __VLS_45 = void 0;
        var __VLS_46 = void 0;
        var __VLS_47 = {
            onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!!(!__VLS_ctx.paths || __VLS_ctx.paths.length === 0))
                    return;
                __VLS_ctx.openShare(path);
            }
        };
        __VLS_43.slots.default;
    };
    var __VLS_39, __VLS_43;
    for (var _i = 0, _h = __VLS_getVForSourceType((__VLS_ctx.paths)); _i < _h.length; _i++) {
        var path = _h[_i][0];
        _loop_1(path);
    }
}
var __VLS_48 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48(__assign(__assign({ fill: "outline", size: "small" }, { class: "settings-add-path-btn" }), { routerLink: "/paths/new", routerDirection: "forward" })));
var __VLS_50 = __VLS_49.apply(void 0, __spreadArray([__assign(__assign({ fill: "outline", size: "small" }, { class: "settings-add-path-btn" }), { routerLink: "/paths/new", routerDirection: "forward" })], __VLS_functionalComponentArgsRest(__VLS_49), false));
__VLS_51.slots.default;
var __VLS_51;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "settings-rule" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)(__assign({ class: "settings-section" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)(__assign({ class: "settings-section__heading" }));
if (__VLS_ctx.invitationsError) {
    /** @type {[typeof AppErrorBanner, ]} */ ;
    // @ts-ignore
    var __VLS_52 = __VLS_asFunctionalComponent(AppErrorBanner_vue_1.default, new AppErrorBanner_vue_1.default({
        message: (__VLS_ctx.invitationsErrorMsg),
    }));
    var __VLS_53 = __VLS_52.apply(void 0, __spreadArray([{
            message: (__VLS_ctx.invitationsErrorMsg),
        }], __VLS_functionalComponentArgsRest(__VLS_52), false));
}
if (__VLS_ctx.activeInvitations.length === 0 &&
    __VLS_ctx.ignoredInvitations.length === 0 &&
    __VLS_ctx.blocklist.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "settings-empty" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "settings-empty__text" }));
}
if (__VLS_ctx.activeInvitations.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)(__assign({ class: "settings-subsection__heading" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)(__assign({ class: "settings-inv-list" }));
    var _loop_2 = function (inv) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)(__assign({ key: (inv.id) }, { class: "settings-inv-row" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "settings-inv-info" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "settings-inv-title" }));
        (inv.path_title);
        if (inv.inviter_email) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "settings-inv-meta" }));
            (inv.inviter_email);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "settings-inv-meta" }));
        (__VLS_ctx.formatDate(inv.created_at));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "settings-inv-actions" }));
        var __VLS_55 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_56 = __VLS_asFunctionalComponent(__VLS_55, new __VLS_55(__assign({ 'onClick': {} }, { size: "small", color: "success", disabled: (__VLS_ctx.invBusy[inv.id]) })));
        var __VLS_57 = __VLS_56.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "small", color: "success", disabled: (__VLS_ctx.invBusy[inv.id]) })], __VLS_functionalComponentArgsRest(__VLS_56), false));
        var __VLS_59 = void 0;
        var __VLS_60 = void 0;
        var __VLS_61 = void 0;
        var __VLS_62 = {
            onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.activeInvitations.length > 0))
                    return;
                __VLS_ctx.acceptInv(inv.id);
            }
        };
        __VLS_58.slots.default;
        (__VLS_ctx.invBusy[inv.id] ? 'Accepting…' : 'Accept');
        var __VLS_63 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63(__assign({ 'onClick': {} }, { size: "small", fill: "outline", disabled: (__VLS_ctx.invBusy[inv.id]) })));
        var __VLS_65 = __VLS_64.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "small", fill: "outline", disabled: (__VLS_ctx.invBusy[inv.id]) })], __VLS_functionalComponentArgsRest(__VLS_64), false));
        var __VLS_67 = void 0;
        var __VLS_68 = void 0;
        var __VLS_69 = void 0;
        var __VLS_70 = {
            onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.activeInvitations.length > 0))
                    return;
                __VLS_ctx.ignoreInv(inv.id);
            }
        };
        __VLS_66.slots.default;
        (__VLS_ctx.invBusy[inv.id] ? 'Ignoring…' : 'Ignore');
        var __VLS_71 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71(__assign({ 'onClick': {} }, { size: "small", color: "danger", fill: "outline", disabled: (__VLS_ctx.blockBusy[inv.id]) })));
        var __VLS_73 = __VLS_72.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "small", color: "danger", fill: "outline", disabled: (__VLS_ctx.blockBusy[inv.id]) })], __VLS_functionalComponentArgsRest(__VLS_72), false));
        var __VLS_75 = void 0;
        var __VLS_76 = void 0;
        var __VLS_77 = void 0;
        var __VLS_78 = {
            onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.activeInvitations.length > 0))
                    return;
                __VLS_ctx.blockInv(inv.id, inv.inviter_user_id);
            }
        };
        __VLS_74.slots.default;
        (__VLS_ctx.blockBusy[inv.id] ? 'Blocking…' : 'Block');
    };
    var __VLS_58, __VLS_66, __VLS_74;
    for (var _j = 0, _k = __VLS_getVForSourceType((__VLS_ctx.activeInvitations)); _j < _k.length; _j++) {
        var inv = _k[_j][0];
        _loop_2(inv);
    }
}
if (__VLS_ctx.ignoredInvitations.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)(__assign({ class: "settings-subsection__heading" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)(__assign({ class: "settings-inv-list" }));
    var _loop_3 = function (inv) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)(__assign({ key: (inv.id) }, { class: "settings-inv-row" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "settings-inv-info" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "settings-inv-title" }));
        (inv.path_title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "settings-inv-meta" }));
        (__VLS_ctx.formatDate(inv.updated_at));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "settings-inv-actions" }));
        var __VLS_79 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79(__assign({ 'onClick': {} }, { size: "small", color: "success", disabled: (__VLS_ctx.invBusy[inv.id]) })));
        var __VLS_81 = __VLS_80.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "small", color: "success", disabled: (__VLS_ctx.invBusy[inv.id]) })], __VLS_functionalComponentArgsRest(__VLS_80), false));
        var __VLS_83 = void 0;
        var __VLS_84 = void 0;
        var __VLS_85 = void 0;
        var __VLS_86 = {
            onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.ignoredInvitations.length > 0))
                    return;
                __VLS_ctx.acceptInv(inv.id);
            }
        };
        __VLS_82.slots.default;
        (__VLS_ctx.invBusy[inv.id] ? 'Accepting…' : 'Accept');
        var __VLS_87 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87(__assign({ 'onClick': {} }, { size: "small", color: "danger", fill: "outline", disabled: (__VLS_ctx.blockBusy[inv.id]) })));
        var __VLS_89 = __VLS_88.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "small", color: "danger", fill: "outline", disabled: (__VLS_ctx.blockBusy[inv.id]) })], __VLS_functionalComponentArgsRest(__VLS_88), false));
        var __VLS_91 = void 0;
        var __VLS_92 = void 0;
        var __VLS_93 = void 0;
        var __VLS_94 = {
            onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.ignoredInvitations.length > 0))
                    return;
                __VLS_ctx.blockInv(inv.id, inv.inviter_user_id);
            }
        };
        __VLS_90.slots.default;
        (__VLS_ctx.blockBusy[inv.id] ? 'Blocking…' : 'Block');
    };
    var __VLS_82, __VLS_90;
    for (var _l = 0, _m = __VLS_getVForSourceType((__VLS_ctx.ignoredInvitations)); _l < _m.length; _l++) {
        var inv = _m[_l][0];
        _loop_3(inv);
    }
}
if (__VLS_ctx.blocklist.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)(__assign({ class: "settings-subsection__heading" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)(__assign({ class: "settings-inv-list" }));
    var _loop_4 = function (entry) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)(__assign({ key: (entry.id) }, { class: "settings-inv-row" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "settings-inv-info" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "settings-inv-title" }));
        (entry.blocked_user_id);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "settings-inv-meta" }));
        (__VLS_ctx.formatDate(entry.created_at));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "settings-inv-actions" }));
        var __VLS_95 = {}.IonButton;
        /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
        // @ts-ignore
        var __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95(__assign({ 'onClick': {} }, { size: "small", color: "danger", fill: "outline", disabled: (__VLS_ctx.unblockBusy[entry.blocked_user_id]) })));
        var __VLS_97 = __VLS_96.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { size: "small", color: "danger", fill: "outline", disabled: (__VLS_ctx.unblockBusy[entry.blocked_user_id]) })], __VLS_functionalComponentArgsRest(__VLS_96), false));
        var __VLS_99 = void 0;
        var __VLS_100 = void 0;
        var __VLS_101 = void 0;
        var __VLS_102 = {
            onClick: function () {
                var _a = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    _a[_i] = arguments[_i];
                }
                var $event = _a[0];
                if (!(__VLS_ctx.blocklist.length > 0))
                    return;
                __VLS_ctx.unblock(entry.blocked_user_id);
            }
        };
        __VLS_98.slots.default;
        (__VLS_ctx.unblockBusy[entry.blocked_user_id]
            ? 'Unblocking…'
            : 'Unblock');
    };
    var __VLS_98;
    for (var _o = 0, _p = __VLS_getVForSourceType((__VLS_ctx.blocklist)); _o < _p.length; _o++) {
        var entry = _p[_o][0];
        _loop_4(entry);
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "settings-rule" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)(__assign({ class: "settings-section" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)(__assign({ class: "settings-section__heading" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)(__assign({ class: "settings-subsection__heading" }));
if (__VLS_ctx.pathsError) {
    /** @type {[typeof AppErrorBanner, ]} */ ;
    // @ts-ignore
    var __VLS_103 = __VLS_asFunctionalComponent(AppErrorBanner_vue_1.default, new AppErrorBanner_vue_1.default({
        message: (__VLS_ctx.pathsErrorMsg),
    }));
    var __VLS_104 = __VLS_103.apply(void 0, __spreadArray([{
            message: (__VLS_ctx.pathsErrorMsg),
        }], __VLS_functionalComponentArgsRest(__VLS_103), false));
}
if (__VLS_ctx.paths !== undefined && __VLS_ctx.paths.length === 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "settings-empty__text" }));
}
else {
    var __VLS_106 = {}.Suspense;
    /** @type {[typeof __VLS_components.Suspense, typeof __VLS_components.Suspense, ]} */ ;
    // @ts-ignore
    var __VLS_107 = __VLS_asFunctionalComponent(__VLS_106, new __VLS_106({}));
    var __VLS_108 = __VLS_107.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_107), false));
    __VLS_109.slots.default;
    {
        var __VLS_thisSlot = __VLS_109.slots.default;
        if (((_a = __VLS_ctx.paths) !== null && _a !== void 0 ? _a : []).length > 0) {
            /** @type {[typeof ExportCard, ]} */ ;
            // @ts-ignore
            var __VLS_110 = __VLS_asFunctionalComponent(ExportCard_vue_1.default, new ExportCard_vue_1.default({
                paths: ((_b = __VLS_ctx.paths) !== null && _b !== void 0 ? _b : []),
            }));
            var __VLS_111 = __VLS_110.apply(void 0, __spreadArray([{
                    paths: ((_c = __VLS_ctx.paths) !== null && _c !== void 0 ? _c : []),
                }], __VLS_functionalComponentArgsRest(__VLS_110), false));
        }
    }
    {
        var __VLS_thisSlot = __VLS_109.slots.fallback;
        /** @type {[typeof AppSpinner, ]} */ ;
        // @ts-ignore
        var __VLS_113 = __VLS_asFunctionalComponent(AppSpinner_vue_1.default, new AppSpinner_vue_1.default({
            label: "Loading export…",
            size: "small",
        }));
        var __VLS_114 = __VLS_113.apply(void 0, __spreadArray([{
                label: "Loading export…",
                size: "small",
            }], __VLS_functionalComponentArgsRest(__VLS_113), false));
    }
    var __VLS_109;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "settings-rule settings-rule--light" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)(__assign({ class: "settings-subsection__heading" }));
if (__VLS_ctx.existingRequest) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "settings-deletion-status" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "settings-deletion-status__text" }));
    (__VLS_ctx.formatDate(__VLS_ctx.existingRequest.created_at));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.existingRequest.state);
    if (__VLS_ctx.existingRequest.error_message) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "settings-deletion-status__error" }));
        (__VLS_ctx.existingRequest.error_message);
    }
    if (__VLS_ctx.existingRequest.state === 'failed') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "settings-hint" }));
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "settings-delete-notice" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "settings-delete-notice__text" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)(__assign({ class: "settings-delete-notice__list" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "settings-hint" }));
if (!__VLS_ctx.existingRequest || __VLS_ctx.existingRequest.state === 'failed') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "settings-delete-confirm" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "settings-delete-confirm__instructions" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    (__VLS_ctx.confirmHint);
    var __VLS_116 = {}.IonItem;
    /** @type {[typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, ]} */ ;
    // @ts-ignore
    var __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116(__assign({ class: "settings-confirm-field" })));
    var __VLS_118 = __VLS_117.apply(void 0, __spreadArray([__assign({ class: "settings-confirm-field" })], __VLS_functionalComponentArgsRest(__VLS_117), false));
    __VLS_119.slots.default;
    var __VLS_120 = {}.IonLabel;
    /** @type {[typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, ]} */ ;
    // @ts-ignore
    var __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
        position: "stacked",
    }));
    var __VLS_122 = __VLS_121.apply(void 0, __spreadArray([{
            position: "stacked",
        }], __VLS_functionalComponentArgsRest(__VLS_121), false));
    __VLS_123.slots.default;
    var __VLS_123;
    var __VLS_124 = {}.IonInput;
    /** @type {[typeof __VLS_components.IonInput, typeof __VLS_components.ionInput, ]} */ ;
    // @ts-ignore
    var __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
        modelValue: (__VLS_ctx.confirmText),
        placeholder: (__VLS_ctx.confirmHint),
        autocomplete: "off",
        autocorrect: "off",
        spellcheck: (false),
    }));
    var __VLS_126 = __VLS_125.apply(void 0, __spreadArray([{
            modelValue: (__VLS_ctx.confirmText),
            placeholder: (__VLS_ctx.confirmHint),
            autocomplete: "off",
            autocorrect: "off",
            spellcheck: (false),
        }], __VLS_functionalComponentArgsRest(__VLS_125), false));
    var __VLS_119;
    var __VLS_128 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128(__assign({ 'onClick': {} }, { expand: "block", color: "danger", disabled: (!__VLS_ctx.confirmMatches || __VLS_ctx.submitting) })));
    var __VLS_130 = __VLS_129.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { expand: "block", color: "danger", disabled: (!__VLS_ctx.confirmMatches || __VLS_ctx.submitting) })], __VLS_functionalComponentArgsRest(__VLS_129), false));
    var __VLS_132 = void 0;
    var __VLS_133 = void 0;
    var __VLS_134 = void 0;
    var __VLS_135 = {
        onClick: (__VLS_ctx.submitDeletion)
    };
    __VLS_131.slots.default;
    (__VLS_ctx.submitting ? 'Requesting deletion…' : 'Request account deletion');
    var __VLS_131;
}
var __VLS_28;
var __VLS_136 = {}.IonFooter;
/** @type {[typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, ]} */ ;
// @ts-ignore
var __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({}));
var __VLS_138 = __VLS_137.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_137), false));
__VLS_139.slots.default;
/** @type {[typeof RefreshStatus, ]} */ ;
// @ts-ignore
var __VLS_140 = __VLS_asFunctionalComponent(RefreshStatus_vue_1.default, new RefreshStatus_vue_1.default({
    statusType: (__VLS_ctx.refreshStatusType),
    statusText: (__VLS_ctx.refreshStatusText),
    lastCheckedAt: (__VLS_ctx.refreshLastCheckedAt),
}));
var __VLS_141 = __VLS_140.apply(void 0, __spreadArray([{
        statusType: (__VLS_ctx.refreshStatusType),
        statusText: (__VLS_ctx.refreshStatusText),
        lastCheckedAt: (__VLS_ctx.refreshLastCheckedAt),
    }], __VLS_functionalComponentArgsRest(__VLS_140), false));
var __VLS_139;
if (__VLS_ctx.sharingPath) {
    /** @type {[typeof PathShareModal, ]} */ ;
    // @ts-ignore
    var __VLS_143 = __VLS_asFunctionalComponent(PathShareModal_vue_1.default, new PathShareModal_vue_1.default(__assign({ 'onDidDismiss': {} }, { isOpen: (!!__VLS_ctx.sharingPath), path: (__VLS_ctx.sharingPath) })));
    var __VLS_144 = __VLS_143.apply(void 0, __spreadArray([__assign({ 'onDidDismiss': {} }, { isOpen: (!!__VLS_ctx.sharingPath), path: (__VLS_ctx.sharingPath) })], __VLS_functionalComponentArgsRest(__VLS_143), false));
    var __VLS_146 = void 0;
    var __VLS_147 = void 0;
    var __VLS_148 = void 0;
    var __VLS_149 = {
        onDidDismiss: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.sharingPath))
                return;
            __VLS_ctx.sharingPath = null;
        }
    };
    var __VLS_145;
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['settings-content']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section__heading']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-empty__text']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-path-list']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-path-row']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-path-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-path-name']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-path-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-add-path-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-rule']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section__heading']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-empty__text']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-subsection__heading']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-inv-list']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-inv-row']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-inv-info']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-inv-title']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-inv-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-inv-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-inv-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-subsection__heading']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-inv-list']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-inv-row']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-inv-info']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-inv-title']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-inv-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-inv-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-subsection__heading']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-inv-list']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-inv-row']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-inv-info']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-inv-title']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-inv-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-inv-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-rule']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-section__heading']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-subsection__heading']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-empty__text']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-rule']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-rule--light']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-subsection__heading']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-deletion-status']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-deletion-status__text']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-deletion-status__error']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-delete-notice']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-delete-notice__text']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-delete-notice__list']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-delete-confirm']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-delete-confirm__instructions']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-confirm-field']} */ ;
var __VLS_dollars;
var __VLS_self = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {
            IonPage: vue_1.IonPage,
            IonHeader: vue_1.IonHeader,
            IonToolbar: vue_1.IonToolbar,
            IonTitle: vue_1.IonTitle,
            IonContent: vue_1.IonContent,
            IonFooter: vue_1.IonFooter,
            IonButtons: vue_1.IonButtons,
            IonBackButton: vue_1.IonBackButton,
            IonButton: vue_1.IonButton,
            IonItem: vue_1.IonItem,
            IonLabel: vue_1.IonLabel,
            IonInput: vue_1.IonInput,
            AppErrorBanner: AppErrorBanner_vue_1.default,
            AppSpinner: AppSpinner_vue_1.default,
            ExportCard: ExportCard_vue_1.default,
            RefreshStatus: RefreshStatus_vue_1.default,
            PathShareModal: PathShareModal_vue_1.default,
            paths: paths,
            pathsError: pathsError,
            pathsErrorMsg: pathsErrorMsg,
            sharingPath: sharingPath,
            openShare: openShare,
            invitationsError: invitationsError,
            invitationsErrorMsg: invitationsErrorMsg,
            loadError: loadError,
            activeInvitations: activeInvitations,
            ignoredInvitations: ignoredInvitations,
            blocklist: blocklist,
            invBusy: invBusy,
            blockBusy: blockBusy,
            unblockBusy: unblockBusy,
            acceptInv: acceptInv,
            ignoreInv: ignoreInv,
            blockInv: blockInv,
            unblock: unblock,
            existingRequest: existingRequest,
            confirmHint: confirmHint,
            confirmText: confirmText,
            confirmMatches: confirmMatches,
            submitting: submitting,
            submitDeletion: submitDeletion,
            refreshStatusType: refreshStatusType,
            refreshStatusText: refreshStatusText,
            refreshLastCheckedAt: refreshLastCheckedAt,
            formatDate: formatDate,
        };
    },
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
