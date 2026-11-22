import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { startApp } from "../../test/app.js";
import { db, resetDb } from "../../test/db.js";
import { makeTimeSlot, makeTour, makeUser } from "../../test/fixtures.js";
import { bookingGuests, bookingPayments, bookings, images } from "../../db/drizzle/schema.js";
import guestRoutes from "./guest.routes.js";

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
beforeAll(async () => (app = await startApp(guestRoutes)));
afterAll(async () => {
  await app.close();
});

let me: Awaited<ReturnType<typeof makeUser>>;
let other: Awaited<ReturnType<typeof makeUser>>;
let tour: Awaited<ReturnType<typeof makeTour>>;

beforeEach(async () => {
  await resetDb();
  auth.supabaseId = ME;
  me = await makeUser({ email: "me@example.test", supabaseId: ME });
  other = await makeUser({ email: "other@example.test", supabaseId: OTHER });
  tour = await makeTour({ slug: "old-city-walk", price: "50.00" });
});

let ref = 0;
async function makeBooking(overrides: Partial<typeof bookings.$inferInsert> = {}) {
  ref += 1;
  const slot = overrides.isCustomTour ? undefined : await makeTimeSlot(tour.id, { startTime: "10:00:00", endTime: "14:00:00" });
  const [row] = await db
    .insert(bookings)
    .values({
      tourId: tour.id, userId: me.id, tourDate: "2026-10-05", primaryContactName: "Guest", status: "confirmed",
      source: "website", bookingReference: `BK-G-${ref}`, timeSlotId: slot?.id, totalPrice: "100.00", ...overrides,
    })
    .returning();
  return row;
}

describe("GET /bookings", () => {
  it("returns my bookings, newest tour date first, with tour details, guest count, amount paid and images", async () => {
    const early = await makeBooking({ tourDate: "2026-09-01" });
    const late = await makeBooking({ tourDate: "2026-12-01" });
    await db.insert(bookingGuests).values({ bookingId: late.id, adults: 2, children: 1, infants: 1 });
    await db.insert(bookingPayments).values([
      { bookingId: late.id, amount: "60.00", status: "paid" },
      { bookingId: late.id, amount: "40.00", status: "pending" },
    ] as any);
    await db.insert(images).values([
      { tourId: tour.id, imagePath: "/a.jpg" },
      { tourId: tour.id, imagePath: "/b.jpg" },
    ] as any);

    const res = await app.get(`/bookings?userId=${me.id}`);
    expect(res.status).toBe(200);
    expect(res.body.map((b: any) => b.id)).toEqual([late.id, early.id]);
    expect(res.body[0]).toMatchObject({
      id: late.id, booking_reference: late.bookingReference, status: "confirmed", total_price: "100.00",
      tour_title: "Old City Walk", tour_price: "50.00", tour_slug: "old-city-walk",
      display_start_time: "10:00:00", display_end_time: "14:00:00",
      total_guests: 4, amount_paid: "60.00", tour_images: ["/a.jpg", "/b.jpg"],
    });
    expect(res.body[0].tour_date).toMatch(/^2026-12-01/);
    expect(res.body[1]).toMatchObject({ total_guests: null, amount_paid: "0" });
  });

  it("uses the booking's own times for custom tours", async () => {
    await makeBooking({ isCustomTour: true, startTime: "08:30:00", endTime: "11:00:00" });
    const res = await app.get(`/bookings?userId=${me.id}`);
    expect(res.body[0]).toMatchObject({ display_start_time: "08:30:00", display_end_time: "11:00:00" });
  });

  it("also finds guest-checkout bookings made with my email, but never someone else's", async () => {
    const byEmail = await makeBooking({ userId: null, primaryContactEmail: "me@example.test" });
    await makeBooking({ userId: other.id });
    await makeBooking({ userId: null, primaryContactEmail: "stranger@example.test" });
    const res = await app.get(`/bookings?userId=${me.id}`);
    expect(res.body.map((b: any) => b.id)).toEqual([byEmail.id]);
  });

  it("refuses to show another guest's bookings", async () => {
    expect((await app.get(`/bookings?userId=${other.id}`)).status).toBe(403);
  });

  it("needs sign-in and a known user", async () => {
    auth.supabaseId = "";
    expect((await app.get(`/bookings?userId=${me.id}`)).status).toBe(401);
    auth.supabaseId = "33333333-3333-4333-8333-333333333333";
    expect((await app.get(`/bookings?userId=${me.id}`)).status).toBe(404);
  });

  it("does not hand staff-only fields to the guest", async () => {
    await makeBooking({ notes: "VIP, call the hotel", cancellationNotes: "internal" });
    const [b] = (await app.get(`/bookings?userId=${me.id}`)).body;
    expect(b).not.toHaveProperty("notes");
    expect(b).not.toHaveProperty("cancellation_notes");
  });
});
