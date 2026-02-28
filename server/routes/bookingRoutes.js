import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import "dotenv/config";

const knex = initKnex(knexConfig["development"]);
const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const {
      limit = 20,
      page = 1,
      search,
      status,
      dateFrom,
      dateTo,
    } = req.query;
    const pageSize = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const offset = (pageNumber - 1) * pageSize;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const validDateFrom =
      dateFrom && dateRegex.test(dateFrom) && !isNaN(Date.parse(dateFrom))
        ? dateFrom
        : undefined;
    const validDateTo =
      dateTo && dateRegex.test(dateTo) && !isNaN(Date.parse(dateTo))
        ? dateTo
        : undefined;
    const validStatuses = ["confirmed", "pending", "cancelled"];
    const validStatus = validStatuses.includes(status) ? status : undefined;
    const validSearch =
      typeof search === "string" ? search.trim().slice(0, 100) : undefined;

    let query = knex("bookings")
      .leftJoin("tours", "bookings.tour_id", "tours.id")
      .leftJoin(
        "tour_time_slots",
        "bookings.time_slot_id",
        "tour_time_slots.id"
      )
      .leftJoin(
        "booking_assignments",
        "bookings.id",
        "booking_assignments.booking_id"
      )
      .leftJoin("employees", "booking_assignments.guide_id", "employees.id")
      .select([
        "bookings.*",
        "tours.tour_name",
        knex.raw(
          "COALESCE(employees.first_name || ' ' || employees.last_name, 'Unassigned') as guide_name"
        ),
        knex.raw(
          `(SELECT amount FROM booking_payments WHERE booking_id = bookings.id LIMIT 1) as total_price`
        ),
        knex.raw(
          `(SELECT COALESCE(SUM(amount), 0) FROM booking_payments WHERE booking_id = bookings.id) as amount_paid`
        ),
        knex.raw(`(SELECT COALESCE(adults, 0) + COALESCE(children, 0) + COALESCE(infants, 0) 
                   FROM booking_guests WHERE booking_id = bookings.id) as total_guests`),
        knex.raw(
          "COALESCE(bookings.start_time, tour_time_slots.start_time) as display_start_time"
        ),
        knex.raw(
          "COALESCE(bookings.end_time, tour_time_slots.end_time) as display_end_time"
        ),
      ]);

    let countQuery = knex("bookings")
      .leftJoin("tours", "bookings.tour_id", "tours.id")
      .count("bookings.id as count");

    if (validDateFrom) {
      query.where("bookings.created_at", ">=", dateFrom);
      countQuery.where("bookings.created_at", ">=", dateFrom);
    }

    if (validDateTo) {
      query.where("bookings.booking_date", "<=", validDateTo);
      countQuery.where("bookings.booking_date", "<=", validDateTo);
    }

    if (validStatus) {
      query.where("bookings.status", status);
      countQuery.where("bookings.status", status);
    }

    if (validSearch) {
      const applySearch = function () {
        this.where("bookings.primary_contact_name", "ilike", `%${search}%`)
          .orWhere("bookings.booking_reference", "ilike", `%${search}%`)
          .orWhere("tours.tour_name", "ilike", `%${search}%`);
      };
      query.where(applySearch);
      countQuery.where(applySearch);
    }

    query
      .orderBy("bookings.created_at", "desc")
      .orderBy("bookings.id", "desc")
      .limit(pageSize)
      .offset(offset);

    const [results, [{ count }]] = await Promise.all([query, countQuery]);

    res.json({
      data: results,
      total: parseInt(count),
      page: pageNumber,
      limit: pageSize,
    });
  } catch (error) {
    console.error("Knex Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// router.get("/all", async (req, res) => {
//   try {
//     const { limit = 20, cursor, search, status } = req.query;
//     const pageSize = parseInt(limit);

//     let query = knex("bookings")
//       .leftJoin("tours", "bookings.tour_id", "tours.id")
//       .leftJoin(
//         "tour_time_slots",
//         "bookings.time_slot_id",
//         "tour_time_slots.id"
//       )
//       .leftJoin(
//         "booking_assignments",
//         "bookings.id",
//         "booking_assignments.booking_id"
//       )
//       .leftJoin("employees", "booking_assignments.guide_id", "employees.id")
//       .select([
//         "bookings.*",
//         "tours.tour_name",
//         knex.raw(
//           "COALESCE(employees.first_name || ' ' || employees.last_name, 'Unassigned') as guide_name"
//         ),

//         knex.raw(
//           `(SELECT amount FROM booking_payments WHERE booking_id = bookings.id LIMIT 1) as total_price`
//         ),

//         knex.raw(
//           `(SELECT COALESCE(SUM(amount), 0) FROM booking_payments WHERE booking_id = bookings.id) as amount_paid`
//         ),

//         knex.raw(`(SELECT COALESCE(adults, 0) + COALESCE(children, 0) + COALESCE(infants, 0)
//                    FROM booking_guests WHERE booking_id = bookings.id) as total_guests`),

//         knex.raw(
//           "COALESCE(bookings.start_time, tour_time_slots.start_time) as display_start_time"
//         ),
//         knex.raw(
//           "COALESCE(bookings.end_time, tour_time_slots.end_time) as display_end_time"
//         ),
//       ]);

//     if (status) query.where("bookings.status", status);
//     if (search) {
//       query.where(function () {
//         this.where("bookings.primary_contact_name", "ilike", `%${search}%`)
//           .orWhere("bookings.booking_reference", "ilike", `%${search}%`)
//           .orWhere("tours.tour_name", "ilike", `%${search}%`);
//       });
//     }

//     if (cursor) {
//       const lastItem = JSON.parse(Buffer.from(cursor, "base64").toString());
//       query.where(function () {
//         this.where("bookings.created_at", "<", lastItem.created_at).orWhere(
//           function () {
//             this.where(
//               "bookings.created_at",
//               "=",
//               lastItem.created_at
//             ).andWhere("bookings.id", "<", lastItem.id);
//           }
//         );
//       });
//     }

//     query
//       .orderBy("bookings.created_at", "desc")
//       .orderBy("bookings.id", "desc")
//       .limit(pageSize);

//     const results = await query;

//     let nextCursor = null;
//     if (results.length === pageSize) {
//       const last = results[results.length - 1];
//       nextCursor = Buffer.from(
//         JSON.stringify({
//           created_at: last.created_at,
//           id: last.id,
//         })
//       ).toString("base64");
//     }

//     res.json({ data: results, nextCursor });
//   } catch (error) {
//     console.error("Knex Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await knex("bookings")
      .leftJoin("tours", "bookings.tour_id", "tours.id")
      .leftJoin(
        "tour_time_slots",
        "bookings.time_slot_id",
        "tour_time_slots.id"
      )
      .leftJoin(
        "booking_assignments",
        "bookings.id",
        "booking_assignments.booking_id"
      )
      .leftJoin("employees", "booking_assignments.guide_id", "employees.id")
      .select([
        "bookings.*",
        "tours.tour_name",
        "tours.duration as tour_duration",
        knex.raw(
          "COALESCE(employees.first_name || ' ' || employees.last_name, 'Unassigned') as guide_name"
        ),
        "employees.phone as guide_phone",
        "employees.profile_image as guide_image",

        knex.raw(`(SELECT json_build_object(
          'adults', COALESCE(adults, 0), 
          'children', COALESCE(children, 0), 
          'infants', COALESCE(infants, 0)
        ) FROM booking_guests WHERE booking_id = bookings.id) as guest_distribution`),

        knex.raw(
          `(SELECT COALESCE(SUM(amount), 0) FROM booking_payments WHERE booking_id = bookings.id) as amount_paid`
        ),

        knex.raw(
          "COALESCE(bookings.start_time, tour_time_slots.start_time) as display_start_time"
        ),
        knex.raw(
          "COALESCE(bookings.end_time, tour_time_slots.end_time) as display_end_time"
        ),
      ])
      .where("bookings.id", id)
      .first();

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const guestNames = await knex("booking_guest_names")
      .where("booking_id", id)
      .select("full_name");

    const payments = await knex("booking_payments")
      .where("booking_id", id)
      .orderBy("created_at", "desc");

    res.json({
      ...booking,
      guest_list: guestNames,
      payment_history: payments,
    });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

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
