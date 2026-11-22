import { desc, eq, lt } from "drizzle-orm";
import { db } from "../../db/index.js";
import { bookingActivityLog, bookings, tourActivityLog, tours } from "../../db/drizzle/schema.js";
import { buildNextCursor, parseCursor } from "../../lib/activityCursor.js";
import { toIsoTimestamp } from "../../lib/dates.js";
import type { FeedQuery } from "./activity.schemas.js";

type FeedItem = {
  id: number;
  action: string;
  message: string | null;
  created_at: string | null;
  source: "booking" | "tour";
  ref_id: number | null;
  ref_label: string | null;
};

/** Booking and tour activity in one newest-first feed, paged by one cursor. */
export async function getActivityFeed({ limit, cursor }: FeedQuery) {
  const position = parseCursor(cursor);

  const [bookingRows, tourRows] = await Promise.all([
    db
      .select({
        id: bookingActivityLog.id,
        action: bookingActivityLog.action,
        message: bookingActivityLog.message,
        createdAt: bookingActivityLog.createdAt,
        refId: bookingActivityLog.bookingId,
        refLabel: bookings.bookingReference,
      })
      .from(bookingActivityLog)
      .leftJoin(bookings, eq(bookingActivityLog.bookingId, bookings.id))
      .where(position?.booking_id ? lt(bookingActivityLog.id, position.booking_id) : undefined)
      .orderBy(desc(bookingActivityLog.id))
      .limit(limit),
    db
      .select({
        id: tourActivityLog.id,
        action: tourActivityLog.action,
        message: tourActivityLog.message,
        createdAt: tourActivityLog.createdAt,
        refId: tourActivityLog.tourId,
        refLabel: tours.tourName,
      })
      .from(tourActivityLog)
      .leftJoin(tours, eq(tourActivityLog.tourId, tours.id))
      .where(position?.tour_id ? lt(tourActivityLog.id, position.tour_id) : undefined)
      .orderBy(desc(tourActivityLog.id))
      .limit(limit),
  ]);

  const item = (source: FeedItem["source"]) => (r: (typeof bookingRows)[number]): FeedItem => ({
    id: r.id,
    action: r.action,
    message: r.message,
    created_at: r.createdAt === null ? null : toIsoTimestamp(r.createdAt),
    source,
    ref_id: r.refId,
    ref_label: r.refLabel,
  });

  const data = [...bookingRows.map(item("booking")), ...tourRows.map(item("tour"))]
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
    .slice(0, limit);

  return { data, nextCursor: buildNextCursor(data, limit, position) };
}
