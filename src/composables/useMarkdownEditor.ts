import type { Ref } from 'vue';
import { nextTick } from 'vue';

/**
 * Returns helper functions for inserting image markdown into an Ionic
 * ion-textarea and scrolling the cursor into view as the textarea grows.
 *
 * @param content - reactive ref for the textarea's string value
 * @param textareaRef - ref to the IonTextarea component instance
 * @param contentTab - reactive ref for the active content tab ('write'|'preview')
 */
export function useMarkdownEditor(
  content: Ref<string>,
  textareaRef: Ref<{ $el: HTMLElement } | null>,
  contentTab: Ref<'write' | 'preview'>,
) {
  /** Scroll the textarea host into view so the cursor stays visible as text grows. */
  async function onTextareaInput(event: Event) {
    await nextTick();
    const el = event.target as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /**
   * Insert `![caption](filename)` at the current cursor position. Falls back
   * to appending at the end when cursor info is unavailable, and switches to
   * the write tab so the user can see the result.
   */
  async function insertImageMarkdown(filename: string) {
    const snippet = `![caption](${filename})`;
    const nativeTextarea = textareaRef.value?.$el?.querySelector('textarea');
    if (nativeTextarea) {
      const start = nativeTextarea.selectionStart ?? content.value.length;
      const end = nativeTextarea.selectionEnd ?? content.value.length;
      const before = content.value.slice(0, start);
      const after = content.value.slice(end);
      const needsBefore =
        before.length > 0 && !before.endsWith('\n') ? '\n' : '';
      const needsAfter =
        after.length > 0 && !after.startsWith('\n') ? '\n' : '';
      content.value = `${before}${needsBefore}${snippet}${needsAfter}${after}`;
      await nextTick();
      const newPos = start + needsBefore.length + snippet.length;
      nativeTextarea.selectionStart = newPos;
      nativeTextarea.selectionEnd = newPos;
      nativeTextarea.focus();
    } else {
      content.value = content.value ? `${content.value}\n${snippet}` : snippet;
    }
    contentTab.value = 'write';
  }

  /** Wrap the current selection (or insert at the cursor) with markdown syntax. */
  async function wrapSelection(before: string, after: string = before) {
    const nativeTextarea = textareaRef.value?.$el?.querySelector('textarea');
    if (!nativeTextarea) {
      content.value += before + after;
      return;
    }
    const start = nativeTextarea.selectionStart ?? content.value.length;
    const end = nativeTextarea.selectionEnd ?? content.value.length;
    const selected = content.value.slice(start, end);
    content.value =
      content.value.slice(0, start) +
      before +
      selected +
      after +
      content.value.slice(end);
    await nextTick();
    const cursor = start + before.length + selected.length + after.length;
    nativeTextarea.selectionStart = cursor;
    nativeTextarea.selectionEnd = cursor;
    nativeTextarea.focus();
  }

  /** Prefix the current line with markdown syntax (headings, list markers). */
  async function prefixLine(prefix: string) {
    const nativeTextarea = textareaRef.value?.$el?.querySelector('textarea');
    if (!nativeTextarea) {
      content.value = prefix + content.value;
      return;
    }
    const pos = nativeTextarea.selectionStart ?? content.value.length;
    const lineStart = content.value.lastIndexOf('\n', pos - 1) + 1;
    content.value =
      content.value.slice(0, lineStart) +
      prefix +
      content.value.slice(lineStart);
    await nextTick();
    const cursor = pos + prefix.length;
    nativeTextarea.selectionStart = cursor;
    nativeTextarea.selectionEnd = cursor;
    nativeTextarea.focus();
  }

  return {
    onTextareaInput,
    insertImageMarkdown,
    wrapSelection,
    prefixLine,
  };
}
