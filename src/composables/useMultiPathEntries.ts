import { computed, ref, watch, type Ref } from 'vue';
import { useQueries, useQueryClient } from '@tanstack/vue-query';
import {
  listEntries,
  getEntry,
  useGetEntryVersions,
} from '../generated/apiClient';
import type { EntryContentResponse, EntryResponse } from '../generated/types';
import type { ImageResponse } from '../generated/types';

type VersionsMap = Record<string, Record<string, number>>;

/** Which path_ids have at least one entry whose edit_id differs between two version
 *  snapshots (including an entry appearing/disappearing). `undefined` previous means
 *  "nothing to compare against yet" (first poll after mount) — reported as no changes,
 *  since there's nothing meaningfully different to invalidate. */
function changedPathIds(
  previous: VersionsMap | undefined,
  next: VersionsMap,
): string[] {
  if (!previous) return [];
  const changed: string[] = [];
  for (const pathId of new Set([
    ...Object.keys(previous),
    ...Object.keys(next),
  ])) {
    const prevEntries = previous[pathId] ?? {};
    const nextEntries = next[pathId] ?? {};
    const entryIds = new Set([
      ...Object.keys(prevEntries),
      ...Object.keys(nextEntries),
    ]);
    for (const entryId of entryIds) {
      if (prevEntries[entryId] !== nextEntries[entryId]) {
        changed.push(pathId);
        break;
      }
    }
  }
  return changed;
}

export interface EntryWithContent extends EntryResponse {
  content?: string;
  images?: ImageResponse[];
  /** Whether this entry's content has been requested at all. `false` means it's outside
   *  the fetch window — distinct from `content === undefined`, which then unambiguously
   *  means "in flight" rather than "not requested yet". */
  inWindow: boolean;
}

export interface PathEntries {
  pathId: string;
  entries: EntryWithContent[];
  isListLoading: boolean;
  hasMore: boolean;
  remainingCount: number;
}

export const DEFAULT_CONTENT_WINDOW = 30;

function byDayDesc(a: EntryResponse, b: EntryResponse): number {
  return a.day < b.day ? 1 : a.day > b.day ? -1 : 0;
}

/**
 * Fetches entry lists + content for a set of paths using TanStack Query as the only cache
 * layer (persisted via lib/queryPersister.ts's Dexie-backed persister). Content queries are
 * keyed on `entry.edit_id`, so an edit_id bump — the server's signal that content changed —
 * naturally busts the cache and refetches; no manual diffing against a second store.
 *
 * `entries` always includes every entry a path has (cheap: just id/day/edit_id from
 * `listEntries`), so day-membership checks (calendar dots, "on this day") never regress —
 * but each entry's `content`/`images` are only fetched for a bounded "requested" window,
 * since fetching-and-rendering everything at once for a long-lived path is what made
 * opening it freeze the UI. That window is shared across every selected path — the
 * `windowSize` most recent entries overall, not per path — so a page showing several
 * paths at once stays in one coherent, date-ordered recency window instead of each path
 * independently loading its own most-recent N regardless of how they interleave once
 * merged (a rarely-updated path would otherwise keep showing entries from years ago next
 * to a busy path's last few weeks). The window only ever grows (via `loadMore`/
 * `ensureDayLoaded`), so an entry already shown never disappears again just because a
 * background refresh reshuffled what "most recent" means (e.g. a new entry synced in from
 * another device).
 *
 * When an edit_id bump replaces one content query with another (same entry, new key),
 * `lastGoodContent` keeps that entry's previous content/images on screen until the new
 * query resolves, rather than the row reverting to a loading spinner it had already
 * cleared. This can't be TanStack's own `keepPreviousData`: `useQueries` matches array
 * slots to observers strictly by queryHash, so a changed key gets a brand-new
 * `QueryObserver` with no prior state of its own to carry over.
 *
 * Freshness while idle comes from one shared poll of GET /v1/entries/versions (a cheap
 * {path_id: {entry_id: edit_id}} map) rather than each path's list query polling on its
 * own interval — N per-path list refetches every tick become one small versions request,
 * with only the paths whose version map actually changed getting invalidated (and thus
 * refetched in full). The per-path list queries below keep refetchOnWindowFocus/Reconnect
 * as an immediate correctness net; only the interval poll moves to the versions endpoint.
 */
