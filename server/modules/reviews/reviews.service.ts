import { and, asc, count, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { bookings, reviews, tourRatingSummary, tours, users } from "../../db/drizzle/schema.js";
import { toIsoTimestamp } from "../../lib/dates.js";
import { badRequest, conflict, forbidden, notFound } from "../../lib/errors.js";
import type { CreateBody, ListQuery } from "./reviews.schemas.js";

const iso = (value: string | null) => (value === null ? null : toIsoTimestamp(value));

const isUniqueViolation = (err: unknown) =>
  typeof err === "object" && err !== null && "cause" in err && (err.cause as { code?: string })?.code === "23505";

/** Public reviews for a tour. Reviewers appear as first name and last initial only. */
export async function listTourReviews(tourId: number, { page, limit, sort }: ListQuery) {
  const order =
    sort === "highest" ? [desc(reviews.rating), desc(reviews.id)]
    : sort === "lowest" ? [asc(reviews.rating), desc(reviews.id)]
    : [desc(reviews.createdAt), desc(reviews.id)];

  const [rows, [{ total }], [summary]] = await Promise.all([
    db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        title: reviews.title,
        body: reviews.body,
        photos: reviews.photos,
        created_at: reviews.createdAt,
        first_name: users.firstName,
        last_initial: sql<string>`left(${users.lastName}, 1)`,
        country: users.country,
        tour_date: bookings.tourDate,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .innerJoin(bookings, eq(reviews.bookingId, bookings.id))
      .where(eq(reviews.tourId, tourId))
      .orderBy(...order)
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ total: count() }).from(reviews).where(eq(reviews.tourId, tourId)),
    db
      .select({
        tour_id: tourRatingSummary.tourId,
        avg_rating: tourRatingSummary.avgRating,
        review_count: tourRatingSummary.reviewCount,
      })
      .from(tourRatingSummary)
      .where(eq(tourRatingSummary.tourId, tourId)),
  ]);

  return {
    reviews: rows.map((r) => ({ ...r, created_at: iso(r.created_at) })),
    summary: summary ?? { avg_rating: null, review_count: 0 },
    total,
    totalPages: Math.ceil(total / limit),
    page,
  };
}

/** A guest may review a finished booking of their own, once. */
export async function createReview(userId: number, { booking_id, rating, title, body, photos }: CreateBody) {
  const [booking] = await db
    .select({ id: bookings.id, tourId: bookings.tourId, status: bookings.status })
    .from(bookings)
    .where(and(eq(bookings.id, booking_id), eq(bookings.userId, userId)))
    .limit(1);

  if (!booking || booking.tourId === null) throw forbidden("Booking not found");
  if (booking.status !== "completed") throw badRequest("You can only review completed bookings");

  try {
    const [review] = await db
      .insert(reviews)
      .values({ bookingId: booking.id, tourId: booking.tourId, userId, rating, title, body, photos })
      .returning();
    return {
      id: review.id,
      booking_id: review.bookingId,
      tour_id: review.tourId,
      user_id: review.userId,
      rating: review.rating,
      title: review.title,
      body: review.body,
      photos: review.photos,
      created_at: iso(review.createdAt),
      updated_at: iso(review.updatedAt),
    };
  } catch (err) {
    // The unique booking_id index settles two submissions at once.
    if (isUniqueViolation(err)) throw conflict("You have already reviewed this booking");
    throw err;
  }
}

/** Completed bookings of this guest that have no review yet. */
export async function listEligibleBookings(userId: number) {
  return db
    .select({
      booking_id: bookings.id,
      tour_date: bookings.tourDate,
      tour_id: tours.id,
      tour_name: tours.tourName,
    })
    .from(bookings)
    .innerJoin(tours, eq(bookings.tourId, tours.id))
    .leftJoin(reviews, eq(reviews.bookingId, bookings.id))
    .where(and(eq(bookings.userId, userId), eq(bookings.status, "completed"), isNull(reviews.id)))
    .orderBy(desc(bookings.tourDate), desc(bookings.id));
}

export async function deleteOwnReview(userId: number, id: number) {
  const deleted = await db
    .delete(reviews)
    .where(and(eq(reviews.id, id), eq(reviews.userId, userId)))
    .returning({ id: reviews.id });
  if (!deleted.length) throw notFound("Review not found");
}
