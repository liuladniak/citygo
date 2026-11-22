import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { startApp } from "../../test/app.js";
import { db, resetDb } from "../../test/db.js";
import { makeTour, makeUser } from "../../test/fixtures.js";
import { bookings, reviews } from "../../db/drizzle/schema.js";
import reviewRoutes from "./reviews.routes.js";

// Sign-in is Supabase's job; the tests only decide who is "signed in".
const auth = vi.hoisted(() => ({ supabaseId: "" as string }));
vi.mock("../../middleware/clientAuth.js", () => ({
  requireClientAuth: (req: any, res: any, next: () => void) => {
    if (!auth.supabaseId) return res.status(401).json({ error: "Unauthorized" });
    req.userId = auth.supabaseId;
    next();
  },
}));

const ME = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";

let app: Awaited<ReturnType<typeof startApp>>;
beforeAll(async () => (app = await startApp(reviewRoutes)));
afterAll(() => app.close());

let me: Awaited<ReturnType<typeof makeUser>>;
let other: Awaited<ReturnType<typeof makeUser>>;
let tour: Awaited<ReturnType<typeof makeTour>>;

beforeEach(async () => {
  await resetDb();
  auth.supabaseId = ME;
  me = await makeUser({ firstName: "Ayla", lastName: "Demir", email: "me@example.test", supabaseId: ME, country: "TR" });
  other = await makeUser({ firstName: "Ben", lastName: "Smith", email: "other@example.test", supabaseId: OTHER });
  tour = await makeTour();
});

let ref = 0;
async function makeBooking(userId: number, status = "completed", tourId = tour.id) {
  ref += 1;
  const [row] = await db
    .insert(bookings)
    .values({
      tourId, userId, status, tourDate: "2026-10-05", isCustomTour: true, startTime: "09:00:00", endTime: "13:00:00",
      primaryContactName: "Guest", source: "website", bookingReference: `BK-R-${ref}`,
    })
    .returning();
  return row;
}

const review = { rating: 5, title: "Great", body: "Loved it" };

