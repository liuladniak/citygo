import { and, asc, desc, eq, ilike, inArray, ne, sql, type SQL } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  agencyRecurringUnavailabilities, agencyUnavailableDates, bookings, companySettings, employees, highlights, images,
  tourActivityLog, tourItineraryCoordinates, tourRatingSummary, tourRecurringUnavailabilities, tourTimeSlots,
  tourUnavailableDates, tours,
} from "../../db/drizzle/schema.js";
import { findEmployeeByEmail } from "../../lib/currentEmployee.js";
import { conflict, notFound } from "../../lib/errors.js";
import { isoTimestamps, snakeColumns } from "../../lib/rows.js";
import { slugify } from "../../lib/slugify.js";
import { planSlotSync } from "./timeSlots.js";
import type { CreateBody, ListQuery, Slot, Stop, UpdateBody } from "./tours.schemas.js";

/** `staff` is anyone signed in with a role; visitors never see drafts. */
export type Viewer = { staff: boolean; email: string | null };

const DEFAULT_BOOKING_WINDOW_MONTHS = 6;
const tourColumns = snakeColumns(tours);
const NOW = sql`CURRENT_TIMESTAMP`;

const isUniqueViolation = (err: unknown) =>
  typeof err === "object" && err !== null && "cause" in err && (err.cause as { code?: string })?.code === "23505";

const idOf = (row: unknown) => (row as { id: number }).id;
const presentTour = (row: Record<string, unknown>) => isoTimestamps(tours, row);
const visibleTo = (viewer: Viewer): SQL | undefined => (viewer.staff ? undefined : ne(tours.status, "draft"));

async function findTour(slug: string, viewer: Viewer) {
  const [row] = await db
    .select(tourColumns)
    .from(tours)
    .where(and(eq(tours.slug, slug), visibleTo(viewer)))
    .limit(1);
  if (!row) throw notFound("Tour not found");
  return row as typeof row & { id: number };
}

const actorId = async (viewer: Viewer) => (await findEmployeeByEmail(db, viewer.email))?.id ?? null;

type Executor = Pick<typeof db, "insert">;
const logActivity = (executor: Executor, tourId: number, action: string, message: string, actor: number | null) =>
  executor.insert(tourActivityLog).values({ tourId, action, message, actorId: actor });

/** Images and highlights for a set of tours, in two queries, grouped by tour. */
async function mediaFor(tourIds: number[]) {
  const [imageRows, highlightRows] = await Promise.all([
    db.select({ tourId: images.tourId, value: images.imagePath }).from(images).where(inArray(images.tourId, tourIds)).orderBy(asc(images.id)),
    db.select({ tourId: highlights.tourId, value: highlights.highlight }).from(highlights).where(inArray(highlights.tourId, tourIds)).orderBy(asc(highlights.id)),
  ]);
  const group = (rows: { tourId: number; value: string }[]) => {
    const map = new Map<number, string[]>();
    for (const r of rows) map.set(r.tourId, [...(map.get(r.tourId) ?? []), r.value]);
    return map;
  };
  const imagesBy = group(imageRows);
  const highlightsBy = group(highlightRows);
  return (id: number) => ({ images: imagesBy.get(id) ?? [], highlights: highlightsBy.get(id) ?? [] });
}

export async function listTours(q: ListQuery, viewer: Viewer) {
  const status: SQL | undefined =
    q.status && q.status !== "all" ? eq(tours.status, q.status) : !q.status ? ne(tours.status, "draft") : undefined;
  const where = and(
    visibleTo(viewer),
    status,
    q.search ? ilike(tours.tourName, `%${q.search}%`) : undefined,
    q.category && q.category !== "all" ? eq(tours.category, q.category) : undefined,
    q.activity_level ? eq(tours.activityLevel, q.activity_level) : undefined,
    q.landmarks ? eq(tours.landmarks, q.landmarks) : undefined,
  );

  const [page, [{ total }]] = await Promise.all([
    db
      .select({
        ...tourColumns,
        avg_rating: tourRatingSummary.avgRating,
        review_count: sql<number>`coalesce(${tourRatingSummary.reviewCount}, 0)`.mapWith(Number),
      })
      .from(tours)
      .leftJoin(tourRatingSummary, eq(tours.id, tourRatingSummary.tourId))
      .where(where)
      .orderBy(asc(tours.id))
      .limit(q.limit)
      .offset((q.page - 1) * q.limit),
    db.select({ total: sql<number>`count(*)`.mapWith(Number) }).from(tours).where(where),
  ]);

  if (page.length === 0) return { data: [], currentPage: q.page, totalPages: 0, total: 0 };

  const mediaOf = await mediaFor(page.map((t) => idOf(t)));
  return {
    data: page.map((t) => ({ ...presentTour(t), ...mediaOf(idOf(t)) })),
    currentPage: q.page,
    totalPages: Math.ceil(total / q.limit),
    total,
  };
}

