import type { Meta, StoryObj } from '@storybook/vue3-vite';

import PathBrowserCard from './PathBrowserCard.vue';

const meta: Meta<typeof PathBrowserCard> = {
  title: 'Components/PathBrowserCard',
  component: PathBrowserCard,
};

export default meta;

type Story = StoryObj<typeof PathBrowserCard>;

export const Default: Story = {};
