// Tour dates are YYYY-MM-DD strings, compared as strings (the VPS runs in UTC).

/** Returns the YYYY-MM-DD part of a date string, or null if it is not a real date. */
export function normalizeTourDate(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const day = raw.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const parsed = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10) === day ? day : null;
}

export const todayString = (now: Date = new Date()): string =>
  now.toISOString().slice(0, 10);

/** True when `day` is before `today`. Both are YYYY-MM-DD. */
export const isPastDay = (day: string, today: string = todayString()): boolean =>
  day < today;
