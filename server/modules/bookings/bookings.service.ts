import { and, asc, desc, eq, ilike, gte, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  bookingAssignments, bookingGuestNames, bookingGuests, bookingPayments, bookings, employees, highlights, tasks, tourTimeSlots, tours,
} from "../../db/drizzle/schema.js";
import { nowInZone } from "../../lib/clock.js";
import { companyTimezone } from "../../lib/companyTimezone.js";
import { sameDayLastMonth } from "../../lib/dates.js";
import { notFound } from "../../lib/errors.js";
import { isoTimestamps, snakeColumns } from "../../lib/rows.js";
import type { AnalyticsQuery, GuestsQuery, ListQuery } from "./bookings.schemas.js";

const bookingColumns = snakeColumns(bookings);
const ACTIVE = ["confirmed", "pending"];

// Pieces shared by the list, the detail page and the voucher. Names are written out in full
// because inside a sub-select Drizzle would drop the table prefix and the query would match itself.
const displayStart = sql<string | null>`COALESCE("bookings"."start_time", "tour_time_slots"."start_time")`.as("display_start_time");
const displayEnd = sql<string | null>`COALESCE("bookings"."end_time", "tour_time_slots"."end_time")`.as("display_end_time");
const amountPaid = sql<string>`(SELECT COALESCE(SUM(p."amount"), 0) FROM "booking_payments" p WHERE p."booking_id" = "bookings"."id" AND p."status" = 'paid')`.as("amount_paid");
const totalGuests = sql<number | null>`(SELECT COALESCE(g."adults", 0) + COALESCE(g."children", 0) + COALESCE(g."infants", 0) FROM "booking_guests" g WHERE g."booking_id" = "bookings"."id")`.as("total_guests");
const guestDistribution = sql<{ adults: number; children: number; infants: number } | null>`(SELECT json_build_object('adults', COALESCE(g."adults", 0), 'children', COALESCE(g."children", 0), 'infants', COALESCE(g."infants", 0)) FROM "booking_guests" g WHERE g."booking_id" = "bookings"."id")`.as("guest_distribution");
const staffFor = (fields: string) =>
  sql<Record<string, unknown>[] | null>`(SELECT json_agg(json_build_object(${sql.raw(fields)})) FROM "booking_assignments" ba JOIN "employees" e ON ba."guide_id" = e."id" WHERE ba."booking_id" = "bookings"."id" AND ba."status" = 'active')`.as("staff");

const withIso = <R extends Record<string, unknown>>(row: R) => isoTimestamps(bookings, row);

export async function listBookings(q: ListQuery) {
  const where = and(
    q.dateFrom ? gte(bookings.tourDate, q.dateFrom) : undefined,
    q.dateTo ? lte(bookings.tourDate, q.dateTo) : undefined,
    q.status ? eq(bookings.status, q.status) : undefined,
    q.search
      ? or(
          ilike(bookings.primaryContactName, `%${q.search}%`),
          ilike(bookings.bookingReference, `%${q.search}%`),
          ilike(tours.tourName, `%${q.search}%`),
        )
      : undefined,
  );

  const [rows, [{ count }]] = await Promise.all([
    db
      .select({
        ...bookingColumns,
        tour_name: tours.tourName,
        staff: staffFor(`'guide_name', e."first_name" || ' ' || e."last_name", 'role', ba."role"`),
        amount_paid: amountPaid,
        total_guests: totalGuests,
        display_start_time: displayStart,
        display_end_time: displayEnd,
      })
      .from(bookings)
      .leftJoin(tours, eq(bookings.tourId, tours.id))
      .leftJoin(tourTimeSlots, eq(bookings.timeSlotId, tourTimeSlots.id))
      .where(where)
      .orderBy(desc(bookings.createdAt), desc(bookings.id))
      .limit(q.limit)
      .offset((q.page - 1) * q.limit),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(bookings).leftJoin(tours, eq(bookings.tourId, tours.id)).where(where),
  ]);

  return { data: rows.map(withIso), total: count, page: q.page, limit: q.limit };
}

const percentChange = (now: number, before: number) => (before > 0 ? Math.round(((now - before) / before) * 100) : 0);
const num = (v: unknown) => Number(v ?? 0);

