export default defineNuxtPlugin(async () => {
  // Only start MSW in development or test mode.
  if (
    import.meta.env.MODE !== 'development' &&
    import.meta.env.MODE !== 'test'
  ) {
    return;
  }

  // The MSW browser worker module is added in Stage 6 (Storybook / MSW setup).
  // Until then this plugin is intentionally inert.
});
