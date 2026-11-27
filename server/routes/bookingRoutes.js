import express from "express";
import { knex } from "../db/knex.js";
import "dotenv/config";
import { requireRole } from "../middleware/auth.js";
import { guideAssignmentJob, guideUnassignmentJob } from "../lib/guideEmail.js";
import { notificationQueue } from "../queues/notificationQueue.js";
import { getRedis } from "../lib/redis.js";
import {
  balanceDue,
  reminderBlockReason,
  REMINDER_BLOCK_MESSAGES,
} from "../lib/reminder.js";

const router = express.Router();
const VALID_STATUSES = [
  "draft",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

const logActivity = async (
  bookingId,
  action,
  message,
  actorId = null,
  actorType = "system",
) => {
  try {
    await knex("booking_activity_log").insert({
      booking_id: bookingId,
      action,
      message,
      actor_type: actorType,
      actor_id: actorId,
    });
  } catch (err) {
    console.error("Activity log failed:", err);
  }
};

// Confirmation emails go through the notifications worker only. Do not also
// send directly from here: the customer would get the email twice.
const queueBookingConfirmation = (booking) =>
  notificationQueue.add("booking-confirmation", {
    to: booking.primary_contact_email,
    userName: booking.primary_contact_name,
    tourName: booking.tour_name,
    bookingReference: booking.booking_reference,
    bookingDate: booking.tour_date,
    bookingTime: booking.display_start_time?.slice(0, 5) || "",
    endTime: booking.display_end_time?.slice(0, 5) || "",
    meetingPoint: booking.meeting_point || "",
    guests: booking.total_guests || 1,
    totalPrice: booking.total_price,
  });

const getFullBooking = async (id) =>
  knex("bookings")
    .leftJoin("tours", "bookings.tour_id", "tours.id")
    .leftJoin("tour_time_slots", "bookings.time_slot_id", "tour_time_slots.id")
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
      knex.raw(`(SELECT COALESCE(adults,0)+COALESCE(children,0)+COALESCE(infants,0) 
                 FROM booking_guests WHERE booking_id = bookings.id) as total_guests`),
      knex.raw(`(SELECT json_agg(json_build_object('guide_name', e.first_name || ' ' || e.last_name))
                 FROM booking_assignments ba JOIN employees e ON ba.guide_id = e.id
                 WHERE ba.booking_id = bookings.id AND ba.status = 'active') as staff`),
    ])
    .where("bookings.id", id)
    .first();