/** Today's numbers for the dashboard home, with "today" read on the company clock. */
export async function dashboardStats(at: Date = new Date()) {
  const { date: today, time: now } = nowInZone(await companyTimezone(), at);
  const lastMonth = sameDayLastMonth(today);

  const live = sql`${bookings.status} IN ('confirmed', 'pending')`;
  const paidFor = sql`(SELECT COALESCE(SUM(p."amount"), 0) FROM "booking_payments" p WHERE p."booking_id" = "bookings"."id" AND p."status" = 'paid')`;

  const [[todayRow], [guests], [running], [revenue], [urgent], [unpaid], [before]] = await Promise.all([
    db.select({ tours: sql<number>`count(*)`, expected: sql<string>`COALESCE(SUM(${bookings.totalPrice}), 0)` }).from(bookings).where(and(eq(bookings.tourDate, today), live)),
    db
      .select({ total: sql<string>`COALESCE(SUM(${bookingGuests.adults} + ${bookingGuests.children} + ${bookingGuests.infants}), 0)` })
      .from(bookings)
      .innerJoin(bookingGuests, eq(bookingGuests.bookingId, bookings.id))
      .where(and(eq(bookings.tourDate, today), live)),
    // A tour is running when now falls between its start and end, whether the times come from a slot or the booking.
    db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .leftJoin(tourTimeSlots, eq(bookings.timeSlotId, tourTimeSlots.id))
      .where(and(eq(bookings.tourDate, today), live, sql`COALESCE("bookings"."start_time", "tour_time_slots"."start_time") <= ${now} AND COALESCE("bookings"."end_time", "tour_time_slots"."end_time") >= ${now}`)),
    db
      .select({ total: sql<string>`COALESCE(SUM(${bookingPayments.amount}), 0)` })
      .from(bookingPayments)
      .innerJoin(bookings, eq(bookingPayments.bookingId, bookings.id))
      .where(and(eq(bookings.tourDate, today), eq(bookingPayments.status, "paid"))),
    db.select({ count: sql<number>`count(*)` }).from(tasks).where(and(eq(tasks.priority, "urgent"), eq(tasks.status, "open"))),
    db.select({ count: sql<number>`count(*)` }).from(bookings).where(and(gte(bookings.tourDate, today), live, sql`${paidFor} < ${bookings.totalPrice}`)),
    db.select({ count: sql<number>`count(*)` }).from(bookings).where(and(eq(bookings.tourDate, lastMonth), live)),
  ]);

  const toursToday = num(todayRow?.tours);
  return {
    tours_today: toursToday,
    guests_today: num(guests?.total),
    currently_running: num(running?.count),
    revenue_today: num(revenue?.total),
    expected_revenue_today: num(todayRow?.expected),
    urgent_tasks: num(urgent?.count),
    unpaid_bookings: num(unpaid?.count),
    tours_trend: percentChange(toursToday, num(before?.count)),
  };
}

