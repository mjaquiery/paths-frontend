import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import BottomBar from './BottomBar.vue';
import { router } from '../../.storybook/router';

const meta: Meta<typeof BottomBar> = {
  title: 'Components/BottomBar',
  component: BottomBar,
  args: {
    altIcon: '🗂️',
    altLabel: 'Browse paths',
    altTo: '/paths',
    canCreate: true,
    writeEntryQuery: { day: '2024-01-01' },
  },
};

export default meta;

type Story = StoryObj<typeof BottomBar>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Browse paths')).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', { name: '+ Write Entry' }),
    ).toBeInTheDocument();
    await expect(canvas.getByLabelText('Settings')).toBeInTheDocument();
  },
};

export const HidesWriteEntryWhenCannotCreate: Story = {
  args: { canCreate: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByRole('link', { name: '+ Write Entry' }),
    ).not.toBeInTheDocument();
  },
};

export const WriteEntryCarriesDayAndPath: Story = {
  args: { writeEntryQuery: { day: '2024-03-15', pathId: 'p1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('link', { name: '+ Write Entry' }),
    );
    await waitFor(() =>
      expect(router.currentRoute.value.path).toBe('/entry/new'),
    );
    expect(router.currentRoute.value.query.day).toBe('2024-03-15');
    expect(router.currentRoute.value.query.pathId).toBe('p1');
  },
};

export const AltIconNavigates: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Browse paths'));
    await waitFor(() => expect(router.currentRoute.value.path).toBe('/paths'));
  },
};

export const SettingsIconNavigates: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Settings'));
    await waitFor(() =>
      expect(router.currentRoute.value.path).toBe('/settings'),
    );
  },
};
