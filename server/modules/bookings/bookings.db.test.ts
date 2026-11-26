import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import { startApp } from "../../test/app.js";
import { db, resetDb } from "../../test/db.js";
import { makeTour, makeUser } from "../../test/fixtures.js";
import { bookings } from "../../db/drizzle/schema.js";
import { requireStaff } from "../../middleware/auth.js";
import ownBookingRoutes from "./bookings.routes.js";
import legacyBookingRoutes from "../../routes/bookingRoutes.js";

// The legacy router pulls in the queue and Redis; none of that runs in these tests.
vi.mock("../../queues/notificationQueue.js", () => ({ notificationQueue: { add: vi.fn() } }));
vi.mock("../../lib/redis.js", () => ({ getRedis: vi.fn() }));

const ME = "11111111-1111-4111-8111-111111111111";

// Same order as index.js: guest's own bookings first, then the staff gate, then the staff routes.
const mounted = () => {
  const r = express.Router();
  r.use(ownBookingRoutes, requireStaff, legacyBookingRoutes);
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
