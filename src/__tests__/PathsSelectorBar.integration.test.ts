/**
 * Integration tests for PathsSelectorBar create-path flow.
 *
 * These tests use MSW (via setupServer) to intercept real HTTP requests made
 * by the generated API client, ensuring the full request/response cycle is
 * exercised rather than mocking customFetch directly.
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

import PathsSelectorBar from '../components/PathsSelectorBar.vue';
import type { PathResponse, OAuthCallbackResponse } from '../generated/types';

// ---------------------------------------------------------------------------
// Mock the Dexie db (IndexedDB not available in jsdom)
// ---------------------------------------------------------------------------
vi.mock('../lib/db', () => ({
  isPathHidden: vi.fn().mockResolvedValue(false),
  setPathHidden: vi.fn().mockResolvedValue(undefined),
  isPathDeleted: vi.fn().mockResolvedValue(false),
  setPathDeleted: vi.fn().mockResolvedValue(undefined),
  getPathOrder: vi.fn().mockReturnValue([]),
  setPathOrder: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Stub Ionic components (web components don't run in jsdom)
// ---------------------------------------------------------------------------
const ionicStubs = {
  IonButton: {
    template:
      '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    props: ['disabled', 'size', 'fill'],
    emits: ['click'],
  },
  IonCard: { template: '<div><slot /></div>' },
  IonCardContent: { template: '<div><slot /></div>' },
  IonChip: { template: '<span><slot /></span>' },
  IonInput: {
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'placeholder'],
    emits: ['update:modelValue'],
  },
  IonItem: { template: '<div><slot /></div>' },
  IonLabel: { template: '<label><slot /></label>' },
  IonList: { template: '<ul><slot /></ul>' },
  IonToggle: {
    template:
      '<input type="checkbox" :checked="checked" @change="$emit(\'ionChange\', { detail: { checked: $event.target.checked } })" />',
    props: ['checked'],
    emits: ['ionChange'],
  },
};

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------
const currentUser: OAuthCallbackResponse = {
  token: 'tok',
  user_id: 'user-1',
  display_name: 'Test User',
};

const existingPath: PathResponse = {
  path_id: 'path-1',
  uuid: 'uuid-path-1',
  owner_user_id: 'user-1',
  title: 'Existing Path',
  description: null,
  color: '#3949ab',
  is_public: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const createdPath: PathResponse = {
  path_id: 'path-2',
  uuid: 'uuid-path-2',
  owner_user_id: 'user-1',
  title: 'New Integration Path',
  description: null,
  color: '#3949ab',
  is_public: false,
  created_at: '2024-01-02T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
};

// ---------------------------------------------------------------------------
// MSW server
// ---------------------------------------------------------------------------
const server = setupServer(
  http.get('*/v1/paths', () => {
    return HttpResponse.json([existingPath], { status: 200 });
  }),
  http.post('*/v1/paths', () => {
    return HttpResponse.json(createdPath, { status: 201 });
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

async function mountAndOpenForm() {
  const queryClient = createQueryClient();
  const wrapper = mount(PathsSelectorBar, {
    props: { currentUser },
    global: {
      plugins: [[VueQueryPlugin, { queryClient }]],
      stubs: ionicStubs,
    },
  });

  await flushPromises();

  // The "+ New Path" button opens the create form (and expands the panel)
  const newPathBtn = wrapper
    .findAll('button')
    .find((b) => b.text().includes('New Path'));
  expect(newPathBtn).toBeDefined();
  await newPathBtn!.trigger('click');
  await nextTick();

  return wrapper;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('PathsSelectorBar – create path (MSW integration)', () => {
  it('renders the create form when "+ New Path" is clicked', async () => {
    const wrapper = await mountAndOpenForm();
    // The Create and Cancel buttons should now be visible
    const buttons = wrapper.findAll('button').map((b) => b.text().trim());
    expect(buttons).toContain('Create');
    expect(buttons).toContain('Cancel');
  });

  it('Create button is disabled when title is empty', async () => {
    const wrapper = await mountAndOpenForm();
    const createBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Create');
    expect(createBtn).toBeDefined();
    expect(createBtn!.attributes('disabled')).toBeDefined();
  });

  it('Create button becomes enabled after a title is entered', async () => {
    const wrapper = await mountAndOpenForm();

    // Find the title input (first ion-input stub = first <input> inside the form)
    const inputs = wrapper
      .findAll('input')
      .filter((i) => i.attributes('type') !== 'checkbox');
    expect(inputs.length).toBeGreaterThan(0);
    await inputs[0].setValue('My New Path');
    await nextTick();

    const createBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Create');
    expect(createBtn).toBeDefined();
    expect(createBtn!.attributes('disabled')).toBeUndefined();
  });

  it('Create button is re-disabled when the title is cleared', async () => {
    const wrapper = await mountAndOpenForm();

    const inputs = wrapper
      .findAll('input')
      .filter((i) => i.attributes('type') !== 'checkbox');
    await inputs[0].setValue('Some title');
    await nextTick();

    const createBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Create');
    expect(createBtn!.attributes('disabled')).toBeUndefined();

    // Clear the title
    await inputs[0].setValue('');
    await nextTick();

    expect(createBtn!.attributes('disabled')).toBeDefined();
  });

  it('calls POST /v1/paths with the correct payload when Create is clicked', async () => {
    const requests: Request[] = [];
    server.use(
      http.post('*/v1/paths', async ({ request }) => {
        requests.push(request.clone());
        return HttpResponse.json(createdPath, { status: 201 });
      }),
    );

    const wrapper = await mountAndOpenForm();

    const inputs = wrapper
      .findAll('input')
      .filter((i) => i.attributes('type') !== 'checkbox');
    await inputs[0].setValue('My New Path');
    await nextTick();

    const createBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Create');
    await createBtn!.trigger('click');
    await flushPromises();

    expect(requests).toHaveLength(1);
    const body = await requests[0]!.json();
    expect(body.title).toBe('My New Path');
  });

  it('closes the form and resets fields after successful creation', async () => {
    const wrapper = await mountAndOpenForm();

    const inputs = wrapper
      .findAll('input')
      .filter((i) => i.attributes('type') !== 'checkbox');
    await inputs[0].setValue('My New Path');
    await nextTick();

    const createBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Create');
    await createBtn!.trigger('click');
    await flushPromises();

    // The form should be hidden after successful creation
    const buttons = wrapper.findAll('button').map((b) => b.text().trim());
    expect(buttons).not.toContain('Create');
    expect(buttons).not.toContain('Cancel');
  });

  it('shows an error and keeps the form open if creation fails', async () => {
    server.use(
      http.post('*/v1/paths', () => {
        return HttpResponse.json({ detail: 'Server error' }, { status: 500 });
      }),
    );

    const wrapper = await mountAndOpenForm();

    const inputs = wrapper
      .findAll('input')
      .filter((i) => i.attributes('type') !== 'checkbox');
    await inputs[0].setValue('My New Path');
    await nextTick();

    const createBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Create');
    await createBtn!.trigger('click');
    await flushPromises();

    // Form should still be visible
    expect(wrapper.text()).toContain('Cancel');
    // Error message should appear
    expect(wrapper.text()).toContain('Failed to create path');
  });

  it('invalidates the paths query after successful creation so the list refreshes', async () => {
    const queryClient = createQueryClient();
    // Seed the query cache with the initial path list
    queryClient.setQueryData(['v1', 'paths'], {
      data: [existingPath],
      status: 200,
      headers: new Headers(),
    });

    const wrapper = mount(PathsSelectorBar, {
      props: { currentUser },
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
        stubs: ionicStubs,
      },
    });

    await flushPromises();

    // Verify the existing path is rendered first
    expect(wrapper.text()).toContain('Existing Path');

    // Open the create form and enter a title
    const newPathBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('New Path'));
    await newPathBtn!.trigger('click');
    await nextTick();

    const inputs = wrapper
      .findAll('input')
      .filter((i) => i.attributes('type') !== 'checkbox');
    await inputs[0].setValue('New Integration Path');
    await nextTick();

    // After POST succeeds the query should be marked stale (invalidated)
    const spyInvalidate = vi.spyOn(queryClient, 'invalidateQueries');

    const createBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Create');
    await createBtn!.trigger('click');
    await flushPromises();

    // invalidateQueries must have been called with the paths query key
    expect(spyInvalidate).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['v1', 'paths'] }),
    );
  });

  it('Cancel button closes the form without creating a path', async () => {
    const createRequests: Request[] = [];
    server.use(
      http.post('*/v1/paths', async ({ request }) => {
        createRequests.push(request.clone());
        return HttpResponse.json(createdPath, { status: 201 });
      }),
    );

    const wrapper = await mountAndOpenForm();

    const inputs = wrapper
      .findAll('input')
      .filter((i) => i.attributes('type') !== 'checkbox');
    await inputs[0].setValue('Some title');
    await nextTick();

    const cancelBtn = wrapper
      .findAll('button')
      .find((b) => b.text().trim() === 'Cancel');
    await cancelBtn!.trigger('click');
    await nextTick();

    // Form should be hidden
    const buttons = wrapper.findAll('button').map((b) => b.text().trim());
    expect(buttons).not.toContain('Create');
    // No API call was made
    expect(createRequests).toHaveLength(0);
  });
});
