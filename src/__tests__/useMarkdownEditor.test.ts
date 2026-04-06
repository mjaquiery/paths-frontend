import { describe, expect, it } from 'vitest';
import { ref } from 'vue';

import { useMarkdownEditor } from '../composables/useMarkdownEditor';

function createTextareaRef(textarea: HTMLTextAreaElement | null) {
  return ref(
    textarea
      ? ({
          $el: {
            querySelector: () => textarea,
          },
        } as unknown as { $el: HTMLElement })
      : null,
  );
}

describe('useMarkdownEditor', () => {
  it('inserts image markdown at the current selection', async () => {
    const content = ref('Morning notes');
    const contentTab = ref<'write' | 'preview'>('write');
    const textarea = document.createElement('textarea');
    textarea.value = content.value;
    textarea.selectionStart = 7;
    textarea.selectionEnd = 7;

    const textareaRef = createTextareaRef(textarea);
    const { insertImageMarkdown } = useMarkdownEditor(
      content,
      textareaRef,
      contentTab,
    );

    await insertImageMarkdown('photo.jpg', 'Sunrise');

    expect(content.value).toBe('Morning\n![Sunrise](photo.jpg)\n notes');
  });

  it('uses the last remembered caret when the textarea loses focus', async () => {
    const content = ref('Alpha Beta');
    const contentTab = ref<'write' | 'preview'>('preview');
    const textarea = document.createElement('textarea');
    textarea.value = content.value;
    textarea.selectionStart = 5;
    textarea.selectionEnd = 5;

    const textareaRef = createTextareaRef(textarea);
    const { rememberSelection, insertImageMarkdown } = useMarkdownEditor(
      content,
      textareaRef,
      contentTab,
    );

    rememberSelection();
    textareaRef.value = null;

    await insertImageMarkdown('river.jpg', 'River walk');

    expect(content.value).toBe('Alpha\n![River walk](river.jpg)\n Beta');
    expect(contentTab.value).toBe('write');
  });

  it('URL-encodes filenames with spaces when inserting image markdown', async () => {
    const content = ref('Notes');
    const contentTab = ref<'write' | 'preview'>('write');
    const textarea = document.createElement('textarea');
    textarea.value = content.value;
    textarea.selectionStart = content.value.length;
    textarea.selectionEnd = content.value.length;

    const textareaRef = createTextareaRef(textarea);
    const { insertImageMarkdown } = useMarkdownEditor(
      content,
      textareaRef,
      contentTab,
    );

    await insertImageMarkdown('ChatGPT Image Apr 29, 2025, 07_47_54 AM.png');

    expect(content.value).toContain(
      '![caption](ChatGPT%20Image%20Apr%2029%2C%202025%2C%2007_47_54%20AM.png)',
    );
  });
});
