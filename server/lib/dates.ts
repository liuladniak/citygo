// Drizzle returns `timestamp` columns as text like "2026-11-22 20:03:22.342".
// The API has always sent them as ISO strings (what a JS Date turns into in JSON), and the
// database stores UTC, so this keeps the responses identical.
export function toIsoTimestamp(value: string): string;
export function toIsoTimestamp(value: string | null): string | null;
export function toIsoTimestamp(value: string | null): string | null {
  if (value === null) return null;
  return new Date(`${value.replace(" ", "T")}Z`).toISOString();
}
