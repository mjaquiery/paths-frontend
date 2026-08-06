<template><div /></template>

<script setup lang="ts">
// Export now lives in Settings; redirect old bookmarks/links.
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
onMounted(() => router.replace('/settings'));
</script>
