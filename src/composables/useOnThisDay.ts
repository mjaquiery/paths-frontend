import { computed, type Ref } from 'vue';
import type { PathResponse } from '../generated/types';
import type { PathEntries } from './useMultiPathEntries';

export interface OnThisDayEntry {
  year: number;
  entryId: string;
  pathId: string;
  pathTitle: string;
  color: string;
  content?: string;
}

/**
 * Entries from visible paths sharing `dateStr`'s month-day in earlier years,
 * newest year first. Shared by DayBrowser's year tabs (f-2a) and the entry
 * view's "On this day" list (f-3a) so the two stay in sync.
 */
export function useOnThisDay(
  dateStr: Ref<string>,
  visiblePaths: Ref<PathResponse[]>,
  pathEntries: Ref<PathEntries[]>,
) {
  return computed<OnThisDayEntry[]>(() => {
    const monthDay = dateStr.value.slice(5);
    const year = Number(dateStr.value.slice(0, 4));
    const pathById = new Map(visiblePaths.value.map((p) => [p.path_id, p]));
    const results: OnThisDayEntry[] = [];
    for (const { pathId, entries } of pathEntries.value) {
      const path = pathById.get(pathId);
      if (!path) continue;
      for (const entry of entries) {
        if (
          entry.day.slice(5) === monthDay &&
          Number(entry.day.slice(0, 4)) < year
        ) {
          results.push({
            year: Number(entry.day.slice(0, 4)),
            entryId: entry.id,
            pathId,
            pathTitle: path.title,
            color: path.color,
            content: entry.content,
          });
        }
      }
    }
    return results.sort((a, b) => b.year - a.year);
  });
}
