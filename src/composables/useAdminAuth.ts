import { ref, computed } from 'vue';

const ADMIN_TOKEN_KEY = 'admin_token';

function readStoredAdminToken(): string | null {
  try {
    if (
      typeof localStorage === 'undefined' ||
      typeof localStorage.getItem !== 'function'
    ) {
      return null;
    }
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeAdminToken(token: string | null): void {
  try {
    if (
      typeof localStorage === 'undefined' ||
      typeof localStorage.setItem !== 'function'
    ) {
      return;
    }
    if (token === null) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } else {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    }
  } catch {
    // ignore storage errors
  }
}

export function useAdminAuth() {
  const adminToken = ref<string | null>(readStoredAdminToken());

  const isAdminLoggedIn = computed(() => adminToken.value !== null);

  function storeToken(token: string) {
    adminToken.value = token;
    writeAdminToken(token);
  }

  function clearToken() {
    adminToken.value = null;
    writeAdminToken(null);
  }

  /**
   * Returns HTTP headers to authenticate an admin API call.
   * Throws if not logged in.
   */
  function getAdminAuthHeaders(): Record<string, string> {
    if (!adminToken.value) {
      throw new Error('Admin not authenticated');
    }
    return { Authorization: `Bearer ${adminToken.value}` };
  }

  return {
    adminToken,
    isAdminLoggedIn,
    storeToken,
    clearToken,
    getAdminAuthHeaders,
  };
}
