/**
 * Integration tests for EntryEditModal – entry editing with image management.
 *
 * Uses MSW setupServer to intercept the real HTTP calls made by the generated
 * API client (PUT /v1/paths/:pathCode/entries/:entrySlug).
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

import EntryEditModal from '../components/EntryEditModal.vue';
import type { EntryDetailData } from '../components/EntryDetailModal.vue';
import type { ImageResponse } from '../generated/types';

// ---------------------------------------------------------------------------
// Mock Dexie
// ---------------------------------------------------------------------------
vi.mock('../lib/db', () => ({
  db: {
    entryContent: {
      get: vi.fn().mockResolvedValue(undefined),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    },
    entryImages: {
      where: vi.fn().mockReturnValue({
        equals: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
          delete: vi.fn().mockResolvedValue(0),
        }),
      }),
      bulkPut: vi.fn().mockResolvedValue(undefined),
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
    props: ['disabled', 'size', 'fill', 'expand', 'color'],
    emits: ['click'],
  },
  IonContent: { template: '<div><slot /></div>' },
  IonFooter: { template: '<div><slot /></div>' },
  IonItem: { template: '<div><slot /></div>' },
  IonLabel: { template: '<label><slot /></label>' },
  IonTextarea: {
    template:
      '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
    props: ['modelValue', 'placeholder', 'rows'],
    emits: ['update:modelValue'],
  },
};

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const existingImage: ImageResponse = {
  id: 'img-uuid-1',
  entry_id: 'entry-1',
  filename: 'morning-walk.jpg',
  status: 'complete',
  strip_metadata: false,
  content_type: 'image/jpeg',
  byte_size: 204800,
};

const entryWithImage: EntryDetailData = {
  pathId: 'path-1',
  entryId: 'entry-1',
  pathTitle: 'My Path',
  color: '#3949ab',
  day: '2024-06-01',
  content: 'Original content',
  hasImages: true,
  images: [existingImage],
  edit_id: 3,
  canEdit: true,
};

const entryNoImage: EntryDetailData = {
  pathId: 'path-1',
  entryId: 'entry-2',
  pathTitle: 'My Path',
  color: '#3949ab',
  day: '2024-06-02',
  content: 'Entry without images',
  hasImages: false,
  images: [],
  edit_id: 5,
  canEdit: true,
};

const updatedEntry = {
  id: 'entry-1',
  path_id: 'path-1',
  day: '2024-06-01',
  edit_id: 4,
};

// ---------------------------------------------------------------------------
// MSW server
// ---------------------------------------------------------------------------
const server = setupServer(
  http.put('*/v1/paths/:pathCode/entries/:entrySlug', () => {
    return HttpResponse.json(updatedEntry, { status: 200 });
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

