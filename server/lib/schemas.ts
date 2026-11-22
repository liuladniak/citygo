// Shared building blocks for request validation. Every schema also cleans its input:
// strings are trimmed, control characters removed, and unknown keys dropped.
import { z } from "zod";
import { normalizeTourDate } from "./tourDate.js";

// Control characters except tab and newline; they have no place in names or messages.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const clean = (value: string) => value.normalize("NFC").replace(CONTROL_CHARS, "").trim();

/** Plain text, cleaned and length-limited. Never rendered as HTML anywhere. */
export const text = (max: number, min = 0) =>
  z
    .string()
    .transform(clean)
    .pipe(z.string().min(min, min === 1 ? "Required" : `At least ${min} characters`).max(max, `At most ${max} characters`));

export const requiredText = (max: number) => text(max, 1);

export const email = z
  .string()
  .transform((v) => clean(v).toLowerCase())
  .pipe(z.email("Invalid email address").max(254));

export const phone = z
  .string()
  .transform(clean)
  .pipe(z.string().regex(/^[+\d\s().-]{5,30}$/, "Invalid phone number"));

/** A real calendar day as YYYY-MM-DD. */
export const dateString = z
  .string()
  .transform((v, ctx) => {
    const day = normalizeTourDate(v);
    if (!day) ctx.issues.push({ code: "custom", message: "Use a real date as YYYY-MM-DD", input: v });
    return day ?? z.NEVER;
  });

export const id = z.coerce.number().int().positive();
export const idParam = z.object({ id });

export const pageQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
