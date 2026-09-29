import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, ref, type Ref } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';

vi.mock('../lib/db', () => ({
  db: {
    localDrafts: {
      get: vi.fn().mockResolvedValue(undefined),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

import { db } from '../lib/db';
import { useLocalDraft } from '../composables/useLocalDraft';

const put = db.localDrafts.put as unknown as ReturnType<typeof vi.fn>;

function mountDraft(
  pathId: Ref<string>,
  day: Ref<string> = ref('2026-09-29'),
  entryId: Ref<string | null> = ref(null),
) {
  let api!: ReturnType<typeof useLocalDraft>;
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useLocalDraft(pathId, day, entryId);
        return () => null;
      },
    }),
  );
  return { wrapper, api };
}

describe('useLocalDraft', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('flushes a pending save immediately when the editor unmounts (e.g. swipe back)', async () => {
    const { wrapper, api } = mountDraft(ref('p1'));
    await api.restore();
    api.content.value = 'long draft';
    await flushPromises();
    expect(put).not.toHaveBeenCalled();

    wrapper.unmount();
    await flushPromises();
    expect(put).toHaveBeenCalledWith(
      expect.objectContaining({
        draftKey: 'p1:new:2026-09-29',
        content: 'long draft',
      }),
    );
  });

  it('saves under the key current at edit time, even if route params change on leave', async () => {
    const entryId = ref<string | null>('e1');
    const { wrapper, api } = mountDraft(ref('p1'), ref('2026-09-29'), entryId);
    await api.restore();
    api.content.value = 'edited';
    await flushPromises();
    // Leaving the route clears params before the component tears down.
    entryId.value = null;
    wrapper.unmount();
    await flushPromises();
    expect(put).toHaveBeenCalledWith(
      expect.objectContaining({ draftKey: 'p1:entry:e1', content: 'edited' }),
    );
  });

  it('saves periodically during continuous typing with no pauses', async () => {
    const { api } = mountDraft(ref('p1'));
    await api.restore();
    for (let i = 0; i < 30; i++) {
      api.content.value += 'x';
      await flushPromises();
      await vi.advanceTimersByTimeAsync(200);
    }
    // 6s of typing at one keystroke per 200ms never lets the 500ms debounce
    // settle, but the max-wait must still have written at least once.
    expect(put).toHaveBeenCalled();
  });

  it('flushes on pagehide (app backgrounded / closed)', async () => {
    const { api } = mountDraft(ref('p1'));
    await api.restore();
    api.content.value = 'before close';
    await flushPromises();
    window.dispatchEvent(new Event('pagehide'));
    await flushPromises();
    expect(put).toHaveBeenCalledWith(
      expect.objectContaining({ content: 'before close' }),
    );
  });

  it('still autosaves when restore() ran before a path was selected', async () => {
    const pathId = ref('');
    const { api } = mountDraft(pathId);
    await api.restore(); // no-op: paths not loaded yet
    pathId.value = 'p1'; // paths load, first owned path auto-selected
    await flushPromises();
    api.content.value = 'typed after paths loaded';
    await flushPromises();
    await vi.advanceTimersByTimeAsync(1000);
    expect(put).toHaveBeenCalledWith(
      expect.objectContaining({
        draftKey: 'p1:new:2026-09-29',
        content: 'typed after paths loaded',
      }),
    );
  });

  it('restores the draft once a path is selected after mount', async () => {
    const get = db.localDrafts.get as unknown as ReturnType<typeof vi.fn>;
    get.mockResolvedValueOnce({ content: 'saved earlier' });
    const pathId = ref('');
    const { api } = mountDraft(pathId);
    await api.restore();
    pathId.value = 'p1';
    await flushPromises();
    expect(api.content.value).toBe('saved earlier');
  });
});
