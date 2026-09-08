import { describe, expect, it, vi, afterEach } from 'vitest';
import { ref } from 'vue';

import { useMarkdownEditor } from '../composables/useMarkdownEditor';

/**
 * On iOS Safari, window.innerHeight stays fixed when the on-screen keyboard
 * opens — only window.visualViewport shrinks. A textarea whose bottom edge
 * sits below visualViewport but above innerHeight is actually hidden behind
 * the keyboard, even though the (unshrunk) layout viewport still considers
 * it in view.
 */
function mockVisualViewport(height: number, offsetTop = 0) {
  Object.defineProperty(window, 'visualViewport', {
    configurable: true,
    value: { height, offsetTop },
  });
}

function makeTextarea(bottom: number, scrollBy: (opts: unknown) => void) {
  const scroller = { scrollBy };
  const ionContent = {
    getScrollElement: () => Promise.resolve(scroller),
  };
  const el = {
    getBoundingClientRect: () => ({ bottom }) as DOMRect,
    closest: (selector: string) =>
      selector === 'ion-content' ? ionContent : null,
    scrollIntoView: vi.fn(),
  };
  return el as unknown as HTMLElement;
}

describe('useMarkdownEditor onTextareaInput (iOS keyboard overlap)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: undefined,
    });
  });

  it('scrolls the ion-content scroller when the caret sits below the shrunk visual viewport', async () => {
    // Keyboard covers the bottom 300px: layout viewport (innerHeight) is still
    // 800, but visualViewport only shows the top 500px.
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    });
    mockVisualViewport(500);

    const scrollBy = vi.fn();
    // The textarea's bottom edge is at 520 — below the 500px visible area,
    // but still well within the 800px layout viewport old code checked.
    const el = makeTextarea(520, scrollBy);

    const { onTextareaInput } = useMarkdownEditor(ref(''), ref(null));
    await onTextareaInput({ target: el } as unknown as Event);

    expect(scrollBy).toHaveBeenCalledTimes(1);
    const [{ top, behavior }] = scrollBy.mock.calls[0] as [
      { top: number; behavior: string },
    ];
    expect(top).toBeCloseTo(520 - 500 + 16);
    expect(behavior).toBe('smooth');
  });

  it('does not scroll when the caret is already above the visible viewport', async () => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    });
    mockVisualViewport(500);

    const scrollBy = vi.fn();
    const el = makeTextarea(480, scrollBy);

    const { onTextareaInput } = useMarkdownEditor(ref(''), ref(null));
    await onTextareaInput({ target: el } as unknown as Event);

    expect(scrollBy).not.toHaveBeenCalled();
  });
});
