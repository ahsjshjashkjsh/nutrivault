/**
 * Timezone-safe date handling.
 *
 * Calendar dates ("2026-06-10") are stored as UTC midnight in the database,
 * regardless of server timezone. "Today" is computed in the app's timezone
 * (Swiss user base) — on a UTC server like Vercel, a user logging at 00:30
 * local time would otherwise land on the previous day.
 */

export const APP_TIMEZONE = "Europe/Zurich";

/** Current calendar date in the app timezone, as "yyyy-MM-dd". */
export function todayKey(): string {
  // en-CA locale formats as yyyy-MM-dd
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Parse a "yyyy-MM-dd" string to UTC midnight — independent of server tz. */
export function dayUTC(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

/** Calendar key of a stored UTC-midnight date. */
export function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** UTC midnight N days before the given UTC-midnight date. */
export function subDaysUTC(date: Date, days: number): Date {
  return new Date(date.getTime() - days * 86_400_000);
}
