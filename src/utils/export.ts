import type { ExportJobResponse } from '../generated/types';

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
