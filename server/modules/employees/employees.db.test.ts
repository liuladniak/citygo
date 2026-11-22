import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { startApp } from "../../test/app.js";
import { db, resetDb } from "../../test/db.js";
import { assignGuide, makeEmployee, makeTour } from "../../test/fixtures.js";
import { bookings, employees } from "../../db/drizzle/schema.js";
import { knex } from "../../db/knex.js";
import employeeRoutes from "../../routes/employeeRoutes.js";

let manager: Awaited<ReturnType<typeof startApp>>;
let guide: Awaited<ReturnType<typeof startApp>>;
beforeAll(async () => {
  manager = await startApp(employeeRoutes, { role: "manager", email: "boss@example.test" });
  guide = await startApp(employeeRoutes, { role: "guide", email: "guide@example.test" });
});
afterAll(async () => {
  await Promise.all([manager.close(), guide.close()]);
  await knex.destroy();
});
beforeEach(resetDb);

let ref = 0;
async function bookingOn(date: string, status = "confirmed") {
  ref += 1;
  const tour = await makeTour();
  const [row] = await db
    .insert(bookings)
    .values({
      tourId: tour.id, tourDate: date, isCustomTour: true, startTime: "09:00:00", endTime: "13:00:00",
      primaryContactName: "Guest", status, source: "website", bookingReference: `BK-E-${ref}`,
    })
    .returning();
  return row;
}

describe("GET /", () => {
  it("lists employees in a data envelope with snake_case fields", async () => {
    const e = await makeEmployee({ firstName: "Mina", lastName: "Kaya", phone: "+90 555", languages: ["English", "Turkish"] });
    const res = await manager.get("/");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({
      id: e.id, first_name: "Mina", last_name: "Kaya", position: "Lead Guide", status: "active",
      phone: "+90 555", languages: ["English", "Turkish"], notif_new_booking: true,
    });
    expect(res.body.data[0].join_date).toMatch(/^\d{4}-\d{2}-\d{2}T.*Z$/);
  });
});

describe("GET /available", () => {
  it("lists field staff with their bookings that day, and marks three bookings as full", async () => {
    const busy = await makeEmployee({ firstName: "Busy", position: "Lead Guide" });
    const free = await makeEmployee({ firstName: "Free", position: "Driver" });
    await makeEmployee({ firstName: "Office", position: "Finance" });
    for (let i = 0; i < 3; i++) await assignGuide((await bookingOn("2026-12-01")).id, busy.id);
    await assignGuide((await bookingOn("2026-12-02")).id, free.id);
    await assignGuide((await bookingOn("2026-12-01")).id, free.id, { status: "removed" });

    const res = await manager.get("/available?date=2026-12-01");
    expect(res.status).toBe(200);
    const byName = Object.fromEntries(res.body.data.map((e: any) => [e.first_name, e]));
    expect(Object.keys(byName).sort()).toEqual(["Busy", "Free"]);
    expect(byName.Busy).toMatchObject({ booking_count: 3, is_available: false, full_name: `Busy ${busy.lastName}` });
    expect(byName.Free).toMatchObject({ booking_count: 0, is_available: true });
    expect(Object.keys(byName.Busy).sort()).toEqual(["booking_count", "first_name", "full_name", "id", "is_available", "last_name", "position", "profile_image", "status"]);
  });

  it("needs a real date", async () => {
    expect((await manager.get("/available")).status).toBe(400);
    expect((await manager.get("/available?date=nonsense")).status).toBe(400);
  });
});

describe("GET /by-email", () => {
  it("finds an employee by personal or work email", async () => {
    const e = await makeEmployee({ email: "personal@example.test", workEmail: "work@example.test" });
    expect((await guide.get("/by-email?email=personal@example.test")).body.id).toBe(e.id);
    expect((await guide.get("/by-email?email=work@example.test")).body.id).toBe(e.id);
    expect((await guide.get("/by-email?email=nobody@example.test")).status).toBe(404);
    expect((await guide.get("/by-email")).status).toBe(400);
  });
});

describe("GET /:id", () => {
  it("returns the employee with upcoming and past assignments and tour counts", async () => {
    const e = await makeEmployee();
    const future = await bookingOn("2099-01-10");
    const past = await bookingOn("2020-01-10", "completed");
    const cancelled = await bookingOn("2099-02-10", "cancelled");
    for (const b of [future, past, cancelled]) await assignGuide(b.id, e.id);

    const res = await manager.get(`/${e.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(e.id);
    expect(res.body.upcoming_assignments.map((a: any) => a.booking_id)).toEqual([future.id]);
    expect(res.body.upcoming_assignments[0]).toMatchObject({
      booking_reference: future.bookingReference, status: "confirmed", tour_name: "Old City Walk", role: "lead_guide",
      start_time: "09:00:00", end_time: "13:00:00", primary_contact_name: "Guest",
    });
    expect(res.body.past_assignments.map((a: any) => a.booking_id)).toEqual([past.id]);
    expect(res.body.stats).toEqual({ total_tours: 2, tours_this_month: 0 });
  });

  it("answers 404 for an unknown employee", async () => {
    expect((await manager.get("/999999")).status).toBe(404);
  });
});

describe("writing", () => {
  it("lets managers create an employee, active by default, and requires the basics", async () => {
    const res = await manager.post("/", { first_name: "New", last_name: "Hire", position: "Driver", languages: ["Turkish"] });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ first_name: "New", status: "active", languages: ["Turkish"] });
    expect((await manager.post("/", { first_name: "x", last_name: "y" })).status).toBe(400);
  });

  it("updates only what is sent and returns the row", async () => {
    const e = await makeEmployee({ phone: "111" });
    const res = await manager.patch(`/${e.id}`, { phone: "222", shift_start: "09:00", unknown_field: "x" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ phone: "222", shift_start: "09:00:00", first_name: e.firstName });
    expect((await manager.patch(`/${e.id}`, {})).status).toBe(400);
    expect((await manager.patch("/999999", { phone: "1" })).status).toBe(404);
  });

  it("deactivates with a dated note", async () => {
    const e = await makeEmployee({ notes: "Good with groups" });
    const res = await manager.patch(`/${e.id}/deactivate`, { reason: "Left the company" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("inactive");
    expect(res.body.notes).toMatch(/^Good with groups\nDeactivated: Left the company \(/);
    const [row] = await db.select().from(employees).where(eq(employees.id, e.id));
    expect(row.status).toBe("inactive");
  });

  it("keeps changes to managers and admins", async () => {
    const e = await makeEmployee();
    expect((await guide.post("/", { first_name: "a", last_name: "b", position: "Driver" })).status).toBe(403);
    expect((await guide.patch(`/${e.id}`, { phone: "1" })).status).toBe(403);
    expect((await guide.patch(`/${e.id}/deactivate`, { reason: "x" })).status).toBe(403);
  });
});
