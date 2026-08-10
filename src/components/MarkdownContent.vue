<template>
  <div class="markdown-content" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { marked, Renderer } from 'marked';
import DOMPurify from 'dompurify';
import { useQueries } from '@tanstack/vue-query';
import { getImageDownloadUrl } from '../generated/apiClient';
import type { ImageResponse, ImageDownloadResponse } from '../generated/types';

const props = defineProps<{
  content: string;
  /** Optional list of images attached to this entry, used to resolve inline
   *  image filenames to actual download URLs. */
  images?: ImageResponse[];
}>();

// Fetch download URLs for all provided images in parallel.
const imageQueries = useQueries({
  queries: computed(() =>
    (props.images ?? []).map((img) => ({
      queryKey: ['v1', 'images', img.id, 'download'],
      queryFn: () => getImageDownloadUrl(img.id),
      enabled: !!img.id,
    })),
  ),
});

/**
 * Maps filename → resolved URL (thumbnail preferred, falls back to full URL).
 * `useQueries` preserves result order matching the input queries array, so
 * index-based pairing with `props.images` is reliable.
 */
const imageUrlMap = computed<Map<string, string>>(() => {
  const map = new Map<string, string>();
  const images = props.images ?? [];
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const result = imageQueries.value[i];
    if (!img || !result) continue;
    const data = result.data?.data as ImageDownloadResponse | undefined;
    const url = data?.thumbnail_url ?? data?.image_url;
    if (url) map.set(img.filename, url);
  }
  return map;
});

const renderedHtml = computed(() => {
  const urlMap = imageUrlMap.value;

  // If there are images to resolve, use a custom renderer that substitutes
  // filenames with actual signed URLs so inline images display correctly.
  if (urlMap.size > 0) {
    const renderer = new Renderer();
    renderer.image = ({ href, title, text }) => {
      const resolvedSrc = urlMap.get(href) ?? href;
      const escapedSrc = resolvedSrc.replace(/"/g, '&quot;');
      const escapedAlt = (text ?? '').replace(/"/g, '&quot;');
      const titleAttr = title
        ? ` title="${title.replace(/"/g, '&quot;')}"`
        : '';
      return `<img src="${escapedSrc}" alt="${escapedAlt}"${titleAttr} loading="lazy" class="markdown-inline-image" />`;
    };
    const raw = marked.parse(props.content, { renderer }) as string;
    return DOMPurify.sanitize(raw, { ADD_ATTR: ['loading'] });
  }

  const raw = marked.parse(props.content) as string;
  return DOMPurify.sanitize(raw);
});
</script>

<style scoped>
.markdown-content {
  font-family: var(--font-serif, serif);
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--color-ink, #333);
}

.markdown-content :deep(p) {
  margin: 0 0 0.75em;
}

.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin: 0.75em 0 0.5em;
  font-weight: 600;
  line-height: 1.3;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 1.5em;
  margin: 0 0 0.75em;
}

.markdown-content :deep(li) {
  margin-bottom: 0.25em;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid var(--ion-color-medium, #888);
  margin: 0 0 0.75em;
  padding: 0.25em 0.75em;
  color: var(--ion-color-medium, #888);
}

.markdown-content :deep(code) {
  background: var(--ion-color-light, #f4f4f4);
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
  padding: 0.1em 0.3em;
}

.markdown-content :deep(pre) {
  background: var(--ion-color-light, #f4f4f4);
  border-radius: 4px;
  margin: 0 0 0.75em;
  overflow-x: auto;
  padding: 0.75em 1em;
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
}

.markdown-content :deep(a) {
  color: var(--ion-color-primary, #3880ff);
}

.markdown-content :deep(.markdown-inline-image) {
  max-width: 100%;
  border-radius: 4px;
  display: block;
  margin: 0.5em 0;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--ion-color-light, #f4f4f4);
  margin: 1em 0;
}
</style>
