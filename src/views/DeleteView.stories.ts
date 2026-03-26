import type { Meta, StoryObj } from '@storybook/vue3-vite';

import DeleteView from './DeleteView.vue';
import {
  createPopulatedState,
  createStoryParameters,
} from '../storybook/storySupport';

const meta: Meta<typeof DeleteView> = {
  title: 'Views/DeleteView',
  component: DeleteView,
};

export default meta;

type Story = StoryObj<typeof DeleteView>;

export const Default: Story = {
  parameters: createStoryParameters({
    state: createPopulatedState(),
    route: '/delete',
  }),
};
