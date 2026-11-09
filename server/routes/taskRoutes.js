import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
import "dotenv/config";
import { getCurrentEmployee } from "../lib/currentEmployee.js";
import { findUnresolved } from "../lib/autoTaskConditions.js";

const knex = initKnex(knexConfig[process.env.NODE_ENV || "development"]);
const router = express.Router();

const OPEN_STATUSES = ["open", "in_progress"];
const DISMISS_ROLES = ["admin", "manager"];
const MAX_BULK = 200;
const cleanTitle = (t) => t.replace(/^\[auto_\w+\]\s*/, "");

function parseIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > MAX_BULK)
    return null;
  if (!ids.every(Number.isInteger)) return null;
  return [...new Set(ids)];
}

// Sorts ids into ready / unresolved / skipped. Changes nothing.
async function planClose(db, ids) {
  const rows = await db("tasks")
    .leftJoin("employees as closer", "tasks.completed_by", "closer.id")
    .whereIn("tasks.id", ids)
    .select(
      "tasks.*",
      db.raw("closer.first_name || ' ' || closer.last_name AS closer_name"),
    );
  const byId = new Map(rows.map((t) => [t.id, t]));

  const open = [];
  const skipped = [];
  for (const id of ids) {
    const t = byId.get(id);
    if (!t || t.archived_at) {
      skipped.push({
        id,
        title: t ? cleanTitle(t.title) : `Task #${id}`,
        reason: "no longer active",
      });
    } else if (!OPEN_STATUSES.includes(t.status)) {
      skipped.push({
        id,
        title: cleanTitle(t.title),
        reason: t.closer_name
          ? `already closed by ${t.closer_name}`
          : "already closed",
      });
    } else {
      open.push(t);
    }
  }

  const unresolved = await findUnresolved(db, open);
  return {
    ready: open.filter((t) => !unresolved.has(t.id)).map((t) => t.id),
    unresolved: open
      .filter((t) => unresolved.has(t.id))
      .map((t) => ({
        id: t.id,
        title: cleanTitle(t.title),
        reason: unresolved.get(t.id),
      })),
    skipped,
  };
}

const taskWithDetails = () =>
  knex("tasks")
    .leftJoin("employees as assignee", "tasks.assigned_to", "assignee.id")
    .leftJoin("employees as creator", "tasks.created_by", "creator.id")
    .leftJoin("bookings", "tasks.booking_id", "bookings.id")
    .select([
      "tasks.*",
      knex.raw(
        "assignee.first_name || ' ' || assignee.last_name as assignee_name",
      ),
      "assignee.profile_image as assignee_image",
      knex.raw(
        "creator.first_name || ' ' || creator.last_name as creator_name",
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
            "tasks.assigned_to",
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
      .whereNotIn("tasks.status", ["cancelled", "dismissed"])
      .whereNull("tasks.archived_at")
      .where(function () {
        this.whereNot("tasks.status", "done").orWhere(
          "tasks.completed_at",
          ">=",
          today,
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
      .whereNotIn("tasks.status", ["cancelled", "dismissed"])
      .where(function () {
        this.whereNot("tasks.status", "done").orWhere(
          "tasks.completed_at",
          ">=",
          todayStart,
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
      `,
      )
      .limit(5);

    const tasks = await query;
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard tasks" });
  }
});

router.post("/bulk-close/preview", async (req, res) => {
  const ids = parseIds(req.body?.ids);
  if (!ids)
    return res
      .status(400)
      .json({ error: `ids must be 1-${MAX_BULK} integers` });
  try {
    res.json(await planClose(knex, ids));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check tasks" });
  }
});

router.post("/bulk-close", async (req, res) => {
  const ids = parseIds(req.body?.ids);
  const { action } = req.body ?? {};
  const reason =
    typeof req.body?.reason === "string" ? req.body.reason.trim() : "";

  if (!ids)
    return res
      .status(400)
      .json({ error: `ids must be 1-${MAX_BULK} integers` });
  if (!["done", "dismiss", "reopen"].includes(action)) {
    return res
      .status(400)
      .json({ error: "action must be done, dismiss or reopen" });
  }
  if (action === "dismiss" && !DISMISS_ROLES.includes(req.role)) {
    return res.status(403).json({ error: "Only managers can dismiss tasks" });
  }
  if (action === "dismiss" && (reason.length < 3 || reason.length > 500)) {
    return res
      .status(400)
      .json({ error: "A reason of 3-500 characters is required" });
  }

  try {
    const employee = await getCurrentEmployee(knex, req);
    const now = new Date();

    const result = await knex.transaction(async (trx) => {
      if (action === "reopen") {
        const rows = await trx("tasks")
          .whereIn("id", ids)
          .whereIn("status", ["done", "dismissed"])
          .whereNull("archived_at")
          .update({
            status: "open",
            completed_at: null,
            completed_by: null,
            updated_at: now,
          })
          .returning("id");
        return { updated: rows.map((r) => r.id), unresolved: [], skipped: [] };
      }

      // N6: re-check inside the transaction, never trust the earlier preview
      const plan = await planClose(trx, ids);
      const targetIds =
        action === "done"
          ? plan.ready // D3: unresolved auto tasks are never marked done
          : [...plan.ready, ...plan.unresolved.map((u) => u.id)];

      let updated = [];
      if (targetIds.length > 0) {
        const rows = await trx("tasks")
          .whereIn("id", targetIds)
          .whereIn("status", OPEN_STATUSES)
          .update({
            status: action === "done" ? "done" : "dismissed",
            completed_at: now,
            completed_by: employee?.id ?? null,
            updated_at: now,
          })
          .returning("id");
        updated = rows.map((r) => r.id);
      }

      if (action === "dismiss" && updated.length > 0) {
        await trx("task_comments").insert(
          updated.map((id) => ({
            task_id: id,
            author_id: employee?.id ?? null,
            content: `Dismissed: ${reason}`,
          })),
        );
      }

      return {
        updated,
        unresolved: action === "done" ? plan.unresolved : [],
        skipped: plan.skipped,
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update tasks" });
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
          "employees.first_name || ' ' || employees.last_name as author_name",
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
          "employees.first_name || ' ' || employees.last_name as author_name",
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
