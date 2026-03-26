import type { Meta, StoryObj } from '@storybook/vue3-vite';

import EntryEditView from './EntryEditView.vue';

const meta: Meta<typeof EntryEditView> = {
  title: 'Views/EntryEditView',
  component: EntryEditView,
};

export default meta;

type Story = StoryObj<typeof EntryEditView>;

export const Default: Story = {};
