import { describe, expect, it } from "vitest";
import { planSlotSync } from "./timeSlots.js";

const stored = [
  { id: 1, start_time: "09:00:00", end_time: "12:00:00" },
  { id: 2, start_time: "13:00:00", end_time: "16:00:00" },
  { id: 3, start_time: "17:00:00", end_time: "19:00:00" },
];

describe("planSlotSync", () => {
  it("adds new slots and removes the ones nobody booked", () => {
    const plan = planSlotSync(stored, [{ start_time: "09:00", end_time: "12:00" }, { start_time: "20:00", end_time: "22:00" }], new Set());
    expect(plan.toAdd).toEqual([{ start_time: "20:00", end_time: "22:00" }]);
    expect(plan.toDelete).toEqual([2, 3]);
  });

  it("never removes a slot a booking uses", () => {
    const plan = planSlotSync(stored, [], new Set([2]));
    expect(plan.toDelete).toEqual([1, 3]);
    expect(plan.keptBecauseBooked).toEqual([2]);
  });

  it("matches on hours and minutes, ignoring seconds", () => {
    const plan = planSlotSync(stored, [{ start_time: "09:00:30", end_time: "12:00:00" }], new Set());
    expect(plan.toAdd).toEqual([]);
  });

  it("does not add the same new slot twice", () => {
    const slot = { start_time: "20:00", end_time: "22:00" };
    expect(planSlotSync([], [slot, { ...slot }], new Set()).toAdd).toEqual([slot]);
  });
});
