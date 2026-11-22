import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startApp } from "../../test/app.js";
import { db, resetDb } from "../../test/db.js";
import { makeBooking, makeTour } from "../../test/fixtures.js";
import { bookingActivityLog, tourActivityLog } from "../../db/drizzle/schema.js";
import { knex } from "../../db/knex.js";
import activity from "../../routes/activityRoutes.js";

let app: Awaited<ReturnType<typeof startApp>>;
beforeAll(async () => (app = await startApp(activity)));
afterAll(async () => {
  await app.close();
  await knex.destroy();
});
beforeEach(resetDb);

const at = (minute: number) => `2026-11-20 10:${String(minute).padStart(2, "0")}:00`;

async function seed() {
  const tour = await makeTour({ tourName: "Old City Walk" });
  const booking = await makeBooking({ tourId: tour.id, bookingReference: "BK-1" });
  // Newest first overall: tour 8, booking 7, tour 6, booking 5, tour 4, booking 3 ...
  for (let m = 1; m <= 8; m++) {
    if (m % 2 === 0) {
      await db.insert(tourActivityLog).values({ tourId: tour.id, action: "tour_updated", message: `tour log ${m}`, createdAt: at(m) });
    } else {
      await db.insert(bookingActivityLog).values({
        bookingId: booking.id, action: "booking_created", message: `booking log ${m}`, actorType: "system", createdAt: at(m),
      });
    }
  }
  return { tour, booking };
}

describe("GET /", () => {
  it("returns booking and tour activity merged, newest first, with where it came from", async () => {
    const { tour, booking } = await seed();
    const res = await app.get("/?limit=4");
    expect(res.status).toBe(200);
    expect(res.body.data.map((r: any) => r.message)).toEqual(["tour log 8", "booking log 7", "tour log 6", "booking log 5"]);
    expect(res.body.data[0]).toEqual({
      id: expect.any(Number),
      action: "tour_updated",
      message: "tour log 8",
      created_at: "2026-11-20T10:08:00.000Z",
      source: "tour",
      ref_id: tour.id,
      ref_label: "Old City Walk",
    });
    expect(res.body.data[1]).toMatchObject({ source: "booking", ref_id: booking.id, ref_label: "BK-1" });
    expect(res.body.nextCursor).toEqual(expect.any(String));
  });

  it("pages through everything once, with no repeats and no gaps", async () => {
    await seed();
    const seen: string[] = [];
    let cursor: string | null = null;
    for (let page = 0; page < 10; page++) {
      const res: any = await app.get(`/?limit=3${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`);
      seen.push(...res.body.data.map((r: any) => r.message));
      cursor = res.body.nextCursor;
      if (!cursor || res.body.data.length === 0) break;
    }
    expect(seen).toEqual([8, 7, 6, 5, 4, 3, 2, 1].map((m) => `${m % 2 ? "booking" : "tour"} log ${m}`));
  });

  it("uses 5 rows by default, caps the page at 50 and ignores nonsense", async () => {
    await seed();
    expect((await app.get("/")).body.data).toHaveLength(5);
    expect((await app.get("/?limit=abc")).body.data).toHaveLength(5);
    expect((await app.get("/?limit=500")).body.data).toHaveLength(8);
    expect((await app.get("/?cursor=not-a-cursor")).status).toBe(200);
  });

  it("is empty, not an error, when nothing happened yet", async () => {
    const res = await app.get("/");
    expect(res.body.data).toEqual([]);
  });
});