/** Name, price and category for pickers. Drafts only for staff. */
export async function listSimple(viewer: Viewer) {
  const data = await db
    .select({ id: tours.id, tour_name: tours.tourName, duration: tours.duration, price: tours.price, category: tours.category, slug: tours.slug })
    .from(tours)
    .where(visibleTo(viewer))
    .orderBy(asc(tours.tourName));
  return { data };
}

export async function listTimeSlots(viewer: Viewer) {
  const data = await db
    .select({ id: tourTimeSlots.id, tour_id: tourTimeSlots.tourId, start_time: tourTimeSlots.startTime, end_time: tourTimeSlots.endTime })
    .from(tourTimeSlots)
    .innerJoin(tours, eq(tourTimeSlots.tourId, tours.id))
    .where(visibleTo(viewer))
    .orderBy(asc(tourTimeSlots.tourId), asc(tourTimeSlots.startTime));
  return { data };
}

/** The wishlist page: several tours by id. */
export async function getToursByIds(ids: number[], viewer: Viewer) {
  const rows = await db.select(tourColumns).from(tours).where(and(inArray(tours.id, ids), visibleTo(viewer))).orderBy(asc(tours.id));
  if (rows.length === 0) return [];
  const mediaOf = await mediaFor(rows.map((t) => idOf(t)));
  return rows.map((t) => ({ ...presentTour(t), ...mediaOf(idOf(t)) }));
}

/** Everything the tour page and booking calendar need, one small query per table instead of one giant join. */
export async function getTourBySlug(slug: string, viewer: Viewer) {
  const tour = await findTour(slug, viewer);
  const tourId = tour.id;

  const [mediaOf, coordinates, slots, blocked, tourWeekdays, [settings], agencyDates, agencyWeekdays] = await Promise.all([
    mediaFor([tourId]),
    db
      .select({ id: tourItineraryCoordinates.id, order: tourItineraryCoordinates.order, latitude: tourItineraryCoordinates.latitude, longitude: tourItineraryCoordinates.longitude, name: tourItineraryCoordinates.name })
      .from(tourItineraryCoordinates)
      .where(eq(tourItineraryCoordinates.tourId, tourId))
      .orderBy(asc(tourItineraryCoordinates.order), asc(tourItineraryCoordinates.id)),
    db
      .select({ id: tourTimeSlots.id, start_time: tourTimeSlots.startTime, end_time: tourTimeSlots.endTime })
      .from(tourTimeSlots)
      .where(eq(tourTimeSlots.tourId, tourId))
      .orderBy(asc(tourTimeSlots.startTime), asc(tourTimeSlots.id)),
    db.select({ date: tourUnavailableDates.unavailableDate }).from(tourUnavailableDates).where(eq(tourUnavailableDates.tourId, tourId)).orderBy(asc(tourUnavailableDates.unavailableDate)),
    db.select({ day: tourRecurringUnavailabilities.dayOfWeek }).from(tourRecurringUnavailabilities).where(eq(tourRecurringUnavailabilities.tourId, tourId)).orderBy(asc(tourRecurringUnavailabilities.dayOfWeek)),
    db.select({ months: companySettings.bookingWindowMonths }).from(companySettings).limit(1),
    db.select({ date: agencyUnavailableDates.unavailableDate }).from(agencyUnavailableDates).orderBy(asc(agencyUnavailableDates.unavailableDate)),
    db.select({ day: agencyRecurringUnavailabilities.dayOfWeek }).from(agencyRecurringUnavailabilities).orderBy(asc(agencyRecurringUnavailabilities.dayOfWeek)),
  ]);

  return {
    ...presentTour(tour),
    ...mediaOf(tourId),
    tour_itinerary_coordinates: coordinates,
    tour_time_slots: slots,
    unavailable_dates: [...new Set(blocked.map((b) => b.date))],
    unavailable_recurring_day_of_week: tourWeekdays.map((w) => w.day),
    booking_window_months: settings?.months ?? DEFAULT_BOOKING_WINDOW_MONTHS,
    agency_unavailable_dates: agencyDates.map((d) => d.date),
    agency_recurring_days: agencyWeekdays.map((w) => w.day),
  };
}

