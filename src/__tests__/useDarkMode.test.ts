import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// We need to mock matchMedia before the module is imported
const mockMatches = { value: false };
const mockListeners: Array<(e: MediaQueryListEvent) => void> = [];

const mockMediaQuery = {
  get matches() {
    return mockMatches.value;
  },
  addEventListener: vi.fn((_: string, fn: (e: MediaQueryListEvent) => void) => {
    mockListeners.push(fn);
  }),
  removeEventListener: vi.fn(),
};

vi.stubGlobal(
  'matchMedia',
  vi.fn(() => mockMediaQuery),
);

// Stub localStorage
const localStorageStore: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => localStorageStore[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key];
  }),
});

describe('useDarkMode', () => {
  let classListToggleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Reset state between tests
    mockMatches.value = false;
    mockListeners.length = 0;
    for (const key of Object.keys(localStorageStore)) {
      delete localStorageStore[key];
    }
    classListToggleSpy = vi
      .spyOn(document.documentElement.classList, 'toggle')
      .mockImplementation(() => false);
    vi.resetModules();
  });

  afterEach(() => {
    classListToggleSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('defaults to system preference (light) when no localStorage value', async () => {
    const { useDarkMode } = await import('../composables/useDarkMode');
    const { isDark, preference } = useDarkMode();
    expect(preference.value).toBe('system');
    expect(isDark.value).toBe(false);
    expect(classListToggleSpy).toHaveBeenCalledWith('ion-palette-dark', false);
  });

  it('defaults to system preference (dark) when OS prefers dark', async () => {
    mockMatches.value = true;
    const { useDarkMode } = await import('../composables/useDarkMode');
    const { isDark, preference } = useDarkMode();
    expect(preference.value).toBe('system');
    expect(isDark.value).toBe(true);
    expect(classListToggleSpy).toHaveBeenCalledWith('ion-palette-dark', true);
  });

  it('restores dark preference from localStorage', async () => {
    localStorageStore['darkModePreference'] = 'dark';
    const { useDarkMode } = await import('../composables/useDarkMode');
    const { isDark, preference } = useDarkMode();
    expect(preference.value).toBe('dark');
    expect(isDark.value).toBe(true);
  });

  it('restores light preference from localStorage', async () => {
    localStorageStore['darkModePreference'] = 'light';
    const { useDarkMode } = await import('../composables/useDarkMode');
    const { isDark, preference } = useDarkMode();
    expect(preference.value).toBe('light');
    expect(isDark.value).toBe(false);
  });

  it('toggle from system (dark OS) switches to light', async () => {
    mockMatches.value = true;
    // No localStorage set -> preference is 'system', isDark is true
    const { useDarkMode } = await import('../composables/useDarkMode');
    const { isDark, toggle } = useDarkMode();
    expect(isDark.value).toBe(true);
    toggle();
    await new Promise((r) => setTimeout(r, 0));
    expect(isDark.value).toBe(false);
    expect(localStorageStore['darkModePreference']).toBe('light');
  });

  it('toggle switches from dark to light', async () => {
    localStorageStore['darkModePreference'] = 'dark';
    const { useDarkMode } = await import('../composables/useDarkMode');
    const { isDark, toggle } = useDarkMode();
    expect(isDark.value).toBe(true);
    toggle();
    // Wait for watcher
    await new Promise((r) => setTimeout(r, 0));
    expect(isDark.value).toBe(false);
    expect(localStorageStore['darkModePreference']).toBe('light');
  });

  it('toggle switches from light to dark', async () => {
    localStorageStore['darkModePreference'] = 'light';
    const { useDarkMode } = await import('../composables/useDarkMode');
    const { isDark, toggle } = useDarkMode();
    expect(isDark.value).toBe(false);
    toggle();
    await new Promise((r) => setTimeout(r, 0));
    expect(isDark.value).toBe(true);
    expect(localStorageStore['darkModePreference']).toBe('dark');
  });
});
