// Rules for the "Send reminder" button on a booking. Kept pure so the money
// and date logic can be tested without a database.

const SEED_EMAIL_DOMAIN = "@seed.example.com";
const REMINDABLE_STATUSES = ["pending", "confirmed"];

export type ReminderBlock =
  | "status"
  | "no_email"
  | "seed_email"
  | "tour_passed";

export interface ReminderBooking {
  status: string;
  primary_contact_email?: string | null;
  tour_date: string | Date;
}

const dayOf = (value: string | Date): string =>
  value instanceof Date
    ? value.toISOString().slice(0, 10)
    : String(value).slice(0, 10);

/** Why a reminder cannot be sent, or null when it can. `today` is YYYY-MM-DD. */
export const reminderBlockReason = (
  booking: ReminderBooking,
  today: string,
): ReminderBlock | null => {
  if (!REMINDABLE_STATUSES.includes(booking.status)) return "status";
  const email = booking.primary_contact_email?.trim().toLowerCase();
  if (!email) return "no_email";
  if (email.endsWith(SEED_EMAIL_DOMAIN)) return "seed_email";
  // Dates are YYYY-MM-DD strings: compare as strings (the VPS runs in UTC).
  if (dayOf(booking.tour_date) < today) return "tour_passed";
  return null;
};

/** Amount still owed, in euros, rounded to cents and never negative. */
export const balanceDue = (
  total: number | string,
  paid: number | string,
): number => {
  const cents = Math.round(Number(total) * 100) - Math.round(Number(paid) * 100);
  return Math.max(0, cents) / 100;
};

export const REMINDER_BLOCK_MESSAGES: Record<ReminderBlock, string> = {
  status: "Only pending or confirmed bookings can get a reminder",
  no_email: "This booking has no customer email",
  seed_email: "Demo bookings do not send emails",
  tour_passed: "The tour date has already passed",
};
