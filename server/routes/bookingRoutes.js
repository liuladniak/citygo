import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import "dotenv/config";
import { requireRole } from "../middleware/auth.js";
import {
  sendBookingConfirmation,
  sendCancellationConfirmation,
  sendGuideAssignment,
  sendGuideUnassignment,
} from "../services/emailService.js";

const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
const router = express.Router();
const VALID_STATUSES = [
  "draft",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

const logActivity = async (
  bookingId,
  action,
  message,
  actorId = null,
  actorType = "system"
) => {
  try {
    await knex("booking_activity_log").insert({
      booking_id: bookingId,
      action,
      message,
      actor_type: actorType,
      actor_id: actorId,
    });
  } catch (err) {
    console.error("Activity log failed:", err);
  }
};

const getFullBooking = async (id) =>
  knex("bookings")
    .leftJoin("tours", "bookings.tour_id", "tours.id")
    .leftJoin("tour_time_slots", "bookings.time_slot_id", "tour_time_slots.id")
    .select([
      "bookings.*",
      "tours.tour_name",
      "tours.includes",
      "tours.essentials",
      knex.raw(
        "COALESCE(bookings.start_time, tour_time_slots.start_time) as display_start_time"
      ),
      knex.raw(
        "COALESCE(bookings.end_time, tour_time_slots.end_time) as display_end_time"
      ),
      knex.raw(`(SELECT COALESCE(adults,0)+COALESCE(children,0)+COALESCE(infants,0) 
                 FROM booking_guests WHERE booking_id = bookings.id) as total_guests`),
      knex.raw(`(SELECT json_agg(json_build_object('guide_name', e.first_name || ' ' || e.last_name))
                 FROM booking_assignments ba JOIN employees e ON ba.guide_id = e.id
                 WHERE ba.booking_id = bookings.id AND ba.status = 'active') as staff`),
    ])
    .where("bookings.id", id)
    .first();

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
    const validStatus = VALID_STATUSES.includes(status) ? status : undefined;
    const validSearch =
      typeof search === "string" ? search.trim().slice(0, 100) : undefined;

    let query = knex("bookings")
      .leftJoin("tours", "bookings.tour_id", "tours.id")
      .leftJoin(
        "tour_time_slots",
        "bookings.time_slot_id",
        "tour_time_slots.id"
      )
      .select([
        "bookings.*",
        "tours.tour_name",
        "bookings.total_price",
        knex.raw(`(SELECT json_agg(json_build_object(
          'guide_name', e.first_name || ' ' || e.last_name, 'role', ba.role))
          FROM booking_assignments ba JOIN employees e ON ba.guide_id = e.id
          WHERE ba.booking_id = bookings.id AND ba.status = 'active') as staff`),
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
      query.where("bookings.tour_date", ">=", validDateFrom);
      countQuery.where("bookings.tour_date", ">=", validDateFrom);
    }
    if (validDateTo) {
      query.where("bookings.tour_date", "<=", validDateTo);
      countQuery.where("bookings.tour_date", "<=", validDateTo);
    }
    if (validStatus) {
      query.where("bookings.status", validStatus);
      countQuery.where("bookings.status", validStatus);
    }
    if (validSearch) {
      const applySearch = function () {
        this.where("bookings.primary_contact_name", "ilike", `%${validSearch}%`)
          .orWhere("bookings.booking_reference", "ilike", `%${validSearch}%`)
          .orWhere("tours.tour_name", "ilike", `%${validSearch}%`);
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

router.get("/stats/dashboard", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toTimeString().slice(0, 8);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthDate = lastMonth.toISOString().split("T")[0];

    const [
      toursTodayResult,
      guestsTodayResult,
      runningResult,
      revenueTodayResult,
      expectedRevenueResult,
      urgentTasksResult,
      unpaidResult,
      lastMonthToursResult,
    ] = await Promise.all([
      knex("bookings")
        .whereRaw("DATE(tour_date) = ?", [today])
        .whereIn("status", ["confirmed", "pending"])
        .count("* as count")
        .first(),
      knex
        .raw(
          `SELECT COALESCE(SUM(bg.adults + bg.children + bg.infants), 0) as total
        FROM bookings b JOIN booking_guests bg ON bg.booking_id = b.id
        WHERE DATE(b.tour_date) = ? AND b.status IN ('confirmed', 'pending')`,
          [today]
        )
        .then((r) => r.rows[0]),
      knex("bookings")
        .whereRaw("DATE(tour_date) = ?", [today])
        .whereRaw("start_time <= ? AND end_time >= ?", [
          currentTime,
          currentTime,
        ])
        .whereIn("status", ["confirmed", "pending"])
        .count("* as count")
        .first(),
      knex("booking_payments")
        .join("bookings", "booking_payments.booking_id", "bookings.id")
        .whereRaw("DATE(bookings.tour_date) = ?", [today])
        .where("booking_payments.status", "paid")
        .sum("booking_payments.amount as total")
        .first(),
      knex("bookings")
        .whereRaw("DATE(tour_date) = ?", [today])
        .whereIn("status", ["confirmed", "pending"])
        .sum("total_price as total")
        .first(),
      knex("tasks")
        .where("priority", "urgent")
        .where("status", "open")
        .count("* as count")
        .first(),
      knex("bookings")
        .whereRaw("tour_date >= ?", [today])
        .whereIn("status", ["confirmed", "pending"])
        .whereRaw(
          `(SELECT COALESCE(SUM(amount), 0) FROM booking_payments WHERE booking_id = bookings.id) < total_price`
        )
        .count("* as count")
        .first(),
      knex("bookings")
        .whereRaw("DATE(tour_date) = ?", [lastMonthDate])
        .whereIn("status", ["confirmed", "pending"])
        .count("* as count")
        .first(),
    ]);

    const toursToday = parseInt(toursTodayResult?.count ?? 0);
    const lastMonthTours = parseInt(lastMonthToursResult?.count ?? 0);
    const toursTrend =
      lastMonthTours > 0
        ? Math.round(((toursToday - lastMonthTours) / lastMonthTours) * 100)
        : 0;

    res.json({
      tours_today: toursToday,
      guests_today: parseInt(guestsTodayResult?.total ?? 0),
      currently_running: parseInt(runningResult?.count ?? 0),
      revenue_today: parseFloat(revenueTodayResult?.total ?? 0),
      expected_revenue_today: parseFloat(expectedRevenueResult?.total ?? 0),
      urgent_tasks: parseInt(urgentTasksResult?.count ?? 0),
      unpaid_bookings: parseInt(unpaidResult?.count ?? 0),
      tours_trend: toursTrend,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

router.get(
  "/stats/analytics",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const { dateFrom, dateTo } = req.query;
      const from = dateFrom || "2024-01-01";
      const to = dateTo || new Date().toISOString().split("T")[0];

      const [
        revenueResult,
        bookingsResult,
        cancellationsResult,
        totalBookingsResult,
        avgGroupResult,
        revenueOverTime,
        bookingsByTour,
        bookingsBySource,
        popularTimeSlots,
        revenuePerGuide,
        currentMonth,
        lastMonth,
      ] = await Promise.all([
        knex("booking_payments")
          .join("bookings", "booking_payments.booking_id", "bookings.id")
          .whereRaw("DATE(bookings.tour_date) BETWEEN ? AND ?", [from, to])
          .whereNotIn("bookings.status", ["cancelled"])
          .where("booking_payments.status", "paid")
          .where("booking_payments.amount", ">", 0)
          .sum("booking_payments.amount as total")
          .first(),
        knex("bookings")
          .whereRaw("DATE(tour_date) BETWEEN ? AND ?", [from, to])
          .whereNotIn("status", ["cancelled"])
          .count("* as count")
          .first(),
        knex("bookings")
          .whereRaw("DATE(tour_date) BETWEEN ? AND ?", [from, to])
          .where("status", "cancelled")
          .count("* as count")
          .first(),
        knex("bookings")
          .whereRaw("DATE(tour_date) BETWEEN ? AND ?", [from, to])
          .count("* as count")
          .first(),
        knex
          .raw(
            `SELECT AVG(bg.adults + bg.children + bg.infants) as avg
        FROM bookings b JOIN booking_guests bg ON bg.booking_id = b.id
        WHERE DATE(b.tour_date) BETWEEN ? AND ? AND b.status NOT IN ('cancelled')`,
            [from, to]
          )
          .then((r) => r.rows[0]),
        knex("booking_payments")
          .join("bookings", "booking_payments.booking_id", "bookings.id")
          .whereRaw("DATE(bookings.tour_date) BETWEEN ? AND ?", [from, to])
          .whereNotIn("bookings.status", ["cancelled"])
          .where("booking_payments.status", "paid")
          .where("booking_payments.amount", ">", 0)
          .select(
            knex.raw(
              "TO_CHAR(DATE_TRUNC('month', bookings.tour_date), 'Mon YYYY') as month"
            ),
            knex.raw("DATE_TRUNC('month', bookings.tour_date) as month_date"),
            knex.raw("SUM(booking_payments.amount) as revenue"),
            knex.raw("COUNT(DISTINCT bookings.id) as bookings")
          )
          .groupByRaw("DATE_TRUNC('month', bookings.tour_date)")
          .orderByRaw("DATE_TRUNC('month', bookings.tour_date)"),
        knex("bookings")
          .leftJoin("tours", "bookings.tour_id", "tours.id")
          .whereRaw("DATE(bookings.tour_date) BETWEEN ? AND ?", [from, to])
          .whereNotIn("bookings.status", ["cancelled"])
          .select(
            knex.raw("COALESCE(tours.tour_name, 'Custom Tour') as tour_name"),
            knex.raw("COUNT(*) as bookings"),
            knex.raw("SUM(bookings.total_price) as revenue")
          )
          .groupBy("tours.tour_name")
          .orderBy("bookings", "desc")
          .limit(10),
        knex("bookings")
          .whereRaw("DATE(tour_date) BETWEEN ? AND ?", [from, to])
          .whereNotIn("status", ["cancelled"])
          .select("source")
          .count("* as count")
          .groupBy("source")
          .orderBy("count", "desc"),
        knex("bookings")
          .join(
            "tour_time_slots",
            "bookings.time_slot_id",
            "tour_time_slots.id"
          )
          .whereRaw("DATE(bookings.tour_date) BETWEEN ? AND ?", [from, to])
          .whereNotIn("bookings.status", ["cancelled"])
          .select(
            knex.raw(
              "tour_time_slots.start_time || ' – ' || tour_time_slots.end_time as slot"
            ),
            knex.raw("COUNT(*) as bookings")
          )
          .groupByRaw("tour_time_slots.start_time, tour_time_slots.end_time")
          .orderBy("bookings", "desc")
          .limit(8),
        knex("booking_assignments")
          .join("bookings", "booking_assignments.booking_id", "bookings.id")
          .join("employees", "booking_assignments.guide_id", "employees.id")
          .join(
            "booking_payments",
            "booking_payments.booking_id",
            "bookings.id"
          )
          .whereRaw("DATE(bookings.tour_date) BETWEEN ? AND ?", [from, to])
          .whereNotIn("bookings.status", ["cancelled"])
          .where("booking_assignments.status", "active")
          .where("booking_assignments.role", "lead_guide")
          .where("booking_payments.status", "paid")
          .where("booking_payments.amount", ">", 0)
          .select(
            knex.raw(
              "employees.first_name || ' ' || employees.last_name as guide_name"
            ),
            "employees.position",
            knex.raw("COUNT(DISTINCT bookings.id) as tours_led"),
            knex.raw("SUM(booking_payments.amount) as revenue")
          )
          .groupBy(
            "employees.id",
            "employees.first_name",
            "employees.last_name",
            "employees.position"
          )
          .orderBy("revenue", "desc")
          .limit(10),
        knex("bookings")
          .whereRaw(
            "DATE_TRUNC('month', tour_date) = DATE_TRUNC('month', CURRENT_DATE)"
          )
          .whereNotIn("status", ["cancelled"])
          .count("* as count")
          .sum("total_price as revenue")
          .first(),
        knex("bookings")
          .whereRaw(
            "DATE_TRUNC('month', tour_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')"
          )
          .whereNotIn("status", ["cancelled"])
          .count("* as count")
          .sum("total_price as revenue")
          .first(),
      ]);

      const totalBookings = parseInt(totalBookingsResult?.count ?? 0);
      const cancelled = parseInt(cancellationsResult?.count ?? 0);
      const cancellationRate =
        totalBookings > 0 ? Math.round((cancelled / totalBookings) * 100) : 0;
      const currentRevenue = parseFloat(currentMonth?.revenue ?? 0);
      const lastRevenue = parseFloat(lastMonth?.revenue ?? 0);
      const revenueGrowth =
        lastRevenue > 0
          ? Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100)
          : 0;
      const currentBookings = parseInt(currentMonth?.count ?? 0);
      const lastBookings = parseInt(lastMonth?.count ?? 0);
      const bookingsGrowth =
        lastBookings > 0
          ? Math.round(((currentBookings - lastBookings) / lastBookings) * 100)
          : 0;

      res.json({
        kpis: {
          total_revenue: parseFloat(revenueResult?.total ?? 0),
          total_bookings: parseInt(bookingsResult?.count ?? 0),
          cancellation_rate: cancellationRate,
          avg_group_size:
            Math.round(parseFloat(avgGroupResult?.avg ?? 0) * 10) / 10,
        },
        mom_growth: {
          revenue_growth: revenueGrowth,
          bookings_growth: bookingsGrowth,
          current_month_revenue: currentRevenue,
          last_month_revenue: lastRevenue,
        },
        revenue_over_time: revenueOverTime,
        bookings_by_tour: bookingsByTour,
        bookings_by_source: bookingsBySource,
        popular_time_slots: popularTimeSlots,
        revenue_per_guide: revenuePerGuide,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  }
);

router.get("/guests", requireRole("admin", "manager"), async (req, res) => {
  try {
    const { search, limit = 20, page = 1 } = req.query;
    const pageSize = Math.min(parseInt(limit) || 20, 100);
    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const offset = (pageNumber - 1) * pageSize;

    let query = knex("bookings")
      .select(
        "primary_contact_name",
        "primary_contact_email",
        "primary_contact_phone",
        knex.raw("COUNT(*) as total_bookings"),
        knex.raw(
          "COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_bookings"
        ),
        knex.raw(
          "SUM(total_price) FILTER (WHERE status != 'cancelled') as total_spend"
        ),
        knex.raw("MAX(tour_date) as last_booking_date"),
        knex.raw("MIN(tour_date) as first_booking_date"),
        knex.raw("array_agg(DISTINCT source) as sources"),
        knex.raw("array_agg(DISTINCT language) as languages")
      )
      .groupBy(
        "primary_contact_name",
        "primary_contact_email",
        "primary_contact_phone"
      )
      .orderByRaw("MAX(tour_date) DESC");

    if (search) {
      query = query.where(function () {
        this.where("primary_contact_name", "ilike", `%${search}%`)
          .orWhere("primary_contact_email", "ilike", `%${search}%`)
          .orWhere("primary_contact_phone", "ilike", `%${search}%`);
      });
    }

    const [results, countResult] = await Promise.all([
      query.limit(pageSize).offset(offset),
      knex("bookings").countDistinct("primary_contact_email as count").first(),
    ]);

    res.json({
      data: results,
      total: parseInt(countResult?.count ?? 0),
      page: pageNumber,
      limit: pageSize,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch guests" });
  }
});

router.get("/:id/assignments", async (req, res) => {
  try {
    const assignments = await knex("booking_assignments as ba")
      .join("employees as e", "ba.guide_id", "e.id")
      .where("ba.booking_id", req.params.id)
      .where("ba.status", "active")
      .select(
        "ba.id",
        "ba.guide_id",
        "ba.role",
        "ba.status",
        "ba.assigned_at",
        knex.raw("e.first_name || ' ' || e.last_name as guide_name"),
        "e.position",
        "e.profile_image"
      );
    res.json({ data: assignments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post(
  "/:id/assignments",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { guide_id, role } = req.body;

      if (!guide_id || !role)
        return res
          .status(400)
          .json({ error: "guide_id and role are required" });
      const validRoles = ["lead_guide", "assistant_guide", "driver"];
      if (!validRoles.includes(role))
        return res.status(400).json({ error: "Invalid role" });

      const booking = await knex("bookings").where("id", id).first();
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      const existing = await knex("booking_assignments")
        .where({ booking_id: id, guide_id, role, status: "active" })
        .first();
      if (existing)
        return res
          .status(409)
          .json({ error: "Guide already assigned with this role" });

      const [assignment] = await knex("booking_assignments")
        .insert({ booking_id: id, guide_id, role, status: "active" })
        .returning("*");
      await knex("bookings")
        .where({ id, is_custom_tour: true, status: "draft" })
        .update({ status: "confirmed" });

      const guide = await knex("employees")
        .where("id", guide_id)
        .select("first_name", "last_name", "email")
        .first();
      const roleLabel =
        {
          lead_guide: "Lead Guide",
          assistant_guide: "Assistant Guide",
          driver: "Driver",
        }[role] ?? role;

      await logActivity(
        id,
        "assignment",
        `${guide.first_name} ${
          guide.last_name
        } assigned as ${roleLabel} to booking ${
          booking.booking_reference ?? `#${id}`
        }`,
        null,
        "agent"
      );

      if (guide?.email) {
        const fullBooking = await getFullBooking(id);
        sendGuideAssignment({
          guideName: `${guide.first_name} ${guide.last_name}`,
          guideEmail: guide.email,
          booking: fullBooking,
          role,
        });
      }

      res.status(201).json({ data: assignment });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.delete(
  "/:id/assignments/:assignmentId",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const { id, assignmentId } = req.params;

      const assignment = await knex("booking_assignments as ba")
        .join("employees as e", "ba.guide_id", "e.id")
        .where("ba.id", assignmentId)
        .select(
          knex.raw("e.first_name || ' ' || e.last_name as guide_name"),
          "e.email as guide_email",
          "ba.role",
          "ba.guide_id"
        )
        .first();

      await knex("booking_assignments")
        .where("id", assignmentId)
        .update({ status: "cancelled" });

      if (assignment) {
        const roleLabel =
          {
            lead_guide: "Lead Guide",
            assistant_guide: "Assistant Guide",
            driver: "Driver",
          }[assignment.role] ?? assignment.role;
        await logActivity(
          id,
          "unassignment",
          `${assignment.guide_name} removed as ${roleLabel}`,
          null,
          "agent"
        );

        if (assignment.guide_email) {
          const fullBooking = await getFullBooking(id);
          sendGuideUnassignment({
            guideName: assignment.guide_name,
            guideEmail: assignment.guide_email,
            booking: fullBooking,
          });
        }
      }

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

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
      .select([
        "bookings.*",
        "tours.tour_name",
        "tours.duration as tour_duration",
        "bookings.total_price",
        knex.raw(
          `(SELECT COALESCE(SUM(amount), 0) FROM booking_payments WHERE booking_id = bookings.id) as amount_paid`
        ),
        knex.raw(`(SELECT json_agg(json_build_object('id', ba.id, 'guide_id', ba.guide_id, 'guide_name', e.first_name || ' ' || e.last_name, 'role', ba.role, 'profile_image', e.profile_image, 'phone', e.phone))
          FROM booking_assignments ba JOIN employees e ON ba.guide_id = e.id
          WHERE ba.booking_id = bookings.id AND ba.status = 'active') as staff`),
        knex.raw(`(SELECT json_build_object('adults', COALESCE(adults, 0), 'children', COALESCE(children, 0), 'infants', COALESCE(infants, 0))
          FROM booking_guests WHERE booking_id = bookings.id) as guest_distribution`),
        knex.raw(
          "COALESCE(bookings.start_time, tour_time_slots.start_time) as display_start_time"
        ),
        knex.raw(
          "COALESCE(bookings.end_time, tour_time_slots.end_time) as display_end_time"
        ),
      ])
      .where("bookings.id", id)
      .first();

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const [guestNames, payments] = await Promise.all([
      knex("booking_guest_names").where("booking_id", id).select("full_name"),
      knex("booking_payments")
        .where("booking_id", id)
        .orderBy("created_at", "desc"),
    ]);

    res.json({ ...booking, guest_list: guestNames, payment_history: payments });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId)
      return res.status(400).json({ message: "User ID is required" });

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

    res.json(
      bookings.map((b) => ({
        ...b,
        tour_images: imagesByTourId[b.tour_id] || [],
      }))
    );
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  const {
    user_id,
    tour_id,
    tour_date,
    time_slot_id,
    adults,
    children,
    infants,
    status,
  } = req.body;

  if (!user_id || !tour_id || !tour_date || !time_slot_id)
    return res.status(400).json({ message: "Required fields are missing" });

  try {
    await knex.transaction(async (trx) => {
      const [newBooking] = await trx("bookings")
        .insert({
          user_id,
          tour_id,
          tour_date,
          time_slot_id,
          status: status || "pending",
          source: "internal",
          primary_contact_name: req.user.name || "Guest",
          is_custom_tour: false,
          booking_reference: `MANUAL-${Date.now()}`,
        })
        .returning("id");

      await trx("booking_guests").insert({
        booking_id: newBooking.id,
        adults: adults || 1,
        children: children || 0,
        infants: infants || 0,
      });

      res
        .status(201)
        .json({ id: newBooking.id, message: "Booking created successfully" });
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/bulk", requireRole("admin", "manager"), async (req, res) => {
  const bookings = req.body;
  if (!Array.isArray(bookings) || bookings.length === 0)
    return res.status(400).json({ message: "No bookings provided" });
  if (bookings.some((b) => b.status && !VALID_STATUSES.includes(b.status)))
    return res
      .status(400)
      .json({ error: "One or more bookings have an invalid status" });

  try {
    const insertedIds = await knex("bookings").insert(bookings).returning("id");
    res.status(201).json({ message: "Bookings created", ids: insertedIds });
  } catch (error) {
    console.error("Error creating bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/admin", async (req, res) => {
  try {
    const {
      tour_id,
      is_custom_tour,
      tour_date,
      time_slot_id,
      start_time,
      end_time,
      meeting_point,
      primary_contact_name,
      primary_contact_email,
      primary_contact_phone,
      language,
      status,
      source,
      notes,
      total_price,
    } = req.body;

    if (!tour_date || !primary_contact_name || !status)
      return res.status(400).json({ error: "Missing required fields" });
    if (!VALID_STATUSES.includes(status))
      return res.status(400).json({ error: "Invalid status" });

    const [{ max }] = await knex("bookings").max("id as max");
    const booking_reference = `BK-${1000 + (max || 0) + 1}`;

    const [booking] = await knex("bookings")
      .insert({
        tour_id: tour_id || null,
        is_custom_tour: is_custom_tour || false,
        tour_date,
        time_slot_id: time_slot_id || null,
        start_time: start_time || null,
        end_time: end_time || null,
        meeting_point: meeting_point || null,
        primary_contact_name,
        primary_contact_email: primary_contact_email || null,
        primary_contact_phone: primary_contact_phone || null,
        language: language || "en",
        status,
        source: source || "admin_dashboard",
        notes: notes || null,
        booking_reference,
        total_price: is_custom_tour ? total_price || null : null,
      })
      .returning("*");

    await logActivity(
      booking.id,
      "booking",
      `New booking ${booking_reference} created for ${primary_contact_name}`,
      null,
      "agent"
    );
    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post(
  "/:id/guests",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { adults = 1, children = 0, infants = 0 } = req.body;

      await knex("booking_guests")
        .insert({ booking_id: id, adults, children, infants })
        .onConflict("booking_id")
        .merge();

      const booking = await knex("bookings").where("id", id).first();
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      if (!booking.is_custom_tour && booking.tour_id) {
        const tour = await knex("tours").where("id", booking.tour_id).first();
        if (tour) {
          const price = parseFloat(tour.price);
          await knex("bookings")
            .where("id", id)
            .update({ total_price: adults * price + children * (price * 0.5) });
        }
      }
      res.status(201).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.post(
  "/:id/guest-names",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const { names } = req.body;
      if (!Array.isArray(names) || names.length === 0)
        return res.status(400).json({ error: "names array is required" });
      await knex("booking_guest_names").insert(
        names.map((full_name) => ({ booking_id: req.params.id, full_name }))
      );
      res.status(201).json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tour_date,
      time_slot_id,
      start_time,
      end_time,
      meeting_point,
      primary_contact_name,
      primary_contact_email,
      primary_contact_phone,
      language,
      notes,
      source,
      status,
    } = req.body;

    const booking = await knex("bookings").where("id", id).first();
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (req.role === "associate") {
      const allowedFields = [
        "primary_contact_name",
        "primary_contact_email",
        "primary_contact_phone",
        "meeting_point",
        "notes",
        "language",
      ];
      const forbidden = Object.keys(req.body).filter(
        (k) => !allowedFields.includes(k)
      );
      if (forbidden.length > 0)
        return res
          .status(403)
          .json({ error: `Associates cannot update: ${forbidden.join(", ")}` });
    }

    const updates = {};
    if (tour_date !== undefined) updates.tour_date = tour_date;
    if (time_slot_id !== undefined) updates.time_slot_id = time_slot_id;
    if (start_time !== undefined) updates.start_time = start_time || null;
    if (end_time !== undefined) updates.end_time = end_time || null;
    if (meeting_point !== undefined)
      updates.meeting_point = meeting_point || null;
    if (primary_contact_name !== undefined)
      updates.primary_contact_name = primary_contact_name;
    if (primary_contact_email !== undefined)
      updates.primary_contact_email = primary_contact_email || null;
    if (primary_contact_phone !== undefined)
      updates.primary_contact_phone = primary_contact_phone || null;
    if (language !== undefined) updates.language = language;
    if (notes !== undefined) updates.notes = notes || null;
    if (source !== undefined) updates.source = source;
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status))
        return res.status(400).json({ error: "Invalid status" });
      updates.status = status;
    }

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ error: "No valid fields to update" });

    const [updated] = await knex("bookings")
      .where("id", id)
      .update(updates)
      .returning("*");
    const ref = booking.booking_reference ?? `#${id}`;

    if (status && status !== booking.status) {
      await logActivity(
        id,
        "booking",
        `Booking ${ref} status changed from ${booking.status} to ${status}`,
        null,
        "agent"
      );

      if (status === "confirmed" && updated?.primary_contact_email) {
        const fullBooking = await getFullBooking(id);
        sendBookingConfirmation(fullBooking);
      }
    }
    if (
      tour_date &&
      tour_date !== new Date(booking.tour_date).toISOString().split("T")[0]
    )
      await logActivity(
        id,
        "booking",
        `Booking date changed to ${new Date(tour_date).toLocaleDateString(
          "en-US",
          { month: "short", day: "numeric", year: "numeric" }
        )}`,
        null,
        "agent"
      );
    if (time_slot_id && time_slot_id !== booking.time_slot_id)
      await logActivity(
        id,
        "booking",
        `Time slot updated for booking ${ref}`,
        null,
        "agent"
      );
    if (
      primary_contact_name &&
      primary_contact_name !== booking.primary_contact_name
    )
      await logActivity(
        id,
        "booking",
        `Primary contact updated to ${primary_contact_name}`,
        null,
        "agent"
      );
    if (meeting_point && meeting_point !== booking.meeting_point)
      await logActivity(
        id,
        "booking",
        `Meeting point set to "${meeting_point}"`,
        null,
        "agent"
      );
    if (
      (start_time && start_time !== booking.start_time) ||
      (end_time && end_time !== booking.end_time)
    )
      await logActivity(
        id,
        "booking",
        `Tour time updated to ${start_time} – ${end_time}`,
        null,
        "agent"
      );

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch(
  "/:id/guests",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { adults, children, infants } = req.body;
      if (adults !== undefined && adults < 1)
        return res.status(400).json({ error: "At least 1 adult required" });

      const guestUpdates = {};
      if (adults !== undefined) guestUpdates.adults = adults;
      if (children !== undefined) guestUpdates.children = children;
      if (infants !== undefined) guestUpdates.infants = infants;
      if (Object.keys(guestUpdates).length === 0)
        return res.status(400).json({ error: "No fields to update" });

      const currentGuests = await knex("booking_guests")
        .where("booking_id", id)
        .first();
      await knex("booking_guests").where("booking_id", id).update(guestUpdates);

      const booking = await knex("bookings").where("id", id).first();
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      if (!booking.is_custom_tour && booking.tour_id) {
        const tour = await knex("tours").where("id", booking.tour_id).first();
        if (tour) {
          const price = parseFloat(tour.price);
          const finalAdults = adults ?? currentGuests.adults;
          const finalChildren = children ?? currentGuests.children;
          await knex("bookings")
            .where("id", id)
            .update({
              total_price: finalAdults * price + finalChildren * (price * 0.5),
            });
        }
      }

      const parts = [];
      if (adults !== undefined) parts.push(`${adults} adults`);
      if (children !== undefined) parts.push(`${children} children`);
      if (infants !== undefined) parts.push(`${infants} infants`);
      await logActivity(
        id,
        "booking",
        `Party size updated to ${parts.join(", ")} for booking ${
          booking.booking_reference ?? `#${id}`
        }`,
        null,
        "agent"
      );

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.post(
  "/:id/payments",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { method, status, amount, paid_at } = req.body;
      if (amount === undefined || amount === null)
        return res.status(400).json({ error: "amount is required" });

      const isRefund = Number(amount) < 0;
      const [payment] = await knex("booking_payments")
        .insert({
          booking_id: id,
          method: method || "cash",
          status: isRefund ? "refunded" : status || "paid",
          amount,
          paid_at: paid_at || knex.fn.now(),
        })
        .returning("*");

      const booking = await knex("bookings").where("id", id).first();
      if (!booking) return res.status(404).json({ error: "Booking not found" });
      const ref = booking.booking_reference ?? `#${id}`;

      await logActivity(
        id,
        "payment",
        isRefund
          ? `Refund of €${Math.abs(amount).toFixed(
              2
            )} recorded for booking ${ref}`
          : `Payment of €${Number(amount).toFixed(
              2
            )} recorded for booking ${ref}`,
        null,
        "agent"
      );

      if (
        !isRefund &&
        booking.status === "pending" &&
        booking.total_price !== null
      ) {
        const { total } = await knex("booking_payments")
          .where("booking_id", id)
          .sum("amount as total")
          .first();
        if (Number(total) >= Number(booking.total_price)) {
          await knex("bookings")
            .where("id", id)
            .update({ status: "confirmed" });
          await logActivity(
            id,
            "booking",
            `Booking ${ref} automatically confirmed after full payment`,
            null,
            "agent"
          );
          const fullBooking = await getFullBooking(id);
          if (fullBooking?.primary_contact_email)
            sendBookingConfirmation(fullBooking);
        }
      }

      res.status(201).json({ data: payment });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.post(
  "/:id/cancel",
  requireRole("admin", "manager"),
  async (req, res) => {
    const { id } = req.params;
    const { reason, notes, refund_amount } = req.body;

    try {
      const booking = await knex("bookings").where("id", id).first();
      if (!booking) return res.status(404).json({ error: "Booking not found" });
      if (booking.status === "cancelled")
        return res.status(400).json({ error: "Booking is already cancelled" });

      await knex.transaction(async (trx) => {
        await trx("bookings")
          .where("id", id)
          .update({
            status: "cancelled",
            cancellation_reason: reason ?? null,
            cancellation_notes: notes ?? null,
          });
        if (refund_amount && Number(refund_amount) > 0) {
          await trx("booking_payments").insert({
            booking_id: id,
            method: "refund",
            amount: -Math.abs(Number(refund_amount)),
            status: "paid",
            paid_at: new Date(),
            notes: "Refund on cancellation",
          });
        }
        await logActivity(
          id,
          "booking",
          `Booking ${booking.booking_reference} cancelled${
            reason ? ` — ${reason.replace("_", " ")}` : ""
          }`,
          null,
          "agent",
          trx
        );
      });

      if (booking?.primary_contact_email) {
        const tourName = booking.tour_id
          ? (
              await knex("tours")
                .where("id", booking.tour_id)
                .select("tour_name")
                .first()
            )?.tour_name
          : null;
        sendCancellationConfirmation(
          { ...booking, tour_name: tourName },
          refund_amount ?? 0
        );
      }

      const updated = await knex("bookings").where("id", id).first();
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to cancel booking" });
    }
  }
);

router.get("/:id/voucher", async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await knex("bookings")
      .leftJoin("tours", "bookings.tour_id", "tours.id")
      .leftJoin(
        "tour_time_slots",
        "bookings.time_slot_id",
        "tour_time_slots.id"
      )
      .select([
        "bookings.*",
        "tours.tour_name",
        "tours.duration as tour_duration",
        "tours.category",
        "tours.overview",
        "tours.overview_title",
        "tours.includes",
        "tours.essentials",
        "tours.landmarks",
        "tours.activity_level",
        "tours.price",
        knex.raw(`(SELECT json_agg(json_build_object('id', ba.id, 'guide_name', e.first_name || ' ' || e.last_name, 'role', ba.role))
          FROM booking_assignments ba JOIN employees e ON ba.guide_id = e.id
          WHERE ba.booking_id = bookings.id AND ba.status = 'active') as staff`),
        knex.raw(`(SELECT json_build_object('adults', COALESCE(adults, 0), 'children', COALESCE(children, 0), 'infants', COALESCE(infants, 0))
          FROM booking_guests WHERE booking_id = bookings.id) as guest_distribution`),
        knex.raw(
          "COALESCE(bookings.start_time, tour_time_slots.start_time) as display_start_time"
        ),
        knex.raw(
          "COALESCE(bookings.end_time, tour_time_slots.end_time) as display_end_time"
        ),
      ])
      .where("bookings.id", id)
      .first();

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    let highlights = [];
    if (booking.tour_id)
      highlights = await knex("highlights")
        .where("tour_id", booking.tour_id)
        .select("highlight");

    const otherTours = await knex("tours")
      .where("id", "!=", booking.tour_id ?? 0)
      .where(function () {
        this.where("best_seller", true).orWhere("featured", true);
      })
      .select([
        "id",
        "tour_name",
        "duration",
        "price",
        "category",
        "overview_title",
        "slug",
      ])
      .limit(3);

    let adTours = otherTours;
    if (adTours.length < 3) {
      const ids = adTours.map((t) => t.id);
      const extra = await knex("tours")
        .whereNot("id", booking.tour_id ?? 0)
        .whereNotIn("id", ids.length ? ids : [0])
        .select([
          "id",
          "tour_name",
          "duration",
          "price",
          "category",
          "overview_title",
          "slug",
        ])
        .limit(3 - adTours.length);
      adTours = [...adTours, ...extra];
    }

    res.json({ ...booking, highlights, ad_tours: adTours });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch voucher data" });
  }
});

export default router;
