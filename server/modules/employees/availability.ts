import { FIELD_POSITIONS, OFFICE_POSITIONS } from "./employees.schemas.js";

export type StaffRow = {
  id: number;
  position: string | null;
  shift_start: string | null;
  shift_end: string | null;
  availability_override: string | null;
  override_until: string | null; // ISO
};

export type TodayAssignment = {
  guide_id: number;
  booking_id: number;
  start_time: string | null;
  end_time: string | null;
};

const within = (time: string, start: string, end: string) => time >= start.slice(0, 8) && time <= end.slice(0, 8);

/**
 * Where is this person right now? `time` is the wall-clock time in the company's timezone
 * (HH:MM:SS), `at` the real instant, used only to see whether a manual override is still on.
 */
export function describeAvailability<S extends StaffRow>(
  staff: S,
  assignments: TodayAssignment[],
  { time, at }: { time: string; at: Date },
) {
  if (staff.availability_override && staff.override_until && new Date(staff.override_until) > at) {
    return {
      ...staff,
      availability: staff.availability_override,
      on_tour_now: false,
      has_tour_today: false,
      current_booking_id: null,
    };
  }

  const mine = assignments.filter((a) => a.guide_id === staff.id);
  const current = mine.find((a) => a.start_time && a.end_time && within(time, a.start_time, a.end_time));

  let availability = "offline";
  if ((FIELD_POSITIONS as readonly string[]).includes(staff.position ?? "")) {
    availability = current ? "on_tour" : "available";
  } else if ((OFFICE_POSITIONS as readonly string[]).includes(staff.position ?? "")) {
    availability =
      staff.shift_start && staff.shift_end ? (within(time, staff.shift_start, staff.shift_end) ? "available" : "offline") : "available";
  }

  return {
    ...staff,
    availability,
    on_tour_now: current !== undefined,
    has_tour_today: mine.length > 0,
    current_booking_id: current?.booking_id ?? null,
    tours_today: mine.length,
  };
}
