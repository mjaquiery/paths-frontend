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
Object.defineProperty(exports, "__esModule", { value: true });
<template>
  <ion-page>
    <!-- ── Header ── -->
    <ion-header>
      <ion-toolbar>
        <!-- Logo -->
        <ion-thumbnail slot="start" class="header-logo">
          <img src="/favicon.svg" alt="Paths logo" />
        </ion-thumbnail>
        <ion-title>Paths</ion-title>
        <ion-buttons slot="end">
          <!-- Welcome name (logged-in only) -->
          <ion-label
            v-if="currentUser"
            class="ion-padding-end header-user-name"
          >
            {{ currentUser.display_name || currentUser.user_id }}
          </ion-label>

          <!-- Hamburger menu button -->
          <ion-button
            id="hamburger-trigger"
            :aria-label="'Open menu'"
            @click="menuOpen = true"
          >
            ☰
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <!-- ── Hamburger popover ── -->
    <ion-popover
      :is-open="menuOpen"
      trigger="hamburger-trigger"
      trigger-action="click"
      :dismiss-on-select="true"
      @did-dismiss="menuOpen = false"
    >
      <ion-list lines="none">
        <ion-item
          button
          :detail="false"
          router-link="/paths/new"
          router-direction="forward"
          @click="menuOpen = false"
        >
          + New Path
        </ion-item>
        <ion-item
          button
          :detail="false"
          router-link="/settings"
          router-direction="forward"
          @click="menuOpen = false"
        >
          Settings
        </ion-item>
        <ion-item-divider />
        <ion-item
          button
          :detail="false"
          @click="
            toggleDarkMode();
            menuOpen = false;
          "
        >
          {{ darkPreference === 'system' ? '🖥️' : isDark ? '☀️' : '🌙' }}
          {{ darkModeLabel }}
        </ion-item>
        <ion-item
          v-if="currentUser"
          button
          :detail="false"
          @click="
            logout();
            menuOpen = false;
          "
        >
          Logout
        </ion-item>
        <ion-item
          v-else
          button
          :detail="false"
          :disabled="loggingIn"
          @click="
            loginWithGoogle();
            menuOpen = false;
          "
        >
          {{ loggingIn ? 'Redirecting…' : 'Login with Google' }}
        </ion-item>
      </ion-list>
    </ion-popover>

    <!-- ── Paths selector bar (logged-in only) ── -->
    <PathsSelectorBar
      v-if="currentUser"
      :current-user="currentUser"
      @paths-changed="onPathsChanged"
    />

    <!-- ── Main content ── -->
    <ion-content class="ion-padding-horizontal">
      <ion-text v-if="pathsError" color="danger" class="view-error-banner">
        {{ pathsErrorMessage }}
      </ion-text>

      <!-- Login error (shown only when not logged in) -->
      <ion-text
        v-if="loginError && !currentUser"
        color="danger"
        class="view-error-banner"
      >
        {{ loginError }}
      </ion-text>

      <!-- Previously on this day -->
      <OnThisDaySpotlight
        v-if="effectiveVisiblePaths.length > 0"
        :visible-paths="effectiveVisiblePaths"
        :path-entries="multiPathEntries"
      />

      <!-- Primary week view -->
      <WeekView
        :visible-paths="effectiveVisiblePaths"
        :path-entries="multiPathEntries"
        :can-create="canCreateAny"
        :current-user-id="currentUser ? currentUser.user_id : ''"
        @entry-created="onEntryCreated"
      />

      <!-- No paths: prompt to create one -->
      <div v-if="currentUser && !canCreateAny" class="no-paths-cta">
        <p class="no-paths-hint">You have no paths yet.</p>
        <ion-button
          expand="block"
          router-link="/paths/new"
          router-direction="forward"
        >
          + Create a Path
        </ion-button>
      </div>

      <!-- Fallback: not logged in -->
      <div v-if="!currentUser" class="home-welcome">
        <div class="welcome-logo-wrap">
          <img src="/favicon.svg" alt="Paths logo" class="welcome-logo" />
          <h1 class="welcome-app-name">Paths</h1>
          <p class="welcome-tagline">
            A private journal across multiple streams of life.
          </p>
        </div>
        <ion-card class="welcome-card">
          <ion-card-content>
            <ul class="welcome-features">
              <li>
                Write daily entries across separate paths — Daily Life,
                Projects, Travel, anything.
              </li>
              <li>
                Revisit past years. The same date, one year ago, five years ago.
              </li>
              <li>
                Share one path with someone special, keep the rest private.
              </li>
            </ul>
            <ion-button
              expand="block"
              :disabled="loggingIn"
              class="welcome-login-btn"
              @click="loginWithGoogle"
            >
              {{ loggingIn ? 'Redirecting…' : 'Continue with Google' }}
            </ion-button>
            <p v-if="loginError" class="welcome-error">{{ loginError }}</p>
            <p class="welcome-note">
              Your data stays yours. Export or delete any time.
            </p>
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
definePageMeta({
  pageTransition: { name: 'ion-back', mode: 'out-in' },
});
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
  IonButton,
  IonButtons,
  IonLabel,
  IonText,
  IonThumbnail,
  IonCard,
  IonCardContent,
  IonPopover,
  IonList,
  IonItem,
  IonItemDivider,
} from '@ionic/vue';
import { ref, computed } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';

