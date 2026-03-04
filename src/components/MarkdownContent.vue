<template>
  <div class="markdown-content" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const props = defineProps<{
  content: string;
}>();

const renderedHtml = computed(() => {
  const raw = marked.parse(props.content) as string;
  return DOMPurify.sanitize(raw);
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

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--ion-color-light, #f4f4f4);
  margin: 1em 0;
}
</style>
