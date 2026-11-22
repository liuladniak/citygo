import { describe, expect, it } from "vitest";
import { dateString, pageQuery, phone, text } from "./schemas.js";

describe("schemas", () => {
  it("accepts only real calendar days", () => {
    expect(dateString.parse("2026-12-01")).toBe("2026-12-01");
    expect(dateString.safeParse("2026-02-30").success).toBe(false);
    expect(dateString.safeParse("tomorrow").success).toBe(false);
  });

  it("limits text length after cleaning", () => {
    expect(text(5).parse("  abc  ")).toBe("abc");
    expect(text(5).safeParse("abcdefg").success).toBe(false);
  });

  it("checks phone numbers loosely but rejects letters", () => {
    expect(phone.parse(" +90 532 000 00 00 ")).toBe("+90 532 000 00 00");
    expect(phone.safeParse("call me").success).toBe(false);
  });

  it("caps page size and defaults the page", () => {
    expect(pageQuery.parse({})).toEqual({ limit: 20, offset: 0 });
    expect(pageQuery.safeParse({ limit: "500" }).success).toBe(false);
  });
});
