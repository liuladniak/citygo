import { describe, expect, it } from "vitest";
import { addDaysToDay, sameDayLastMonth, toIsoTimestamp } from "./dates.js";

describe("toIsoTimestamp", () => {
  it("reads database timestamps as UTC", () => {
    expect(toIsoTimestamp("2026-11-20 10:08:00")).toBe("2026-11-20T10:08:00.000Z");
    expect(toIsoTimestamp("2026-11-22 20:03:22.342119")).toBe("2026-11-22T20:03:22.342Z");
  });

  it("passes null through", () => {
    expect(toIsoTimestamp(null)).toBeNull();
  });
});

describe("addDaysToDay", () => {
  it("adds across month, year and leap days", () => {
    expect(addDaysToDay("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDaysToDay("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysToDay("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDaysToDay("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("sameDayLastMonth", () => {
  it("goes back one month, across the year too", () => {
    expect(sameDayLastMonth("2026-11-27")).toBe("2026-10-27");
    expect(sameDayLastMonth("2026-01-15")).toBe("2025-12-15");
  });
  it("holds to the end of a shorter month", () => {
    expect(sameDayLastMonth("2026-03-31")).toBe("2026-02-28");
    expect(sameDayLastMonth("2028-03-31")).toBe("2028-02-29");
  });
});
