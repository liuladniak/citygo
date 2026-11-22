import { z } from "zod";
import { dateString, email, id, phone, text } from "../../lib/schemas.js";
import { isPastDay } from "../../lib/tourDate.js";

export const MAX_GUESTS = 50;
// Stripe allows 50 metadata keys; each booking uses 12 of them.
export const MAX_BOOKINGS = 4;

const ADULTS = "At least 1 adult is required per booking";
const count = (what: string) =>
  z.coerce.number({ error: `Invalid ${what} count` }).int(`Invalid ${what} count`).min(0, `Invalid ${what} count`).default(0);

const guestFields = {
  tour_id: id,
  adults: z.coerce.number({ error: ADULTS }).int(ADULTS).min(1, ADULTS),
  children: count("children"),
  infants: count("infants"),
};
const withinGuestLimit = (b: { adults: number; children: number }) =>
  b.adults + b.children <= MAX_GUESTS;
const guestLimitError = {
  message: `Guest count exceeds maximum allowed (${MAX_GUESTS})`,
  path: ["adults"],
};

const currency = z
  .string()
  .trim()
  .regex(/^[A-Za-z]{3}$/, "Unsupported currency")
  .transform((c) => c.toUpperCase())
  .default("USD");

const bookingList = <T extends z.ZodType>(item: T) =>
  z
    .array(item, { error: "No bookings provided" })
    .min(1, "No bookings provided")
    .max(MAX_BOOKINGS, `You can pay for at most ${MAX_BOOKINGS} bookings at once`);

const quoteItem = z.object(guestFields).refine(withinGuestLimit, guestLimitError);

const intentItem = z
  .object({
    ...guestFields,
    user_id: id,
    time_slot_id: id,
    tour_date: dateString.refine((day) => !isPastDay(day), "Tour date must be in the future."),
    contact_name: text(100).default(""),
    contact_email: z.union([email, z.literal("")]).default(""),
    contact_phone: z.union([phone, z.literal("")]).default(""),
    language: text(20).default("en"),
    special_requirements: text(500).default(""),
  })
  .refine(withinGuestLimit, guestLimitError);

export const quoteBody = z.object({ bookings: bookingList(quoteItem), selectedCurrency: currency });
export const intentBody = z.object({ bookings: bookingList(intentItem), selectedCurrency: currency });

export type QuoteBody = z.infer<typeof quoteBody>;
export type IntentBody = z.infer<typeof intentBody>;

/** "Booking 2" for anything inside bookings[1]; shared fields get no label. */
export const paymentLabel = (path: PropertyKey[]): string =>
  path.length < 2 ? "" : typeof path[1] === "number" ? `Booking ${path[1] + 1}` : path.join(".");
