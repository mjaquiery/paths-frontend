import { type Ref, onBeforeUnmount, watch } from 'vue';

const LINK_ID = 'canonical-link';

/**
 * Keeps a single `<link rel="canonical">` tag in `<head>` pointed at `href`.
 *
 * There's no head-management library in this app (no other page needs
 * dynamic meta tags), so this manages the one element directly rather than
 * pulling in a dependency for it. The tag is removed when `href` is falsy or
 * the owning component unmounts, so navigating to a page that doesn't want
 * one (or away entirely) never leaves a stale canonical URL behind.
 */
export function useCanonicalLink(href: Ref<string | undefined>) {
  function apply(url: string | undefined) {
    if (typeof document === 'undefined') return;
    const existing = document.getElementById(LINK_ID);
    if (!url) {
      existing?.remove();
      return;
    }
    const link =
      existing instanceof HTMLLinkElement
        ? existing
        : document.createElement('link');
    link.id = LINK_ID;
    link.rel = 'canonical';
    link.href = url;
    if (!existing) document.head.appendChild(link);
  }

  watch(href, apply, { immediate: true });
  onBeforeUnmount(() => apply(undefined));
}
