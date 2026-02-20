import type { Meta, StoryObj } from '@storybook/vue3-vite';

import App from './App.vue';

const meta: Meta<typeof App> = {
  title: 'App/AppShell',
  component: App
};

export default meta;

type Story = StoryObj<typeof App>;

export const Default: Story = {};
