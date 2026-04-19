<template>
  <div class="path-color-bar" :style="barStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  color?: string;
}>();

const barStyle = computed(() => ({
  '--path-color': props.color ?? 'var(--ion-color-primary)',
}));
</script>

<style scoped>
.path-color-bar {
  border-left: 2px solid var(--path-color, var(--ion-color-primary));
  padding-left: calc(var(--page-margin) - 2px);
}
</style>
