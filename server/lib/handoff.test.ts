import { describe, it, expect } from "vitest";
import { newToken, hashToken, tokenMatches, cleanName, cleanEmail, createRateLimiter } from "./handoff.js";

describe("visitor tokens", () => {
  it("matches only the token it was made from", () => {
    const t = newToken();
    const h = hashToken(t);
    expect(t).toHaveLength(64);
    expect(tokenMatches(t, h)).toBe(true);
    expect(tokenMatches(newToken(), h)).toBe(false);
    expect(tokenMatches(undefined, h)).toBe(false);
    expect(tokenMatches("", h)).toBe(false);
  });
});

describe("input cleaning", () => {
  it("cleans names and rejects bad emails", () => {
    expect(cleanName("  Ana\u0000  Maria ")).toBe("Ana Maria");
    expect(cleanName("x".repeat(200))).toHaveLength(80);
    expect(cleanName("   ")).toBeNull();
    expect(cleanEmail("a@b.com")).toBe("a@b.com");
    expect(cleanEmail("not an email")).toBeNull();
    expect(cleanEmail(42)).toBeNull();
  });
});

describe("createRateLimiter", () => {
  it("allows a burst, blocks the next, and recovers after the window", () => {
    let t = 0;
    const allow = createRateLimiter(3, 1000, () => t);
    expect([allow(), allow(), allow(), allow()]).toEqual([true, true, true, false]);
    t = 1001;
    expect(allow()).toBe(true);
  });
});
