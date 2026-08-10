import { defineComponent, h, nextTick, onMounted, ref } from 'vue';

/**
 * Ionic's ion-modal only calls its internal present() when `is-open` changes
 * from false to true — Stencil's @Watch doesn't fire on the initial prop
 * value, so a story that renders straight into `isOpen: true` gets a
 * permanently `overlay-hidden`, contentless <ion-modal /> with none of its
 * slotted children ever inserted. Mount closed, then flip open on next tick,
 * exactly like the real app does (v-if toggles the wrapping modal component).
 */
export function modalRender<P extends { isOpen?: boolean }>(
  Component: unknown,
) {
  return (args: P) =>
    defineComponent({
      setup() {
        const isOpen = ref(false);
        onMounted(async () => {
          await nextTick();
          isOpen.value = true;
        });
        return () => h(Component as never, { ...args, isOpen: isOpen.value });
      },
    });
}
