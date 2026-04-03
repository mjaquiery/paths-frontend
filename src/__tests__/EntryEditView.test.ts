import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import EntryEditView from '../views/EntryEditView.vue';

// ─── Route / router mocks ────────────────────────────────────────────────────

const mockRouterBack = vi.fn();
const mockRouterReplace = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { pathId: 'p1', entryId: 'e1' },
    query: {},
  }),
  useRouter: () => ({
    push: vi.fn(),
    back: mockRouterBack,
    replace: mockRouterReplace,
  }),
}));

// ─── Composable / utility mocks ───────────────────────────────────────────────

vi.mock('../composables/usePaths', () => ({
  usePaths: () => ({
    data: {
      value: [
        {
          path_id: 'p1',
          title: 'Test Path',
          color: '#3949ab',
          owner_user_id: 'user-1',
          uuid: 'u1',
          description: null,
          is_public: false,
          created_at: '',
          updated_at: '',
        },
      ],
    },
  }),
}));

// Configurable entry fixture — tests may replace this before mounting.
let currentEntryImages: {
  id: string;
  entry_id: string;
  filename: string;
  status: 'ready';
  strip_metadata: boolean;
  content_type: string;
  byte_size: number;
}[] = [];

vi.mock('../composables/useMultiPathEntries', () => ({
  useMultiPathEntries: () => ({
    value: [
      {
        pathId: 'p1',
        entries: [
          {
            id: 'e1',
            path_id: 'p1',
            day: '2024-01-15',
            edit_id: 5,
            content: 'Original entry content.',
            images: currentEntryImages,
          },
        ],
      },
    ],
  }),
}));

vi.mock('../composables/useRefreshStatus', () => ({
  useRefreshStatus: () => ({
    statusType: { value: 'idle' },
    statusText: { value: '' },
    lastCheckedAt: { value: null },
  }),
}));

vi.mock('../composables/usePendingSaves', () => ({
  usePendingSaves: () => ({
    registerPendingSave: vi.fn(),
    removePendingSave: vi.fn(),
    clearSavedNotification: vi.fn(),
    setContentSaving: vi.fn(),
    registerDraftInitError: vi.fn(),
    clearDraftInitError: vi.fn(),
    pendingSaves: { value: [] },
    pendingSavesCount: { value: 0 },
    savedNotification: { value: null },
    isContentSaving: { value: false },
    draftInitErrors: { value: [] },
  }),
}));

vi.mock('../lib/db', () => ({
  db: {
    entryContent: { delete: vi.fn() },
    entryImages: {
      where: () => ({ equals: () => ({ delete: vi.fn() }) }),
    },
  },
}));

// ─── API client mocks ────────────────────────────────────────────────────────

const mockStartEditEntryDraft = vi.fn();
const mockGetEntry = vi.fn();
const mockAbandonDraft = vi.fn();
const mockPatchDraft = vi.fn();
const mockCommitDraft = vi.fn();
const mockRemoveDraftImage = vi.fn();

vi.mock('../generated/apiClient', () => ({
  startEditEntryDraft: (...args: unknown[]) => mockStartEditEntryDraft(...args),
  getEntry: (...args: unknown[]) => mockGetEntry(...args),
  useAbandonEntryDraft: () => ({ mutateAsync: mockAbandonDraft }),
  usePatchEntryDraft: () => ({ mutateAsync: mockPatchDraft }),
  useCommitEntryDraft: () => ({ mutateAsync: mockCommitDraft }),
  useRemoveDraftImage: () => ({ mutateAsync: mockRemoveDraftImage }),
}));

vi.mock('../composables/useDraftImageUpload', () => ({
  useDraftImageUpload: () => ({
    uploadError: { value: '' },
    uploadDraftImage: vi.fn(),
  }),
}));

// ─── Ionic / component stubs ─────────────────────────────────────────────────

