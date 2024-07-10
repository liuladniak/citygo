import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";

const knex = initKnex(knexConfig["development"]);
import "dotenv/config";

const router = express.Router();

const getAllTours = async (req, res) => {
  try {
    const tours = await knex("tours")
      .select("tours.*")
      .leftJoin("highlights", "tours.id", "highlights.tour_id")
      .leftJoin("available_dates", "tours.id", "available_dates.tour_id")
      .leftJoin("images", "tours.id", "images.tour_id")
      .groupBy("tours.id")
      .select(
        knex.raw("GROUP_CONCAT(DISTINCT highlights.highlight) as highlights"),
        knex.raw(
          "GROUP_CONCAT(DISTINCT available_dates.date) as available_dates"
        ),
        knex.raw("GROUP_CONCAT(DISTINCT images.image_path) as images")
      );

    tours.forEach((tour) => {
      tour.highlights = tour.highlights ? tour.highlights.split(",") : [];
      tour.available_dates = tour.available_dates
        ? tour.available_dates.split(",")
        : [];
      tour.images = tour.images ? tour.images.split(",") : [];
    });

    res.status(200).json(tours);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getTourById = async (req, res) => {
  const { id } = req.params;

  try {
    const tour = await knex("tours")
      .select("tours.*")
      .leftJoin("highlights", "tours.id", "highlights.tour_id")
      .leftJoin("available_dates", "tours.id", "available_dates.tour_id")
      .leftJoin("images", "tours.id", "images.tour_id")
      .where("tours.id", id)
      .groupBy("tours.id")
      .first()
      .select(
        knex.raw("GROUP_CONCAT(DISTINCT highlights.highlight) as highlights"),
        knex.raw(
          "GROUP_CONCAT(DISTINCT available_dates.date) as available_dates"
        ),
        knex.raw("GROUP_CONCAT(DISTINCT images.image_path) as images")
      );

    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }

    tour.highlights = tour.highlights ? tour.highlights.split(",") : [];
    tour.available_dates = tour.available_dates
      ? tour.available_dates.split(",")
      : [];
    tour.images = tour.images ? tour.images.split(",") : [];

    res.status(200).json(tour);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

router.get("/", getAllTours);
router.get("/:id", getTourById);

export default router;
