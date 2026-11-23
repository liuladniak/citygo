import "dotenv/config";
import { and, eq, isNotNull, notLike, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { bookings, companySettings, tourTimeSlots, tours } from "../db/drizzle/schema.js";
import { notificationQueue } from "../queues/notificationQueue.js";
import { DEFAULT_TIMEZONE, nowInZone } from "../lib/clock.js";
import { addDaysToDay } from "../lib/dates.js";

const SEED_EMAIL_PATTERN = "%@seed.example.com";

export type ReminderBooking = {
  id: number;
  primary_contact_email: string;
  primary_contact_name: string | null;
  booking_reference: string | null;
  tour_date: string;
  tour_name: string | null;
  includes: string | null;
  essentials: string | null;
  start_time: string | null;
  meeting_point: string | null;
};

export const reminderJobId = (bookingId: number, day: string) => `booking-reminder-${bookingId}-${day}`;

/** What the notification worker needs to email one guest. */
export const reminderPayload = (b: ReminderBooking) => ({
  to: b.primary_contact_email,
  userName: b.primary_contact_name,
  tourName: b.tour_name || "Custom Tour",
  bookingReference: b.booking_reference,
  bookingDate: b.tour_date,
  bookingTime: b.start_time?.slice(0, 5) || "",
  meetingPoint: b.meeting_point || "",
  includes: b.includes || "",
  essentials: b.essentials || "",
});

/** Queues tomorrow's reminders. Safe to run twice: the same guest and day never queue two emails. */
export const sendReminders = async (now: Date = new Date()): Promise<void> => {
  try {
    const [settings] = await db.select({ timezone: companySettings.timezone }).from(companySettings).limit(1);
    const tomorrow = addDaysToDay(nowInZone(settings?.timezone || DEFAULT_TIMEZONE, now).date, 1);

    const due: ReminderBooking[] = await db
      .select({
        id: bookings.id,
        primary_contact_email: sql<string>`${bookings.primaryContactEmail}`,
        primary_contact_name: bookings.primaryContactName,
        booking_reference: bookings.bookingReference,
        tour_date: bookings.tourDate,
        tour_name: tours.tourName,
        includes: tours.includes,
        essentials: tours.essentials,
        start_time: sql<string | null>`coalesce(${bookings.startTime}, ${tourTimeSlots.startTime})`,
        meeting_point: bookings.meetingPoint,
      })
      .from(bookings)
      .leftJoin(tours, eq(bookings.tourId, tours.id))
      .leftJoin(tourTimeSlots, eq(bookings.timeSlotId, tourTimeSlots.id))
      .where(
        and(
          eq(bookings.tourDate, tomorrow),
          eq(bookings.status, "confirmed"),
          isNotNull(bookings.primaryContactEmail),
          notLike(bookings.primaryContactEmail, SEED_EMAIL_PATTERN),
        ),
      );

    console.log(`[ReminderJob] Queuing ${due.length} reminders for ${tomorrow}`);

    for (const booking of due) {
      // Worker only: a direct send as well would email the customer twice.
      await notificationQueue.add("booking-reminder", reminderPayload(booking), { jobId: reminderJobId(booking.id, tomorrow) });
    }
  } catch (err) {
    console.error("[ReminderJob] Error:", err);
  }
};