/** Money, bookings and guests for the Analytics page; `to` defaults to today on the company clock. */
export async function analytics(q: AnalyticsQuery, at: Date = new Date()) {
  const from = q.dateFrom ?? "2024-01-01";
  const to = q.dateTo ?? nowInZone(await companyTimezone(), at).date;
  const inRange = sql`b."tour_date" BETWEEN ${from} AND ${to}`;
  const notCancelled = sql`b."status" <> 'cancelled'`;
  const paid = sql`p."status" = 'paid' AND p."amount" > 0`;
  const rows = async <T>(query: SQL) => (await db.execute(query)).rows as T[];

  const [
    [revenue], [booked], [cancelled], [all], [avgGroup], revenueOverTime, bookingsByTour, bookingsBySource, popularTimeSlots, revenuePerGuide, [thisMonth], [lastMonth],
  ] = await Promise.all([
    rows<{ total: string | null }>(sql`SELECT SUM(p."amount") AS total FROM "booking_payments" p JOIN "bookings" b ON p."booking_id" = b."id" WHERE ${inRange} AND ${notCancelled} AND ${paid}`),
    rows<{ count: string }>(sql`SELECT COUNT(*) AS count FROM "bookings" b WHERE ${inRange} AND ${notCancelled}`),
    rows<{ count: string }>(sql`SELECT COUNT(*) AS count FROM "bookings" b WHERE ${inRange} AND b."status" = 'cancelled'`),
    rows<{ count: string }>(sql`SELECT COUNT(*) AS count FROM "bookings" b WHERE ${inRange}`),
    rows<{ avg: string | null }>(sql`SELECT AVG(g."adults" + g."children" + g."infants") AS avg FROM "bookings" b JOIN "booking_guests" g ON g."booking_id" = b."id" WHERE ${inRange} AND ${notCancelled}`),
    rows(sql`SELECT TO_CHAR(DATE_TRUNC('month', b."tour_date"), 'Mon YYYY') AS month, DATE_TRUNC('month', b."tour_date") AS month_date, SUM(p."amount") AS revenue, COUNT(DISTINCT b."id") AS bookings
      FROM "booking_payments" p JOIN "bookings" b ON p."booking_id" = b."id" WHERE ${inRange} AND ${notCancelled} AND ${paid}
      GROUP BY DATE_TRUNC('month', b."tour_date") ORDER BY DATE_TRUNC('month', b."tour_date")`),
    rows(sql`SELECT COALESCE(t."tour_name", 'Custom Tour') AS tour_name, COUNT(*) AS bookings, SUM(b."total_price") AS revenue
      FROM "bookings" b LEFT JOIN "tours" t ON b."tour_id" = t."id" WHERE ${inRange} AND ${notCancelled}
      GROUP BY t."tour_name" ORDER BY bookings DESC LIMIT 10`),
    rows(sql`SELECT b."source", COUNT(*) AS count FROM "bookings" b WHERE ${inRange} AND ${notCancelled} GROUP BY b."source" ORDER BY count DESC`),
    rows(sql`SELECT s."start_time" || ' – ' || s."end_time" AS slot, COUNT(*) AS bookings
      FROM "bookings" b JOIN "tour_time_slots" s ON b."time_slot_id" = s."id" WHERE ${inRange} AND ${notCancelled}
      GROUP BY s."start_time", s."end_time" ORDER BY bookings DESC LIMIT 8`),
    rows(sql`SELECT e."first_name" || ' ' || e."last_name" AS guide_name, e."position", COUNT(DISTINCT b."id") AS tours_led, SUM(p."amount") AS revenue
      FROM "booking_assignments" a JOIN "bookings" b ON a."booking_id" = b."id" JOIN "employees" e ON a."guide_id" = e."id" JOIN "booking_payments" p ON p."booking_id" = b."id"
      WHERE ${inRange} AND ${notCancelled} AND a."status" = 'active' AND a."role" = 'lead_guide' AND ${paid}
      GROUP BY e."id", e."first_name", e."last_name", e."position" ORDER BY revenue DESC LIMIT 10`),
    rows<{ count: string; revenue: string | null }>(sql`SELECT COUNT(*) AS count, SUM(b."total_price") AS revenue FROM "bookings" b WHERE DATE_TRUNC('month', b."tour_date") = DATE_TRUNC('month', ${to}::date) AND ${notCancelled}`),
    rows<{ count: string; revenue: string | null }>(sql`SELECT COUNT(*) AS count, SUM(b."total_price") AS revenue FROM "bookings" b WHERE DATE_TRUNC('month', b."tour_date") = DATE_TRUNC('month', ${to}::date - INTERVAL '1 month') AND ${notCancelled}`),
  ]);

  const total = num(all?.count);
  const currentRevenue = num(thisMonth?.revenue);
  const lastRevenue = num(lastMonth?.revenue);
  return {
    kpis: {
      total_revenue: num(revenue?.total),
      total_bookings: num(booked?.count),
      cancellation_rate: total > 0 ? Math.round((num(cancelled?.count) / total) * 100) : 0,
      avg_group_size: Math.round(num(avgGroup?.avg) * 10) / 10,
    },
    mom_growth: {
      revenue_growth: percentChange(currentRevenue, lastRevenue),
      bookings_growth: percentChange(num(thisMonth?.count), num(lastMonth?.count)),
      current_month_revenue: currentRevenue,
      last_month_revenue: lastRevenue,
    },
    revenue_over_time: revenueOverTime,
    bookings_by_tour: bookingsByTour,
    bookings_by_source: bookingsBySource,
    popular_time_slots: popularTimeSlots,
    revenue_per_guide: revenuePerGuide,
  };
}

/** One row per guest contact, with how much they have booked and spent. */
export async function listGuests(q: GuestsQuery) {
  const match = q.search
    ? sql`AND (b."primary_contact_name" ILIKE ${`%${q.search}%`} OR b."primary_contact_email" ILIKE ${`%${q.search}%`} OR b."primary_contact_phone" ILIKE ${`%${q.search}%`})`
    : sql``;
  const [page, count] = await Promise.all([
    db.execute(sql`SELECT b."primary_contact_name", b."primary_contact_email", b."primary_contact_phone",
        COUNT(*) AS total_bookings,
        COUNT(*) FILTER (WHERE b."status" = 'cancelled') AS cancelled_bookings,
        SUM(b."total_price") FILTER (WHERE b."status" <> 'cancelled') AS total_spend,
        MAX(b."tour_date") AS last_booking_date, MIN(b."tour_date") AS first_booking_date,
        array_agg(DISTINCT b."source") AS sources, array_agg(DISTINCT b."language") AS languages
      FROM "bookings" b WHERE true ${match}
      GROUP BY b."primary_contact_name", b."primary_contact_email", b."primary_contact_phone"
      ORDER BY MAX(b."tour_date") DESC LIMIT ${q.limit} OFFSET ${(q.page - 1) * q.limit}`),
    db.execute(sql`SELECT COUNT(*) AS count FROM (SELECT 1 FROM "bookings" b WHERE true ${match}
      GROUP BY b."primary_contact_name", b."primary_contact_email", b."primary_contact_phone") g`),
  ]);
  return { data: page.rows, total: num(count.rows[0]?.count), page: q.page, limit: q.limit };
}

