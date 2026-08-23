import { computed, ref, watch, type Ref } from 'vue';

import type { PathResponse } from '../generated/types';
import {
  isPathHidden,
  setPathHidden,
  getPathOrder,
  setPathOrder,
} from '../lib/db';

/**
 * Shared across every usePathVisibility() call — Settings and the day/path
 * browser views each call this composable independently, and Ionic's
 * router-outlet keeps previously-visited pages mounted rather than
 * remounting them. A per-call ref meant toggling visibility in Settings
 * updated only Settings' own copy: the still-mounted day/path browser never
 * heard about it. A single module-level ref makes every caller read and
 * write the same state, so a toggle is visible everywhere immediately.
 */
const hiddenByPath = ref<Record<string, boolean>>({});

/**
 * Ordering + show/hide state for a user's paths, persisted locally (Dexie for
 * hidden flags, localStorage for order) since it's a per-device display
 * preference rather than server state. Shared by the main day browser
 * (read-only) and the settings page (which exposes the controls).
 */
export function usePathVisibility(allPaths: Ref<PathResponse[] | undefined>) {
  const pathOrder = ref<string[]>([]);

  watch(
    allPaths,
    async (paths) => {
      if (!paths) return;
      // Skip paths already loaded into the shared map — re-reading them here
      // could race a toggleVisibility() write that hasn't reached Dexie yet
      // and clobber it back to the pre-toggle value.
      const toLoad = paths.filter((p) => !(p.path_id in hiddenByPath.value));
      const hidden = await Promise.all(
        toLoad.map(
          async (p: PathResponse) =>
            [p.path_id, await isPathHidden(p.path_id)] as const,
        ),
      );
      if (hidden.length > 0) {
        hiddenByPath.value = {
          ...hiddenByPath.value,
          ...Object.fromEntries(hidden),
        };
      }

      const stored = getPathOrder();
      const ids = paths.map((p: PathResponse) => p.path_id);
      pathOrder.value = [
        ...stored.filter((id) => ids.includes(id)),
        ...ids.filter((id) => !stored.includes(id)),
      ];
    },
    { immediate: true },
  );

  const orderedPaths = computed<PathResponse[]>(() => {
    if (!allPaths.value) return [];
    return pathOrder.value
      .map((id) => allPaths.value!.find((p) => p.path_id === id))
      .filter((p): p is PathResponse => !!p);
  });

  const visiblePaths = computed(() =>
    orderedPaths.value.filter((p) => !hiddenByPath.value[p.path_id]),
  );

  async function toggleVisibility(pathId: string) {
    const nowHidden = !hiddenByPath.value[pathId];
    hiddenByPath.value[pathId] = nowHidden;
    await setPathHidden(pathId, nowHidden);
  }

  function moveUp(index: number) {
    if (index <= 0) return;
    const ids = [...pathOrder.value];
    [ids[index - 1], ids[index]] = [ids[index]!, ids[index - 1]!];
    pathOrder.value = ids;
    setPathOrder(ids);
  }

  function moveDown(index: number) {
    if (index >= pathOrder.value.length - 1) return;
    const ids = [...pathOrder.value];
    [ids[index], ids[index + 1]] = [ids[index + 1]!, ids[index]!];
    pathOrder.value = ids;
    setPathOrder(ids);
  }

  return {
    orderedPaths,
    hiddenByPath,
    visiblePaths,
    toggleVisibility,
    moveUp,
    moveDown,
  };
}