describe("GET /tour/:tourId", () => {
  it("lists reviews with the reviewer's first name and last initial, plus the rating summary", async () => {
    const b1 = await makeBooking(me.id);
    const b2 = await makeBooking(other.id);
    await db.insert(reviews).values([
      { bookingId: b1.id, tourId: tour.id, userId: me.id, rating: 5, title: "Great", body: "Loved it", photos: ["/p.jpg"] },
      { bookingId: b2.id, tourId: tour.id, userId: other.id, rating: 4, body: "Good" },
    ]);

    const res = await app.get(`/tour/${tour.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ total: 2, totalPages: 1, page: 1 });
    expect(res.body.summary).toMatchObject({ tour_id: tour.id, avg_rating: "4.5", review_count: 2 });
    const mine = res.body.reviews.find((r: any) => r.title === "Great");
    expect(mine).toMatchObject({
      rating: 5, body: "Loved it", photos: ["/p.jpg"], first_name: "Ayla", last_initial: "D", country: "TR",
    });
    expect(mine.tour_date).toMatch(/^2026-10-05/);
    expect(mine.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T.*Z$/);
    expect(mine).not.toHaveProperty("user_id");
    expect(mine).not.toHaveProperty("email");
  });

  it("sorts and pages", async () => {
    for (const rating of [3, 5, 1]) {
      const b = await makeBooking(me.id);
      await db.insert(reviews).values({ bookingId: b.id, tourId: tour.id, userId: me.id, rating, body: `r${rating}` });
    }
    const high = await app.get(`/tour/${tour.id}?sort=highest&limit=2`);
    expect(high.body.reviews.map((r: any) => r.rating)).toEqual([5, 3]);
    expect(high.body).toMatchObject({ total: 3, totalPages: 2 });
    const low = await app.get(`/tour/${tour.id}?sort=lowest&limit=2&page=2`);
    expect(low.body.reviews.map((r: any) => r.rating)).toEqual([5]);
  });

  it("has an empty summary for a tour nobody reviewed", async () => {
    const res = await app.get(`/tour/${tour.id}`);
    expect(res.body).toMatchObject({ reviews: [], summary: { avg_rating: null, review_count: 0 }, total: 0, totalPages: 0 });
  });
});

describe("POST /", () => {
  it("lets a guest review their own completed booking once", async () => {
    const b = await makeBooking(me.id);
    const res = await app.post("/", { booking_id: b.id, ...review, title: "  Great  ", body: "  Loved it  ", photos: ["https://cdn.example.test/a.jpg"] });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ booking_id: b.id, tour_id: tour.id, user_id: me.id, rating: 5, title: "Great", body: "Loved it", photos: ["https://cdn.example.test/a.jpg"] });

    const again = await app.post("/", { booking_id: b.id, ...review });
    expect(again.status).toBe(409);
  });

  it("refuses bookings that are not theirs, not completed, or unknown", async () => {
    const theirs = await makeBooking(other.id);
    const pending = await makeBooking(me.id, "confirmed");
    expect((await app.post("/", { booking_id: theirs.id, ...review })).status).toBe(403);
    expect((await app.post("/", { booking_id: pending.id, ...review })).status).toBe(400);
    expect((await app.post("/", { booking_id: 999999, ...review })).status).toBe(403);
    expect(await db.select().from(reviews)).toHaveLength(0);
  });

  it("validates the review itself", async () => {
    const b = await makeBooking(me.id);
    expect((await app.post("/", { booking_id: b.id, rating: 6, body: "x" })).status).toBe(400);
    expect((await app.post("/", { booking_id: b.id, rating: 0, body: "x" })).status).toBe(400);
    expect((await app.post("/", { booking_id: b.id, rating: 5 })).status).toBe(400);
    expect((await app.post("/", { rating: 5, body: "x" })).status).toBe(400);
    const link = "https://cdn.example.test/a.jpg";
    expect((await app.post("/", { booking_id: b.id, rating: 5, body: "x", photos: [link, link, link, link] })).status).toBe(400);
    expect((await app.post("/", { booking_id: b.id, rating: 5, body: "x", photos: ["javascript:alert(1)"] })).status).toBe(400);
  });

  it("needs a signed-in guest who exists in our users table", async () => {
    const b = await makeBooking(me.id);
    auth.supabaseId = "";
    expect((await app.post("/", { booking_id: b.id, ...review })).status).toBe(401);
    auth.supabaseId = "33333333-3333-4333-8333-333333333333";
    expect((await app.post("/", { booking_id: b.id, ...review })).status).toBe(401);
  });
});

describe("GET /user/eligible", () => {
  it("lists my completed bookings that have no review yet", async () => {
    const done = await makeBooking(me.id);
    const reviewed = await makeBooking(me.id);
    await makeBooking(me.id, "confirmed");
    await makeBooking(other.id);
    await db.insert(reviews).values({ bookingId: reviewed.id, tourId: tour.id, userId: me.id, rating: 4, body: "ok" });

    const res = await app.get("/user/eligible");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ booking_id: done.id, tour_id: tour.id, tour_name: "Old City Walk" });
    expect(res.body[0].tour_date).toMatch(/^2026-10-05/);
  });
});

describe("DELETE /:id", () => {
  it("deletes only my own review", async () => {
    const mine = await makeBooking(me.id);
    const theirs = await makeBooking(other.id);
    const [r1] = await db.insert(reviews).values({ bookingId: mine.id, tourId: tour.id, userId: me.id, rating: 4, body: "ok" }).returning();
    const [r2] = await db.insert(reviews).values({ bookingId: theirs.id, tourId: tour.id, userId: other.id, rating: 4, body: "ok" }).returning();

    expect((await app.delete(`/${r2.id}`)).status).toBe(404);
    expect(await db.select().from(reviews).where(eq(reviews.id, r2.id))).toHaveLength(1);
    expect((await app.delete(`/${r1.id}`)).status).toBe(200);
    expect(await db.select().from(reviews).where(eq(reviews.id, r1.id))).toHaveLength(0);
  });
});
