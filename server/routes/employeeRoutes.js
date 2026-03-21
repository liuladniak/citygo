import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
import "dotenv/config";
const router = express.Router();
import { requireRole } from "../middleware/auth.js";
router.get("/", async (req, res) => {
  try {
    const employees = await knex("employees").select("*");
    res.json({ data: employees });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/available", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date || isNaN(Date.parse(date))) {
      return res.status(400).json({ error: "Valid date is required" });
    }

    const employees = await knex("employees")
      .whereIn("position", ["Lead Guide", "Assistant Guide", "Driver"])
      .select(
        "id",
        "first_name",
        "last_name",
        "position",
        "status",
        "profile_image"
      );

    const workload = await knex("booking_assignments as ba")
      .join("bookings as b", "ba.booking_id", "b.id")
      .where("b.tour_date", date)
      .where("ba.status", "active")
      .groupBy("ba.guide_id")
      .select("ba.guide_id", knex.raw("count(*) as booking_count"));

    const workloadMap = Object.fromEntries(
      workload.map((w) => [w.guide_id, parseInt(w.booking_count)])
    );

    const result = employees.map((e) => ({
      ...e,
      full_name: `${e.first_name} ${e.last_name}`,
      booking_count: workloadMap[e.id] || 0,
      is_available: (workloadMap[e.id] || 0) < 3,
    }));

    res.json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/by-email", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });

  const employee = await knex("employees")
    .where("email", email)
    .orWhere("work_email", email)
    .first();
  if (!employee) return res.status(404).json({ error: "Employee not found" });

  res.json(employee);
});

