import { describe, expect, it } from "vitest";
import { autoTaskKind, unresolvedReason, type BookingFacts } from "./autoTaskConditions.js";

const booking = (over: Partial<BookingFacts> = {}): BookingFacts => ({
  status: "confirmed", booking_reference: "BK-1", total_price: "100.00", meeting_point: "Hagia Sophia", amount_paid: "100.00", guide_count: 1, ...over,
});

describe("autoTaskKind", () => {
  it("reads the kind from the title", () => {
    expect(autoTaskKind("[auto_assign_guide] Assign a guide")).toBe("auto_assign_guide");
    expect(autoTaskKind("Call the guest")).toBeNull();
    expect(autoTaskKind()).toBeNull();
  });
});

describe("unresolvedReason", () => {
  it("asks for a guide only while none is assigned", () => {
    expect(unresolvedReason("auto_assign_guide", booking({ guide_count: 0 }))).toBe("BK-1 still has no guide");
    expect(unresolvedReason("auto_assign_guide", booking())).toBeNull();
  });

  it("reports the amount still due, in cents-safe arithmetic", () => {
    expect(unresolvedReason("auto_collect_payment", booking({ amount_paid: "40.00" }))).toBe("BK-1 still has €60.00 due");
    expect(unresolvedReason("auto_collect_payment", booking({ total_price: "0.30", amount_paid: "0.10" }))).toBe("BK-1 still has €0.20 due");
    expect(unresolvedReason("auto_collect_payment", booking({ amount_paid: "100.00" }))).toBeNull();
    expect(unresolvedReason("auto_collect_payment", booking({ amount_paid: "120.00" }))).toBeNull();
  });

  it("checks the meeting point and draft status", () => {
    expect(unresolvedReason("auto_set_meeting_point", booking({ meeting_point: null }))).toBe("BK-1 still has no meeting point");
    expect(unresolvedReason("auto_review_custom", booking({ status: "draft" }))).toBe("BK-1 is still a draft");
    expect(unresolvedReason("auto_review_custom", booking())).toBeNull();
  });

  it("needs nothing from a cancelled or missing booking, or an unknown kind", () => {
    expect(unresolvedReason("auto_assign_guide", booking({ status: "cancelled", guide_count: 0 }))).toBeNull();
    expect(unresolvedReason("auto_assign_guide", undefined)).toBeNull();
    expect(unresolvedReason("auto_something_new", booking({ guide_count: 0 }))).toBeNull();
  });
});
