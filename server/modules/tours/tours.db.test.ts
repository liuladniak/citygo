import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { startApp } from "../../test/app.js";
import { db, resetDb } from "../../test/db.js";
import { makeEmployee, makeTimeSlot, makeTour, makeUser } from "../../test/fixtures.js";
import {
  agencyRecurringUnavailabilities, agencyUnavailableDates, bookings, companySettings, highlights, images,
  reviews, tourActivityLog, tourItineraryCoordinates, tourRecurringUnavailabilities, tourTimeSlots, tourUnavailableDates, tours,
} from "../../db/drizzle/schema.js";
import tourRoutes from "./tours.routes.js";

// Sign-in is Supabase's job; roles come from the test app.
vi.mock("../../middleware/auth.js", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../middleware/auth.js")>()),
  requireAuth: (_req: unknown, _res: unknown, next: () => void) => next(),
  optionalAuth: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

let visitor: Awaited<ReturnType<typeof startApp>>;
let manager: Awaited<ReturnType<typeof startApp>>;
let guide: Awaited<ReturnType<typeof startApp>>;
beforeAll(async () => {
  visitor = await startApp(tourRoutes);
  manager = await startApp(tourRoutes, { role: "manager", email: "boss@example.test" });
  guide = await startApp(tourRoutes, { role: "guide", email: "g@example.test" });
});
afterAll(async () => {
  await Promise.all([visitor.close(), manager.close(), guide.close()]);
});
beforeEach(resetDb);

let n = 0;
const tour = (over: Partial<Parameters<typeof makeTour>[0]> = {}) => {
  n += 1;
  return makeTour({ tourName: `Tour ${n}`, slug: `tour-${n}`, ...over });
};

describe("GET / (list)", () => {
  it("lists tours by id with images, highlights and rating, newest page counts, hiding drafts", async () => {
    const a = await tour({ price: "75.50" });
    const b = await tour();
    await tour({ status: "draft" });
    await db.insert(images).values([{ tourId: a.id, imagePath: "/a1.jpg" }, { tourId: a.id, imagePath: "/a2.jpg" }]);
    await db.insert(highlights).values([{ tourId: a.id, highlight: "H1" }, { tourId: a.id, highlight: "H2" }]);
    const user = await makeUser({});
    const [bk] = await db.insert(bookings).values({
      tourId: a.id, tourDate: "2026-10-05", isCustomTour: true, startTime: "09:00:00", endTime: "13:00:00",
      primaryContactName: "G", status: "completed", source: "website", bookingReference: "BK-L-1", userId: user.id,
    }).returning();
    await db.insert(reviews).values({ bookingId: bk.id, tourId: a.id, userId: user.id, rating: 4, body: "ok" });

    const res = await visitor.get("/?limit=12");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ currentPage: 1, totalPages: 1, total: 2 });
    expect(res.body.data.map((t: any) => t.id)).toEqual([a.id, b.id]);
    expect(res.body.data[0]).toMatchObject({
      id: a.id, tour_name: a.tourName, slug: a.slug, price: "75.50", status: "active", best_seller: false,
      images: ["/a1.jpg", "/a2.jpg"], highlights: ["H1", "H2"], avg_rating: "4.0", review_count: 1,
    });
    expect(res.body.data[1]).toMatchObject({ images: [], highlights: [], avg_rating: null, review_count: 0 });
  });

  it("filters and pages", async () => {
    await tour({ tourName: "Bosphorus Cruise", category: "cruise", activityLevel: "easy", landmarks: "Bosphorus" });
    await tour({ tourName: "Hill Hike", category: "hiking", activityLevel: "hard", landmarks: "Camlica" });
    await tour({ tourName: "Food Walk", category: "food", activityLevel: "easy", landmarks: "Kadikoy" });
    const names = async (q: string) => (await visitor.get(`/${q}`)).body.data.map((t: any) => t.tour_name);
    expect(await names("?search=bosph")).toEqual(["Bosphorus Cruise"]);
    expect(await names("?category=hiking")).toEqual(["Hill Hike"]);
    expect(await names("?category=all")).toHaveLength(3);
    expect(await names("?activity_level=easy")).toEqual(["Bosphorus Cruise", "Food Walk"]);
    expect(await names("?landmarks=Kadikoy")).toEqual(["Food Walk"]);
    const p2 = await visitor.get("/?limit=2&page=2");
    expect(p2.body).toMatchObject({ currentPage: 2, totalPages: 2, total: 3 });
    expect(p2.body.data.map((t: any) => t.tour_name)).toEqual(["Food Walk"]);
  });

  it("is an empty page, not an error, when nothing matches", async () => {
    expect((await visitor.get("/?search=zzz")).body).toEqual({ data: [], currentPage: 1, totalPages: 0, total: 0 });
  });
});