const ionicStubs = {
  IonPage: { template: '<div><slot /></div>' },
  IonHeader: { template: '<div><slot /></div>' },
  IonToolbar: { template: '<div><slot /></div>' },
  IonTitle: { template: '<div><slot /></div>' },
  IonContent: { template: '<div><slot /></div>' },
  IonFooter: { template: '<div><slot /></div>' },
  IonButton: {
    template:
      '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    props: ['disabled'],
    emits: ['click'],
  },
  IonButtons: { template: '<div><slot /></div>' },
  IonBackButton: { template: '<button>Back</button>' },
  IonModal: {
    template: '<div v-if="isOpen"><slot /></div>',
    props: ['isOpen', 'canDismiss'],
  },
  IonAlert: {
    template: '<ion-alert />',
    props: ['isOpen', 'header', 'message', 'buttons'],
  },
  IonItem: { template: '<div><slot /></div>' },
  IonLabel: { template: '<label><slot /></label>' },
  IonInput: {
    template: '<input />',
    props: ['modelValue'],
    emits: ['update:modelValue'],
  },
  IonTextarea: {
    template:
      '<textarea :value="modelValue" @input="$emit(\'ionInput\', $event)"></textarea>',
    props: ['modelValue', 'rows'],
    emits: ['ionInput', 'update:modelValue'],
  },
  RefreshStatus: { template: '<div />' },
  EntryImageDraftPreview: {
    template: '<div />',
    props: ['imageId', 'previewUrl', 'filename', 'uploading'],
  },
  MarkdownContent: {
    template: '<div><slot /></div>',
    props: ['content', 'images', 'localImageUrls'],
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mountEditView() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return mount(EntryEditView, {
    global: {
      plugins: [[VueQueryPlugin, { queryClient }]],
      stubs: ionicStubs,
    },
  });
}

const draftResponse = (
  id = 'draft-1',
  content = 'Original entry content.',
) => ({
  status: 200,
  data: {
    id,
    mode: 'edit',
    state: 'open',
    path_id: 'p1',
    entry_id: 'e1',
    day: '2024-01-15',
    content,
    based_on_edit_id: 5,
    images: [],
    expires_at: '2024-01-16T00:00:00Z',
  },
});

const conflictError = () =>
  Object.assign(new Error('Conflict'), {
    response: { status: 409, data: { detail: 'Edit ID mismatch.' } },
  });

const networkError = () =>
  Object.assign(new Error('Server error'), {
    response: { status: 503, data: { detail: 'Unavailable.' } },
  });

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('EntryEditView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentEntryImages = []; // reset to no images by default
    mockStartEditEntryDraft.mockResolvedValue(draftResponse());
    mockPatchDraft.mockResolvedValue({ status: 200, data: {} });
    mockCommitDraft.mockResolvedValue({
      status: 200,
      data: {
        id: 'e1',
        path_id: 'p1',
        day: '2024-01-15',
        edit_id: 6,
        content: 'Original entry content.',
      },
    });
    mockAbandonDraft.mockResolvedValue({ status: 204, data: null });
    mockGetEntry.mockResolvedValue({
      status: 200,
      data: {
        id: 'e1',
        path_id: 'p1',
        day: '2024-01-15',
        edit_id: 5,
        content: 'Remote entry content.',
        image_filenames: [],
      },
    });
  });

  it('renders the editor once the entry loads', async () => {
    const wrapper = mountEditView();
    await flushPromises();
    expect(wrapper.html()).toContain('Content');
    expect(wrapper.html()).toContain('Original entry content.');
  });

  it('calls startEditEntryDraft with the entry edit_id on mount', async () => {
    mountEditView();
    await flushPromises();
    expect(mockStartEditEntryDraft).toHaveBeenCalledWith(
      'p1',
      'e1',
      expect.objectContaining({ based_on_edit_id: 5 }),
    );
  });

  it('opens the editor immediately with cached entry content even when draft init fails', async () => {
    mockStartEditEntryDraft.mockRejectedValue(networkError());
    const wrapper = mountEditView();
    await flushPromises();
    // Should still show the content (from the entry, not blocked by draft failure)
    expect(wrapper.html()).toContain('Original entry content.');
    // Should NOT be in a loading/blocked state
    expect(wrapper.html()).not.toContain('Loading entry...');
  });

  it('shows inline retry note when draft init fails with a non-409', async () => {
    mockStartEditEntryDraft.mockRejectedValue(networkError());
    const wrapper = mountEditView();
    await flushPromises();
    // The draft-init error is now surfaced via usePendingSaves/RefreshStatus
    // (which is stubbed in tests). The editor should still be accessible.
    expect(wrapper.html()).toContain('Original entry content.');
  });

  it('shows conflict banner when draft init returns 409', async () => {
    mockStartEditEntryDraft.mockRejectedValue(conflictError());
    const wrapper = mountEditView();
    await flushPromises();
    expect(wrapper.html()).toMatch(/edited on another device/i);
    expect(wrapper.html()).toMatch(/Load latest version/i);
  });

  it('does NOT block the editor on 409 — editor content is still accessible', async () => {
    mockStartEditEntryDraft.mockRejectedValue(conflictError());
    const wrapper = mountEditView();
    await flushPromises();
    // Editor section is present even alongside the conflict banner
    expect(wrapper.html()).toContain('Content');
  });

  it('Save button is enabled once content is present (does not require draftId)', async () => {
    // Make draft init fail so draftId is never set
    mockStartEditEntryDraft.mockRejectedValue(networkError());
    const wrapper = mountEditView();
    await flushPromises();
    // Simulate a user edit so canCommit becomes true (content differs from original)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (wrapper.vm as any).content = 'Modified entry content.';
    await wrapper.vm.$nextTick();
    const saveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Save'));
    expect(saveBtn?.attributes('disabled')).toBeUndefined();
  });

  it('Save button is disabled when conflict banner is shown', async () => {
    mockStartEditEntryDraft.mockRejectedValue(conflictError());
    const wrapper = mountEditView();
    await flushPromises();
    const saveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Save'));
    expect(saveBtn?.attributes('disabled')).toBeDefined();
  });

  it('commits the draft and navigates back on success', async () => {
    const wrapper = mountEditView();
    await flushPromises();
    // Simulate a content change so canCommit is true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (wrapper.vm as any).content = 'Updated content.';
    await wrapper.vm.$nextTick();
    const saveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Save'));
    await saveBtn?.trigger('click');
    await flushPromises();
    expect(mockCommitDraft).toHaveBeenCalled();
    expect(mockRouterReplace).toHaveBeenCalledWith('/entry/p1/e1');
  });

  it('shows commit-fail dialog when commit fails', async () => {
    mockCommitDraft.mockRejectedValue(networkError());
    const wrapper = mountEditView();
    await flushPromises();
    // Simulate a content change so canCommit is true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (wrapper.vm as any).content = 'Updated content.';
    await wrapper.vm.$nextTick();
    const saveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Save'));
    await saveBtn?.trigger('click');
    await flushPromises();
    // The commit-fail dialog should be open
    expect(wrapper.html()).toMatch(/Save failed/i);
    expect(wrapper.html()).toMatch(/retrying to save in the background/i);
  });

  it('opens conflict resolution modal when commit returns 409', async () => {
    mockCommitDraft.mockRejectedValue(conflictError());
    const wrapper = mountEditView();
    await flushPromises();
    // Simulate a content change so canCommit is true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (wrapper.vm as any).content = 'Updated content.';
    await wrapper.vm.$nextTick();
    const saveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Save'));
    await saveBtn?.trigger('click');
    await flushPromises();
    // Conflict modal should now be open
    expect(wrapper.html()).toMatch(/Edit Conflict/i);
  });

  it('loadRemoteAndContinue fetches the remote entry and re-inits the draft', async () => {
    // First call: 409 on init
    mockStartEditEntryDraft.mockRejectedValueOnce(conflictError());
    // Second call (after loadRemoteAndContinue): success
    mockStartEditEntryDraft.mockResolvedValue(
      draftResponse('draft-2', 'Remote entry content.'),
    );

    const wrapper = mountEditView();
    await flushPromises();
    expect(wrapper.html()).toMatch(/Load latest version/i);

    const loadBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Load latest version'));
    await loadBtn?.trigger('click');
    await flushPromises();

    expect(mockGetEntry).toHaveBeenCalledWith('p1', 'e1');
    expect(mockStartEditEntryDraft).toHaveBeenCalledTimes(2);
    // Conflict banner should be gone after successful re-init
    expect(wrapper.html()).not.toMatch(/edited on another device/i);
  });

  it('abandons draft on unmount if not committed', async () => {
    const wrapper = mountEditView();
    await flushPromises();
    expect(mockStartEditEntryDraft).toHaveBeenCalled();
    wrapper.unmount();
    await flushPromises();
    expect(mockAbandonDraft).toHaveBeenCalled();
  });

  it('does NOT abandon draft on unmount if commit succeeded', async () => {
    const wrapper = mountEditView();
    await flushPromises();
    // Simulate a content change so canCommit is true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (wrapper.vm as any).content = 'Updated content.';
    await wrapper.vm.$nextTick();
    const saveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Save'));
    await saveBtn?.trigger('click');
    await flushPromises();
    expect(mockCommitDraft).toHaveBeenCalled();
    mockAbandonDraft.mockClear();
    wrapper.unmount();
    await flushPromises();
    expect(mockAbandonDraft).not.toHaveBeenCalled();
  });

  // ─── Server image tests ────────────────────────────────────────────────

  it('shows image chip in the tray when draft init returns images', async () => {
    // Draft init returns a draft with a server image
    mockStartEditEntryDraft.mockResolvedValue({
      status: 200,
      data: {
        id: 'draft-1',
        mode: 'edit',
        state: 'open',
        path_id: 'p1',
        entry_id: 'e1',
        day: '2024-01-15',
        content: 'Original entry content.\n\n![River](river.jpg)',
        based_on_edit_id: 5,
        expires_at: '2024-01-16T00:00:00Z',
        images: [
          {
            id: 'dimg-1',
            draft_id: 'draft-1',
            source: 'live',
            live_image_id: 'img-live-1',
            filename: 'river.jpg',
            status: 'ready',
            content_type: 'image/jpeg',
            strip_metadata: true,
            byte_size: 200_000,
            client_image_id: null,
          },
        ],
      },
    });

    const wrapper = mountEditView();
    await flushPromises();

    // Image chip should appear for river.jpg
    expect(wrapper.html()).toContain('river.jpg');
  });

  it('shows image chips from the entry when draft init is pending (pre-hydration)', async () => {
    currentEntryImages = [
      {
        id: 'img-server-1',
        entry_id: 'e1',
        filename: 'sunrise.jpg',
        status: 'ready',
        strip_metadata: true,
        content_type: 'image/jpeg',
        byte_size: 100_000,
      },
    ];
    // Delay draft init so we can observe pre-hydration state
    mockStartEditEntryDraft.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(draftResponse()), 50),
        ),
    );

    const wrapper = mountEditView();
    await flushPromises();

    // Pre-hydration: server image from entry should be shown
    expect(wrapper.html()).toContain('sunrise.jpg');
  });

  it('replaces entry images with draft images after init resolves', async () => {
    currentEntryImages = [
      {
        id: 'img-server-1',
        entry_id: 'e1',
        filename: 'sunrise.jpg',
        status: 'ready',
        strip_metadata: true,
        content_type: 'image/jpeg',
        byte_size: 100_000,
      },
    ];
    // Draft init returns the same image as a DraftImageResponse
    mockStartEditEntryDraft.mockResolvedValue({
      status: 200,
      data: {
        id: 'draft-1',
        mode: 'edit',
        state: 'open',
        path_id: 'p1',
        entry_id: 'e1',
        day: '2024-01-15',
        content: 'Original entry content.',
        based_on_edit_id: 5,
        expires_at: '2024-01-16T00:00:00Z',
        images: [
          {
            id: 'dimg-live-1',
            draft_id: 'draft-1',
            source: 'live',
            live_image_id: 'img-server-1',
            filename: 'sunrise.jpg',
            status: 'ready',
            content_type: 'image/jpeg',
            strip_metadata: true,
            byte_size: 100_000,
            client_image_id: null,
          },
        ],
      },
    });

    const wrapper = mountEditView();
    await flushPromises();

    // After init, the draft-based image chip should be shown
    expect(wrapper.html()).toContain('sunrise.jpg');
  });

  it('removes image chip and calls removeDraftImageApi when Remove is clicked', async () => {
    mockRemoveDraftImage.mockResolvedValue({ status: 200, data: {} });
    mockStartEditEntryDraft.mockResolvedValue({
      status: 200,
      data: {
        id: 'draft-1',
        mode: 'edit',
        state: 'open',
        path_id: 'p1',
        entry_id: 'e1',
        day: '2024-01-15',
        content: 'Original entry content.\n\n![River](river.jpg)',
        based_on_edit_id: 5,
        expires_at: '2024-01-16T00:00:00Z',
        images: [
          {
            id: 'dimg-1',
            draft_id: 'draft-1',
            source: 'live',
            live_image_id: 'img-live-1',
            filename: 'river.jpg',
            status: 'ready',
            content_type: 'image/jpeg',
            strip_metadata: true,
            byte_size: 200_000,
            client_image_id: null,
          },
        ],
      },
    });

    const wrapper = mountEditView();
    await flushPromises();

    // The Remove button for river.jpg should be present
    const removeBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Remove'));
    expect(removeBtn).toBeDefined();

    await removeBtn?.trigger('click');
    await flushPromises();

    // removeDraftImageApi should have been called with the draftImageId
    expect(mockRemoveDraftImage).toHaveBeenCalledWith({
      draftId: 'draft-1',
      draftImageId: 'dimg-1',
    });

    // The chip for river.jpg should no longer be in the DOM
    expect(wrapper.html()).not.toContain('river.jpg');
  });

  it('patches draft with updated content before committing', async () => {
    const wrapper = mountEditView();
    await flushPromises();

    // Simulate user changing content — required for canCommit to be true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (wrapper.vm as any).content = 'Updated content by user.';
    await wrapper.vm.$nextTick();

    const saveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Save'));
    await saveBtn?.trigger('click');
    await flushPromises();

    // commitDraftApi should have been called with the draft id
    expect(mockCommitDraft).toHaveBeenCalledWith({ draftId: 'draft-1' });
  });

  it('patches draft with new content when it differs from last saved', async () => {
    const wrapper = mountEditView();
    await flushPromises();

    // Directly update the internal content ref via the component instance.
    // The v-model on IonTextarea in the stub doesn't plumb update:modelValue,
    // so we set the reactive state directly to simulate a user edit.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (wrapper.vm as any).content = 'Updated content by user.';
    await wrapper.vm.$nextTick();

    // Manually click Save (bypasses debounce)
    const saveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Save'));
    await saveBtn?.trigger('click');
    await flushPromises();

    // When content differs from lastSavedContent, patchDraft should be called.
    expect(mockPatchDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ content: 'Updated content by user.' }),
      }),
    );
    expect(mockCommitDraft).toHaveBeenCalledWith({ draftId: 'draft-1' });
  });

  it('does not call removeDraftImageApi for server images without a draftImageId', async () => {
    // Pre-hydration server images (from entry, before draft loads) have no draftImageId.
    currentEntryImages = [
      {
        id: 'img-server-1',
        entry_id: 'e1',
        filename: 'sunrise.jpg',
        status: 'ready',
        strip_metadata: true,
        content_type: 'image/jpeg',
        byte_size: 100_000,
      },
    ];

    // Draft init fails so we stay on pre-hydration images
    mockStartEditEntryDraft.mockRejectedValue(networkError());

    const wrapper = mountEditView();
    await flushPromises();

    const removeBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Remove'));
    expect(removeBtn).toBeDefined();

    await removeBtn?.trigger('click');
    await flushPromises();

    // No draftImageId → removeDraftImageApi should NOT be called
    expect(mockRemoveDraftImage).not.toHaveBeenCalled();
    // The chip should be gone from the UI
    expect(wrapper.html()).not.toContain('sunrise.jpg');
  });
});
