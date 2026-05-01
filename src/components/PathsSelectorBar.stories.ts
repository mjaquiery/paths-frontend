import type { Meta, StoryObj } from '@storybook/vue3';
import { userEvent } from '@storybook/test';

import PathsSelectorBar from './PathsSelectorBar.vue';
import {
  createPopulatedState,
  createStoryParameters,
  storybookUser,
} from '../storybook/storySupport';
import {
  expectRoute,
  findElementsByText,
} from '../storybook/storyTest';

const meta: Meta<typeof PathsSelectorBar> = {
  title: 'Components/PathsSelectorBar',
  component: PathsSelectorBar,
  tags: ['smoke'],
  args: {
    currentUser: storybookUser,
  } as Record<string, unknown>,
};

export default meta;

type Story = StoryObj<typeof PathsSelectorBar>;

const baseParameters = createStoryParameters({
  state: createPopulatedState(),
  route: '/',
  seedCacheFromState: true,
});

export const Default: Story = {
  tags: ['a11y'],
  parameters: baseParameters,
};

export const TopLevelNewPathAction: Story = {
  tags: ['interaction'],
  parameters: baseParameters,
  play: async ({ canvasElement }) => {
    const storyDocument = canvasElement.ownerDocument;

    const newPathButton = findElementsByText(
      storyDocument,
      'ion-button, button',
      '+ New Path',
    )[0];

    if (!newPathButton) {
      throw new Error('Expected the top-level "+ New Path" action to render.');
    }

    await userEvent.click(newPathButton);
    await expectRoute('/paths/new');
  },
};

export const ManageModalNewPathAction: Story = {
  parameters: baseParameters,
};
