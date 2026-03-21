import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import "dotenv/config";

const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { limit = 5, cursor } = req.query;
    const pageSize = Math.min(parseInt(limit) || 5, 50);
    const cursorId = cursor
      ? JSON.parse(Buffer.from(cursor, "base64").toString())
      : null;

    let bookingQuery = knex("booking_activity_log")
      .leftJoin("bookings", "booking_activity_log.booking_id", "bookings.id")
      .select(
        "booking_activity_log.id",
        "booking_activity_log.action",
        "booking_activity_log.message",
        "booking_activity_log.created_at",
        knex.raw("'booking' as source"),
        "booking_activity_log.booking_id as ref_id",
        "bookings.booking_reference as ref_label"
      )
      .orderBy("booking_activity_log.id", "desc")
      .limit(pageSize);

    if (cursorId?.booking_id) {
      bookingQuery.where("booking_activity_log.id", "<", cursorId.booking_id);
    }

    let tourQuery = knex("tour_activity_log")
      .leftJoin("tours", "tour_activity_log.tour_id", "tours.id")
      .leftJoin("employees", "tour_activity_log.actor_id", "employees.id")
      .select(
        "tour_activity_log.id",
        "tour_activity_log.action",
        "tour_activity_log.message",
        "tour_activity_log.created_at",
        knex.raw("'tour' as source"),
        "tour_activity_log.tour_id as ref_id",
        "tours.tour_name as ref_label"
      )
      .orderBy("tour_activity_log.id", "desc")
      .limit(pageSize);

    if (cursorId?.tour_id) {
      tourQuery.where("tour_activity_log.id", "<", cursorId.tour_id);
    }

    const [bookingLogs, tourLogs] = await Promise.all([
      bookingQuery,
      tourQuery,
    ]);

    const merged = [...bookingLogs, ...tourLogs]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, pageSize);

    let nextCursor = null;
    if (merged.length === pageSize) {
      const lastBooking = merged.filter((r) => r.source === "booking").at(-1);
      const lastTour = merged.filter((r) => r.source === "tour").at(-1);
      nextCursor = Buffer.from(
        JSON.stringify({
          booking_id: lastBooking?.id ?? null,
          tour_id: lastTour?.id ?? null,
        })
      ).toString("base64");
    }

    res.json({ data: merged, nextCursor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
