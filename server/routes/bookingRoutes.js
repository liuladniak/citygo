import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import "dotenv/config";

const knex = initKnex(knexConfig["development"]);
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const bookings = await knex("bookings")
      .select(
        "bookings.*",
        "tours.tour_name as tour_title",
        "tours.price as tour_price"
      )
      .leftJoin("tours", "bookings.tour_id", "tours.id")
      .where("bookings.user_id", userId);

    const images = await knex("images")
      .select("tour_id", "image_path")
      .orderBy("id");

    const imagesByTourId = images.reduce((acc, { tour_id, image_path }) => {
      if (!acc[tour_id]) acc[tour_id] = [];
      acc[tour_id].push(image_path);
      return acc;
    }, {});

    const result = bookings.map((booking) => ({
      ...booking,
      tour_images: imagesByTourId[booking.tour_id] || [],
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  const {
    user_id,
    tour_id,
    booking_date,
    time_slot_id,
    adults,
    children,
    infants,
  } = req.body;

  if (!user_id || !tour_id || !booking_date || !time_slot_id) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const [id] = await knex("bookings")
      .insert({
        user_id,
        tour_id,
        booking_date,
        time_slot_id,
        adults,
        children,
        infants,
      })
      .returning("id");

    res.status(201).json({
      id,
      user_id,
      tour_id,
      booking_date,
      time_slot_id,
      adults,
      children,
      infants,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/bulk", async (req, res) => {
  const bookings = req.body;

  if (!Array.isArray(bookings) || bookings.length === 0) {
    return res.status(400).json({ message: "No bookings provided" });
  }

  try {
    const insertedIds = await knex("bookings").insert(bookings).returning("id");
    res.status(201).json({ message: "Bookings created", ids: insertedIds });
  } catch (error) {
    console.error("Error creating bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