router.post(
  "/:id/assignments",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { guide_id, role } = req.body;

      if (!guide_id || !role)
        return res
          .status(400)
          .json({ error: "guide_id and role are required" });
      const validRoles = ["lead_guide", "assistant_guide", "driver"];
      if (!validRoles.includes(role))
        return res.status(400).json({ error: "Invalid role" });

      const booking = await knex("bookings").where("id", id).first();
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      const existing = await knex("booking_assignments")
        .where({ booking_id: id, guide_id, role, status: "active" })
        .first();
      if (existing)
        return res
          .status(409)
          .json({ error: "Guide already assigned with this role" });

      const [assignment] = await knex("booking_assignments")
        .insert({ booking_id: id, guide_id, role, status: "active" })
        .returning("*");
      await knex("bookings")
        .where({ id, is_custom_tour: true, status: "draft" })
        .update({ status: "confirmed" });

      const guide = await knex("employees")
        .where("id", guide_id)
        .select("first_name", "last_name", "email")
        .first();
      const roleLabel =
        {
          lead_guide: "Lead Guide",
          assistant_guide: "Assistant Guide",
          driver: "Driver",
        }[role] ?? role;

      await logActivity(
        id,
        "assignment",
        `${guide.first_name} ${
          guide.last_name
        } assigned as ${roleLabel} to booking ${
          booking.booking_reference ?? `#${id}`
        }`,
        null,
        "agent",
      );

      if (guide?.email) {
        const fullBooking = await getFullBooking(id);
        const job = guideAssignmentJob(
          { name: `${guide.first_name} ${guide.last_name}`, email: guide.email },
          fullBooking,
          role,
        );
        // The assignment is already saved, so a queue problem must not fail the request.
        notificationQueue
          .add("guide-assignment", job)
          .catch((err) => console.error("Queue guide-assignment failed:", err));
      }

      res.status(201).json({ data: assignment });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

router.delete(
  "/:id/assignments/:assignmentId",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const { id, assignmentId } = req.params;

      const assignment = await knex("booking_assignments as ba")
        .join("employees as e", "ba.guide_id", "e.id")
        .where("ba.id", assignmentId)
        .select(
          knex.raw("e.first_name || ' ' || e.last_name as guide_name"),
          "e.email as guide_email",
          "ba.role",
          "ba.guide_id",
        )
        .first();

      await knex("booking_assignments")
        .where("id", assignmentId)
        .update({ status: "cancelled" });

      if (assignment) {
        const roleLabel =
          {
            lead_guide: "Lead Guide",
            assistant_guide: "Assistant Guide",
            driver: "Driver",
          }[assignment.role] ?? assignment.role;
        await logActivity(
          id,
          "unassignment",
          `${assignment.guide_name} removed as ${roleLabel}`,
          null,
          "agent",
        );

        if (assignment.guide_email) {
          const fullBooking = await getFullBooking(id);
          const job = guideUnassignmentJob(
            { name: assignment.guide_name, email: assignment.guide_email },
            fullBooking,
          );
          notificationQueue
            .add("guide-unassignment", job)
            .catch((err) =>
              console.error("Queue guide-unassignment failed:", err),
            );
        }
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

router.post("/admin", async (req, res) => {
  try {
    const {
      tour_id,
      is_custom_tour,
      tour_date,
      time_slot_id,
      start_time,
      end_time,
      meeting_point,
      primary_contact_name,
      primary_contact_email,
      primary_contact_phone,
      language,
      status,
      source,
      notes,
      total_price,
    } = req.body;

    if (!tour_date || !primary_contact_name || !status)
      return res.status(400).json({ error: "Missing required fields" });
    if (!VALID_STATUSES.includes(status))
      return res.status(400).json({ error: "Invalid status" });

    const [{ max }] = await knex("bookings").max("id as max");
    const booking_reference = `BK-${1000 + (max || 0) + 1}`;

    const [booking] = await knex("bookings")
      .insert({
        tour_id: tour_id || null,
        is_custom_tour: is_custom_tour || false,
        tour_date,
        time_slot_id: time_slot_id || null,
        start_time: start_time || null,
        end_time: end_time || null,
        meeting_point: meeting_point || null,
        primary_contact_name,
        primary_contact_email: primary_contact_email || null,
        primary_contact_phone: primary_contact_phone || null,
        language: language || "en",
        status,
        source: source || "admin_dashboard",
        notes: notes || null,
        booking_reference,
        total_price: is_custom_tour ? total_price || null : null,
      })
      .returning("*");

    await logActivity(
      booking.id,
      "booking",
      `New booking ${booking_reference} created for ${primary_contact_name}`,
      null,
      "agent",
    );
    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post(
  "/:id/guests",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { adults = 1, children = 0, infants = 0 } = req.body;

      await knex("booking_guests")
        .insert({ booking_id: id, adults, children, infants })
        .onConflict("booking_id")
        .merge();

      const booking = await knex("bookings").where("id", id).first();
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      if (!booking.is_custom_tour && booking.tour_id) {
        const tour = await knex("tours").where("id", booking.tour_id).first();
        if (tour) {
          const price = parseFloat(tour.price);
          await knex("bookings")
            .where("id", id)
            .update({ total_price: adults * price + children * (price * 0.5) });
        }
      }
      res.status(201).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

router.post(
  "/:id/guest-names",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const { names } = req.body;
      if (!Array.isArray(names) || names.length === 0)
        return res.status(400).json({ error: "names array is required" });
      await knex("booking_guest_names").insert(
        names.map((full_name) => ({ booking_id: req.params.id, full_name })),
      );
      res.status(201).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tour_date,
      time_slot_id,
      start_time,
      end_time,
      meeting_point,
      primary_contact_name,
      primary_contact_email,
      primary_contact_phone,
      language,
      notes,
      source,
      status,
    } = req.body;

    const booking = await knex("bookings").where("id", id).first();
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (req.role === "associate") {
      const allowedFields = [
        "primary_contact_name",
        "primary_contact_email",
        "primary_contact_phone",
        "meeting_point",
        "notes",
        "language",
      ];
      const forbidden = Object.keys(req.body).filter(
        (k) => !allowedFields.includes(k),
      );
      if (forbidden.length > 0)
        return res
          .status(403)
          .json({ error: `Associates cannot update: ${forbidden.join(", ")}` });
    }

    const updates = {};
    if (tour_date !== undefined) updates.tour_date = tour_date;
    if (time_slot_id !== undefined) updates.time_slot_id = time_slot_id;
    if (start_time !== undefined) updates.start_time = start_time || null;
    if (end_time !== undefined) updates.end_time = end_time || null;
    if (meeting_point !== undefined)
      updates.meeting_point = meeting_point || null;
    if (primary_contact_name !== undefined)
      updates.primary_contact_name = primary_contact_name;
    if (primary_contact_email !== undefined)
      updates.primary_contact_email = primary_contact_email || null;
    if (primary_contact_phone !== undefined)
      updates.primary_contact_phone = primary_contact_phone || null;
    if (language !== undefined) updates.language = language;
    if (notes !== undefined) updates.notes = notes || null;
    if (source !== undefined) updates.source = source;
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status))
        return res.status(400).json({ error: "Invalid status" });
      updates.status = status;
    }

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ error: "No valid fields to update" });

    const [updated] = await knex("bookings")
      .where("id", id)
      .update(updates)
      .returning("*");
    const ref = booking.booking_reference ?? `#${id}`;

    if (status && status !== booking.status) {
      await logActivity(
        id,
        "booking",
        `Booking ${ref} status changed from ${booking.status} to ${status}`,
        null,
        "agent",
      );

      if (status === "confirmed" && updated?.primary_contact_email) {
        const fullBooking = await getFullBooking(id);
        await queueBookingConfirmation(fullBooking);
      }
    }
    if (
      tour_date &&
      tour_date !== new Date(booking.tour_date).toISOString().split("T")[0]
    )
      await logActivity(
        id,
        "booking",
        `Booking date changed to ${new Date(tour_date).toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric", year: "numeric" },
        )}`,
        null,
        "agent",
      );
    if (time_slot_id && time_slot_id !== booking.time_slot_id)
      await logActivity(
        id,
        "booking",
        `Time slot updated for booking ${ref}`,
        null,
        "agent",
      );
    if (
      primary_contact_name &&
      primary_contact_name !== booking.primary_contact_name
    )
      await logActivity(
        id,
        "booking",
        `Primary contact updated to ${primary_contact_name}`,
        null,
        "agent",
      );
    if (meeting_point && meeting_point !== booking.meeting_point)
      await logActivity(
        id,
        "booking",
        `Meeting point set to "${meeting_point}"`,
        null,
        "agent",
      );
    if (
      (start_time && start_time !== booking.start_time) ||
      (end_time && end_time !== booking.end_time)
    )
      await logActivity(
        id,
        "booking",
        `Tour time updated to ${start_time} – ${end_time}`,
        null,
        "agent",
      );

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch(
  "/:id/guests",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { adults, children, infants } = req.body;
      if (adults !== undefined && adults < 1)
        return res.status(400).json({ error: "At least 1 adult required" });

      const guestUpdates = {};
      if (adults !== undefined) guestUpdates.adults = adults;
      if (children !== undefined) guestUpdates.children = children;
      if (infants !== undefined) guestUpdates.infants = infants;
      if (Object.keys(guestUpdates).length === 0)
        return res.status(400).json({ error: "No fields to update" });

      const currentGuests = await knex("booking_guests")
        .where("booking_id", id)
        .first();
      await knex("booking_guests").where("booking_id", id).update(guestUpdates);

      const booking = await knex("bookings").where("id", id).first();
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      if (!booking.is_custom_tour && booking.tour_id) {
        const tour = await knex("tours").where("id", booking.tour_id).first();
        if (tour) {
          const price = parseFloat(tour.price);
          const finalAdults = adults ?? currentGuests.adults;
          const finalChildren = children ?? currentGuests.children;
          await knex("bookings")
            .where("id", id)
            .update({
              total_price: finalAdults * price + finalChildren * (price * 0.5),
            });
        }
      }

      const parts = [];
      if (adults !== undefined) parts.push(`${adults} adults`);
      if (children !== undefined) parts.push(`${children} children`);
      if (infants !== undefined) parts.push(`${infants} infants`);
      await logActivity(
        id,
        "booking",
        `Party size updated to ${parts.join(", ")} for booking ${
          booking.booking_reference ?? `#${id}`
        }`,
        null,
        "agent",
      );

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

router.post(
  "/:id/payments",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { method, status, amount, paid_at } = req.body;
      if (amount === undefined || amount === null)
        return res.status(400).json({ error: "amount is required" });

      const isRefund = Number(amount) < 0;
      const [payment] = await knex("booking_payments")
        .insert({
          booking_id: id,
          method: method || "cash",
          status: isRefund ? "refunded" : status || "paid",
          amount,
          paid_at: paid_at || knex.fn.now(),
        })
        .returning("*");

      const booking = await knex("bookings").where("id", id).first();
      if (!booking) return res.status(404).json({ error: "Booking not found" });
      const ref = booking.booking_reference ?? `#${id}`;

      await logActivity(
        id,
        "payment",
        isRefund
          ? `Refund of €${Math.abs(amount).toFixed(
              2,
            )} recorded for booking ${ref}`
          : `Payment of €${Number(amount).toFixed(
              2,
            )} recorded for booking ${ref}`,
        null,
        "agent",
      );

      if (
        !isRefund &&
        booking.status === "pending" &&
        booking.total_price !== null
      ) {
        const { total } = await knex("booking_payments")
          .where("booking_id", id)
          .sum("amount as total")
          .first();
        if (Number(total) >= Number(booking.total_price)) {
          await knex("bookings")
            .where("id", id)
            .update({ status: "confirmed" });
          await logActivity(
            id,
            "booking",
            `Booking ${ref} automatically confirmed after full payment`,
            null,
            "agent",
          );
          const fullBooking = await getFullBooking(id);
          if (fullBooking?.primary_contact_email) {
            await queueBookingConfirmation(fullBooking);
          }
        }
      }

      res.status(201).json({ data: payment });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

router.post(
  "/:id/cancel",
  requireRole("admin", "manager"),
  async (req, res) => {
    const { id } = req.params;
    const { reason, notes, refund_amount } = req.body;

    try {
      const booking = await knex("bookings").where("id", id).first();
      if (!booking) return res.status(404).json({ error: "Booking not found" });
      if (booking.status === "cancelled")
        return res.status(400).json({ error: "Booking is already cancelled" });

      await knex.transaction(async (trx) => {
        await trx("bookings")
          .where("id", id)
          .update({
            status: "cancelled",
            cancellation_reason: reason ?? null,
            cancellation_notes: notes ?? null,
          });
        if (refund_amount && Number(refund_amount) > 0) {
          await trx("booking_payments").insert({
            booking_id: id,
            method: "refund",
            amount: -Math.abs(Number(refund_amount)),
            status: "paid",
            paid_at: new Date(),
            notes: "Refund on cancellation",
          });
        }
        await logActivity(
          id,
          "booking",
          `Booking ${booking.booking_reference} cancelled${
            reason ? ` — ${reason.replace("_", " ")}` : ""
          }`,
          null,
          "agent",
          trx,
        );
      });

      if (booking?.primary_contact_email) {
        const tourName = booking.tour_id
          ? (
              await knex("tours")
                .where("id", booking.tour_id)
                .select("tour_name")
                .first()
            )?.tour_name
          : null;
        // Worker only: a direct send as well would email the customer twice.
        await notificationQueue.add("booking-cancellation", {
          to: booking.primary_contact_email,
          userName: booking.primary_contact_name,
          tourName: tourName || "Custom Tour",
          bookingReference: booking.booking_reference,
          bookingDate: booking.tour_date,
          refundAmount: refund_amount ?? 0,
        });
      }

      const updated = await knex("bookings").where("id", id).first();
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to cancel booking" });
    }
  },
);

// Staff-triggered reminder email. One per booking every 10 minutes so a
// double click or a bored finger cannot spam a customer.
const REMINDER_COOLDOWN_SECONDS = 600;

router.post(
  "/:id/reminder",
  requireRole("admin", "manager"),
  async (req, res) => {
    const { id } = req.params;
    try {
      const booking = await getFullBooking(id);
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      const today = new Date().toISOString().slice(0, 10);
      const blocked = reminderBlockReason(booking, today);
      if (blocked) {
        return res.status(400).json({ error: REMINDER_BLOCK_MESSAGES[blocked] });
      }

      try {
        const first = await getRedis().set(
          `booking-reminder:${id}`,
          "1",
          "EX",
          REMINDER_COOLDOWN_SECONDS,
          "NX",
        );
        if (!first) {
          return res
            .status(429)
            .json({ error: "A reminder was just sent. Try again in a few minutes" });
        }
      } catch (err) {
        console.error("Reminder cooldown unavailable:", err);
        return res
          .status(503)
          .json({ error: "Reminders are unavailable right now" });
      }

      const { paid } = await knex("booking_payments")
        .where({ booking_id: id, status: "paid" })
        .sum({ paid: "amount" })
        .first();

      await notificationQueue.add("booking-reminder-manual", {
        to: booking.primary_contact_email,
        userName: booking.primary_contact_name,
        tourName: booking.tour_name || "Custom Tour",
        bookingReference: booking.booking_reference,
        bookingDate: booking.tour_date,
        bookingTime: booking.display_start_time || "",
        meetingPoint: booking.meeting_point || "",
        balanceDue: balanceDue(booking.total_price, paid ?? 0),
      });

      await logActivity(
        id,
        "reminder",
        `Reminder emailed to ${booking.primary_contact_email}`,
        null,
        "agent",
      );
      res.json({ sent: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to send reminder" });
    }
  },
);

export default router;
