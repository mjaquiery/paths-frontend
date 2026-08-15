import type { QueryClient } from '@tanstack/vue-query';
import type {
  EntryResponse,
  ExportJobResponse,
  ImageResponse,
} from '../generated/types';

export function isExportReady(job: ExportJobResponse | null): boolean {
  return job?.state === 'ready';
}

export function isExportTerminal(job: ExportJobResponse | null): boolean {
  if (!job) return false;
  return ['ready', 'failed', 'expired'].includes(job.state);
}

export async function downloadFileFromUrl(
  url: string,
  filename: string,
): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Download failed: ${response.status} ${response.statusText}`,
    );
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}

export interface LocalExportEntry {
  entry_id: string;
  path_id: string;
  day: string;
  edit_id: number;
  content: string;
  image_filenames: string[];
}

export interface LocalExportData {
  exported_at: string;
  source: 'local_cache';
  entries: LocalExportEntry[];
}

/**
 * Export locally cached entry data for the given path IDs as a JSON file. Used as an
 * offline fallback when the remote export API is unreachable.
 *
 * Reads directly from TanStack Query's cache (the only server-data cache layer) rather than
 * a dedicated Dexie table — whatever's cached is exactly what useMultiPathEntries fetched,
 * keyed the same way it queries it.
 */
export function exportLocalData(
  queryClient: QueryClient,
  pathIds: string[],
): void {
  const cache = queryClient.getQueryCache();
  const entries: LocalExportEntry[] = [];

  for (const pathId of pathIds) {
    const listQuery = cache.find({
      queryKey: ['v1', 'paths', pathId, 'entries'],
    });
    const list =
      (listQuery?.state.data as { data?: EntryResponse[] } | undefined)?.data ??
      [];

    for (const entry of list) {
      const contentQuery = cache
        .findAll({
          predicate: (q) => {
            const key = q.queryKey;
            return (
              Array.isArray(key) &&
              key[0] === 'v1' &&
              key[1] === 'paths' &&
              key[2] === pathId &&
              key[3] === 'entries' &&
              key[4] === entry.id &&
              key[5] === 'content'
            );
          },
        })
        .sort((a, b) => b.state.dataUpdatedAt - a.state.dataUpdatedAt)[0];
      const data = contentQuery?.state.data as
        { content: string; images: ImageResponse[] } | undefined;

      entries.push({
        entry_id: entry.id,
        path_id: pathId,
        day: entry.day,
        edit_id: entry.edit_id,
        content: data?.content ?? '',
        image_filenames: data?.images?.map((img) => img.filename) ?? [],
      });
    }
  }

  const exportData: LocalExportData = {
    exported_at: new Date().toISOString(),
    source: 'local_cache',
    entries,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  const objectUrl = URL.createObjectURL(blob);
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = `paths_local_backup_${today}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}
