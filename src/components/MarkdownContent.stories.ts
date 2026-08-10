import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, within } from '@storybook/test';

import MarkdownContent from './MarkdownContent.vue';
import { imageResponseFixture } from '../generated/fixtures';

const meta: Meta<typeof MarkdownContent> = {
  title: 'Components/MarkdownContent',
  component: MarkdownContent,
};

export default meta;

type Story = StoryObj<typeof MarkdownContent>;

export const Prose: Story = {
  args: {
    content:
      'Morning run along the river. The cherry blossoms are **just** starting to open — that first pale pink against the grey sky is something I always forget about until it happens again.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('just', { selector: 'strong' }),
    ).toBeInTheDocument();
  },
};

export const WithHeadingsAndList: Story = {
  args: {
    content: '# Trip plan\n\n## Day 1\n\n- Arrive\n- Unpack\n- *Explore*',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Trip plan' }),
    ).toBeInTheDocument();
    await expect(canvas.getByText('Arrive')).toBeInTheDocument();
  },
};

export const WithInlineImage: Story = {
  args: {
    content: `![a photo](${imageResponseFixture.filename})`,
    images: [imageResponseFixture],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Image URL resolves asynchronously via the mocked download-url endpoint.
    const img = await canvas.findByRole('img');
    await expect(img).toBeInTheDocument();
  },
};

export const SanitizesUnsafeMarkup: Story = {
  args: {
    content: 'Safe text<script>window.__xss = true;</script>',
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('script')).not.toBeInTheDocument();
  },
};
