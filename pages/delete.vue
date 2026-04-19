<script setup lang="ts">
definePageMeta({
  pageTransition: { name: 'ion-forward', mode: 'out-in' },
});
await navigateTo('/settings', { redirectCode: 301 });
</script>
