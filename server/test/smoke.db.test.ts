import { beforeEach, describe, expect, it } from "vitest";
import { db, resetDb } from "./db.js";
import { makeTour } from "./fixtures.js";
import { tours } from "../db/drizzle/schema.js";

describe("test database", () => {
  beforeEach(resetDb);

  it("has the schema and starts empty", async () => {
    expect(await db.select().from(tours)).toEqual([]);
  });

  it("restarts ids between tests", async () => {
    const tour = await makeTour();
    expect(tour.id).toBe(1);
    expect(tour.status).toBe("active");
  });
});
