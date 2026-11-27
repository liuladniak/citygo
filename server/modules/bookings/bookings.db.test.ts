import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import { startApp } from "../../test/app.js";
import { db, resetDb } from "../../test/db.js";
import { makeTour, makeUser } from "../../test/fixtures.js";
import { bookings } from "../../db/drizzle/schema.js";
import { requireStaff } from "../../middleware/auth.js";
import bookingsModule, { guestBookingRoutes } from "./bookings.routes.js";
import legacyBookingRoutes from "../../routes/bookingRoutes.js";

// The legacy router pulls in the queue and Redis; none of that runs in these tests.
vi.mock("../../queues/notificationQueue.js", () => ({ notificationQueue: { add: vi.fn() } }));
vi.mock("../../lib/redis.js", () => ({ getRedis: vi.fn() }));

const ME = "11111111-1111-4111-8111-111111111111";

// Same order as index.js: guest's own bookings first, then the staff gate, then the staff routes.
const mounted = () => {
  const r = express.Router();
  r.use(guestBookingRoutes, requireStaff, bookingsModule, legacyBookingRoutes);
  return r;
};

let guest: Awaited<ReturnType<typeof startApp>>;
let associate: Awaited<ReturnType<typeof startApp>>;
beforeAll(async () => {
  // A signed-in guest: the user id is a Supabase id and there is no role.
  guest = await startApp(mounted(), { role: null, email: "me@example.test" });
  associate = await startApp(mounted(), { role: "associate", email: "staff@example.test" });
});
afterAll(async () => {
  await Promise.all([guest.close(), associate.close()]);
});
beforeEach(resetDb);

describe("who can use /api/bookings", () => {
  it("keeps staff routes away from a signed-in guest", async () => {
    for (const path of ["/all", "/stats/dashboard", "/guests", "/1", "/1/voucher", "/1/assignments"]) {
      expect((await guest.get(path)).status).toBe(403);
    }
    expect((await guest.post("/admin", { tour_date: "2026-12-01", primary_contact_name: "X", status: "pending" })).status).toBe(403);
    expect((await guest.patch("/1", { status: "cancelled" })).status).toBe(403);
  });

  it("lets staff reach them", async () => {
    expect((await associate.get("/all")).status).toBe(200);
  });

  it("no longer offers the open create and bulk-insert endpoints", async () => {
    expect((await associate.post("/", { user_id: 1, tour_id: 1, tour_date: "2026-12-01", time_slot_id: 1 })).status).toBe(404);
    expect((await associate.post("/bulk", [{ tour_date: "2026-12-01" }])).status).toBe(404);
  });
});

describe("GET /?userId= (the site's account page)", () => {
  it("returns only the signed-in guest's own bookings and refuses someone else's id", async () => {
    const tour = await makeTour({ slug: "own-bookings" });
    const me = await makeUser({ email: "me@example.test", supabaseId: "00000000-0000-0000-0000-000000000001" });
    const other = await makeUser({ email: "other@example.test", supabaseId: ME });
    const base = { tourId: tour.id, isCustomTour: true, startTime: "09:00:00", endTime: "12:00:00", primaryContactName: "G", source: "website", status: "confirmed" };
    await db.insert(bookings).values([
      { ...base, tourDate: "2026-12-01", bookingReference: "BK-OWN-1", userId: me.id },
      { ...base, tourDate: "2026-12-02", bookingReference: "BK-OTHER-1", userId: other.id },
    ]);

    const mine = await guest.get(`/?userId=${me.id}`);
    expect(mine.status).toBe(200);
    expect(mine.body.map((b: any) => b.booking_reference)).toEqual(["BK-OWN-1"]);
    expect(mine.body[0]).not.toHaveProperty("notes");

    expect((await guest.get(`/?userId=${other.id}`)).status).toBe(403);
  });
});

