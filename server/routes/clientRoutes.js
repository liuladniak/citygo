import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import { requireClientAuth } from "../middleware/clientAuth.js";

const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
const router = express.Router();

router.get("/bookings", requireClientAuth, async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "User ID required" });

    const user = await knex("users").where("supabase_id", req.userId).first();

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.id !== parseInt(userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const bookings = await knex("bookings")
      .leftJoin("tours", "bookings.tour_id", "tours.id")
      .leftJoin(
        "tour_time_slots",
        "bookings.time_slot_id",
        "tour_time_slots.id",
      )
      .select(
        "bookings.*",
        "tours.tour_name as tour_title",
        "tours.price as tour_price",
        "tours.slug as tour_slug",
        knex.raw(
          "COALESCE(bookings.start_time, tour_time_slots.start_time) as display_start_time",
        ),
        knex.raw(
          "COALESCE(bookings.end_time, tour_time_slots.end_time) as display_end_time",
        ),
        knex.raw(`(SELECT COALESCE(adults,0)+COALESCE(children,0)+COALESCE(infants,0) 
                   FROM booking_guests WHERE booking_id = bookings.id) as total_guests`),
        knex.raw(
          `(SELECT COALESCE(SUM(amount),0) FROM booking_payments WHERE booking_id = bookings.id) as amount_paid`,
        ),
      )
      .where(function () {
        this.where("bookings.user_id", user.id).orWhere(
          "bookings.primary_contact_email",
          user.email,
        );
      })
      .orderBy("bookings.tour_date", "desc");

    const tourIds = [
      ...new Set(bookings.map((b) => b.tour_id).filter(Boolean)),
    ];
    const images = tourIds.length
      ? await knex("images")
          .select("tour_id", "image_path")
          .whereIn("tour_id", tourIds)
          .orderBy("id")
      : [];

    const imagesByTourId = images.reduce((acc, { tour_id, image_path }) => {
      if (!acc[tour_id]) acc[tour_id] = [];
      acc[tour_id].push(image_path);
      return acc;
    }, {});

    res.json(
      bookings.map((b) => ({
        ...b,
        tour_images: imagesByTourId[b.tour_id] || [],
      })),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
