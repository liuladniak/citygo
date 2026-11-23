import { and, eq, inArray, sql } from "drizzle-orm";
import type { db } from "../db/index.js";
import { bookingAssignments, bookingPayments, bookings } from "../db/drizzle/schema.js";

// Auto-generated tasks carry their kind in the title, like "[auto_assign_guide] Assign a guide".
const CURRENCY = "€";

export const autoTaskKind = (title = ""): string | null => title.match(/^\[(auto_\w+)\]/)?.[1] ?? null;

const money = (cents: number) => `${CURRENCY}${(cents / 100).toFixed(2)}`;
const toCents = (amount: string | number | null) => Math.round(Number(amount ?? 0) * 100);

export type BookingFacts = {
  status: string | null;
  booking_reference: string | null;
  total_price: string | null;
  meeting_point: string | null;
  amount_paid: string;
  guide_count: number;
};

/** Why an auto task is still needed, or null when the booking no longer needs it. */
export function unresolvedReason(kind: string | null, booking: BookingFacts | undefined): string | null {
  if (!booking || booking.status === "cancelled") return null;
  const ref = booking.booking_reference;
  switch (kind) {
    case "auto_assign_guide":
      return booking.guide_count === 0 ? `${ref} still has no guide` : null;
    case "auto_collect_payment": {
      const due = toCents(booking.total_price) - toCents(booking.amount_paid);
      return due > 0 ? `${ref} still has ${money(due)} due` : null;
    }
    case "auto_set_meeting_point":
      return booking.meeting_point ? null : `${ref} still has no meeting point`;
    case "auto_review_custom":
      return booking.status === "draft" ? `${ref} is still a draft` : null;
    default:
      return null;
  }
}

/** Paid amount and active guide count for each booking id, two queries for the whole list. */
export async function loadPaidAndGuides(executor: Pick<typeof db, "select">, bookingIds: number[]) {
  const [paid, guides] = await Promise.all([
    executor
      .select({ bookingId: bookingPayments.bookingId, total: sql<string>`sum(${bookingPayments.amount})` })
      .from(bookingPayments)
      .where(and(inArray(bookingPayments.bookingId, bookingIds), eq(bookingPayments.status, "paid")))
      .groupBy(bookingPayments.bookingId),
    executor
      .select({ bookingId: bookingAssignments.bookingId, total: sql<number>`count(*)`.mapWith(Number) })
      .from(bookingAssignments)
      .where(and(inArray(bookingAssignments.bookingId, bookingIds), eq(bookingAssignments.status, "active")))
      .groupBy(bookingAssignments.bookingId),
  ]);
  const paidBy = new Map(paid.map((p) => [p.bookingId, p.total]));
  const guidesBy = new Map(guides.map((g) => [g.bookingId, g.total]));
  return (id: number) => ({ amount_paid: paidBy.get(id) ?? "0", guide_count: guidesBy.get(id) ?? 0 });
}

type TaskLike = { id: number; title: string; booking_id: number | null; is_auto_generated: boolean | null };

/** For auto tasks: task id to the reason the work is not done yet. Resolved tasks are absent. */
export async function findUnresolved(executor: Pick<typeof db, "select">, tasks: TaskLike[]) {
  const result = new Map<number, string>();
  const auto = tasks.filter((t) => t.is_auto_generated && t.booking_id && autoTaskKind(t.title));
  if (auto.length === 0) return result;

  const bookingIds = [...new Set(auto.map((t) => t.booking_id as number))];
  const [rows, countsFor] = await Promise.all([
    executor
      .select({
        id: bookings.id,
        status: bookings.status,
        booking_reference: bookings.bookingReference,
        total_price: bookings.totalPrice,
        meeting_point: bookings.meetingPoint,
      })
      .from(bookings)
      .where(inArray(bookings.id, bookingIds)),
    loadPaidAndGuides(executor, bookingIds),
  ]);

  const facts = new Map<number, BookingFacts>(rows.map(({ id, ...b }) => [id, { ...b, ...countsFor(id) }]));

  for (const t of auto) {
    const reason = unresolvedReason(autoTaskKind(t.title), facts.get(t.booking_id as number));
    if (reason) result.set(t.id, reason);
  }
  return result;
}
