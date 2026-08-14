import type { Meta, StoryObj } from '@storybook/vue3';
import { defineComponent, h } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';

import App from './App.vue';
import { router } from '../.storybook/router';

const meta: Meta<typeof App> = {
  title: 'Pages/App Shell',
  component: App,
};

export default meta;

type Story = StoryObj<typeof App>;

export const Default: Story = {};

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
