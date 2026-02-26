<template>
  <div class="debug-panel">
    <details @toggle="onOuterToggle">
      <summary class="debug-panel__title">
        🛠 Debug Panel
        <button
          type="button"
          class="debug-panel__refresh"
          @click.stop="refresh"
        >
          Refresh
        </button>
      </summary>

      <template v-if="isOpen">
        <p v-if="loadError" class="debug-error">⚠ {{ loadError }}</p>

        <details class="debug-panel__section" open>
          <summary>Auth State</summary>
          <template v-if="currentUser">
            <div class="debug-auth-row">
              <span class="debug-auth-label">user_id:</span>
              <code>{{ currentUser.user_id }}</code>
            </div>
            <div class="debug-auth-row">
              <span class="debug-auth-label">display_name:</span>
              <code>{{ currentUser.display_name ?? '(none)' }}</code>
            </div>
            <div class="debug-auth-row">
              <span class="debug-auth-label">token:</span>
              <code class="debug-token">{{
                currentUser.token ? '✓ present' : '✗ missing'
              }}</code>
            </div>
          </template>
          <p v-else class="debug-empty">
            Not logged in (no user in localStorage).
          </p>
        </details>

        <details class="debug-panel__section">
          <summary>Vue Query Cache ({{ queryEntries.length }} queries)</summary>
          <div v-for="q in queryEntries" :key="q.queryHash" class="debug-entry">
            <details>
              <summary>
                <code>{{ JSON.stringify(q.queryKey) }}</code>
                <span
                  class="debug-badge"
                  :class="`debug-badge--${q.state.status}`"
                  >{{ q.state.status }}</span
                >
              </summary>
              <pre>{{ JSON.stringify(q.state, null, 2) }}</pre>
            </details>
          </div>
          <p v-if="queryEntries.length === 0" class="debug-empty">
            No queries in cache.
          </p>
        </details>

        <details class="debug-panel__section">
          <summary>
            Mutation Cache ({{ mutationEntries.length }} mutations)
          </summary>
          <div v-for="(m, i) in mutationEntries" :key="i" class="debug-entry">
            <details>
              <summary>
                <code>{{ JSON.stringify(m.options.mutationKey ?? []) }}</code>
                <span
                  class="debug-badge"
                  :class="`debug-badge--${m.state.status}`"
                  >{{ m.state.status }}</span
                >
              </summary>
              <pre>{{ JSON.stringify(m.state, null, 2) }}</pre>
            </details>
          </div>
          <p v-if="mutationEntries.length === 0" class="debug-empty">
            No mutations recorded.
          </p>
        </details>

        <details class="debug-panel__section">
          <summary>
            IndexedDB – pathPreferences ({{ db.pathPreferences.length }})
          </summary>
          <pre>{{ JSON.stringify(db.pathPreferences, null, 2) }}</pre>
          <p v-if="db.pathPreferences.length === 0" class="debug-empty">
            Empty.
          </p>
        </details>

        <details class="debug-panel__section">
          <summary>
            IndexedDB – entryContent ({{ db.entryContent.length }})
          </summary>
          <pre>{{ JSON.stringify(db.entryContent, null, 2) }}</pre>
          <p v-if="db.entryContent.length === 0" class="debug-empty">Empty.</p>
        </details>

        <details class="debug-panel__section">
          <summary>
            IndexedDB – entryImages ({{ db.entryImages.length }})
          </summary>
          <pre>{{ JSON.stringify(db.entryImages, null, 2) }}</pre>
          <p v-if="db.entryImages.length === 0" class="debug-empty">Empty.</p>
        </details>

        <details class="debug-panel__section">
          <summary>
            IndexedDB – queryCache (raw, {{ db.queryCache.length }} rows)
          </summary>
          <pre>{{ JSON.stringify(db.queryCache, null, 2) }}</pre>
          <p v-if="db.queryCache.length === 0" class="debug-empty">Empty.</p>
        </details>

        <details class="debug-panel__section">
          <summary>localStorage</summary>
          <pre>{{ JSON.stringify(localStorageEntries, null, 2) }}</pre>
          <p v-if="localStorageEntries.length === 0" class="debug-empty">
            Empty.
          </p>
        </details>
      </template>
    </details>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { db as dexieDb } from '../lib/db';
import type { OAuthCallbackResponse } from '../generated/types';

const queryClient = useQueryClient();

interface DbSnapshot {
  pathPreferences: unknown[];
  entryContent: unknown[];
  entryImages: unknown[];
  queryCache: unknown[];
}

interface QueryEntry {
  queryKey: unknown;
  queryHash: string;
  state: { status: string; [key: string]: unknown };
}

interface MutationEntry {
  options: { mutationKey?: unknown[] };
  state: { status: string; [key: string]: unknown };
}

const isOpen = ref(false);
const loadError = ref<string | null>(null);

const db = ref<DbSnapshot>({
  pathPreferences: [],
  entryContent: [],
  entryImages: [],
  queryCache: [],
});

