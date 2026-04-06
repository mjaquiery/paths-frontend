import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { nextTick } from 'vue';

import MarkdownContent from '../components/MarkdownContent.vue';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

async function waitFor(assertion: () => void, attempts = 10) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      assertion();
      return;
    } catch (error) {
      if (attempt === attempts - 1) throw error;
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
}

vi.mock('../generated/apiClient', () => ({
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

describe('MarkdownContent image rendering', () => {
  it('resolves inline markdown image filenames to download URLs', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      blob: async () => new Blob(['image-bytes'], { type: 'image/jpeg' }),
    });

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

    await waitFor(() => {
      const image = wrapper.find('img');
      expect(image.exists()).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(
        '/storybook-images/img-sunrise-river/full',
      );
      expect(image.attributes('src')).toMatch(/^data:image\/jpeg;base64,/);
    });

    const image = wrapper.find('img');
    expect(image.attributes('alt')).toBe('Sunrise');
    expect(wrapper.find('figcaption').text()).toBe('Sunrise');
  });

  it('normalizes filenames with spaces before rendering markdown images', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      blob: async () => new Blob(['image-bytes'], { type: 'image/png' }),
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const filename = 'ChatGPT Image Apr 29, 2025, 07_47_54 AM.png';
    const wrapper = mount(MarkdownContent, {
      props: {
        content: `![${filename}](${filename})`,
        images: [
          {
            id: 'img-chatgpt-image',
            entry_id: 'entry-1',
            filename,
            status: 'ready',
            strip_metadata: true,
            content_type: 'image/png',
            byte_size: 1234,
          },
        ],
      },
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await waitFor(() => {
      const image = wrapper.find('img');
      expect(image.exists()).toBe(true);
      expect(image.attributes('src')).toMatch(/^data:image\/png;base64,/);
    });
  });

  it('does not double-encode an already-encoded markdown filename', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      blob: async () => new Blob(['image-bytes'], { type: 'image/png' }),
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const filename = 'ChatGPT Image Apr 29, 2025, 07_47_54 AM.png';
    const encodedFilename =
      'ChatGPT%20Image%20Apr%2029%2C%202025%2C%2007_47_54%20AM.png';
    const wrapper = mount(MarkdownContent, {
      props: {
        content: `![${filename}](${encodedFilename})`,
        images: [
          {
            id: 'img-chatgpt-image-encoded',
            entry_id: 'entry-1',
            filename,
            status: 'ready',
            strip_metadata: true,
            content_type: 'image/png',
            byte_size: 1234,
          },
        ],
      },
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await waitFor(() => {
      const image = wrapper.find('img');
      expect(image.exists()).toBe(true);
      expect(image.attributes('src')).toMatch(/^data:image\/png;base64,/);
    });
  });

  it('rewrites local preview URLs to data URLs for freshly uploaded images', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      blob: async () => new Blob(['local-image-bytes'], { type: 'image/png' }),
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const wrapper = mount(MarkdownContent, {
      props: {
        content: '![Fresh upload](fresh-upload.png)',
        localImageUrls: {
          'fresh-upload.png': 'blob:http://localhost/fresh-upload',
        },
      },
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await waitFor(() => {
      const image = wrapper.find('img');
      expect(image.exists()).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(
        'blob:http://localhost/fresh-upload',
      );
      expect(image.attributes('src')).toMatch(/^data:image\/png;base64,/);
    });
  });
});
