import { describe, expect, it } from "vitest";
import { describeAvailability, type StaffRow, type TodayAssignment } from "./availability.js";

const at = new Date("2026-11-22T10:00:00Z");
const guide: StaffRow = { id: 1, position: "Lead Guide", shift_start: null, shift_end: null, availability_override: null, override_until: null };
const tour = (over: Partial<TodayAssignment> = {}): TodayAssignment => ({ guide_id: 1, booking_id: 7, start_time: "09:00:00", end_time: "13:00:00", ...over });

describe("describeAvailability", () => {
  it("puts a guide on tour while a tour is running, and available around it", () => {
    expect(describeAvailability(guide, [tour()], { time: "10:00:00", at })).toMatchObject({
      availability: "on_tour", on_tour_now: true, current_booking_id: 7, has_tour_today: true, tours_today: 1,
    });
    expect(describeAvailability(guide, [tour()], { time: "14:00:00", at })).toMatchObject({
      availability: "available", on_tour_now: false, current_booking_id: null, has_tour_today: true,
    });
  });

  it("includes the start and end minute", () => {
    expect(describeAvailability(guide, [tour()], { time: "09:00:00", at }).on_tour_now).toBe(true);
    expect(describeAvailability(guide, [tour()], { time: "13:00:00", at }).on_tour_now).toBe(true);
    expect(describeAvailability(guide, [tour()], { time: "13:00:01", at }).on_tour_now).toBe(false);
  });

  it("ignores other people's tours and tours without times", () => {
    const result = describeAvailability(guide, [tour({ guide_id: 2 }), tour({ start_time: null })], { time: "10:00:00", at });
    expect(result).toMatchObject({ on_tour_now: false, tours_today: 1 });
  });

  it("follows the shift for office staff and is available without one", () => {
    const office = { ...guide, position: "Finance", shift_start: "09:00:00", shift_end: "17:00:00" };
    expect(describeAvailability(office, [], { time: "12:00:00", at }).availability).toBe("available");
    expect(describeAvailability(office, [], { time: "18:00:00", at }).availability).toBe("offline");
    expect(describeAvailability({ ...office, shift_start: null }, [], { time: "03:00:00", at }).availability).toBe("available");
  });

  it("is offline for an unknown position", () => {
    expect(describeAvailability({ ...guide, position: "Intern" }, [], { time: "10:00:00", at }).availability).toBe("offline");
  });

  it("lets a manual override win until it expires", () => {
    const manual = { ...guide, availability_override: "away", override_until: "2026-11-22T12:00:00.000Z" };
    expect(describeAvailability(manual, [tour()], { time: "10:00:00", at })).toMatchObject({ availability: "away", on_tour_now: false });
    expect(describeAvailability(manual, [tour()], { time: "10:00:00", at: new Date("2026-11-22T13:00:00Z") }).availability).toBe("on_tour");
  });
});