const localStorageEntries = ref<{ key: string; value: unknown }[]>([]);
const queryEntries = ref<QueryEntry[]>([]);
const mutationEntries = ref<MutationEntry[]>([]);

const currentUser = computed<OAuthCallbackResponse | null>(() => {
  const entry = localStorageEntries.value.find((e) => e.key === 'user');
  if (!entry) return null;
  const val = entry.value;
  if (
    val &&
    typeof val === 'object' &&
    'user_id' in val &&
    typeof (val as Record<string, unknown>).user_id === 'string'
  ) {
    return val as OAuthCallbackResponse;
  }
  return null;
});

function syncQueryEntries() {
  queryEntries.value = queryClient
    .getQueryCache()
    .getAll()
    .map((q) => ({
      queryKey: q.queryKey,
      queryHash: q.queryHash,
      state: q.state as { status: string; [key: string]: unknown },
    }));
}

function syncMutationEntries() {
  mutationEntries.value = queryClient
    .getMutationCache()
    .getAll()
    .map((m) => ({
      options: {
        mutationKey: m.options.mutationKey as unknown[] | undefined,
      },
      state: m.state as { status: string; [key: string]: unknown },
    }));
}

let unsubscribeQuery: (() => void) | null = null;
let unsubscribeMutation: (() => void) | null = null;

async function loadDb() {
  const [pathPreferences, entryContent, entryImages, queryCache] =
    await Promise.all([
      dexieDb.pathPreferences.toArray(),
      dexieDb.entryContent.toArray(),
      dexieDb.entryImages.toArray(),
      dexieDb.queryCache.toArray(),
    ]);
  db.value = { pathPreferences, entryContent, entryImages, queryCache };
}

function loadLocalStorage() {
  const entries: { key: string; value: unknown }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key === null) continue;
    let value: unknown = localStorage.getItem(key);
    try {
      value = JSON.parse(value as string);
    } catch {
      // leave as raw string
    }
    entries.push({ key, value });
  }
  localStorageEntries.value = entries;
}

async function refresh() {
  loadError.value = null;
  try {
    await loadDb();
    loadLocalStorage();
    syncQueryEntries();
    syncMutationEntries();
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : String(err);
  }
}

function onOuterToggle(event: Event) {
  isOpen.value = (event.currentTarget as HTMLDetailsElement).open;
  if (isOpen.value) {
    unsubscribeQuery = queryClient.getQueryCache().subscribe(() => {
      syncQueryEntries();
    });
    unsubscribeMutation = queryClient.getMutationCache().subscribe(() => {
      syncMutationEntries();
      loadLocalStorage();
    });
    void refresh();
  } else {
    unsubscribeQuery?.();
    unsubscribeQuery = null;
    unsubscribeMutation?.();
    unsubscribeMutation = null;
  }
}

onMounted(() => {
  syncQueryEntries();
  syncMutationEntries();
  loadLocalStorage();
});

onUnmounted(() => {
  unsubscribeQuery?.();
  unsubscribeMutation?.();
});
</script>

<style scoped>
.debug-panel {
  margin: 24px 0;
  border: 2px dashed #e57373;
  border-radius: 6px;
  background: var(--ion-color-light, #f4f5f8);
  font-family: monospace;
  font-size: 12px;
}

.debug-panel > details > summary.debug-panel__title {
  cursor: pointer;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: bold;
  color: #b71c1c;
  display: flex;
  align-items: center;
  gap: 12px;
  list-style: none;
}

.debug-panel__refresh {
  font-size: 12px;
  padding: 2px 8px;
  cursor: pointer;
  border: 1px solid #b71c1c;
  border-radius: 4px;
  background: transparent;
  color: #b71c1c;
}

.debug-panel__refresh:hover {
  background: #b71c1c;
  color: white;
}

.debug-panel__section {
  border-top: 1px solid #ffcdd2;
  padding: 6px 12px;
}

.debug-panel__section > summary {
  cursor: pointer;
  padding: 4px 0;
  font-weight: 600;
}

pre {
  overflow: auto;
  max-height: 300px;
  background: #fff8f8;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ffcdd2;
  white-space: pre-wrap;
  word-break: break-all;
}

.debug-entry {
  margin: 4px 0;
}

.debug-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
  color: white;
}

.debug-badge--success {
  background: #4caf50;
}

.debug-badge--pending {
  background: #ff9800;
}

.debug-badge--error {
  background: #f44336;
}

.debug-empty {
  color: #999;
  font-style: italic;
}

.debug-error {
  color: #b71c1c;
  font-weight: bold;
  padding: 4px 12px;
}

.debug-auth-row {
  display: flex;
  gap: 8px;
  padding: 2px 0;
  align-items: baseline;
}

.debug-auth-label {
  color: #666;
  min-width: 100px;
}

.debug-token {
  color: #4caf50;
}
</style>
