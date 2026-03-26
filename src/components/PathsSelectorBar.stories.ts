import type { Meta, StoryObj } from '@storybook/vue3-vite';

import PathsSelectorBar from './PathsSelectorBar.vue';

const meta: Meta<typeof PathsSelectorBar> = {
  title: 'Components/PathsSelectorBar',
  component: PathsSelectorBar,
  args: {
    currentUser: null,
  },
};

export default meta;

type Story = StoryObj<typeof PathsSelectorBar>;

export const Default: Story = {};