export async function getActivity(slug: string) {
  const tour = await findTour(slug, { staff: true, email: null });
  const rows = await db
    .select({
      ...snakeColumns(tourActivityLog),
      actor_name: sql<string | null>`${employees.firstName} || ' ' || ${employees.lastName}`,
    })
    .from(tourActivityLog)
    .leftJoin(employees, eq(tourActivityLog.actorId, employees.id))
    .where(eq(tourActivityLog.tourId, tour.id))
    .orderBy(desc(tourActivityLog.createdAt), desc(tourActivityLog.id))
    .limit(50);
  return rows.map((r) => isoTimestamps(tourActivityLog, r));
}

const itineraryRows = (tourId: number, stops: Stop[]) =>
  stops.map((s, i) => ({ tourId, order: i + 1, name: s.name, latitude: String(s.latitude), longitude: String(s.longitude) }));

/** A tour with its photos, highlights, slots and route is created whole or not at all. */
export async function createTour(body: CreateBody, viewer: Viewer) {
  const slug = body.slug ?? slugify(body.tour_name);
  if (!slug) throw conflict("Please use a tour name with letters or numbers");
  const actor = await actorId(viewer);

  try {
    return await db.transaction(async (tx) => {
      const [taken] = await tx.select({ id: tours.id }).from(tours).where(eq(tours.slug, slug)).limit(1);
      if (taken) throw conflict("A tour with this name already exists");

      const [tour] = await tx
        .insert(tours)
        .values({
          tourName: body.tour_name, price: String(body.price), duration: body.duration, slug, activityLevel: body.activity_level,
          category: body.category, overviewTitle: body.overview_title, overview: body.overview, landmarks: body.landmarks,
          groups: body.groups, minimumOfAttendees: body.minimum_of_attendees, additionalCosts: body.additional_costs,
          essentials: body.essentials, includes: body.includes, bestSeller: body.best_seller, featured: body.featured,
          accessibility: body.accessibility, status: body.status,
        })
        .returning(tourColumns);
      const tourId = idOf(tour);

      const highlightsToSave = body.highlights.filter(Boolean);
      if (body.images.length) await tx.insert(images).values(body.images.map((imagePath) => ({ tourId, imagePath })));
      if (highlightsToSave.length) await tx.insert(highlights).values(highlightsToSave.map((highlight) => ({ tourId, highlight })));
      if (body.time_slots.length) await tx.insert(tourTimeSlots).values(body.time_slots.map((s) => ({ tourId, startTime: s.start_time, endTime: s.end_time })));
      if (body.itinerary.length) await tx.insert(tourItineraryCoordinates).values(itineraryRows(tourId, body.itinerary));

      await logActivity(tx, tourId, "created", `Tour "${body.tour_name}" created`, actor);
      return { message: "Tour created successfully", tour: presentTour(tour) };
    });
  } catch (err) {
    if (isUniqueViolation(err)) throw conflict("A tour with this name already exists");
    throw err;
  }
}

const summaryOf = (changes: UpdateBody) =>
  Object.entries(changes)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => {
      if (k === "price") return `price changed to €${v}`;
      if (k === "best_seller") return `bestseller ${v ? "enabled" : "disabled"}`;
      if (k === "featured") return `featured ${v ? "enabled" : "disabled"}`;
      if (k === "status") return `status changed to ${v}`;
      if (k === "tour_name") return `name changed to "${v}"`;
      return `${k} updated`;
    })
    .join(", ");

