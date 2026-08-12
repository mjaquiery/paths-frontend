import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, within } from 'storybook/test';

import IndexPage from './index.vue';
import {
  withAppShell,
  withLoggedOut,
  routeLoader,
} from '../../.storybook/decorators';

const meta: Meta<typeof IndexPage> = {
  title: 'Pages/Home — Welcome',
  component: IndexPage,
  loaders: [routeLoader('/')],
  decorators: [withAppShell(), withLoggedOut()],
};

export default meta;

type Story = StoryObj<typeof IndexPage>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Paths')).toBeInTheDocument();
    await expect(
      canvas.getByText('A private journal across multiple streams of life.'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Continue with Google' }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Your data stays yours. Export or delete any time.'),
    ).toBeInTheDocument();
  },
};

export const ShowsThreeFeatureBullets: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Revisit past years.', { exact: false }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Share one path with someone special', {
        exact: false,
      }),
    ).toBeInTheDocument();
  },
};
