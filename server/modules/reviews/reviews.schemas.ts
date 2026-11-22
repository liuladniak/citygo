import { z } from "zod";
import { id, requiredText, text } from "../../lib/schemas.js";

export const MAX_PHOTOS = 3;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

const positiveInt = (fallback: number, max = Number.MAX_SAFE_INTEGER) =>
  z.preprocess((value) => {
    const n = parseInt(String(value), 10);
    return Number.isFinite(n) && n >= 1 ? Math.min(n, max) : fallback;
  }, z.number());

export const tourParam = z.object({ tourId: id });
export const reviewIdParam = z.object({ id });

export const listQuery = z.object({
  page: positiveInt(1),
  limit: positiveInt(DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
  // Unknown values fall back to newest first, as before.
  sort: z.preprocess((v) => (v === "highest" || v === "lowest" ? v : "recent"), z.enum(["recent", "highest", "lowest"])),
});

// Photos are public storage links the site uploaded; anything that is not http(s) is refused.
const photoUrl = z
  .string()
  .max(500)
  .refine((v) => /^https?:\/\//i.test(v) && URL.canParse(v), "Photo must be an http(s) link");

export const createBody = z.object({
  booking_id: id,
  rating: z.coerce.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
  title: text(120).optional().transform((v) => v || null),
  body: requiredText(5000),
  photos: z.array(photoUrl).max(MAX_PHOTOS, `Maximum ${MAX_PHOTOS} photos allowed`).default([]),
});

export type ListQuery = z.infer<typeof listQuery>;
export type CreateBody = z.infer<typeof createBody>;