const toColumns = (b: UpdateBody) => ({
  ...(b.tour_name !== undefined && { tourName: b.tour_name }),
  ...(b.price !== undefined && { price: String(b.price) }),
  ...(b.duration !== undefined && { duration: b.duration }),
  ...(b.activity_level !== undefined && { activityLevel: b.activity_level }),
  ...(b.category !== undefined && { category: b.category }),
  ...(b.overview_title !== undefined && { overviewTitle: b.overview_title }),
  ...(b.overview !== undefined && { overview: b.overview }),
  ...(b.landmarks !== undefined && { landmarks: b.landmarks }),
  ...(b.groups !== undefined && { groups: b.groups }),
  ...(b.minimum_of_attendees !== undefined && { minimumOfAttendees: b.minimum_of_attendees }),
  ...(b.additional_costs !== undefined && { additionalCosts: b.additional_costs }),
  ...(b.essentials !== undefined && { essentials: b.essentials }),
  ...(b.includes !== undefined && { includes: b.includes }),
  ...(b.accessibility !== undefined && { accessibility: b.accessibility }),
  ...(b.best_seller !== undefined && { bestSeller: b.best_seller }),
  ...(b.featured !== undefined && { featured: b.featured }),
  ...(b.status !== undefined && { status: b.status }),
});

export async function updateTour(slug: string, body: UpdateBody, viewer: Viewer) {
  const tour = await findTour(slug, { staff: true, email: null });
  const actor = await actorId(viewer);

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(tours)
      .set({ ...toColumns(body), updatedAt: NOW as unknown as string })
      .where(eq(tours.id, tour.id))
      .returning(tourColumns);
    await logActivity(tx, tour.id, "edit", `Tour updated — ${summaryOf(body)}`, actor);
    return { message: "Tour updated successfully!", tour: presentTour(updated) };
  });
}

/** Swaps a tour's photos for a new set in one step, so a failure cannot leave it with none. */
export async function replaceImages(slug: string, urls: string[], viewer: Viewer) {
  const tour = await findTour(slug, { staff: true, email: null });
  const actor = await actorId(viewer);
  await db.transaction(async (tx) => {
    await tx.delete(images).where(eq(images.tourId, tour.id));
    if (urls.length) await tx.insert(images).values(urls.map((imagePath) => ({ tourId: tour.id, imagePath })));
    await logActivity(tx, tour.id, "images", `Images updated (${urls.length} images)`, actor);
  });
  return { message: "Images updated" };
}

export async function replaceHighlights(slug: string, list: string[], viewer: Viewer) {
  const tour = await findTour(slug, { staff: true, email: null });
  const actor = await actorId(viewer);
  const kept = list.filter(Boolean);
  await db.transaction(async (tx) => {
    await tx.delete(highlights).where(eq(highlights.tourId, tour.id));
    if (kept.length) await tx.insert(highlights).values(kept.map((highlight) => ({ tourId: tour.id, highlight })));
    await logActivity(tx, tour.id, "highlights", `Highlights updated (${list.length} highlights)`, actor);
  });
  return { message: "Highlights updated" };
}

export async function replaceItinerary(slug: string, stops: Stop[], viewer: Viewer) {
  const tour = await findTour(slug, { staff: true, email: null });
  const actor = await actorId(viewer);
  await db.transaction(async (tx) => {
    await tx.delete(tourItineraryCoordinates).where(eq(tourItineraryCoordinates.tourId, tour.id));
    if (stops.length) await tx.insert(tourItineraryCoordinates).values(itineraryRows(tour.id, stops));
    await logActivity(tx, tour.id, "itinerary", `Itinerary updated (${stops.length} stops)`, actor);
  });
  return { message: "Itinerary updated" };
}

