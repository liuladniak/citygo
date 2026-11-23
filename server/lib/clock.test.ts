import { describe, expect, it } from "vitest";
import { nowInZone, zonedToInstant } from "./clock.js";

describe("nowInZone", () => {
  it("reads Istanbul wall-clock time from a UTC instant", () => {
    expect(nowInZone("Europe/Istanbul", new Date("2026-11-22T10:15:30Z"))).toEqual({ date: "2026-11-22", time: "13:15:30" });
  });

  it("moves to the next day when Istanbul is already past midnight", () => {
    expect(nowInZone("Europe/Istanbul", new Date("2026-11-22T21:30:00Z"))).toEqual({ date: "2026-11-23", time: "00:30:00" });
  });

  it("works for other zones, and midnight is 00 not 24", () => {
    expect(nowInZone("UTC", new Date("2026-11-22T00:00:00Z"))).toEqual({ date: "2026-11-22", time: "00:00:00" });
    expect(nowInZone("America/New_York", new Date("2026-11-22T05:00:00Z")).time).toBe("00:00:00");
  });
});

describe("zonedToInstant", () => {
  it("turns Istanbul wall time into the real instant", () => {
    expect(zonedToInstant("2026-11-22", "09:00:00", "Europe/Istanbul").toISOString()).toBe("2026-11-22T06:00:00.000Z");
    expect(zonedToInstant("2026-11-22", "00:00", "Europe/Istanbul").toISOString()).toBe("2026-11-21T21:00:00.000Z");
  });

  it("handles daylight saving", () => {
    expect(zonedToInstant("2026-01-15", "12:00:00", "America/New_York").toISOString()).toBe("2026-01-15T17:00:00.000Z");
    expect(zonedToInstant("2026-07-15", "12:00:00", "America/New_York").toISOString()).toBe("2026-07-15T16:00:00.000Z");
  });

  it("is the inverse of nowInZone", () => {
    const at = new Date("2026-11-22T10:15:30Z");
    const { date, time } = nowInZone("Europe/Istanbul", at);
    expect(zonedToInstant(date, time, "Europe/Istanbul").toISOString()).toBe(at.toISOString());
  });
});
