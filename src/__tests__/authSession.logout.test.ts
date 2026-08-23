import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/etagStore', () => ({
  clearEtags: vi.fn().mockResolvedValue(undefined),
}));

import { currentUser, setCurrentUser, logout } from '../lib/authSession';
import type { OAuthCallbackResponse } from '../generated/types';

const user: OAuthCallbackResponse = {
  token: 'tok',
  user_id: 'u1',
  display_name: 'Ada',
};

describe('authSession logout', () => {
  beforeEach(() => {
    localStorage.clear();
    currentUser.value = null;
  });

  it('clears the shared currentUser, not just localStorage, so every page reflects the logout', () => {
    setCurrentUser(user);
    expect(currentUser.value?.user_id).toBe('u1');

    logout();

    // Before this fix, settings.vue's logout() only removed the localStorage
    // keys — any page already mounted (Ionic's router-outlet keeps previous
    // pages alive rather than remounting them) kept its own stale, one-shot
    // "currentUser" ref and went on rendering the logged-in view.
    expect(currentUser.value).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('session_token')).toBeNull();
  });

  it('setCurrentUser makes the login immediately visible to every consumer of the shared ref', () => {
    expect(currentUser.value).toBeNull();
    setCurrentUser(user);
    expect(currentUser.value).toEqual(user);
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(user);
  });
});