router.get("/availability", async (req, res) => {
  try {
    const now = new Date();
    const todayDate = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().slice(0, 8);

    const employees = await knex("employees")
      .select(
        "employees.id",
        "employees.first_name",
        "employees.last_name",
        "employees.position",
        "employees.profile_image",
        "employees.status",
        "employees.shift_start",
        "employees.shift_end",
        "employees.availability_override",
        "employees.override_until"
      )
      .where("employees.status", "active")
      .orderBy("employees.first_name");

    const activeAssignments = await knex("booking_assignments")
      .join("bookings", "booking_assignments.booking_id", "bookings.id")
      .select(
        "booking_assignments.guide_id",
        "bookings.tour_date",
        "bookings.start_time",
        "bookings.end_time",
        "bookings.id as booking_id"
      )
      .whereRaw("DATE(bookings.tour_date) = ?", [todayDate])
      .whereIn("bookings.status", ["confirmed", "pending"]);

    const FIELD_POSITIONS = ["Lead Guide", "Assistant Guide", "Driver"];
    const OFFICE_POSITIONS = [
      "Tour Manager",
      "Operations Manager",
      "Sales Representative",
      "Finance",
      "Admin",
    ];

    const result = employees.map((emp) => {
      if (
        emp.availability_override &&
        emp.override_until &&
        new Date(emp.override_until) > now
      ) {
        return {
          ...emp,
          availability: emp.availability_override,
          on_tour_now: false,
          has_tour_today: false,
          current_booking_id: null,
        };
      }

      const empAssignments = activeAssignments.filter(
        (a) => a.guide_id === emp.id
      );
      const hasTourtToday = empAssignments.length > 0;

      const onTourNow = empAssignments.some((a) => {
        if (!a.start_time || !a.end_time) return false;
        const start = a.start_time.slice(0, 8);
        const end = a.end_time.slice(0, 8);
        return currentTime >= start && currentTime <= end;
      });

      const currentAssignment = empAssignments.find((a) => {
        if (!a.start_time || !a.end_time) return false;
        const start = a.start_time.slice(0, 8);
        const end = a.end_time.slice(0, 8);
        return currentTime >= start && currentTime <= end;
      });

      let availability = "offline";

      if (FIELD_POSITIONS.includes(emp.position)) {
        if (onTourNow) availability = "on_tour";
        else if (hasTourtToday) availability = "available";
        else availability = "available";
      } else if (OFFICE_POSITIONS.includes(emp.position)) {
        if (emp.shift_start && emp.shift_end) {
          const inShift =
            currentTime >= emp.shift_start && currentTime <= emp.shift_end;
          availability = inShift ? "available" : "offline";
        } else {
          availability = "available";
        }
      }

      return {
        ...emp,
        availability,
        on_tour_now: onTourNow,
        has_tour_today: hasTourtToday,
        current_booking_id: currentAssignment?.booking_id ?? null,
        tours_today: empAssignments.length,
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await knex("employees").where("id", id).first();
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const upcoming = await knex("booking_assignments")
      .join("bookings", "booking_assignments.booking_id", "bookings.id")
      .leftJoin("tours", "bookings.tour_id", "tours.id")
      .where("booking_assignments.guide_id", id)
      .where("bookings.tour_date", ">=", new Date().toISOString().split("T")[0])
      .whereIn("bookings.status", ["confirmed", "pending"])
      .select(
        "bookings.id as booking_id",
        "bookings.booking_reference",
        "bookings.tour_date",
        "bookings.start_time",
        "bookings.end_time",
        "bookings.status",
        "bookings.primary_contact_name",
        "tours.tour_name as tour_name",
        "booking_assignments.role"
      )
      .orderBy("bookings.tour_date", "asc")
      .limit(10);

    const past = await knex("booking_assignments")
      .join("bookings", "booking_assignments.booking_id", "bookings.id")
      .leftJoin("tours", "bookings.tour_id", "tours.id")
      .where("booking_assignments.guide_id", id)
      .where("bookings.tour_date", "<", new Date().toISOString().split("T")[0])
      .whereIn("bookings.status", ["confirmed", "completed"])
      .select(
        "bookings.id as booking_id",
        "bookings.booking_reference",
        "bookings.tour_date",
        "bookings.start_time",
        "bookings.end_time",
        "bookings.status",
        "bookings.primary_contact_name",
        "tours.tour_name as tour_name",
        "booking_assignments.role"
      )
      .orderBy("bookings.tour_date", "desc")
      .limit(20);

    const totalTours = await knex("booking_assignments")
      .join("bookings", "booking_assignments.booking_id", "bookings.id")
      .where("booking_assignments.guide_id", id)
      .whereIn("bookings.status", ["confirmed", "completed"])
      .count("* as count")
      .first();

    const toursThisMonth = await knex("booking_assignments")
      .join("bookings", "booking_assignments.booking_id", "bookings.id")
      .where("booking_assignments.guide_id", id)
      .whereRaw(
        "DATE_TRUNC('month', bookings.tour_date) = DATE_TRUNC('month', CURRENT_DATE)"
      )
      .whereIn("bookings.status", ["confirmed", "completed"])
      .count("* as count")
      .first();

    res.json({
      ...employee,
      upcoming_assignments: upcoming,
      past_assignments: past,
      stats: {
        total_tours: parseInt(totalTours?.count ?? 0),
        tours_this_month: parseInt(toursThisMonth?.count ?? 0),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch employee" });
  }
});

router.patch("/:id", requireRole("admin", "manager"), async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = [
      "first_name",
      "last_name",
      "position",
      "status",
      "email",
      "phone",
      "work_email",
      "notes",
      "shift_start",
      "shift_end",
      "employment_type",
      "contract_start",
      "languages",
      "licences",
      "skills",
      "education",
      "emergency_contact_name",
      "emergency_contact_phone",
      "emergency_contact_relation",
      "availability_override",
      "override_until",
      "profile_image",
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ error: "No valid fields to update" });

    const [updated] = await knex("employees")
      .where("id", id)
      .update({ ...updates, updated_at: new Date() })
      .returning("*");

    if (!updated) return res.status(404).json({ error: "Employee not found" });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update employee" });
  }
});

router.post("/", requireRole("admin", "manager"), async (req, res) => {
  try {
    const required = ["first_name", "last_name", "position"];
    for (const field of required) {
      if (!req.body[field])
        return res.status(400).json({ error: `${field} is required` });
    }

    const allowed = [
      "first_name",
      "last_name",
      "position",
      "status",
      "email",
      "phone",
      "work_email",
      "notes",
      "shift_start",
      "shift_end",
      "employment_type",
      "contract_start",
      "languages",
      "licences",
      "skills",
      "emergency_contact_name",
      "emergency_contact_phone",
      "emergency_contact_relation",
    ];

    const data = { status: "active" };
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }

    const [employee] = await knex("employees").insert(data).returning("*");
    res.status(201).json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create employee" });
  }
});

router.patch(
  "/:id/deactivate",
  requireRole("admin", "manager"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const [updated] = await knex("employees")
        .where("id", id)
        .update({
          status: "inactive",
          notes: knex.raw(
            `CASE WHEN notes IS NULL THEN ? ELSE notes || E'\n' || ? END`,
            [
              `Deactivated: ${reason} (${new Date().toLocaleDateString()})`,
              `Deactivated: ${reason} (${new Date().toLocaleDateString()})`,
            ]
          ),
          updated_at: new Date(),
        })
        .returning("*");

      if (!updated)
        return res.status(404).json({ error: "Employee not found" });
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to deactivate employee" });
    }
  }
);

export default router;
