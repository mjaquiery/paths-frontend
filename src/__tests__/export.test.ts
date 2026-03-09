import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import {
  isExportReady,
  isExportTerminal,
  downloadFileFromUrl,
} from '../utils/export';

describe('export status', () => {
  it('recognizes ready state', () => {
    expect(
      isExportReady({
        id: '1',
        state: 'ready',
        requested_path_ids: [],
        created_at: '',
        updated_at: '',
        expires_at: null,
        failure_code: null,
        attempt_count: 1,
      }),
    ).toBe(true);
  });

  it('treats failed and expired as terminal', () => {
    expect(
      isExportTerminal({
        id: '1',
        state: 'failed',
        requested_path_ids: [],
        created_at: '',
        updated_at: '',
        expires_at: null,
        failure_code: null,
        attempt_count: 1,
      }),
    ).toBe(true);
  });
});

describe('downloadFileFromUrl', () => {
  let anchorClickSpy: ReturnType<typeof vi.fn>;
  let anchorElement: HTMLAnchorElement;

  beforeEach(() => {
    anchorClickSpy = vi.fn();
    anchorElement = {
      href: '',
      download: '',
      click: anchorClickSpy,
    } as unknown as HTMLAnchorElement;

    vi.spyOn(document, 'createElement').mockReturnValue(anchorElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation(
      () => anchorElement,
    );
    vi.spyOn(document.body, 'removeChild').mockImplementation(
      () => anchorElement,
    );

    const mockBlob = new Blob(['{}'], { type: 'application/json' });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches the url and triggers a download with the given filename', async () => {
    await downloadFileFromUrl('https://example.com/export.json', 'export.json');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com/export.json',
    );
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(anchorElement.download).toBe('export.json');
    expect(anchorClickSpy).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('throws if the response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(
      downloadFileFromUrl('https://example.com/missing.json', 'export.json'),
    ).rejects.toThrow('Download failed: 404 Not Found');
  });
});
