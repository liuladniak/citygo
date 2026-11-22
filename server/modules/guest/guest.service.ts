import { asc, desc, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  bookingGuests, bookingPayments, bookings, images, tourTimeSlots, tours, users,
} from "../../db/drizzle/schema.js";
import { toIsoTimestamp } from "../../lib/dates.js";
import { forbidden, notFound } from "../../lib/errors.js";

const iso = (value: string | null) => (value === null ? null : toIsoTimestamp(value));

/**
 * A signed-in guest's own bookings: the ones linked to their account plus guest-checkout
 * bookings made with their email. Staff-only fields (notes, source) are not included.
 */
export async function listGuestBookings(supabaseId: string, requestedUserId?: number) {
  const [user] = await db.select().from(users).where(eq(users.supabaseId, supabaseId)).limit(1);
  if (!user) throw notFound("User not found");
  if (requestedUserId !== undefined && requestedUserId !== user.id) throw forbidden("Forbidden");

  const rows = await db
    .select({
      id: bookings.id,
      tour_id: bookings.tourId,
      is_custom_tour: bookings.isCustomTour,
      tour_date: bookings.tourDate,
      start_time: bookings.startTime,
      end_time: bookings.endTime,
      meeting_point: bookings.meetingPoint,
      primary_contact_name: bookings.primaryContactName,
      primary_contact_email: bookings.primaryContactEmail,
      primary_contact_phone: bookings.primaryContactPhone,
      language: bookings.language,
      status: bookings.status,
      created_at: bookings.createdAt,
      updated_at: bookings.updatedAt,
      time_slot_id: bookings.timeSlotId,
      booking_reference: bookings.bookingReference,
      total_price: bookings.totalPrice,
      cancellation_reason: bookings.cancellationReason,
      tour_title: tours.tourName,
      tour_price: tours.price,
      tour_slug: tours.slug,
      display_start_time: sql<string | null>`coalesce(${bookings.startTime}, ${tourTimeSlots.startTime})`,
      display_end_time: sql<string | null>`coalesce(${bookings.endTime}, ${tourTimeSlots.endTime})`,
      total_guests: sql<number | null>`case when ${bookingGuests.bookingId} is null then null
        else coalesce(${bookingGuests.adults}, 0) + coalesce(${bookingGuests.children}, 0) + coalesce(${bookingGuests.infants}, 0) end`,
    })
    .from(bookings)
    .leftJoin(tours, eq(bookings.tourId, tours.id))
    .leftJoin(tourTimeSlots, eq(bookings.timeSlotId, tourTimeSlots.id))
    .leftJoin(bookingGuests, eq(bookingGuests.bookingId, bookings.id))
    .where(or(eq(bookings.userId, user.id), sql`lower(${bookings.primaryContactEmail}) = lower(${user.email})`))
    .orderBy(desc(bookings.tourDate), desc(bookings.id));

  if (!rows.length) return [];

  const bookingIds = rows.map((r) => r.id);
  const tourIds = [...new Set(rows.map((r) => r.tour_id).filter((t): t is number => t !== null))];

  // Two batched lookups for the whole list instead of one query per booking.
  const [paid, tourImages] = await Promise.all([
    db
      .select({ bookingId: bookingPayments.bookingId, total: sql<string>`sum(${bookingPayments.amount})` })
      .from(bookingPayments)
      .where(sql`${bookingPayments.status} = 'paid' and ${inArray(bookingPayments.bookingId, bookingIds)}`)
      .groupBy(bookingPayments.bookingId),
    tourIds.length
      ? db
          .select({ tourId: images.tourId, path: images.imagePath })
          .from(images)
          .where(inArray(images.tourId, tourIds))
          .orderBy(asc(images.id))
      : [],
  ]);

  const paidByBooking = new Map(paid.map((p) => [p.bookingId, p.total]));
  const imagesByTour = new Map<number, string[]>();
  for (const { tourId, path } of tourImages) imagesByTour.set(tourId, [...(imagesByTour.get(tourId) ?? []), path]);

  return rows.map((r) => ({
    ...r,
    created_at: iso(r.created_at),
    updated_at: iso(r.updated_at),
    amount_paid: paidByBooking.get(r.id) ?? "0",
    tour_images: (r.tour_id !== null && imagesByTour.get(r.tour_id)) || [],
  }));
}
