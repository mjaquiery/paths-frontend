import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAdminAuth } from '../composables/useAdminAuth';

const ADMIN_TOKEN_KEY = 'admin_token';

describe('useAdminAuth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('initialises with no token when localStorage is empty', () => {
    const { adminToken, isAdminLoggedIn } = useAdminAuth();
    expect(adminToken.value).toBeNull();
    expect(isAdminLoggedIn.value).toBe(false);
  });

  it('reads an existing token from localStorage on init', () => {
    localStorage.setItem(ADMIN_TOKEN_KEY, 'existing-token');
    const { adminToken, isAdminLoggedIn } = useAdminAuth();
    expect(adminToken.value).toBe('existing-token');
    expect(isAdminLoggedIn.value).toBe(true);
  });

  it('storeToken sets the reactive ref and persists to localStorage', () => {
    const { adminToken, isAdminLoggedIn, storeToken } = useAdminAuth();
    storeToken('my-admin-token');
    expect(adminToken.value).toBe('my-admin-token');
    expect(isAdminLoggedIn.value).toBe(true);
    expect(localStorage.getItem(ADMIN_TOKEN_KEY)).toBe('my-admin-token');
  });

  it('clearToken nulls the reactive ref and removes from localStorage', () => {
    localStorage.setItem(ADMIN_TOKEN_KEY, 'some-token');
    const { adminToken, isAdminLoggedIn, clearToken } = useAdminAuth();
    clearToken();
    expect(adminToken.value).toBeNull();
    expect(isAdminLoggedIn.value).toBe(false);
    expect(localStorage.getItem(ADMIN_TOKEN_KEY)).toBeNull();
  });

  it('getAdminAuthHeaders returns correct Authorization header when logged in', () => {
    const { storeToken, getAdminAuthHeaders } = useAdminAuth();
    storeToken('secret-token');
    const headers = getAdminAuthHeaders();
    expect(headers).toEqual({ Authorization: 'Bearer secret-token' });
  });

  it('getAdminAuthHeaders throws when not logged in', () => {
    const { getAdminAuthHeaders } = useAdminAuth();
    expect(() => getAdminAuthHeaders()).toThrow('Admin not authenticated');
  });
});
