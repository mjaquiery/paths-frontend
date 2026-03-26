import type { Meta, StoryObj } from '@storybook/vue3-vite';

import OnThisDaySpotlight from './OnThisDaySpotlight.vue';

const meta: Meta<typeof OnThisDaySpotlight> = {
  title: 'Components/OnThisDaySpotlight',
  component: OnThisDaySpotlight,
  args: {
    visiblePaths: [],
    pathEntries: [],
  },
};

export default meta;

type Story = StoryObj<typeof OnThisDaySpotlight>;

export const Default: Story = {};
