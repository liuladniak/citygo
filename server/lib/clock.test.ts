import { describe, expect, it } from "vitest";
import { nowInZone } from "./clock.js";

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
