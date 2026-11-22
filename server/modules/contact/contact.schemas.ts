import { z } from "zod";
import { clean } from "../../lib/schemas.js";

// These messages are shown to visitors on the contact form as they are.
const REQUIRED = "Please fill in all required fields.";

const field = (max: number, tooLong: string, min = 1, tooShort = REQUIRED) =>
  z
    .string({ error: REQUIRED })
    .transform(clean)
    .pipe(z.string().min(min, tooShort).max(max, tooLong));

export const contactBody = z.object({
  first_name: field(100, "Name is too long."),
  last_name: field(100, "Name is too long."),
  email: z
    .string({ error: REQUIRED })
    .transform((v) => clean(v).toLowerCase())
    .pipe(z.string().min(1, REQUIRED).pipe(z.email("Please enter a valid email address."))),
  phone: z
    .string()
    .nullish()
    .transform((v) => (v ? clean(v).slice(0, 50) || null : null)),
  message: field(2000, "Message is too long (max 2000 characters).", 10, "Message is too short."),
});

export type ContactBody = z.infer<typeof contactBody>;
