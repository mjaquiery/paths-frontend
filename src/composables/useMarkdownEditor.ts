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
  /** Scroll the textarea host into view above the keyboard as the cursor grows. */
  async function onTextareaInput(event: Event) {
    await nextTick();
    const el = event.target as HTMLElement | null;
    if (!el) return;

    const scroller = await (
      el.closest('ion-content') as HTMLIonContentElement | null
    )?.getScrollElement();
    if (!scroller) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }

    // iOS Safari never shrinks window.innerHeight for the on-screen keyboard —
    // only visualViewport does — so el.scrollIntoView() reasons about the
    // wrong (unshrunk) viewport and thinks the caret is visible when the
    // keyboard is actually covering it. Compare against visualViewport instead.
    const visibleBottom = window.visualViewport
      ? window.visualViewport.height + window.visualViewport.offsetTop
      : window.innerHeight;
    const overflow = el.getBoundingClientRect().bottom - visibleBottom;
    if (overflow > 0) {
      scroller.scrollBy({ top: overflow + 16, behavior: 'smooth' });
    }
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
