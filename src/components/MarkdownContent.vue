<template>
  <div class="markdown-content" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { marked, Renderer } from 'marked';
import DOMPurify from 'dompurify';
import { getImageDownloadUrl } from '../generated/apiClient';
import type { ImageResponse, ImageDownloadResponse } from '../generated/types';
import {
  decodeMarkdownImageFilename,
  normalizeMarkdownImageFilenames,
} from '../utils/markdown';

const props = defineProps<{
  content: string;
  /** Optional list of images attached to this entry, used to resolve inline
   *  image filenames to actual download URLs. */
  images?: ImageResponse[];
  /** Optional filename -> local preview URL map for unsaved draft images. */
  localImageUrls?: Record<string, string>;
}>();

function bytesToBase64(bytes: Uint8Array): string {
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';

  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i] ?? 0;
    const b = bytes[i + 1] ?? 0;
    const c = bytes[i + 2] ?? 0;
    const chunk = (a << 16) | (b << 8) | c;

    output += alphabet[(chunk >> 18) & 63];
    output += alphabet[(chunk >> 12) & 63];
    output += i + 1 < bytes.length ? alphabet[(chunk >> 6) & 63] : '=';
    output += i + 2 < bytes.length ? alphabet[chunk & 63] : '=';
  }

  return output;
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  if (typeof blob.arrayBuffer === 'function') {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return `data:${blob.type || 'application/octet-stream'};base64,${bytesToBase64(bytes)}`;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Failed to read image data.'));
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error('Failed to read image data.'));
    };
    reader.readAsDataURL(blob);
  });
}

const downloadedImageUrls = ref<Record<string, string>>({});

watch(
  () => props.images ?? [],
  async (images, _previousImages, onCleanup) => {
    let cancelled = false;
    onCleanup(() => {
      cancelled = true;
    });

    const nextEntries = await Promise.all(
      images.map(async (img) => {
        if (!img.id) return null;

        try {
          const response = await getImageDownloadUrl(img.id);
          const data = response.data as ImageDownloadResponse | undefined;
          const src = data?.image_url ?? data?.thumbnail_url;
          if (!src) return null;

          const imageResponse = await fetch(src);
          if (!imageResponse.ok) {
            throw new Error(`Image request failed: ${imageResponse.status}`);
          }

          return [
            img.filename,
            await blobToDataUrl(await imageResponse.blob()),
          ] as const;
        } catch {
          return null;
        }
      }),
    );

    if (cancelled) return;
    downloadedImageUrls.value = Object.fromEntries(
      nextEntries.filter(
        (entry): entry is readonly [string, string] => entry !== null,
      ),
    );
  },
  { deep: true, immediate: true },
);

const imageUrlMap = computed(
  () => new Map<string, string>(Object.entries(downloadedImageUrls.value)),
);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const renderedHtml = computed(() => {
  const urlMap = imageUrlMap.value;
  const localImageUrls = props.localImageUrls ?? {};
  const renderer = new Renderer();
  renderer.image = ({ href, title, text }) => {
    const decodedHref = decodeMarkdownImageFilename(href);
    const resolvedSrc =
      localImageUrls[decodedHref] ??
      localImageUrls[href] ??
      urlMap.get(decodedHref) ??
      urlMap.get(href) ??
      href;
    const escapedSrc = resolvedSrc.replace(/"/g, '&quot;');
    const escapedAlt = escapeHtml(text ?? '');
    const titleAttr = title ? ` title="${title.replace(/"/g, '&quot;')}"` : '';
    const figureCaption = text?.trim()
      ? `<figcaption class="markdown-image-caption">${escapeHtml(text)}</figcaption>`
      : '';
    return `<figure class="markdown-image-figure"><img src="${escapedSrc}" alt="${escapedAlt}"${titleAttr} loading="lazy" class="markdown-inline-image" />${figureCaption}</figure>`;
  };

  const raw = marked.parse(normalizeMarkdownImageFilenames(props.content), {
    renderer,
  }) as string;
  return DOMPurify.sanitize(raw, { ADD_ATTR: ['loading'] });
});
</script>

<style scoped>
.markdown-content {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--ion-color-dark, #333);
  padding: 0 4px;
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
  border-radius: 8px;
  display: block;
  margin: 0 auto;
}

.markdown-content :deep(.markdown-image-figure) {
  margin: 1rem 0 1.25rem;
}

.markdown-content :deep(.markdown-image-caption) {
  margin-top: 0.55rem;
  color: var(--ion-color-medium, #888);
  font-size: 0.86rem;
  font-style: italic;
  line-height: 1.4;
  text-align: center;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--ion-color-light, #f4f4f4);
  margin: 1em 0;
}
</style>