export async function syncTimeSlots(slug: string, wanted: Slot[], viewer: Viewer) {
  const tour = await findTour(slug, { staff: true, email: null });
  const actor = await actorId(viewer);

  return db.transaction(async (tx) => {
    const [stored, booked] = await Promise.all([
      tx.select({ id: tourTimeSlots.id, start_time: tourTimeSlots.startTime, end_time: tourTimeSlots.endTime }).from(tourTimeSlots).where(eq(tourTimeSlots.tourId, tour.id)),
      tx.select({ id: bookings.timeSlotId }).from(bookings).where(eq(bookings.tourId, tour.id)),
    ]);
    const bookedIds = new Set(booked.map((b) => b.id).filter((id): id is number => id !== null));
    const plan = planSlotSync(stored, wanted, bookedIds);

    if (plan.toAdd.length) await tx.insert(tourTimeSlots).values(plan.toAdd.map((s) => ({ tourId: tour.id, startTime: s.start_time, endTime: s.end_time })));
    if (plan.toDelete.length) await tx.delete(tourTimeSlots).where(inArray(tourTimeSlots.id, plan.toDelete));
    await logActivity(tx, tour.id, "schedule", "Time slots updated", actor);

    const time_slots = await tx
      .select(snakeColumns(tourTimeSlots))
      .from(tourTimeSlots)
      .where(eq(tourTimeSlots.tourId, tour.id))
      .orderBy(asc(tourTimeSlots.id));
    return { message: "Time slots updated", time_slots: time_slots.map((s) => isoTimestamps(tourTimeSlots, s)) };
  });
}

export async function getBlockedDays(slug: string, viewer: Viewer) {
  const tour = await findTour(slug, viewer);
  const [specific, recurring] = await Promise.all([
    db.select(snakeColumns(tourUnavailableDates)).from(tourUnavailableDates).where(eq(tourUnavailableDates.tourId, tour.id)).orderBy(asc(tourUnavailableDates.unavailableDate), asc(tourUnavailableDates.id)),
    db.select(snakeColumns(tourRecurringUnavailabilities)).from(tourRecurringUnavailabilities).where(eq(tourRecurringUnavailabilities.tourId, tour.id)).orderBy(asc(tourRecurringUnavailabilities.dayOfWeek)),
  ]);
  return {
    specific: specific.map((r) => isoTimestamps(tourUnavailableDates, r)),
    recurring: recurring.map((r) => isoTimestamps(tourRecurringUnavailabilities, r)),
  };
}

export async function blockDate(slug: string, date: string, reason: string | undefined) {
  const tour = await findTour(slug, { staff: true, email: null });
  const [row] = await db
    .insert(tourUnavailableDates)
    .values({ tourId: tour.id, unavailableDate: date, reason: reason || null })
    .returning(snakeColumns(tourUnavailableDates));
  return isoTimestamps(tourUnavailableDates, row);
}

/** Only removes a date that belongs to this tour, so one tour's page can't clear another's. */
export async function unblockDate(slug: string, id: number) {
  const tour = await findTour(slug, { staff: true, email: null });
  await db.delete(tourUnavailableDates).where(and(eq(tourUnavailableDates.id, id), eq(tourUnavailableDates.tourId, tour.id)));
}

export async function blockWeekday(slug: string, dayOfWeek: number, reason: string | undefined) {
  const tour = await findTour(slug, { staff: true, email: null });
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: tourRecurringUnavailabilities.id })
      .from(tourRecurringUnavailabilities)
      .where(and(eq(tourRecurringUnavailabilities.tourId, tour.id), eq(tourRecurringUnavailabilities.dayOfWeek, dayOfWeek)))
      .limit(1);
    if (existing) throw conflict("Already blocked");
    const [row] = await tx
      .insert(tourRecurringUnavailabilities)
      .values({ tourId: tour.id, dayOfWeek, reason: reason || null })
      .returning(snakeColumns(tourRecurringUnavailabilities));
    return isoTimestamps(tourRecurringUnavailabilities, row);
  });
}

export async function unblockWeekday(slug: string, id: number) {
  const tour = await findTour(slug, { staff: true, email: null });
  await db.delete(tourRecurringUnavailabilities).where(and(eq(tourRecurringUnavailabilities.id, id), eq(tourRecurringUnavailabilities.tourId, tour.id)));
}
