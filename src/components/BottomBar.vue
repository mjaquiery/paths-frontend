<template>
  <div class="bottom-bar df-ui">
    <router-link class="bottom-bar-icon" :aria-label="altLabel" :to="altTo">
      {{ altIcon }}
    </router-link>
    <router-link
      v-if="hasPaths && canCreate"
      class="bottom-bar-cta"
      :to="{ path: '/entry/new', query: writeEntryQuery }"
    >
      + Write Entry
    </router-link>
    <button
      v-else-if="!hasPaths"
      type="button"
      class="bottom-bar-cta"
      @click="showCreatePath = true"
    >
      + Create Path
    </button>
    <router-link class="bottom-bar-icon" aria-label="Settings" to="/settings">
      ⚙️
    </router-link>
  </div>

  <PathFormModal
    :is-open="showCreatePath"
    :path="null"
    @dismiss="showCreatePath = false"
    @saved="showCreatePath = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import PathFormModal from './PathFormModal.vue';

defineProps<{
  altIcon: string;
  altLabel: string;
  altTo: string;
  canCreate: boolean;
  hasPaths: boolean;
  writeEntryQuery: { day: string; pathId?: string };
}>();

const showCreatePath = ref(false);
</script>

<style scoped>
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: var(--app-footer-clearance, 3rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem var(--page-margin, 0.75rem);
  background: var(--color-paper);
  border-top: 1px solid var(--color-rule);
  z-index: var(--ion-z-index-overlay, 999);
}

.bottom-bar-icon {
  display: inline-block;
  text-decoration: none;
  color: inherit;
  font-size: 1.3rem;
  padding: 0.3rem;
}

.bottom-bar-cta {
  display: inline-block;
  border: none;
  text-decoration: none;
  background: var(--color-ink);
  color: var(--color-paper);
  border-radius: 999px;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.65rem 1.5rem;
  cursor: pointer;
}
</style>
