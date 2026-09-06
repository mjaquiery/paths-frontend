import { onMounted, onBeforeUnmount, ref } from 'vue';

/**
 * Tracks the height of the iOS/Android virtual keyboard using the
 * `visualViewport` API and writes it to the `--keyboard-height` CSS custom
 * property on `<html>`.  Components that need to stay above the keyboard
 * (e.g. AppFooter) or need extra scroll-padding (ion-content) can then read
 * that variable without JavaScript.
 *
 * In a regular mobile-Safari tab, opening the keyboard shrinks only
 * `visualViewport.height` — `window.innerHeight` (the layout viewport)
 * stays fixed — so the two can simply be diffed. That is NOT true once the
 * app is installed to the home screen (`display: standalone`, this app's
 * install mode): WebKit shrinks `window.innerHeight` right along with
 * `visualViewport.height` when the keyboard opens, so diffing them against
 * each other always reads ~0 there and the keyboard is never detected.
 * Instead we track the largest visualViewport height we've observed (a
 * proxy for "no keyboard open") and diff the *current* height against that.
 */
let maxObservedHeight = 0;

function getViewportHeight(): number {
  return window.visualViewport?.height ?? window.innerHeight;
}

function getKeyboardHeight(): number {
  if (typeof window === 'undefined') return 0;
  const current = getViewportHeight();
  if (current > maxObservedHeight) maxObservedHeight = current;
  return Math.max(0, maxObservedHeight - current);
}

// TEMP diagnostics for the iOS standalone-PWA keyboard-overlap investigation —
// remove once confirmed fixed. Surfaces what iOS is actually reporting, since
// this behavior can't be verified without a live device and has already
// diverged from documented behavior once (see module comment above).
export const virtualKeyboardDebug = ref({
  innerHeight: 0,
  vvHeight: 0,
  vvOffsetTop: 0,
  keyboardHeight: 0,
});

function applyKeyboardHeight() {
  const kh = getKeyboardHeight();
  document.documentElement.style.setProperty('--keyboard-height', `${kh}px`);
  virtualKeyboardDebug.value = {
    innerHeight: window.innerHeight,
    vvHeight: window.visualViewport?.height ?? 0,
    vvOffsetTop: window.visualViewport?.offsetTop ?? 0,
    keyboardHeight: kh,
  };
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
