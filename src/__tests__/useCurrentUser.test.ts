import { beforeEach, describe, expect, it } from 'vitest';

import { useCurrentUser } from '../composables/useCurrentUser';

describe('useCurrentUser', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reads the stored user on setup', () => {
    localStorage.setItem(
      'user',
      JSON.stringify({ user_id: 'user-1', display_name: 'Alex', token: 'tok' }),
    );

    const { currentUser, currentUserId } = useCurrentUser();

    expect(currentUser.value?.display_name).toBe('Alex');
    expect(currentUserId.value).toBe('user-1');
  });

  it('returns an empty user when storage is missing or invalid', () => {
    localStorage.setItem('user', '{bad json');

    const { currentUser, currentUserId } = useCurrentUser();

    expect(currentUser.value).toBeNull();
    expect(currentUserId.value).toBe('');
  });

  it('refreshes after storage changes', () => {
    const { currentUser, currentUserId, refresh } = useCurrentUser();

    expect(currentUser.value).toBeNull();

    localStorage.setItem(
      'user',
      JSON.stringify({
        user_id: 'user-2',
        display_name: 'Casey',
        token: 'tok',
      }),
    );
    refresh();

    expect(currentUser.value?.display_name).toBe('Casey');
    expect(currentUserId.value).toBe('user-2');
  });
});
