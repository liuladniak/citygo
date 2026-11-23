import { zonedToInstant } from "../lib/clock.js";

// Which tasks the system should open for upcoming bookings. Pure, so every rule can be tested
// without a database or a clock.

export const AUTO_TASK = {
  ASSIGN_GUIDE: "auto_assign_guide",
  COLLECT_PAYMENT: "auto_collect_payment",
  SET_MEETING_POINT: "auto_set_meeting_point",
  REVIEW_CUSTOM: "auto_review_custom",
} as const;

export type AutoTaskKind = (typeof AUTO_TASK)[keyof typeof AUTO_TASK];

export const ASSIGN_GUIDE_WITHIN_HOURS = 72;
export const COLLECT_PAYMENT_WITHIN_HOURS = 48;
export const SET_MEETING_POINT_WITHIN_HOURS = 24;
export const URGENT_WITHIN_HOURS = 24;

export type UpcomingBooking = {
  id: number;
  booking_reference: string | null;
  tour_name: string | null;
  tour_date: string; // YYYY-MM-DD
  start_time: string | null; // HH:MM[:SS]
  total_price: string | null;
  amount_paid: string;
  guide_count: number;
  meeting_point: string | null;
};

export type StaleDraft = { id: number; booking_reference: string | null };

export type PlannedTask = {
  kind: AutoTaskKind;
  bookingId: number;
  title: string;
  description: string;
  priority: "urgent" | "normal";
  /** Tour day at midnight, as stored in tasks.due_date. */
  dueDate: string | null;
};

const cents = (amount: string | number | null) => Math.round(Number(amount ?? 0) * 100);
const euros = (c: number) => `€${(c / 100).toFixed(2)}`;

/** Hours from `now` until the tour starts, read on the company's wall clock. Midnight when no start time is known. */
export const hoursUntilTour = (booking: Pick<UpcomingBooking, "tour_date" | "start_time">, now: Date, timeZone: string) =>
  (zonedToInstant(booking.tour_date, booking.start_time ?? "00:00:00", timeZone).getTime() - now.getTime()) / 3_600_000;

/**
 * Tasks that are due for these bookings. `existing` holds "bookingId:kind" for tasks that are
 * already open or done, so running the job every hour never repeats one. Tours that have
 * already started are skipped: nothing is left to prepare.
 */
export function planBookingTasks(
  bookings: UpcomingBooking[],
  existing: ReadonlySet<string>,
  now: Date,
  timeZone: string,
): PlannedTask[] {
  const planned: PlannedTask[] = [];
  const add = (b: UpcomingBooking, task: Omit<PlannedTask, "bookingId" | "dueDate">) => {
    if (existing.has(`${b.id}:${task.kind}`)) return;
    planned.push({ ...task, bookingId: b.id, dueDate: `${b.tour_date} 00:00:00` });
  };

  for (const b of bookings) {
    const hours = hoursUntilTour(b, now, timeZone);
    if (hours < 0) continue;
    const ref = b.booking_reference;
    const rounded = Math.round(hours);

    if (hours <= ASSIGN_GUIDE_WITHIN_HOURS && b.guide_count === 0) {
      add(b, {
        kind: AUTO_TASK.ASSIGN_GUIDE,
        title: `[${AUTO_TASK.ASSIGN_GUIDE}] Assign guide to ${ref}`,
        description: `${ref} (${b.tour_name ?? "Custom Tour"}) has no guide assigned and is in ${rounded} hours.`,
        priority: hours <= URGENT_WITHIN_HOURS ? "urgent" : "normal",
      });
    }

    const balance = cents(b.total_price) - cents(b.amount_paid);
    if (hours <= COLLECT_PAYMENT_WITHIN_HOURS && balance > 0) {
      add(b, {
        kind: AUTO_TASK.COLLECT_PAYMENT,
        title: `[${AUTO_TASK.COLLECT_PAYMENT}] Collect ${euros(balance)} from ${ref}`,
        description: `${ref} has an outstanding balance of ${euros(balance)} and the tour is in ${rounded} hours.`,
        priority: "urgent",
      });
    }

    if (hours <= SET_MEETING_POINT_WITHIN_HOURS && !b.meeting_point) {
      add(b, {
        kind: AUTO_TASK.SET_MEETING_POINT,
        title: `[${AUTO_TASK.SET_MEETING_POINT}] Set meeting point for ${ref}`,
        description: `${ref} has no meeting point set and the tour is in ${rounded} hours.`,
        priority: "urgent",
      });
    }
  }
  return planned;
}

/** A custom tour request that has sat in draft for a day needs someone to look at it. */
export function planDraftTasks(drafts: StaleDraft[], existing: ReadonlySet<string>): PlannedTask[] {
  return drafts
    .filter((d) => !existing.has(`${d.id}:${AUTO_TASK.REVIEW_CUSTOM}`))
    .map((d) => ({
      kind: AUTO_TASK.REVIEW_CUSTOM,
      bookingId: d.id,
      title: `[${AUTO_TASK.REVIEW_CUSTOM}] Review custom tour draft ${d.booking_reference}`,
      description: `Custom tour ${d.booking_reference} has been in draft for over 24 hours and needs review.`,
      priority: "normal" as const,
      dueDate: null,
    }));
}
