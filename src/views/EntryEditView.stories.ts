import type { Meta, StoryObj } from '@storybook/vue3-vite';

import EntryEditView from './EntryEditView.vue';
import {
  createPopulatedState,
  createStoryParameters,
} from '../storybook/storySupport';

const populatedState = createPopulatedState();

const meta: Meta<typeof EntryEditView> = {
  title: 'Views/EntryEditView',
  component: EntryEditView,
};

export default meta;

type Story = StoryObj<typeof EntryEditView>;

export const Default: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/entry-daily-today/edit',
  }),
};

export const Loading: Story = {
  parameters: createStoryParameters({
    state: populatedState,
    route: '/entry/daily-river/missing-entry/edit',
  }),
};
