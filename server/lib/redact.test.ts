import { describe, it, expect } from "vitest";
import { redact, MAX_TEXT } from "./redact.js";

describe("redact", () => {
  it("removes emails", () => {
    expect(redact("write to jane.doe@example.com please")).toBe(
      "write to [email] please",
    );
  });

  it("removes phone and long numbers, keeps small numbers", () => {
    expect(redact("call +1 (234) 567-8901 for 2 adults")).toBe(
      "call [number] for 2 adults",
    );
    expect(redact("card 4242 4242 4242 4242")).toBe("card [number]");
  });

  it("strips control characters, collapses whitespace and caps length", () => {
    expect(redact("hi\u0000\n  there\t")).toBe("hi there");
    expect(redact("a".repeat(MAX_TEXT + 50))).toHaveLength(MAX_TEXT);
  });

  it("returns an empty string for non-strings", () => {
    expect(redact(undefined)).toBe("");
    expect(redact({ a: 1 })).toBe("");
  });
});
