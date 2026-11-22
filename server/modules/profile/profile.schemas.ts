import { z } from "zod";
import { text } from "../../lib/schemas.js";

// A blank name means "leave it as it is", the way the account form has always worked.
const name = text(255).optional().transform((v) => v || undefined);

// gift_credit is deliberately not here: guests never set their own credit.
export const updateBody = z
  .object({
    first_name: name,
    last_name: name,
    preferred_name: text(255).optional(),
    phone_number: text(50).optional(),
    emergency_contact: text(255).optional(),
    notification_preference: z.boolean().optional(),
  })
  .refine((body) => Object.values(body).some((v) => v !== undefined), "At least one field must be updated");

export type UpdateBody = z.infer<typeof updateBody>;
