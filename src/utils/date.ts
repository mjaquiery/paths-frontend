/**
 * Formats a Date as a local-calendar YYYY-MM-DD string.
 *
 * `Date#toISOString()` converts to UTC first, which silently shifts the date
 * by a day for anyone west/east of UTC near midnight — the wrong day to file
 * an entry under, or the wrong day to mark as "today" in the day strip.
 */
export function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Index (0-6) of the focus day within a 7-day week strip.
 *
 * Recent focus days are pulled toward the end of the strip so the strip
 * never has to show days after today: today lands last (6), yesterday
 * second-to-last (5), the day before that one earlier (4). Anything older
 * (or in the future) is centered at index 3, with 3 days either side.
 */
export function focusDayIndex(focusDate: string, todayDate: string): number {
  const focus = new Date(focusDate + 'T00:00:00');
  const today = new Date(todayDate + 'T00:00:00');
  const daysAgo = Math.round(
    (today.getTime() - focus.getTime()) / (24 * 60 * 60 * 1000),
  );
  switch (daysAgo) {
    case 0:
      return 6;
    case 1:
      return 5;
    case 2:
      return 4;
    default:
      return 3;
  }
}