import PathsSelectorBar from '~/src/components/PathsSelectorBar.vue';
import OnThisDaySpotlight from '~/src/components/OnThisDaySpotlight.vue';
import WeekView from '~/src/components/WeekView.vue';
import RefreshStatus from '~/src/components/RefreshStatus.vue';
import type {
  PathResponse,
  OAuthCallbackResponse,
  OAuthLoginResponse,
} from '~/src/generated/types';
import { authLogin } from '~/src/generated/apiClient';
import { useMultiPathEntries } from '~/src/composables/useMultiPathEntries';
import { usePaths } from '~/src/composables/usePaths';
import { useDarkMode } from '~/src/composables/useDarkMode';
import { useRefreshStatus } from '~/src/composables/useRefreshStatus';
import { extractErrorMessage } from '~/src/lib/errors';

const {
  isDark,
  preference: darkPreference,
  toggle: toggleDarkMode,
} = useDarkMode();

const {
  statusType: refreshStatusType,
  statusText: refreshStatusText,
  lastCheckedAt: refreshLastCheckedAt,
} = useRefreshStatus();

const darkModeLabel = computed(() => {
  if (darkPreference.value === 'light') return 'Light mode – switch to dark';
  if (darkPreference.value === 'dark') return 'Dark mode – switch to system';
  return 'System mode – switch to light';
});

const loggingIn = ref(false);
const loginError = ref('');
const menuOpen = ref(false);
const currentUser = ref<OAuthCallbackResponse | null>(getStoredUser());
const queryClient = useQueryClient();

/** Ordered, visible paths managed by PathsSelectorBar */
const visiblePaths = ref<PathResponse[]>([]);
const { data: allPaths, error: pathsError } = usePaths();
const hasReceivedPathSelection = ref(false);
const pathsErrorMessage = computed(
  () =>
    extractErrorMessage(pathsError.value) ?? 'Unable to load paths right now.',
);

const effectiveVisiblePaths = computed(() => {
  if (!currentUser.value) return [];
  if (!hasReceivedPathSelection.value) {
    return allPaths.value ?? [];
  }
  return visiblePaths.value;
});

const visiblePathIds = computed(() =>
  effectiveVisiblePaths.value.map((p) => p.path_id),
);
const multiPathEntries = useMultiPathEntries(visiblePathIds);

const canCreateAny = computed(
  () =>
    !!currentUser.value &&
    effectiveVisiblePaths.value.some(
      (p) => p.owner_user_id === currentUser.value!.user_id,
    ),
);

function getStoredUser(): OAuthCallbackResponse | null {
  const stored = localStorage.getItem('user');
  if (!stored) return null;
  try {
    return JSON.parse(stored) as OAuthCallbackResponse;
  } catch {
    localStorage.removeItem('user');
    localStorage.removeItem('session_token');
    return null;
  }
}

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

function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('session_token');
  currentUser.value = null;
  visiblePaths.value = [];
  hasReceivedPathSelection.value = false;
}

function onEntryCreated() {
  // Invalidate all path-entry queries so the week view refreshes immediately
  void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
}

function onPathsChanged(paths: PathResponse[]) {
  visiblePaths.value = paths;
  hasReceivedPathSelection.value = true;
}
</script>

<style scoped>
.header-logo {
  --size: 36px;
  margin: 0 4px 0 8px;
}

