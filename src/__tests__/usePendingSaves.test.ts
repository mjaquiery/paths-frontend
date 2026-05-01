import { beforeEach, describe, expect, it } from 'vitest';

import { resetPendingSaves, usePendingSaves } from '../composables/usePendingSaves';

describe('usePendingSaves', () => {
  beforeEach(() => {
    resetPendingSaves();
  });

  it('registers and replaces pending saves by key', () => {
    const { pendingSaves, pendingSavesCount, registerPendingSave } =
      usePendingSaves();

    registerPendingSave('create:p1:2025-03-15', 'Create draft');
    registerPendingSave('create:p1:2025-03-15', 'Updated label');

    expect(pendingSavesCount.value).toBe(1);
    expect(pendingSaves.value).toEqual([
      { key: 'create:p1:2025-03-15', label: 'Updated label' },
    ]);
  });

  it('tracks content saving and draft-init errors', () => {
    const {
      isContentSaving,
      draftInitErrors,
      setContentSaving,
      registerDraftInitError,
      clearDraftInitError,
    } = usePendingSaves();

    setContentSaving('view-1', true);
    registerDraftInitError('view-1', 'Draft failed');

    expect(isContentSaving.value).toBe(true);
    expect(draftInitErrors.value).toEqual(['Draft failed']);

    setContentSaving('view-1', false);
    clearDraftInitError('view-1');

    expect(isContentSaving.value).toBe(false);
    expect(draftInitErrors.value).toEqual([]);
  });

  it('removes pending saves and stores a saved notification on success', () => {
    const {
      pendingSavesCount,
      savedNotification,
      registerPendingSave,
      removePendingSave,
      clearSavedNotification,
    } = usePendingSaves();

    registerPendingSave('edit:e1', 'Save entry');
    removePendingSave('edit:e1', true);

    expect(pendingSavesCount.value).toBe(0);
    expect(savedNotification.value).toBe('Entry saved successfully.');

    clearSavedNotification();
    expect(savedNotification.value).toBeNull();
  });
});
