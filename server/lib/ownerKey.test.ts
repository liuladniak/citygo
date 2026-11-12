import { describe, it, expect } from "vitest";
import { isOwner } from "./ownerKey.js";

const KEY = "a-long-random-owner-key-1234567890";

describe("isOwner", () => {
  it("accepts only the exact key", () => {
    expect(isOwner(KEY, KEY)).toBe(true);
    expect(isOwner(`${KEY}x`, KEY)).toBe(false);
    expect(isOwner("wrong", KEY)).toBe(false);
  });

  it("is off when no key, or a short key, is configured", () => {
    expect(isOwner("anything", undefined)).toBe(false);
    expect(isOwner("", "")).toBe(false);
    expect(isOwner("short", "short")).toBe(false);
  });

  it("rejects missing or non-string values", () => {
    expect(isOwner(undefined, KEY)).toBe(false);
    expect(isOwner(["a"], KEY)).toBe(false);
  });
});