.header-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.header-user-name {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.view-error-banner {
  display: block;
  margin: 16px 0;
  font-size: 0.9rem;
}

.no-paths-cta {
  margin: 24px 0 8px;
  text-align: center;
}

.no-paths-hint {
  color: var(--ion-color-medium);
  font-size: 0.9rem;
  margin: 0 0 12px;
}

.home-welcome {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.welcome-logo-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.welcome-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 12px;
}

.welcome-app-name {
  font-size: 2rem;
  font-weight: 700;
  color: var(--ion-color-primary);
  margin: 0 0 6px;
  letter-spacing: -0.5px;
}

.welcome-tagline {
  font-size: 0.95rem;
  color: var(--ion-color-medium);
  text-align: center;
  max-width: 280px;
  line-height: 1.5;
  margin: 0;
}

.welcome-card {
  width: 100%;
  max-width: 420px;
}

.welcome-features {
  margin: 0 0 20px 16px;
  padding: 0;
  color: var(--ion-color-dark);
  font-size: 0.9rem;
  line-height: 1.6;
}

.welcome-features li {
  margin-bottom: 8px;
}

.welcome-login-btn {
  margin-bottom: 8px;
}

.welcome-error {
  color: var(--ion-color-danger);
  font-size: 0.85rem;
  text-align: center;
}

.welcome-note {
  font-size: 0.78rem;
  color: var(--ion-color-medium);
  text-align: center;
  margin: 8px 0 0;
}
</style>
/// <reference types="../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />

definePageMeta({
    pageTransition: { name: 'ion-back', mode: 'out-in' },
});
var vue_1 = require("@ionic/vue");
var vue_2 = require("vue");
var vue_query_1 = require("@tanstack/vue-query");
var PathsSelectorBar_vue_1 = require("~/src/components/PathsSelectorBar.vue");
var OnThisDaySpotlight_vue_1 = require("~/src/components/OnThisDaySpotlight.vue");
var WeekView_vue_1 = require("~/src/components/WeekView.vue");
var RefreshStatus_vue_1 = require("~/src/components/RefreshStatus.vue");
var apiClient_1 = require("~/src/generated/apiClient");
var useMultiPathEntries_1 = require("~/src/composables/useMultiPathEntries");
var usePaths_1 = require("~/src/composables/usePaths");
var useDarkMode_1 = require("~/src/composables/useDarkMode");
var useRefreshStatus_1 = require("~/src/composables/useRefreshStatus");
var errors_1 = require("~/src/lib/errors");
var _a = (0, useDarkMode_1.useDarkMode)(), isDark = _a.isDark, darkPreference = _a.preference, toggleDarkMode = _a.toggle;
var _b = (0, useRefreshStatus_1.useRefreshStatus)(), refreshStatusType = _b.statusType, refreshStatusText = _b.statusText, refreshLastCheckedAt = _b.lastCheckedAt;
var darkModeLabel = (0, vue_2.computed)(function () {
    if (darkPreference.value === 'light')
        return 'Light mode – switch to dark';
    if (darkPreference.value === 'dark')
        return 'Dark mode – switch to system';
    return 'System mode – switch to light';
});
var loggingIn = (0, vue_2.ref)(false);
var loginError = (0, vue_2.ref)('');
var menuOpen = (0, vue_2.ref)(false);
var currentUser = (0, vue_2.ref)(getStoredUser());
var queryClient = (0, vue_query_1.useQueryClient)();
/** Ordered, visible paths managed by PathsSelectorBar */
var visiblePaths = (0, vue_2.ref)([]);
var _c = (0, usePaths_1.usePaths)(), allPaths = _c.data, pathsError = _c.error;
var hasReceivedPathSelection = (0, vue_2.ref)(false);
var pathsErrorMessage = (0, vue_2.computed)(function () { var _a; return (_a = (0, errors_1.extractErrorMessage)(pathsError.value)) !== null && _a !== void 0 ? _a : 'Unable to load paths right now.'; });
var effectiveVisiblePaths = (0, vue_2.computed)(function () {
    var _a;
    if (!currentUser.value)
        return [];
    if (!hasReceivedPathSelection.value) {
        return (_a = allPaths.value) !== null && _a !== void 0 ? _a : [];
    }
    return visiblePaths.value;
});
var visiblePathIds = (0, vue_2.computed)(function () {
    return effectiveVisiblePaths.value.map(function (p) { return p.path_id; });
});
var multiPathEntries = (0, useMultiPathEntries_1.useMultiPathEntries)(visiblePathIds);
var canCreateAny = (0, vue_2.computed)(function () {
    return !!currentUser.value &&
        effectiveVisiblePaths.value.some(function (p) { return p.owner_user_id === currentUser.value.user_id; });
});
function getStoredUser() {
    var stored = localStorage.getItem('user');
    if (!stored)
        return null;
    try {
        return JSON.parse(stored);
    }
    catch (_a) {
        localStorage.removeItem('user');
        localStorage.removeItem('session_token');
        return null;
    }
}
function loginWithGoogle() {
    return __awaiter(this, void 0, void 0, function () {
        var callbackUri, result, loginData, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    loggingIn.value = true;
                    loginError.value = '';
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    callbackUri = "".concat(window.location.origin, "/auth/callback");
                    return [4 /*yield*/, (0, apiClient_1.authLogin)({ callback_uri: callbackUri })];
                case 2:
                    result = _b.sent();
                    loginData = result.data;
                    if (loginData === null || loginData === void 0 ? void 0 : loginData.authorization_url) {
                        window.location.href = loginData.authorization_url;
                    }
                    else {
                        loginError.value = 'Could not start login. Please try again.';
                        loggingIn.value = false;
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    loginError.value = 'Could not start login. Please try again.';
                    loggingIn.value = false;
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('session_token');
    currentUser.value = null;
    visiblePaths.value = [];
    hasReceivedPathSelection.value = false;
}
function onEntryCreated() {
    // Invalidate all path-entry queries so the week view refreshes immediately
    void queryClient.invalidateQueries({ queryKey: ['v1', 'paths'] });
}
function onPathsChanged(paths) {
    visiblePaths.value = paths;
    hasReceivedPathSelection.value = true;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
/** @type {__VLS_StyleScopedClasses['header-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-features']} */ ;
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
var __VLS_13 = {}.IonThumbnail;
/** @type {[typeof __VLS_components.IonThumbnail, typeof __VLS_components.ionThumbnail, typeof __VLS_components.IonThumbnail, typeof __VLS_components.ionThumbnail, ]} */ ;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13(__assign({ slot: "start" }, { class: "header-logo" })));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ slot: "start" }, { class: "header-logo" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
__VLS_16.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    src: "/favicon.svg",
    alt: "Paths logo",
});
var __VLS_16;
var __VLS_17 = {}.IonTitle;
/** @type {[typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, typeof __VLS_components.IonTitle, typeof __VLS_components.ionTitle, ]} */ ;
// @ts-ignore
var __VLS_18 = __VLS_asFunctionalComponent(__VLS_17, new __VLS_17({}));
var __VLS_19 = __VLS_18.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_18), false));
__VLS_20.slots.default;
var __VLS_20;
var __VLS_21 = {}.IonButtons;
/** @type {[typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, typeof __VLS_components.IonButtons, typeof __VLS_components.ionButtons, ]} */ ;
// @ts-ignore
var __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({
    slot: "end",
}));
var __VLS_23 = __VLS_22.apply(void 0, __spreadArray([{
        slot: "end",
    }], __VLS_functionalComponentArgsRest(__VLS_22), false));
