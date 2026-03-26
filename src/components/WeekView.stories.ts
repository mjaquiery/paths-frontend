import type { Meta, StoryObj } from '@storybook/vue3-vite';

import WeekView from './WeekView.vue';

const meta: Meta<typeof WeekView> = {
  title: 'Components/WeekView',
  component: WeekView,
  args: {
    visiblePaths: [],
    pathEntries: [],
    canCreate: false,
    currentUserId: '',
  },
};

export default meta;

type Story = StoryObj<typeof WeekView>;

export const Default: Story = {};
