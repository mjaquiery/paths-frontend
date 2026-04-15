import { registerSW } from 'virtual:pwa-register';

export default defineNuxtPlugin(() => {
  // Boot the service worker immediately; it will auto-update in the background.
  registerSW({ immediate: true });
});
