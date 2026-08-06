import { onMounted, onBeforeUnmount } from 'vue';

/**
 * Tracks the height of the iOS/Android virtual keyboard using the
 * `visualViewport` API and writes it to the `--keyboard-height` CSS custom
 * property on `<html>`.  Components that need to stay above the keyboard
 * (e.g. AppFooter) or need extra scroll-padding (ion-content) can then read
 * that variable without JavaScript.
 *
 * On desktop and on Android with `interactive-widget=resizes-content` the
 * keyboard already resizes the visual viewport, so the variable will always
 * be 0 in practice there.
 */
function getKeyboardHeight(): number {
  if (typeof window === 'undefined' || !window.visualViewport) return 0;
  // On iOS the layout viewport height (window.innerHeight) stays fixed;
  // the visual viewport shrinks to the area above the keyboard.
  return Math.max(0, window.innerHeight - window.visualViewport.height);
}

function applyKeyboardHeight() {
  const kh = getKeyboardHeight();
  document.documentElement.style.setProperty('--keyboard-height', `${kh}px`);
}

export function useVirtualKeyboard() {
  onMounted(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    window.visualViewport.addEventListener('resize', applyKeyboardHeight);
    window.visualViewport.addEventListener('scroll', applyKeyboardHeight);
    applyKeyboardHeight();
  });

  onBeforeUnmount(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    window.visualViewport.removeEventListener('resize', applyKeyboardHeight);
    window.visualViewport.removeEventListener('scroll', applyKeyboardHeight);
  });
}
