import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import { requireRole } from "../middleware/auth.js";
import "dotenv/config";

const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
const router = express.Router();

const logTourActivity = async (tourId, action, message, actorId = null) => {
  try {
    await knex("tour_activity_log").insert({
      tour_id: tourId,
      action,
      message,
      actor_id: actorId,
    });
  } catch (err) {
    console.error("Tour activity log failed:", err);
  }
};

router.get("/", async (req, res) => {
  const { page = 1, limit = 12, search, category, status } = req.query;
  const offset = (page - 1) * limit;
  try {
    let baseQuery = knex("tours");
    if (search)
      baseQuery = baseQuery.where("tour_name", "ilike", `%${search}%`);
    if (category && category !== "all")
      baseQuery = baseQuery.where("category", category);
    if (status) baseQuery = baseQuery.where("status", status);

    const totalResult = await baseQuery
      .clone()
      .countDistinct("tours.id as count")
      .first();
    const total = parseInt(totalResult.count);

    const tours = await baseQuery
      .clone()
      .select("tours.*")
      .offset(offset)
      .limit(limit)
      .orderBy("tours.id");
    const tourIds = tours.map((t) => t.id);

    if (tourIds.length === 0) {
      return res.json({
        data: [],
        currentPage: Number(page),
        totalPages: 0,
        total: 0,
      });
    }

    const detailed = await knex("tours")
      .select("tours.*", "images.image_path", "highlights.highlight")
      .leftJoin("images", "tours.id", "images.tour_id")
      .leftJoin("highlights", "tours.id", "highlights.tour_id")
      .whereIn("tours.id", tourIds)
      .orderBy("tours.id")
      .orderBy("images.id", "asc");

    const grouped = detailed.reduce((acc, row) => {
      const { id, image_path, highlight } = row;
      if (!acc[id]) acc[id] = { ...row, images: [], highlights: [] };
      if (image_path && !acc[id].images.includes(image_path))
        acc[id].images.push(image_path);
      if (highlight && !acc[id].highlights.includes(highlight))
        acc[id].highlights.push(highlight);
      return acc;
    }, {});

    res.json({
      data: Object.values(grouped),
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/simple", async (req, res) => {
  try {
    const tours = await knex("tours")
      .select("id", "tour_name", "duration", "price", "category", "slug")
      .orderBy("tour_name");
    res.json({ data: tours });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/time-slots", async (req, res) => {
  try {
    const slots = await knex("tour_time_slots")
      .select("id", "tour_id", "start_time", "end_time")
      .orderBy("tour_id")
      .orderBy("start_time");
    res.json({ data: slots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/specific-tours", async (req, res) => {
  const { ids } = req.query;
  if (!ids) return res.status(400).json({ message: "No tour IDs provided" });
  try {
    const idsArray = ids.split(",").map(Number);
    const detailed = await knex("tours")
      .select("tours.*", "images.image_path", "highlights.highlight")
      .leftJoin("images", "tours.id", "images.tour_id")
      .leftJoin("highlights", "tours.id", "highlights.tour_id")
      .whereIn("tours.id", idsArray);

    const grouped = detailed.reduce((acc, row) => {
      const { id, image_path, highlight } = row;
      if (!acc[id]) acc[id] = { ...row, images: [], highlights: [] };
      if (image_path && !acc[id].images.includes(image_path))
        acc[id].images.push(image_path);
      if (highlight && !acc[id].highlights.includes(highlight))
        acc[id].highlights.push(highlight);
      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const tour = await knex("tours").where({ slug }).first();
    if (!tour) return res.status(404).json({ message: "Tour not found" });

    const rows = await knex("tours")
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
        "tour_unavailable_dates.unavailable_date"
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
        "tour_unavailable_dates",
        "tours.id",
        "tour_unavailable_dates.tour_id"
      )
      .where("tours.id", tour.id);

    const result = rows.reduce(
      (acc, row) => {
        if (!acc.tour_itinerary_coordinates)
          acc.tour_itinerary_coordinates = [];
        if (!acc.tour_time_slots) acc.tour_time_slots = [];
        if (!acc.images) acc.images = new Set();
        if (!acc.highlights) acc.highlights = new Set();
        if (!acc.unavailable_dates) acc.unavailable_dates = new Set();

        if (
          row.itinerary_id &&
          !acc.tour_itinerary_coordinates.some((i) => i.id === row.itinerary_id)
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
          !acc.tour_time_slots.some((s) => s.id === row.time_slot_id)
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

        return acc;
      },
      { ...tour }
    );

    const settings = await knex("company_settings").first();
    const bookingWindowMonths = settings?.booking_window_months ?? 6;

    const agencyUnavailableDates = await knex("agency_unavailable_dates")
      .pluck("unavailable_date")
      .then((dates) =>
        dates.map((d) => {
          const date = new Date(d);
          return date.toISOString().split("T")[0];
        })
      );

    const agencyRecurringDays = await knex(
      "agency_recurring_unavailabilities"
    ).pluck("day_of_week");

    const tourRecurringDays = await knex("tour_recurring_unavailabilities")
      .where("tour_id", tour.id)
      .pluck("day_of_week");

    res.json({
      ...result,
      images: [...result.images],
      highlights: [...result.highlights],
      unavailable_dates: [...result.unavailable_dates],
      unavailable_recurring_day_of_week: tourRecurringDays,
      booking_window_months: bookingWindowMonths,
      agency_unavailable_dates: agencyUnavailableDates,
      agency_recurring_days: agencyRecurringDays,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/:slug/activity", async (req, res) => {
  try {
    const tour = await knex("tours").where({ slug: req.params.slug }).first();
    if (!tour) return res.status(404).json({ message: "Tour not found" });

    const logs = await knex("tour_activity_log")
      .leftJoin("employees", "tour_activity_log.actor_id", "employees.id")
      .where("tour_activity_log.tour_id", tour.id)
      .select(
        "tour_activity_log.*",
        knex.raw(
          "employees.first_name || ' ' || employees.last_name as actor_name"
        )
      )
      .orderBy("tour_activity_log.created_at", "desc")
      .limit(50);

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch activity log" });
  }
});

router.post("/", requireRole("admin", "manager"), async (req, res) => {
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
    essentials,
    includes,
    accessibility,
    highlights,
    images,
    time_slots,
    itinerary,
    best_seller = false,
    featured = false,
    actor_id,
  } = req.body;

  if (!tour_name || !price || !duration || !category) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const generatedSlug =
    slug ||
    tour_name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  try {
    const existing = await knex("tours").where({ slug: generatedSlug }).first();
    if (existing)
      return res
        .status(409)
        .json({ message: "A tour with this name already exists" });

    const [tour] = await knex("tours")
      .insert({
        tour_name,
        price,
        duration,
        slug: generatedSlug,
        activity_level,
        category,
        overview_title,
        overview,
        landmarks,
        groups,
        minimum_of_attendees,
        additional_costs,
        essentials,
        includes,
        best_seller,
        featured,
        accessibility: Array.isArray(accessibility)
          ? accessibility.join(", ")
          : accessibility ?? "",
        status: req.body.status ?? "draft",
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      })
      .returning("*");

    if (images?.length) {
      await knex("images").insert(
        images.map((url) => ({ tour_id: tour.id, image_path: url }))
      );
    }
    if (highlights?.length) {
      await knex("highlights").insert(
        highlights
          .filter(Boolean)
          .map((h) => ({ tour_id: tour.id, highlight: h }))
      );
    }
    if (time_slots?.length) {
      await knex("tour_time_slots").insert(
        time_slots.map((s) => ({
          tour_id: tour.id,
          start_time: s.start_time,
          end_time: s.end_time,
        }))
      );
    }
    if (itinerary?.length) {
      await knex("tour_itinerary_coordinates").insert(
        itinerary.map((p, i) => ({
          tour_id: tour.id,
          order: i + 1,
          name: p.name,
          latitude: p.latitude,
          longitude: p.longitude,
        }))
      );
    }

    await logTourActivity(
      tour.id,
      "created",
      `Tour "${tour_name}" created`,
      actor_id ?? null
    );
    res.status(201).json({ message: "Tour created successfully", tour });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add tour", error: err.message });
  }
});

router.patch("/:slug", requireRole("admin", "manager"), async (req, res) => {
  const { slug } = req.params;
  try {
    const tour = await knex("tours").where({ slug }).first();
    if (!tour) return res.status(404).json({ message: "Tour not found" });

    const fields = [
      "tour_name",
      "price",
      "duration",
      "activity_level",
      "category",
      "overview_title",
      "overview",
      "landmarks",
      "groups",
      "minimum_of_attendees",
      "additional_costs",
      "essentials",
      "includes",
      "best_seller",
      "featured",
      "status",
    ];

    const updates = {};
    for (const f of fields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }
    if (req.body.accessibility !== undefined) {
      updates.accessibility = Array.isArray(req.body.accessibility)
        ? req.body.accessibility.join(", ")
        : req.body.accessibility;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    updates.updated_at = knex.fn.now();
    await knex("tours").where({ slug }).update(updates);

    const changed = Object.keys(updates).filter((k) => k !== "updated_at");
    const summary = changed
      .map((k) => {
        if (k === "price") return `price changed to €${updates[k]}`;
        if (k === "best_seller")
          return `bestseller ${updates[k] ? "enabled" : "disabled"}`;
        if (k === "featured")
          return `featured ${updates[k] ? "enabled" : "disabled"}`;
        if (k === "status") return `status changed to ${updates[k]}`;
        if (k === "tour_name") return `name changed to "${updates[k]}"`;
        return `${k} updated`;
      })
      .join(", ");

    await logTourActivity(
      tour.id,
      "edit",
      `Tour updated — ${summary}`,
      req.body.actor_id ?? null
    );

    const updated = await knex("tours").where({ slug }).first();
    res.json({ message: "Tour updated successfully!", tour: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update tour" });
  }
});

router.put(
  "/:slug/images",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const { slug } = req.params;
      const { images } = req.body;
      const tour = await knex("tours").where({ slug }).first();
      if (!tour) return res.status(404).json({ message: "Tour not found" });

      await knex("images").where({ tour_id: tour.id }).del();
      if (images?.length) {
        await knex("images").insert(
          images.map((url) => ({ tour_id: tour.id, image_path: url }))
        );
      }
      await logTourActivity(
        tour.id,
        "images",
        `Images updated (${images?.length ?? 0} images)`
      );
      res.json({ message: "Images updated" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update images" });
    }
  }
);

router.put(
  "/:slug/highlights",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const { slug } = req.params;
      const { highlights } = req.body;
      const tour = await knex("tours").where({ slug }).first();
      if (!tour) return res.status(404).json({ message: "Tour not found" });

      await knex("highlights").where({ tour_id: tour.id }).del();
      if (highlights?.length) {
        await knex("highlights").insert(
          highlights
            .filter(Boolean)
            .map((h) => ({ tour_id: tour.id, highlight: h }))
        );
      }
      await logTourActivity(
        tour.id,
        "highlights",
        `Highlights updated (${highlights?.length ?? 0} highlights)`
      );
      res.json({ message: "Highlights updated" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update highlights" });
    }
  }
);

router.put(
  "/:slug/time-slots",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const { slug } = req.params;
      const { time_slots } = req.body;
      const tour = await knex("tours").where({ slug }).first();
      if (!tour) return res.status(404).json({ message: "Tour not found" });

      const referencedIds = await knex("bookings")
        .where("tour_id", tour.id)
        .whereNotNull("time_slot_id")
        .pluck("time_slot_id");

      const existingSlots = await knex("tour_time_slots").where(
        "tour_id",
        tour.id
      );

      for (const slot of time_slots) {
        const exists = existingSlots.some(
          (s) =>
            s.start_time.slice(0, 5) === slot.start_time.slice(0, 5) &&
            s.end_time.slice(0, 5) === slot.end_time.slice(0, 5)
        );
        if (!exists) {
          await knex("tour_time_slots").insert({
            tour_id: tour.id,
            start_time: slot.start_time,
            end_time: slot.end_time,
          });
        }
      }

      for (const existing of existingSlots) {
        const stillWanted = time_slots.some(
          (s) =>
            s.start_time.slice(0, 5) === existing.start_time.slice(0, 5) &&
            s.end_time.slice(0, 5) === existing.end_time.slice(0, 5)
        );
        if (!stillWanted && !referencedIds.includes(existing.id)) {
          await knex("tour_time_slots").where("id", existing.id).del();
        }
      }

      await logTourActivity(tour.id, "schedule", "Time slots updated");
      const updated = await knex("tour_time_slots").where("tour_id", tour.id);
      res.json({ message: "Time slots updated", time_slots: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update time slots" });
    }
  }
);

router.put(
  "/:slug/itinerary",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const { slug } = req.params;
      const { itinerary } = req.body;
      const tour = await knex("tours").where({ slug }).first();
      if (!tour) return res.status(404).json({ message: "Tour not found" });

      await knex("tour_itinerary_coordinates")
        .where({ tour_id: tour.id })
        .del();
      if (itinerary?.length) {
        await knex("tour_itinerary_coordinates").insert(
          itinerary.map((p, i) => ({
            tour_id: tour.id,
            order: i + 1,
            name: p.name,
            latitude: p.latitude,
            longitude: p.longitude,
          }))
        );
      }
      await logTourActivity(
        tour.id,
        "itinerary",
        `Itinerary updated (${itinerary?.length ?? 0} stops)`
      );
      res.json({ message: "Itinerary updated" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update itinerary" });
    }
  }
);

router.get("/:slug/unavailable-dates", async (req, res) => {
  try {
    const tour = await knex("tours").where({ slug: req.params.slug }).first();
    if (!tour) return res.status(404).json({ message: "Tour not found" });

    const specific = await knex("tour_unavailable_dates")
      .where("tour_id", tour.id)
      .orderBy("unavailable_date");

    const recurring = await knex("tour_recurring_unavailabilities")
      .where("tour_id", tour.id)
      .orderBy("day_of_week");

    res.json({ specific, recurring });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch unavailable dates" });
  }
});

router.post(
  "/:slug/unavailable-dates",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const tour = await knex("tours").where({ slug: req.params.slug }).first();
      if (!tour) return res.status(404).json({ message: "Tour not found" });

      const { date, reason } = req.body;
      if (!date) return res.status(400).json({ message: "Date is required" });

      const [record] = await knex("tour_unavailable_dates")
        .insert({
          tour_id: tour.id,
          unavailable_date: date,
          reason: reason || null,
        })
        .returning("*");

      res.status(201).json(record);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to add unavailable date" });
    }
  }
);

router.delete(
  "/:slug/unavailable-dates/:id",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      await knex("tour_unavailable_dates").where("id", req.params.id).del();
      res.json({ message: "Deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete" });
    }
  }
);

router.post(
  "/:slug/recurring-unavailabilities",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const tour = await knex("tours").where({ slug: req.params.slug }).first();
      if (!tour) return res.status(404).json({ message: "Tour not found" });

      const { day_of_week, reason } = req.body;
      if (day_of_week === undefined)
        return res.status(400).json({ message: "day_of_week is required" });

      const existing = await knex("tour_recurring_unavailabilities")
        .where({ tour_id: tour.id, day_of_week })
        .first();
      if (existing) return res.status(409).json({ message: "Already blocked" });

      const [record] = await knex("tour_recurring_unavailabilities")
        .insert({ tour_id: tour.id, day_of_week, reason: reason || null })
        .returning("*");

      res.status(201).json(record);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Failed to add recurring unavailability" });
    }
  }
);

router.delete(
  "/:slug/recurring-unavailabilities/:id",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      await knex("tour_recurring_unavailabilities")
        .where("id", req.params.id)
        .del();
      res.json({ message: "Deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete" });
    }
  }
);

export default router;
