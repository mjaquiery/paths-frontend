import type { ExportJobResponse } from '../generated/types';

export function isExportReady(job: ExportJobResponse | null): boolean {
  return job?.state === 'ready';
}

export function isExportTerminal(job: ExportJobResponse | null): boolean {
  if (!job) return false;
  return ['ready', 'failed', 'expired'].includes(job.state);
}
