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
