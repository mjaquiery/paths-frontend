/**
 * Builds URLs for the date view (`/`) and path view (`/paths`), used both to
 * link *into* those views (optionally centred on a day) and as the `from`
 * query value threaded through entry/edit pages so their back button can
 * return to the exact view+day the user came from.
 *
 * Deliberately plain strings rather than RouteLocationRaw objects: a `from`
 * value has to survive a full-page round trip through Google's OAuth screen
 * (see authSession.ts's setReturnPath/consumeReturnPath), so it must be
 * representable as a URL, not just an in-memory route object.
 */
export function dateViewPath(day?: string): string {
  return day ? `/?day=${encodeURIComponent(day)}` : '/';
}

export function pathViewPath(pathId: string, day?: string): string {
  const params = new URLSearchParams({ pathId });
  if (day) params.set('day', day);
  return `/paths?${params.toString()}`;
}
