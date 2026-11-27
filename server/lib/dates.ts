// Drizzle returns `timestamp` columns as text like "2026-11-22 20:03:22.342".
// The API has always sent them as ISO strings (what a JS Date turns into in JSON), and the
// database stores UTC, so this keeps the responses identical.
export function toIsoTimestamp(value: string): string;
export function toIsoTimestamp(value: string | null): string | null;
export function toIsoTimestamp(value: string | null): string | null {
  if (value === null) return null;
  return new Date(`${value.replace(" ", "T")}Z`).toISOString();
}

/** The day `n` days after a YYYY-MM-DD day, as YYYY-MM-DD. */
export function addDaysToDay(day: string, n: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** The same day one month earlier, held to the end of a shorter month (31 Mar becomes 28 Feb). */
export function sameDayLastMonth(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  const year = m === 1 ? y - 1 : y;
  const month = m === 1 ? 12 : m - 1;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(Math.min(d, lastDay)).padStart(2, "0")}`;
}
