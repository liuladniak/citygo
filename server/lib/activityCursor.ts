// Paging for the merged activity feed (booking log + tour log).
// The cursor remembers the last id seen in each log, so each log pages on its own.

export type ActivityCursor = {
  booking_id: number | null;
  tour_id: number | null;
};

type Row = { id: number; source: "booking" | "tour" };

export function parseCursor(raw: unknown): ActivityCursor | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    const value = JSON.parse(Buffer.from(raw, "base64").toString());
    if (!value || typeof value !== "object") return null;
    const num = (v: unknown) => (Number.isInteger(v) ? (v as number) : null);
    return { booking_id: num(value.booking_id), tour_id: num(value.tour_id) };
  } catch {
    return null;
  }
}

// A log with no row on this page keeps the position it had before,
// otherwise the next page would start that log from the top again.
export function buildNextCursor(
  page: Row[],
  pageSize: number,
  previous: ActivityCursor | null,
): string | null {
  if (page.length < pageSize) return null;
  const lastOf = (source: Row["source"]) =>
    page.filter((r) => r.source === source).at(-1)?.id;
  const cursor: ActivityCursor = {
    booking_id: lastOf("booking") ?? previous?.booking_id ?? null,
    tour_id: lastOf("tour") ?? previous?.tour_id ?? null,
  };
  return Buffer.from(JSON.stringify(cursor)).toString("base64");
}