__VLS_24.slots.default;
if (__VLS_ctx.currentUser) {
    var __VLS_25 = {}.IonLabel;
    /** @type {[typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, typeof __VLS_components.IonLabel, typeof __VLS_components.ionLabel, ]} */ ;
    // @ts-ignore
    var __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25(__assign({ class: "ion-padding-end header-user-name" })));
    var __VLS_27 = __VLS_26.apply(void 0, __spreadArray([__assign({ class: "ion-padding-end header-user-name" })], __VLS_functionalComponentArgsRest(__VLS_26), false));
    __VLS_28.slots.default;
    (__VLS_ctx.currentUser.display_name || __VLS_ctx.currentUser.user_id);
    var __VLS_28;
}
var __VLS_29 = {}.IonButton;
/** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
// @ts-ignore
var __VLS_30 = __VLS_asFunctionalComponent(__VLS_29, new __VLS_29(__assign({ 'onClick': {} }, { id: "hamburger-trigger", 'aria-label': ('Open menu') })));
var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { id: "hamburger-trigger", 'aria-label': ('Open menu') })], __VLS_functionalComponentArgsRest(__VLS_30), false));
var __VLS_33;
var __VLS_34;
var __VLS_35;
var __VLS_36 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.menuOpen = true;
    }
};
__VLS_32.slots.default;
var __VLS_32;
var __VLS_24;
var __VLS_12;
var __VLS_8;
var __VLS_37 = {}.IonPopover;
/** @type {[typeof __VLS_components.IonPopover, typeof __VLS_components.ionPopover, typeof __VLS_components.IonPopover, typeof __VLS_components.ionPopover, ]} */ ;
// @ts-ignore
var __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37(__assign({ 'onDidDismiss': {} }, { isOpen: (__VLS_ctx.menuOpen), trigger: "hamburger-trigger", triggerAction: "click", dismissOnSelect: (true) })));
var __VLS_39 = __VLS_38.apply(void 0, __spreadArray([__assign({ 'onDidDismiss': {} }, { isOpen: (__VLS_ctx.menuOpen), trigger: "hamburger-trigger", triggerAction: "click", dismissOnSelect: (true) })], __VLS_functionalComponentArgsRest(__VLS_38), false));
var __VLS_41;
var __VLS_42;
var __VLS_43;
var __VLS_44 = {
    onDidDismiss: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.menuOpen = false;
    }
};
__VLS_40.slots.default;
var __VLS_45 = {}.IonList;
/** @type {[typeof __VLS_components.IonList, typeof __VLS_components.ionList, typeof __VLS_components.IonList, typeof __VLS_components.ionList, ]} */ ;
// @ts-ignore
var __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({
    lines: "none",
}));
var __VLS_47 = __VLS_46.apply(void 0, __spreadArray([{
        lines: "none",
    }], __VLS_functionalComponentArgsRest(__VLS_46), false));