export async function getBookingDetail(id: number) {
  const [booking] = await db
    .select({
      ...bookingColumns,
      tour_name: tours.tourName,
      tour_duration: tours.duration,
      amount_paid: amountPaid,
      staff: staffFor(`'id', ba."id", 'guide_id', ba."guide_id", 'guide_name', e."first_name" || ' ' || e."last_name", 'role', ba."role", 'profile_image', e."profile_image", 'phone', e."phone"`),
      guest_distribution: guestDistribution,
      display_start_time: displayStart,
      display_end_time: displayEnd,
    })
    .from(bookings)
    .leftJoin(tours, eq(bookings.tourId, tours.id))
    .leftJoin(tourTimeSlots, eq(bookings.timeSlotId, tourTimeSlots.id))
    .where(eq(bookings.id, id))
    .limit(1);
  if (!booking) throw notFound("Booking not found");

  const [guestNames, payments] = await Promise.all([
    db.select({ full_name: bookingGuestNames.fullName }).from(bookingGuestNames).where(eq(bookingGuestNames.bookingId, id)),
    db.select(snakeColumns(bookingPayments)).from(bookingPayments).where(eq(bookingPayments.bookingId, id)).orderBy(desc(bookingPayments.createdAt)),
  ]);
  return { ...withIso(booking), guest_list: guestNames, payment_history: payments.map((p) => isoTimestamps(bookingPayments, p)) };
}

export async function listAssignments(bookingId: number) {
  const data = await db
    .select({
      id: bookingAssignments.id,
      guide_id: bookingAssignments.guideId,
      role: bookingAssignments.role,
      status: bookingAssignments.status,
      assigned_at: bookingAssignments.assignedAt,
      guide_name: sql<string>`${employees.firstName} || ' ' || ${employees.lastName}`,
      position: employees.position,
      profile_image: employees.profileImage,
    })
    .from(bookingAssignments)
    .innerJoin(employees, eq(bookingAssignments.guideId, employees.id))
    .where(and(eq(bookingAssignments.bookingId, bookingId), eq(bookingAssignments.status, "active")))
    .orderBy(asc(bookingAssignments.id));
  return { data: data.map((a) => isoTimestamps(bookingAssignments, a)) };
}

const adTourColumns = { id: tours.id, tour_name: tours.tourName, duration: tours.duration, price: tours.price, category: tours.category, overview_title: tours.overviewTitle, slug: tours.slug };

/** Everything the printable voucher needs: the booking, the tour's highlights and up to three other tours to suggest. */
export async function getVoucher(id: number) {
  const [booking] = await db
    .select({
      ...bookingColumns,
      tour_name: tours.tourName,
      tour_duration: tours.duration,
      category: tours.category,
      overview: tours.overview,
      overview_title: tours.overviewTitle,
      includes: tours.includes,
      essentials: tours.essentials,
      landmarks: tours.landmarks,
      activity_level: tours.activityLevel,
      price: tours.price,
      staff: staffFor(`'id', ba."id", 'guide_name', e."first_name" || ' ' || e."last_name", 'role', ba."role"`),
      guest_distribution: guestDistribution,
      display_start_time: displayStart,
      display_end_time: displayEnd,
    })
    .from(bookings)
    .leftJoin(tours, eq(bookings.tourId, tours.id))
    .leftJoin(tourTimeSlots, eq(bookings.timeSlotId, tourTimeSlots.id))
    .where(eq(bookings.id, id))
    .limit(1);
  if (!booking) throw notFound("Booking not found");

  const ownTourId = (booking as unknown as { tour_id: number | null }).tour_id;
  const others = ownTourId === null ? sql`true` : sql`${tours.id} <> ${ownTourId}`;
  const [tourHighlights, featured] = await Promise.all([
    ownTourId === null ? [] : db.select({ highlight: highlights.highlight }).from(highlights).where(eq(highlights.tourId, ownTourId)).orderBy(asc(highlights.id)),
    db.select(adTourColumns).from(tours).where(and(others, or(eq(tours.bestSeller, true), eq(tours.featured, true)))).orderBy(asc(tours.id)).limit(3),
  ]);
  const extra = featured.length >= 3 ? [] : await db
    .select(adTourColumns)
    .from(tours)
    .where(and(others, featured.length ? sql`${tours.id} NOT IN (${sql.join(featured.map((t) => sql`${t.id}`), sql`, `)})` : undefined))
    .orderBy(asc(tours.id))
    .limit(3 - featured.length);

  return { ...withIso(booking), highlights: tourHighlights, ad_tours: [...featured, ...extra] };
}
