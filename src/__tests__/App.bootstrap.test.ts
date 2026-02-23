/**
 * Bootstrap smoke test: verifies the app mounts correctly using @ionic/vue-router.
 *
 * The bug this catches: if router.ts imports createRouter from plain 'vue-router'
 * instead of '@ionic/vue-router', the ionic router context ("navManager") is never
 * provided. Any Ionic component that calls useIonRouter() or getCurrentRouteInfo()
 * will then crash with "can't access property getCurrentRouteInfo, u is undefined".
 */
import { describe, it, expect, afterEach } from 'vitest';
import { createApp, defineComponent, inject } from 'vue';
import { IonicVue } from '@ionic/vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import router from '../router';

describe('App bootstrap', () => {
  let app: ReturnType<typeof createApp> | null = null;
  let el: HTMLDivElement | null = null;

  afterEach(() => {
    app?.unmount();
    el?.remove();
    app = null;
    el = null;
  });

  it('provides the ionic router context (navManager) so the homepage loads without errors', async () => {
    let navManager: unknown;

    const Probe = defineComponent({
      setup() {
        // This is the same inject key used internally by IonRouterOutlet and
        // useIonRouter(). It is undefined when using plain vue-router, which
        // causes the "getCurrentRouteInfo" crash at app startup.
        navManager = inject('navManager');
        return () => null;
      },
    });

    app = createApp(Probe);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    app.use(IonicVue).use(VueQueryPlugin, { queryClient }).use(router);
    await router.isReady();

    el = document.createElement('div');
    document.body.appendChild(el);

    // If router.ts uses plain vue-router, mounting throws because ionic
    // components cannot find "navManager" and crash when accessing
    // getCurrentRouteInfo on the undefined value.
    expect(() => app!.mount(el!)).not.toThrow();

    // Verify the ionic router context is properly set up.
    expect(navManager).toBeDefined();
    const manager = navManager as { getCurrentRouteInfo: unknown };
    expect(typeof manager.getCurrentRouteInfo).toBe('function');
  });
});