// --- Reads moved into the module ---------------------------------------------------------------
import { assignGuide, makeBooking, makeEmployee, makeTimeSlot } from "../../test/fixtures.js";
import { bookingGuestNames, bookingGuests, bookingPayments } from "../../db/drizzle/schema.js";
import { analytics, dashboardStats } from "./bookings.service.js";

const pay = (bookingId: number, amount: string, status = "paid") =>
  db.insert(bookingPayments).values({ bookingId, amount, status, method: "cash" });

describe("GET /all", () => {
  it("lists newest first with payments, party size, times and guides, and filters", async () => {
    const tour = await makeTour({ slug: "list-tour", tourName: "Old City Walk" });
    const slot = await makeTimeSlot(tour.id, { startTime: "10:00:00", endTime: "13:00:00" });
    const a = await makeBooking({ tourId: tour.id, isCustomTour: false, timeSlotId: slot.id, startTime: null, endTime: null, tourDate: "2099-01-10", totalPrice: "100.00", primaryContactName: "Ada Lovelace", bookingReference: "BK-A", status: "pending" });
    const b = await makeBooking({ tourDate: "2099-02-10", primaryContactName: "Grace Hopper", bookingReference: "BK-B" });
    await db.insert(bookingGuests).values({ bookingId: a.id, adults: 2, children: 1, infants: 0 });
    await pay(a.id, "40.00");
    await pay(a.id, "99.00", "pending"); // not counted until it is paid
    await assignGuide(a.id, (await makeEmployee({ firstName: "Mina", lastName: "Kaya" })).id);

    const res = await associate.get("/all");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ total: 2, page: 1, limit: 20 });
    expect(res.body.data.map((r: any) => r.id)).toEqual([b.id, a.id]);
    expect(res.body.data[1]).toMatchObject({
      tour_name: "Old City Walk", total_guests: 3, amount_paid: "40.00", display_start_time: "10:00:00", display_end_time: "13:00:00",
      staff: [{ guide_name: "Mina Kaya", role: "lead_guide" }],
    });
    expect(res.body.data[0]).toMatchObject({ staff: null, total_guests: null, amount_paid: "0", tour_name: null });

    expect((await associate.get("/all?search=hopper")).body.data.map((r: any) => r.id)).toEqual([b.id]);
    expect((await associate.get("/all?search=old city")).body.data.map((r: any) => r.id)).toEqual([a.id]);
    expect((await associate.get("/all?status=pending")).body.total).toBe(1);
    expect((await associate.get("/all?dateFrom=2099-02-01&dateTo=2099-02-28")).body.data.map((r: any) => r.id)).toEqual([b.id]);
    // Nonsense filters are ignored, as the dashboard has always relied on.
    expect((await associate.get("/all?status=bogus&dateFrom=nope&limit=abc")).body).toMatchObject({ total: 2, limit: 20 });
    expect((await associate.get("/all?limit=1&page=2")).body.data.map((r: any) => r.id)).toEqual([a.id]);
  });
});

