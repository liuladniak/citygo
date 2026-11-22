import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { startApp } from "../../test/app.js";
import { db, resetDb } from "../../test/db.js";
import { assignGuide, makeEmployee, makeTour } from "../../test/fixtures.js";
import { bookings, employees } from "../../db/drizzle/schema.js";
import employeeRoutes from "./employees.routes.js";

let manager: Awaited<ReturnType<typeof startApp>>;
let guide: Awaited<ReturnType<typeof startApp>>;
beforeAll(async () => {
  manager = await startApp(employeeRoutes, { role: "manager", email: "boss@example.test" });
  guide = await startApp(employeeRoutes, { role: "guide", email: "guide@example.test" });
});
afterAll(async () => {
  await Promise.all([manager.close(), guide.close()]);
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
    expect((await manager.get("/by-email?email=personal@example.test")).body.id).toBe(e.id);
    expect((await manager.get("/by-email?email=WORK@example.test")).body.id).toBe(e.id);
    expect((await manager.get("/by-email?email=nobody@example.test")).status).toBe(404);
    expect((await manager.get("/by-email")).status).toBe(400);
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

describe("who sees what", () => {
  it("gives colleagues a short directory and managers the whole record", async () => {
    await makeEmployee({ phone: "555", emergencyContactName: "Secret Person" });
    const short = (await guide.get("/")).body.data[0];
    expect(Object.keys(short).sort()).toEqual(["first_name", "id", "last_name", "position", "profile_image", "status"]);
    expect((await manager.get("/")).body.data[0]).toHaveProperty("emergency_contact_name", "Secret Person");
  });

  it("shows a person their own record, but only the short card for someone else", async () => {
    const me = await makeEmployee({ email: "guide@example.test", phone: "555" });
    const other = await makeEmployee({ phone: "777" });
    expect((await guide.get(`/${me.id}`)).body).toMatchObject({ phone: "555", stats: { total_tours: 0, tours_this_month: 0 } });
    const card = (await guide.get(`/${other.id}`)).body;
    expect(card).not.toHaveProperty("phone");
    expect(card.first_name).toBe(other.firstName);
    expect((await guide.get("/by-email?email=guide@example.test")).body.id).toBe(me.id);
    expect((await guide.get(`/by-email?email=${other.email}`)).status).toBe(403);
  });

  it("lets a person edit their own basics and notification choices, but not their position or anyone else", async () => {
    const me = await makeEmployee({ email: "guide@example.test", position: "Driver" });
    const other = await makeEmployee({ phone: "777" });
    const res = await guide.patch(`/${me.id}`, { phone: "999", notif_daily_schedule: true, position: "Admin", status: "inactive" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ phone: "999", notif_daily_schedule: true, position: "Driver", status: "active" });
    expect((await guide.patch(`/${other.id}`, { phone: "1" })).status).toBe(403);
    expect((await guide.patch(`/${me.id}`, { position: "Admin" })).status).toBe(403);
  });

  it("rejects bad input", async () => {
    const e = await makeEmployee();
    expect((await manager.patch(`/${e.id}`, { email: "nope" })).status).toBe(400);
    expect((await manager.patch(`/${e.id}`, { phone: "1".repeat(21) })).status).toBe(400);
    expect((await manager.patch(`/${e.id}`, { shift_start: "25:00" })).status).toBe(400);
    expect((await manager.patch(`/${e.id}`, { contract_start: "2026-02-30" })).status).toBe(400);
    expect((await manager.patch(`/${e.id}/deactivate`, {})).status).toBe(400);
  });

  it("stores a cleared field as empty rather than blank text", async () => {
    const e = await makeEmployee({ workEmail: "w@example.test" });
    const res = await manager.patch(`/${e.id}`, { work_email: "", shift_start: "" });
    expect(res.body).toMatchObject({ work_email: null, shift_start: null });
  });
});

describe("GET /availability", () => {
  it("shows today's status for active staff, using the company's timezone for today", async () => {
    const { nowInZone } = await import("../../lib/clock.js");
    const g = await makeEmployee({ firstName: "Aaron", position: "Lead Guide" });
    await makeEmployee({ firstName: "Gone", status: "inactive" });
    const today = nowInZone("Europe/Istanbul").date;
    const b = await bookingOn(today);
    await db.update(bookings).set({ startTime: "00:00:00", endTime: "23:59:59" }).where(eq(bookings.id, b.id));
    await assignGuide(b.id, g.id);
    const removed = await bookingOn(today);
    await assignGuide(removed.id, g.id, { status: "removed" });

    const res = await manager.get("/availability");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ id: g.id, availability: "on_tour", on_tour_now: true, current_booking_id: b.id, tours_today: 1 });
  });
});
