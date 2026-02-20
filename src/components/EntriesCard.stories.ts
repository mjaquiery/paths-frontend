import type { Meta, StoryObj } from '@storybook/vue3-vite';

import EntriesCard from './EntriesCard.vue';

const meta: Meta<typeof EntriesCard> = {
  title: 'Components/EntriesCard',
  component: EntriesCard,
  args: {
    pathId: 'path-1'
  }
};

export default meta;

type Story = StoryObj<typeof EntriesCard>;

export const Default: Story = {};
