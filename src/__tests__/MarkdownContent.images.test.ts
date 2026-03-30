import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';

import MarkdownContent from '../components/MarkdownContent.vue';

vi.mock('../generated/apiClient', () => ({
  getGetImageDownloadUrlQueryKey: (imageId: string) => [
    'v1',
    'images',
    imageId,
    'download-url',
  ],
  getImageDownloadUrl: async (imageId: string) => ({
    data: {
      image_url: `/storybook-images/${imageId}/full`,
      thumbnail_url: `/storybook-images/${imageId}/thumbnail`,
      expires_in_seconds: 600,
    },
    status: 200 as const,
    headers: new Headers(),
  }),
}));

async function flushQueries() {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('MarkdownContent image rendering', () => {
  it('resolves inline markdown image filenames to download URLs', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const wrapper = mount(MarkdownContent, {
      props: {
        content: '![Sunrise](sunrise-river.jpg)',
        images: [
          {
            id: 'img-sunrise-river',
            entry_id: 'entry-1',
            filename: 'sunrise-river.jpg',
            status: 'ready',
            strip_metadata: true,
            content_type: 'image/jpeg',
            byte_size: 1234,
          },
        ],
      },
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await flushQueries();

    const image = wrapper.find('img');
    expect(image.exists()).toBe(true);
    expect(image.attributes('src')).toBe(
      '/storybook-images/img-sunrise-river/thumbnail',
    );
    expect(image.attributes('alt')).toBe('Sunrise');
    expect(wrapper.find('figcaption').text()).toBe('Sunrise');
  });
});
