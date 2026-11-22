import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { startApp } from "../../test/app.js";
import { db, resetDb } from "../../test/db.js";
import { companySettings } from "../../db/drizzle/schema.js";
import { knex } from "../../db/knex.js";
import company from "../../routes/companyRoutes.js";

let app: Awaited<ReturnType<typeof startApp>>;
beforeAll(async () => (app = await startApp(company)));
afterAll(async () => {
  await app.close();
  await knex.destroy();
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
