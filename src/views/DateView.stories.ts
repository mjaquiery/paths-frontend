import type { Meta, StoryObj } from '@storybook/vue3-vite';

import DateView from './DateView.vue';

const meta: Meta<typeof DateView> = {
  title: 'Views/DateView',
  component: DateView,
};

export default meta;

type Story = StoryObj<typeof DateView>;

export const Default: Story = {};
