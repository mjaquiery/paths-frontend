import type { Meta, StoryObj } from '@storybook/vue3-vite';

import PathView from './PathView.vue';

const meta: Meta<typeof PathView> = {
  title: 'Views/PathView',
  component: PathView,
};

export default meta;

type Story = StoryObj<typeof PathView>;

export const Default: Story = {};
