import knex from "../db/knex.js";

const AUTO_TASK_TYPES = {
  ASSIGN_GUIDE: "auto_assign_guide",
  COLLECT_PAYMENT: "auto_collect_payment",
  SET_MEETING_POINT: "auto_set_meeting_point",
  MARK_COMPLETED: "auto_mark_completed",
  REVIEW_CUSTOM: "auto_review_custom",
};

const taskExists = async (bookingId, type) => {
  const existing = await knex("tasks")
    .where("booking_id", bookingId)
    .where("title", "like", `%${type}%`)
    .where("is_auto_generated", true)
    .whereNot("status", "cancelled")
    .first();
  return !!existing;
};

const generateAutoTasks = async () => {
  try {
    const now = new Date();
    const in72h = new Date(now.getTime() + 72 * 60 * 60 * 1000);
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingBookings = await knex("bookings")
      .leftJoin("tours", "bookings.tour_id", "tours.id")
      .select([
        "bookings.*",
        "tours.tour_name",
        knex.raw(
          `(SELECT COALESCE(SUM(amount), 0) FROM booking_payments WHERE booking_id = bookings.id) as amount_paid`
        ),
        knex.raw(
          `(SELECT COUNT(*) FROM booking_assignments WHERE booking_id = bookings.id AND status = 'active') as guide_count`
        ),
      ])
      .where("bookings.status", "confirmed")
      .where("bookings.tour_date", ">=", knex.raw("CURRENT_DATE"))
      .where("bookings.tour_date", "<=", in72h);

    for (const booking of upcomingBookings) {
      const tourDate = new Date(booking.tour_date);
      const hoursUntil =
        (tourDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      const ref = booking.booking_reference;

      if (hoursUntil <= 72 && Number(booking.guide_count) === 0) {
        if (!(await taskExists(booking.id, AUTO_TASK_TYPES.ASSIGN_GUIDE))) {
          await knex("tasks").insert({
            title: `[${AUTO_TASK_TYPES.ASSIGN_GUIDE}] Assign guide to ${ref}`,
            description: `${ref} (${
              booking.tour_name ?? "Custom Tour"
            }) has no guide assigned and is in ${Math.round(
              hoursUntil
            )} hours.`,
            type: "tour",
            booking_id: booking.id,
            priority: hoursUntil <= 24 ? "urgent" : "normal",
            due_date: tourDate,
            is_auto_generated: true,
            status: "open",
          });
        }
      }

      const balance = Number(booking.total_price) - Number(booking.amount_paid);
      if (hoursUntil <= 48 && balance > 0) {
        if (!(await taskExists(booking.id, AUTO_TASK_TYPES.COLLECT_PAYMENT))) {
          await knex("tasks").insert({
            title: `[${
              AUTO_TASK_TYPES.COLLECT_PAYMENT
            }] Collect €${balance.toFixed(2)} from ${ref}`,
            description: `${ref} has an outstanding balance of €${balance.toFixed(
              2
            )} and the tour is in ${Math.round(hoursUntil)} hours.`,
            type: "tour",
            booking_id: booking.id,
            priority: "urgent",
            due_date: tourDate,
            is_auto_generated: true,
            status: "open",
          });
        }
      }

      if (hoursUntil <= 24 && !booking.meeting_point) {
        if (
          !(await taskExists(booking.id, AUTO_TASK_TYPES.SET_MEETING_POINT))
        ) {
          await knex("tasks").insert({
            title: `[${AUTO_TASK_TYPES.SET_MEETING_POINT}] Set meeting point for ${ref}`,
            description: `${ref} has no meeting point set and the tour is in ${Math.round(
              hoursUntil
            )} hours.`,
            type: "tour",
            booking_id: booking.id,
            priority: "urgent",
            due_date: tourDate,
            is_auto_generated: true,
            status: "open",
          });
        }
      }
    }

    const staleDrafts = await knex("bookings")
      .where("status", "draft")
      .where("is_custom_tour", true)
      .where("created_at", "<=", new Date(now.getTime() - 24 * 60 * 60 * 1000));

    for (const booking of staleDrafts) {
      if (!(await taskExists(booking.id, AUTO_TASK_TYPES.REVIEW_CUSTOM))) {
        await knex("tasks").insert({
          title: `[${AUTO_TASK_TYPES.REVIEW_CUSTOM}] Review custom tour draft ${booking.booking_reference}`,
          description: `Custom tour ${booking.booking_reference} has been in draft for over 24 hours and needs review.`,
          type: "tour",
          booking_id: booking.id,
          priority: "normal",
          is_auto_generated: true,
          status: "open",
        });
      }
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    await knex("tasks")
      .where("status", "done")
      .where("completed_at", "<=", yesterday)
      .whereNull("archived_at")
      .update({ archived_at: new Date() });

    console.log(`[AutoTaskGenerator] Ran at ${new Date().toISOString()}`);
  } catch (err) {
    console.error("[AutoTaskGenerator] Error:", err);
  }
};
export default generateAutoTasks;
