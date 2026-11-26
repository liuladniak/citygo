import { z } from "zod";
import { dateString, id, text } from "../../lib/schemas.js";

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;
export const MAX_IDS = 50;

const positiveInt = (fallback: number, max = Number.MAX_SAFE_INTEGER) =>
  z.preprocess((v) => {
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) && n >= 1 ? Math.min(n, max) : fallback;
  }, z.number());

export const listQuery = z.object({
  page: positiveInt(1),
  limit: positiveInt(DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
  search: text(100).optional(),
  category: text(100).optional(),
  status: text(20).optional(),
  activity_level: text(100).optional(),
  landmarks: text(255).optional(),
});

export const idsQuery = z.object({
  ids: z
    .string()
    .transform((v) => v.split(",").map((s) => Number(s.trim())))
    .pipe(z.array(z.number().int().positive()).min(1).max(MAX_IDS)),
});

export const slugParam = z.object({ slug: z.string().trim().min(1).max(255) });
export const slugIdParams = z.object({ slug: z.string().trim().min(1).max(255), id });

const money = z.coerce.number().min(0).max(1_000_000);
const count = z.coerce.number().int().min(0).max(10_000);
// The edit form sends the access notes as a list; the table stores one line of text.
const accessibility = z
  .union([z.array(text(255)), text(2000)])
  .transform((v) => (Array.isArray(v) ? v.filter(Boolean).join(", ") : v));

const time = z.string().trim().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Use a time like 09:00");
const slot = z.object({ start_time: time, end_time: time });
const stop = z.object({
  name: text(255).nullish().transform((v) => v || null),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});
const imageUrl = text(500, 1);
const highlight = text(255).transform((v) => v);

const slug = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes");

const fields = {
  tour_name: text(255, 1),
  price: money,
  duration: text(100, 1),
  activity_level: text(100),
  category: text(100, 1),
  overview_title: text(255),
  overview: text(10_000),
  landmarks: text(255),
  groups: count,
  minimum_of_attendees: count,
  additional_costs: text(1000),
  essentials: text(1000),
  includes: text(1000),
  best_seller: z.boolean(),
  featured: z.boolean(),
  status: text(20, 1),
  accessibility, // last: the edit history lists it after the other fields
};

export const createBody = z.object({
  tour_name: fields.tour_name,
  price: fields.price,
  duration: fields.duration,
  category: fields.category,
  slug: slug.optional(),
  activity_level: fields.activity_level.default(""),
  overview_title: fields.overview_title.default(""),
  overview: fields.overview.default(""),
  landmarks: fields.landmarks.default(""),
  groups: fields.groups.default(0),
  minimum_of_attendees: fields.minimum_of_attendees.default(0),
  additional_costs: fields.additional_costs.default(""),
  essentials: fields.essentials.default(""),
  includes: fields.includes.default(""),
  accessibility: fields.accessibility.default(""),
  best_seller: fields.best_seller.default(false),
  featured: fields.featured.default(false),
  status: fields.status.default("draft"),
  highlights: z.array(highlight).max(50).default([]),
  images: z.array(imageUrl).max(50).default([]),
  time_slots: z.array(slot).max(30).default([]),
  itinerary: z.array(stop).max(50).default([]),
});

export const updateBody = z
  .object(fields)
  .partial()
  .refine((body) => Object.values(body).some((v) => v !== undefined), "No fields to update");

export const imagesBody = z.object({ images: z.array(imageUrl).max(50).default([]) });
export const highlightsBody = z.object({ highlights: z.array(highlight).max(50).default([]) });
export const timeSlotsBody = z.object({ time_slots: z.array(slot).max(30) });
export const itineraryBody = z.object({ itinerary: z.array(stop).max(50).default([]) });

export const blockedDateBody = z.object({ date: dateString, reason: text(255).optional() });
export const blockedWeekdayBody = z.object({
  day_of_week: z.coerce.number().int().min(0).max(6),
  reason: text(255).optional(),
});

export type ListQuery = z.infer<typeof listQuery>;
export type CreateBody = z.infer<typeof createBody>;
export type UpdateBody = z.infer<typeof updateBody>;
export type Slot = z.infer<typeof slot>;
export type Stop = z.infer<typeof stop>;
