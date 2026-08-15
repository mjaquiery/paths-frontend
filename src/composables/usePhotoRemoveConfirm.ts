import { computed, ref } from 'vue';

export interface PendingPhotoRemoval {
  kind: 'existing' | 'pending';
  id: string;
  filename: string;
}

/**
 * Shared state for a single confirmation `<ion-alert>` that gates removing a
 * photo row, meant to be rendered once on the page rather than once per row.
 *
 * A row's own removal (PhotoStripItem's 'remove' emit) unmounts that row —
 * if the confirmation alert lived inside the row instead, Ionic closing the
 * alert (which removes its own element from the DOM) and Vue unmounting the
 * same row a tick later can race and throw. Hoisting the alert onto the
 * page, which the removal never itself unmounts, avoids that entirely.
 */
export function usePhotoRemoveConfirm(
  onConfirmed: (removal: PendingPhotoRemoval) => void,
) {
  const pending = ref<PendingPhotoRemoval | null>(null);
  const confirmed = ref(false);

  function requestRemove(removal: PendingPhotoRemoval) {
    pending.value = removal;
  }

  const buttons = computed(() => [
    { text: 'Cancel', role: 'cancel' },
    {
      text: 'Remove',
      role: 'destructive',
      handler: () => (confirmed.value = true),
    },
  ]);

  // Only acts once the alert has actually finished dismissing (didDismiss),
  // not from inside the button handler — see the module doc comment above.
  function onDismiss() {
    const target = pending.value;
    pending.value = null;
    if (confirmed.value && target) {
      confirmed.value = false;
      onConfirmed(target);
    }
  }

  return { pending, requestRemove, buttons, onDismiss };
}