describe("GET /:id and /:id/voucher", () => {
  it("returns the booking with guests, payments and staff, or 404", async () => {
    const tour = await makeTour({ slug: "detail-tour" });
    const bk = await makeBooking({ tourId: tour.id, isCustomTour: true, totalPrice: "80.00" });
    await db.insert(bookingGuests).values({ bookingId: bk.id, adults: 2, children: 0, infants: 1 });
    await db.insert(bookingGuestNames).values({ bookingId: bk.id, fullName: "Ada L." });
    await pay(bk.id, "30.00");

    const res = await associate.get(`/${bk.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: bk.id, tour_duration: tour.duration, amount_paid: "30.00", guest_distribution: { adults: 2, children: 0, infants: 1 },
      guest_list: [{ full_name: "Ada L." }], payment_history: [{ amount: "30.00", status: "paid" }],
    });
    expect(res.body.created_at).toMatch(/Z$/);
    expect((await associate.get("/999999")).status).toBe(404);
    expect((await associate.get("/abc")).status).toBe(400);
  });

  it("builds the voucher with highlights and up to three other tours", async () => {
    const own = await makeTour({ slug: "own-tour" });
    for (const n of [1, 2, 3, 4]) await makeTour({ slug: `other-${n}`, tourName: `Other ${n}`, bestSeller: n === 1 });
    const bk = await makeBooking({ tourId: own.id });
    const res = await associate.get(`/${bk.id}/voucher`);
    expect(res.status).toBe(200);
    expect(res.body.ad_tours).toHaveLength(3);
    expect(res.body.ad_tours[0].slug).toBe("other-1"); // best sellers first
    expect(res.body.ad_tours.map((t: any) => t.id)).not.toContain(own.id);
  });
});

describe("dashboard stats use the company's day, not the server's", () => {
  it("counts a tour as today once it is past midnight in Istanbul", async () => {
    const tour = await makeTour({ slug: "stats-tour" });
    const slot = await makeTimeSlot(tour.id, { startTime: "09:00:00", endTime: "13:00:00" });
    const bk = await makeBooking({ tourId: tour.id, isCustomTour: false, timeSlotId: slot.id, startTime: null, endTime: null, tourDate: "2099-03-02", totalPrice: "50.00", status: "pending" });
    await db.insert(bookingGuests).values({ bookingId: bk.id, adults: 2, children: 1, infants: 0 });
    await pay(bk.id, "20.00");

    // 22:30 UTC on 1 March is 01:30 on 2 March in Istanbul.
    const lateNight = await dashboardStats(new Date("2099-03-01T22:30:00Z"));
    expect(lateNight).toMatchObject({ tours_today: 1, guests_today: 3, revenue_today: 20, expected_revenue_today: 50, unpaid_bookings: 1, currently_running: 0 });
    expect((await dashboardStats(new Date("2099-03-01T12:00:00Z"))).tours_today).toBe(0);
    // Mid-tour (10:00 Istanbul): a slot-based booking counts as running.
    expect((await dashboardStats(new Date("2099-03-02T07:00:00Z"))).currently_running).toBe(1);
  });
});

describe("analytics", () => {
  it("counts paid money only for bookings that were not cancelled", async () => {
    const kept = await makeBooking({ tourDate: "2099-04-10", totalPrice: "100.00" });
    const gone = await makeBooking({ tourDate: "2099-04-11", totalPrice: "60.00", status: "cancelled" });
    await pay(kept.id, "100.00");
    await pay(gone.id, "60.00");
    await pay(kept.id, "-10.00"); // a refund is not income

    const res = await analytics({ dateFrom: "2099-04-01", dateTo: "2099-04-30" });
    expect(res.kpis).toMatchObject({ total_revenue: 100, total_bookings: 1, cancellation_rate: 50 });
    expect(res.bookings_by_tour[0]).toMatchObject({ tour_name: "Custom Tour", bookings: "1" });
  });
});

describe("GET /guests", () => {
  it("groups by contact, counts the groups and honours search", async () => {
    await makeBooking({ primaryContactName: "Ada", primaryContactEmail: "ada@example.test", totalPrice: "10.00" });
    await makeBooking({ primaryContactName: "Ada", primaryContactEmail: "ada@example.test", totalPrice: "20.00", status: "cancelled" });
    await makeBooking({ primaryContactName: "Grace", primaryContactEmail: "grace@example.test" });
    const manager = await startApp(mounted(), { role: "manager", email: "m@example.test" });
    const all = await manager.get("/guests");
    expect(all.body.total).toBe(2);
    expect(all.body.data.find((g: any) => g.primary_contact_name === "Ada")).toMatchObject({ total_bookings: "2", cancelled_bookings: "1", total_spend: "10.00" });
    expect((await manager.get("/guests?search=grace")).body).toMatchObject({ total: 1 });
    expect((await associate.get("/guests")).status).toBe(403); // managers only
    await manager.close();
  });
});
