/**
 * A 401 anywhere used to just look like the app was broken — a toast flashed for a few
 * seconds, covering whatever buttons were on screen, then the app force-navigated back to
 * "/" with no way to log back in from the toast itself and no memory of where the user had
 * been. customFetch (lib/customFetch.ts) flags lib/authSession.ts's sessionExpired on a 401;
 * these tests confirm App.vue reacts to that flag by opening a persistent, non-timing-out
 * SessionExpiredBanner on top of the current page (instead of navigating away or auto-hiding),
 * and that tapping the banner opens a login modal the user can freely dismiss — dismissing it
 * only hides the modal, since only a real login clears the underlying expired-session state.
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
import SessionExpiredBanner from '../components/SessionExpiredBanner.vue';
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

  it('shows the session-expired banner without navigating away from the current page', async () => {
    const { router } = await mountApp();
    await router.push('/settings');
    await flushPromises();
    expect(router.currentRoute.value.path).toBe('/settings');

    sessionExpired.value = true;
    await flushPromises();

    // Stays on "/settings" — the banner surfaces on top instead of forcing a redirect,
    // so whatever the user was doing is still there once they log back in.
    expect(router.currentRoute.value.path).toBe('/settings');
    const banner = activeWrapper!.findComponent(SessionExpiredBanner);
    expect(banner.props('visible')).toBe(true);
  });

  it('does not open the login modal just because the banner is visible', async () => {
    await mountApp();
    sessionExpired.value = true;
    await flushPromises();

    const modal = activeWrapper!.findComponent(SessionExpiredModal);
    expect(modal.props('isOpen')).toBe(false);
  });

  it('opens the login modal when the banner is tapped, offering a way back in', async () => {
    await mountApp();
    sessionExpired.value = true;
    await flushPromises();

    const banner = activeWrapper!.findComponent(SessionExpiredBanner);
    banner.vm.$emit('login');
    await flushPromises();

    const modal = activeWrapper!.findComponent(SessionExpiredModal);
    expect(modal.props('isOpen')).toBe(true);
    const button = activeWrapper!
      .findAll('button')
      .find((b) => b.text().includes('Continue with Google'));
    expect(button).toBeDefined();
  });

  it('dismissing the modal only hides it — the banner and sessionExpired stay put', async () => {
    await mountApp();
    sessionExpired.value = true;
    await flushPromises();

    activeWrapper!.findComponent(SessionExpiredBanner).vm.$emit('login');
    await flushPromises();

    const modal = activeWrapper!.findComponent(SessionExpiredModal);
    modal.vm.$emit('dismiss');
    await flushPromises();

    expect(
      activeWrapper!.findComponent(SessionExpiredModal).props('isOpen'),
    ).toBe(false);
    expect(sessionExpired.value).toBe(true);
    expect(
      activeWrapper!.findComponent(SessionExpiredBanner).props('visible'),
    ).toBe(true);
  });
});