__VLS_48.slots.default;
var __VLS_49 = {}.IonItem;
/** @type {[typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, ]} */ ;
// @ts-ignore
var __VLS_50 = __VLS_asFunctionalComponent(__VLS_49, new __VLS_49(__assign({ 'onClick': {} }, { button: true, detail: (false), routerLink: "/paths/new", routerDirection: "forward" })));
var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { button: true, detail: (false), routerLink: "/paths/new", routerDirection: "forward" })], __VLS_functionalComponentArgsRest(__VLS_50), false));
var __VLS_53;
var __VLS_54;
var __VLS_55;
var __VLS_56 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.menuOpen = false;
    }
};
__VLS_52.slots.default;
var __VLS_52;
var __VLS_57 = {}.IonItem;
/** @type {[typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, ]} */ ;
// @ts-ignore
var __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57(__assign({ 'onClick': {} }, { button: true, detail: (false), routerLink: "/settings", routerDirection: "forward" })));
var __VLS_59 = __VLS_58.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { button: true, detail: (false), routerLink: "/settings", routerDirection: "forward" })], __VLS_functionalComponentArgsRest(__VLS_58), false));
var __VLS_61;
var __VLS_62;
var __VLS_63;
var __VLS_64 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.menuOpen = false;
    }
};
__VLS_60.slots.default;
var __VLS_60;
var __VLS_65 = {}.IonItemDivider;
/** @type {[typeof __VLS_components.IonItemDivider, typeof __VLS_components.ionItemDivider, ]} */ ;
// @ts-ignore
var __VLS_66 = __VLS_asFunctionalComponent(__VLS_65, new __VLS_65({}));
var __VLS_67 = __VLS_66.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_66), false));
var __VLS_69 = {}.IonItem;
/** @type {[typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, ]} */ ;
// @ts-ignore
var __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69(__assign({ 'onClick': {} }, { button: true, detail: (false) })));
var __VLS_71 = __VLS_70.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { button: true, detail: (false) })], __VLS_functionalComponentArgsRest(__VLS_70), false));
var __VLS_73;
var __VLS_74;
var __VLS_75;
var __VLS_76 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.toggleDarkMode();
        __VLS_ctx.menuOpen = false;
        ;
    }
};
__VLS_72.slots.default;
(__VLS_ctx.darkPreference === 'system' ? '🖥️' : __VLS_ctx.isDark ? '☀️' : '🌙');
(__VLS_ctx.darkModeLabel);
var __VLS_72;
if (__VLS_ctx.currentUser) {
    var __VLS_77 = {}.IonItem;
    /** @type {[typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, ]} */ ;
    // @ts-ignore
    var __VLS_78 = __VLS_asFunctionalComponent(__VLS_77, new __VLS_77(__assign({ 'onClick': {} }, { button: true, detail: (false) })));
    var __VLS_79 = __VLS_78.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { button: true, detail: (false) })], __VLS_functionalComponentArgsRest(__VLS_78), false));
    var __VLS_81 = void 0;
    var __VLS_82 = void 0;
    var __VLS_83 = void 0;
    var __VLS_84 = {
        onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.currentUser))
                return;
            __VLS_ctx.logout();
            __VLS_ctx.menuOpen = false;
            ;
        }
    };
    __VLS_80.slots.default;
    var __VLS_80;
}
else {
    var __VLS_85 = {}.IonItem;
    /** @type {[typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, typeof __VLS_components.IonItem, typeof __VLS_components.ionItem, ]} */ ;
    // @ts-ignore
    var __VLS_86 = __VLS_asFunctionalComponent(__VLS_85, new __VLS_85(__assign({ 'onClick': {} }, { button: true, detail: (false), disabled: (__VLS_ctx.loggingIn) })));
    var __VLS_87 = __VLS_86.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { button: true, detail: (false), disabled: (__VLS_ctx.loggingIn) })], __VLS_functionalComponentArgsRest(__VLS_86), false));
    var __VLS_89 = void 0;
    var __VLS_90 = void 0;
    var __VLS_91 = void 0;
    var __VLS_92 = {
        onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!!(__VLS_ctx.currentUser))
                return;
            __VLS_ctx.loginWithGoogle();
            __VLS_ctx.menuOpen = false;
            ;
        }
    };
    __VLS_88.slots.default;
    (__VLS_ctx.loggingIn ? 'Redirecting…' : 'Login with Google');
    var __VLS_88;
}
var __VLS_48;
var __VLS_40;
if (__VLS_ctx.currentUser) {
    /** @type {[typeof PathsSelectorBar, ]} */ ;
    // @ts-ignore
    var __VLS_93 = __VLS_asFunctionalComponent(PathsSelectorBar_vue_1.default, new PathsSelectorBar_vue_1.default(__assign({ 'onPathsChanged': {} }, { currentUser: (__VLS_ctx.currentUser) })));
    var __VLS_94 = __VLS_93.apply(void 0, __spreadArray([__assign({ 'onPathsChanged': {} }, { currentUser: (__VLS_ctx.currentUser) })], __VLS_functionalComponentArgsRest(__VLS_93), false));
    var __VLS_96 = void 0;
    var __VLS_97 = void 0;
    var __VLS_98 = void 0;
    var __VLS_99 = {
        onPathsChanged: (__VLS_ctx.onPathsChanged)
    };
    var __VLS_95;
}
var __VLS_100 = {}.IonContent;
/** @type {[typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, typeof __VLS_components.IonContent, typeof __VLS_components.ionContent, ]} */ ;
// @ts-ignore
var __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100(__assign({ class: "ion-padding-horizontal" })));
var __VLS_102 = __VLS_101.apply(void 0, __spreadArray([__assign({ class: "ion-padding-horizontal" })], __VLS_functionalComponentArgsRest(__VLS_101), false));
__VLS_103.slots.default;
if (__VLS_ctx.pathsError) {
    var __VLS_104 = {}.IonText;
    /** @type {[typeof __VLS_components.IonText, typeof __VLS_components.ionText, typeof __VLS_components.IonText, typeof __VLS_components.ionText, ]} */ ;
    // @ts-ignore
    var __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104(__assign({ color: "danger" }, { class: "view-error-banner" })));
    var __VLS_106 = __VLS_105.apply(void 0, __spreadArray([__assign({ color: "danger" }, { class: "view-error-banner" })], __VLS_functionalComponentArgsRest(__VLS_105), false));
    __VLS_107.slots.default;
    (__VLS_ctx.pathsErrorMessage);
    var __VLS_107;
}
if (__VLS_ctx.loginError && !__VLS_ctx.currentUser) {
    var __VLS_108 = {}.IonText;
    /** @type {[typeof __VLS_components.IonText, typeof __VLS_components.ionText, typeof __VLS_components.IonText, typeof __VLS_components.ionText, ]} */ ;
    // @ts-ignore
    var __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108(__assign({ color: "danger" }, { class: "view-error-banner" })));
    var __VLS_110 = __VLS_109.apply(void 0, __spreadArray([__assign({ color: "danger" }, { class: "view-error-banner" })], __VLS_functionalComponentArgsRest(__VLS_109), false));
    __VLS_111.slots.default;
    (__VLS_ctx.loginError);
    var __VLS_111;
}
if (__VLS_ctx.effectiveVisiblePaths.length > 0) {
    /** @type {[typeof OnThisDaySpotlight, ]} */ ;
    // @ts-ignore
    var __VLS_112 = __VLS_asFunctionalComponent(OnThisDaySpotlight_vue_1.default, new OnThisDaySpotlight_vue_1.default({
        visiblePaths: (__VLS_ctx.effectiveVisiblePaths),
        pathEntries: (__VLS_ctx.multiPathEntries),
    }));
    var __VLS_113 = __VLS_112.apply(void 0, __spreadArray([{
            visiblePaths: (__VLS_ctx.effectiveVisiblePaths),
            pathEntries: (__VLS_ctx.multiPathEntries),
        }], __VLS_functionalComponentArgsRest(__VLS_112), false));
}
/** @type {[typeof WeekView, ]} */ ;
// @ts-ignore
var __VLS_115 = __VLS_asFunctionalComponent(WeekView_vue_1.default, new WeekView_vue_1.default(__assign({ 'onEntryCreated': {} }, { visiblePaths: (__VLS_ctx.effectiveVisiblePaths), pathEntries: (__VLS_ctx.multiPathEntries), canCreate: (__VLS_ctx.canCreateAny), currentUserId: (__VLS_ctx.currentUser ? __VLS_ctx.currentUser.user_id : '') })));
var __VLS_116 = __VLS_115.apply(void 0, __spreadArray([__assign({ 'onEntryCreated': {} }, { visiblePaths: (__VLS_ctx.effectiveVisiblePaths), pathEntries: (__VLS_ctx.multiPathEntries), canCreate: (__VLS_ctx.canCreateAny), currentUserId: (__VLS_ctx.currentUser ? __VLS_ctx.currentUser.user_id : '') })], __VLS_functionalComponentArgsRest(__VLS_115), false));
var __VLS_118;
var __VLS_119;
var __VLS_120;
var __VLS_121 = {
    onEntryCreated: (__VLS_ctx.onEntryCreated)
};
var __VLS_117;
if (__VLS_ctx.currentUser && !__VLS_ctx.canCreateAny) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "no-paths-cta" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "no-paths-hint" }));
    var __VLS_122 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_123 = __VLS_asFunctionalComponent(__VLS_122, new __VLS_122({
        expand: "block",
        routerLink: "/paths/new",
        routerDirection: "forward",
    }));
    var __VLS_124 = __VLS_123.apply(void 0, __spreadArray([{
            expand: "block",
            routerLink: "/paths/new",
            routerDirection: "forward",
        }], __VLS_functionalComponentArgsRest(__VLS_123), false));
    __VLS_125.slots.default;
    var __VLS_125;
}
if (!__VLS_ctx.currentUser) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "home-welcome" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "welcome-logo-wrap" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)(__assign({ src: "/favicon.svg", alt: "Paths logo" }, { class: "welcome-logo" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)(__assign({ class: "welcome-app-name" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "welcome-tagline" }));
    var __VLS_126 = {}.IonCard;
    /** @type {[typeof __VLS_components.IonCard, typeof __VLS_components.ionCard, typeof __VLS_components.IonCard, typeof __VLS_components.ionCard, ]} */ ;
    // @ts-ignore
    var __VLS_127 = __VLS_asFunctionalComponent(__VLS_126, new __VLS_126(__assign({ class: "welcome-card" })));
    var __VLS_128 = __VLS_127.apply(void 0, __spreadArray([__assign({ class: "welcome-card" })], __VLS_functionalComponentArgsRest(__VLS_127), false));
    __VLS_129.slots.default;
    var __VLS_130 = {}.IonCardContent;
    /** @type {[typeof __VLS_components.IonCardContent, typeof __VLS_components.ionCardContent, typeof __VLS_components.IonCardContent, typeof __VLS_components.ionCardContent, ]} */ ;
    // @ts-ignore
    var __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({}));
    var __VLS_132 = __VLS_131.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_131), false));
    __VLS_133.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)(__assign({ class: "welcome-features" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
    var __VLS_134 = {}.IonButton;
    /** @type {[typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, typeof __VLS_components.IonButton, typeof __VLS_components.ionButton, ]} */ ;
    // @ts-ignore
    var __VLS_135 = __VLS_asFunctionalComponent(__VLS_134, new __VLS_134(__assign(__assign({ 'onClick': {} }, { expand: "block", disabled: (__VLS_ctx.loggingIn) }), { class: "welcome-login-btn" })));
    var __VLS_136 = __VLS_135.apply(void 0, __spreadArray([__assign(__assign({ 'onClick': {} }, { expand: "block", disabled: (__VLS_ctx.loggingIn) }), { class: "welcome-login-btn" })], __VLS_functionalComponentArgsRest(__VLS_135), false));
    var __VLS_138 = void 0;
    var __VLS_139 = void 0;
    var __VLS_140 = void 0;
    var __VLS_141 = {
        onClick: (__VLS_ctx.loginWithGoogle)
    };
    __VLS_137.slots.default;
    (__VLS_ctx.loggingIn ? 'Redirecting…' : 'Continue with Google');
    var __VLS_137;
    if (__VLS_ctx.loginError) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "welcome-error" }));
        (__VLS_ctx.loginError);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)(__assign({ class: "welcome-note" }));
    var __VLS_133;
    var __VLS_129;
}
var __VLS_103;
var __VLS_142 = {}.IonFooter;
/** @type {[typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, typeof __VLS_components.IonFooter, typeof __VLS_components.ionFooter, ]} */ ;
// @ts-ignore
var __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({}));
var __VLS_144 = __VLS_143.apply(void 0, __spreadArray([{}], __VLS_functionalComponentArgsRest(__VLS_143), false));
__VLS_145.slots.default;
/** @type {[typeof RefreshStatus, ]} */ ;
// @ts-ignore
var __VLS_146 = __VLS_asFunctionalComponent(RefreshStatus_vue_1.default, new RefreshStatus_vue_1.default({
    statusType: (__VLS_ctx.refreshStatusType),
    statusText: (__VLS_ctx.refreshStatusText),
    lastCheckedAt: (__VLS_ctx.refreshLastCheckedAt),
}));
var __VLS_147 = __VLS_146.apply(void 0, __spreadArray([{
        statusType: (__VLS_ctx.refreshStatusType),
        statusText: (__VLS_ctx.refreshStatusText),
        lastCheckedAt: (__VLS_ctx.refreshLastCheckedAt),
    }], __VLS_functionalComponentArgsRest(__VLS_146), false));
