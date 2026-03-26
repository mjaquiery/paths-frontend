import type { Meta, StoryObj } from '@storybook/vue3-vite';

import EntryCreateView from './EntryCreateView.vue';

const meta: Meta<typeof EntryCreateView> = {
  title: 'Views/EntryCreateView',
  component: EntryCreateView,
};

export default meta;

type Story = StoryObj<typeof EntryCreateView>;

export const Default: Story = {};
