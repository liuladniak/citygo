import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startApp } from "../../test/app.js";
import { db, resetDb } from "../../test/db.js";
import { companySettings } from "../../db/drizzle/schema.js";
import company from "./company.routes.js";

let app: Awaited<ReturnType<typeof startApp>>;
let guide: typeof app;
beforeAll(async () => {
  app = await startApp(company, { role: "manager" });
  guide = await startApp(company, { role: "guide" });
});
afterAll(async () => {
  await Promise.all([app.close(), guide.close()]);
});
beforeEach(async () => {
  await resetDb();
  await db.insert(companySettings).values({ id: 1, name: "CityGo Tours", email: "hello@example.test" });
});

describe("settings", () => {
  it("returns the single settings row", async () => {
    const res = await app.get("/settings");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, name: "CityGo Tours", email: "hello@example.test", currency: "EUR", timezone: "Europe/Istanbul", booking_window_months: 6 });
    expect(res.body.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T.*Z$/);
  });

  it("updates only the fields that are sent and returns the new row", async () => {
    const res = await app.patch("/settings", { city: "Istanbul", vat_number: "TR123" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: "CityGo Tours", city: "Istanbul", vat_number: "TR123" });
    expect((await app.get("/settings")).body.city).toBe("Istanbul");
  });

  it("rejects an empty update", async () => {
    const res = await app.patch("/settings", {});
    expect(res.status).toBe(400);
  });
});

describe("availability", () => {
  it("adds, lists and removes a blocked date", async () => {
    const added = await app.post("/availability/dates", { date: "2026-12-25", reason: "Holiday" });
    expect(added.status).toBe(201);
    expect(added.body).toMatchObject({ reason: "Holiday" });
    // Old API sent midnight UTC as a full timestamp; the plain day is what clients read.
    expect(added.body.unavailable_date).toMatch(/^2026-12-25/);

    const list = await app.get("/availability");
    expect(list.body.specific).toHaveLength(1);
    expect(list.body.recurring).toEqual([]);

    expect((await app.delete(`/availability/dates/${added.body.id}`)).status).toBe(200);
    expect((await app.get("/availability")).body.specific).toEqual([]);
  });

  it("needs a date", async () => {
    expect((await app.post("/availability/dates", {})).status).toBe(400);
  });

  it("blocks a weekday once", async () => {
    expect((await app.post("/availability/recurring", { day_of_week: 0, reason: "Sunday off" })).status).toBe(201);
    expect((await app.post("/availability/recurring", { day_of_week: 0 })).status).toBe(409);
    expect((await app.post("/availability/recurring", {})).status).toBe(400);
    const list = await app.get("/availability");
    expect(list.body.recurring).toMatchObject([{ day_of_week: 0, reason: "Sunday off" }]);
  });
});

describe("permissions", () => {
  it("lets any signed-in role read, but only managers change settings and availability", async () => {
    expect((await guide.get("/settings")).status).toBe(200);
    expect((await guide.get("/availability")).status).toBe(200);
    expect((await guide.patch("/settings", { city: "Ankara" })).status).toBe(403);
    expect((await guide.post("/availability/dates", { date: "2026-12-25" })).status).toBe(403);
    expect((await guide.delete("/availability/recurring/1")).status).toBe(403);
    expect((await app.get("/settings")).body.city).toBeNull();
  });

  it("rejects bad input", async () => {
    expect((await app.patch("/settings", { timezone: "Mars/Base" })).status).toBe(400);
    expect((await app.patch("/settings", { email: "nope" })).status).toBe(400);
    expect((await app.post("/availability/dates", { date: "2026-02-30" })).status).toBe(400);
    expect((await app.post("/availability/recurring", { day_of_week: 9 })).status).toBe(400);
  });
});
