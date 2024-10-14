import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";

// const knex = initKnex(knexConfig["development"]);
const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
import "dotenv/config";

const router = express.Router();

const getAllTours = async (req, res) => {
  try {
    const tours = await knex("tours").select("*");

    const highlights = await knex("highlights").select("tour_id", "highlight");

    const available_dates = await knex("available_dates").select(
      "tour_id",
      "date"
    );

    const images = await knex("images")
      .select("tour_id", "image_path")
      .orderBy("id");

    const highlightsByTourId = highlights.reduce(
      (acc, { tour_id, highlight }) => {
        if (!acc[tour_id]) acc[tour_id] = [];
        acc[tour_id].push(highlight);
        return acc;
      },
      {}
    );

    const datesByTourId = available_dates.reduce((acc, { tour_id, date }) => {
      if (!acc[tour_id]) acc[tour_id] = [];
      acc[tour_id].push(date);
      return acc;
    }, {});

    const imagesByTourId = images.reduce((acc, { tour_id, image_path }) => {
      if (!acc[tour_id]) acc[tour_id] = [];
      acc[tour_id].push(image_path);
      return acc;
    }, {});

    const result = tours.map((tour) => ({
      ...tour,
      highlights: highlightsByTourId[tour.id] || [],
      available_dates: datesByTourId[tour.id] || [],
      images: imagesByTourId[tour.id] || [],
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getTourById = async (req, res) => {
  try {
    const { id } = req.params;

    const tour = await knex("tours").where({ id }).first();
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }

    const images = await knex("images")
      .where({ tour_id: id })
      .orderBy("id")
      .pluck("image_path");
    tour.images = images;

    const highlights = await knex("highlights")
      .where({ tour_id: id })
      .orderBy("id")
      .pluck("highlight");
    tour.highlights = highlights;

    const available_dates = await knex("available_dates")
      .where({ tour_id: id })
      .orderBy("date")
      .pluck("date");
    tour.available_dates = available_dates;

    res.json(tour);
  } catch (error) {
    console.error("Error fetching tour:", error);
    res.status(500).json({ message: "Server error" });
  }
};

router.get("/", getAllTours);
router.get("/:id", getTourById);

export default router;
