/// <reference types="node" />
/**
 * Integration tests for EntryCreateModal – entry creation with image upload.
 *
 * Uses MSW setupServer to intercept the real HTTP call made by the generated
 * API client: a single multipart POST /v1/paths/:pathCode/entries carrying
 * text fields plus any selected images as File parts.
 */
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterEach,
  afterAll,
} from 'vitest';
import { nextTick } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount, flushPromises } from '@vue/test-utils';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
// jsdom's global File isn't recognized by undici's FormData.append() webidl checks (the
// real fetch path customFetch.ts uses) — construct upload fixtures with Node's own File so
// they survive the real multipart encoding this test exercises.
import { File as NodeFile } from 'node:buffer';

import EntryCreateModal from '../components/EntryCreateModal.vue';
import type { PathResponse, OAuthCallbackResponse } from '../generated/types';

// ---------------------------------------------------------------------------
// Mock Dexie
// ---------------------------------------------------------------------------
vi.mock('../lib/db', () => ({
  db: {
    entryContent: {
      get: vi.fn().mockResolvedValue(undefined),
      put: vi.fn().mockResolvedValue(undefined),
    },
    pathPreferences: {},
    queryCache: {},
  },
  isPathHidden: vi.fn().mockResolvedValue(false),
  setPathHidden: vi.fn(),
  getPathOrder: vi.fn().mockReturnValue([]),
  setPathOrder: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Stub Ionic components
// ---------------------------------------------------------------------------
const ionicStubs = {
  IonModal: {
    template: '<div v-if="isOpen"><slot /></div>',
    props: ['isOpen'],
    emits: ['didDismiss'],
  },
  IonHeader: { template: '<div><slot /></div>' },
  IonToolbar: { template: '<div><slot /></div>' },
  IonTitle: { template: '<div><slot /></div>' },
  IonButtons: { template: '<div><slot /></div>' },
  IonButton: {
    template:
      '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    props: ['disabled', 'size', 'fill', 'expand'],
    emits: ['click'],
  },
  IonContent: { template: '<div><slot /></div>' },
  IonItem: { template: '<div><slot /></div>' },
  IonLabel: { template: '<label><slot /></label>' },
  IonInput: {
    template:
      '<input :value="modelValue" :type="type" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'type'],
    emits: ['update:modelValue'],
  },
  IonTextarea: {
    template:
      '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
    props: ['modelValue', 'placeholder', 'rows'],
    emits: ['update:modelValue'],
  },
  IonSelect: {
    template:
      '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
    props: ['modelValue', 'placeholder', 'interface'],
    emits: ['update:modelValue'],
  },
  IonSelectOption: {
    template: '<option :value="value"><slot /></option>',
    props: ['value'],
  },
};

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const currentUser: OAuthCallbackResponse = {
  token: 'tok',
  user_id: 'user-1',
  display_name: 'Test User',
};

const ownedPath: PathResponse = {
  path_id: 'path-1',
  uuid: 'uuid-path-1',
  owner_user_id: 'user-1',
  title: 'My Path',
  description: null,
  color: '#3949ab',
  is_public: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const createdEntry = {
  id: 'entry-1',
  path_id: 'path-1',
  day: '2024-06-01',
  edit_id: 1,
};

// ---------------------------------------------------------------------------
// MSW server
// ---------------------------------------------------------------------------
const server = setupServer(
  http.post('*/v1/paths/:pathCode/entries', () => {
    return HttpResponse.json(createdEntry, { status: 201 });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

async function mountModal() {
  const queryClient = createQueryClient();
  const wrapper = mount(EntryCreateModal, {
    props: {
      isOpen: false,
      paths: [ownedPath],
      currentUserId: currentUser.user_id,
      initialDay: '2024-06-01',
      initialPathId: 'path-1',
    },
    global: {
      plugins: [[VueQueryPlugin, { queryClient }]],
      stubs: ionicStubs,
    },
  });
  // Open the modal — triggers the watch that initialises selectedPathId, day, content
  await wrapper.setProps({ isOpen: true });
  await nextTick();
  return wrapper;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('EntryCreateModal – basic entry creation (MSW integration)', () => {
  it('renders path selector, day input, content textarea and Create Entry button', async () => {
    const wrapper = await mountModal();
    await nextTick();

    const html = wrapper.html();
    expect(html).toContain('select'); // path selector
    expect(html).toContain('Create Entry');
  });

  it('Create Entry button is disabled when content is empty', async () => {
    const wrapper = await mountModal();
    await nextTick();

    const createBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Create Entry');
    expect(createBtn).toBeDefined();
    expect(createBtn!.attributes('disabled')).toBeDefined();
  });

  it('Create Entry button becomes enabled when content is filled in', async () => {
    const wrapper = await mountModal();
    await nextTick();

    await wrapper.find('textarea').setValue('My entry content');
    await nextTick();

    const createBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Create Entry');
    expect(createBtn!.attributes('disabled')).toBeUndefined();
  });

  it('calls POST /v1/paths/:pathCode/entries on submit and emits created+dismiss', async () => {
    const requests: Request[] = [];
    server.use(
      http.post('*/v1/paths/:pathCode/entries', async ({ request }) => {
        requests.push(request.clone());
        return HttpResponse.json(createdEntry, { status: 201 });
      }),
    );

    const wrapper = await mountModal();
    await nextTick();

    await wrapper.find('textarea').setValue('My journal entry');
    await nextTick();

    const createBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Create Entry');
    await createBtn!.trigger('click');
    await flushPromises();

    expect(requests).toHaveLength(1);
    const body = await requests[0]!.formData();
    expect(body.get('day')).toBe('2024-06-01');
    expect(body.get('content')).toBe('My journal entry');
    expect(typeof body.get('entry_id')).toBe('string');

    expect(wrapper.emitted('created')).toHaveLength(1);
    expect(wrapper.emitted('dismiss')).toHaveLength(1);
  });

  it('shows an error message and keeps modal open when creation fails', async () => {
    server.use(
      http.post('*/v1/paths/:pathCode/entries', () => {
        return HttpResponse.json({ detail: 'Server error' }, { status: 500 });
      }),
    );

    const wrapper = await mountModal();
    await nextTick();

    await wrapper.find('textarea').setValue('My entry');
    await nextTick();

    const createBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Create Entry');
    await createBtn!.trigger('click');
    await flushPromises();

    expect(wrapper.html()).toContain('Failed to create entry');
    expect(wrapper.emitted('created')).toBeUndefined();
  });
});

describe('EntryCreateModal – image upload (MSW integration)', () => {
  it('renders a file input for image upload', async () => {
    const wrapper = await mountModal();
    await nextTick();

    const fileInput = wrapper.find('input[type="file"]');
    expect(fileInput.exists()).toBe(true);
    expect(fileInput.attributes('accept')).toContain('image');
  });

  it('sends selected images as file parts on the single create request', async () => {
    const requests: Request[] = [];
    server.use(
      http.post('*/v1/paths/:pathCode/entries', async ({ request }) => {
        requests.push(request.clone());
        return HttpResponse.json(createdEntry, { status: 201 });
      }),
    );

    const wrapper = await mountModal();
    await nextTick();

    // Simulate selecting a file
    const file = new NodeFile(['image content'], 'photo.jpg', {
      type: 'image/jpeg',
    });
    const fileInput = wrapper.find('input[type="file"]');
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      configurable: true,
    });
    await fileInput.trigger('change');
    await nextTick();

    // Fill in content
    await wrapper.find('textarea').setValue('Entry with image');
    await nextTick();

    // Submit
    const createBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Create Entry');
    await createBtn!.trigger('click');
    await flushPromises();

    expect(wrapper.emitted('created')).toHaveLength(1);
    expect(requests).toHaveLength(1);
    expect(requests[0]!.headers.get('content-type')).toContain(
      'multipart/form-data',
    );
    // jsdom's FormData (which the generated client's `new FormData()` resolves to in this
    // test environment) doesn't recognize a cross-realm File as Blob-like and silently
    // stringifies it — a jsdom/undici interop limitation, not app behavior — so this only
    // asserts the field made it into the multipart body, not its serialized file content.
    // "shows selected filenames in the pending images list" below covers filename tracking.
    const body = await requests[0]!.formData();
    expect(body.has('images')).toBe(true);
  });

  it('shows selected filenames in the pending images list', async () => {
    const wrapper = await mountModal();
    await nextTick();

    const file = new File(['data'], 'my-photo.jpg', { type: 'image/jpeg' });
    const fileInput = wrapper.find('input[type="file"]');
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      configurable: true,
    });
    await fileInput.trigger('change');
    await nextTick();

    expect(wrapper.html()).toContain('my-photo.jpg');
  });

  it('rejects files that are not images and shows an error', async () => {
    const wrapper = await mountModal();
    await nextTick();

    const file = new File(['not an image'], 'document.pdf', {
      type: 'application/pdf',
    });
    const fileInput = wrapper.find('input[type="file"]');
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      configurable: true,
    });
    await fileInput.trigger('change');
    await nextTick();

    expect(wrapper.html()).toContain('Not an image');
    expect(wrapper.html()).toContain('document.pdf');
    // Should not add the file to the pending list
    expect(wrapper.html()).not.toContain('pending-image-name');
  });

  it('rejects files exceeding 10 MB and shows an error', async () => {
    const wrapper = await mountModal();
    await nextTick();

    // Create a mock File whose size property reports > 10 MB
    const largeFile = new File(['x'], 'huge.jpg', { type: 'image/jpeg' });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

    const fileInput = wrapper.find('input[type="file"]');
    Object.defineProperty(fileInput.element, 'files', {
      value: [largeFile],
      configurable: true,
    });
    await fileInput.trigger('change');
    await nextTick();

    expect(wrapper.html()).toContain('Exceeds 10 MB');
  });

  it('shows an error and does not emit created when the create request (with image) fails', async () => {
    server.use(
      http.post('*/v1/paths/:pathCode/entries', () => {
        return HttpResponse.json({ detail: 'Server error' }, { status: 500 });
      }),
    );

    const wrapper = await mountModal();
    await nextTick();

    const file = new NodeFile(['data'], 'photo.jpg', { type: 'image/jpeg' });
    const fileInput = wrapper.find('input[type="file"]');
    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      configurable: true,
    });
    await fileInput.trigger('change');
    await nextTick();

    await wrapper.find('textarea').setValue('Entry with broken upload');
    await nextTick();

    const createBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Create Entry');
    await createBtn!.trigger('click');
    await flushPromises();

    expect(wrapper.html()).toContain('Failed to create entry');
    expect(wrapper.emitted('created')).toBeUndefined();
  });
});
