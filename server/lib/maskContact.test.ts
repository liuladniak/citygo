import { describe, expect, it } from "vitest";
import { maskEmail, maskEmergencyContact, maskPhone } from "./maskContact.js";

describe("maskEmail", () => {
  it("keeps the first letter and the domain", () => {
    expect(maskEmail("ayla@example.test")).toBe("a****@example.test");
  });
  it("says so when there is none", () => {
    expect(maskEmail(null)).toBe("No email provided");
    expect(maskEmail("")).toBe("No email provided");
  });
  it("never shows a malformed address in full", () => {
    expect(maskEmail("nodomain")).toBe("n*******");
  });
});

describe("maskPhone", () => {
  it("keeps the first two and last four characters", () => {
    expect(maskPhone("+905551234567")).toBe("+9*******4567");
  });
  it("hides short numbers completely instead of leaking them", () => {
    expect(maskPhone("12345")).toBe("*****");
    expect(maskPhone("123456")).toBe("******");
  });
  it("says so when there is none", () => {
    expect(maskPhone(null)).toBe("No phone number provided");
    expect(maskEmergencyContact("")).toBe("Not provided");
  });
});
