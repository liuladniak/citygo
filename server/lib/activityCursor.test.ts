import { describe, it, expect } from "vitest";
import { buildNextCursor, parseCursor } from "./activityCursor.js";

const decode = (c: string | null) => parseCursor(c);

describe("buildNextCursor", () => {
  it("returns null on a short page", () => {
    expect(buildNextCursor([{ id: 5, source: "booking" }], 5, null)).toBeNull();
  });

  it("remembers the last id of each log", () => {
    const page = [
      { id: 9, source: "booking" as const },
      { id: 7, source: "tour" as const },
      { id: 8, source: "booking" as const },
    ];
    expect(decode(buildNextCursor(page, 3, null))).toEqual({ booking_id: 8, tour_id: 7 });
  });

  it("keeps the previous position for a log with no row on the page", () => {
    const page = [
      { id: 9, source: "booking" as const },
      { id: 8, source: "booking" as const },
    ];
    const previous = { booking_id: 12, tour_id: 40 };
    expect(decode(buildNextCursor(page, 2, previous))).toEqual({ booking_id: 8, tour_id: 40 });
  });
});

describe("parseCursor", () => {
  it("ignores missing and broken cursors instead of throwing", () => {
    expect(parseCursor(undefined)).toBeNull();
    expect(parseCursor("")).toBeNull();
    expect(parseCursor("not-base64-json")).toBeNull();
    expect(parseCursor(Buffer.from("[1]").toString("base64"))).toEqual({ booking_id: null, tour_id: null });
  });

  it("drops non-integer ids", () => {
    const raw = Buffer.from(JSON.stringify({ booking_id: "7; drop", tour_id: 3 })).toString("base64");
    expect(parseCursor(raw)).toEqual({ booking_id: null, tour_id: 3 });
  });
});
