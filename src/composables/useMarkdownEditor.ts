import type { Ref } from 'vue';
import { nextTick } from 'vue';

/**
 * Returns helper functions for formatting markdown in an Ionic ion-textarea
 * and scrolling the cursor into view as the textarea grows.
 *
 * @param content - reactive ref for the textarea's string value
 * @param textareaRef - ref to the IonTextarea component instance
 */
export function useMarkdownEditor(
  content: Ref<string>,
  textareaRef: Ref<{ $el: HTMLElement } | null>,
) {
  /** Scroll the textarea host into view so the cursor stays visible as text grows. */
  async function onTextareaInput(event: Event) {
    await nextTick();
    const el = event.target as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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
    wrapSelection,
    prefixLine,
  };
}