var __VLS_145;
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['header-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['ion-padding-end']} */ ;
/** @type {__VLS_StyleScopedClasses['header-user-name']} */ ;
/** @type {__VLS_StyleScopedClasses['ion-padding-horizontal']} */ ;
/** @type {__VLS_StyleScopedClasses['view-error-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['view-error-banner']} */ ;
/** @type {__VLS_StyleScopedClasses['no-paths-cta']} */ ;
/** @type {__VLS_StyleScopedClasses['no-paths-hint']} */ ;
/** @type {__VLS_StyleScopedClasses['home-welcome']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-logo-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-logo']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-app-name']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-tagline']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-card']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-features']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-login-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-error']} */ ;
/** @type {__VLS_StyleScopedClasses['welcome-note']} */ ;
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
            IonButton: vue_1.IonButton,
            IonButtons: vue_1.IonButtons,
            IonLabel: vue_1.IonLabel,
            IonText: vue_1.IonText,
            IonThumbnail: vue_1.IonThumbnail,
            IonCard: vue_1.IonCard,
            IonCardContent: vue_1.IonCardContent,
            IonPopover: vue_1.IonPopover,
            IonList: vue_1.IonList,
            IonItem: vue_1.IonItem,
            IonItemDivider: vue_1.IonItemDivider,
            PathsSelectorBar: PathsSelectorBar_vue_1.default,
            OnThisDaySpotlight: OnThisDaySpotlight_vue_1.default,
            WeekView: WeekView_vue_1.default,
            RefreshStatus: RefreshStatus_vue_1.default,
            isDark: isDark,
            darkPreference: darkPreference,
            toggleDarkMode: toggleDarkMode,
            refreshStatusType: refreshStatusType,
            refreshStatusText: refreshStatusText,
            refreshLastCheckedAt: refreshLastCheckedAt,
            darkModeLabel: darkModeLabel,
            loggingIn: loggingIn,
            loginError: loginError,
            menuOpen: menuOpen,
            currentUser: currentUser,
            pathsError: pathsError,
            pathsErrorMessage: pathsErrorMessage,
            effectiveVisiblePaths: effectiveVisiblePaths,
            multiPathEntries: multiPathEntries,
            canCreateAny: canCreateAny,
            loginWithGoogle: loginWithGoogle,
            logout: logout,
            onEntryCreated: onEntryCreated,
            onPathsChanged: onPathsChanged,
        };
    },
});
exports.default = (await Promise.resolve().then(function () { return require('vue'); })).defineComponent({
    setup: function () {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
