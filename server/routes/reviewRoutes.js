import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import { requireRole } from "../middleware/auth.js";
import "dotenv/config";
import { requireClientAuth } from "../middleware/clientAuth.js";

const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
const router = express.Router();

const getInternalUserId = async (supabaseId) => {
  const user = await knex("users")
    .where("supabase_id", supabaseId)
    .select("id")
    .first();
  return user?.id;
};

router.get("/tour/:tourId", async (req, res) => {
  const { tourId } = req.params;
  const { page = 1, limit = 10, sort = "recent" } = req.query;
  const offset = (page - 1) * limit;

  try {
    const orderBy =
      sort === "highest"
        ? { column: "r.rating", order: "desc" }
        : sort === "lowest"
          ? { column: "r.rating", order: "asc" }
          : { column: "r.created_at", order: "desc" };

    const reviews = await knex("reviews as r")
      .join("users as u", "r.user_id", "u.id")
      .join("bookings as b", "r.booking_id", "b.id")
      .where("r.tour_id", tourId)
      .select(
        "r.id",
        "r.rating",
        "r.title",
        "r.body",
        "r.photos",
        "r.created_at",
        "u.first_name",
        knex.raw("LEFT(u.last_name, 1) as last_initial"),
        "u.country",
        "b.tour_date",
      )
      .orderBy(orderBy.column, orderBy.order)
      .limit(limit)
      .offset(offset);

    const [{ count }] = await knex("reviews")
      .where("tour_id", tourId)
      .count("id as count");

    const summary = await knex("tour_rating_summary")
      .where("tour_id", tourId)
      .first();

    res.json({
      reviews,
      summary: summary || { avg_rating: null, review_count: 0 },
      total: parseInt(count),
      totalPages: Math.ceil(count / limit),
      page: parseInt(page),
    });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.post("/", requireClientAuth, async (req, res) => {
  console.log("POST /api/reviews hit");
  console.log("body:", req.body);
  console.log("req.userId:", req.userId);
  const { booking_id, rating, title, body, photos = [] } = req.body;
  const userId = await getInternalUserId(req.userId);
  if (!userId) return res.status(401).json({ error: "User not found" });

  if (!booking_id || !rating || !body) {
    return res
      .status(400)
      .json({ error: "booking_id, rating, and body are required" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  if (photos.length > 3) {
    return res.status(400).json({ error: "Maximum 3 photos allowed" });
  }

  try {
    const booking = await knex("bookings")
      .where({ id: booking_id, user_id: userId })
      .first();

    if (!booking) {
      return res.status(403).json({ error: "Booking not found" });
    }

    if (booking.status !== "completed") {
      return res
        .status(400)
        .json({ error: "You can only review completed bookings" });
    }

    const existing = await knex("reviews").where({ booking_id }).first();

    if (existing) {
      return res
        .status(409)
        .json({ error: "You have already reviewed this booking" });
    }

    const [review] = await knex("reviews")
      .insert({
        booking_id,
        tour_id: booking.tour_id,
        user_id: userId,
        rating,
        title: title?.trim() || null,
        body: body.trim(),
        photos,
      })
      .returning("*");

    res.status(201).json(review);
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

router.get("/user/eligible", requireClientAuth, async (req, res) => {
  const userId = await getInternalUserId(req.userId);
  if (!userId) return res.status(401).json({ error: "User not found" });

  try {
    const eligible = await knex("bookings as b")
      .leftJoin("reviews as r", "b.id", "r.booking_id")
      .join("tours as t", "b.tour_id", "t.id")
      .where("b.user_id", userId)
      .where("b.status", "completed")
      .whereNull("r.id")
      .select(
        "b.id as booking_id",
        "b.tour_date",
        "t.id as tour_id",
        "t.tour_name",
      );

    res.json(eligible);
  } catch (err) {
    console.error("Error fetching eligible bookings:", err);
    res.status(500).json({ error: "Failed to fetch eligible bookings" });
  }
});

router.delete("/:id", requireClientAuth, async (req, res) => {
  const { id } = req.params;
  const userId = await getInternalUserId(req.userId);
  if (!userId) return res.status(401).json({ error: "User not found" });

  try {
    const deleted = await knex("reviews")
      .where({ id, user_id: userId })
      .delete()
      .returning("id");

    if (!deleted.length) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