describe("small lists", () => {
  it("/simple lists names for pickers, /time-slots lists slots by tour and start", async () => {
    const b = await tour({ tourName: "B Tour" });
    const a = await tour({ tourName: "A Tour", status: "draft" });
    await makeTimeSlot(b.id, { startTime: "14:00:00", endTime: "17:00:00" });
    await makeTimeSlot(b.id, { startTime: "09:00:00", endTime: "12:00:00" });
    const simple = await manager.get("/simple");
    expect(simple.body.data.map((t: any) => t.tour_name)).toEqual(["A Tour", "B Tour"]);
    expect(Object.keys(simple.body.data[0]).sort()).toEqual(["category", "duration", "id", "price", "slug", "tour_name"]);
    const slots = await manager.get("/time-slots");
    expect(slots.body.data.map((s: any) => s.start_time)).toEqual(["09:00:00", "14:00:00"]);
    expect(a.id).toBeLessThan(b.id + 10);
  });

  it("/specific-tours returns the wishlist tours with images and highlights", async () => {
    const a = await tour();
    const b = await tour();
    await tour();
    await db.insert(images).values({ tourId: a.id, imagePath: "/a.jpg" });
    const res = await visitor.get(`/specific-tours?ids=${a.id},${b.id}`);
    expect(res.status).toBe(200);
    expect(res.body.map((t: any) => t.id).sort()).toEqual([a.id, b.id].sort());
    expect(res.body.find((t: any) => t.id === a.id).images).toEqual(["/a.jpg"]);
    expect((await visitor.get("/specific-tours")).status).toBe(400);
  });
});

describe("GET /:slug", () => {
  it("returns the tour with everything the booking page needs", async () => {
    const t = await tour({ slug: "old-city" });
    await db.insert(images).values([{ tourId: t.id, imagePath: "/1.jpg" }, { tourId: t.id, imagePath: "/2.jpg" }]);
    await db.insert(highlights).values([{ tourId: t.id, highlight: "A" }, { tourId: t.id, highlight: "B" }, { tourId: t.id, highlight: "C" }]);
    await makeTimeSlot(t.id, { startTime: "09:00:00", endTime: "12:00:00" });
    await db.insert(tourItineraryCoordinates).values([
      { tourId: t.id, order: 1, name: "Start", latitude: "41.00820000", longitude: "28.97840000" },
      { tourId: t.id, order: 2, name: "End", latitude: "41.01000000", longitude: "28.98000000" },
    ]);
    await db.insert(tourUnavailableDates).values({ tourId: t.id, unavailableDate: "2026-12-25" });
    await db.insert(tourRecurringUnavailabilities).values({ tourId: t.id, dayOfWeek: 1 });
    await db.insert(agencyUnavailableDates).values({ unavailableDate: "2026-12-31" });
    await db.insert(agencyRecurringUnavailabilities).values({ dayOfWeek: 0 });
    await db.insert(companySettings).values({ id: 1, name: "CityGo", bookingWindowMonths: 9 });

    const res = await visitor.get("/old-city");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: t.id, tour_name: t.tourName, slug: "old-city", images: ["/1.jpg", "/2.jpg"], highlights: ["A", "B", "C"],
      unavailable_recurring_day_of_week: [1], booking_window_months: 9, agency_unavailable_dates: ["2026-12-31"], agency_recurring_days: [0],
    });
    expect(res.body.tour_time_slots).toEqual([{ id: expect.any(Number), start_time: "09:00:00", end_time: "12:00:00" }]);
    expect(res.body.tour_itinerary_coordinates).toEqual([
      { id: expect.any(Number), order: 1, latitude: "41.00820000", longitude: "28.97840000", name: "Start" },
      { id: expect.any(Number), order: 2, latitude: "41.01000000", longitude: "28.98000000", name: "End" },
    ]);
    expect(res.body.unavailable_dates).toHaveLength(1);
    expect(res.body.unavailable_dates[0]).toMatch(/^2026-12-25/);
  });

  it("falls back to a six-month window and empty lists, and answers 404 for an unknown slug", async () => {
    await tour({ slug: "plain" });
    const res = await visitor.get("/plain");
    expect(res.body).toMatchObject({
      images: [], highlights: [], tour_time_slots: [], tour_itinerary_coordinates: [], unavailable_dates: [], booking_window_months: 6,
      agency_unavailable_dates: [], agency_recurring_days: [], unavailable_recurring_day_of_week: [],
    });
    expect((await visitor.get("/missing")).status).toBe(404);
  });
});

