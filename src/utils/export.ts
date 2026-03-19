import type { ExportJobResponse } from '../generated/types';
import { db } from '../lib/db';

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
 * Export locally cached entry data for the given path IDs as a JSON file.
 * Used as an offline fallback when the remote export API is unreachable.
 */
export async function exportLocalData(pathIds: string[]): Promise<void> {
  const entries = await db.entryContent
    .where('path_id')
    .anyOf(pathIds)
    .toArray();

  const exportData: LocalExportData = {
    exported_at: new Date().toISOString(),
    source: 'local_cache',
    entries: entries.map((e) => ({
      entry_id: e.id,
      path_id: e.path_id,
      day: e.day,
      edit_id: e.edit_id,
      content: e.content,
      image_filenames: e.image_filenames ?? [],
    })),
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
