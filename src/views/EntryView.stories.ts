import type { Meta, StoryObj } from '@storybook/vue3-vite';

import EntryView from './EntryView.vue';

const meta: Meta<typeof EntryView> = {
  title: 'Views/EntryView',
  component: EntryView,
};

export default meta;

type Story = StoryObj<typeof EntryView>;

export const Default: Story = {};
