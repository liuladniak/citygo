import { describe, expect, it } from "vitest";
import { planBookingTasks, planDraftTasks, type UpcomingBooking } from "./autoTaskPlan.js";

const TZ = "Europe/Istanbul";
// 2026-11-22 06:00 UTC is 09:00 in Istanbul.
const now = new Date("2026-11-22T06:00:00Z");

const booking = (over: Partial<UpcomingBooking> = {}): UpcomingBooking => ({
  id: 1, booking_reference: "BK-1", tour_name: "Old City Walk", tour_date: "2026-11-25", start_time: "09:00:00",
  total_price: "100.00", amount_paid: "100.00", guide_count: 1, meeting_point: "Hagia Sophia", ...over,
});
const kinds = (b: UpcomingBooking[], existing: string[] = []) =>
  planBookingTasks(b, new Set(existing), now, TZ).map((t) => t.kind);

describe("planBookingTasks", () => {
  it("opens nothing for a booking that is fully sorted", () => {
    expect(kinds([booking({ tour_date: "2026-11-23" })])).toEqual([]);
  });

  it("asks for a guide within 72 hours of the start, and not earlier", () => {
    expect(kinds([booking({ guide_count: 0, tour_date: "2026-11-25" })])).toEqual(["auto_assign_guide"]); // exactly 72 h
    expect(kinds([booking({ guide_count: 0, tour_date: "2026-11-26" })])).toEqual([]);
  });

  it("makes the guide task urgent inside 24 hours", () => {
    const [near] = planBookingTasks([booking({ guide_count: 0, tour_date: "2026-11-23" })], new Set(), now, TZ);
    const [far] = planBookingTasks([booking({ guide_count: 0, tour_date: "2026-11-24" })], new Set(), now, TZ);
    expect(near.priority).toBe("urgent");
    expect(far.priority).toBe("normal");
    expect(near.description).toContain("in 24 hours");
  });

  it("measures from the real start time in Istanbul, not from midnight UTC", () => {
    // Tour at 09:00 Istanbul tomorrow is 24 h away; the old midnight-UTC maths said 18 h.
    const [t] = planBookingTasks([booking({ guide_count: 0, tour_date: "2026-11-23", start_time: "09:00:00" })], new Set(), now, TZ);
    expect(t.description).toContain("in 24 hours");
    expect(kinds([booking({ guide_count: 0, tour_date: "2026-11-25", start_time: "10:00:00" })])).toEqual([]); // 73 h
  });

  it("asks to collect what is still owed within 48 hours, in exact euros", () => {
    const [t] = planBookingTasks([booking({ tour_date: "2026-11-24", total_price: "100.10", amount_paid: "40.05" })], new Set(), now, TZ);
    expect(t).toMatchObject({ kind: "auto_collect_payment", priority: "urgent", title: "[auto_collect_payment] Collect €60.05 from BK-1" });
    expect(kinds([booking({ tour_date: "2026-11-24", amount_paid: "100.00" })])).toEqual([]);
    expect(kinds([booking({ tour_date: "2026-11-24", amount_paid: "150.00" })])).toEqual([]);
    expect(kinds([booking({ tour_date: "2026-11-25", amount_paid: "0" })])).toEqual([]); // 72 h: too early
  });

  it("asks for a meeting point within 24 hours", () => {
    expect(kinds([booking({ tour_date: "2026-11-23", meeting_point: null })])).toEqual(["auto_set_meeting_point"]);
    expect(kinds([booking({ tour_date: "2026-11-23", meeting_point: "" })])).toEqual(["auto_set_meeting_point"]);
    expect(kinds([booking({ tour_date: "2026-11-24", meeting_point: null })])).toEqual([]);
  });

  it("never repeats a task that already exists, but still opens the others", () => {
    const b = booking({ tour_date: "2026-11-23", guide_count: 0, meeting_point: null });
    expect(kinds([b])).toEqual(["auto_assign_guide", "auto_set_meeting_point"]);
    expect(kinds([b], ["1:auto_assign_guide"])).toEqual(["auto_set_meeting_point"]);
    expect(kinds([b], ["2:auto_assign_guide"])).toContain("auto_assign_guide");
  });

  it("skips tours that have already started", () => {
    expect(kinds([booking({ tour_date: "2026-11-22", start_time: "08:00:00", guide_count: 0, meeting_point: null })])).toEqual([]);
    expect(kinds([booking({ tour_date: "2026-11-22", start_time: "10:00:00", guide_count: 0 })])).toEqual(["auto_assign_guide"]);
  });

  it("keeps the tour day as the due date", () => {
    const [t] = planBookingTasks([booking({ tour_date: "2026-11-23", guide_count: 0 })], new Set(), now, TZ);
    expect(t.dueDate).toBe("2026-11-23 00:00:00");
  });

  it("names a custom tour when there is no tour record", () => {
    const [t] = planBookingTasks([booking({ tour_date: "2026-11-23", guide_count: 0, tour_name: null })], new Set(), now, TZ);
    expect(t.description).toContain("(Custom Tour)");
  });
});

describe("planDraftTasks", () => {
  it("opens one review task per stale draft, once", () => {
    const drafts = [{ id: 5, booking_reference: "BK-5" }, { id: 6, booking_reference: "BK-6" }];
    const tasks = planDraftTasks(drafts, new Set(["6:auto_review_custom"]));
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({ bookingId: 5, kind: "auto_review_custom", priority: "normal", dueDate: null });
    expect(tasks[0].title).toBe("[auto_review_custom] Review custom tour draft BK-5");
  });
});
