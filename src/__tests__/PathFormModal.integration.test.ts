/**
 * Integration tests for PathFormModal's create-path flow (replaces the old
 * PathsSelectorBar inline form, now hosted from settings.vue).
 *
 * These tests use MSW (via setupServer) to intercept real HTTP requests made
 * by the generated API client, ensuring the full request/response cycle is
 * exercised rather than mocking customFetch directly.
 */
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { nextTick } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount, flushPromises } from '@vue/test-utils';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

import PathFormModal from '../components/PathFormModal.vue';
import type { PathResponse } from '../generated/types';

const ionicStubs = {
  IonModal: { template: '<div><slot /></div>' },
  IonContent: { template: '<div><slot /></div>' },
};

const createdPath: PathResponse = {
  path_id: 'path-2',
  uuid: 'uuid-path-2',
  owner_user_id: 'user-1',
  title: 'New Integration Path',
  description: null,
  color: '#5b52f0',
  is_public: false,
  created_at: '2024-01-02T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
};

const server = setupServer(
  http.post('*/v1/paths', () => {
    return HttpResponse.json(createdPath, { status: 201 });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function mountModal() {
  const queryClient = createQueryClient();
  return mount(PathFormModal, {
    props: { isOpen: true, path: null },
    global: {
      plugins: [[VueQueryPlugin, { queryClient }]],
      stubs: ionicStubs,
    },
  });
}

function nameInput(wrapper: ReturnType<typeof mountModal>) {
  return wrapper.find('input.pf-name-input');
}

function submitBtn(wrapper: ReturnType<typeof mountModal>) {
  return wrapper.find('button.pf-pill-btn');
}

describe('PathFormModal – create path (MSW integration)', () => {
  it('renders Create and Cancel controls when opened for a new path', async () => {
    const wrapper = mountModal();
    await nextTick();
    expect(submitBtn(wrapper).text()).toBe('Create');
    expect(wrapper.find('button.pf-text-btn').text()).toBe('Cancel');
  });

  it('Create button is disabled when title is empty', async () => {
    const wrapper = mountModal();
    await nextTick();
    expect(submitBtn(wrapper).attributes('disabled')).toBeDefined();
  });

  it('Create button becomes enabled after a title is entered', async () => {
    const wrapper = mountModal();
    await nextTick();
    await nameInput(wrapper).setValue('My New Path');
    expect(submitBtn(wrapper).attributes('disabled')).toBeUndefined();
  });

  it('Create button is re-disabled when the title is cleared', async () => {
    const wrapper = mountModal();
    await nextTick();
    await nameInput(wrapper).setValue('Some title');
    expect(submitBtn(wrapper).attributes('disabled')).toBeUndefined();

    await nameInput(wrapper).setValue('');
    expect(submitBtn(wrapper).attributes('disabled')).toBeDefined();
  });

  it('calls POST /v1/paths with the correct payload when Create is clicked', async () => {
    const requests: Request[] = [];
    server.use(
      http.post('*/v1/paths', async ({ request }) => {
        requests.push(request.clone());
        return HttpResponse.json(createdPath, { status: 201 });
      }),
    );

    const wrapper = mountModal();
    await nextTick();
    await nameInput(wrapper).setValue('My New Path');
    await submitBtn(wrapper).trigger('click');
    await flushPromises();

    expect(requests).toHaveLength(1);
    const body = await requests[0]!.json();
    expect(body.title).toBe('My New Path');
    expect(body.color).toBe('#5b52f0'); // first swatch, selected by default
  });

  it('emits dismiss and saved after successful creation', async () => {
    const wrapper = mountModal();
    await nextTick();
    await nameInput(wrapper).setValue('My New Path');
    await submitBtn(wrapper).trigger('click');
    await flushPromises();

    expect(wrapper.emitted('dismiss')).toBeTruthy();
    expect(wrapper.emitted('saved')?.[0]?.[0]).toEqual(
      expect.objectContaining({ path_id: 'path-2' }),
    );
  });

  it('shows an error and keeps the form usable if creation fails', async () => {
    server.use(
      http.post('*/v1/paths', () => {
        return HttpResponse.json({ detail: 'Server error' }, { status: 500 });
      }),
    );

    const wrapper = mountModal();
    await nextTick();
    await nameInput(wrapper).setValue('My New Path');
    await submitBtn(wrapper).trigger('click');
    await flushPromises();

    expect(wrapper.emitted('dismiss')).toBeFalsy();
    expect(wrapper.text()).toContain('Failed to create path');
  });

  it('selecting a colour swatch changes the payload colour', async () => {
    const requests: Request[] = [];
    server.use(
      http.post('*/v1/paths', async ({ request }) => {
        requests.push(request.clone());
        return HttpResponse.json(createdPath, { status: 201 });
      }),
    );

    const wrapper = mountModal();
    await nextTick();
    await nameInput(wrapper).setValue('My New Path');
    const swatches = wrapper.findAll('button.pf-swatch');
    expect(swatches.length).toBe(8);
    await swatches[1]!.trigger('click'); // orange
    await submitBtn(wrapper).trigger('click');
    await flushPromises();

    const body = await requests[0]!.json();
    expect(body.color).toBe('#f5a623');
  });
});

describe('PathFormModal – edit path', () => {
  const existingPath: PathResponse = {
    path_id: 'path-1',
    uuid: 'uuid-path-1',
    owner_user_id: 'user-1',
    title: 'Existing Path',
    description: 'Some description',
    color: '#12b6d4',
    is_public: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  it('pre-fills the form with the path being edited', async () => {
    const queryClient = createQueryClient();
    const wrapper = mount(PathFormModal, {
      props: { isOpen: true, path: existingPath },
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
        stubs: ionicStubs,
      },
    });
    await nextTick();

    expect((nameInput(wrapper).element as HTMLInputElement).value).toBe(
      'Existing Path',
    );
    expect(submitBtn(wrapper).text()).toBe('Save');
  });
});