describe("activity and availability reads", () => {
  it("shows the latest activity with who did it", async () => {
    const t = await tour({ slug: "act" });
    const e = await makeEmployee({ firstName: "Bo", lastName: "Ss" });
    await db.insert(tourActivityLog).values([
      { tourId: t.id, action: "created", message: "one", actorId: e.id, createdAt: "2026-11-01 10:00:00" },
      { tourId: t.id, action: "edit", message: "two", createdAt: "2026-11-02 10:00:00" },
    ]);
    const res = await visitor.get("/act/activity");
    expect(res.body.map((l: any) => l.message)).toEqual(["two", "one"]);
    expect(res.body[1]).toMatchObject({ action: "created", actor_id: e.id, actor_name: "Bo Ss" });
    expect(res.body[0].actor_name).toBeNull();
    expect((await visitor.get("/nope/activity")).status).toBe(404);
  });

  it("lists blocked dates and weekdays for one tour", async () => {
    const t = await tour({ slug: "block" });
    await db.insert(tourUnavailableDates).values([{ tourId: t.id, unavailableDate: "2026-12-30", reason: "b" }, { tourId: t.id, unavailableDate: "2026-12-01" }]);
    await db.insert(tourRecurringUnavailabilities).values([{ tourId: t.id, dayOfWeek: 3 }, { tourId: t.id, dayOfWeek: 1, reason: "Mondays" }]);
    const res = await visitor.get("/block/unavailable-dates");
    expect(res.body.specific.map((s: any) => s.unavailable_date.slice(0, 10))).toEqual(["2026-12-01", "2026-12-30"]);
    expect(res.body.recurring.map((r: any) => r.day_of_week)).toEqual([1, 3]);
  });
});

