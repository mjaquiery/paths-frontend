import type { Ref } from 'vue';
import { nextTick } from 'vue';
import { encodeMarkdownImageFilename } from '../utils/markdown';

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
  let lastSelectionStart = 0;
  let lastSelectionEnd = 0;
  let hasRememberedSelection = false;

  function getNativeTextarea() {
    return (
      textareaRef.value?.$el?.querySelector('textarea') ??
      (null as HTMLTextAreaElement | null)
    );
  }

  function rememberSelection() {
    const nativeTextarea = getNativeTextarea();
    if (!nativeTextarea) {
      const fallbackPosition = content.value.length;
      lastSelectionStart = fallbackPosition;
      lastSelectionEnd = fallbackPosition;
      hasRememberedSelection = true;
      return;
    }

    lastSelectionStart = nativeTextarea.selectionStart ?? content.value.length;
    lastSelectionEnd = nativeTextarea.selectionEnd ?? lastSelectionStart;
    hasRememberedSelection = true;
  }

  /** Scroll the textarea host into view so the cursor stays visible as text grows. */
  async function onTextareaInput(event: Event) {
    await nextTick();
    rememberSelection();
    const el = event.target as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /**
   * Insert `![caption](filename)` at the current cursor position. Falls back
   * to appending at the end when cursor info is unavailable, and switches to
   * the write tab so the user can see the result.
   */
  async function insertImageMarkdown(filename: string, altText = 'caption') {
    const snippet = `![${altText || 'caption'}](${encodeMarkdownImageFilename(filename)})`;
    const nativeTextarea = getNativeTextarea();
    const start = nativeTextarea
      ? (nativeTextarea.selectionStart ?? content.value.length)
      : hasRememberedSelection
        ? lastSelectionStart
        : content.value.length;
    const end = nativeTextarea
      ? (nativeTextarea.selectionEnd ?? content.value.length)
      : hasRememberedSelection
        ? lastSelectionEnd
        : content.value.length;

    if (
      nativeTextarea ||
      content.value.length === 0 ||
      start <= content.value.length
    ) {
      const before = content.value.slice(0, start);
      const after = content.value.slice(end);
      const needsBefore =
        before.length > 0 && !before.endsWith('\n') ? '\n' : '';
      const needsAfter =
        after.length > 0 && !after.startsWith('\n') ? '\n' : '';
      content.value = `${before}${needsBefore}${snippet}${needsAfter}${after}`;
      lastSelectionStart = start + needsBefore.length + snippet.length;
      lastSelectionEnd = lastSelectionStart;
      await nextTick();

      const updatedTextarea = getNativeTextarea();
      if (updatedTextarea) {
        updatedTextarea.selectionStart = lastSelectionStart;
        updatedTextarea.selectionEnd = lastSelectionEnd;
        updatedTextarea.focus();
      }
    } else {
      content.value = content.value ? `${content.value}\n${snippet}` : snippet;
      lastSelectionStart = content.value.length;
      lastSelectionEnd = content.value.length;
    }

    contentTab.value = 'write';
  }

  return { onTextareaInput, insertImageMarkdown, rememberSelection };
}
