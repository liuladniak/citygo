import initKnex from "knex";
import knexConfig from "../knexfile.js";
import "dotenv/config";
import { sendBookingReminder } from "../services/emailService.js";
import { notificationQueue } from "../queues/notificationQueue.js";
import { format, addDays } from "date-fns";

const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);

interface Booking {
  id: number;
  primary_contact_email: string;
  primary_contact_name: string;
  tour_name: string;
  booking_reference: string;
  tour_date: string;
  display_start_time: string;
  display_end_time: string;
  meeting_point: string;
  includes: string;
  essentials: string;
  status: string;
}

export const sendReminders = async (): Promise<void> => {
  try {
    const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

    const bookings = (await knex("bookings")
      .leftJoin("tours", "bookings.tour_id", "tours.id")
      .leftJoin(
        "tour_time_slots",
        "bookings.time_slot_id",
        "tour_time_slots.id",
      )
      .select([
        "bookings.*",
        "tours.tour_name",
        "tours.includes",
        "tours.essentials",
        knex.raw(
          "COALESCE(bookings.start_time, tour_time_slots.start_time) as display_start_time",
        ),
        knex.raw(
          "COALESCE(bookings.end_time, tour_time_slots.end_time) as display_end_time",
        ),
      ])
      .whereRaw("DATE(bookings.tour_date) = ?", [tomorrow])
      .whereIn("bookings.status", ["confirmed"])
      .whereNotNull("bookings.primary_contact_email")) as unknown as Booking[];

    console.log(
      `[ReminderJob] Queuing ${bookings.length} reminders for ${tomorrow}`,
    );

    for (const booking of bookings) {
      await sendBookingReminder(booking);
      await notificationQueue.add("booking-reminder", {
        to: booking.primary_contact_email,
        userName: booking.primary_contact_name,
        tourName: booking.tour_name || "Custom Tour",
        bookingReference: booking.booking_reference,
        bookingDate: booking.tour_date,
        bookingTime: booking.display_start_time || "",
        meetingPoint: booking.meeting_point || "",
      });
    }
  } catch (err) {
    console.error("[ReminderJob] Error:", err);
  }
};
