import { z } from "zod";
import { dateString, idParam, text } from "../../lib/schemas.js";

const isTimezone = (value: string) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

// The settings form sends empty strings for cleared fields, so "" stays allowed.
const optionalEmail = text(255).refine((v) => v === "" || z.email().safeParse(v).success, "Invalid email address");

export const settingsBody = z
  .object({
    name: text(255, 1),
    email: optionalEmail,
    phone: text(50),
    address: text(1000),
    city: text(100),
    country: text(100),
    website: text(255),
    timezone: text(100).refine(isTimezone, "Unknown timezone"),
    currency: text(10, 1),
    vat_number: text(50),
    invoice_footer: text(2000),
    logo_url: text(2000),
  })
  .partial()
  .refine((body) => Object.keys(body).length > 0, "No fields to update");

export const blockedDateBody = z.object({
  date: dateString,
  reason: text(255).optional(),
});

export const blockedWeekdayBody = z.object({
  day_of_week: z.coerce.number().int().min(0).max(6),
  reason: text(255).optional(),
});

export const recordIdParam = idParam;

export type SettingsBody = z.infer<typeof settingsBody>;
export type BlockedDateBody = z.infer<typeof blockedDateBody>;
export type BlockedWeekdayBody = z.infer<typeof blockedWeekdayBody>;
