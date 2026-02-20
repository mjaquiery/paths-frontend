import type { Meta, StoryObj } from '@storybook/vue3-vite';

import ExportCard from './ExportCard.vue';

const meta: Meta<typeof ExportCard> = {
  title: 'Components/ExportCard',
  component: ExportCard,
  args: {
    paths: [
      {
        path_id: 'path-1',
        owner_user_id: 'user-1',
        title: 'Daily Path',
        description: null,
        color: '#3366ff',
        is_public: false,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      }
    ]
  }
};

export default meta;

type Story = StoryObj<typeof ExportCard>;

export const Default: Story = {};
