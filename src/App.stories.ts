import type { Meta, StoryObj } from '@storybook/vue3';
import { defineComponent, h } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import App from './App.vue';
import { router } from '../.storybook/router';
import { sessionExpired } from './lib/authSession';

const meta: Meta<typeof App> = {
  title: 'Pages/App Shell',
  component: App,
  decorators: [
    // sessionExpired is module-level state (see lib/authSession.ts), so it persists
    // across stories unless reset here before each one mounts.
    (story) => ({
      components: { story },
      setup() {
        sessionExpired.value = false;
      },
      template: '<story />',
    }),
  ],
};

export default meta;

type Story = StoryObj<typeof App>;

export const Default: Story = {};

export const SessionExpiredBannerVisible: Story = {
  play: async ({ canvasElement }) => {
    sessionExpired.value = true;
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('Session expired — tap to log in'),
    ).toBeInTheDocument();
    // The modal is opt-in — it must not appear just because the banner did.
    await expect(
      screen.queryByText('Continue with Google'),
    ).not.toBeInTheDocument();
  },
};

export const SessionExpiredModalOpensFromBanner: Story = {
  play: async ({ canvasElement }) => {
    sessionExpired.value = true;
    const canvas = within(canvasElement);
    const banner = await canvas.findByText('Session expired — tap to log in');
    await userEvent.click(banner);

    // ion-modal teleports its content to document.body, so it's found via
    // the global `screen` rather than canvasElement (same as PathDeleteModal).
    await waitFor(() =>
      expect(screen.getByText('Continue with Google')).toBeInTheDocument(),
    );
  },
};

export const InstallPromptVisible: Story = {
  play: async () => {
    const installEvent = Object.assign(new Event('beforeinstallprompt'), {
      prompt: async () => {},
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    });
    window.dispatchEvent(installEvent);
  },
};

// Real page content (not the empty stub the other routes use), so this story
// can show the shell scrolling behind the fixed footer instead of under it.
// Every real page has at least one focusable element (a back link, an edit
// button, ...) — mirror that here rather than the content being bare text,
// which would otherwise make the scrollable region unreachable by keyboard.
const ScrollDemoPage = defineComponent({
  name: 'ScrollDemoPage',
  render() {
    return h(IonPage, null, () =>
      h(IonContent, { class: 'ion-padding' }, () => [
        h('button', { onClick: () => router.back() }, '← Back'),
        ...Array.from({ length: 40 }, (_, i) =>
          h('p', { key: i }, `Line ${i + 1}/40 of scrollable page content.`),
        ),
      ]),
    );
  },
});
router.addRoute({ path: '/story-scroll-demo', component: ScrollDemoPage });

export const ScrollingContentStaysUnderTheFooter: Story = {
  play: async () => {
    await router.push('/story-scroll-demo');
  },
};
