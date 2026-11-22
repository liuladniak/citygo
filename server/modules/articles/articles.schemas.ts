import { z } from "zod";
import { idParam, requiredText, text } from "../../lib/schemas.js";

export const DEFAULT_PAGE_SIZE = 8;
export const MAX_PAGE_SIZE = 50;

const positiveInt = (fallback: number, max = Number.MAX_SAFE_INTEGER) =>
  z.preprocess((value) => {
    const n = parseInt(String(value), 10);
    return Number.isFinite(n) && n >= 1 ? Math.min(n, max) : fallback;
  }, z.number());

export const listQuery = z.object({
  page: positiveInt(1),
  limit: positiveInt(DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
  category: z.string().trim().max(100).optional(),
});

export const slugParam = z.object({ slug: z.string().trim().min(1).max(255) });
export const articleIdParam = idParam;

const slug = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes");

const image = z.object({
  url: z.string().trim().min(1).max(255),
  caption: text(255).nullish().transform((v) => v ?? null),
});

export const createBody = z.object({
  title: requiredText(255),
  content: z.string().trim().min(1),
  author_id: z.coerce.number().int().positive().nullish(),
  category: requiredText(100),
  description: z.string().trim().nullish(),
  slug,
  images: z.array(image).max(30).optional(),
});

export const updateBody = z.object({
  title: requiredText(255).optional(),
  content: z.string().trim().min(1).optional(),
  category: requiredText(100).optional(),
  description: z.string().trim().nullish(),
  images: z.array(image).max(30).optional(),
});

export type ListQuery = z.infer<typeof listQuery>;
export type CreateBody = z.infer<typeof createBody>;
export type UpdateBody = z.infer<typeof updateBody>;
