import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import "dotenv/config";

const knex = initKnex(knexConfig["development"]);
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userId = 14;
    console.log("Fetching bookings for user ID:", userId);

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

    console.log("Bookings fetched:", result);

    res.json(result);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