async function mountEditModal(entry: EntryDetailData = entryWithImage) {
  const queryClient = createQueryClient();
  const wrapper = mount(EntryEditModal, {
    props: {
      isOpen: false,
      entry,
    },
    global: {
      plugins: [[VueQueryPlugin, { queryClient }]],
      stubs: ionicStubs,
    },
  });
  await wrapper.setProps({ isOpen: true });
  await nextTick();
  return wrapper;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('EntryEditModal – basic rendering', () => {
  it('renders textarea pre-filled with existing content', async () => {
    const wrapper = await mountEditModal();

    const textarea = wrapper.find('textarea');
    expect(textarea.exists()).toBe(true);
    expect(textarea.element.value).toBe('Original content');
  });

  it('Save Changes button is disabled when content is empty', async () => {
    const wrapper = await mountEditModal();

    await wrapper.find('textarea').setValue('');
    await nextTick();

    const saveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Save Changes');
    expect(saveBtn).toBeDefined();
    expect(saveBtn!.attributes('disabled')).toBeDefined();
  });

  it('Save Changes button is enabled when content is non-empty', async () => {
    const wrapper = await mountEditModal();

    await nextTick();

    const saveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Save Changes');
    expect(saveBtn!.attributes('disabled')).toBeUndefined();
  });

  it('shows existing images in the kept list', async () => {
    const wrapper = await mountEditModal();

    expect(wrapper.html()).toContain('morning-walk.jpg');
  });
});

describe('EntryEditModal – image management', () => {
  it('moving an image to removed list shows it with strikethrough class', async () => {
    const wrapper = await mountEditModal();

    // Click the ✕ button for the first image
    const removeBtn = wrapper.find('button[aria-label="Remove image morning-walk.jpg"]');
    expect(removeBtn.exists()).toBe(true);
    await removeBtn.trigger('click');
    await nextTick();

    // Image should now appear in the removed section
    expect(wrapper.find('.existing-image-item--removed').exists()).toBe(true);
  });

  it('restoring an image moves it back to the kept list', async () => {
    const wrapper = await mountEditModal();

    // Remove it first
    await wrapper
      .find('button[aria-label="Remove image morning-walk.jpg"]')
      .trigger('click');
    await nextTick();

    // Now restore it
    const restoreBtn = wrapper.find('button[aria-label="Restore image morning-walk.jpg"]');
    expect(restoreBtn.exists()).toBe(true);
    await restoreBtn.trigger('click');
    await nextTick();

    // Should be back in kept list (no removed items)
    expect(wrapper.find('.existing-image-item--removed').exists()).toBe(false);
  });
});

describe('EntryEditModal – submit behaviour', () => {
  it('calls PUT with expected_edit_id and updated content', async () => {
    const requests: Request[] = [];
    server.use(
      http.put('*/v1/paths/:pathCode/entries/:entrySlug', async ({ request }) => {
        requests.push(request.clone());
        return HttpResponse.json(updatedEntry, { status: 200 });
      }),
    );

    const wrapper = await mountEditModal(entryNoImage);
    await nextTick();

    await wrapper.find('textarea').setValue('Updated content');
    await nextTick();

    const saveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Save Changes');
    await saveBtn!.trigger('click');
    await flushPromises();

    expect(requests).toHaveLength(1);
    const body = (await requests[0]!.json()) as Record<string, unknown>;
    expect(body.expected_edit_id).toBe(5);
    expect(body.content).toBe('Updated content');

    expect(wrapper.emitted('saved')).toHaveLength(1);
    expect(wrapper.emitted('dismiss')).toHaveLength(1);
  });

  it('sends only the remaining image filenames after removal', async () => {
    const requests: Request[] = [];
    server.use(
      http.put('*/v1/paths/:pathCode/entries/:entrySlug', async ({ request }) => {
        requests.push(request.clone());
        return HttpResponse.json(updatedEntry, { status: 200 });
      }),
    );

    const wrapper = await mountEditModal(entryWithImage);
    await nextTick();

    // Remove the existing image
    await wrapper
      .find('button[aria-label="Remove image morning-walk.jpg"]')
      .trigger('click');
    await nextTick();

    const saveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Save Changes');
    await saveBtn!.trigger('click');
    await flushPromises();

    expect(requests).toHaveLength(1);
    const body = (await requests[0]!.json()) as Record<string, unknown>;
    expect(body.image_filenames).toEqual([]);
  });

  it('shows conflict error on 409 response', async () => {
    server.use(
      http.put('*/v1/paths/:pathCode/entries/:entrySlug', () => {
        return HttpResponse.json(
          {
            detail: {
              error: { message: 'Conflict' },
              expected_edit_id: 3,
              current_edit_id: 4,
            },
          },
          { status: 409 },
        );
      }),
    );

    const wrapper = await mountEditModal();
    await nextTick();

    const saveBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Save Changes');
    await saveBtn!.trigger('click');
    await flushPromises();

    expect(wrapper.html()).toContain('edited by someone else');
    expect(wrapper.emitted('saved')).toBeUndefined();
    expect(wrapper.emitted('dismiss')).toBeUndefined();
  });
});