export function useMultiPathEntries(
  pathIds: Ref<string[]>,
  windowSize = DEFAULT_CONTENT_WINDOW,
) {
  const queryClient = useQueryClient();

  const listResults = useQueries({
    queries: computed(() =>
      pathIds.value.map((pathId) => ({
        queryKey: ['v1', 'paths', pathId, 'entries'],
        queryFn: () => listEntries(pathId),
        enabled: !!pathId,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      })),
    ),
  });

  const versionsQuery = useGetEntryVersions(
    computed(() => ({ path_ids: pathIds.value })),
    {
      query: {
        enabled: computed(() => pathIds.value.length > 0),
        refetchInterval: 25_000,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
    },
  );

  // Plain (non-reactive) memo of the last-seen versions snapshot, purely for diffing —
  // not composable state, so it doesn't need to participate in Vue's reactivity graph.
  let previousVersions: VersionsMap | undefined;
  watch(
    () => versionsQuery.data.value?.data as VersionsMap | undefined,
    (next) => {
      if (!next) return;
      for (const pathId of changedPathIds(previousVersions, next)) {
        queryClient.invalidateQueries({
          queryKey: ['v1', 'paths', pathId, 'entries'],
        });
      }
      previousVersions = next;
    },
  );

  const entryLists = computed<
    { pathId: string; entries: EntryResponse[]; isListLoading: boolean }[]
  >(() =>
    pathIds.value.map((pathId, i) => ({
      pathId,
      entries:
        (listResults.value[i]?.data as { data: EntryResponse[] } | undefined)
          ?.data ?? [],
      // isPending (not isFetching) so the existing background poll/refocus/reconnect
      // refetches on this query never re-trigger a loading state — only a genuine
      // first load (or a new pathId's first load) does.
      isListLoading: listResults.value[i]?.isPending ?? false,
    })),
  );

  // Per-path membership of entry ids whose content has been requested so far. Plain
  // records rebuilt immutably on change (rather than mutated Sets/Maps) to keep Vue's
  // reactivity straightforward. Only ever grows for a given pathId.
  const requestedIds = ref<Record<string, Record<string, true>>>({});
  // Recency cap shared across every selected path, raised by loadMore(). The window is
  // "the N most recent entries overall", not "N per path" — otherwise a rarely-updated
  // path would still have its oldest entries loaded just because they fit under its own
  // cap, showing up out of place once merged into one date-ordered feed with a
  // frequently-updated path. Kept separate from requestedIds so a background refresh
  // that reorders "most recent" can still grow requestedIds to match.
  const globalCap = ref(windowSize);

  function growRequested() {
    const merged = entryLists.value
      .flatMap(({ entries }) => entries)
      .sort(byDayDesc);
    let changed = false;
    const next = { ...requestedIds.value };
    for (const entry of merged.slice(0, globalCap.value)) {
      const existingForPath = next[entry.path_id] ?? {};
      if (!existingForPath[entry.id]) {
        next[entry.path_id] = { ...existingForPath, [entry.id]: true };
        changed = true;
      }
    }
    if (changed) {
      requestedIds.value = next;
    }
  }

  watch(entryLists, growRequested, { immediate: true, deep: true });

  const windowedEntryLists = computed(() =>
    entryLists.value.map(({ pathId, entries, isListLoading }) => {
      const requested = requestedIds.value[pathId] ?? {};
      const requestedCount = entries.filter((e) => requested[e.id]).length;
      return {
        pathId,
        entries,
        isListLoading,
        hasMore: requestedCount < entries.length,
        remainingCount: entries.length - requestedCount,
      };
    }),
  );

  const contentQueries = computed(() =>
    windowedEntryLists.value.flatMap(({ pathId, entries }) => {
      const requested = requestedIds.value[pathId] ?? {};
      return entries
        .filter((entry) => requested[entry.id])
        .map((entry) => ({
          queryKey: [
            'v1',
            'paths',
            pathId,
            'entries',
            entry.id,
            'content',
            entry.edit_id,
          ],
          queryFn: async () => {
            const entryResult = await getEntry(pathId, entry.id);
            const data = entryResult.data as EntryContentResponse;
            return { content: data.content, images: data.images ?? [] };
          },
          staleTime: Infinity, // immutable for this edit_id — a new edit_id gets a new key
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
        }));
    }),
  );

  const contentResults = useQueries({ queries: contentQueries });

  // Plain (non-reactive) memo, not composable state — read and written within the same
  // pathEntries computed pass, never on its own, so it doesn't need to participate in
  // Vue's reactivity graph.
  const lastGoodContent = new Map<
    string,
    { content?: string; images?: ImageResponse[] }
  >();

  function ensureDayLoaded(day: string) {
    for (const { pathId, entries } of entryLists.value) {
      const matching = entries.filter((e) => e.day === day);
      if (matching.length === 0) continue;
      const existing = requestedIds.value[pathId] ?? {};
      let changed = false;
      const next = { ...existing };
      for (const entry of matching) {
        if (!next[entry.id]) {
          next[entry.id] = true;
          changed = true;
        }
      }
      if (changed) {
        requestedIds.value = { ...requestedIds.value, [pathId]: next };
      }
    }
  }

  function loadMore() {
    globalCap.value += windowSize;
    growRequested();
  }

  const pathEntries = computed<PathEntries[]>(() => {
    // contentQueries is a filtered subset (only requested entries), so build a lookup
    // rather than assuming a 1:1 positional match against each path's full entry list.
    let cursor = 0;
    const contentByKey = new Map<
      string,
      { content?: string; images?: ImageResponse[] }
    >();
    for (const { pathId, entries } of windowedEntryLists.value) {
      const requested = requestedIds.value[pathId] ?? {};
      for (const entry of entries) {
        if (!requested[entry.id]) continue;
        const key = `${pathId}:${entry.id}`;
        const result = contentResults.value[cursor++];
        const data = result?.data as
          { content: string; images: ImageResponse[] } | undefined;
        if (data) {
          lastGoodContent.set(key, data);
          contentByKey.set(key, data);
        } else {
          const previous = lastGoodContent.get(key);
          if (previous) contentByKey.set(key, previous);
        }
      }
    }

    return windowedEntryLists.value.map(
      ({ pathId, entries, isListLoading, hasMore, remainingCount }) => {
        const requested = requestedIds.value[pathId] ?? {};
        return {
          pathId,
          isListLoading,
          hasMore,
          remainingCount,
          entries: entries.map((entry): EntryWithContent => {
            const inWindow = !!requested[entry.id];
            const found = inWindow
              ? contentByKey.get(`${pathId}:${entry.id}`)
              : undefined;
            return {
              ...entry,
              content: found?.content,
              images: found?.images,
              inWindow,
            };
          }),
        };
      },
    );
  });

  return { pathEntries, loadMore, ensureDayLoaded };
}
