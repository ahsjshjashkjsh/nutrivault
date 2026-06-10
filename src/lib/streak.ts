import { format, subDays } from "date-fns";

/**
 * Compute the current logging streak (consecutive days with at least one meal
 * entry). Today counts if already logged; otherwise the streak is kept alive
 * until the end of the day, counting back from yesterday.
 *
 * @param loggedDates set of "yyyy-MM-dd" strings on which the user logged meals
 * @param today       reference date
 */
export function computeStreak(loggedDates: Set<string>, today: Date): number {
  let streak = 0;
  let cursor = today;

  // If nothing logged today yet, start counting from yesterday
  if (!loggedDates.has(format(cursor, "yyyy-MM-dd"))) {
    cursor = subDays(cursor, 1);
  }

  while (loggedDates.has(format(cursor, "yyyy-MM-dd"))) {
    streak++;
    cursor = subDays(cursor, 1);
  }

  return streak;
}
