import initKnex from "knex";
import knexConfig from "../knexfile.js";
import "dotenv/config";

const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);

import { sendBookingReminder } from "../services/emailService.js";
import { format, addDays } from "date-fns";

export const sendReminders = async () => {
  try {
    const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

    const bookings = await knex("bookings")
      .leftJoin("tours", "bookings.tour_id", "tours.id")
      .leftJoin(
        "tour_time_slots",
        "bookings.time_slot_id",
        "tour_time_slots.id"
      )
      .select([
        "bookings.*",
        "tours.tour_name",
        "tours.includes",
        "tours.essentials",
        knex.raw(
          "COALESCE(bookings.start_time, tour_time_slots.start_time) as display_start_time"
        ),
        knex.raw(
          "COALESCE(bookings.end_time, tour_time_slots.end_time) as display_end_time"
        ),
      ])
      .whereRaw("DATE(bookings.tour_date) = ?", [tomorrow])
      .whereIn("bookings.status", ["confirmed"])
      .whereNotNull("bookings.primary_contact_email");

    console.log(
      `[ReminderJob] Sending ${bookings.length} reminders for ${tomorrow}`
    );

    for (const booking of bookings) {
      await sendBookingReminder(booking);
    }
  } catch (err) {
    console.error("[ReminderJob] Error:", err);
  }
};
