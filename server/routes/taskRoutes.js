import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import "dotenv/config";

const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
const router = express.Router();

const taskWithDetails = () =>
  knex("tasks")
    .leftJoin("employees as assignee", "tasks.assigned_to", "assignee.id")
    .leftJoin("employees as creator", "tasks.created_by", "creator.id")
    .leftJoin("bookings", "tasks.booking_id", "bookings.id")
    .select([
      "tasks.*",
      knex.raw(
        "assignee.first_name || ' ' || assignee.last_name as assignee_name"
      ),
      "assignee.profile_image as assignee_image",
      knex.raw(
        "creator.first_name || ' ' || creator.last_name as creator_name"
      ),
      "bookings.booking_reference",
    ]);

router.get("/", async (req, res) => {
  try {
    const { status, priority, assigned_to, type, include_archived } = req.query;

    let query = taskWithDetails();

    if (!include_archived) {
      query.whereNull("tasks.archived_at");
    }

    if (status) query.where("tasks.status", status);
    if (priority) query.where("tasks.priority", priority);

    if (assigned_to) {
      if (req.query.include_unassigned === "true") {
        query.where(function () {
          this.where("tasks.assigned_to", assigned_to).orWhereNull(
            "tasks.assigned_to"
          );
        });
      } else {
        query.where("tasks.assigned_to", assigned_to);
      }
    }
    if (type) query.where("tasks.type", type);

    query.orderByRaw(`
      CASE tasks.priority
        WHEN 'urgent' THEN 1
        WHEN 'normal' THEN 2
        WHEN 'low' THEN 3
      END,
      CASE WHEN tasks.assigned_to IS NULL THEN 1 ELSE 0 END,
      tasks.due_date ASC NULLS LAST,
      tasks.created_at DESC
    `);

    if (req.query.limit) {
      query = query.limit(parseInt(req.query.limit));
    }
    const tasks = await query;
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

router.get("/my/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await taskWithDetails()
      .where("tasks.assigned_to", employeeId)
      .whereNull("tasks.archived_at")
      .where(function () {
        this.whereNot("tasks.status", "done").orWhere(
          "tasks.completed_at",
          ">=",
          today
        );
      }).orderByRaw(`
        CASE tasks.priority
          WHEN 'urgent' THEN 1
          WHEN 'normal' THEN 2
          WHEN 'low' THEN 3
        END,
        tasks.due_date ASC NULLS LAST
      `);

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

router.get("/dashboard/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { role } = req.query;

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let query = taskWithDetails()
      .whereNull("tasks.archived_at")
      .whereNot("tasks.status", "cancelled")
      .where(function () {
        this.whereNot("tasks.status", "done").orWhere(
          "tasks.completed_at",
          ">=",
          todayStart
        );
      });

    if (role === "guide" || role === "driver") {
      query.where("tasks.assigned_to", employeeId);
    }

    query
      .where(function () {
        this.whereNull("tasks.due_date").orWhere("tasks.due_date", "<=", today);
      })
      .orderByRaw(
        `
        CASE tasks.status WHEN 'done' THEN 1 ELSE 0 END,
        CASE tasks.priority
          WHEN 'urgent' THEN 1
          WHEN 'normal' THEN 2
          WHEN 'low' THEN 3
        END,
        tasks.due_date ASC NULLS LAST
      `
      )
      .limit(5);

    const tasks = await query;
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard tasks" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const task = await taskWithDetails()
      .where("tasks.id", req.params.id)
      .first();
    if (!task) return res.status(404).json({ error: "Task not found" });

    const comments = await knex("task_comments")
      .leftJoin("employees", "task_comments.author_id", "employees.id")
      .select([
        "task_comments.*",
        knex.raw(
          "employees.first_name || ' ' || employees.last_name as author_name"
        ),
        "employees.profile_image as author_image",
      ])
      .where("task_comments.task_id", req.params.id)
      .orderBy("task_comments.created_at", "asc");

    res.json({ ...task, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      booking_id,
      assigned_to,
      created_by,
      priority,
      due_date,
    } = req.body;

    if (!title) return res.status(400).json({ error: "Title is required" });

    const [task] = await knex("tasks")
      .insert({
        title,
        description: description || null,
        type: type || "general",
        booking_id: booking_id || null,
        assigned_to: assigned_to || null,
        created_by: created_by || null,
        priority: priority || "normal",
        due_date: due_date || null,
        is_auto_generated: false,
      })
      .returning("id");

    const created = await taskWithDetails().where("tasks.id", task.id).first();
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      priority,
      status,
      assigned_to,
      due_date,
      booking_id,
    } = req.body;

    const task = await knex("tasks").where("id", id).first();
    if (!task) return res.status(404).json({ error: "Task not found" });

    const updates = { updated_at: new Date() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (priority !== undefined) updates.priority = priority;
    if (assigned_to !== undefined) updates.assigned_to = assigned_to;
    if (due_date !== undefined) updates.due_date = due_date;
    if (booking_id !== undefined) updates.booking_id = booking_id;

    if (status !== undefined) {
      updates.status = status;
      if (status === "done" && !task.completed_at) {
        updates.completed_at = new Date();
        updates.completed_by = req.body.completed_by ?? null;
      }
      if (status !== "done") {
        updates.completed_at = null;
      }
    }

    await knex("tasks").where("id", id).update(updates);
    const updated = await taskWithDetails().where("tasks.id", id).first();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

router.post("/:id/comments", async (req, res) => {
  try {
    const { content, author_id } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required" });

    const [comment] = await knex("task_comments")
      .insert({
        task_id: req.params.id,
        author_id: author_id || null,
        content,
      })
      .returning("*");

    const withAuthor = await knex("task_comments")
      .leftJoin("employees", "task_comments.author_id", "employees.id")
      .select([
        "task_comments.*",
        knex.raw(
          "employees.first_name || ' ' || employees.last_name as author_name"
        ),
        "employees.profile_image as author_image",
      ])
      .where("task_comments.id", comment.id)
      .first();

    res.status(201).json(withAuthor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await knex("tasks").where("id", req.params.id).update({
      status: "cancelled",
      updated_at: new Date(),
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;
