import { describe, expect, it } from "vitest";
import { toIsoTimestamp } from "./dates.js";

describe("toIsoTimestamp", () => {
  it("reads database timestamps as UTC", () => {
    expect(toIsoTimestamp("2026-11-20 10:08:00")).toBe("2026-11-20T10:08:00.000Z");
    expect(toIsoTimestamp("2026-11-22 20:03:22.342119")).toBe("2026-11-22T20:03:22.342Z");
  });

  it("passes null through", () => {
    expect(toIsoTimestamp(null)).toBeNull();
  });
});
