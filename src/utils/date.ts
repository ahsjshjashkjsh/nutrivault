import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays, parseISO } from "date-fns";

export function getTodayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatISO(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseDate(dateStr: string): Date {
  return parseISO(dateStr);
}

export function getWeekDays(date: Date = new Date()): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function getLast7Days(): Date[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));
}

export function getLast30Days(): Date[] {
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => subDays(today, 29 - i));
}

export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

export function formatDayLabel(date: Date): string {
  return format(date, "EEE");
}

export function formatMonthDay(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d");
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayISO();
}

export function isFutureDate(dateStr: string): boolean {
  return dateStr > getTodayISO();
}
