import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import {
  isExportReady,
  isExportTerminal,
  downloadFileFromUrl,
  exportLocalData,
} from '../utils/export';
import { db } from '../lib/db';

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

describe('exportLocalData', () => {
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
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:local-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('queries entryContent by path_id and triggers a JSON download', async () => {
    const mockEntries = [
      {
        cache_key: 'path-1:entry-1',
        id: 'entry-1',
        path_id: 'path-1',
        day: '2024-01-01',
        edit_id: 42,
        content: 'Hello world',
        image_filenames: ['img.png'],
      },
    ];

    vi.spyOn(db.entryContent, 'where').mockReturnValue({
      anyOf: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue(mockEntries),
      }),
    } as unknown as ReturnType<typeof db.entryContent.where>);

    await exportLocalData(['path-1']);

    expect(db.entryContent.where).toHaveBeenCalledWith('path_id');
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(anchorElement.download).toMatch(/^paths_local_backup_\d{8}\.json$/);
    expect(anchorClickSpy).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:local-url');
  });

  it('includes all entry fields in the exported JSON', async () => {
    const mockEntries = [
      {
        cache_key: 'path-1:entry-1',
        id: 'entry-1',
        path_id: 'path-1',
        day: '2024-01-15',
        edit_id: 7,
        content: 'My journal entry',
        image_filenames: ['photo.jpg', 'selfie.png'],
      },
    ];

    vi.spyOn(db.entryContent, 'where').mockReturnValue({
      anyOf: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue(mockEntries),
      }),
    } as unknown as ReturnType<typeof db.entryContent.where>);

    let capturedBlob: Blob | undefined;
    global.URL.createObjectURL = vi.fn().mockImplementation((blob: Blob) => {
      capturedBlob = blob;
      return 'blob:local-url';
    });

    await exportLocalData(['path-1']);

    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(capturedBlob!);
    });
    const parsed = JSON.parse(text) as {
      source: string;
      entries: { entry_id: string; image_filenames: string[] }[];
    };
    expect(parsed.source).toBe('local_cache');
    expect(parsed.entries).toHaveLength(1);
    expect(parsed.entries[0]!.entry_id).toBe('entry-1');
    expect(parsed.entries[0]!.image_filenames).toEqual([
      'photo.jpg',
      'selfie.png',
    ]);
  });

  it('defaults image_filenames to empty array when undefined', async () => {
    const mockEntries = [
      {
        cache_key: 'path-1:entry-2',
        id: 'entry-2',
        path_id: 'path-1',
        day: '2024-02-01',
        edit_id: 1,
        content: 'No images here',
        // image_filenames intentionally omitted
      },
    ];

    vi.spyOn(db.entryContent, 'where').mockReturnValue({
      anyOf: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue(mockEntries),
      }),
    } as unknown as ReturnType<typeof db.entryContent.where>);

    let capturedBlob: Blob | undefined;
    global.URL.createObjectURL = vi.fn().mockImplementation((blob: Blob) => {
      capturedBlob = blob;
      return 'blob:local-url';
    });

    await exportLocalData(['path-1']);

    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(capturedBlob!);
    });
    const parsed = JSON.parse(text) as {
      entries: { image_filenames: string[] }[];
    };
    expect(parsed.entries[0]!.image_filenames).toEqual([]);
  });
});
