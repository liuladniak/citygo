import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import multer from "multer";
import { join } from "path";

const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
import "dotenv/config";
export default function createTourRoutes(baseDir) {
  const storage = (baseDir) =>
    multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, join(baseDir, "public", "tours"));
      },
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    });

  // export default function createTourRoutes(baseDir) {
  const upload = multer({ storage: storage(baseDir) });
  const router = express.Router();

  const getAllTours = async (req, res) => {
    try {
      const tours = await knex("tours").select("*");
      const highlights = await knex("highlights").select(
        "tour_id",
        "highlight"
      );
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

  const getTourBySlug = async (req, res) => {
    const { slug } = req.params;
    console.log("Fetching tour with slug:", slug);
    try {
      const tour = await knex("tours").where({ slug }).first();
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      const { id } = tour;
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

  const editTour = async (req, res) => {
    const { slug } = req.params;
    console.log("Fetching tour with slug:", slug);
    const {
      available_dates,
      tour_name,
      images,
      price,
      duration,
      activity_level,
      category,
      overview_title,
      overview,
      landmarks,
      groups,
      minimum_of_attendees,
      additional_costs,
      start_time,
      end_time,
      latitude,
      longitude,
      accessibility,
      highlights,
      essentials,
      includes,
    } = req.body;

    console.log(slug);
    try {
      const tour = await knex("tours").where({ slug }).first();
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      const { id: tour_id } = tour;

      const updatedRows = await knex("tours")
        .where("slug", slug)
        .update({
          tour_name,
          price,
          duration,
          activity_level,
          category,
          overview_title,
          overview,
          landmarks,
          groups,
          minimum_of_attendees,
          additional_costs,
          start_time,
          end_time,
          latitude,
          longitude,
          accessibility: JSON.stringify(accessibility),
          essentials,
          includes,
          updated_at: knex.fn.now(),
        });

      await knex("images").where({ tour_id }).del();
      if (images && images.length) {
        const imageRecords = images.map((file) => ({
          tour_id,
          image_path: file.filename,
        }));
        await knex("images").insert(imageRecords);
      }

      await knex("highlights").where({ tour_id }).del();
      if (highlights && highlights.length) {
        const highlightRecords = highlights.map((highlight) => ({
          tour_id,
          highlight,
        }));
        await knex("highlights").insert(highlightRecords);
      }

      await knex("available_dates").where({ tour_id }).del();
      if (available_dates && available_dates.length) {
        const dateRecords = available_dates.map((date) => ({ tour_id, date }));
        await knex("available_dates").insert(dateRecords);
      }

      res.status(200).json({ message: "Tour updated successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update tour" });
    }
  };

  const addTour = async (req, res) => {
    const {
      tour_name,
      price,
      duration,
      slug,
      activity_level,
      category,
      overview_title,
      overview,
      landmarks,
      groups,
      minimum_of_attendees,
      additional_costs,
      start_time,
      end_time,
      latitude,
      longitude,
      accessibility,
      essentials,
      includes,
      highlights,
      available_dates,
    } = req.body;
    const images = req.files;
    console.log("Images:", images);
    console.log("Req.body beginning", req.body, "Request body");
    try {
      const [tour] = await knex("tours")
        .insert({
          tour_name,
          price,
          slug,
          duration,
          activity_level,
          category,
          overview_title,
          overview,
          landmarks,
          groups,
          minimum_of_attendees,
          additional_costs,
          start_time,
          end_time,
          latitude,
          longitude,
          accessibility: JSON.stringify(accessibility),
          essentials,
          includes,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now(),
        })
        .returning("id");

      const tourId = tour.id;
      console.log("Tour ID:", tourId);
      if (images && images.length) {
        const imageRecords = images.map((file) => ({
          image_path: file.filename,
          tour_id: tourId,
        }));
        await knex("images").insert(imageRecords);
      }

      if (highlights && highlights.length) {
        const highlightRecords = highlights.map((highlight) => ({
          tour_id: tourId,
          highlight,
        }));
        await knex("highlights").insert(highlightRecords);
      }

      if (available_dates && available_dates.length) {
        const dateRecords = available_dates.map((date) => ({
          tour_id: tourId,
          date,
        }));
        await knex("available_dates").insert(dateRecords);
      }

      res.status(201).json({
        message: "Tour added successfully!",
        tourId,
        tour_name,
        price,
        slug,
        duration,
        activity_level,
        category,
        overview_title,
        overview,
        landmarks,
        groups,
        minimum_of_attendees,
        additional_costs,
        start_time,
        end_time,
        latitude,
        longitude,
        accessibility,
        essentials,
        includes,
        highlights,
        available_dates,
        images,
      });
    } catch (error) {
      console.error("Error adding tour:", error);
      res.status(500).json({ message: "Failed to add tour", error });
    }
  };

  router.get("/", getAllTours);
  router.post("/", upload.array("images"), addTour);
  router.get("/:slug", getTourBySlug);
  router.put("/:slug", editTour);

  return router;
}
