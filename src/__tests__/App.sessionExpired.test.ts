/**
 * A 401 anywhere used to just look like the app was broken — a toast flashed for a few
 * seconds, covering whatever buttons were on screen, then the app force-navigated back to
 * "/" with no way to log back in from the toast itself and no memory of where the user had
 * been. customFetch (lib/customFetch.ts) flags lib/authSession.ts's sessionExpired on a 401;
 * these tests confirm App.vue reacts to that flag by opening a persistent SessionExpiredModal
 * on top of the current page (instead of navigating away), and that the modal offers a way to
 * log back in.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { IonicVue } from '@ionic/vue';
import { createRouter, createMemoryHistory } from '@ionic/vue-router';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { ref } from 'vue';

// ion-modal's real present() animation reaches for matchMedia, which jsdom doesn't
// implement — stub it so opening SessionExpiredModal doesn't throw in these tests.
vi.stubGlobal(
  'matchMedia',
  vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
);

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
import SessionExpiredModal from '../components/SessionExpiredModal.vue';
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

  it('opens the session-expired modal without navigating away from the current page', async () => {
    const { router } = await mountApp();
    await router.push('/settings');
    await flushPromises();
    expect(router.currentRoute.value.path).toBe('/settings');

    sessionExpired.value = true;
    await flushPromises();

    // Stays on "/settings" — the modal surfaces on top instead of forcing a redirect,
    // so whatever the user was doing is still there once they log back in.
    expect(router.currentRoute.value.path).toBe('/settings');
    const modal = activeWrapper!.findComponent(SessionExpiredModal);
    expect(modal.props('isOpen')).toBe(true);
  });

  it('offers a "Continue with Google" way back in on the modal', async () => {
    await mountApp();
    sessionExpired.value = true;
    await flushPromises();

    const button = activeWrapper!
      .findAll('button')
      .find((b) => b.text().includes('Continue with Google'));
    expect(button).toBeDefined();
  });

  it('resets sessionExpired once the modal is dismissed', async () => {
    await mountApp();
    sessionExpired.value = true;
    await flushPromises();

    const modal = activeWrapper!.findComponent(SessionExpiredModal);
    modal.vm.$emit('dismiss');
    await flushPromises();

    expect(sessionExpired.value).toBe(false);
  });
});
