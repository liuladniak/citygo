import { z } from "zod";
import { clean, dateString, id, text } from "../../lib/schemas.js";

export const FIELD_POSITIONS = ["Lead Guide", "Assistant Guide", "Driver"] as const;
export const OFFICE_POSITIONS = ["Tour Manager", "Operations Manager", "Sales Representative", "Finance", "Admin"] as const;

/** Forms send "" for a cleared field; that means "nothing", stored as null. */
const nullable = <T extends z.ZodType>(schema: T) =>
  z.union([z.literal("").transform(() => null), z.null(), schema]).optional() as z.ZodType<z.output<T> | null | undefined>;

const optionalText = (max: number) => nullable(text(max, 1));
const optionalEmail = nullable(z.string().transform((v) => clean(v).toLowerCase()).pipe(z.email("Invalid email address").max(255)));
const optionalDate = nullable(dateString);
const optionalTime = nullable(
  z.string().trim().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Use a time like 09:00"),
);
const list = z.array(text(100, 1)).max(30).optional();
const timestamp = nullable(
  z.string().transform((v, ctx) => {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) ctx.issues.push({ code: "custom", message: "Use a valid date and time", input: v });
    return Number.isNaN(d.getTime()) ? z.NEVER : d.toISOString().replace("T", " ").replace("Z", "");
  }),
);

const fields = {
  first_name: text(255, 1),
  last_name: text(255, 1),
  position: text(100, 1),
  status: text(100, 1),
  email: optionalEmail,
  work_email: optionalEmail,
  phone: optionalText(20),
  notes: optionalText(5000),
  shift_start: optionalTime,
  shift_end: optionalTime,
  employment_type: optionalText(50),
  contract_start: optionalDate,
  languages: list,
  licences: list,
  skills: list,
  education: optionalText(5000),
  emergency_contact_name: optionalText(255),
  emergency_contact_phone: optionalText(50),
  emergency_contact_relation: optionalText(100),
  availability_override: optionalText(50),
  override_until: timestamp,
  profile_image: optionalText(255),
  notif_new_booking: z.boolean().optional(),
  notif_cancellation: z.boolean().optional(),
  notif_daily_schedule: z.boolean().optional(),
  notif_unassigned_tours: z.boolean().optional(),
};

/** What anyone may change about their own employee record. */
export const SELF_FIELDS = [
  "first_name", "last_name", "phone", "profile_image",
  "notif_new_booking", "notif_cancellation", "notif_daily_schedule", "notif_unassigned_tours",
] as const;

// The hiring form has no education, availability override or notification settings.
const CREATE_KEYS = [
  "first_name", "last_name", "position", "status", "email", "phone", "work_email", "notes", "shift_start",
  "shift_end", "employment_type", "contract_start", "languages", "licences", "skills", "emergency_contact_name",
  "emergency_contact_phone", "emergency_contact_relation",
] as const;

const baseObject = z.object(fields);

export const createBody = baseObject
  .pick(Object.fromEntries(CREATE_KEYS.map((k) => [k, true])) as Record<(typeof CREATE_KEYS)[number], true>)
  .partial()
  .required({ first_name: true, last_name: true, position: true });

export const updateBody = baseObject
  .partial()
  .refine((body) => Object.values(body).some((v) => v !== undefined), "No valid fields to update");

export const idParams = z.object({ id });
export const availableQuery = z.object({ date: dateString });
export const byEmailQuery = z.object({ email: z.string().trim().min(1).max(255) });
export const deactivateBody = z.object({ reason: text(500, 1) });

export type UpdateBody = z.infer<typeof updateBody>;
export type CreateBody = z.infer<typeof createBody>;
