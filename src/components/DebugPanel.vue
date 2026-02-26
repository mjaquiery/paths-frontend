<template>
  <div class="debug-panel">
    <details>
      <summary class="debug-panel__title">
        🛠 Debug Panel
        <button class="debug-panel__refresh" @click.stop="refresh">
          Refresh
        </button>
      </summary>

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
          IndexedDB – pathPreferences ({{ db.pathPreferences.length }})
        </summary>
        <pre>{{ JSON.stringify(db.pathPreferences, null, 2) }}</pre>
        <p v-if="db.pathPreferences.length === 0" class="debug-empty">Empty.</p>
      </details>

      <details class="debug-panel__section">
        <summary>
          IndexedDB – entryContent ({{ db.entryContent.length }})
        </summary>
        <pre>{{ JSON.stringify(db.entryContent, null, 2) }}</pre>
        <p v-if="db.entryContent.length === 0" class="debug-empty">Empty.</p>
      </details>

      <details class="debug-panel__section">
        <summary>IndexedDB – entryImages ({{ db.entryImages.length }})</summary>
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
    </details>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { db as dexieDb } from '../lib/db';

const queryClient = useQueryClient();

interface DbSnapshot {
  pathPreferences: unknown[];
  entryContent: unknown[];
  entryImages: unknown[];
  queryCache: unknown[];
}

const db = ref<DbSnapshot>({
  pathPreferences: [],
  entryContent: [],
  entryImages: [],
  queryCache: [],
});

const localStorageEntries = ref<{ key: string; value: unknown }[]>([]);

const queryEntries = computed(() =>
  queryClient
    .getQueryCache()
    .getAll()
    .map((q) => ({
      queryKey: q.queryKey,
      queryHash: q.queryHash,
      state: q.state,
    })),
);

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
  await loadDb();
  loadLocalStorage();
}

onMounted(refresh);
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
</style>