describe("creating a tour", () => {
  const body = {
    tour_name: "Café Crawl İstanbul", price: 40, duration: "3 hours", category: "food", activity_level: "easy",
    overview_title: "Coffee", overview: "Taste it", landmarks: "Kadikoy", groups: 8, minimum_of_attendees: 2,
    additional_costs: "None", essentials: "Appetite", includes: "Coffee", accessibility: ["Step-free", "Pram friendly"],
    highlights: ["Beans", "", "Pastry"], images: ["/c1.jpg"], time_slots: [{ start_time: "10:00", end_time: "13:00" }],
    itinerary: [{ name: "Cafe", latitude: 40.99, longitude: 29.02 }],
  };

  it("creates the tour as a draft with its images, highlights, slots and route, and logs it", async () => {
    const res = await manager.post("/", body);
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Tour created successfully");
    expect(res.body.tour).toMatchObject({ tour_name: "Café Crawl İstanbul", slug: "cafe-crawl-istanbul", status: "draft", accessibility: "Step-free, Pram friendly", price: "40.00" });
    const id = res.body.tour.id;
    expect((await db.select().from(images).where(eq(images.tourId, id))).map((i) => i.imagePath)).toEqual(["/c1.jpg"]);
    expect((await db.select().from(highlights).where(eq(highlights.tourId, id))).map((h) => h.highlight)).toEqual(["Beans", "Pastry"]);
    expect((await db.select().from(tourTimeSlots).where(eq(tourTimeSlots.tourId, id))).map((s) => s.startTime)).toEqual(["10:00:00"]);
    expect((await db.select().from(tourItineraryCoordinates).where(eq(tourItineraryCoordinates.tourId, id))).map((c) => c.order)).toEqual([1]);
    expect((await db.select().from(tourActivityLog).where(eq(tourActivityLog.tourId, id)))[0]).toMatchObject({ action: "created", message: 'Tour "Café Crawl İstanbul" created' });
  });

  it("refuses duplicates, missing basics and anyone but managers", async () => {
    expect((await manager.post("/", body)).status).toBe(201);
    expect((await manager.post("/", body)).status).toBe(409);
    expect((await manager.post("/", { tour_name: "x" })).status).toBe(400);
    expect((await guide.post("/", { ...body, tour_name: "Other" })).status).toBe(403);
    expect((await visitor.post("/", { ...body, tour_name: "Other" })).status).toBe(403);
  });
});

