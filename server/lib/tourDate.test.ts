import { describe, it, expect } from "vitest";
import { normalizeTourDate, isPastDay, todayString } from "./tourDate.js";

describe("normalizeTourDate", () => {
  it("keeps a plain date and trims an ISO timestamp to its day", () => {
    expect(normalizeTourDate("2026-12-01")).toBe("2026-12-01");
    expect(normalizeTourDate("2026-12-01T22:30:00.000Z")).toBe("2026-12-01");
  });

  it("rejects bad input and impossible dates", () => {
    expect(normalizeTourDate("")).toBeNull();
    expect(normalizeTourDate("tomorrow")).toBeNull();
    expect(normalizeTourDate("2026-02-30")).toBeNull();
    expect(normalizeTourDate("2026-13-01")).toBeNull();
    expect(normalizeTourDate(20261201)).toBeNull();
    expect(normalizeTourDate(undefined)).toBeNull();
  });
});

describe("isPastDay", () => {
  it("allows today and later, blocks yesterday", () => {
    expect(isPastDay("2026-11-21", "2026-11-21")).toBe(false);
    expect(isPastDay("2026-11-22", "2026-11-21")).toBe(false);
    expect(isPastDay("2026-11-20", "2026-11-21")).toBe(true);
    expect(isPastDay("2025-12-31", "2026-01-01")).toBe(true);
  });
});

describe("todayString", () => {
  it("uses the UTC day", () => {
    expect(todayString(new Date("2026-11-21T23:30:00Z"))).toBe("2026-11-21");
  });
});
