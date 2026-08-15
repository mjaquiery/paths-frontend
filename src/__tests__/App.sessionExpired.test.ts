/**
 * A 401 anywhere used to just look like the app was broken — no indication the user was
 * logged out, nothing to explain it. customFetch (lib/customFetch.ts) now clears the
 * stored session and flags lib/authSession.ts's sessionExpired on a 401; these tests
 * confirm App.vue reacts to that flag by showing a toast and returning to the logged-out
 * view, rather than leaving the broken-looking page up with no explanation.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { IonicVue } from '@ionic/vue';
import { createRouter, createMemoryHistory } from '@ionic/vue-router';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { ref } from 'vue';

vi.mock('../composables/useInstallBanner', () => ({
  useInstallBanner: () => ({
    deferredPrompt: ref(null),
    promptInstall: vi.fn(),
    dismissInstall: vi.fn(),
  }),
}));

vi.mock('../composables/useVirtualKeyboard', () => ({
  useVirtualKeyboard: vi.fn(),
}));

import App from '../App.vue';
import { sessionExpired } from '../lib/authSession';

let activeWrapper: ReturnType<typeof mount> | undefined;

function mountApp() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>home</div>' } },
      { path: '/settings', component: { template: '<div>settings</div>' } },
    ],
  });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = mount(App, {
    attachTo: document.body,
    global: { plugins: [IonicVue, [VueQueryPlugin, { queryClient }], router] },
  });
  activeWrapper = wrapper;
  return wrapper.vm.$nextTick().then(() => ({ router, wrapper }));
}

describe('App — session expired', () => {
  beforeEach(() => {
    sessionExpired.value = false;
  });

  afterEach(() => {
    sessionExpired.value = false;
    activeWrapper?.unmount();
    activeWrapper = undefined;
  });

  it('sends the user back to "/" and surfaces a toast when the session expires', async () => {
    const { router } = await mountApp();
    await router.push('/settings');
    await flushPromises();
    expect(router.currentRoute.value.path).toBe('/settings');

    sessionExpired.value = true;
    await flushPromises();

    expect(router.currentRoute.value.path).toBe('/');
  });

  it('resets sessionExpired once the toast is dismissed', async () => {
    const { wrapper } = await mountApp();
    sessionExpired.value = true;
    await flushPromises();

    const toast = wrapper
      .findAll('ion-toast')
      .map((t) => t.element)
      .find((el) =>
        (el as unknown as { message?: string }).message?.includes(
          'Session expired',
        ),
      );
    expect(toast).toBeDefined();
    toast!.dispatchEvent(new CustomEvent('didDismiss'));
    await flushPromises();

    expect(sessionExpired.value).toBe(false);
  });
});
