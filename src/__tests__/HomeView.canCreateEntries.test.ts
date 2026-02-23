import { describe, expect, it } from 'vitest';
import { computed, ref } from 'vue';
import type { OAuthCallbackResponse, PathResponse } from '../generated/types';

/**
 * Unit tests for the canCreateEntries authorization logic used in HomeView.
 * The logic is: currentUser must be set AND the selected path's owner_user_id
 * must match the current user's user_id.
 */
function makeCanCreateEntries(
  currentUser: ReturnType<typeof ref<OAuthCallbackResponse | null>>,
  paths: ReturnType<typeof ref<PathResponse[]>>,
  selectedPathId: ReturnType<typeof ref<string>>,
) {
  const selectedPath = computed(() =>
    paths.value.find((p) => p.path_id === selectedPathId.value),
  );
  return computed(
    () =>
      !!currentUser.value &&
      !!selectedPath.value &&
      selectedPath.value.owner_user_id === currentUser.value.user_id,
  );
}

const basePath: PathResponse = {
  path_id: 'p1',
  uuid: 'uuid-p1',
  owner_user_id: 'u1',
  title: 'My Path',
  description: null,
  color: '#3880ff',
  is_public: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const ownerUser: OAuthCallbackResponse = {
  token: 'tok',
  user_id: 'u1',
  display_name: 'Owner',
};

const otherUser: OAuthCallbackResponse = {
  token: 'tok2',
  user_id: 'u2',
  display_name: 'Other',
};

describe('canCreateEntries (HomeView authorization logic)', () => {
  it('is false when no user is logged in', () => {
    const currentUser = ref<OAuthCallbackResponse | null>(null);
    const paths = ref<PathResponse[]>([basePath]);
    const selectedPathId = ref('p1');
    const canCreateEntries = makeCanCreateEntries(
      currentUser,
      paths,
      selectedPathId,
    );
    expect(canCreateEntries.value).toBe(false);
  });

  it('is false when no path is selected', () => {
    const currentUser = ref<OAuthCallbackResponse | null>(ownerUser);
    const paths = ref<PathResponse[]>([basePath]);
    const selectedPathId = ref('');
    const canCreateEntries = makeCanCreateEntries(
      currentUser,
      paths,
      selectedPathId,
    );
    expect(canCreateEntries.value).toBe(false);
  });

  it('is false when the logged-in user does not own the selected path', () => {
    const currentUser = ref<OAuthCallbackResponse | null>(otherUser);
    const paths = ref<PathResponse[]>([basePath]);
    const selectedPathId = ref('p1');
    const canCreateEntries = makeCanCreateEntries(
      currentUser,
      paths,
      selectedPathId,
    );
    expect(canCreateEntries.value).toBe(false);
  });

  it('is true when the logged-in user owns the selected path', () => {
    const currentUser = ref<OAuthCallbackResponse | null>(ownerUser);
    const paths = ref<PathResponse[]>([basePath]);
    const selectedPathId = ref('p1');
    const canCreateEntries = makeCanCreateEntries(
      currentUser,
      paths,
      selectedPathId,
    );
    expect(canCreateEntries.value).toBe(true);
  });

  it('updates reactively when the selected path changes', () => {
    const ownedPath: PathResponse = { ...basePath, path_id: 'p1' };
    const otherPath: PathResponse = {
      ...basePath,
      path_id: 'p2',
      owner_user_id: 'u2',
    };
    const currentUser = ref<OAuthCallbackResponse | null>(ownerUser);
    const paths = ref<PathResponse[]>([ownedPath, otherPath]);
    const selectedPathId = ref('p1');
    const canCreateEntries = makeCanCreateEntries(
      currentUser,
      paths,
      selectedPathId,
    );

    expect(canCreateEntries.value).toBe(true);
    selectedPathId.value = 'p2';
    expect(canCreateEntries.value).toBe(false);
  });

  it('updates reactively when the user logs out', () => {
    const currentUser = ref<OAuthCallbackResponse | null>(ownerUser);
    const paths = ref<PathResponse[]>([basePath]);
    const selectedPathId = ref('p1');
    const canCreateEntries = makeCanCreateEntries(
      currentUser,
      paths,
      selectedPathId,
    );

    expect(canCreateEntries.value).toBe(true);
    currentUser.value = null;
    expect(canCreateEntries.value).toBe(false);
  });
});
