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

  const upload = multer({ storage: storage(baseDir) });
  const router = express.Router();

  const getAllTours = async (req, res) => {
    const { page, limit } = req.query;
    const offset = (page - 1) * limit;
    try {
      const totalToursResult = await knex("tours")
        .countDistinct("tours.id as count")
        .first();
      const totalTours = totalToursResult.count;

      const tours = await knex("tours")
        .select("tours.*")
        .offset(offset)
        .limit(limit);

      const tourIds = tours.map((tour) => tour.id);

      const detailedTours = await knex("tours")
        .select("tours.*", "images.image_path", "highlights.highlight")
        .leftJoin("images", "tours.id", "images.tour_id")
        .leftJoin("highlights", "tours.id", "highlights.tour_id")
        .whereIn("tours.id", tourIds);

      const groupedTours = detailedTours.reduce((acc, tour) => {
        const { id, image_path, highlight } = tour;

        if (!acc[id]) {
          acc[id] = {
            ...tour,
            images: [],
            highlights: [],
          };
        }

        if (image_path && !acc[id].images.includes(image_path)) {
          acc[id].images.push(image_path);
        }

        if (highlight && !acc[id].highlights.includes(highlight)) {
          acc[id].highlights.push(highlight);
        }

        return acc;
      }, {});
      const finalResult = Object.values(groupedTours);
      const totalPages = Math.ceil(totalTours / limit);
      res.status(200).json({
        data: finalResult,
        currentPage: Number(page),
        totalPages,
        totalTours,
      });
    } catch (error) {
      console.error("Error fetching tours:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  const getTourBySlug = async (req, res) => {
    const { slug } = req.params;
    try {
      const tour = await knex("tours").where({ slug }).first();

      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }

      const { id } = tour;

      const tours = await knex("tours")
        .select(
          "tours.*",
          "tour_itinerary_coordinates.id as itinerary_id",
          "tour_itinerary_coordinates.order as itinerary_order",
          "tour_itinerary_coordinates.latitude as itinerary_latitude",
          "tour_itinerary_coordinates.longitude as itinerary_longitude",
          "tour_itinerary_coordinates.name as itinerary_name",
          "tour_time_slots.id as time_slot_id",
          "tour_time_slots.start_time as time_slot_start_time",
          "tour_time_slots.end_time as time_slot_end_time",
          "images.image_path",
          "highlights.highlight",
          "tour_availabilities.start_date as available_start_date",
          "tour_availabilities.end_date as available_end_date",
          "tour_recurring_unavailabilities.day_of_week as unavailable_recurring_day_of_week",
          "tour_recurring_unavailabilities.reason as unavailable_recurring_reason",
          "tour_unavailable_dates.unavailable_date as unavailable_date"
        )
        .leftJoin(
          "tour_itinerary_coordinates",
          "tours.id",
          "tour_itinerary_coordinates.tour_id"
        )
        .leftJoin("tour_time_slots", "tours.id", "tour_time_slots.tour_id")
        .leftJoin("images", "tours.id", "images.tour_id")
        .leftJoin("highlights", "tours.id", "highlights.tour_id")
        .leftJoin(
          "tour_availabilities",
          "tours.id",
          "tour_availabilities.tour_id"
        )
        .leftJoin(
          "tour_recurring_unavailabilities",
          "tours.id",
          "tour_recurring_unavailabilities.tour_id"
        )
        .leftJoin(
          "tour_unavailable_dates",
          "tours.id",
          "tour_unavailable_dates.tour_id"
        )
        .where("tours.id", "=", id);

      const result = tours.reduce(
        (acc, row) => {
          if (!acc.tour_itinerary_coordinates)
            acc.tour_itinerary_coordinates = [];
          if (!acc.tour_time_slots) acc.tour_time_slots = [];
          if (!acc.images) acc.images = new Set();
          if (!acc.highlights) acc.highlights = new Set();
          if (!acc.unavailable_dates) acc.unavailable_dates = new Set();
          if (!acc.unavailable_recurring_day_of_week)
            acc.unavailable_recurring_day_of_week = new Set();
          if (!acc.unavailable_recurring_reason)
            acc.unavailable_recurring_reason = new Set();

          if (
            row.itinerary_id &&
            !acc.tour_itinerary_coordinates.some(
              (item) => item.id === row.itinerary_id
            )
          ) {
            acc.tour_itinerary_coordinates.push({
              id: row.itinerary_id,
              order: row.itinerary_order,
              latitude: row.itinerary_latitude,
              longitude: row.itinerary_longitude,
              name: row.itinerary_name,
            });
          }

          if (
            row.time_slot_id &&
            !acc.tour_time_slots.some((item) => item.id === row.time_slot_id)
          ) {
            acc.tour_time_slots.push({
              id: row.time_slot_id,
              start_time: row.time_slot_start_time,
              end_time: row.time_slot_end_time,
            });
          }

          if (row.image_path) acc.images.add(row.image_path);
          if (row.highlight) acc.highlights.add(row.highlight);
          if (row.unavailable_date)
            acc.unavailable_dates.add(row.unavailable_date);
          if (row.unavailable_recurring_day_of_week)
            acc.unavailable_recurring_day_of_week.add(
              row.unavailable_recurring_day_of_week
            );
          if (row.unavailable_recurring_reason)
            acc.unavailable_recurring_reason.add(
              row.unavailable_recurring_reason
            );

          if (row.available_start_date)
            acc.available_start_date = row.available_start_date;
          if (row.available_end_date)
            acc.available_end_date = row.available_end_date;

          return acc;
        },
        { ...tour }
      );

      const finalResult = {
        ...result,
        tour_itinerary_coordinates: result.tour_itinerary_coordinates,
        tour_time_slots: result.tour_time_slots,
        images: [...result.images],
        highlights: [...result.highlights],
        unavailable_dates: [...result.unavailable_dates],
        unavailable_recurring_day_of_week: [
          ...result.unavailable_recurring_day_of_week,
        ],
        unavailable_recurring_reason: [...result.unavailable_recurring_reason],
      };

      res.status(200).json(finalResult);
    } catch (error) {
      console.error("Error fetching tour:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  const getToursByIds = async (req, res) => {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ message: "No tour IDs provided" });
    }

    try {
      const idsArray = ids.split(",").map(Number);

      const detailedTours = await knex("tours")
        .select("tours.*", "images.image_path", "highlights.highlight")
        .leftJoin("images", "tours.id", "=", "images.tour_id")
        .leftJoin("highlights", "tours.id", "=", "highlights.tour_id")
        .whereIn("tours.id", idsArray);

      const groupedTours = detailedTours.reduce((acc, tour) => {
        const { id, image_path, highlight } = tour;

        if (!acc[id]) {
          acc[id] = {
            ...tour,
            images: [],
            highlights: [],
          };
        }

        if (image_path && !acc[id].images.includes(image_path)) {
          acc[id].images.push(image_path);
        }

        if (highlight && !acc[id].highlights.includes(highlight)) {
          acc[id].highlights.push(highlight);
        }

        return acc;
      }, {});

      const finalResult = Object.values(groupedTours);

      res.status(200).json(finalResult);
    } catch (error) {
      console.error("Error fetching tours by IDs:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  ////////////////////////////////////////////////////////////////

  const editTour = async (req, res) => {
    const { slug } = req.params;
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
  router.get("/specific-tours", getToursByIds);
  router.post("/", upload.array("images"), addTour);
  router.get("/:slug", getTourBySlug);
  router.put("/:slug", editTour);

  return router;
}
