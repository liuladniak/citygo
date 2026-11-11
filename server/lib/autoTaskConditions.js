const CURRENCY = "€";

export const autoTaskKind = (title = "") =>
  title.match(/^\[(auto_\w+)\]/)?.[1] ?? null;

const money = (n) => `${CURRENCY}${n.toFixed(2)}`;

function unresolvedReason(kind, booking) {
  if (!booking || booking.status === "cancelled") return null;
  const ref = booking.booking_reference;
  switch (kind) {
    case "auto_assign_guide":
      return Number(booking.guide_count) === 0
        ? `${ref} still has no guide`
        : null;
    case "auto_collect_payment": {
      const due = Number(booking.total_price) - Number(booking.amount_paid);
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

export async function findUnresolved(db, tasks) {
  const result = new Map();
  const auto = tasks.filter(
    (t) => t.is_auto_generated && t.booking_id && autoTaskKind(t.title),
  );
  if (auto.length === 0) return result;

  const bookingIds = [...new Set(auto.map((t) => t.booking_id))];
  const bookings = await db("bookings")
    .whereIn("bookings.id", bookingIds)
    .select([
      "bookings.id",
      "bookings.status",
      "bookings.booking_reference",
      "bookings.total_price",
      "bookings.meeting_point",
      db.raw(`(SELECT COALESCE(SUM(amount), 0) FROM booking_payments p
               WHERE p.booking_id = bookings.id AND p.status = 'paid') AS amount_paid`),
      db.raw(`(SELECT COUNT(*) FROM booking_assignments a
               WHERE a.booking_id = bookings.id AND a.status = 'active') AS guide_count`),
    ]);

  const byId = new Map(bookings.map((b) => [b.id, b]));
  for (const t of auto) {
    const reason = unresolvedReason(
      autoTaskKind(t.title),
      byId.get(t.booking_id),
    );
    if (reason) result.set(t.id, reason);
  }
  return result;
}