describe("changing a tour", () => {
  it("updates sent fields, logs a summary and returns the tour", async () => {
    const t = await tour({ slug: "edit-me", price: "50.00" });
    const res = await manager.patch("/edit-me", { price: 60, best_seller: true, status: "inactive", accessibility: ["A", "B"], ignored: "x" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Tour updated successfully!");
    expect(res.body.tour).toMatchObject({ price: "60.00", best_seller: true, status: "inactive", accessibility: "A, B" });
    const [log] = await db.select().from(tourActivityLog).where(eq(tourActivityLog.tourId, t.id));
    expect(log).toMatchObject({ action: "edit", message: "Tour updated — price changed to €60, bestseller enabled, status changed to inactive, accessibility updated" });
    expect((await manager.patch("/edit-me", {})).status).toBe(400);
    expect((await manager.patch("/missing", { price: 1 })).status).toBe(404);
    expect((await guide.patch("/edit-me", { price: 1 })).status).toBe(403);
  });

  it("replaces images, highlights and the route", async () => {
    const t = await tour({ slug: "rep" });
    await db.insert(images).values({ tourId: t.id, imagePath: "/old.jpg" });
    await db.insert(highlights).values({ tourId: t.id, highlight: "old" });
    expect((await manager.put("/rep/images", { images: ["/n1.jpg", "/n2.jpg"] })).body).toEqual({ message: "Images updated" });
    expect((await manager.put("/rep/highlights", { highlights: ["x", "", "y"] })).body).toEqual({ message: "Highlights updated" });
    expect((await manager.put("/rep/itinerary", { itinerary: [{ name: "A", latitude: 1, longitude: 2 }, { name: "B", latitude: 3, longitude: 4 }] })).body).toEqual({ message: "Itinerary updated" });
    expect((await db.select().from(images).where(eq(images.tourId, t.id))).map((i) => i.imagePath)).toEqual(["/n1.jpg", "/n2.jpg"]);
    expect((await db.select().from(highlights).where(eq(highlights.tourId, t.id))).map((h) => h.highlight)).toEqual(["x", "y"]);
    expect((await db.select().from(tourItineraryCoordinates).where(eq(tourItineraryCoordinates.tourId, t.id))).map((c) => [c.name, c.order])).toEqual([["A", 1], ["B", 2]]);
    expect((await manager.put("/rep/images", { images: [] })).status).toBe(200);
    expect(await db.select().from(images).where(eq(images.tourId, t.id))).toHaveLength(0);
    expect((await manager.put("/missing/images", { images: [] })).status).toBe(404);
  });

  it("syncs time slots: adds new, drops unused, keeps slots that bookings use", async () => {
    const t = await tour({ slug: "slots" });
    const keep = await makeTimeSlot(t.id, { startTime: "09:00:00", endTime: "12:00:00" });
    const used = await makeTimeSlot(t.id, { startTime: "13:00:00", endTime: "16:00:00" });
    await makeTimeSlot(t.id, { startTime: "17:00:00", endTime: "19:00:00" });
    await db.insert(bookings).values({
      tourId: t.id, timeSlotId: used.id, tourDate: "2026-10-05", primaryContactName: "G", status: "confirmed", source: "website", bookingReference: "BK-S-1",
    });
    const res = await manager.put("/slots/time-slots", { time_slots: [{ start_time: "09:00", end_time: "12:00" }, { start_time: "20:00", end_time: "22:00" }] });
    expect(res.status).toBe(200);
    expect(res.body.time_slots.map((s: any) => s.start_time).sort()).toEqual(["09:00:00", "13:00:00", "20:00:00"]);
    expect(res.body.time_slots.find((s: any) => s.id === keep.id)).toBeTruthy();
  });
});

describe("blocking dates for one tour", () => {
  it("adds and removes a blocked date and a blocked weekday", async () => {
    const t = await tour({ slug: "blk" });
    const d = await manager.post("/blk/unavailable-dates", { date: "2026-12-25", reason: "Holiday" });
    expect(d.status).toBe(201);
    expect(d.body).toMatchObject({ tour_id: t.id, reason: "Holiday" });
    expect(d.body.unavailable_date).toMatch(/^2026-12-25/);
    expect((await manager.post("/blk/unavailable-dates", {})).status).toBe(400);
    expect((await manager.delete(`/blk/unavailable-dates/${d.body.id}`)).body).toEqual({ message: "Deleted" });

    const w = await manager.post("/blk/recurring-unavailabilities", { day_of_week: 2 });
    expect(w.status).toBe(201);
    expect((await manager.post("/blk/recurring-unavailabilities", { day_of_week: 2 })).status).toBe(409);
    expect((await manager.post("/blk/recurring-unavailabilities", {})).status).toBe(400);
    expect((await manager.delete(`/blk/recurring-unavailabilities/${w.body.id}`)).status).toBe(200);
    expect((await guide.post("/blk/unavailable-dates", { date: "2026-12-26" })).status).toBe(403);
    expect((await manager.post("/missing/unavailable-dates", { date: "2026-12-26" })).status).toBe(404);
  });
});

describe("rules added in the migration", () => {
  it("hides draft tours from visitors everywhere, but not from staff", async () => {
    const draft = await tour({ status: "draft" });
    expect((await visitor.get(`/${draft.slug}`)).status).toBe(404);
    expect((await visitor.get("/?status=draft")).body.total).toBe(0);
    expect((await visitor.get(`/specific-tours?ids=${draft.id}`)).body).toEqual([]);
    expect((await manager.get(`/${draft.slug}`)).status).toBe(200);
  });

  it("rejects bad ids and caps the page size", async () => {
    expect((await visitor.get("/specific-tours?ids=abc")).status).toBe(400);
    await tour();
    expect((await visitor.get("/?limit=9999")).body.totalPages).toBe(1);
  });

  it("only removes a blocked date that belongs to the tour in the URL", async () => {
    const a = await tour();
    const b = await tour();
    const [row] = await db.insert(tourUnavailableDates).values({ tourId: a.id, unavailableDate: "2026-12-24" }).returning();
    await manager.delete(`/${b.slug}/unavailable-dates/${row.id}`);
    expect(await db.select().from(tourUnavailableDates).where(eq(tourUnavailableDates.tourId, a.id))).toHaveLength(1);
  });
});
