import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockMatches = { value: false };
const mockMediaQuery = {
  get matches() {
    return mockMatches.value;
  },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

function setUserAgent(ua: string, maxTouchPoints = 0) {
  vi.stubGlobal('navigator', {
    userAgent: ua,
    maxTouchPoints,
    standalone: undefined,
  });
}

describe('useInstallBanner', () => {
  beforeEach(() => {
    mockMatches.value = false;
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => mockMediaQuery),
    );
    vi.resetModules();
  });

  it('never shows the iOS hint on Chrome/Android, where beforeinstallprompt works', async () => {
    setUserAgent(
      'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/119.0 Mobile Safari/537.36',
    );
    const { useInstallBanner } =
      await import('../composables/useInstallBanner');
    const { showIosInstallHint } = useInstallBanner();
    expect(showIosInstallHint.value).toBe(false);
  });

  it('shows the iOS hint on iPhone Safari, which never fires beforeinstallprompt', async () => {
    setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
    );
    const { useInstallBanner } =
      await import('../composables/useInstallBanner');
    const { showIosInstallHint } = useInstallBanner();
    expect(showIosInstallHint.value).toBe(true);
  });

  it('shows the iOS hint on iPadOS Safari despite its desktop-Mac user agent', async () => {
    setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15',
      5,
    );
    const { useInstallBanner } =
      await import('../composables/useInstallBanner');
    const { showIosInstallHint } = useInstallBanner();
    expect(showIosInstallHint.value).toBe(true);
  });

  it('does not show the iOS hint once the app is already installed (standalone)', async () => {
    setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
    );
    mockMatches.value = true;
    const { useInstallBanner } =
      await import('../composables/useInstallBanner');
    const { showIosInstallHint } = useInstallBanner();
    expect(showIosInstallHint.value).toBe(false);
  });

  it('hides the iOS hint for the rest of the session after it is dismissed', async () => {
    setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
    );
    const { useInstallBanner } =
      await import('../composables/useInstallBanner');
    const { showIosInstallHint, dismissInstall } = useInstallBanner();
    expect(showIosInstallHint.value).toBe(true);
    dismissInstall();
    expect(showIosInstallHint.value).toBe(false);
  });
});
