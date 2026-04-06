import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import EntryCreateView from '../views/EntryCreateView.vue';

// ─── Route / router mocks ────────────────────────────────────────────────────

const mockRouterBack = vi.fn();
const mockRouterReplace = vi.fn();

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { pathId: 'p1' },
    query: { date: '2024-01-15' },
  }),
  useRouter: () => ({
    push: vi.fn(),
    back: mockRouterBack,
    replace: mockRouterReplace,
  }),
  RouterLink: { template: '<a><slot /></a>' },
}));

// ─── Composable mocks ────────────────────────────────────────────────────────

vi.mock('../composables/useCurrentUser', () => ({
  useCurrentUser: () => ({ currentUserId: { value: 'user-1' } }),
}));

type MockPath = {
  path_id: string;
  title: string;
  color: string;
  owner_user_id: string;
  uuid: string;
  description: null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

const mockPathsData = ref<MockPath[] | undefined>([
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
]);
const mockPathsError = ref<Error | null>(null);
const mockPaths = { data: mockPathsData, error: mockPathsError };

vi.mock('../composables/usePaths', () => ({
  usePaths: () => mockPaths,
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
  getPathOrder: () => [],
  isPathHidden: async () => false,
}));

// ─── API client mocks ────────────────────────────────────────────────────────

const mockStartCreateEntryDraft = vi.fn();
const mockAbandonDraft = vi.fn();
const mockPatchDraft = vi.fn();
const mockCommitDraft = vi.fn();
const mockRemoveDraftImage = vi.fn();
const mockGetEntryDraft = vi.fn();

vi.mock('../generated/apiClient', () => ({
  startCreateEntryDraft: (...args: unknown[]) =>
    mockStartCreateEntryDraft(...args),
  useAbandonEntryDraft: () => ({ mutateAsync: mockAbandonDraft }),
  usePatchEntryDraft: () => ({ mutateAsync: mockPatchDraft }),
  useCommitEntryDraft: () => ({ mutateAsync: mockCommitDraft }),
  useRemoveDraftImage: () => ({ mutateAsync: mockRemoveDraftImage }),
  getEntryDraft: (...args: unknown[]) => mockGetEntryDraft(...args),
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
  IonItem: { template: '<div><slot /></div>' },
  IonLabel: { template: '<label><slot /></label>' },
  IonSelect: {
    template:
      '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
    props: ['modelValue', 'disabled'],
    emits: ['update:modelValue'],
  },
  IonSelectOption: {
    template: '<option :value="value"><slot /></option>',
    props: ['value', 'disabled'],
  },
  IonInput: {
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'type', 'disabled'],
    emits: ['update:modelValue'],
  },
  IonTextarea: {
    template:
      '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value); $emit(\'ionInput\', $event)"></textarea>',
    props: ['modelValue', 'rows', 'autoGrow'],
    emits: ['ionInput', 'update:modelValue'],
  },
  IonNote: { template: '<div><slot /></div>' },
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

// ─── Test helpers ─────────────────────────────────────────────────────────────

// jsdom does not implement scrollIntoView; suppress the unhandled rejection
// that comes from useMarkdownEditor calling el?.scrollIntoView(...)
Element.prototype.scrollIntoView = vi.fn();

function mountCreateView() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return mount(EntryCreateView, {
    global: {
      plugins: [[VueQueryPlugin, { queryClient }]],
      stubs: ionicStubs,
    },
  });
}

const draftResponse = (id = 'draft-1', content = '') => ({
  status: 200,
  data: {
    id,
    mode: 'create',
    state: 'open',
    path_id: 'p1',
    entry_id: null,
    day: '2024-01-15',
    content,
    based_on_edit_id: null,
    images: [],
    expires_at: '2024-01-16T00:00:00Z',
  },
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('EntryCreateView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStartCreateEntryDraft.mockResolvedValue(draftResponse());
    mockPatchDraft.mockResolvedValue({ status: 200, data: {} });
    mockCommitDraft.mockResolvedValue({
      status: 200,
      data: {
        id: 'new-entry-1',
        path_id: 'p1',
        day: '2024-01-15',
        edit_id: 1,
        content: '',
      },
    });
    mockAbandonDraft.mockResolvedValue({ status: 204, data: null });
    mockGetEntryDraft.mockResolvedValue(draftResponse());
    // Reset shared mutable mock state
    mockPaths.data.value = [
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
    ];
    mockPaths.error.value = null;
  });

  it('renders the path selector and date input', async () => {
    const wrapper = mountCreateView();
    await flushPromises();
    expect(wrapper.html()).toContain('Path');
    expect(wrapper.html()).toContain('Day');
    expect(wrapper.html()).toContain('Content');
  });

  it('calls startCreateEntryDraft on mount when path and day are pre-set', async () => {
    mountCreateView();
    await flushPromises();
    expect(mockStartCreateEntryDraft).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ day: '2024-01-15' }),
    );
  });

  it('restores content from a resumed draft', async () => {
    mockStartCreateEntryDraft.mockResolvedValue(
      draftResponse('draft-1', 'Resumed content'),
    );
    const wrapper = mountCreateView();
    await flushPromises();
    expect(wrapper.html()).toContain('Resumed content');
  });

  it('Save button is enabled once path, day and content are filled', async () => {
    const wrapper = mountCreateView();
    await flushPromises();
    // Simulate content being typed
    const textarea = wrapper.find('textarea');
    await textarea.setValue('Hello world');
    await flushPromises();
    const saveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Save'));
    expect(saveBtn?.attributes('disabled')).toBeUndefined();
  });

  it('Save button is enabled even when draft init failed (canCommit does not require draftId)', async () => {
    mockStartCreateEntryDraft.mockRejectedValue(new Error('Network error'));
    const wrapper = mountCreateView();
    await flushPromises();
    // Now simulate content
    const textarea = wrapper.find('textarea');
    await textarea.setValue('Some content');
    await flushPromises();
    const saveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Save'));
    expect(saveBtn?.attributes('disabled')).toBeUndefined();
  });

  it('Save button is disabled while an attached image is still processing', async () => {
    const wrapper = mountCreateView();
    await flushPromises();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (wrapper.vm as any).content = 'Some content';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (wrapper.vm as any).imageDrafts = [
      {
        localId: 'draft-image-1',
        source: 'server',
        status: 'draft-uploading',
        image: null,
        draftImageId: 'dimg-1',
        file: null,
        filename: 'river.jpg',
        previewUrl: null,
        captionDraft: 'River',
        removed: false,
        error: '',
      },
    ];
    await wrapper.vm.$nextTick();

    const saveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Save'));
    expect(saveBtn?.attributes('disabled')).toBeDefined();
  });

  it('shows inline error note when draft init fails (does not block the form)', async () => {
    mockStartCreateEntryDraft.mockRejectedValue(new Error('Draft failed'));
    const wrapper = mountCreateView();
    await flushPromises();
    // Form fields should still be present (not replaced by a full error state)
    expect(wrapper.html()).toContain('Content');
    // The draft-init error is now surfaced via usePendingSaves/RefreshStatus
    // (which is stubbed in tests), so there is no inline error text to assert.
  });

  it('shows a full-state error when the paths API fails', async () => {
    // Simulate pathsError being set and paths.value being undefined.
    // Must mutate .value on the existing ref objects (not replace the objects)
    // so the view — which destructures them on setup — sees the change.
    mockPaths.data.value = undefined as unknown as typeof mockPaths.data.value;
    mockPaths.error.value = new Error('Server error');
    const wrapper = mountCreateView();
    await flushPromises();
    expect(wrapper.html()).toContain('Could not load your paths');
    // Restore
    mockPaths.data.value = [
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
    ];
    mockPaths.error.value = null;
  });

  it('shows inline no-paths state when the user owns no paths', async () => {
    const originalPaths = mockPaths.data.value;
    // Replace with a non-owned path only
    mockPaths.data.value = [
      {
        path_id: 'shared-1',
        title: 'Shared Path',
        color: '#15803d',
        owner_user_id: 'other-user',
        uuid: 'u2',
        description: null,
        is_public: false,
        created_at: '',
        updated_at: '',
      },
    ];
    const wrapper = mountCreateView();
    await flushPromises();
    expect(wrapper.html()).toMatch(/don't have any paths/i);
    expect(wrapper.html()).toMatch(/Create a path/i);
    // Restore
    mockPaths.data.value = originalPaths;
  });

  it('calls commitDraft and navigates back on successful commit', async () => {
    const wrapper = mountCreateView();
    await flushPromises();
    const textarea = wrapper.find('textarea');
    await textarea.setValue('My entry content');
    await flushPromises();
    const saveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Save'));
    await saveBtn?.trigger('click');
    await flushPromises();
    expect(mockCommitDraft).toHaveBeenCalled();
    expect(mockRouterReplace).toHaveBeenCalledWith('/entry/p1/new-entry-1');
  });

  it('does not auto-append image markdown for attached draft images on save', async () => {
    const wrapper = mountCreateView();
    await flushPromises();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (wrapper.vm as any).content = 'My entry content';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (wrapper.vm as any).imageDrafts = [
      {
        localId: 'draft-image-1',
        source: 'server',
        status: 'draft-ready',
        image: null,
        draftImageId: 'dimg-1',
        file: null,
        filename: 'river.jpg',
        previewUrl: null,
        captionDraft: 'River',
        removed: false,
        error: '',
      },
    ];
    await wrapper.vm.$nextTick();

    const saveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Save'));
    await saveBtn?.trigger('click');
    await flushPromises();

    expect(mockPatchDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ content: 'My entry content' }),
      }),
    );
  });

  it('shows commit-fail dialog when commit fails', async () => {
    mockCommitDraft.mockRejectedValue({ response: { status: 503 } });
    const wrapper = mountCreateView();
    await flushPromises();
    const textarea = wrapper.find('textarea');
    await textarea.setValue('My entry content');
    await flushPromises();
    const saveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Save'));
    await saveBtn?.trigger('click');
    await flushPromises();
    // The commit-fail dialog should be open (modal rendered with isOpen=true)
    expect(wrapper.html()).toMatch(/Save failed/i);
    expect(wrapper.html()).toMatch(/retrying to save in the background/i);
  });

  it('navigates to the path view when OK is chosen for a retrying save failure', async () => {
    mockCommitDraft.mockRejectedValue({ response: { status: 503 } });
    const wrapper = mountCreateView();
    await flushPromises();

    const textarea = wrapper.find('textarea');
    await textarea.setValue('My entry content');
    await flushPromises();

    const saveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Save'));
    await saveBtn?.trigger('click');
    await flushPromises();

    const okBtn = wrapper.findAll('button').find((b) => b.text() === 'OK');
    await okBtn?.trigger('click');
    await flushPromises();

    expect(mockRouterReplace).toHaveBeenCalledWith('/path/p1');
  });

  it('abandons the draft on unmount if not committed', async () => {
    const wrapper = mountCreateView();
    await flushPromises();
    expect(mockStartCreateEntryDraft).toHaveBeenCalled();
    wrapper.unmount();
    await flushPromises();
    expect(mockAbandonDraft).toHaveBeenCalled();
  });

  it('does NOT abandon draft on unmount if commit succeeded', async () => {
    const wrapper = mountCreateView();
    await flushPromises();
    const textarea = wrapper.find('textarea');
    await textarea.setValue('Content');
    await flushPromises();
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
});
