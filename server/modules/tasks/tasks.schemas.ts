import { z } from "zod";
import { id, requiredText, text } from "../../lib/schemas.js";

export const MAX_BULK = 200;
export const PRIORITIES = ["urgent", "normal", "low"] as const;
// "dismissed" is only reachable through bulk close, where managers must give a reason.
export const EDITABLE_STATUSES = ["open", "in_progress", "done", "cancelled"] as const;

/** Select boxes send "" for "none" and ids as text. */
const nullableId = z.preprocess((v) => (v === "" || v === undefined ? (v === "" ? null : undefined) : v), id.nullable().optional());

// A plain day is kept as that day at midnight; a full timestamp is read as an instant. Stored as UTC wall time.
const dueDate = z.preprocess(
  (v) => (v === "" ? null : v),
  z
    .string()
    .trim()
    .transform((v, ctx) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v} 00:00:00`;
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) {
        ctx.issues.push({ code: "custom", message: "Use a valid date", input: v });
        return z.NEVER;
      }
      return d.toISOString().replace("T", " ").replace("Z", "");
    })
    .nullable()
    .optional(),
);

const flag = z.preprocess((v) => v === "true" || v === "1", z.boolean());

export const listQuery = z.object({
  status: text(30, 1).optional(),
  priority: text(30, 1).optional(),
  type: text(50, 1).optional(),
  assigned_to: id.optional(),
  include_unassigned: flag,
  include_archived: flag,
  limit: z.coerce.number().int().min(1).max(500).optional(),
});

export const idParams = z.object({ id });

export const createBody = z.object({
  title: requiredText(255),
  description: text(5000).nullish().transform((v) => v || null),
  type: text(50).optional().transform((v) => v || "general"),
  booking_id: nullableId,
  assigned_to: nullableId,
  priority: z.enum(PRIORITIES).default("normal"),
  due_date: dueDate,
});

export const updateBody = z.object({
  title: requiredText(255).optional(),
  description: text(5000).nullish(),
  priority: z.enum(PRIORITIES).optional(),
  status: z.enum(EDITABLE_STATUSES).optional(),
  assigned_to: nullableId,
  booking_id: nullableId,
  due_date: dueDate,
});

export const commentBody = z.object({ content: requiredText(5000) });

export const bulkBody = z.object({
  ids: z
    .array(z.number().int().positive(), { error: `ids must be 1-${MAX_BULK} integers` })
    .min(1, `ids must be 1-${MAX_BULK} integers`)
    .max(MAX_BULK, `ids must be 1-${MAX_BULK} integers`)
    .transform((ids) => [...new Set(ids)]),
  action: z.enum(["done", "dismiss", "reopen"], { error: "action must be done, dismiss or reopen" }),
  reason: text(500).optional().transform((v) => v ?? ""),
});

export const previewBody = bulkBody.pick({ ids: true });

export type ListQuery = z.infer<typeof listQuery>;
export type CreateBody = z.infer<typeof createBody>;
export type UpdateBody = z.infer<typeof updateBody>;
export type BulkBody = z.infer<typeof bulkBody>;
